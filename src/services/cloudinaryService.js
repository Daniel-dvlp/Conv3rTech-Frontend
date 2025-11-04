import { cloudinaryConfig } from '../cloudinaryConfig';

/**
 * Servicio para manejar la subida de imágenes a Cloudinary
 */
class CloudinaryService {
    constructor() {
        this.cloudName = cloudinaryConfig.cloudName;
        this.uploadPreset = cloudinaryConfig.uploadPreset;
    }

    /**
     * Sube una imagen a Cloudinary y retorna la URL optimizada
     * @param {File} file - Archivo de imagen a subir
     * @param {string} module - Módulo de la aplicación (products, users, etc.)
     * @param {string} folder - Carpeta específica (opcional)
     * @returns {Promise<string>} URL de la imagen optimizada
     */
    async uploadImage(file, module = 'products', folder = null) {
        try {
            // Validar que sea un archivo de imagen
            if (!file || !file.type.startsWith('image/')) {
                throw new Error('El archivo debe ser una imagen válida');
            }

            // Validar tamaño del archivo (máximo 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                throw new Error('El archivo es demasiado grande. Máximo 10MB');
            }

            // Crear FormData para la subida
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', cloudinaryConfig.uploadPreset);
            formData.append('folder', folder || module);
            
            // Configuraciones de optimización
            formData.append('transformation', 'f_auto,q_auto,w_800,h_600,c_fill');
            formData.append('eager', 'f_auto,q_auto,w_400,h_300,c_fill');

            // Realizar la subida
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Error al subir la imagen');
            }

            const result = await response.json();
            
            // Retornar la URL optimizada
            return result.secure_url;

        } catch (error) {
            console.error('Error al subir imagen a Cloudinary:', error);
            throw error;
        }
    }

    /**
     * Sube múltiples imágenes de forma paralela
     * @param {File[]} files - Array de archivos de imagen
     * @param {string} module - Módulo de la aplicación (products, users, etc.)
     * @param {string} folder - Carpeta específica (opcional)
     * @returns {Promise<string[]>} Array de URLs de las imágenes optimizadas
     */
    async uploadMultipleImages(files, module = 'products', folder = null) {
        try {
            const uploadPromises = files.map(file => this.uploadImage(file, module, folder));
            const urls = await Promise.all(uploadPromises);
            return urls;
        } catch (error) {
            console.error('Error al subir múltiples imágenes:', error);
            throw error;
        }
    }

    /**
     * Genera una URL optimizada para mostrar una imagen existente
     * @param {string} publicId - ID público de la imagen en Cloudinary
     * @param {Object} transformations - Transformaciones a aplicar
     * @returns {string} URL optimizada
     */
    getOptimizedUrl(publicId, transformations = {}) {
        const defaultTransformations = {
            f_auto: true,
            q_auto: true,
            w_400,
            h_300,
            c_fill: true
        };

        const finalTransformations = { ...defaultTransformations, ...transformations };
        
        const transformString = Object.entries(finalTransformations)
            .map(([key, value]) => `${key}_${value}`)
            .join(',');

        return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformString}/${publicId}`;
    }

    /**
     * Valida si una URL es de Cloudinary
     * @param {string} url - URL a validar
     * @returns {boolean}
     */
    isCloudinaryUrl(url) {
        return url && url.includes('cloudinary.com');
    }

    /**
     * Extrae el public ID de una URL de Cloudinary
     * @param {string} url - URL de Cloudinary
     * @returns {string|null} Public ID o null si no es válida
     */
    extractPublicId(url) {
        if (!this.isCloudinaryUrl(url)) return null;
        
        const regex = /\/upload\/(?:[^\/]+\/)*([^\.]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
}

// Crear instancia singleton
const cloudinaryService = new CloudinaryService();

export default cloudinaryService;
