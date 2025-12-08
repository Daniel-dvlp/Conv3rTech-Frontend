import React, { useEffect, useMemo, useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaCheck, FaTimes } from 'react-icons/fa';
import usersService from '../../../../../services/usersService';
import laborSchedulingService from '../../../../../services/laborSchedulingService';
import { showToast } from '../../../../../shared/utils/alertas';

const CreateNovedadModal = ({ isOpen, onClose, onSave, onSuccess, initialData, initialDate }) => {
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
    }, [isOpen, initialData, initialDate]);

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
                horaInicio: initialData.horaInicio ? initialData.horaInicio.substring(0, 5) : '09:00',
                horaFin: initialData.horaFin ? initialData.horaFin.substring(0, 5) : '17:00',
            });
        } else {
            setFormData({
                usuarioIds: [],
                titulo: '',
                descripcion: '',
                color: '#10B981',
                fechaInicio: initialDate ? initialDate.split('T')[0] : new Date().toISOString().split('T')[0],
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
            
            const activeUsers = list.filter(user => user.estado_usuario === 'Activo');
            
            // Normalize IDs
            const normalized = activeUsers.map(u => ({
                ...u,
                id: u.id_usuario ?? u.id ?? u.idUsuario
            }));
            
            setUsers(normalized);
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

    const handleSubmit = async () => {
        if (!formData.usuarioIds.length) {
            showToast('Seleccione al menos un usuario', 'warning');
            return;
        }
        if (!formData.titulo) {
            showToast('Ingrese un título', 'warning');
            return;
        }
        if (!formData.fechaInicio) {
            showToast('Ingrese la fecha de inicio', 'warning');
            return;
        }
        if (formData.fechaFin && formData.fechaFin < formData.fechaInicio) {
            showToast('La fecha fin no puede ser anterior a la fecha inicio', 'error');
            return;
        }
        const isHexColor = /^#[0-9A-F]{6}$/i.test(formData.color);
        if (!isHexColor) {
            showToast('El color debe tener formato #RRGGBB', 'error');
            return;
        }
        if (!formData.allDay) {
            if (!formData.horaInicio || !formData.horaFin) {
                showToast('Defina horario de inicio y fin', 'warning');
                return;
            }
            if (formData.horaInicio >= formData.horaFin) {
                showToast('La hora fin debe ser mayor a la hora inicio', 'error');
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

        if (onSave) {
            onSave(payload);
        } else {
            try {
                setLoading(true);
                if (isEditing) {
                    await laborSchedulingService.updateNovedad(initialData.id, payload);
                    showToast('Novedad actualizada correctamente', 'success');
                } else {
                    await laborSchedulingService.createNovedad(payload);
                    showToast('Novedad creada correctamente', 'success');
                }
                if (onSuccess) onSuccess();
            } catch (error) {
                console.error('Error saving novedad', error);
                showToast('Error al guardar la novedad', 'error');
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
                                                            setFormData((prev) => ({ ...prev, usuarioIds: filteredUsers.map((u) => u.id) }));
                                                        } else {
                                                            setFormData((prev) => ({ ...prev, usuarioIds: [] }));
                                                        }
                                                    }}
                                                    checked={
                                                        filteredUsers.length > 0 &&
                                                        filteredUsers.every((u) => formData.usuarioIds.includes(u.id))
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
                                                key={user.id}
                                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                                onClick={() => handleUserToggle(user.id)}
                                            >
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.usuarioIds.includes(user.id)}
                                                        onChange={() => handleUserToggle(user.id)}
                                                        className="text-green-600 focus:ring-green-500"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-700">{user.nombre} {user.apellido}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500">{user.documento}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {(isEditing || step === 2) && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-700">2. Detalles de la Novedad</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                        <input
                                            type="text"
                                            value={formData.titulo}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            placeholder="Ej: Permiso médico, Vacaciones..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1'].map((c) => (
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                                        <input
                                            type="date"
                                            value={formData.fechaInicio}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, fechaInicio: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin (Opcional)</label>
                                        <input
                                            type="date"
                                            value={formData.fechaFin}
                                            min={formData.fechaInicio}
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
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <label htmlFor="allDay" className="text-sm font-medium text-gray-700">Todo el día</label>
                            </div>

                            {!formData.allDay && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                                        <input
                                            type="time"
                                            value={formData.horaInicio}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, horaInicio: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                                        <input
                                            type="time"
                                            value={formData.horaFin}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, horaFin: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
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
                    {step > 1 && !isEditing ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                        >
                            <FaArrowLeft /> Atrás
                        </button>
                    ) : (
                        <div />
                    )}

                    {!isEditing && step === 1 ? (
                        <button
                            onClick={() => {
                                if (!formData.usuarioIds.length) {
                                    showToast('Seleccione al menos un usuario', 'warning');
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
                            disabled={loading}
                            className={`flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Guardando...' : <><FaCheck /> Guardar Novedad</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateNovedadModal;
