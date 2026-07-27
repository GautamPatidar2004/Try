
import { useState, useMemo } from "react";

interface Property {
  id: string;
  title: string;
  location: string;
  property_type: string;
  max_guests: number;
  collaboration_type: string;
  is_active: boolean;
  created_at: string;
  host_id: string;
  hosts: {
    profiles: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
}

export const usePropertiesFilter = (properties: Property[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = 
        property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.property_type?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterStatus === "all" || 
        (filterStatus === "active" && property.is_active) ||
        (filterStatus === "inactive" && !property.is_active);
      
      return matchesSearch && matchesFilter;
    });
  }, [properties, searchTerm, filterStatus]);

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredProperties
  };
};
