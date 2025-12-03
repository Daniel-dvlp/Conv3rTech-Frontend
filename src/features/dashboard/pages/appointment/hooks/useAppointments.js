import { useState, useCallback } from 'react';
import appointmentsService from '../../../../../services/appointmentsService';
import {
    getColorByStatus,
    formatTimeForBackend,
    formatTimeForFrontend
} from '../utils/AppointmentHelpers';
import { toast } from 'react-hot-toast';

export const useAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Transforma datos del backend al formato del calendario
     */
    const transformBackendToCalendar = useCallback((backendData) => {
        return backendData.map(cita => {
            const clienteNombre = cita.cliente
                ? `${cita.cliente.nombre} ${cita.cliente.apellido || ''}`.trim()
                : 'Sin cliente';

            const servicioNombre = cita.servicio?.nombre || 'Sin servicio';

            return {
                id: cita.id_cita,
                title: `${clienteNombre} - ${servicioNombre}`,
                start: `${cita.fecha}T${cita.hora_inicio}`,
                end: `${cita.fecha}T${cita.hora_fin}`,
                backgroundColor: getColorByStatus(cita.estado),
                borderColor: getColorByStatus(cita.estado),
                extendedProps: {
                    id_cita: cita.id_cita,
                    id_cliente: cita.id_cliente,
                    id_usuario: cita.id_usuario,
                    id_servicio: cita.id_servicio,
                    cliente: clienteNombre,
                    telefono: cita.cliente?.telefono || '',
                    servicio: servicioNombre,
                    encargado: cita.trabajador
                        ? `${cita.trabajador.nombre} ${cita.trabajador.apellido || ''}`.trim()
                        : 'Sin encargado',
                    direccion: cita.direccion,
                    observaciones: cita.observaciones || '',
                    estado: cita.estado,
                    fecha: cita.fecha,
                    hora_inicio: formatTimeForFrontend(cita.hora_inicio),
                    hora_fin: formatTimeForFrontend(cita.hora_fin)
                }
            };
        });
    }, []);

    /**
     * Transforma datos del formulario al formato del backend
     */
    const transformCalendarToBackend = useCallback((formData) => {
        return {
            id_cliente: parseInt(formData.id_cliente),
            id_usuario: parseInt(formData.id_usuario),
            id_servicio: parseInt(formData.id_servicio),
            fecha: formData.fecha,
            hora_inicio: formatTimeForBackend(formData.hora_inicio),
            hora_fin: formatTimeForBackend(formData.hora_fin),
            direccion: formData.direccion,
            observaciones: formData.observaciones || '',
            estado: formData.estado || 'Pendiente'
        };
    }, []);

    /**
     * Obtener todas las citas
     */
    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await appointmentsService.getAllAppointments();
            const transformed = transformBackendToCalendar(data);
            setAppointments(transformed);
            return transformed;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Error al cargar las citas';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [transformBackendToCalendar]);

    /**
     * Crear nueva cita
     */
    const createAppointment = useCallback(async (formData) => {
        setLoading(true);
        setError(null);
        try {
            console.log('📝 Datos del formulario recibidos:', formData);
            const backendData = transformCalendarToBackend(formData);
            console.log('🔄 Datos transformados para backend:', backendData);

            const newAppointment = await appointmentsService.createAppointment(backendData);

            // Recargar todas las citas para obtener datos completos con relaciones
            await fetchAppointments();

            toast.success('Cita creada exitosamente');
            return newAppointment;
        } catch (err) {
            console.error('❌ Error al crear cita:', err);
            console.error('❌ Respuesta del servidor:', err.response?.data);
            const errorMessage = err.response?.data?.error || err.message || 'Error al crear la cita';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [transformCalendarToBackend, fetchAppointments]);

    /**
     * Actualizar cita existente
     */
    const updateAppointment = useCallback(async (id, formData) => {
        setLoading(true);
        setError(null);
        try {
            const backendData = transformCalendarToBackend(formData);
            await appointmentsService.updateAppointment(id, backendData);

            // Recargar todas las citas
            await fetchAppointments();

            toast.success('Cita actualizada exitosamente');
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Error al actualizar la cita';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [transformCalendarToBackend, fetchAppointments]);

    /**
     * Eliminar cita
     */
    const deleteAppointment = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await appointmentsService.deleteAppointment(id);

            // Actualizar estado local removiendo la cita
            setAppointments(prev => prev.filter(apt => apt.id !== id));

            toast.success('Cita eliminada exitosamente');
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Error al eliminar la cita';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        appointments,
        loading,
        error,
        fetchAppointments,
        createAppointment,
        updateAppointment,
        deleteAppointment,
        transformBackendToCalendar,
        transformCalendarToBackend
    };
};
