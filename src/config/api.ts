// API Configuration for AntiCrime Frontend
export const API_CONFIG = {
  // Production API URL
  PRODUCTION_URL: 'https://ant-crime-production.up.railway.app',
  
  // Development API URL (for local development)
  DEVELOPMENT_URL: 'https://ant-crime-production.up.railway.app/',
  
  // Current API URL (can be overridden by environment variables)
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://ant-crime-production.up.railway.app',
  
  // API Documentation URL
  DOCS_URL: 'https://ant-crime-production.up.railway.app/docs',
  
  // Timeout configuration
  TIMEOUT: 30000, // 30 seconds
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Helper function to get the current API base URL
export const getApiBaseUrl = (): string => {
  return API_CONFIG.BASE_URL;
};

// Helper function to get the API docs URL
export const getApiDocsUrl = (): string => {
  return API_CONFIG.DOCS_URL;
};

