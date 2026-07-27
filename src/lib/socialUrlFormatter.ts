export const formatSocialUrl = (
  platform: 'instagram' | 'youtube' | 'twitter' | 'tiktok',
  value: string | undefined | null
): string | undefined => {
  if (!value) return undefined;
  
  // If already a full URL, return as-is
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  
  // Remove @ symbol if present
  const cleanValue = value.replace('@', '');
  
  // Build proper URL based on platform
  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${cleanValue}`;
    case 'youtube':
      return `https://youtube.com/@${cleanValue}`;
    case 'twitter':
      return `https://twitter.com/${cleanValue}`;
    case 'tiktok':
      return `https://tiktok.com/@${cleanValue}`;
    default:
      return value;
  }
};
