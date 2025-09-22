// Test utility to verify API connection
import { anticrimeAPI } from '../services/anticrimeAPI';

export const testApiConnection = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    // Test the dashboard stats endpoint (doesn't require authentication)
    const stats = await anticrimeAPI.dashboard.getStats();
    
    return {
      success: true,
      message: 'API connection successful',
      details: {
        totalUsers: stats.total_usuarios,
        totalDevices: stats.total_dispositivos,
        totalEmergencies: stats.total_emergencias,
        activeEmergencies: stats.emergencias_ativas
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: `API connection failed: ${error.message}`,
      details: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      }
    };
  }
};

// Test function that can be called from browser console
(window as any).testAntiCrimeAPI = testApiConnection;
