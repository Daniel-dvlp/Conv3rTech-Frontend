// src/features/dashboard/pages/Work_scheduling/hooks/useLaborScheduling.js
import { useState, useEffect, useCallback } from 'react';
import { laborSchedulingApi } from '../services/laborSchedulingApi';
import { toast } from 'react-hot-toast';

// Función para transformar datos del backend al formato del frontend (FullCalendar)
const transformSchedulingFromBackend = (scheduling, employees) => {
  const user = scheduling.user || {};
  const employee = employees.find(e => e.id === user.id_usuario);
  
  // Combinar fecha_inicio y hora_inicio para crear datetime de inicio
  const startDateTime = scheduling.fecha_inicio 
    ? `${scheduling.fecha_inicio}T${scheduling.hora_inicio || '00:00:00'}`
    : null;
  
  // Combinar fecha_inicio y hora_fin para crear datetime de fin
  const endDateTime = scheduling.fecha_inicio 
    ? `${scheduling.fecha_inicio}T${scheduling.hora_fin || '00:00:00'}`
    : null;

  return {
    id: `shift-${scheduling.id_programacion}`,
    title: employee ? employee.name : `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Empleado',
    start: startDateTime,
    end: endDateTime,
    backgroundColor: employee?.color || '#9CA3AF',
    borderColor: employee?.color || '#9CA3AF',
    extendedProps: {
      id_programacion: scheduling.id_programacion,
      employeeId: scheduling.id_usuario,
      role: employee?.role || user.rol || 'Empleado',
      documento: user.documento || '',
      _backendData: scheduling
    }
  };
};

// Función para transformar datos del frontend al formato del backend
const transformSchedulingToBackend = (shift) => {
  const startDate = new Date(shift.start);
  const endDate = new Date(shift.end);
  
  return {
    id_usuario: shift.extendedProps?.employeeId || shift.employeeId,
    fecha_inicio: startDate.toISOString().split('T')[0], // YYYY-MM-DD
    hora_inicio: startDate.toTimeString().split(' ')[0], // HH:MM:SS
    hora_fin: endDate.toTimeString().split(' ')[0] // HH:MM:SS
  };
};

export const useLaborScheduling = (employees) => {
  const [schedulings, setSchedulings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar todas las programaciones
  const loadSchedulings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await laborSchedulingApi.getAllSchedulings();
      const transformedData = Array.isArray(data) 
        ? data.map(s => transformSchedulingFromBackend(s, employees || [])) 
        : [];
      setSchedulings(transformedData);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar programaciones laborales');
    } finally {
      setLoading(false);
    }
  }, [employees]);

  // Crear programación
  const createScheduling = useCallback(async (shift) => {
    try {
      setLoading(true);
      const backendData = transformSchedulingToBackend(shift);
      const newScheduling = await laborSchedulingApi.createScheduling(backendData);
      const transformedScheduling = transformSchedulingFromBackend(newScheduling, employees || []);
      setSchedulings(prev => [...prev, transformedScheduling]);
      toast.success('Turno creado exitosamente');
      return transformedScheduling;
    } catch (err) {
      setError(err.message);
      toast.error('Error al crear turno');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [employees]);

  // Actualizar programación
  const updateScheduling = useCallback(async (shiftId, shift) => {
    try {
      setLoading(true);
      const backendData = transformSchedulingToBackend(shift);
      const id_programacion = shift.extendedProps?.id_programacion;
      const updatedScheduling = await laborSchedulingApi.updateScheduling(id_programacion, backendData);
      const transformedScheduling = transformSchedulingFromBackend(updatedScheduling, employees || []);
      setSchedulings(prev => 
        prev.map(s => s.id === shiftId ? transformedScheduling : s)
      );
      toast.success('Turno actualizado exitosamente');
      return transformedScheduling;
    } catch (err) {
      setError(err.message);
      toast.error('Error al actualizar turno');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [employees]);

  // Eliminar programación
  const deleteScheduling = useCallback(async (shiftId) => {
    try {
      setLoading(true);
      const scheduling = schedulings.find(s => s.id === shiftId);
      const id_programacion = scheduling?.extendedProps?.id_programacion;
      if (id_programacion) {
        await laborSchedulingApi.deleteScheduling(id_programacion);
        setSchedulings(prev => prev.filter(s => s.id !== shiftId));
        toast.success('Turno eliminado exitosamente');
      }
    } catch (err) {
      setError(err.message);
      toast.error('Error al eliminar turno');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [schedulings]);

  // Cargar programaciones al montar el componente o cuando cambien los empleados
  useEffect(() => {
    if (employees && employees.length > 0) {
      loadSchedulings();
    }
  }, [loadSchedulings, employees]);

  return {
    schedulings,
    loading,
    error,
    loadSchedulings,
    createScheduling,
    updateScheduling,
    deleteScheduling
  };
};

export default useLaborScheduling;

