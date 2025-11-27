// Adaptador para reutilizar el servicio basado en backend definido en `src/cloudinaryConfig.js`
// De esta forma, el resto de la app puede seguir importando desde `services/cloudinaryService`
// sin romper nada.

import cloudinaryService from '../cloudinaryConfig';

export default cloudinaryService;
