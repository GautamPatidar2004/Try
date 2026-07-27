import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Home, Check, X, Users } from "lucide-react";
import PropertyStatsCard from "./PropertyStatsCard";
import PropertyTypeChart from "./PropertyTypeChart";
import CollaborationTypeChart from "./CollaborationTypeChart";
import TopPropertiesCard from "./TopPropertiesCard";
import PropertiesHeader from "./PropertiesHeader";
import PropertiesTable from "./PropertiesTable";
import PropertyDetailModal from "./PropertyDetailModal";
import AdminBulkImportModal from "./AdminBulkImportModal";
import TransferPropertyModal from "./TransferPropertyModal";
 import EditPropertyModal from "@/components/properties/EditPropertyModal";
import { usePropertiesManagement } from "./usePropertiesManagement";
import { usePropertiesFilter } from "./usePropertiesFilter";

const PropertiesManagementDashboard = () => {
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [propertyToTransfer, setPropertyToTransfer] = useState<any>(null);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [propertyToEdit, setPropertyToEdit] = useState<any>(null);
  
  const { properties, stats, loading, togglePropertyStatus, refetch } = usePropertiesManagement();
  const { 
    searchTerm, 
    setSearchTerm, 
    filterStatus, 
    setFilterStatus, 
    filteredProperties 
  } = usePropertiesFilter(properties);

  const handleViewProperty = (property: any) => {
    setSelectedProperty(property);
    setIsDetailModalOpen(true);
  };

  const handleTransferProperty = (property: any) => {
    setPropertyToTransfer(property);
    setIsTransferModalOpen(true);
  };

   const handleEditProperty = (property: any) => {
     setPropertyToEdit(property);
     setIsEditModalOpen(true);
     // Close detail modal if it's open
     setIsDetailModalOpen(false);
   };

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
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Properties Management</h2>
      
      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <PropertyStatsCard
            title="Total Properties"
            value={stats.totalProperties}
            description={`${stats.activeProperties} active, ${stats.inactiveProperties} inactive`}
            icon={Home}
          />
          <PropertyStatsCard
            title="Active Properties"
            value={stats.activeProperties}
            description="Currently accepting applications"
            icon={Check}
          />
          <PropertyStatsCard
            title="Total Applications"
            value={stats.totalApplications}
            description={`Avg ${stats.averageApplicationsPerProperty} per property`}
            icon={Users}
          />
          <PropertyStatsCard
            title="Inactive Properties"
            value={stats.inactiveProperties}
            description="Not visible to influencers"
            icon={X}
          />
        </div>
      )}

      {/* Charts Section */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2">
          <PropertyTypeChart data={stats.byType} />
          <CollaborationTypeChart data={stats.byCollaboration} />
        </div>
      )}

      {/* Top Properties */}
      {stats && (
        <TopPropertiesCard properties={stats.topProperties} />
      )}

      {/* Properties Table */}
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
            onViewProperty={handleViewProperty}
             onEditProperty={handleEditProperty}
            onTransferProperty={handleTransferProperty}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <AdminBulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImportComplete={refetch}
      />

      <PropertyDetailModal
        property={selectedProperty}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProperty(null);
        }}
         onEdit={handleEditProperty}
      />

      <TransferPropertyModal
        property={propertyToTransfer}
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setPropertyToTransfer(null);
        }}
        onTransferComplete={refetch}
      />

       {propertyToEdit && (
         <EditPropertyModal
           isOpen={isEditModalOpen}
           onClose={() => {
             setIsEditModalOpen(false);
             setPropertyToEdit(null);
           }}
           property={propertyToEdit}
           onPropertyUpdated={refetch}
         />
       )}
    </div>
  );
};

export default PropertiesManagementDashboard;
