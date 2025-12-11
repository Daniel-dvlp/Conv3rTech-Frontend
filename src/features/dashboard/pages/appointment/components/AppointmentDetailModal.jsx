import React from "react";
import { FaTimes, FaEdit, FaTrash, FaUser, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaTools, FaUserTie } from "react-icons/fa";
import { usePermissions } from '../../../../../shared/hooks/usePermissions';

const AppointmentDetailModal = ({ isOpen, onClose, appointment, onEdit, onDelete }) => {
  const { canDelete } = usePermissions();
  if (!isOpen || !appointment) return null;

  const {
    cliente,
    telefono,
    servicio,
    direccion,
    fechaHora,
    encargado,
    start,
    end,
    estado // Assuming we might want to show status too
  } = appointment;

  const formatDateTime = (input) => {
    if (!input) return "No disponible";
    const date = typeof input === "string" ? new Date(input) : input;
    if (isNaN(date.getTime())) return "Fecha inválida";
    return date.toLocaleString("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const fechaFormateada = formatDateTime(fechaHora || start);
  const fechaFinFormateada = end ? formatDateTime(end) : null;

  const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="mt-1 p-2 bg-white rounded-full shadow-sm text-blue-600">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-gray-900 font-medium mt-0.5">{value || "No especificado"}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Detalles de la Cita</h2>
            <p className="text-sm text-gray-500 mt-1">Información completa del servicio</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailItem icon={FaUser} label="Cliente" value={cliente} />
            <DetailItem icon={FaPhone} label="Teléfono" value={telefono} />
            
            <DetailItem icon={FaTools} label="Servicio" value={servicio} />
            <DetailItem icon={FaUserTie} label="Técnico Encargado" value={encargado} />
            
            <div className="md:col-span-2">
                <DetailItem icon={FaMapMarkerAlt} label="Dirección" value={direccion} />
            </div>

            <DetailItem icon={FaCalendarAlt} label="Inicio" value={fechaFormateada} />
            {fechaFinFormateada && (
              <DetailItem icon={FaCalendarAlt} label="Fin" value={fechaFinFormateada} />
            )}
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          {canDelete('citas') && (
            <button
              onClick={onDelete}
              className="flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <FaTrash size={14} /> Eliminar
            </button>
          )}
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-md"
          >
            <FaEdit size={14} /> Editar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
