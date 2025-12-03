import api from './shared/config/api';

const cloudinaryService = {
    /**
     * Sube múltiples imágenes al backend que las procesa con Cloudinary
     * @param {File[]} files - Array de archivos a subir
     * @param {string} folder - Carpeta en Cloudinary (opcional)
     * @returns {Promise<string[]>} URLs de las imágenes subidas
     */
    uploadMultipleImages: async (files, folder = 'products') => {
        try {
            const formData = new FormData();

            // Agregar cada archivo al FormData
            files.forEach((file) => {
                formData.append('fotos', file);
            });

            // Agregar folder si se especifica
            if (folder) {
                formData.append('folder', folder);
            }

            // Hacer la petición al backend
            const response = await api.post('/products/upload-images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    console.log(`Progreso de carga: ${percentCompleted}%`);
                },
            });

            return response.data.urls || [];
        } catch (error) {
            console.error('Error al subir imágenes:', error);
            if (error.response?.status === 404) {
                throw new Error('Ruta no encontrada. Verifica la configuración del servidor.');
            }
            throw new Error(
                error.response?.data?.message || error.message || 'Error al subir las imágenes'
            );
        }
    },

    /**
     * Sube una sola imagen al backend
     * @param {File} file - Archivo a subir
     * @param {string} folder - Carpeta en Cloudinary (opcional)
     * @returns {Promise<string>} URL de la imagen subida
     */
    uploadSingleImage: async (file, folder = 'products') => {
        try {
            const urls = await cloudinaryService.uploadMultipleImages([file], folder);
            return urls[0];
        } catch (error) {
            console.error('Error al subir imagen:', error);
            throw error;
        }
    },

    /**
     * Elimina una imagen de Cloudinary a través del backend
     * @param {string} imageUrl - URL de la imagen a eliminar
     * @returns {Promise<boolean>} true si se eliminó correctamente
     */
    deleteImage: async (imageUrl) => {
        try {
            const response = await api.delete('/products/delete-image', {
                data: { imageUrl },
            });
            return response.data.success || false;
        } catch (error) {
            console.error('Error al eliminar imagen:', error);
            if (error.response?.status === 404) {
                throw new Error('Ruta no encontrada. Verifica la configuración del servidor.');
            }
            throw new Error(
                error.response?.data?.message || error.message || 'Error al eliminar la imagen'
            );
        }
    },

    /**
     * Valida que los archivos sean imágenes válidas
     * @param {File[]} files - Archivos a validar
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validateImages: (files) => {
        const errors = [];
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        files.forEach((file, index) => {
            // Validar tipo
            if (!validTypes.includes(file.type)) {
                errors.push(
                    `Archivo ${index + 1}: Tipo no válido. Solo se permiten JPG, PNG y WEBP`
                );
            }

            // Validar tamaño
            if (file.size > maxSize) {
                errors.push(
                    `Archivo ${index + 1}: Tamaño excede 5MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`
                );
            }
        });

        return {
            valid: errors.length === 0,
            errors,
        };
    },

    /**
     * Comprime una imagen antes de subirla (opcional)
     * @param {File} file - Archivo a comprimir
     * @param {number} maxWidth - Ancho máximo
     * @param {number} quality - Calidad (0-1)
     * @returns {Promise<Blob>} Imagen comprimida
     */
    compressImage: async (file, maxWidth = 1200, quality = 0.8) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calcular nuevas dimensiones manteniendo aspect ratio
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            resolve(blob);
                        },
                        file.type,
                        quality
                    );
                };

                img.onerror = (error) => {
                    reject(error);
                };
            };

            reader.onerror = (error) => {
                reject(error);
            };
        });
    },
};

export default cloudinaryService;