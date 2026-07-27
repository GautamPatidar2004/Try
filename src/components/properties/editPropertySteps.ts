import BasicInfoStep from "./steps/BasicInfoStep";
import PropertyDetailsStep from "./steps/PropertyDetailsStep";
import CollaborationStep from "./steps/CollaborationStep";
import ImageUploadStep from "./steps/ImageUploadStep";

export const EDIT_PROPERTY_STEPS = [
  { id: 1, title: "Basic Information", component: BasicInfoStep },
  { id: 2, title: "Property Details", component: PropertyDetailsStep },
  { id: 3, title: "Collaboration Settings", component: CollaborationStep },
  { id: 4, title: "Upload Images", component: ImageUploadStep },
];

export const getFieldsToValidate = (step: number): string[] => {
  switch (step) {
    case 1: // Basic Information
      return ["title", "location", "property_type"];
    case 2: // Property Details
      return ["max_guests", "bedrooms", "bathrooms"];
    case 3: // Collaboration Settings
      return ["collaboration_type"];
    case 4: // Upload Images
      // Image validation is handled separately in the component
      return [];
    default:
      return [];
  }
};