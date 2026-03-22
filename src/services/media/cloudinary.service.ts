// src/services/media/cloudinary.service.ts
import { v2 as cloudinary } from 'cloudinary';

// Configure with the user's specific credentials
// We read directly from process.env since Next.js loads .env.local automatically
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.API_SECRET || '',
  secure: true
});

export class CloudinaryService {
  async uploadImage(base64Data: string): Promise<string> {
    if (!process.env.CLOUD_NAME || !base64Data || !process.env.CLOUDINARY_API_KEY) {
      console.warn("Cloudinary not fully configured or empty data. Using mock image URL.");
      return "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";
    }

    try {
      // The base64Data string should start with "data:image/jpeg;base64,..."
      const uploadResponse = await cloudinary.uploader.upload(base64Data, {
        folder: "verify-lens",
        resource_type: "image"
      });
      return uploadResponse.secure_url;
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      throw new Error("Failed to upload image securely to Cloudinary.");
    }
  }
}
