import React, { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaGlobe,
  FaServer,
} from "react-icons/fa";
import { healthCheckService } from "../../services";
import { getConfig } from "../config/constants";

const ConnectionDiagnostic = () => {
  const [diagnostic, setDiagnostic] = useState({
    isChecking: true,
    backendHealth: null,
    connectionTest: null,
    timestamp: null,
  });

  useEffect(() => {
    runDiagnostic();
  }, []);

  const runDiagnostic = async () => {
    setDiagnostic((prev) => ({ ...prev, isChecking: true }));

    try {
      // Verificar salud del backend
      const healthResult = await healthCheckService.checkBackendHealth();

      // Probar conexión
      const connectionResult = await healthCheckService.testConnection();

      setDiagnostic({
        isChecking: false,
        backendHealth: healthResult,
        connectionTest: connectionResult,
        timestamp: new Date().toLocaleString(),
      });
    } catch (error) {
      setDiagnostic({
        isChecking: false,
        backendHealth: { success: false, error: error.message },
        connectionTest: { success: false, error: error.message },
        timestamp: new Date().toLocaleString(),
      });
    }
  };

  const getStatusIcon = (success) => {
    if (success === null)
      return <FaSpinner className="animate-spin text-blue-500" />;
    return success ? (
      <FaCheckCircle className="text-green-500" />
    ) : (
      <FaExclamationTriangle className="text-red-500" />
    );
  };

  const getStatusColor = (success) => {
    if (success === null) return "text-blue-600";
    return success ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FaGlobe className="text-blue-500" />
          Diagnóstico de Conexión
        </h3>
        <button
          onClick={runDiagnostic}
          disabled={diagnostic.isChecking}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {diagnostic.isChecking ? "Verificando..." : "Verificar"}
        </button>
      </div>

      <div className="space-y-4">
        {/* Estado del Backend */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium flex items-center gap-2">
              <FaServer className="text-gray-600" />
              Estado del Backend
            </h4>
            {getStatusIcon(diagnostic.backendHealth?.success)}
          </div>

          {diagnostic.backendHealth?.success ? (
            <div className="text-sm space-y-1">
              <p className="text-green-600">✅ Backend disponible</p>
              {diagnostic.backendHealth.data && (
                <p className="text-gray-600">
                  Mensaje: {diagnostic.backendHealth.data.message}
                </p>
              )}
              <p className="text-gray-500">
                Status: {diagnostic.backendHealth.status}
              </p>
            </div>
          ) : (
            <div className="text-sm space-y-1">
              <p className="text-red-600">❌ Backend no disponible</p>
              <p className="text-gray-600">
                Error: {diagnostic.backendHealth?.error || "Error desconocido"}
              </p>
              {diagnostic.backendHealth?.status && (
                <p className="text-gray-500">
                  Status: {diagnostic.backendHealth.status}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Prueba de Conexión */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium flex items-center gap-2">
              <FaGlobe className="text-gray-600" />
              Prueba de Conexión
            </h4>
            {getStatusIcon(diagnostic.connectionTest?.success)}
          </div>

          {diagnostic.connectionTest?.success ? (
            <div className="text-sm space-y-1">
              <p className="text-green-600">✅ Conexión exitosa</p>
              <p className="text-gray-600">
                Tiempo de respuesta: {diagnostic.connectionTest.responseTime}
              </p>
            </div>
          ) : (
            <div className="text-sm space-y-1">
              <p className="text-red-600">❌ Error de conexión</p>
              <p className="text-gray-600">
                Error: {diagnostic.connectionTest?.error || "Error desconocido"}
              </p>
            </div>
          )}
        </div>

        {/* Información de Configuración */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-2 text-gray-800">
            Configuración Actual
          </h4>
          <div className="text-sm space-y-1 text-gray-600">
            <p>URL Base: {getConfig().API_BASE_URL}</p>
            <p>Timeout: {getConfig().API_TIMEOUT}ms</p>
            <p>Entorno: {getConfig().ENVIRONMENT}</p>
            <p>Última verificación: {diagnostic.timestamp}</p>
          </div>
        </div>

        {/* Recomendaciones */}
        {!diagnostic.isChecking &&
          (!diagnostic.backendHealth?.success ||
            !diagnostic.connectionTest?.success) && (
            <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">
                Recomendaciones
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Verifica que el backend esté desplegado correctamente</li>
                <li>
                  • Revisa la consola del navegador para errores adicionales
                </li>
                <li>• Confirma que no hay problemas de red o firewall</li>
                <li>• Intenta refrescar la página</li>
              </ul>
            </div>
          )}
      </div>
    </div>
  );
};

export default ConnectionDiagnostic;
