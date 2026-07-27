import React, { useState } from 'react';
import { OnboardingStep } from '../OnboardingStep';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DocumentUploader, UploadedDocument } from '@/components/restaurant-owner/DocumentUploader';
import { useRestaurantVerification } from '@/hooks/useRestaurantVerification';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RestaurantVerificationStepProps {
  onNext: (data: VerificationData) => void;
  onPrevious: () => void;
  initialData?: Partial<VerificationData>;
}

export interface VerificationData {
  businessLicenseNumber?: string;
  taxId?: string;
  yearEstablished?: number;
  documents: UploadedDocument[];
}

export const RestaurantVerificationStep: React.FC<RestaurantVerificationStepProps> = ({
  onNext,
  onPrevious,
  initialData,
}) => {
  const [formData, setFormData] = useState<VerificationData>({
    businessLicenseNumber: initialData?.businessLicenseNumber || '',
    taxId: initialData?.taxId || '',
    yearEstablished: initialData?.yearEstablished || undefined,
    documents: initialData?.documents || [],
  });

  const { uploadDocument } = useRestaurantVerification();
  const { toast } = useToast();

  const handleUpload = async (file: File, docType: string): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to upload documents',
        variant: 'destructive',
      });
      return null;
    }

    const url = await uploadDocument(file, docType, user.id);
    
    if (url) {
      const newDoc: UploadedDocument = {
        id: `${docType}-${Date.now()}`,
        type: docType,
        name: file.name,
        url,
        file,
      };

      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, newDoc],
      }));
    }

    return url;
  };

  const handleRemove = (docId: string) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((doc) => doc.id !== docId),
    }));
  };

  const handleSubmit = () => {
    // Can proceed even without documents (will be marked as pending verification)
    onNext(formData);
  };

  const handleSkip = () => {
    // Skip verification for now
    onNext({ ...formData, documents: [] });
  };

  return (
    <OnboardingStep
      title="Business Verification"
      description="Upload your business documents for verification. You can also skip this step and complete it later."
      currentStep={2}
      totalSteps={4}
      onNext={handleSubmit}
      onPrevious={onPrevious}
    >
      <div className="space-y-6">
        {/* Document Uploads */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Business Documents</h3>
          
          <DocumentUploader
            docType="business_license"
            label="Business License/Permit"
            description="Upload your restaurant's business license or operating permit"
            onUpload={handleUpload}
            onRemove={handleRemove}
            uploadedDocs={formData.documents}
          />

          <DocumentUploader
            docType="ownership_proof"
            label="Restaurant Ownership Proof"
            description="Upload proof of restaurant ownership (deed, lease agreement, etc.)"
            onUpload={handleUpload}
            onRemove={handleRemove}
            uploadedDocs={formData.documents}
          />

          <DocumentUploader
            docType="food_safety"
            label="Food Safety Certification"
            description="Upload your food safety or health department certification"
            optional
            onUpload={handleUpload}
            onRemove={handleRemove}
            uploadedDocs={formData.documents}
          />

          <DocumentUploader
            docType="liability_insurance"
            label="Liability Insurance"
            description="Upload your business liability insurance certificate"
            optional
            onUpload={handleUpload}
            onRemove={handleRemove}
            uploadedDocs={formData.documents}
          />
        </div>

        {/* Business Details */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-sm">Business Information</h3>

          <div className="space-y-2">
            <Label htmlFor="businessLicense">Business License Number</Label>
            <Input
              id="businessLicense"
              value={formData.businessLicenseNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, businessLicenseNumber: e.target.value }))
              }
              placeholder="Enter your business license number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID / EIN (optional)</Label>
            <Input
              id="taxId"
              value={formData.taxId}
              onChange={(e) => setFormData((prev) => ({ ...prev, taxId: e.target.value }))}
              placeholder="Enter your Tax ID or EIN"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearEstablished">Year Established</Label>
            <Input
              id="yearEstablished"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={formData.yearEstablished || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  yearEstablished: parseInt(e.target.value) || undefined,
                }))
              }
              placeholder="YYYY"
            />
          </div>
        </div>

        {/* Skip Option */}
        <div className="pt-4 border-t">
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <p className="text-sm text-muted-foreground">
              You can skip document verification for now and complete it later from your dashboard.
              Your restaurant will be marked as "Pending Verification" until documents are reviewed.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              className="w-full sm:w-auto"
            >
              Skip for Now
            </Button>
          </div>
        </div>
      </div>
    </OnboardingStep>
  );
};
