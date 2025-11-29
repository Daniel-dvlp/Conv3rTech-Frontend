import React, { useEffect, useMemo, useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaCheck, FaTimes } from 'react-icons/fa';
import { usersService } from '../../../../../services';

const CreateNovedadModal = ({ isOpen, onClose, onSave, initialData }) => {
    const isEditing = Boolean(initialData?.id);
    const [step, setStep] = useState(isEditing ? 2 : 1);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        usuarioIds: [],
        titulo: '',
        descripcion: '',
        color: '#10B981',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: '',
        allDay: false,
        horaInicio: '09:00',
        horaFin: '17:00',
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
                color: initialData.color || '#10B981',
                fechaInicio: initialData.fechaInicio || new Date().toISOString().split('T')[0],
                fechaFin: initialData.fechaFin || '',
                allDay: !!initialData.allDay,
                horaInicio: initialData.horaInicio || '09:00',
                horaFin: initialData.horaFin || '17:00',
            });
        } else {
            setFormData({
                usuarioIds: [],
                titulo: '',
                descripcion: '',
                color: '#10B981',
                fechaInicio: new Date().toISOString().split('T')[0],
                fechaFin: '',
                allDay: false,
                horaInicio: '09:00',
                horaFin: '17:00',
            });
        }
    };

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await usersService.getAllUsers();
            const list = Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                    ? response.data
                    : response?.users || [];
            setUsers(list);
        } catch (error) {
            console.error('Error loading users', error);
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

    const handleSubmit = () => {
        if (!formData.usuarioIds.length) {
            alert('Seleccione al menos un usuario');
            return;
        }
        if (!formData.titulo) {
            alert('Ingrese un título');
            return;
        }
        if (!formData.fechaInicio) {
            alert('Ingrese la fecha de inicio');
            return;
        }
        if (!formData.allDay) {
            if (!formData.horaInicio || !formData.horaFin) {
                alert('Defina horario de inicio y fin');
                return;
            }
            if (formData.horaInicio >= formData.horaFin) {
                alert('La hora fin debe ser mayor a la hora inicio');
                return;
            }
        }

        const payload = {
            usuarioIds: formData.usuarioIds,
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            color: formData.color,
            fechaInicio: formData.fechaInicio,
            fechaFin: formData.fechaFin || null,
            allDay: formData.allDay,
            horaInicio: formData.allDay ? null : formData.horaInicio,
            horaFin: formData.allDay ? null : formData.horaFin,
        };
        onSave(payload);
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Editar Novedad' : 'Nueva Novedad'}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-green-600' : 'bg-gray-300'}`} />
                            <div className={`h-1 w-8 rounded-full ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`} />
                            <div className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`} />
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
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
                                                            setFormData((prev) => ({ ...prev, usuarioIds: filteredUsers.map((u) => u.id_usuario) }));
                                                        } else {
                                                            setFormData((prev) => ({ ...prev, usuarioIds: [] }));
                                                        }
                                                    }}
                                                    checked={
                                                        filteredUsers.length > 0 &&
                                                        filteredUsers.every((u) => formData.usuarioIds.includes(u.id_usuario))
                                                    }
                                                    className="text-green-600 focus:ring-green-500"
                                                />
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredUsers.map((user) => (
                                            <tr
                                                key={user.id_usuario}
                                                className={`hover:bg-green-50 cursor-pointer ${formData.usuarioIds.includes(user.id_usuario) ? 'bg-green-50' : ''
                                                    }`}
                                                onClick={() => handleUserToggle(user.id_usuario)}
                                            >
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        readOnly
                                                        checked={formData.usuarioIds.includes(user.id_usuario)}
                                                        className="rounded text-green-600 focus:ring-green-500"
                                                    />
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
                            <div className="p-4 border border-green-100 rounded-lg bg-green-50 text-sm text-gray-700">
                                {initialData?.usuario
                                    ? `${initialData.usuario.nombre} ${initialData.usuario.apellido} - ${initialData.usuario.documento || 'Sin documento'}`
                                    : 'Usuario no disponible'}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-700">2. Información de la Novedad</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                        <input
                                            type="text"
                                            value={formData.titulo}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            placeholder="Ej. Permiso médico"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'].map((c) => (
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
                                        <input
                                            type="date"
                                            value={formData.fechaInicio}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, fechaInicio: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin (opcional)</label>
                                        <input
                                            type="date"
                                            value={formData.fechaFin || ''}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, fechaFin: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="allDay"
                                    checked={formData.allDay}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, allDay: e.target.checked }))}
                                    className="rounded text-green-600 focus:ring-green-500"
                                />
                                <label htmlFor="allDay" className="text-sm text-gray-700">Todo el día</label>
                            </div>
                            {!formData.allDay && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500">Hora inicio</label>
                                        <input
                                            type="time"
                                            value={formData.horaInicio}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, horaInicio: e.target.value }))}
                                            className="w-full px-2 py-1 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500">Hora fin</label>
                                        <input
                                            type="time"
                                            value={formData.horaFin}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, horaFin: e.target.value }))}
                                            className="w-full px-2 py-1 border border-gray-300 rounded"
                                        />
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Observaciones</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none h-24"
                                    placeholder="Detalles adicionales..."
                                />
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

                    {step < 2 ? (
                        <button
                            onClick={() => {
                                if (step === 1 && !formData.usuarioIds.length) {
                                    alert('Seleccione al menos un usuario');
                                    return;
                                }
                                setStep(step + 1);
                            }}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
                        >
                            Siguiente <FaArrowRight />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
                        >
                            <FaCheck /> Guardar Novedad
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateNovedadModal;

