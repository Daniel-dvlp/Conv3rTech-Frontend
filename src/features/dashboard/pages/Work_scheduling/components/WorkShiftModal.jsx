import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaTrash, FaSyncAlt } from 'react-icons/fa';
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
      }
    });
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaSyncAlt className="text-conv3r-gold" /> {mode === 'edit' ? 'Editar Turno' : 'Crear Turno'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2 rounded-full"><FaTimes /></button>
        </header>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
            <select name="employeeId" value={form.employeeId} onChange={handleChange} className="w-full border rounded-lg p-2" required>
              <option value="">Selecciona un empleado...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
              ))}
            </select>
            {errors.employeeId && <span className="text-xs text-red-500">{errors.employeeId}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <input type="text" value={form.role || (employees.find(e => e.id === Number(form.employeeId))?.role || '')} readOnly className="w-full border rounded-lg p-2 bg-gray-100" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora de inicio</label>
              <input type="datetime-local" name="start" value={form.start} onChange={handleChange} className="w-full border rounded-lg p-2" required />
              {errors.start && <span className="text-xs text-red-500">{errors.start}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora de fin</label>
              <input type="datetime-local" name="end" value={form.end} onChange={handleChange} className="w-full border rounded-lg p-2" required />
              {errors.end && <span className="text-xs text-red-500">{errors.end}</span>}
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="repeat" checked={form.repeat} onChange={handleChange} className="accent-conv3r-gold" />
              <span className="font-medium text-gray-700">Se repite</span>
            </label>
          </div>
          {form.repeat && (
            <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
              <div className="flex gap-4 items-center">
                <label className="block text-sm font-medium text-gray-700">Frecuencia</label>
                <select name="freq" value={form.freq} onChange={handleChange} className="border rounded-lg p-2">
                  {frequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                <span className="text-gray-500">Repetir cada</span>
                <input type="number" name="interval" value={form.interval} min={1} onChange={handleChange} className="w-16 border rounded-lg p-1" />
                <span className="text-gray-500">{form.freq === 'DAILY' ? 'día(s)' : form.freq === 'WEEKLY' ? 'semana(s)' : 'mes(es)'}</span>
              </div>
              {form.freq === 'WEEKLY' && (
                <div className="flex gap-2 mt-2">
                  {weekDays.map(day => (
                    <button
                      type="button"
                      key={day.value}
                      className={`px-2 py-1 rounded-full border ${form.byweekday.includes(day.value) ? 'bg-conv3r-gold text-conv3r-dark font-bold' : 'bg-white text-gray-700'}`}
                      onClick={() => handleWeekdayToggle(day.value)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de finalización</label>
                <input type="date" name="until" value={form.until} onChange={handleChange} className="border rounded-lg p-2" />
                {errors.until && <span className="text-xs text-red-500">{errors.until}</span>}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            {mode === 'edit' && (
              <button type="button" onClick={onDelete} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200"><FaTrash /> Eliminar</button>
            )}
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-conv3r-gold text-conv3r-dark font-bold rounded-lg hover:brightness-95"><FaSave /> Guardar</button>
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

export default WorkShiftModal; 