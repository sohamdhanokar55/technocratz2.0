interface RegistrationData {
  eventName: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  yearBranch: string;
  transactionId: string;
}

export async function saveToGoogleSheets(data: RegistrationData): Promise<boolean> {
  const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz3PxQue4e01pv_ACMZj21VLedTht-gxdW_HwEMzBUMw_x4iJdjQ9B1pPUN-TD8T7uo/exec';
  
  try {
    console.log('[Google Sheets] Sending data:', data);
    
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors', // Important for CORS
      body: JSON.stringify(data),
    });

    console.log('[Google Sheets] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Google Sheets] Error response:', errorText);
      return false;
    }

    const result = await response.json();
    console.log('[Google Sheets] Save result:', result);
    return result.success === true;
  } catch (error) {
    console.error('[Google Sheets] Error:', error);
    return false;
  }
}