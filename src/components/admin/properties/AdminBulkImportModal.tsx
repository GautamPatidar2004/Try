import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PROPERTY_TYPES, AMENITIES_OPTIONS, CONTENT_REQUIREMENTS } from "../../properties/propertyFormSchema";
import { parseCSVLine, parseMultiValueField } from "@/utils/csvParser";

interface AdminBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  host_id?: string;
  errors?: string[];
  line: number;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ line: number; error: string }>;
}

const AdminBulkImportModal = ({ isOpen, onClose, onImportComplete }: AdminBulkImportModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedHostId, setSelectedHostId] = useState<string>("");
  const [hosts, setHosts] = useState<Array<{ id: string; name: string }>>([]);
  const [parsedData, setParsedData] = useState<ParsedProperty[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const { toast } = useToast();

  // Load hosts when modal opens
  useEffect(() => {
    if (isOpen) {
      loadHosts();
    }
  }, [isOpen]);

  const loadHosts = async () => {
    try {
      const { data, error } = await supabase
        .from('hosts')
        .select(`
          id,
          profiles (
            first_name,
            last_name
          )
        `);

      if (error) throw error;

      const hostsData = data?.map(host => ({
        id: host.id,
        name: host.profiles ? 
          `${host.profiles.first_name || ''} ${host.profiles.last_name || ''}`.trim() || 
          'Unnamed Host' : 'Unnamed Host'
      })) || [];

      setHosts(hostsData);
    } catch (error) {
      console.error('Error loading hosts:', error);
      toast({
        title: "Error",
        description: "Failed to load hosts",
        variant: "destructive",
      });
    }
  };

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
      'content_requirements',
      'host_email'
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
      'Instagram Posts;Instagram Stories;TikTok Videos',
      'host@example.com'
    ].join(',');

    const csvContent = [headers.join(','), sampleRow].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin_property_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = async (csvText: string): Promise<ParsedProperty[]> => {
    const lines = csvText.trim().split('\n');
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
    
    // Get all host emails for validation
    const { data: hostProfiles } = await supabase
      .from('profiles')
      .select('id')
      .in('id', hosts.map(h => h.id));

    const results = await Promise.all(lines.slice(1).map(async (line, index) => {
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
          case 'host_email':
            if (value) {
              // For admin imports, we'd need to lookup host by email
              // For now, we'll use the selected host
              property.host_id = selectedHostId;
            }
            break;
        }
      });

      if (!property.host_id && selectedHostId) {
        property.host_id = selectedHostId;
      }

      if (!property.host_id) {
        errors.push('Host ID is required');
      }

      if (errors.length > 0) {
        property.errors = errors;
      }

      return property;
    }));

    return results.filter(p => p.title || p.location);
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
  };

  const handlePreview = async () => {
    if (!file || !selectedHostId) {
      toast({
        title: "Missing information",
        description: "Please select a file and host",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      const parsed = await parseCSV(text);
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
            host_id: property.host_id,
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
    setSelectedHostId("");
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
          <DialogTitle>Admin Bulk Import Properties</DialogTitle>
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
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Host</label>
                <Select value={selectedHostId} onValueChange={setSelectedHostId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a host for all properties" />
                  </SelectTrigger>
                  <SelectContent>
                    {hosts.map((host) => (
                      <SelectItem key={host.id} value={host.id}>
                        {host.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                {file && (
                  <p className="mt-2 text-sm text-green-600">Selected: {file.name}</p>
                )}
              </div>
            </div>

            <Button 
              onClick={handlePreview}
              disabled={!file || !selectedHostId}
              className="w-full"
            >
              Preview Import
            </Button>
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

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminBulkImportModal;