/**
 * Common formatting utilities used across the application
 */

/**
 * Format large numbers (followers, views, etc.) into human-readable format
 * @example formatFollowers(1234567) => "1.2M"
 * @example formatFollowers(5432) => "5.4K"
 */
export const formatFollowers = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

/**
 * Format an amount as USD. Only `minimumFractionDigits: 0` is set, so whole
 * dollars render without cents while fractional amounts keep up to 2 decimals
 * (it does NOT round to whole dollars).
 * @example formatCurrency(1000) => "$1,000"
 * @example formatCurrency(1234.56) => "$1,234.56"
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Extract city from full location string
 * @example extractCity("New York, NY, USA") => "New York"
 */
export const extractCity = (location: string): string => {
  return location.split(",")[0].trim();
};

/**
 * Format engagement rate as percentage
 * @example formatEngagementRate(5.234) => "5.23%"
 */
export const formatEngagementRate = (rate: number): string => {
  return `${rate.toFixed(2)}%`;
};

/**
 * Format percentage values
 * @example formatPercentage(0.123) => "12.3%"
 */
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

/**
 * Truncate text to specified length with ellipsis
 * @example truncateText("Long text here", 10) => "Long text..."
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
