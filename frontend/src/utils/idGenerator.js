/**
 * Generates a unique Design ID based on the design name and current timestamp.
 * Format: XXX-YYYYMMDD-HHMMSS where XXX are initials from design name
 * Example: "Component Assembly Drawing" -> "CAD-20231225-123045"
 * 
 * @param {string} designName - The name of the design
 * @returns {string} The generated Design ID
 */
export const generateDesignId = (designName) => {
  if (!designName) return '';
  
  // Get initials from design name (up to 3 characters)
  const initials = designName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 3) || 'DES';
    
  // Get current timestamp formatted as YYYYMMDD-HHMMSS
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/[-:T]/g, '')
    .split('.')[0]; // Results in YYYYMMDDHHMMSS
    
  // Format: INITIALS-TIMESTAMP (taking last 6 digits of timestamp for brevity if preferred, 
  // but requirement said "uppercase first letters of words + timestamp")
  // Let's use a slightly shorter timestamp format for readability: YYMMDD-HHMM
  
  const year = now.getFullYear().toString().substr(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  
  return `${initials}-${year}${month}${day}-${hours}${minutes}${seconds}`;
};
