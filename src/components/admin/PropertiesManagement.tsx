
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import PropertiesHeader from "./properties/PropertiesHeader";
import PropertiesTable from "./properties/PropertiesTable";
import AdminBulkImportModal from "./properties/AdminBulkImportModal";
import { usePropertiesData } from "./properties/usePropertiesData";
import { usePropertiesFilter } from "./properties/usePropertiesFilter";

const PropertiesManagement = () => {
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const { properties, loading, togglePropertyStatus, refetch } = usePropertiesData();
  const { 
    searchTerm, 
    setSearchTerm, 
    filterStatus, 
    setFilterStatus, 
    filteredProperties 
  } = usePropertiesFilter(properties);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <PropertiesHeader 
            propertiesCount={0}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
          />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Properties Management</h2>
      
      <Card>
        <CardHeader>
          <PropertiesHeader 
            propertiesCount={filteredProperties.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            onBulkImport={() => setIsBulkImportOpen(true)}
          />
        </CardHeader>
        
        <CardContent>
          <PropertiesTable 
            properties={filteredProperties}
            onToggleStatus={togglePropertyStatus}
          />
        </CardContent>
      </Card>

      <AdminBulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImportComplete={refetch}
      />
    </div>
  );
};

export default PropertiesManagement;
