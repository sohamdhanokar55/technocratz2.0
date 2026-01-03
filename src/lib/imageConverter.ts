/**
 * Image conversion utilities for Base64 encoding
 * Uses fetch + canvas for reliable conversion
 */

/**
 * Converts an image file from public folder to Base64 string using fetch
 * @param imagePath - Path to image (e.g., "/technocratz2.0/agnel-logo-Ce5saIek.png")
 * @returns Base64 string (data:image/png;base64,...) or null if conversion fails
 */
export async function imageToBase64(imagePath: string): Promise<string | null> {
  console.log("[ImageConverter] Converting image to Base64:", imagePath);

  try {
    // Fetch the image as blob
    console.log("[ImageConverter] Fetching image...");
    const response = await fetch(imagePath, {
      method: "GET",
      headers: {
        Accept: "image/png,image/jpeg,image/*",
      },
    });

    if (!response.ok) {
      console.error(
        "[ImageConverter] ❌ Fetch failed with status:",
        response.status
      );
      return null;
    }

    const blob = await response.blob();
    console.log("[ImageConverter] ✅ Blob received, size:", blob.size, "bytes");

    // Create object URL from blob
    const objectUrl = URL.createObjectURL(blob);
    console.log("[ImageConverter] Object URL created:", objectUrl);

    // Load image using object URL (avoids CORS issues)
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        console.log("[ImageConverter] ✅ Image loaded successfully");
        console.log("[ImageConverter] Dimensions:", img.width, "x", img.height);

        // Create canvas and draw image
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("[ImageConverter] ❌ Failed to get canvas context");
          URL.revokeObjectURL(objectUrl);
          resolve(null);
          return;
        }

        // Draw and convert to Base64
        ctx.drawImage(img, 0, 0);
        const base64String = canvas.toDataURL("image/png");

        // Cleanup
        URL.revokeObjectURL(objectUrl);

        if (!base64String || base64String.length < 100) {
          console.error("[ImageConverter] ❌ Invalid Base64 generated");
          resolve(null);
          return;
        }

        console.log("[ImageConverter] ✅ Base64 conversion successful");
        console.log(
          "[ImageConverter] Length:",
          base64String.length,
          "characters"
        );
        console.log("[ImageConverter] Prefix:", base64String.substring(0, 30));

        resolve(base64String);
      };

      img.onerror = (error) => {
        console.error("[ImageConverter] ❌ Image load error:", error);
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };

      // Set source to object URL (no CORS issues)
      img.src = objectUrl;
    });
  } catch (error) {
    console.error("[ImageConverter] ❌ Fetch error:", error);
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
  console.log("[ImageConverter] ========================================");
  console.log("[ImageConverter] Loading logos for receipt");

  try {
    console.log("[ImageConverter] Starting logo fetch...");

    const [agnelLogo, technocratzLogo] = await Promise.all([
      imageToBase64("/technocratz2.0/agnel-logo-Ce5saIek.png"),
      imageToBase64("/technocratz2.0/technocratz-logo-BE52XFQ0.png"),
    ]);

    console.log("[ImageConverter] ========================================");
    console.log("[ImageConverter] Logo loading complete");
    console.log(
      "[ImageConverter] Agnel logo:",
      agnelLogo ? "✅ SUCCESS" : "❌ FAILED"
    );
    console.log(
      "[ImageConverter] Technocratz logo:",
      technocratzLogo ? "✅ SUCCESS" : "❌ FAILED"
    );

    if (agnelLogo) {
      console.log(
        "[ImageConverter] Agnel logo size:",
        agnelLogo.length,
        "chars"
      );
    }
    if (technocratzLogo) {
      console.log(
        "[ImageConverter] Technocratz logo size:",
        technocratzLogo.length,
        "chars"
      );
    }

    console.log("[ImageConverter] ========================================");

    return {
      agnelLogo,
      technocratzLogo,
    };
  } catch (error) {
    console.error("[ImageConverter] ❌ Error in loadLogosForReceipt:", error);
    return {
      agnelLogo: null,
      technocratzLogo: null,
    };
  }
}
