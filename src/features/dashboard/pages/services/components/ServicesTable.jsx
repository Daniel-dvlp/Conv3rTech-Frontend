import React from "react";
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import { usePermissions } from '../../../../../shared/hooks/usePermissions';

const ServicesTable = ({
  servicios,
  onVer,
  onEditar,
  onEliminar,
}) => {
  const { canEdit, canDelete } = usePermissions();
  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {servicios.map((servicio) => {
            const servicioId = servicio.id_servicio || servicio.id;
            const imagenUrl = servicio.url_imagen || servicio.imagen;
            
            return (
              <tr key={servicioId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
                    {imagenUrl ? (
                      <img
                        src={imagenUrl}
                        alt={servicio.nombre}
                        className="object-cover w-full h-full"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/400x300/e5e7eb/9ca3af?text=Sin+Imagen';
                          e.target.onerror = null;
                        }}
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{servicio.nombre}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{servicio.categoria?.nombre || 'Sin categoría'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {servicio.precio ? `$${parseFloat(servicio.precio).toLocaleString('es-CO')}` : '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                    {servicio.descripcion || 'Sin descripción'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      (servicio.estado || '').toLowerCase() === "activo"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {(servicio.estado || '').toLowerCase() === "activo" ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => onVer(servicioId)}
                      className="text-blue-500 hover:text-blue-700  hover:blue-200 p-2 rounded-lg transition-colors"
                      title="Ver detalle"
                    >
                      <FaEye size={16} />
                    </button>
                    {canEdit('servicios') && (
                      <button
                        onClick={() => onEditar(servicioId)}
                        className="text-yellow-500 hover:text-yellow-700  hover:yellow-200 p-2 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <FaEdit size={16} />
                      </button>
                    )}
                    {canDelete('servicios') && (
                      <button
                        onClick={() => onEliminar(servicioId)}
                        className="text-red-500 hover:text-red-700  hover:red-200 p-2 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <FaTrashAlt size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ServicesTable;
