
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ApplicationsHeader from "./applications/ApplicationsHeader";
import ApplicationsTable from "./applications/ApplicationsTable";
import { useApplications } from "./applications/useApplications";
import { useApplicationsFilter } from "./applications/useApplicationsFilter";

const ApplicationsManagement = () => {
  const { applications, loading, updateApplicationStatus } = useApplications();
  const { 
    searchTerm, 
    setSearchTerm, 
    filterStatus, 
    setFilterStatus, 
    filteredApplications 
  } = useApplicationsFilter(applications);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <ApplicationsHeader 
            applicationsCount={0}
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
      <h2 className="text-3xl font-bold text-gray-900">Applications Management</h2>
      
      <Card>
        <CardHeader>
          <ApplicationsHeader 
            applicationsCount={filteredApplications.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
          />
        </CardHeader>
        
        <CardContent>
          <ApplicationsTable 
            applications={filteredApplications}
            onUpdateStatus={updateApplicationStatus}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationsManagement;
