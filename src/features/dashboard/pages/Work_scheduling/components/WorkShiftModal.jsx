import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaTrash, FaUser, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { showToast, showAlert } from '../../../../../shared/utils/alertas';

const WorkShiftModal = ({ isOpen, onClose, onSave, onDelete, employees, initialData, mode = 'create' }) => {
  const [form, setForm] = useState({
    employeeId: '',
    start: '',
    end: '',
  });
  const [errors, setErrors] = useState({});
  const [recurrence, setRecurrence] = useState({ repeat: false, frequency: 'weekly', days: [], until: '' });

  useEffect(() => {
    if (initialData) {
      setForm({
        employeeId: initialData.employeeId || '',
        start: initialData.start || '',
        end: initialData.end || '',
      });
      setRecurrence({ repeat: false, frequency: 'weekly', days: [], until: '' });
    } else {
      setForm({ employeeId: '', start: '', end: '' });
      setRecurrence({ repeat: false, frequency: 'weekly', days: [], until: '' });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.employeeId) errs.employeeId = 'Selecciona un empleado';
    if (!form.start) errs.start = 'Selecciona fecha y hora de inicio';
    if (!form.end) errs.end = 'Selecciona fecha y hora de fin';
    if (form.start && form.end && new Date(form.start) >= new Date(form.end)) errs.end = 'La hora de fin debe ser mayor a la de inicio';
    // Recurrence validations
    if (recurrence.repeat) {
      if (recurrence.frequency === 'weekly' && (!recurrence.days || recurrence.days.length === 0)) {
        errs.recurrence = 'Selecciona al menos un día para la recurrencia semanal';
      }
      if (recurrence.until && form.start && new Date(recurrence.until) < new Date(form.start)) {
        errs.until = 'La fecha de fin de recurrencia debe ser igual o posterior a la fecha de inicio';
      }
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleRecurrenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'repeat') {
      setRecurrence(prev => ({ ...prev, repeat: checked }));
    } else if (name === 'frequency') {
      setRecurrence(prev => ({ ...prev, frequency: value }));
    } else if (name.startsWith('day-')) {
      const day = value;
      setRecurrence(prev => ({
        ...prev,
        days: checked ? [...prev.days, day] : prev.days.filter(d => d !== day)
      }));
    } else if (name === 'until') {
      setRecurrence(prev => ({ ...prev, until: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      showToast('Por favor, corrige los errores del formulario.', 'error');
      return;
    }
    const employee = employees.find(e => e.id === Number(form.employeeId));
    // Recurrence logic (for now, just pass recurrence info)
    onSave({
      id: initialData?.id || `shift-${Date.now()}`,
      title: employee?.name || '',
      start: form.start,
      end: form.end,
      backgroundColor: employee?.color,
      borderColor: employee?.color,
      extendedProps: {
        employeeId: Number(form.employeeId),
        role: employee?.role || '',
        documento: employee?.documento || '',
        recurrence: recurrence.repeat ? { frequency: recurrence.frequency, days: recurrence.days, until: recurrence.until } : null
      }
    });
    showToast(mode === 'edit' ? 'Turno actualizado exitosamente' : 'Turno creado exitosamente', 'success');
  };

  const handleDelete = async () => {
    const result = await showAlert({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar este turno? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      onDelete(initialData?.id);
      showToast('Turno eliminado exitosamente', 'success');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <header className="flex justify-between items-center p-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <FaUser className="text-white text-xs" />
            </div>
            <h2 className="text-base font-bold text-gray-800">
              {mode === 'edit' ? 'Editar Turno' : 'Crear Turno'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaTimes />
          </button>
        </header>
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 p-3 space-y-3">
          {/* Empleado */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <FaUser className="text-yellow-600" /> Empleado
            </label>
            <select 
              name="employeeId" 
              value={form.employeeId} 
              onChange={handleChange} 
              className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              required
            >
              <option value="">Selecciona un empleado...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
            {errors.employeeId && <span className="text-xs text-red-500">{errors.employeeId}</span>}
          </div>
          {/* Fechas y horas */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <FaCalendarAlt className="text-yellow-600" /> Inicio
              </label>
              <input 
                type="datetime-local" 
                name="start" 
                value={form.start} 
                onChange={handleChange} 
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" 
                required 
              />
              {errors.start && <span className="text-xs text-red-500">{errors.start}</span>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <FaClock className="text-yellow-600" /> Fin
              </label>
              <input 
                type="datetime-local" 
                name="end" 
                value={form.end} 
                onChange={handleChange} 
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" 
                required 
              />
              {errors.end && <span className="text-xs text-red-500">{errors.end}</span>}
            </div>
          </div>
          {/* Recurrencia */}
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
              <input type="checkbox" name="repeat" checked={recurrence.repeat} onChange={handleRecurrenceChange} />
              ¿Este turno se repite?
            </label>
            {recurrence.repeat && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-4">
                  <label className="text-xs font-medium">Frecuencia:</label>
                  <select name="frequency" value={recurrence.frequency} onChange={handleRecurrenceChange} className="border border-gray-200 rounded-lg p-1 text-xs">
                    <option value="weekly">Semanal</option>
                    <option value="daily">Diaria</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"].map((day, idx) => (
                    <label key={day} className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        name={`day-${idx}`}
                        value={day}
                        checked={recurrence.days.includes(day)}
                        onChange={handleRecurrenceChange}
                        disabled={recurrence.frequency !== 'weekly'}
                      />
                      {day}
                    </label>
                  ))}
                </div>
                {errors.recurrence && <span className="text-xs text-red-500">{errors.recurrence}</span>}
                <div className="flex items-center gap-2 mt-2">
                  <label className="text-xs font-medium">Repetir hasta:</label>
                  <input
                    type="date"
                    name="until"
                    value={recurrence.until}
                    onChange={handleRecurrenceChange}
                    className="border border-gray-200 rounded-lg p-1 text-xs"
                    min={form.start ? form.start.split('T')[0] : ''}
                  />
                </div>
                {errors.until && <span className="text-xs text-red-500">{errors.until}</span>}
              </div>
            )}
          </div>
          {/* Acciones */}
          <div className="flex gap-2 pt-2 border-t border-gray-100 mt-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-800 font-bold shadow hover:shadow-lg transition-all"
            >
              <FaSave /> {mode === 'edit' ? 'Actualizar' : 'Crear'}
            </button>
            {mode === 'edit' && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 font-bold shadow hover:bg-red-200 transition-all"
              >
                <FaTrash /> Eliminar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkShiftModal; 