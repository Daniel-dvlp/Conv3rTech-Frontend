// src/features/dashboard/pages/suppliers/SuppliersPage.jsx

import React, { useState, useMemo } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import SuppliersTable from './components/SuppliersTable';
import SkeletonRow from './components/SkeletonRow';
import Pagination from '../../../../shared/components/Pagination';
import NewProviderModal from './components/NewSuppliersModal';
import EditSupplierModal from './components/EditSupplierModal';
import SupplierDetailModal from './components/SupplierDetailModal';
import { Toaster } from 'react-hot-toast';
import { useSuppliers } from './hooks/useSuppliers';

const ITEMS_PER_PAGE = 5;

const SuppliersPage = () => {
  // Usar el hook personalizado
  const { suppliers, loading, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState(null);
  const [supplierToView, setSupplierToView] = useState(null);

  const normalize = (text) =>
    String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const filteredSuppliers = useMemo(() => {
    const normalizedSearch = normalize(searchTerm);
    if (!normalizedSearch) return suppliers; // Retorna todos si no hay búsqueda
    return suppliers.filter((s) =>
      normalize(s.nit || '').includes(normalizedSearch) ||
      normalize(s.encargado).includes(normalizedSearch) ||
      normalize(s.empresa).includes(normalizedSearch) ||
      normalize(s.telefono_entidad).includes(normalizedSearch) ||
      normalize(s.telefono_encargado || '').includes(normalizedSearch) ||
      normalize(s.correo_principal).includes(normalizedSearch) ||
      normalize(s.correo_secundario || '').includes(normalizedSearch) ||
      normalize(s.direccion || '').includes(normalizedSearch) ||
      normalize(s.observaciones || '').includes(normalizedSearch) ||
      normalize(s.estado).includes(normalizedSearch)
    );
  }, [suppliers, searchTerm]);

  const totalPages = Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSuppliers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSuppliers, currentPage]);

  // Handler para guardar un nuevo proveedor
  const handleSaveNewSupplier = async (newSupplier) => {
    try {
      await createSupplier(newSupplier);
      setIsNewSupplierModalOpen(false);
    } catch (error) {
      console.error('Error al crear proveedor:', error);
    }
  };

  // Handler para guardar un proveedor editado
  const handleSaveEditedSupplier = async (updatedSupplier) => {
    try {
      await updateSupplier(updatedSupplier.id, updatedSupplier);
      setSupplierToEdit(null);
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
    }
  };

  // Handler para eliminar un proveedor
  const handleDeleteSupplier = async (supplierId) => {
    try {
      await deleteSupplier(supplierId);
      if (supplierToEdit && supplierToEdit.id === supplierId) {
        setSupplierToEdit(null);
      }
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
    }
  };

  // Handler para abrir el modal de edición con el proveedor seleccionado
  const handleEditSupplier = (supplier) => {
    setSupplierToEdit(supplier); // Establece el proveedor a editar
  };

  // Handler para abrir el modal de vista con el proveedor seleccionado
  const handleViewSupplier = (supplier) => {
    setSupplierToView(supplier); // Establece el proveedor a ver
  };

  // Obtener la lista de NITs existentes para pasar a los modales (excluyendo el del proveedor actual en edición)
  const existingNits = useMemo(() => suppliers.map(s => s.nit), [suppliers]);


  return (
    <div className="p-4 md:p-8">
      {/* Encabezado del módulo */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Proveedores</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Buscar"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Buscar proveedor"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={() => setIsNewSupplierModalOpen(true)}
            className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all"
            aria-label="Registrar nuevo proveedor"
          >
            <FaPlus />
            Registrar proveedor
          </button>
        </div>
      </div>

      {/* Tabla o Skeleton mientras carga */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Entidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono Entidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Encargado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo Principal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(5)].map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <SuppliersTable
            suppliers={currentItems}
            onView={handleViewSupplier} // <--- PASA LA FUNCIÓN PARA VER
            onEdit={handleEditSupplier} // <--- PASA LA FUNCIÓN PARA EDITAR
            onDelete={handleDeleteSupplier} // <--- PASA LA FUNCIÓN PARA ELIMINAR
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      )}

      {/* Modal para crear proveedor */}
      <NewProviderModal
        isOpen={isNewSupplierModalOpen}
        onClose={() => setIsNewSupplierModalOpen(false)}
        onSave={handleSaveNewSupplier} // Usa el handler definido
        existingNits={existingNits} // Pasa los NITs existentes
      />

      {/* Modal para editar proveedor */}
      <EditSupplierModal
        isOpen={!!supplierToEdit} // Se abre si supplierToEdit tiene un valor
        onClose={() => setSupplierToEdit(null)} // Cierra el modal de edición
        onSave={handleSaveEditedSupplier} // Usa el handler definido
        supplierToEdit={supplierToEdit} // Pasa el objeto del proveedor a editar
        existingNits={existingNits} // Pasa los NITs existentes para validación
      />

      {/* Modal para ver detalles del proveedor */}
      <SupplierDetailModal
        supplier={supplierToView}
        onClose={() => setSupplierToView(null)}
      />

      {/* Componente para mostrar las notificaciones (toasts) */}
      <Toaster position="bottom-right" />
    </div>
  );
};

export default SuppliersPage;