// src/features/dashboard/pages/suppliers/hooks/useSuppliers.js
import { useState, useEffect, useCallback } from 'react';
import { suppliersApi } from '../services/suppliersApi';
import { toast } from 'react-hot-toast';

// Función para transformar datos del backend al formato del frontend
const transformSupplierFromBackend = (supplier) => {
  return {
    id: supplier.id_proveedor,
    nit: supplier.nit,
    empresa: supplier.nombre_empresa,
    encargado: supplier.nombre_encargado,
    telefono_entidad: supplier.telefono_entidad,
    telefono_encargado: supplier.telefono_encargado,
    correo_principal: supplier.correo_principal,
    correo_secundario: supplier.correo_secundario,
    direccion: supplier.direccion,
    estado: supplier.estado,
    observaciones: supplier.observaciones,
    fecha_registro: supplier.fecha_registro,
    // Mantener los campos originales para actualizaciones
    _backendData: supplier
  };
};

// Función para transformar datos del frontend al formato del backend
const transformSupplierToBackend = (supplier) => {
  return {
    nit: supplier.nit,
    nombre_empresa: supplier.empresa,
    nombre_encargado: supplier.encargado,
    telefono_entidad: supplier.telefono_entidad,
    telefono_encargado: supplier.telefono_encargado,
    correo_principal: supplier.correo_principal,
    correo_secundario: supplier.correo_secundario,
    direccion: supplier.direccion,
    estado: supplier.estado,
    observaciones: supplier.observaciones
  };
};

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar todos los proveedores
  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await suppliersApi.getAllSuppliers();
      const transformedData = Array.isArray(data) ? data.map(transformSupplierFromBackend) : [];
      setSuppliers(transformedData);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear proveedor
  const createSupplier = useCallback(async (supplierData) => {
    try {
      setLoading(true);
      const backendData = transformSupplierToBackend(supplierData);
      const newSupplier = await suppliersApi.createSupplier(backendData);
      const transformedSupplier = transformSupplierFromBackend(newSupplier);
      setSuppliers(prev => [...prev, transformedSupplier]);
      toast.success('Proveedor creado exitosamente');
      return transformedSupplier;
    } catch (err) {
      setError(err.message);
      toast.error('Error al crear proveedor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar proveedor
  const updateSupplier = useCallback(async (id, supplierData) => {
    try {
      setLoading(true);
      const backendData = transformSupplierToBackend(supplierData);
      const updatedSupplier = await suppliersApi.updateSupplier(id, backendData);
      const transformedSupplier = transformSupplierFromBackend(updatedSupplier);
      setSuppliers(prev => 
        prev.map(supplier => 
          supplier.id === id ? transformedSupplier : supplier
        )
      );
      toast.success('Proveedor actualizado exitosamente');
      return transformedSupplier;
    } catch (err) {
      setError(err.message);
      toast.error('Error al actualizar proveedor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar proveedor
  const deleteSupplier = useCallback(async (id) => {
    try {
      setLoading(true);
      await suppliersApi.deleteSupplier(id);
      setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
      toast.success('Proveedor eliminado exitosamente');
    } catch (err) {
      setError(err.message);
      toast.error('Error al eliminar proveedor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cambiar estado del proveedor
  const changeSupplierStatus = useCallback(async (id, newStatus) => {
    try {
      setLoading(true);
      await suppliersApi.changeSupplierStatus(id, { estado: newStatus });
      setSuppliers(prev =>
        prev.map(supplier =>
          supplier.id === id
            ? { ...supplier, estado: newStatus }
            : supplier
        )
      );
      toast.success(`Proveedor ${newStatus === 'Activo' ? 'activado' : 'desactivado'} exitosamente`);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cambiar estado del proveedor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar proveedores al montar el componente
  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  return {
    suppliers,
    loading,
    error,
    loadSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    changeSupplierStatus
  };
};

export default useSuppliers;
