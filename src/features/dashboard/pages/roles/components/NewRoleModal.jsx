import React, { useState } from 'react';
import { FaTimes, FaShieldAlt, FaPlus, FaPencilAlt, FaTrash, FaEye, FaBan, FaCheck } from 'react-icons/fa';
import { showToast } from '../../../../../shared/utils/alertas';

// Configuración de módulos basada en tu sidebar
const MODULES_CONFIG = [
  {
    name: 'Dashboard',
    icon: '📊',
    privileges: ['Ver']
  },
  {
    name: 'Usuarios',
    icon: '👥',
    privileges: ['Crear', 'Ver', 'Editar', 'Eliminar']
  },
  {
    name: 'Compras',
    icon: '💰',
    submodules: [
      { name: 'Proveedores', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
      { name: 'Categorías de Productos', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
      { name: 'Productos', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
      { name: 'Compras', privileges: ['Crear', 'Ver', 'Editar', 'Anular'] }
    ]
  },
  {
    name: 'Servicios',
    icon: '🔧',
    submodules: [
      { name: 'Categoría de Servicios', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
      { name: 'Órdenes de Servicio', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
      { name: 'Programación laboral', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] }
    ]
  },
  {
    name: 'Ventas',
    icon: '📈',
    submodules: [
      { name: 'Clientes', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
      { name: 'Venta de Productos', privileges: ['Crear', 'Ver', 'Editar', 'Anular'] },
      { name: 'Órdenes de Servicios', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
      { name: 'Citas', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
      { name: 'Cotizaciones', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
      { name: 'Proyectos de Servicio', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
      { name: 'Pagos y Abonos', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] }
    ]
  },
  {
    name: 'Configuración',
    icon: '⚙️',
    submodules: [
      { name: 'Editar mi Perfil', privileges: ['Ver', 'Editar'] },
      { name: 'Gestión de Roles', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] }
    ]
  }
];

const privilegeIcons = {
  'Crear': <FaPlus className="text-green-500" />,
  'Ver': <FaEye className="text-blue-500" />,
  'Editar': <FaPencilAlt className="text-yellow-500" />,
  'Eliminar': <FaTrash className="text-red-500" />,
  'Anular': <FaBan className="text-orange-500" />
};

const NewRoleModal = ({ isOpen, onClose, onSave }) => {
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePermissionChange = (moduleName, submoduleName, privilege) => {
    const key = submoduleName ? `${moduleName}.${submoduleName}` : moduleName;
    
    setPermissions(prev => {
      const currentPrivs = prev[key] || {};
      return {
        ...prev,
        [key]: { ...currentPrivs, [privilege]: !currentPrivs[privilege] }
      };
    });
  };

  const handleSelectAllModule = (moduleName, moduleConfig) => {
    const hasSubmodules = moduleConfig.submodules && moduleConfig.submodules.length > 0;
    
    if (hasSubmodules) {
      // Para módulos con submódulos, marcar/desmarcar todos los submódulos
      const newPermissions = { ...permissions };
      const allSelected = moduleConfig.submodules.every(sub => 
        sub.privileges.every(priv => permissions[`${moduleName}.${sub.name}`]?.[priv])
      );
      
      moduleConfig.submodules.forEach(sub => {
        const key = `${moduleName}.${sub.name}`;
        if (allSelected) {
          delete newPermissions[key];
        } else {
          newPermissions[key] = {};
          sub.privileges.forEach(priv => {
            newPermissions[key][priv] = true;
          });
        }
      });
      
      setPermissions(newPermissions);
    } else {
      // Para módulos sin submódulos
      const allSelected = moduleConfig.privileges.every(priv => permissions[moduleName]?.[priv]);
      
      if (allSelected) {
        const newPermissions = { ...permissions };
        delete newPermissions[moduleName];
        setPermissions(newPermissions);
      } else {
        setPermissions(prev => ({
          ...prev,
          [moduleName]: moduleConfig.privileges.reduce((acc, priv) => ({ ...acc, [priv]: true }), {})
        }));
      }
    }
  };

  const isModuleFullySelected = (moduleName, moduleConfig) => {
    const hasSubmodules = moduleConfig.submodules && moduleConfig.submodules.length > 0;
    
    if (hasSubmodules) {
      return moduleConfig.submodules.every(sub => 
        sub.privileges.every(priv => permissions[`${moduleName}.${sub.name}`]?.[priv])
      );
    } else {
      return moduleConfig.privileges.every(priv => permissions[moduleName]?.[priv]);
    }
  };

  const resetForm = () => {
    setRoleName('');
    setDescription('');
    setPermissions({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!roleName.trim()) {
      alert('El nombre del rol es obligatorio');
      return;
    }
    
    if (!description.trim()) {
      alert('La descripción del rol es obligatoria');
      return;
    }

    // Verificar que al menos tenga un permiso
    const hasPermissions = Object.keys(permissions).some(key => 
      Object.values(permissions[key]).some(value => value === true)
    );

    if (!hasPermissions) {
      alert('Debe asignar al menos un permiso al rol');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convertir permisos a formato esperado por la función createRole
      const formattedPermissions = {};
      Object.keys(permissions).forEach(key => {
        const selectedPrivileges = Object.keys(permissions[key]).filter(priv => permissions[key][priv]);
        if (selectedPrivileges.length > 0) {
          formattedPermissions[key] = selectedPrivileges;
        }
      });
      
      // Preparar datos del rol
      const roleData = {
        name: roleName.trim(),
        description: description.trim(),
        permissions: formattedPermissions
      };
      
      console.log('Datos del rol a guardar:', roleData);
      
      // Llamar a la función onSave que viene del componente padre
      await onSave(roleData);
      
      // Limpiar formulario y cerrar modal
      resetForm();
      showToast('Rol creado exitosamente', 'success');
      
    } catch (error) {
      console.error('Error al crear el rol:', error);
      alert('Error al crear el rol. Por favor, inténtalo de nuevo.');
      setIsSubmitting(false);
      showToast('Error al crear el rol', 'error');
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  // Contar permisos seleccionados
  const selectedPermissionsCount = Object.keys(permissions).reduce((total, key) => {
    const modulePermissions = Object.values(permissions[key]).filter(value => value === true);
    return total + modulePermissions.length;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FaShieldAlt className="text-conv3r-gold" /> 
              Crear Nuevo Rol
            </h2>
            {selectedPermissionsCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {selectedPermissionsCount} permiso{selectedPermissionsCount !== 1 ? 's' : ''} seleccionado{selectedPermissionsCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button 
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 text-2xl p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <FaTimes />
          </button>
        </header>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Información Básica */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nombreRol" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Rol <span aria-label="Ayuda" tabIndex="0" role="tooltip" className="ml-1 text-blue-500 cursor-pointer" title="El nombre del rol debe ser único y representativo.">ⓘ</span></label>
                <input id="nombreRol" name="nombreRol" type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)} className={`block w-full text-sm border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="Ej: Administrador, Vendedor, etc." required aria-invalid={!!roleName.trim()} aria-describedby="error-nombreRol" />
                {roleName.trim() && !roleName.trim().length && <span id="error-nombreRol" className="text-red-500 text-xs flex items-center gap-1 mt-1"><span role="img" aria-label="error">❌</span> El nombre del rol es obligatorio.</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows="3" 
                  className="block w-full text-sm border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold transition-colors resize-none" 
                  placeholder="Describe las responsabilidades de este rol..."
                  required 
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            {/* Permisos y Privilegios */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                🔐 Permisos y Privilegios del Rol
              </h3>
              
              <div className="space-y-4">
                {MODULES_CONFIG.map(module => (
                  <div key={module.name} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                    
                    {/* Header del Módulo */}
                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{module.icon}</span>
                          <h4 className="font-bold text-gray-800">{module.name}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectAllModule(module.name, module)}
                          disabled={isSubmitting}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors disabled:opacity-50 ${
                            isModuleFullySelected(module.name, module)
                              ? 'bg-conv3r-gold text-conv3r-dark'
                              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {isModuleFullySelected(module.name, module) ? 'Desmarcar Todo' : 'Marcar Todo'}
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      {/* Módulo sin submódulos */}
                      {!module.submodules && (
                        <div className="flex flex-wrap gap-4">
                          {module.privileges.map(privilege => (
                            <label key={privilege} className="flex items-center gap-2 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={!!permissions[module.name]?.[privilege]}
                                onChange={() => handlePermissionChange(module.name, null, privilege)}
                                disabled={isSubmitting}
                                className="h-4 w-4 text-conv3r-gold border-gray-300 rounded focus:ring-conv3r-gold focus:ring-2 disabled:opacity-50"
                              />
                              <span className="text-sm text-gray-700 flex items-center gap-1.5 group-hover:text-gray-900 transition-colors">
                                {privilegeIcons[privilege]} 
                                {privilege}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Módulo con submódulos */}
                      {module.submodules && (
                        <div className="space-y-4">
                          {module.submodules.map(submodule => (
                            <div key={submodule.name} className="bg-white border border-gray-200 rounded-lg p-4">
                              <h5 className="font-semibold text-gray-700 mb-3">{submodule.name}</h5>
                              <div className="flex flex-wrap gap-4">
                                {submodule.privileges.map(privilege => (
                                  <label key={privilege} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      checked={!!permissions[`${module.name}.${submodule.name}`]?.[privilege]}
                                      onChange={() => handlePermissionChange(module.name, submodule.name, privilege)}
                                      disabled={isSubmitting}
                                      className="h-4 w-4 text-conv3r-gold border-gray-300 rounded focus:ring-conv3r-gold focus:ring-2 disabled:opacity-50"
                                    />
                                    <span className="text-sm text-gray-700 flex items-center gap-1.5 group-hover:text-gray-900 transition-colors">
                                      {privilegeIcons[privilege]} 
                                      {privilege}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

               {/* Footer */}
               <div className="flex justify-end gap-4 border-t border-gray-200 p-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg bg-conv3r-gold text-conv3r-dark font-semibold hover:bg-conv3r-gold/90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Rol'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewRoleModal;
