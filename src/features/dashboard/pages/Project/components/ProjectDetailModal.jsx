// src/features/dashboard/pages/project/components/ProjectDetailModal.jsx

import React from 'react';
import { 
  FaTimes, FaUser, FaCalendar, FaFlag, FaDollarSign, FaTools, 
  FaCogs, FaClipboardList, FaInfoCircle, FaMapMarkerAlt, FaExclamationTriangle, FaUsers, FaCommentDots 
} from 'react-icons/fa';

const DetailCard = ({ title, icon, children, className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
      {icon}
      <span>{title}</span>
    </h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const InfoRow = ({ icon, label, children }) => (
  <div className="flex items-start gap-3 text-sm">
    <div className="text-gray-400 mt-0.5">{icon}</div>
    <div className="flex-1">
      <span className="text-gray-500">{label}:</span>
      <p className="font-semibold text-gray-900">{children}</p>
    </div>
  </div>
);

const ProjectDetailModal = ({ project, onClose, onEdit }) => {
  if (!project) return null;

  const costoMateriales = (project.materiales ?? []).reduce((sum, item) => sum + (item.cantidad * item.precio), 0);
  const costoServicios = (project.servicios ?? []).reduce((sum, item) => sum + (item.cantidad * item.precio), 0);
  const manoDeObra = project.costos?.manoDeObra ?? 0;
  const costoTotal = costoMateriales + costoServicios + manoDeObra;

  const formatCurrency = (value) => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Media': return 'bg-orange-100 text-orange-800';
      case 'Baja': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-16 md:pt-24" onClick={onClose}>
      <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 sm:p-6 border-b bg-white rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.nombre}</h2>
            <p className="text-md text-gray-600">Cliente: {project.cliente}</p>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={() => onEdit && onEdit(project)} className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-semibold rounded-lg text-sm transition-colors">Editar</button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl p-2 rounded-full">
              <FaTimes />
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Columna izquierda (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              <DetailCard title="Descripción del Proyecto" icon={<FaClipboardList className="text-blue-500" />}>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {project.descripcion || 'No hay descripción disponible.'}
                </p>
              </DetailCard>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <DetailCard title="Materiales y Equipos" icon={<FaTools className="text-green-500" />}>
                  {(project.materiales ?? []).length > 0 ? (
                    <ul className="text-sm space-y-2">
                      {project.materiales.map(mat => (
                        <li key={mat.item} className="flex justify-between items-center text-gray-700">
                          <span>{mat.item} <span className="text-gray-500">(x{mat.cantidad})</span></span>
                          <span className="font-semibold text-gray-800">{formatCurrency(mat.cantidad * mat.precio)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No hay materiales registrados.</p>
                  )}
                </DetailCard>

                <DetailCard title="Servicios Incluidos" icon={<FaCogs className="text-purple-500" />}>
                  {(project.servicios ?? []).length > 0 ? (
                    <ul className="text-sm space-y-2">
                      {project.servicios.map(serv => (
                        <li key={serv.servicio} className="flex justify-between items-center text-gray-700">
                          <span>{serv.servicio} <span className="text-gray-500">(x{serv.cantidad})</span></span>
                          <span className="font-semibold text-gray-800">{formatCurrency(serv.cantidad * serv.precio)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No hay servicios registrados.</p>
                  )}
                </DetailCard>
              </div>

              {/* SECCIÓN DE SEDES Y DISTRIBUCIÓN DE MATERIALES */}
              {Array.isArray(project.sedes) && project.sedes.length > 0 && (
                <DetailCard title="Sedes y Distribución de Materiales" icon={<FaMapMarkerAlt className="text-blue-500" />}>
                  <div className="space-y-4">
                    {/* Mostrar resumen de materiales asignados al proyecto */}
                    {Array.isArray(project.materiales) && project.materiales.length > 0 && (
                      <div className="mb-2">
                        <span className="font-semibold">Materiales asignados al proyecto:</span>
                        <ul className="ml-2 list-disc">
                          {project.materiales.map((mat, i) => (
                            <li key={i}>{mat.item}: <span className="font-bold">{mat.cantidad}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Mostrar distribución por sede */}
                    {project.sedes.map((sede, idx) => (
                      <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                        <div className="font-bold text-md text-gray-800">{sede.nombre}</div>
                        <div className="text-gray-600 text-sm mb-1">Ubicación: {sede.ubicacion || <span className='italic text-gray-400'>No especificada</span>}</div>
                        <div className="text-sm">
                          <span className="font-semibold">Materiales asignados a esta sede:</span>
                          {Array.isArray(sede.materialesAsignados) && sede.materialesAsignados.length > 0 ? (
                            <ul className="ml-2 list-disc">
                              {sede.materialesAsignados.map((mat, i) => (
                                <li key={i}>{mat.item}: <span className="font-bold">{mat.cantidad}</span></li>
                              ))}
                            </ul>
                          ) : (
                            <span className="ml-2 text-gray-400 italic">Ninguno</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </DetailCard>
              )}

              <DetailCard title="Costos y Presupuesto" icon={<FaDollarSign className="text-red-500" />}>
                <ul className="text-sm space-y-3 text-gray-700">
                  <li className="flex justify-between"><span>Materiales</span> <span>{formatCurrency(costoMateriales)}</span></li>
                  <li className="flex justify-between"><span>Servicios</span> <span>{formatCurrency(costoServicios)}</span></li>
                  <li className="flex justify-between"><span>Mano de Obra</span> <span>{formatCurrency(manoDeObra)}</span></li>
                  <li className="flex justify-between border-t-2 border-dashed pt-3 mt-3 font-bold text-lg text-gray-900">
                    <span>Total Estimado</span>
                    <span>{formatCurrency(costoTotal)}</span>
                  </li>
                </ul>
              </DetailCard>
            </div>

            {/* Columna derecha (1/3) */}
            <div className="space-y-6 flex flex-col">
              {/* Equipo asignado */}
              <DetailCard title="Equipo Asignado" icon={<FaUsers className="text-teal-500" />}>
                <div className="flex flex-col gap-3">
                  {(project.empleadosAsociados ?? []).slice(0, 3).map((empleado, idx) => (
                    <div key={empleado.nombre || empleado} className="flex items-center gap-2">
                      <img
                        className="rounded-full object-cover w-9 h-9"
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${empleado.avatarSeed || empleado}`}
                        alt={empleado.nombre || empleado}
                      />
                      <span className="text-sm font-medium text-gray-800 truncate">{empleado.nombre || empleado}</span>
                    </div>
                  ))}
                  {(project.empleadosAsociados?.length || 0) > 3 && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-bold text-lg">+{project.empleadosAsociados.length - 3}</span>
                      <span className="text-xs text-gray-500">más</span>
                    </div>
                  )}
                </div>
              </DetailCard>

              <DetailCard title="Información General" icon={<FaInfoCircle className="text-gray-500" />}>
                <InfoRow icon={<FaUser />} label="Responsable">{project.responsable?.nombre}</InfoRow>
                <InfoRow icon={<FaCalendar />} label="Inicio">{project.fechaInicio}</InfoRow>
                <InfoRow icon={<FaCalendar />} label="Fin">{project.fechaFin}</InfoRow>
                <InfoRow icon={<FaFlag />} label="Estado">{project.estado}</InfoRow>
                <InfoRow icon={<FaExclamationTriangle />} label="Prioridad">
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getPriorityClass(project.prioridad)}`}>
                    {project.prioridad}
                  </span>
                </InfoRow>
                <InfoRow icon={<FaMapMarkerAlt />} label="Ubicación">{project.ubicacion}</InfoRow>
              </DetailCard>

              <DetailCard title="Observaciones" icon={<FaCommentDots className="text-indigo-500" />}>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {project.observaciones || 'No hay observaciones registradas.'}
                </p>
              </DetailCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
