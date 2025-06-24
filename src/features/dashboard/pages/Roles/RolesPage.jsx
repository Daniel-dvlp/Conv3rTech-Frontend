// src/features/dashboard/pages/roles/RolesPage.jsx

import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import RolesTable from './components/RolesTable'; 
import SkeletonRow from './components/SkeletonRow'; // 1. IMPORTAMOS EL NUEVO SKELETON
import { mockRoles } from './data/Roles_data';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setRoles(mockRoles);
      setLoading(false);
    }, 1500); // Aumenté el tiempo a 1.5s para que puedas ver mejor el efecto
  }, []);

  return (
    <div className="p-4 md:p-8">
      {/* El encabezado se mantiene igual */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Roles</h1>
        <button className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all">
          <FaPlus />
          Nuevo Rol
        </button>
      </div>

      {/* 2. LÓGICA DE CARGA MODIFICADA */}
      {loading ? (
        // Si está cargando, mostramos la estructura de la tabla con las filas esqueleto
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permisos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Creamos un array de 5 elementos para mostrar 5 filas de skeleton */}
              {[...Array(5)].map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Si ya cargó, mostramos la tabla real con los datos
        <RolesTable roles={roles} />
      )}
    </div>
  );
};

export default RolesPage;