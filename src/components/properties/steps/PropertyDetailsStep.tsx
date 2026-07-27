
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PropertyFormData, AMENITIES_OPTIONS } from "../propertyFormSchema";

const PropertyDetailsStep = () => {
  const { control, watch, setValue } = useFormContext<PropertyFormData>();
  const amenities = watch("amenities") || [];

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setValue("amenities", [...amenities, amenity]);
    } else {
      setValue("amenities", amenities.filter((a) => a !== amenity));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Property Details</h3>
        <p className="text-gray-600 text-sm mb-6">
          Tell us more about your property's capacity and amenities.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={control}
          name="max_guests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Guests *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="bedrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bedrooms</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="bathrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bathrooms</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div>
        <FormLabel className="text-base font-medium">Amenities</FormLabel>
        <p className="text-sm text-gray-600 mb-4">Select all amenities available at your property</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AMENITIES_OPTIONS.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={amenity}
                checked={amenities.includes(amenity)}
                onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
              />
              <label
                htmlFor={amenity}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {amenity}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsStep;
