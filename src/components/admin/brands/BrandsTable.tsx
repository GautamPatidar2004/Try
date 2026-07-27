import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface Brand {
  id: string;
  brand_name: string;
  company_name: string;
  industry: string;
  budget_range: string;
  verified: boolean;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

interface BrandsTableProps {
  brands: Brand[];
  onViewDetails: (brand: Brand) => void;
  onToggleVerification: (id: string, verified: boolean) => void;
}

export const BrandsTable = ({ brands, onViewDetails, onToggleVerification }: BrandsTableProps) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Brand Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Budget Range</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No brands found
              </TableCell>
            </TableRow>
          ) : (
            brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="font-medium">{brand.brand_name}</TableCell>
                <TableCell>{brand.company_name}</TableCell>
                <TableCell className="capitalize">{brand.industry}</TableCell>
                <TableCell className="capitalize">{brand.budget_range.replace('_', ' ')}</TableCell>
                <TableCell>
                  {brand.profiles ? `${brand.profiles.first_name} ${brand.profiles.last_name}` : 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge variant={brand.verified ? "default" : "secondary"}>
                    {brand.verified ? "Verified" : "Unverified"}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(brand.created_at), "MMM d, yyyy")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewDetails(brand)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleVerification(brand.id, !brand.verified)}
                    >
                      {brand.verified ? (
                        <XCircle className="h-4 w-4 text-orange-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
