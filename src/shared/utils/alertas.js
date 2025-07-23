import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import 'sweetalert2/dist/sweetalert2.min.css';

export const showToast = (message, type = 'info', options = {}) => {
  toast[type](message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options,
  });
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