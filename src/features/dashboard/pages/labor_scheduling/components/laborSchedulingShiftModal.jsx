import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUser, FaCalendarAlt, FaClock, FaPlus } from 'react-icons/fa';
import { usersService } from '../../../../../services';

// Reutilizar componentes del formato estándar como en NewPurchasesModal
const FormSection = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const FormLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const inputBaseStyle = 'block w-full text-sm text-gray-500 border rounded-lg shadow-sm p-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold';

const LaborSchedulingShiftModal = ({ isOpen, onClose, onSave, users }) => {
   const [form, setForm] = useState({
     userIds: [],
     startDate: '', // Fecha de inicio
     endDate: '', // Fecha de fin (solo para eventos)
     horaInicio: '09:00', // Hora de inicio (HH:MM)
     horaFin: '17:00', // Hora de fin (HH:MM)
     color: '#3B82F6', // Color por defecto
     descripcion: '', // Descripción del evento/horario
   });
   const [allUsers, setAllUsers] = useState(users || []);
   const [errors, setErrors] = useState({});
   const [daysOfWeek, setDaysOfWeek] = useState([]); // Solo para horarios recurrentes
   const [selectedUserId, setSelectedUserId] = useState('');
   const [tipoProgramacion, setTipoProgramacion] = useState('horario'); // 'horario' o 'evento'


  useEffect(() => {
    // Resetear formulario cuando se abre el modal
    setForm({
      userIds: [],
      startDate: '',
      endDate: '',
      horaInicio: '09:00',
      horaFin: '17:00',
      color: '#3B82F6',
      descripcion: '',
    });
    setDaysOfWeek([]);
    setTipoProgramacion('horario');
    setErrors({});
  }, [isOpen]);

  // Cargar usuarios cuando se abra el modal para listar todos los usuarios
  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        const response = await usersService.getAllUsers();
        // Aceptar distintas formas de respuesta de la API:
        // - Array directo
        // - { success: true, data: [...] }
        // - { data: [...] }
        // - { users: [...] }
        let usuarios = [];
        if (Array.isArray(response)) {
          usuarios = response;
        } else if (response?.success && Array.isArray(response.data)) {
          usuarios = response.data;
        } else if (Array.isArray(response?.data)) {
          usuarios = response.data;
        } else if (Array.isArray(response?.users)) {
          usuarios = response.users;
        } else if (Array.isArray(response?.data?.data)) {
          usuarios = response.data.data;
        }
        setAllUsers(usuarios || []);
        if (!usuarios || usuarios.length === 0) {
          // No provocar un error visual, solo informar en consola para debug
          console.debug('No se encontraron usuarios al cargar:', response);
        }
      } catch (error) {
        console.error('Error loading users:', error);
        setAllUsers([]);
      }
    };

    if (isOpen) {
      loadUsuarios();
    }
  }, [isOpen]);

  const validate = () => {
    const errs = {};
    if (form.userIds.length === 0) errs.users = 'Selecciona al menos un usuario';
    if (!form.startDate) errs.startDate = 'Selecciona la fecha de inicio';

    // Validar horas de inicio y fin
    if (!form.horaInicio) errs.horaInicio = 'Selecciona la hora de inicio';
    if (!form.horaFin) errs.horaFin = 'Selecciona la hora de fin';

    // Comparar horas
    if (form.horaInicio && form.horaFin && !errs.horaInicio && !errs.horaFin) {
      if (form.horaInicio >= form.horaFin) {
        errs.horaFin = 'La hora de fin debe ser mayor a la de inicio';
      }
    }

    // Validar que no sea fecha pasada
    if (form.startDate && new Date(form.startDate) < new Date().setHours(0, 0, 0, 0)) {
      errs.startDate = 'No se pueden crear programaciones en fechas pasadas';
    }

    // Validaciones específicas por tipo
    if (tipoProgramacion === 'horario') {
      // Validar días de la semana para horarios
      if (!daysOfWeek || daysOfWeek.length === 0) {
        errs.daysOfWeek = 'Selecciona al menos un día de la semana';
      }
    } else if (tipoProgramacion === 'evento') {
      // Validar fecha de fin para eventos
      if (!form.endDate) errs.endDate = 'Selecciona la fecha de fin';
      if (form.endDate && form.startDate && new Date(form.endDate) < new Date(form.startDate)) {
        errs.endDate = 'La fecha de fin debe ser igual o posterior a la fecha de inicio';
      }
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value, options, multiple } = e.target;
    if (multiple && name === 'userIds') {
      const selected = Array.from(options).filter(o => o.selected).map(o => Number(o.value));
      setForm(prev => ({ ...prev, [name]: selected }));
      setErrors(prev => ({ ...prev, [name]: undefined }));
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleDaysOfWeekChange = (e) => {
    const { value, checked } = e.target;
    setDaysOfWeek(prev =>
      checked ? [...prev, value] : prev.filter(day => day !== value)
    );
    setErrors(prev => ({ ...prev, daysOfWeek: undefined }));
  };

  const handleAddUser = () => {
    if (!selectedUserId) return;

    const userId = Number(selectedUserId);
    if (form.userIds.includes(userId)) {
      setErrors(prev => ({ ...prev, users: 'Este usuario ya ha sido añadido' }));
      return;
    }

    setForm(prev => ({
      ...prev,
      userIds: [...prev.userIds, userId]
    }));
    setSelectedUserId('');
    setErrors(prev => ({ ...prev, users: undefined }));
  };

  const handleRemoveUser = (userId) => {
    setForm(prev => ({
      ...prev,
      userIds: prev.userIds.filter(id => id !== userId)
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      return;
    }

    // Preparar payload según el tipo de programación
    const basePayload = {
      fecha_inicio: form.startDate,
      hora_inicio: form.horaInicio,
      hora_fin: form.horaFin,
      color: form.color,
      descripcion: form.descripcion,
      userIds: form.userIds,
      tipo: tipoProgramacion
    };

    if (tipoProgramacion === 'horario') {
      // Para horarios: incluir recurrencia semanal
      basePayload.recurrencia_semanal = daysOfWeek;
      onSave(basePayload, 'recurring');
    } else if (tipoProgramacion === 'evento') {
      // Para eventos: incluir fecha de fin
      basePayload.fecha_fin = form.endDate;
      onSave(basePayload, 'event');
    }
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Nueva Programación
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaTimes />
          </button>
        </header>

        {/* Form - Formato similar a NewPurchasesModal */}
        <form onSubmit={handleSubmit} noValidate className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          {/* Usuarios - Selección individual */}
          <FormSection title="Usuarios">
              {errors.users && (
                <p className="text-red-500 text-sm mb-2">{errors.users}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div className="md:col-span-2">
                  <FormLabel><span className="text-red-500">*</span> Usuario</FormLabel>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className={`${inputBaseStyle} ${
                      errors.users ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar usuario</option>
                    {allUsers && allUsers.length > 0 ? allUsers
                      .filter(user => !form.userIds.includes(user.id_usuario))
                      .map(user => (
                      <option key={user.id_usuario} value={user.id_usuario}>
                        {user.nombre} {user.apellido} ({user.rol?.nombre_rol})
                      </option>
                    )) : (
                      <option value="" disabled>No hay usuarios disponibles</option>
                    )}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddUser}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-conv3r-dark bg-conv3r-gold hover:brightness-95 transition-transform hover:scale-105"
                  >
                    <FaPlus className="mr-2" />
                    Añadir
                  </button>
                </div>
              </div>

              {form.userIds.length > 0 && (
                <div className="mt-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {form.userIds.map((userId) => {
                          const user = allUsers.find(u => u.id_usuario === userId);
                          return (
                            <tr key={userId}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {user ? `${user.nombre} ${user.apellido}` : 'Usuario no encontrado'}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {user?.rol?.nombre_rol || 'Sin rol'}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveUser(userId)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Eliminar usuario"
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </FormSection>

          {/* Selector de tipo de programación */}
          <FormSection title="Tipo de Programación">
            <div>
              <FormLabel><span className="text-red-500">*</span> Tipo</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoProgramacion"
                    value="horario"
                    checked={tipoProgramacion === 'horario'}
                    onChange={(e) => setTipoProgramacion(e.target.value)}
                    className="text-blue-500 focus:ring-blue-400"
                  />
                  <div>
                    <span className="font-medium">Horario</span>
                    <p className="text-xs text-gray-500">Programación recurrente semanal</p>
                  </div>
                </label>
                <label className="flex items-center gap-2 text-sm p-3 border border-gray-200 rounded-lg hover:bg-green-50 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoProgramacion"
                    value="evento"
                    checked={tipoProgramacion === 'evento'}
                    onChange={(e) => setTipoProgramacion(e.target.value)}
                    className="text-green-500 focus:ring-green-400"
                  />
                  <div>
                    <span className="font-medium">Evento</span>
                    <p className="text-xs text-gray-500">Programación única con fecha fin</p>
                  </div>
                </label>
              </div>
            </div>
          </FormSection>

          <FormSection title="Información de la Programación">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormLabel htmlFor="startDate">
                  <span className="text-red-500">*</span> Fecha de Inicio
                </FormLabel>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`${inputBaseStyle} ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                )}
              </div>

              {tipoProgramacion === 'evento' && (
                <div>
                  <FormLabel htmlFor="endDate">
                    <span className="text-red-500">*</span> Fecha de Fin
                  </FormLabel>
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    min={form.startDate || new Date().toISOString().split('T')[0]}
                    className={`${inputBaseStyle} ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormLabel>
                  <span className="text-red-500">*</span> Hora de Inicio
                </FormLabel>
                <input
                  type="time"
                  name="horaInicio"
                  value={form.horaInicio}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, horaInicio: e.target.value }));
                    setErrors(prev => ({ ...prev, horaInicio: undefined }));
                  }}
                  className={`${inputBaseStyle} ${errors.horaInicio ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.horaInicio && (
                  <p className="text-red-500 text-sm mt-1">{errors.horaInicio}</p>
                )}
              </div>
              <div>
                <FormLabel>
                  <span className="text-red-500">*</span> Hora de Fin
                </FormLabel>
                <input
                  type="time"
                  name="horaFin"
                  value={form.horaFin}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, horaFin: e.target.value }));
                    setErrors(prev => ({ ...prev, horaFin: undefined }));
                  }}
                  className={`${inputBaseStyle} ${errors.horaFin ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.horaFin && (
                  <p className="text-red-500 text-sm mt-1">{errors.horaFin}</p>
                )}
              </div>
            </div>

            {/* Color selector */}
            <div>
              <FormLabel>Color de la Programación</FormLabel>
              <div className="flex gap-2 flex-wrap">
                {[
                  '#3B82F6', // Blue
                  '#10B981', // Green
                  '#F59E0B', // Yellow
                  '#EF4444', // Red
                  '#8B5CF6', // Purple
                  '#F97316', // Orange
                  '#06B6D4', // Cyan
                  '#84CC16', // Lime
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      form.color === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Seleccionar color ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <FormLabel htmlFor="descripcion">
                Descripción
              </FormLabel>
              <textarea
                id="descripcion"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Describe el propósito o detalles de esta programación..."
                rows={3}
                className={`${inputBaseStyle} resize-none`}
              />
            </div>

            {/* Días de la semana - solo para horarios */}
            {tipoProgramacion === 'horario' && (
              <div>
                <FormLabel>
                  <span className="text-red-500">*</span> Días de la Semana
                </FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day) => (
                    <label key={day} className="flex items-center gap-2 text-sm p-2 border border-gray-200 rounded-lg hover:bg-yellow-50">
                      <input
                        type="checkbox"
                        name="day"
                        value={day}
                        checked={daysOfWeek.includes(day)}
                        onChange={handleDaysOfWeekChange}
                        className="text-yellow-500 focus:ring-yellow-400"
                      />
                      <span className="font-medium">{day}</span>
                    </label>
                  ))}
                </div>
                {errors.daysOfWeek && (
                  <p className="text-red-500 text-sm mt-1">❌ {errors.daysOfWeek}</p>
                )}
              </div>
            )}
          </FormSection>


          {/* Acciones */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-conv3r-dark bg-conv3r-gold hover:brightness-95 transition-transform hover:scale-105"
            >
              Crear Programación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LaborSchedulingShiftModal;