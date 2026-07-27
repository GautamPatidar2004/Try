/**
 * Parse a single CSV line correctly handling quoted fields.
 * Quoted fields can contain commas without breaking the parsing.
 * Double quotes inside quoted fields are escaped as ""
 */
export const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote inside quoted field
        current += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Don't forget the last field
  result.push(current.trim());
  
  return result;
};

/**
 * Parse multi-value fields that use semicolons as delimiters.
 * Used for amenities and content_requirements.
 */
export const parseMultiValueField = (value: string): string[] => {
  if (!value) return [];
  return value.split(';').map(v => v.trim()).filter(Boolean);
};
