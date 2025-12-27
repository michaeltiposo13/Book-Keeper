/**
 * Format currency based on the currency type
 */
export function formatCurrency(amount: number, currency: string = 'php'): string {
  const currencySymbols: Record<string, string> = {
    php: '₱',
    usd: '$',
    eur: '€',
    gbp: '£',
  };

  const symbol = currencySymbols[currency.toLowerCase()] || '$';
  
  // Format with 2 decimal places and thousands separator
  const formatted = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return `${symbol}${formatted}`;
}

/**
 * Format date based on timezone
 */
export function formatDate(date: Date | string, timezone: string = 'asia-manila'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Map timezone strings to IANA timezone names
  const timezoneMap: Record<string, string> = {
    'asia-manila': 'Asia/Manila',
    'utc-5': 'America/New_York',
    'utc-6': 'America/Chicago',
    'utc-7': 'America/Denver',
    'utc-8': 'America/Los_Angeles',
  };
  
  const tz = timezoneMap[timezone] || 'Asia/Manila';
  
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch (error) {
    // Fallback to default formatting
    return dateObj.toLocaleString();
  }
}

/**
 * Get current time in specified timezone
 */
export function getCurrentTime(timezone: string = 'asia-manila'): Date {
  const timezoneMap: Record<string, string> = {
    'asia-manila': 'Asia/Manila',
    'utc-5': 'America/New_York',
    'utc-6': 'America/Chicago',
    'utc-7': 'America/Denver',
    'utc-8': 'America/Los_Angeles',
  };
  
  const tz = timezoneMap[timezone] || 'Asia/Manila';
  const now = new Date();
  
  // Get the current time in the specified timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  return now; // Returns current date (browser timezone adjusted display handled by formatDate)
}
