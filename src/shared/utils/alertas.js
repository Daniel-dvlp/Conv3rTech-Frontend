import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export const showToast = (message, type = 'info', options = {}) => {
  // Compatibilidad con tipos: 'success', 'error', 'info', 'warning'
  if (type === 'success') {
    toast.success(message, options);
  } else if (type === 'error') {
    toast.error(message, options);
  } else if (type === 'warning') {
    toast(message, { icon: '⚠️', ...options });
  } else {
    toast(message, options);
  }
};

export const showAlert = async ({
  title = '',
  text = '',
  icon = 'info',
  confirmButtonText = 'Aceptar',
  showCancelButton = false,
  cancelButtonText = 'Cancelar',
  ...rest
}) => {
  return await Swal.fire({
    title,
    text,
    icon,
    confirmButtonText,
    showCancelButton,
    cancelButtonText,
    ...rest,
  });
};