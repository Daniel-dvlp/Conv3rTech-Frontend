import React, { useEffect, useMemo, useState } from 'react';
import {
    FaArrowLeft,
    FaArrowRight,
    FaCheck,
    FaPlus,
    FaTimes,
    FaTrash
} from 'react-icons/fa';
import laborSchedulingService from '../../../../../services/laborSchedulingService';
import usersService from '../../../../../services/usersService';

const DEFAULT_DAYS = {
    lunes: [],
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: [],
    sabado: [],
    domingo: [],
};

const dayLabels = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

const NewScheduleModal = ({ isOpen, onClose, onSave, onSuccess, initialData }) => {
    const isEditing = Boolean(initialData?.id);
    const [step, setStep] = useState(isEditing ? 2 : 1);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        usuarioIds: [],
        titulo: '',
        descripcion: '',
        color: '#3B82F6',
        fechaInicio: new Date().toISOString().split('T')[0],
        dias: { ...DEFAULT_DAYS },
    });

    useEffect(() => {
        if (!isOpen) return;
        setStep(isEditing ? 2 : 1);
        initializeForm();
        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialData]);

    const initializeForm = () => {
        if (isEditing && initialData) {
            setFormData({
                usuarioIds: initialData.usuarioId ? [initialData.usuarioId] : [],
                titulo: initialData.titulo || '',
                descripcion: initialData.descripcion || '',
                color: initialData.color || '#3B82F6',
                fechaInicio: initialData.fechaInicio || new Date().toISOString().split('T')[0],
                dias: initialData.dias || { ...DEFAULT_DAYS },
            });
        } else {
            setFormData({
                usuarioIds: [],
                titulo: '',
                descripcion: '',
                color: '#3B82F6',
                fechaInicio: new Date().toISOString().split('T')[0],
                dias: {
                    ...DEFAULT_DAYS,
                    lunes: [{ horaInicio: '09:00', horaFin: '17:00', subtitulo: '' }],
                    martes: [{ horaInicio: '09:00', horaFin: '17:00', subtitulo: '' }],
                    miercoles: [{ horaInicio: '09:00', horaFin: '17:00', subtitulo: '' }],
                    jueves: [{ horaInicio: '09:00', horaFin: '17:00', subtitulo: '' }],
                    viernes: [{ horaInicio: '09:00', horaFin: '17:00', subtitulo: '' }],
                },
            });
        }
    };

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await usersService.getAllUsers();
            let list = [];
            if (Array.isArray(response)) list = response;
            else if (Array.isArray(response?.data)) list = response.data;
            else if (Array.isArray(response?.users)) list = response.users;

            const activeUsers = (list || []).filter(user => user.estado_usuario === 'Activo');

            const normalized = activeUsers.map((user) => ({
                id: user.id ?? user.id_usuario,
                nombre: user.nombre,
                apellido: user.apellido,
                documento: user.documento,
            }));

            setUsers(normalized);
        } catch (error) {
            console.error('Error cargando usuarios', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserToggle = (userId) => {
        if (isEditing) return;
        setFormData((prev) => {
            const nextIds = prev.usuarioIds.includes(userId)
                ? prev.usuarioIds.filter((id) => id !== userId)
                : [...prev.usuarioIds, userId];
            return { ...prev, usuarioIds: nextIds };
        });
    };

    const handleDaySlotChange = (day, index, field, value) => {
        setFormData((prev) => {
            const updatedDays = { ...prev.dias };
            const slots = [...(updatedDays[day] || [])];
            slots[index] = { ...slots[index], [field]: value };
            updatedDays[day] = slots;
            return { ...prev, dias: updatedDays };
        });
    };

    const addSlot = (day) => {
        setFormData((prev) => {
            const updatedDays = { ...prev.dias };
            const slots = [...(updatedDays[day] || [])];
            slots.push({ horaInicio: '09:00', horaFin: '17:00', subtitulo: '' });
            updatedDays[day] = slots;
            return { ...prev, dias: updatedDays };
        });
    };

    const removeSlot = (day, index) => {
        setFormData((prev) => {
            const updatedDays = { ...prev.dias };
            const slots = (updatedDays[day] || []).filter((_, idx) => idx !== index);
            updatedDays[day] = slots;
            return { ...prev, dias: updatedDays };
        });
    };

    const handleSubmit = async () => {
        if (!formData.titulo) {
            alert('El título es obligatorio');
            return;
        }

        console.log('[NewScheduleModal] Submitting with formData:', formData);
        
        const payload = {
            usuarioIds: formData.usuarioIds,
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            color: formData.color,
            fechaInicio: formData.fechaInicio,
            dias: formData.dias,
        };
        
        console.log('[NewScheduleModal] Final payload:', payload);

        if (onSave) {
            onSave(payload);
        } else {
            // Default submit logic if onSave is not provided (or use onSuccess)
            try {
                setLoading(true);
                await laborSchedulingService.createRecurringSchedule(payload);
                if (onSuccess) onSuccess();
            } catch (error) {
                console.error('Error creating schedule', error);
                alert('Error al crear la programación');
            } finally {
                setLoading(false);
            }
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const name = `${user.nombre} ${user.apellido}`.toLowerCase();
            return (
                name.includes(searchTerm.toLowerCase()) ||
                user.documento?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }, [users, searchTerm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {isEditing ? 'Editar Programación' : 'Nueva Programación (Recurrente)'}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                            <div className={`h-1 w-8 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                            <div className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                            <div className={`h-1 w-8 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                            <div className={`h-2 w-2 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {!isEditing && step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">1. Seleccionar Personal</h3>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o documento..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                <input
                                                    type="checkbox"
                                                    disabled={loading}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormData((prev) => ({ ...prev, usuarioIds: filteredUsers.map((u) => u.id) }));
                                                        } else {
                                                            setFormData((prev) => ({ ...prev, usuarioIds: [] }));
                                                        }
                                                    }}
                                                    checked={
                                                        filteredUsers.length > 0 &&
                                                        filteredUsers.every((u) => formData.usuarioIds.includes(u.id))
                                                    }
                                                />
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredUsers.map((user) => (
                                            <tr
                                                key={user.id}
                                                className={`hover:bg-blue-50 cursor-pointer ${formData.usuarioIds.includes(user.id) ? 'bg-blue-50' : ''
                                                    }`}
                                                onClick={() => handleUserToggle(user.id)}
                                            >
                                                <td className="px-4 py-3">
                                                    <input type="checkbox" readOnly checked={formData.usuarioIds.includes(user.id)} />
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                    {user.nombre} {user.apellido}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{user.documento || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                                {formData.usuarioIds.length} usuario(s) seleccionado(s)
                            </div>
                        </div>
                    )}

                    {isEditing && step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">Empleado asignado</h3>
                            <div className="p-4 border border-blue-100 rounded-lg bg-blue-50 text-sm text-gray-700">
                                {initialData?.usuario
                                    ? `${initialData.usuario.nombre} ${initialData.usuario.apellido} - ${initialData.usuario.documento || 'Sin documento'}`
                                    : 'Usuario no disponible'}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 mt-4">
                            <h3 className="text-lg font-semibold text-gray-700">2. Información de la Programación</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                        <input
                                            type="text"
                                            value={formData.titulo}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Ej. Turno Mañana"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'].map((c) => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setFormData((prev) => ({ ...prev, color: c }))}
                                                    className={`w-8 h-8 rounded-full border-2 ${formData.color === c ? 'border-gray-800 scale-110' : 'border-transparent'
                                                        }`}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                                        <input
                                            type="date"
                                            value={formData.fechaInicio}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, fechaInicio: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Observaciones</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
                                    placeholder="Detalles adicionales..."
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 mt-4">
                            <h3 className="text-lg font-semibold text-gray-700">3. Definir Horarios Semanales</h3>
                            <p className="text-sm text-gray-500">Configure los bloques de tiempo para cada día de la semana.</p>
                            <div className="space-y-4">
                                {dayLabels.map((day) => (
                                    <div key={day} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-medium capitalize text-gray-800">{day}</h4>
                                            <button
                                                onClick={() => addSlot(day)}
                                                className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                <FaPlus size={10} /> Agregar Turno
                                            </button>
                                        </div>
                                        {!formData.dias[day] || formData.dias[day].length === 0 ? (
                                            <div className="text-xs text-gray-400 italic">Sin turnos asignados (Día libre)</div>
                                        ) : (
                                            <div className="space-y-2">
                                                {formData.dias[day].map((slot, idx) => (
                                                    <div key={`${day}-${idx}`} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200 shadow-sm">
                                                        <input
                                                            type="time"
                                                            value={slot.horaInicio}
                                                            onChange={(e) => handleDaySlotChange(day, idx, 'horaInicio', e.target.value)}
                                                            className="text-sm border border-gray-300 rounded px-1 py-0.5"
                                                        />
                                                        <span className="text-gray-400">-</span>
                                                        <input
                                                            type="time"
                                                            value={slot.horaFin}
                                                            onChange={(e) => handleDaySlotChange(day, idx, 'horaFin', e.target.value)}
                                                            className="text-sm border border-gray-300 rounded px-1 py-0.5"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Etiqueta (opcional)"
                                                            value={slot.subtitulo || ''}
                                                            onChange={(e) => handleDaySlotChange(day, idx, 'subtitulo', e.target.value)}
                                                            className="flex-1 text-sm border border-gray-300 rounded px-2 py-0.5"
                                                        />
                                                        <button
                                                            onClick={() => removeSlot(day, idx)}
                                                            className="text-red-400 hover:text-red-600 p-1"
                                                        >
                                                            <FaTrash size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                        >
                            <FaArrowLeft /> Atrás
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <button
                            onClick={() => {
                                if (step === 1 && !formData.usuarioIds.length) {
                                    alert('Seleccione al menos un usuario');
                                    return;
                                }
                                setStep(step + 1);
                            }}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                        >
                            Siguiente <FaArrowRight />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
                        >
                            <FaCheck /> Guardar Programación
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewScheduleModal;

