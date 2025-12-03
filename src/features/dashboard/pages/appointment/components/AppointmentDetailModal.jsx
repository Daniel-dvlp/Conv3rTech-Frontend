import React from "react";
import { canDeleteAppointment } from "../utils/AppointmentHelpers";

const AppointmentDetailModal = ({ isOpen, onClose, appointment, onEdit, onDelete }) => {
  if (!isOpen || !appointment) return null;

  const {
    cliente,
    telefono,
    servicio,
    direccion,
    fecha,
    hora_inicio,
    hora_fin,
    encargado,
    observaciones,
    estado,
  } = appointment;

  const formatDateTime = (fecha, hora) => {
    if (!fecha || !hora) return "No disponible";
    
    try {
      const dateObj = new Date(`${fecha}T${hora}`);
      return dateObj.toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const getStatusBadge = (estado) => {
    const styles = {
      Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Confirmada: "bg-blue-100 text-blue-800 border-blue-300",
      Cancelada: "bg-red-100 text-red-800 border-red-300",
      Completada: "bg-green-100 text-green-800 border-green-300",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${styles[estado] || 'bg-gray-100 text-gray-800'}`}>
        {estado}
      </span>
    );
  };

  const canDelete = canDeleteAppointment(fecha, hora_inicio);
  const canEdit = !["Completada", "Cancelada"].includes(estado);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 w-[95%] max-w-md shadow-2xl border border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-[#00012A]">
            Detalles de la cita
          </h3>
          {getStatusBadge(estado)}
        </div>

        <div className="space-y-3 text-sm text-[#00012A]">
          <div>
            <p className="font-semibold text-gray-600">Cliente</p>
            <p className="text-base">{cliente}</p>
            {telefono && <p className="text-gray-500">📞 {telefono}</p>}
          </div>

          <div>
            <p className="font-semibold text-gray-600">Servicio</p>
            <p className="text-base">{servicio}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-600">Encargado</p>
            <p className="text-base">{encargado}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-600">Dirección</p>
            <p className="text-base">{direccion}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="font-semibold text-gray-600">Inicio</p>
              <p className="text-base">{formatDateTime(fecha, hora_inicio)}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Fin</p>
              <p className="text-base">{formatDateTime(fecha, hora_fin)}</p>
            </div>
          </div>

          {observaciones && (
            <div>
              <p className="font-semibold text-gray-600">Observaciones</p>
              <p className="text-base bg-gray-50 p-2 rounded">{observaciones}</p>
            </div>
          )}
        </div>

        {!canDelete && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs text-orange-800">
              ⚠️ Esta cita no puede ser eliminada porque faltan menos de 3 horas para su realización.
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-between gap-3">
          {canEdit && (
            <button
              onClick={onEdit}
              className="bg-yellow-400 text-[#00012A] px-4 py-2 rounded-xl hover:bg-yellow-500 transition w-full font-semibold"
            >
              Editar
            </button>
          )}
          <button
            onClick={onDelete}
            disabled={!canDelete}
            className={`px-4 py-2 rounded-xl transition w-full font-semibold ${
              canDelete
                ? "bg-red-400 text-white hover:bg-red-500"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Eliminar
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="bg-gray-200 text-[#00012A] px-6 py-2 rounded-xl hover:bg-gray-300 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
