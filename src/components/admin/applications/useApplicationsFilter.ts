import { useState, useMemo } from "react";
import { Application } from "./useApplications";

export const useApplicationsFilter = (applications: Application[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = 
        app.influencers?.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.influencers?.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.properties?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.properties?.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterStatus === "all" || 
        app.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  }, [applications, searchTerm, filterStatus]);

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredApplications
  };
};
