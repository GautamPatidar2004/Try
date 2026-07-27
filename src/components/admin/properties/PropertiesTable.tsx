
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
 import { Eye, Pencil, MapPin, Users, ArrowRightLeft } from "lucide-react";

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

interface PropertiesTableProps {
  properties: Property[];
  onToggleStatus: (propertyId: string, currentStatus: boolean) => void;
  onViewProperty?: (property: Property) => void;
   onEditProperty?: (property: Property) => void;
  onTransferProperty?: (property: Property) => void;
}

 const PropertiesTable = ({ properties, onToggleStatus, onViewProperty, onEditProperty, onTransferProperty }: PropertiesTableProps) => {
  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const getCollaborationTypeColor = (type: string) => {
    switch (type) {
      case 'free_stay':
        return 'bg-blue-100 text-blue-800';
      case 'paid_collaboration':
        return 'bg-green-100 text-green-800';
      case 'discount':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (properties.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No properties found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Host</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Collaboration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{property.title}</p>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-3 h-3 mr-1" />
                    {property.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-3 h-3 mr-1" />
                    Max {property.max_guests} guests
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="font-medium">
                  {property.hosts?.profiles?.first_name} {property.hosts?.profiles?.last_name}
                </p>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {property.property_type?.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getCollaborationTypeColor(property.collaboration_type)}>
                  {property.collaboration_type?.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(property.is_active)}>
                  {property.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {onViewProperty && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewProperty(property)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                   {onEditProperty && (
                     <Button 
                       variant="outline" 
                       size="sm"
                       onClick={() => onEditProperty(property)}
                       title="Edit property"
                     >
                       <Pencil className="w-4 h-4" />
                     </Button>
                   )}
                  {onTransferProperty && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onTransferProperty(property)}
                      title="Transfer ownership"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    variant={property.is_active ? "destructive" : "default"}
                    size="sm"
                    onClick={() => onToggleStatus(property.id, property.is_active)}
                  >
                    {property.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PropertiesTable;
