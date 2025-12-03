import React from 'react';
import { FaTimes, FaIdCard, FaEnvelope, FaPhone, FaUserShield, FaToggleOn, FaUser, FaHistory } from 'react-icons/fa';

const InfoCard = ({ icon, label, value }) => (
  <div className="flex items-start gap-2 text-sm"> {/* Cambiado de gap-3 a gap-2 */}
    <div className="text-gray-400 mt-0.5">{icon}</div>
    <div className="flex  items-start ml-2">
      <span className="text-gray-500 font-medium">{label}</span>
      <p className="font-semibold text-gray-900 ml-2">{value}</p>
    </div>
  </div>
);


const UserDetailModal = ({ user, onClose }) => {
  if (!user) return null;

  const getStatusClass = (estado) => {
    return estado === 'Activo'
      ? 'bg-green-100 text-green-800'
      : estado === 'Inactivo'
        ? 'bg-yellow-100 text-red-800'
        : 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="fixed inset-0 bg-black/15 flex justify-center items-start z-50 p-4 pt-20" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <header className="flex justify-between items-center py-3 px-3 border-b bg-white rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.nombre} {user.apellido}</h2>
            <p className="text-sm text-gray-500 mt-1 text-left">ID: {user.id_usuario}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl p-2 rounded-full">
            <FaTimes />
          </button>
        </header>

        {/* Contenido */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50">

          {/* Tarjeta izquierda */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-1">
              <FaUser className="text-blue-500" /> Información del Usuario
            </h3>
            <InfoCard icon={<FaIdCard />} label="Tipo de Documento" value={user.tipo_documento} />
            <InfoCard icon={<FaIdCard />} label="Documento" value={user.documento} />
            <InfoCard icon={<FaPhone />} label="Celular" value={user.celular} />
            <InfoCard icon={<FaEnvelope />} label="Correo" value={user.correo} />
          </div>

          {/* Tarjeta derecha: Rol */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaUserShield className="text-purple-500" /> Rol
              </h3>
              <InfoCard icon={<FaUserShield />} label="Rol" value={user.rol?.nombre_rol || 'Sin rol'} />
              <InfoCard icon={<FaHistory />} label="Fecha de Creación" value={new Date(user.fecha_creacion).toLocaleDateString('es-ES')} />

              {/* Información adicional del rol si está disponible */}
              {user.rol?.descripcion && (
                <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2 font-medium text-left">Descripción del Rol:</p>
                  <p className="text-sm text-gray-800 break-words whitespace-pre-line text-left">
                    {user.rol.descripcion}
                  </p>
                </div>
              )}

            </div>

            {/* Tarjeta Estado */}
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-3 space-y-5">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaToggleOn className="text-green-500" /> Estado
              </h3>
              <InfoCard
                icon={<FaToggleOn />}
                label="Estado"
                value={
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(user.estado_usuario)}`}>
                    {user.estado_usuario}
                  </span>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
