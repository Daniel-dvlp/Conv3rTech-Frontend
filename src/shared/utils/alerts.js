// src/utils/alerts.js
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

/**
 * Muestra una notificación de éxito con react-hot-toast.
 * @param {string} message - El mensaje a mostrar.
 */
export const showSuccess = (message) => {
  toast.success(message);
};

/**
 * Muestra una notificación de error con react-hot-toast.
 * @param {string} message - El mensaje a mostrar.
 */
export const showError = (message) => {
  toast.error(message);
};

/**
 * Muestra una notificación informativa con react-hot-toast.
 * @param {string} message - El mensaje a mostrar.
 */
export const showInfo = (message) => {
  toast(message);
};

/**
 * Muestra una confirmación con sweetalert2 para eliminar o cancelar acciones.
 * @param {string} title - Título de la alerta.
 * @param {string} text - Texto descriptivo.
 * @returns {Promise<boolean>} - True si el usuario confirma, false si cancela.
 */
export const confirmDelete = async (
  title = '¿Estás seguro?',
  text = 'Esta acción no se puede deshacer'
) => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e74c3c',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí',
    cancelButtonText: 'Cancelar'
  });

  return result.isConfirmed; // ✅ Solo retorna true o false
};

