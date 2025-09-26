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
      setError(err.message);
      toast.error('Error al crear usuario');
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
      setError(err.message);
      toast.error('Error al actualizar usuario');
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
      setError(err.message);
      toast.error('Error al eliminar usuario');
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
      setError(err.message);
      toast.error('Error al cambiar estado del usuario');
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
      setRoles(data);
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
