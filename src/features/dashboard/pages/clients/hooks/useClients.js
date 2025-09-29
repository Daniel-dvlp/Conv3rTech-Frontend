// src/features/dashboard/pages/clients/hooks/useClients.js
import { useState, useEffect, useCallback } from 'react';
import { clientsApi } from '../services/clientsApi';
import { toast } from 'react-hot-toast';

export const useClients = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar todos los clientes
  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientsApi.getAllClients();
      setClientes(data);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear cliente
  const createClient = useCallback(async (clientData) => {
    try {
      setLoading(true);
      const newClient = await clientsApi.createClient(clientData);
      setClientes(prev => [...prev, newClient]);
      toast.success('Cliente creado exitosamente');
      return newClient;
    } catch (err) {
      setError(err.message);
      toast.error('Error al crear cliente');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar cliente
  const updateClient = useCallback(async (id, clientData) => {
    try {
      setLoading(true);
      const updatedClient = await clientsApi.updateClient(id, clientData);
      setClientes(prev => 
        prev.map(client => 
          client.id_cliente === id ? updatedClient : client
        )
      );
      toast.success('Cliente actualizado exitosamente');
      return updatedClient;
    } catch (err) {
      setError(err.message);
      toast.error('Error al actualizar cliente');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar cliente
  const deleteClient = useCallback(async (id) => {
    try {
      setLoading(true);
      await clientsApi.deleteClient(id);
      setClientes(prev => prev.filter(client => client.id_cliente !== id));
      toast.success('Cliente eliminado exitosamente');
    } catch (err) {
      setError(err.message);
      toast.error('Error al eliminar cliente');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cambiar estado del cliente
  const changeClientStatus = useCallback(async (id, newStatus) => {
    try {
      setLoading(true);
      const updatedClient = await clientsApi.changeClientStatus(id, newStatus);
      setClientes(prev => 
        prev.map(client => 
          client.id_cliente === id ? { ...client, estado_cliente: newStatus } : client
        )
      );
      toast.success(`Cliente ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
      return updatedClient;
    } catch (err) {
      setError(err.message);
      toast.error('Error al cambiar estado del cliente');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cambiar estado de crédito del cliente
  const changeCreditStatus = useCallback(async (id, creditStatus) => {
    try {
      setLoading(true);
      const updatedClient = await clientsApi.changeCreditStatus(id, creditStatus);
      setClientes(prev => 
        prev.map(client => 
          client.id_cliente === id ? { ...client, credito: creditStatus } : client
        )
      );
      toast.success(`Crédito ${creditStatus ? 'habilitado' : 'deshabilitado'} exitosamente`);
      return updatedClient;
    } catch (err) {
      setError(err.message);
      toast.error('Error al cambiar estado de crédito');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar clientes
  const searchClients = useCallback(async (searchTerm) => {
    try {
      setLoading(true);
      const data = await clientsApi.searchClients(searchTerm);
      setClientes(data);
    } catch (err) {
      setError(err.message);
      toast.error('Error al buscar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  return {
    clientes,
    loading,
    error,
    loadClients,
    createClient,
    updateClient,
    deleteClient,
    changeClientStatus,
    changeCreditStatus,
    searchClients
  };
};

export default useClients;
