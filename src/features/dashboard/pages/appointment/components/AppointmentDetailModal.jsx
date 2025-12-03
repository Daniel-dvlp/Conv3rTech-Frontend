import React from "react";

const AppointmentDetailModal = ({ isOpen, onClose, appointment, onEdit, onDelete }) => {
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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 w-[95%] max-w-sm shadow-2xl border border-gray-100">
        <h3 className="text-xl font-bold mb-4 text-center text-[#00012A]">
          Información de la cita
        </h3>

        <div className="space-y-2 text-sm text-[#00012A]">
          <p><strong>Nombre del cliente:</strong> {cliente}</p>
          <p><strong>Teléfono del cliente:</strong> {telefono}</p>
          <p><strong>Servicio a realizar:</strong> {servicio}</p>
          <p><strong>Dirección del servicio:</strong> {direccion}</p>
          <p><strong>Fecha y hora:</strong> {fechaFormateada}</p>
          {fechaFinFormateada && (
            <p><strong>Finaliza:</strong> {fechaFinFormateada}</p>
          )}
          <p><strong>Encargado:</strong> {encargado}</p>
        </div>

        <div className="mt-6 flex justify-between gap-3">
          <button
            onClick={onEdit}
            className="bg-yellow-400 text-[#00012A] px-4 py-2 rounded-xl hover:bg-yellow-500 transition w-full"
          >
            Editar
          </button>
          <button
            onClick={onDelete}
            className="bg-red-400 text-white px-4 py-2 rounded-xl hover:bg-red-500 transition w-full"
          >
            Eliminar
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="bg-gray-200 text-[#00012A] px-4 py-2 rounded-xl hover:bg-gray-300 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
