// src/features/dashboard/pages/suppliers/services/suppliersApi.js
import api from '../../../../../services/api';

const SUPPLIERS_ENDPOINT = 'suppliers';

export const suppliersApi = {
  // Obtener todos los proveedores
  getAllSuppliers: async () => {
    try {
      const response = await api.get(SUPPLIERS_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      throw error;
    }
  },

  // Obtener un proveedor por ID
  getSupplierById: async (id) => {
    try {
      const response = await api.get(`${SUPPLIERS_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener proveedor:', error);
      throw error;
    }
  },

  // Crear un nuevo proveedor
  createSupplier: async (supplierData) => {
    try {
      console.log("API createSupplier payload:", supplierData);
      const response = await api.post(SUPPLIERS_ENDPOINT, supplierData);
      return response.data;
    } catch (error) {
      console.error('Error al crear proveedor:', error);
      if (error.response) {
        console.error('Detalles del error (Backend):', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  },

  // Actualizar un proveedor
  updateSupplier: async (id, supplierData) => {
    try {
      const response = await api.put(`${SUPPLIERS_ENDPOINT}/${id}`, supplierData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
      throw error;
    }
  },

  // Eliminar un proveedor
  deleteSupplier: async (id) => {
    try {
      await api.delete(`${SUPPLIERS_ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      throw error;
    }
  },

  // Cambiar estado del proveedor (Activo/Inactivo)
  changeSupplierStatus: async (id, newStatus) => {
    try {
      await api.patch(`${SUPPLIERS_ENDPOINT}/${id}/state`, {
        estado: newStatus
      });
    } catch (error) {
      console.error('Error al cambiar estado del proveedor:', error);
      throw error;
    }
  }
};

export default suppliersApi;

