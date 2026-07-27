import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, AlertCircle, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PROPERTY_TYPES, AMENITIES_OPTIONS, CONTENT_REQUIREMENTS } from "./propertyFormSchema";
import { parseCSVLine, parseMultiValueField } from "@/utils/csvParser";
interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostId: string;
  onImportComplete: () => void;
}

interface ParsedProperty {
  title: string;
  description?: string;
  location: string;
  property_type: string;
  max_guests: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  collaboration_type: string;
  discount_percentage?: number;
  content_requirements?: string[];
  errors?: string[];
  line: number;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ line: number; error: string }>;
}

const BulkImportModal = ({ isOpen, onClose, hostId, onImportComplete }: BulkImportModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedProperty[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const { toast } = useToast();

  const downloadTemplate = () => {
    const headers = [
      'title',
      'description',
      'location', 
      'property_type',
      'max_guests',
      'bedrooms',
      'bathrooms',
      'amenities',
      'collaboration_type',
      'discount_percentage',
      'content_requirements'
    ];
    
    // Sample data with proper quoting for fields that may contain commas
    // Multi-value fields (amenities, content_requirements) use semicolons
    const sampleRow = [
      'Beautiful Beach House',
      '"Stunning oceanfront property with amazing views"',
      '"Malibu, CA"',
      'house',
      '6',
      '3',
      '2',
      'WiFi;Pool;Beach Access;Parking',
      'free_stay',
      '',
      'Instagram Posts;Instagram Stories;TikTok Videos'
    ].join(',');

    const csvContent = [headers.join(','), sampleRow].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'property_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (csvText: string): ParsedProperty[] => {
    const lines = csvText.trim().split('\n');
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
    
    return lines.slice(1).map((line, index) => {
      const values = parseCSVLine(line);
      const property: ParsedProperty = { line: index + 2 } as ParsedProperty;
      const errors: string[] = [];

      headers.forEach((header, i) => {
        const value = values[i] || '';
        
        switch (header) {
          case 'title':
            if (!value) errors.push('Title is required');
            property.title = value;
            break;
          case 'description':
            property.description = value || undefined;
            break;
          case 'location':
            if (!value) errors.push('Location is required');
            property.location = value;
            break;
          case 'property_type':
            if (!value) errors.push('Property type is required');
            if (value && !PROPERTY_TYPES.includes(value)) {
              errors.push(`Invalid property type. Must be one of: ${PROPERTY_TYPES.join(', ')}`);
            }
            property.property_type = value;
            break;
          case 'max_guests':
            const maxGuests = parseInt(value);
            if (!value || isNaN(maxGuests) || maxGuests < 1) {
              errors.push('Max guests must be a number >= 1');
            }
            property.max_guests = maxGuests || 1;
            break;
          case 'bedrooms':
            const bedrooms = parseInt(value);
            if (value && (isNaN(bedrooms) || bedrooms < 0)) {
              errors.push('Bedrooms must be a number >= 0');
            }
            property.bedrooms = bedrooms || undefined;
            break;
          case 'bathrooms':
            const bathrooms = parseInt(value);
            if (value && (isNaN(bathrooms) || bathrooms < 0)) {
              errors.push('Bathrooms must be a number >= 0');
            }
            property.bathrooms = bathrooms || undefined;
            break;
          case 'amenities':
            if (value) {
              // Parse semicolon-delimited list
              const amenities = parseMultiValueField(value);
              const invalidAmenities = amenities.filter(a => !AMENITIES_OPTIONS.includes(a));
              if (invalidAmenities.length > 0) {
                errors.push(`Invalid amenities: ${invalidAmenities.join(', ')}`);
              }
              property.amenities = amenities;
            }
            break;
          case 'collaboration_type':
            property.collaboration_type = 'free_stay';
            break;
          case 'discount_percentage':
            if (value) {
              const discount = parseInt(value);
              if (isNaN(discount) || discount < 0 || discount > 100) {
                errors.push('Discount percentage must be between 0-100');
              }
              property.discount_percentage = discount;
            }
            break;
          case 'content_requirements':
            if (value) {
              // Parse semicolon-delimited list
              const requirements = parseMultiValueField(value);
              const invalidRequirements = requirements.filter(r => !CONTENT_REQUIREMENTS.includes(r));
              if (invalidRequirements.length > 0) {
                errors.push(`Invalid content requirements: ${invalidRequirements.join(', ')}`);
              }
              property.content_requirements = requirements;
            }
            break;
        }
      });

      if (errors.length > 0) {
        property.errors = errors;
      }

      return property;
    }).filter(p => p.title || p.location); // Filter out completely empty rows
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    
    try {
      const text = await selectedFile.text();
      const parsed = parseCSV(text);
      setParsedData(parsed);
      setStep('preview');
    } catch (error) {
      toast({
        title: "Error parsing CSV",
        description: "Please check your CSV format and try again",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    setStep('importing');
    const validProperties = parsedData.filter(p => !p.errors || p.errors.length === 0);
    const results: ImportResult = { success: 0, failed: 0, errors: [] };

    for (const property of validProperties) {
      try {
        const { error } = await supabase
          .from('properties')
          .insert({
            host_id: hostId,
            title: property.title,
            description: property.description,
            location: property.location,
            property_type: property.property_type,
            max_guests: property.max_guests,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            amenities: property.amenities || [],
            collaboration_type: property.collaboration_type,
            discount_percentage: property.discount_percentage,
            content_requirements: property.content_requirements || [],
          });

        if (error) throw error;
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          line: property.line,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    setImportResult(results);
    setStep('complete');
    
    if (results.success > 0) {
      onImportComplete();
      toast({
        title: "Import completed",
        description: `Successfully imported ${results.success} properties`,
      });
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setImportResult(null);
    setStep('upload');
    onClose();
  };

  const validProperties = parsedData.filter(p => !p.errors || p.errors.length === 0);
  const invalidProperties = parsedData.filter(p => p.errors && p.errors.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Bulk Import Properties</DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <div className="text-center">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="mb-4"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV Template
              </Button>
              <p className="text-sm text-muted-foreground mb-4">
                Download the template to see the required format
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <span className="text-lg font-medium">Upload CSV file</span>
                <p className="text-sm text-gray-500 mt-2">Click to select or drag and drop</p>
              </label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{parsedData.length}</div>
                <div className="text-sm text-blue-600">Total Rows</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{validProperties.length}</div>
                <div className="text-sm text-green-600">Valid Properties</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{invalidProperties.length}</div>
                <div className="text-sm text-red-600">Invalid Properties</div>
              </div>
            </div>

            {invalidProperties.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Found {invalidProperties.length} rows with errors. Only valid properties will be imported.
                </AlertDescription>
              </Alert>
            )}

            <div className="max-h-64 overflow-y-auto">
              {invalidProperties.map((property, index) => (
                <div key={index} className="p-3 border border-red-200 rounded-lg mb-2 bg-red-50">
                  <div className="font-medium text-red-800">Line {property.line}: {property.title || 'Unnamed'}</div>
                  <ul className="text-sm text-red-600 mt-1">
                    {property.errors?.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button 
                onClick={handleImport}
                disabled={validProperties.length === 0}
                className="bg-brand-green hover:bg-brand-green/90"
              >
                Import {validProperties.length} Properties
              </Button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
            <p className="text-lg font-medium">Importing properties...</p>
            <p className="text-sm text-gray-500">This may take a moment</p>
          </div>
        )}

        {step === 'complete' && importResult && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold">Import Complete!</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{importResult.success}</div>
                <div className="text-sm text-green-600">Successfully Imported</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="max-h-32 overflow-y-auto">
                <h4 className="font-medium mb-2">Import Errors:</h4>
                {importResult.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-600 mb-1">
                    Line {error.line}: {error.error}
                  </div>
                ))}
              </div>
            )}

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportModal;