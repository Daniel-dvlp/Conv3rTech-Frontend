import { Cloudinary } from "@cloudinary/url-gen";

const cld = new Cloudinary({
    cloud: {
        cloudName: "dmtjht9ie",
    },
});

// Configuración para subida de archivos
export const cloudinaryConfig = {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dmtjht9ie",
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "conv3rtech_products",
};

export default cld;
