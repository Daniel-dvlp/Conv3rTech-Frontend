// src/features/dashboard/pages/users/hooks/useUsers.js
import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../services/usersApi';
import { rolesApi } from '../services/rolesApi';
import { toast } from 'react-hot-toast';

export const useUsers = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar todos los usuarios
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersApi.getAllUsers();
      setUsuarios(data);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear usuario
  const createUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      const newUser = await usersApi.createUser(userData);
      setUsuarios(prev => [...prev, newUser]);
      toast.success('Usuario creado exitosamente');
      return newUser;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Error al crear usuario';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar usuario
  const updateUser = useCallback(async (id, userData) => {
    try {
      setLoading(true);
      const updatedUser = await usersApi.updateUser(id, userData);
      setUsuarios(prev => 
        prev.map(user => 
          user.id_usuario === id ? updatedUser : user
        )
      );
      toast.success('Usuario actualizado exitosamente');
      return updatedUser;
    } catch (err) {
      let errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Error al actualizar usuario';
      
      if (err.response?.status === 404) {
        errorMessage = 'El usuario no existe o fue eliminado.';
      } else if (err.response?.status === 400) {
        errorMessage = errorMessage || 'Datos inválidos. Verifique la información.';
      }

      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar usuario
  const deleteUser = useCallback(async (id) => {
    try {
      setLoading(true);
      await usersApi.deleteUser(id);
      setUsuarios(prev => prev.filter(user => user.id_usuario !== id));
      toast.success('Usuario eliminado exitosamente');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Error al eliminar usuario';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cambiar estado del usuario
  const changeUserStatus = useCallback(async (id, newStatus) => {
    try {
      setLoading(true);
      const updatedUser = await usersApi.changeUserStatus(id, newStatus);
      setUsuarios(prev => 
        prev.map(user => 
          user.id_usuario === id ? { ...user, estado_usuario: newStatus } : user
        )
      );
      toast.success(`Usuario ${newStatus === 'Activo' ? 'activado' : 'desactivado'} exitosamente`);
      return updatedUser;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Error al cambiar estado del usuario';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar usuarios
  const searchUsers = useCallback(async (searchTerm) => {
    try {
      setLoading(true);
      const data = await usersApi.searchUsers(searchTerm);
      setUsuarios(data);
    } catch (err) {
      setError(err.message);
      toast.error('Error al buscar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar roles
  const loadRoles = useCallback(async () => {
    try {
      const data = await rolesApi.getAllRoles();
      // Normalizar respuesta para garantizar un array
      let rolesList = [];
      if (Array.isArray(data)) {
        rolesList = data;
      } else if (Array.isArray(data?.data)) {
        rolesList = data.data;
      } else if (Array.isArray(data?.rows)) {
        rolesList = data.rows;
      } else if (Array.isArray(data?.result)) {
        rolesList = data.result;
      } else if (data && typeof data === 'object' && data !== null) {
        // Algunos backends devuelven { success, data: { data: [...] } }
        const nested = data.data;
        if (Array.isArray(nested)) {
          rolesList = nested;
        } else if (Array.isArray(nested?.data)) {
          rolesList = nested.data;
        }
      }
      setRoles(rolesList);
    } catch (err) {
      console.error('Error al cargar roles:', err);
    }
  }, []);

  // Cargar usuarios y roles al montar el componente
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadUsers(), loadRoles()]);
    };
    loadData();
  }, [loadUsers, loadRoles]);

  return {
    usuarios,
    roles,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    changeUserStatus,
    searchUsers
  };
};

export default useUsers;
