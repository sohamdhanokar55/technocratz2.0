/**
 * Image conversion utilities for Base64 encoding
 * Used primarily for embedding images in PDF receipts
 */

/**
 * Converts an image file from public folder to Base64 string
 * @param imagePath - Path to image (e.g., "/technocratz2.0/agnel-logo-Ce5saIek.png")
 * @returns Base64 string or null if conversion fails
 */
export async function imageToBase64(imagePath: string): Promise<string | null> {
  console.log("[ImageConverter] Converting image to Base64:", imagePath);
  
  try {
    // Fetch the image
    const response = await fetch(imagePath);
    
    if (!response.ok) {
      console.error("[ImageConverter] Failed to fetch image, status:", response.status);
      return null;
    }

    // Get blob and convert to Base64
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64String = reader.result as string;
        console.log("[ImageConverter] ✅ Image converted to Base64 successfully");
        resolve(base64String);
      };
      
      reader.onerror = () => {
        console.error("[ImageConverter] FileReader error");
        reject(null);
      };
      
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("[ImageConverter] Error converting image:", error);
    return null;
  }
}

/**
 * Load both logos for PDF receipt
 * @returns Object with agnelLogo and technocratzLogo Base64 strings
 */
export async function loadLogosForReceipt(): Promise<{
  agnelLogo: string | null;
  technocratzLogo: string | null;
}> {
  console.log("[ImageConverter] Loading logos for receipt");
  
  try {
    const [agnelLogo, technocratzLogo] = await Promise.all([
      imageToBase64("/technocratz2.0/agnel-logo-Ce5saIek.png"),
      imageToBase64("/technocratz2.0/technocratz-logo-BE52XFQ0.png"),
    ]);

    console.log("[ImageConverter] Logo loading complete");
    console.log("[ImageConverter] Agnel logo loaded:", !!agnelLogo);
    console.log("[ImageConverter] Technocratz logo loaded:", !!technocratzLogo);

    return {
      agnelLogo,
      technocratzLogo,
    };
  } catch (error) {
    console.error("[ImageConverter] Error loading logos:", error);
    return {
      agnelLogo: null,
      technocratzLogo: null,
    };
  }
}
