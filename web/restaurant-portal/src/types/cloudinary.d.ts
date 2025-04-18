// src/types/cloudinary.d.ts
interface CloudinaryWidget {
  open: () => void;
}

interface Cloudinary {
  createUploadWidget: (
    options: any,
    callback: (error: any, result: any) => void
  ) => CloudinaryWidget;
}

interface Window {
  cloudinary?: Cloudinary;
}
