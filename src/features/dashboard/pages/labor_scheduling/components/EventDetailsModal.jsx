import React from 'react';
import { FaTimes, FaTrash, FaBan, FaCalendarAlt, FaUser, FaIdCard, FaClock, FaInfoCircle } from 'react-icons/fa';

const EventDetailsModal = ({ isOpen, onClose, event, onAnnul, onDelete, canManage }) => {
    if (!isOpen || !event) return null;

    const {
        title,
        start,
        end,
        extendedProps = {}
    } = event;

    const meta = extendedProps.meta || {};
    const type = extendedProps.type; // 'programacion' or 'novedad'
    const isAnnulled = meta.estado === 'Anulada';
    const user = meta.usuario || {};

    // Formatting helpers
    const formatDate = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatTime = (date) => {
        if (!date) return '';
        // Force 12-hour format with AM/PM
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-fade-in-up">
                
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span 
                            className={`w-3 h-3 rounded-full ${isAnnulled ? 'bg-red-500' : 'bg-green-500'}`}
                        />
                        Detalles del Evento
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    
                    {/* Title & Status */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                isAnnulled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                                {type === 'programacion' ? 'Programación' : 'Novedad'} - {meta.estado || 'Activo'}
                            </span>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="grid grid-cols-1 gap-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full text-blue-600 shadow-sm">
                                <FaUser />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Usuario</p>
                                <p className="text-sm font-medium text-gray-900">{user.nombre} {user.apellido}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full text-blue-600 shadow-sm">
                                <FaIdCard />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Tipo Documento</p>
                                <p className="text-sm font-medium text-gray-900">{user.tipo_documento || 'CC'} - {user.documento || 'No registrado'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 flex items-center gap-3">
                            <FaCalendarAlt className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Fecha</p>
                                <p className="text-sm text-gray-700 capitalize">{formatDate(start)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <FaClock className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Hora Inicio</p>
                                <p className="text-sm text-gray-700">{event.allDay ? 'Todo el día' : formatTime(start)}</p>
                            </div>
                        </div>
                        {!event.allDay && (
                            <div className="flex items-center gap-3">
                                <FaClock className="text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Hora Fin</p>
                                    <p className="text-sm text-gray-700">{formatTime(end)}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {meta.descripcion && (
                        <div className="border-t border-gray-100 pt-4">
                            <div className="flex items-start gap-2">
                                <FaInfoCircle className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Observaciones</p>
                                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
                                        {meta.descripcion}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Annulment Reason */}
                    {isAnnulled && meta.motivoAnulacion && (
                        <div className="border-t border-red-100 pt-4 bg-red-50 p-4 rounded-lg">
                             <p className="text-xs text-red-500 uppercase font-semibold mb-1">Motivo Anulación</p>
                             <p className="text-sm text-red-700">{meta.motivoAnulacion}</p>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                    {canManage && !isAnnulled && type === 'programacion' && (
                        <button
                            onClick={() => onAnnul(event)}
                            className="flex items-center gap-2 px-4 py-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors text-sm font-medium border border-amber-200"
                        >
                            <FaBan /> Anular
                        </button>
                    )}
                    
                    {canManage && (
                        <button
                            onClick={() => onDelete(event)}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium border border-red-200"
                        >
                            <FaTrash /> Eliminar
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsModal;
