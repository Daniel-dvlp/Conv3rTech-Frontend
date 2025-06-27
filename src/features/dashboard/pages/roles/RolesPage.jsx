// src/features/dashboard/pages/roles/RolesPage.jsx

import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import RolesTable from './components/RolesTable'; 
// 1. ELIMINAMOS SkeletonRow y lo reemplazamos por el TableSkeleton compartido
import TableSkeleton from '../../../../shared/components/TableSkeleton'; 
// 2. CORREGIMOS la ruta para que coincida con la tuya
import { mockRoles } from './data/Roles_data'; 

// 3. DEFINIMOS las cabeceras que le pasaremos a nuestro esqueleto
const roleTableHeaders = ['Rol', 'Descripción', 'Permisos', 'Estado', 'Acciones'];

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setRoles(mockRoles);
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="p-4 md:p-8">
      {/* El encabezado no cambia */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Roles</h1>
        <button className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all">
          <FaPlus />
          Nuevo Rol
        </button>
      </div>

      {/* 4. LA LÓGICA DE CARGA AHORA ES SÚPER LIMPIA */}
      {loading ? (
        // En lugar de duplicar la tabla, llamamos al componente reutilizable
        <TableSkeleton headers={roleTableHeaders} rowCount={5} />
      ) : (
        // Cuando termina de cargar, mostramos la tabla real
        <RolesTable roles={roles} />
      )}
    </div>
  );
};

export default RolesPage;