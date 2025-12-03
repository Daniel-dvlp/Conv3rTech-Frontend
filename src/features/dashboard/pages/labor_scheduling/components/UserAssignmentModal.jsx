import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSave, FaUser, FaPlus, FaTrash } from 'react-icons/fa';
import { showToast } from '../../../../../shared/utils/alertas';
import laborSchedulingService from '../../../../../services/laborSchedulingService';
import usersService from '../../../../../services/usersService';

// Reutilizar componentes del formato estándar
const FormSection = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const FormLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const inputBaseStyle = 'block w-full text-sm text-gray-500 border rounded-lg shadow-sm p-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold';

const UserAssignmentModal = ({ isOpen, onClose, onSave, shiftInstance, users }) => {
  const [form, setForm] = useState({
    userIds: [],
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState(users || []);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [existingAssignments, setExistingAssignments] = useState([]);

  const loadExistingAssignments = useCallback(async () => {
    if (!shiftInstance?.id_instancia_turno) return;

    try {
      const assignments = await laborSchedulingService.getEmployeeAssignments({
        instanceId: shiftInstance.id_instancia_turno
      });
      setExistingAssignments(assignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
      setExistingAssignments([]);
    }
  }, [shiftInstance]);

  useEffect(() => {
    if (shiftInstance && isOpen) {
      loadExistingAssignments();
      setForm({
        userIds: [],
        notes: ''
      });
      setSelectedUserId('');
    }
    setErrors({});
  }, [shiftInstance, isOpen, loadExistingAssignments]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await usersService.getAllUsers();
        const userData = Array.isArray(response) ? response :
                        response?.data ? response.data :
                        response?.users ? response.users : [];
        setAllUsers(userData);
      } catch (error) {
        console.error('Error loading users:', error);
        setAllUsers([]);
      }
    };

    if (isOpen && allUsers.length === 0) {
      loadUsers();
    }
  }, [isOpen, allUsers.length]);

  const validate = () => {
    const errs = {};
    if (form.userIds.length === 0) errs.employees = 'Selecciona al menos un usuario';
    return errs;
  };

  const handleAddEmployee = () => {
    if (!selectedUserId) return;

    const userId = Number(selectedUserId);
    if (form.userIds.includes(userId)) {
      setErrors(prev => ({ ...prev, employees: 'Este usuario ya ha sido añadido' }));
      return;
    }

    // Check if already assigned
    const alreadyAssigned = existingAssignments.some(a => a.id_usuario === userId);
    if (alreadyAssigned) {
      setErrors(prev => ({ ...prev, employees: 'Este usuario ya está asignado a este turno' }));
      return;
    }

    setForm(prev => ({
      ...prev,
      userIds: [...prev.userIds, userId]
    }));
    setSelectedUserId('');
    setErrors(prev => ({ ...prev, employees: undefined }));
  };

  const handleRemoveEmployee = (userId) => {
    setForm(prev => ({
      ...prev,
      userIds: prev.userIds.filter(id => id !== userId)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const result = await laborSchedulingService.assignEmployeesToShift(
        shiftInstance.id_instancia_turno,
        form.userIds,
        form.notes
      );

      showToast(`${result.length} usuarios asignados exitosamente`, 'success');
      await loadExistingAssignments(); // Refresh assignments
      setForm({ userIds: [], notes: '' });
      onSave(result);
    } catch (error) {
      console.error('Error asignando empleados:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al asignar usuarios';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAssignmentStatus = async (assignmentId, newStatus) => {
    try {
      await laborSchedulingService.updateEmployeeAssignment(assignmentId, {
        estado: newStatus
      });
      showToast('Estado de asignación actualizado', 'success');
      await loadExistingAssignments();
    } catch (error) {
      console.error('Error updating assignment:', error);
      showToast('Error al actualizar asignación', 'error');
    }
  };

  if (!isOpen || !shiftInstance) return null;

  const availableUsers = allUsers.filter(user =>
    !form.userIds.includes(user.id_usuario) &&
    !existingAssignments.some(a => a.id_usuario === user.id_usuario)
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Asignar Usuarios - {shiftInstance.template?.nombre || 'Turno'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaTimes />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          {/* Información del Turno */}
          <FormSection title="Información del Turno">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <FormLabel>Fecha</FormLabel>
                <div className="text-sm text-gray-900 font-medium">
                  {new Date(shiftInstance.fecha).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div>
                <FormLabel>Horario</FormLabel>
                <div className="text-sm text-gray-900 font-medium">
                  {shiftInstance.hora_inicio} - {shiftInstance.hora_fin}
                </div>
              </div>
              <div>
                <FormLabel>Duración</FormLabel>
                <div className="text-sm text-gray-900 font-medium">
                  {shiftInstance.duracion_horas} horas
                </div>
              </div>
            </div>
          </FormSection>

          {/* Asignaciones Existentes */}
          {existingAssignments.length > 0 && (
            <FormSection title={`Usuarios Asignados (${existingAssignments.length})`}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha Asignación</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {existingAssignments.map((assignment) => (
                      <tr key={assignment.id_asignacion}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {assignment.employee ? `${assignment.employee.nombre} ${assignment.employee.apellido}` : 'Usuario no encontrado'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            assignment.estado === 'Confirmado' ? 'bg-green-100 text-green-800' :
                            assignment.estado === 'Asignado' ? 'bg-blue-100 text-blue-800' :
                            assignment.estado === 'Rechazado' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {assignment.estado}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {new Date(assignment.fecha_asignacion).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <select
                            value={assignment.estado}
                            onChange={(e) => handleUpdateAssignmentStatus(assignment.id_asignacion, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="Asignado">Asignado</option>
                            <option value="Confirmado">Confirmado</option>
                            <option value="Rechazado">Rechazado</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FormSection>
          )}

          {/* Nueva Asignación */}
          <FormSection title="Nueva Asignación">
            {errors.employees && <p className="text-red-500 text-sm mb-4">{errors.employees}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div className="md:col-span-2">
                <FormLabel><span className="text-red-500">*</span> Usuario</FormLabel>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className={`${inputBaseStyle} ${
                    errors.employees ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar usuario</option>
                  {availableUsers.map(user => (
                    <option key={user.id_usuario} value={user.id_usuario}>
                      {user.nombre} {user.apellido} ({user.rol?.nombre_rol || 'Sin rol'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddEmployee}
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-conv3r-dark bg-conv3r-gold hover:brightness-95 transition-transform hover:scale-105"
                >
                  <FaPlus className="mr-2" />
                  Añadir
                </button>
              </div>
            </div>

            {form.userIds.length > 0 && (
              <div className="mb-4">
                <FormLabel>Usuarios a asignar</FormLabel>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {form.userIds.map((userId) => {
                        const user = allUsers.find(u => u.id_usuario === userId);
                        return (
                          <tr key={userId}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {user ? `${user.nombre} ${user.apellido}` : 'Usuario no encontrado'}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {user?.rol?.nombre_rol || 'Sin rol'}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              <button
                                type="button"
                                onClick={() => handleRemoveEmployee(userId)}
                                className="text-red-600 hover:text-red-800"
                                title="Eliminar empleado"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div>
              <FormLabel htmlFor="notes">Notas (opcional)</FormLabel>
              <textarea
                name="notes"
                id="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className={`${inputBaseStyle} border-gray-300`}
                placeholder="Notas adicionales sobre la asignación..."
              />
            </div>
          </FormSection>

          {/* Acciones */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || form.userIds.length === 0}
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-conv3r-dark bg-conv3r-gold hover:brightness-95 transition-transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'Asignando...' : 'Asignar Usuarios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAssignmentModal;