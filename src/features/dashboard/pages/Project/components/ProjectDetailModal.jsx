// src/features/dashboard/pages/project/components/ProjectDetailModal.jsx

import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaUser,
  FaCalendar,
  FaFlag,
  FaDollarSign,
  FaTools,
  FaCogs,
  FaClipboardList,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaUsers,
  FaCommentDots,
  FaHistory,
  FaHome,
  FaBuilding,
  FaCrown,
  FaRegSquare,
  FaCheckSquare,
} from "react-icons/fa";
import HistorialSalidasModal from "./HistorialSalidasModal";
import { showSuccess, showError } from "../../../../../shared/utils/alerts.js";

const DetailCard = ({ title, icon, children, className = "" }) => (
  <div
    className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}
  >
    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3 pb-3 border-b border-gray-100">
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      <span>{title}</span>
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const InfoRow = ({ icon, label, children }) => (
  <div className="flex items-start gap-3 text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
    <div className="text-gray-400 mt-0.5 p-1 bg-gray-100 rounded-full">
      {icon}
    </div>
    <div className="flex-1">
      <span className="text-gray-500 text-xs uppercase tracking-wide">
        {label}:
      </span>
      <p className="font-semibold text-gray-900">{children}</p>
    </div>
  </div>
);

const TabButton = ({ active, onClick, children, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
      active
        ? "bg-blue-600 text-white shadow-md"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    {icon}
    {children}
  </button>
);

const ProjectDetailModal = ({ project, onClose }) => {
  const [activeTab, setActiveTab] = useState("general");
  const [historialModalOpen, setHistorialModalOpen] = useState(false);
  const [selectedHistorialSedeIndex, setSelectedHistorialSedeIndex] =
    useState(null);
  // Local copy of sedes for offline UI updates
  const [localSedes, setLocalSedes] = useState(project?.sedes || []);

  useEffect(() => {
    setLocalSedes(project?.sedes || []);
  }, [project]);

  if (!project) return null;

  const costoMateriales = (project.materiales ?? []).reduce(
    (sum, item) => sum + item.cantidad * item.precio,
    0
  );
  const costoServicios = (project.servicios ?? []).reduce(
    (sum, item) => sum + item.cantidad * item.precio,
    0
  );
  const manoDeObra = project.costos?.manoDeObra ?? 0;
  const costoTotal = costoMateriales + costoServicios + manoDeObra;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Alta":
        return "bg-red-100 text-red-800";
      case "Media":
        return "bg-orange-100 text-orange-800";
      case "Baja":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleOpenHistorialModal = (sedeIndex) => {
    setSelectedHistorialSedeIndex(sedeIndex);
    setHistorialModalOpen(true);
  };

  const handleCloseHistorialModal = () => {
    setHistorialModalOpen(false);
    setSelectedHistorialSedeIndex(null);
  };

  // Función para marcar servicio como completado
  const handleMarkServiceCompleted = (sedeIndex, servIndex) => {
    setLocalSedes((prevSedes) =>
      prevSedes.map((sede, index) => {
        if (index === sedeIndex) {
          return {
            ...sede,
            serviciosAsignados: (sede.serviciosAsignados || []).map(
              (serv, idx) =>
                idx === servIndex
                  ? {
                      ...serv,
                      estado: "completado",
                      fechaCompletado: new Date().toISOString(),
                    }
                  : serv
            ),
          };
        }
        return sede;
      })
    );
    showSuccess("Estado cambiado: Completado");
  };

  // Función para marcar servicio como pendiente
  const handleMarkServicePending = (sedeIndex, servIndex) => {
    setLocalSedes((prevSedes) =>
      prevSedes.map((sede, index) => {
        if (index === sedeIndex) {
          return {
            ...sede,
            serviciosAsignados: (sede.serviciosAsignados || []).map(
              (serv, idx) =>
                idx === servIndex
                  ? { ...serv, estado: "pendiente", fechaCompletado: undefined }
                  : serv
            ),
          };
        }
        return sede;
      })
    );
    showSuccess("Estado cambiado: Pendiente");
  };

  // Generar pestañas dinámicamente
  const generateTabs = () => {
    const tabs = [
      {
        id: "general",
        label: "Información General",
        icon: <FaHome className="text-sm" />,
      },
    ];

    // Agregar pestañas para cada sede
    if (Array.isArray(project.sedes)) {
      project.sedes.forEach((sede, index) => {
        tabs.push({
          id: `sede-${index}`,
          label: sede.nombre,
          icon: <FaBuilding className="text-sm" />,
        });
      });
    }

    return tabs;
  };

  const tabs = generateTabs();

  // Renderizar contenido de la pestaña activa
  const renderTabContent = () => {
    if (activeTab === "general") {
      return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Columna principal (3/4) */}
          <div className="xl:col-span-3 space-y-6">
            {/* Primera fila: Descripción y Costos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DetailCard
                title="Descripción del Proyecto"
                icon={<FaClipboardList className="text-blue-500" />}
              >
                <p className="text-sm text-gray-700 leading-relaxed">
                  {project.descripcion || "No hay descripción disponible."}
                </p>
              </DetailCard>

              <DetailCard
                title="Costos y Presupuesto"
                icon={<FaDollarSign className="text-red-500" />}
              >
                <ul className="text-sm space-y-3 text-gray-700">
                  <li className="flex justify-between">
                    <span>Materiales</span>{" "}
                    <span>{formatCurrency(costoMateriales)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Servicios</span>{" "}
                    <span>{formatCurrency(costoServicios)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Mano de Obra</span>{" "}
                    <span>{formatCurrency(manoDeObra)}</span>
                  </li>
                  <li className="flex justify-between border-t-2 border-dashed pt-3 mt-3 font-bold text-lg text-gray-900">
                    <span>Total Estimado</span>
                    <span>{formatCurrency(costoTotal)}</span>
                  </li>
                </ul>
              </DetailCard>
            </div>

            {/* Segunda fila: Materiales y Servicios */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DetailCard
                title="Materiales y Equipos"
                icon={<FaTools className="text-green-500" />}
              >
                {(project.materiales ?? []).length > 0 ? (
                  <ul className="text-sm space-y-2">
                    {project.materiales.map((mat) => (
                      <li
                        key={mat.item}
                        className="flex justify-between items-center text-gray-700 p-2 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <FaTools className="text-green-500 text-xs" />
                          {mat.item}{" "}
                          <span className="text-gray-500">
                            (x{mat.cantidad})
                          </span>
                        </span>
                        <span className="font-semibold text-gray-800">
                          {formatCurrency(mat.cantidad * mat.precio)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No hay materiales registrados.
                  </p>
                )}
              </DetailCard>

              <DetailCard
                title="Servicios Incluidos"
                icon={<FaCogs className="text-purple-500" />}
              >
                {(project.servicios ?? []).length > 0 ? (
                  <ul className="text-sm space-y-2">
                    {project.servicios.map((serv) => (
                      <li
                        key={serv.servicio}
                        className="flex justify-between items-center text-gray-700 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <FaCogs className="text-purple-500 text-xs" />
                          {serv.servicio}{" "}
                          <span className="text-gray-500">
                            (x{serv.cantidad})
                          </span>
                        </span>
                        <span className="font-semibold text-gray-800">
                          {formatCurrency(serv.cantidad * serv.precio)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No hay servicios registrados.
                  </p>
                )}
              </DetailCard>
            </div>

            {/* Tercera fila: Equipo Asignado (Ocupa todo el espacio) */}
            <DetailCard
              title="Equipo Asignado"
              icon={<FaUsers className="text-teal-500" />}
            >
              <div className="space-y-4">
                {/* Header con estadísticas */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200">
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-teal-600 text-lg" />
                    <span className="text-sm font-semibold text-gray-700">
                      Total de Miembros
                    </span>
                  </div>
                  <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-bold">
                    {project.empleadosAsociados?.length || 0}
                  </span>
                </div>

                {/* Lista de miembros */}
                <div className="space-y-3">
                  {(project.empleadosAsociados ?? [])
                    .slice(0, 5)
                    .map((empleado, index) => (
                      <div
                        key={empleado.nombre || empleado}
                        className="group relative"
                      >
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]">
                          {/* Avatar con indicador de estado */}
                          <div className="relative">
                            <img
                              className="rounded-full object-cover w-12 h-12 border-3 border-teal-200 shadow-sm"
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                                empleado.avatarSeed || empleado
                              }`}
                              alt={empleado.nombre || empleado}
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                          </div>

                          {/* Información del miembro */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-800 truncate">
                                {empleado.nombre || empleado}
                              </span>
                              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                                #{index + 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <FaUser className="text-gray-400 text-xs" />
                              <span className="text-xs text-gray-500">
                                Miembro del equipo
                              </span>
                            </div>
                          </div>

                          {/* Indicador de rol (placeholder para futuras expansiones) */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <FaCrown className="text-yellow-500 text-sm" />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Mostrar más miembros si existen */}
                {(project.empleadosAsociados?.length || 0) > 5 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 hover:border-teal-300 transition-all duration-200 cursor-pointer group">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-teal-400 to-blue-500 text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
                        +{project.empleadosAsociados.length - 5}
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-semibold text-gray-700 block">
                          Ver más miembros
                        </span>
                        <span className="text-xs text-gray-500">
                          ({project.empleadosAsociados.length - 5} adicionales)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mensaje cuando no hay equipo */}
                {(project.empleadosAsociados?.length || 0) === 0 && (
                  <div className="text-center py-6">
                    <FaUsers className="text-gray-300 text-3xl mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      No hay miembros asignados
                    </p>
                  </div>
                )}
              </div>
            </DetailCard>
          </div>

          {/* Columna derecha (1/4) */}
          <div className="xl:col-span-1 space-y-6">
            {/* Información General */}
            <DetailCard
              title="Información General"
              icon={<FaInfoCircle className="text-gray-500" />}
            >
              <InfoRow icon={<FaUser />} label="Responsable">
                {project.responsable?.nombre}
              </InfoRow>
              <InfoRow icon={<FaCalendar />} label="Inicio">
                {project.fechaInicio}
              </InfoRow>
              <InfoRow icon={<FaCalendar />} label="Fin">
                {project.fechaFin}
              </InfoRow>
              <InfoRow icon={<FaFlag />} label="Estado">
                {project.estado}
              </InfoRow>
              <InfoRow icon={<FaExclamationTriangle />} label="Prioridad">
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full ${getPriorityClass(
                    project.prioridad
                  )}`}
                >
                  {project.prioridad}
                </span>
              </InfoRow>
              <InfoRow icon={<FaMapMarkerAlt />} label="Ubicación">
                {project.ubicacion}
              </InfoRow>

              {/* Observaciones integradas */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <FaCommentDots className="text-indigo-500 text-sm" />
                  <span className="text-sm font-semibold text-gray-700">
                    Observaciones
                  </span>
                </div>
                {project.observaciones ? (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {project.observaciones}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FaCommentDots className="text-gray-300 text-lg mx-auto mb-2" />
                    <p className="text-xs text-gray-500">
                      No hay observaciones
                    </p>
                  </div>
                )}
              </div>
            </DetailCard>
          </div>
        </div>
      );
    } else if (activeTab.startsWith("sede-")) {
      const sedeIndex = parseInt(activeTab.split("-")[1]);
      const sede = localSedes[sedeIndex];

      if (!sede) return <div>Sede no encontrada</div>;

      return (
        <div className="space-y-6">
          {/* Información de la sede */}
          <DetailCard
            title={`Información de ${sede.nombre}`}
            icon={<FaMapMarkerAlt className="text-blue-500" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow icon={<FaMapMarkerAlt />} label="Ubicación">
                {sede.ubicacion || "No especificada"}
              </InfoRow>
              <InfoRow icon={<FaBuilding />} label="Nombre">
                {sede.nombre}
              </InfoRow>
            </div>
          </DetailCard>

          {/* Materiales asignados */}
          <DetailCard
            title="Materiales Asignados"
            icon={<FaTools className="text-green-500" />}
          >
            {Array.isArray(sede.materialesAsignados) &&
            sede.materialesAsignados.length > 0 ? (
              <div className="space-y-3">
                {sede.materialesAsignados.map((mat, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <FaTools className="text-green-600" />
                      <div>
                        <span className="font-semibold text-gray-800">
                          {mat.item}
                        </span>
                        <div className="text-sm text-gray-600">
                          Cantidad asignada: {mat.cantidad}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">
                        {formatCurrency(
                          mat.cantidad *
                            (project.materiales.find((m) => m.item === mat.item)
                              ?.precio || 0)
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No hay materiales asignados a esta sede.
              </p>
            )}
          </DetailCard>

          {/* Servicios asignados */}
          <DetailCard
            title="Servicios Asignados"
            icon={<FaCogs className="text-purple-500" />}
          >
            {Array.isArray(sede.serviciosAsignados) &&
            sede.serviciosAsignados.length > 0 ? (
              <div className="space-y-4">
                {(() => {
                  // Agrupar servicios por categoría
                  const serviciosPorCategoria = sede.serviciosAsignados.reduce(
                    (acc, serv) => {
                      const categoriaNombre =
                        serv.categoria?.nombre || "Sin categoría";
                      if (!acc[categoriaNombre]) {
                        acc[categoriaNombre] = [];
                      }
                      acc[categoriaNombre].push(serv);
                      return acc;
                    },
                    {}
                  );

                  return Object.entries(serviciosPorCategoria).map(
                    ([categoriaNombre, servicios]) => (
                      <div
                        key={categoriaNombre}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <h4 className="font-semibold text-gray-800">
                            {categoriaNombre}
                          </h4>
                          <span className="text-sm text-gray-500">
                            ({servicios.length} servicios)
                          </span>
                        </div>
                        <div className="space-y-2">
                          {servicios.map((serv, i) => (
                            <div
                              key={i}
                              className={`flex justify-between items-center p-3 rounded-lg border ${
                                serv.estado === "completado"
                                  ? "bg-green-50 border-green-200"
                                  : "bg-purple-50 border-purple-200"
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    serv.estado === "completado"
                                      ? "bg-green-500"
                                      : "bg-purple-500"
                                  }`}
                                ></div>
                                <div className="flex-1">
                                  <span
                                    className={`font-medium ${
                                      serv.estado === "completado"
                                        ? "text-green-800"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {serv.servicio}
                                  </span>
                                  <div className="text-sm text-gray-600">
                                    Cantidad: {serv.cantidad}
                                    {serv.estado === "completado" &&
                                      serv.fechaCompletado && (
                                        <span className="text-green-600 ml-2">
                                          ✓ Completado el{" "}
                                          {new Date(
                                            serv.fechaCompletado
                                          ).toLocaleDateString()}
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="font-semibold text-gray-800">
                                    {formatCurrency(
                                      serv.cantidad * (serv.precio || 0)
                                    )}
                                  </div>
                                  {serv.estado === "completado" && (
                                    <div className="text-xs text-green-600 font-medium">
                                      Completado
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  {serv.estado === "pendiente" ? (
                                    <button
                                      onClick={() =>
                                        handleMarkServiceCompleted(sedeIndex, i)
                                      }
                                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors"
                                      title="Marcar como completado"
                                      aria-label="Marcar como completado"
                                    >
                                      <FaRegSquare className="text-lg" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handleMarkServicePending(sedeIndex, i)
                                      }
                                      className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 border border-green-300 transition-colors"
                                      title="Marcar como pendiente"
                                      aria-label="Marcar como pendiente"
                                    >
                                      <FaCheckSquare className="text-lg" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  );
                })()}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No hay servicios asignados a esta sede.
              </p>
            )}
          </DetailCard>

          {/* Presupuesto de la sede */}
          {sede.presupuesto && (
            <DetailCard
              title="Presupuesto de la Sede"
              icon={<FaDollarSign className="text-red-500" />}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-600 font-medium">
                      Presupuesto Inicial
                    </div>
                    <div className="text-xl font-bold text-blue-800">
                      {formatCurrency(sede.presupuesto.total)}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="text-sm text-orange-600 font-medium">
                      Presupuesto Ejecutado
                    </div>
                    <div className="text-xl font-bold text-orange-800">
                      {formatCurrency(
                        sede.presupuesto.total -
                          (sede.presupuesto.restante || sede.presupuesto.total)
                      )}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-green-600 font-medium">
                      Presupuesto Restante
                    </div>
                    <div className="text-xl font-bold text-green-800">
                      {formatCurrency(
                        sede.presupuesto.restante || sede.presupuesto.total
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Materiales:</span>
                    <span className="font-semibold">
                      {formatCurrency(sede.presupuesto.materiales)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Servicios:</span>
                    <span className="font-semibold">
                      {formatCurrency(sede.presupuesto.servicios)}
                    </span>
                  </div>
                </div>
              </div>
            </DetailCard>
          )}

          {/* Historial de salidas */}
          <DetailCard
            title="Gestión de Materiales"
            icon={<FaHistory className="text-indigo-500" />}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Visualiza el historial de salidas de materiales para esta sede.
              </p>
              <button
                onClick={() => handleOpenHistorialModal(sedeIndex)}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 font-medium flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FaHistory />
                Ver Historial de Salida
              </button>
            </div>
          </DetailCard>
        </div>
      );
    }

    return <div>Contenido no encontrado</div>;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-16 md:pt-24"
      onClick={onClose}
    >
      <div
        className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <FaClipboardList className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {project.nombre}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <FaUser className="text-blue-500" />
                  Cliente: {project.cliente}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityClass(
                    project.prioridad
                  )}`}
                >
                  {project.prioridad}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-2xl p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </header>

        {/* Pestañas */}
        <div className="border-b bg-white px-6">
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-thin scrollbar-thumb-gray-300">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                icon={tab.icon}
              >
                {tab.label}
              </TabButton>
            ))}
          </div>
        </div>

        {/* Contenido de las pestañas */}
        <div className="p-4 sm:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {renderTabContent()}
        </div>
      </div>

      {/* Modal de Historial de Salidas */}
      <HistorialSalidasModal
        isOpen={historialModalOpen}
        onClose={handleCloseHistorialModal}
        project={project}
        sedeIndex={selectedHistorialSedeIndex}
      />
    </div>
  );
};

export default ProjectDetailModal;
