import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaTrash, FaSyncAlt, FaUser, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { RRule, RRuleSet, rrulestr } from 'rrule';

const frequencies = [
  { value: 'DAILY', label: 'Diariamente' },
  { value: 'WEEKLY', label: 'Semanalmente' },
  { value: 'MONTHLY', label: 'Mensualmente' },
];
const weekDays = [
  { value: 'MO', label: 'L' },
  { value: 'TU', label: 'M' },
  { value: 'WE', label: 'X' },
  { value: 'TH', label: 'J' },
  { value: 'FR', label: 'V' },
  { value: 'SA', label: 'S' },
  { value: 'SU', label: 'D' },
];

const WorkShiftModal = ({ isOpen, onClose, onSave, onDelete, employees, initialData, mode = 'create' }) => {
  const [form, setForm] = useState({
    employeeId: '',
    role: '',
    start: '',
    end: '',
    repeat: false,
    freq: 'WEEKLY',
    interval: 1,
    byweekday: [],
    until: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        employeeId: initialData.employeeId || '',
        role: initialData.role || '',
        start: initialData.start || '',
        end: initialData.end || '',
        repeat: !!initialData.rrule,
        freq: initialData.rrule ? rrulestr(initialData.rrule).options.freq === 2 ? 'WEEKLY' : (rrulestr(initialData.rrule).options.freq === 3 ? 'MONTHLY' : 'DAILY') : 'WEEKLY',
        interval: initialData.rrule ? rrulestr(initialData.rrule).options.interval : 1,
        byweekday: initialData.rrule ? (rrulestr(initialData.rrule).options.byweekday || []) : [],
        until: initialData.rrule ? (rrulestr(initialData.rrule).options.until ? rrulestr(initialData.rrule).options.until.toISOString().slice(0,10) : '') : '',
      });
    } else {
      setForm({
        employeeId: '', role: '', start: '', end: '', repeat: false, freq: 'WEEKLY', interval: 1, byweekday: [], until: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };
  
  const handleWeekdayToggle = (day) => {
    setForm(prev => ({
      ...prev,
      byweekday: prev.byweekday.includes(day)
        ? prev.byweekday.filter(d => d !== day)
        : [...prev.byweekday, day]
    }));
  };
  
  const validate = () => {
    const errs = {};
    if (!form.employeeId) errs.employeeId = 'Selecciona un empleado';
    if (!form.start) errs.start = 'Selecciona fecha y hora de inicio';
    if (!form.end) errs.end = 'Selecciona fecha y hora de fin';
    if (form.repeat && form.byweekday.length === 0 && form.freq === 'WEEKLY') errs.byweekday = 'Selecciona al menos un día';
    if (form.repeat && !form.until) errs.until = 'Selecciona fecha de finalización';
    return errs;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    
    // RRULE
    let rrule = undefined;
    if (form.repeat) {
      const options = {
        freq: form.freq === 'DAILY' ? RRule.DAILY : form.freq === 'WEEKLY' ? RRule.WEEKLY : RRule.MONTHLY,
        interval: Number(form.interval),
        dtstart: new Date(form.start),
        until: form.until ? new Date(form.until + 'T23:59:59') : undefined,
      };
      if (form.freq === 'WEEKLY') options.byweekday = form.byweekday;
      rrule = new RRule(options).toString();
    }
    
    const employee = employees.find(e => e.id === Number(form.employeeId));
    onSave({
      id: initialData?.id || `shift-${Date.now()}`,
      title: employee?.name || '',
      start: form.start,
      end: form.end,
      rrule,
      backgroundColor: employee?.color,
      borderColor: employee?.color,
      extendedProps: {
        employeeId: Number(form.employeeId),
        role: employee?.role || '',
        type: 'regular'
      }
    });
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <header className="flex justify-between items-center p-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <FaSyncAlt className="text-white text-xs" />
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
              <FaUser className="text-yellow-600" />
              Empleado
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

          {/* Rol */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Rol</label>
            <input 
              type="text" 
              value={form.role || (employees.find(e => e.id === Number(form.employeeId))?.role || '')} 
              readOnly 
              className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-50" 
            />
          </div>

          {/* Fechas y horas */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <FaCalendarAlt className="text-yellow-600" />
                Inicio
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
                <FaClock className="text-yellow-600" />
                Fin
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

          {/* Repetición */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="repeat" 
                checked={form.repeat} 
                onChange={handleChange} 
                className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2" 
              />
              <span className="text-sm font-medium text-gray-700">Se repite</span>
            </label>
          </div>

          {/* Configuración de repetición */}
          {form.repeat && (
            <div className="space-y-2 border border-gray-200 rounded-lg p-2 bg-gray-50">
              <div className="flex gap-1 items-center">
                <label className="block text-xs font-medium text-gray-700">Frecuencia</label>
                <select 
                  name="freq" 
                  value={form.freq} 
                  onChange={handleChange} 
                  className="border border-gray-200 rounded p-1 text-xs"
                >
                  {frequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                <span className="text-xs text-gray-500">cada</span>
                <input 
                  type="number" 
                  name="interval" 
                  value={form.interval} 
                  min={1} 
                  onChange={handleChange} 
                  className="w-10 border border-gray-200 rounded p-1 text-xs" 
                />
                <span className="text-xs text-gray-500">
                  {form.freq === 'DAILY' ? 'día(s)' : form.freq === 'WEEKLY' ? 'semana(s)' : 'mes(es)'}
                </span>
              </div>
              
              {form.freq === 'WEEKLY' && (
                <div className="flex gap-1">
                  {weekDays.map(day => (
                    <button
                      type="button"
                      key={day.value}
                      className={`w-6 h-6 rounded-full border text-xs font-bold transition-all ${
                        form.byweekday.includes(day.value) 
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-600' 
                          : 'bg-white text-gray-700 border-gray-200 hover:border-yellow-400'
                      }`}
                      onClick={() => handleWeekdayToggle(day.value)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
                <input 
                  type="date" 
                  name="until" 
                  value={form.until} 
                  onChange={handleChange} 
                  className="border border-gray-200 rounded p-1.5 text-sm w-full" 
                />
                {errors.until && <span className="text-xs text-red-500">{errors.until}</span>}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-2">
            {mode === 'edit' && (
              <button 
                type="button" 
                onClick={onDelete} 
                className="flex items-center gap-1 px-2 py-1.5 bg-red-100 text-red-700 rounded-lg font-bold text-xs hover:bg-red-200 transition-colors"
              >
                <FaTrash className="text-xs" /> Eliminar
              </button>
            )}
            <button 
              type="submit" 
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-800 font-bold rounded-lg hover:shadow-md transition-all text-sm"
            >
              <FaSave className="text-xs" /> Guardar
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

export default WorkShiftModal; 