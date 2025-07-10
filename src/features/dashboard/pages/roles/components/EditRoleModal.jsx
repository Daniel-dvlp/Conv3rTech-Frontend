import React, { useState, useEffect } from 'react';
import { FaTimes, FaShieldAlt, FaPlus, FaPencilAlt, FaTrash, FaEye, FaBan, FaSpinner } from 'react-icons/fa';

// --- CONFIGURACIÓN Y COMPONENTES INTERNOS ---
const MODULES_CONFIG = [
  { name: 'Dashboard', icon: '📊', privileges: ['Ver'] },
  { name: 'Usuarios', icon: '👥', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
  { name: 'Compras', icon: '💰', submodules: [
    { name: 'Proveedores', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
    { name: 'Categorías de Productos', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
    { name: 'Productos', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
    { name: 'Compras', privileges: ['Crear', 'Ver', 'Editar', 'Anular'] }
  ]},
  { name: 'Servicios', icon: '🔧', submodules: [
    { name: 'Categoría de Servicios', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
    { name: 'Órdenes de Servicio', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
    { name: 'Programación laboral', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] }
  ]},
  { name: 'Ventas', icon: '📈', submodules: [
    { name: 'Clientes', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
    { name: 'Venta de Productos', privileges: ['Crear', 'Ver', 'Editar', 'Anular'] },
    { name: 'Órdenes de Servicios', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
    { name: 'Citas', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
    { name: 'Cotizaciones', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
    { name: 'Proyectos de Servicio', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] },
    { name: 'Pagos y Abonos', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] }
  ]},
  { name: 'Configuración', icon: '⚙️', submodules: [
    { name: 'Editar mi Perfil', privileges: ['Ver', 'Editar'] },
    { name: 'Gestión de Roles', privileges: ['Crear', 'Ver', 'Editar', 'Eliminar'] }
  ]}
];

const privilegeIcons = {
  'Crear': <FaPlus className="text-green-500" />,
  'Ver': <FaEye className="text-blue-500" />,
  'Editar': <FaPencilAlt className="text-yellow-500" />,
  'Eliminar': <FaTrash className="text-red-500" />,
  'Anular': <FaBan className="text-orange-500" />
};

const FormLabel = ({ children }) => <label className="block text-sm font-medium text-gray-700 mb-2">{children}</label>;
const inputBaseStyle = "block w-full text-sm border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold transition-colors";

// --- COMPONENTE PRINCIPAL DEL MODAL DE EDICIÓN ---

const EditRoleModal = ({ isOpen, onClose, role, onUpdate }) => {
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (role && isOpen) {
      setRoleName(role.name || '');
      setDescription(role.description || '');
      
      const initialPerms = {};
      Object.entries(role.permissions || {}).forEach(([key, privsArray]) => {
        initialPerms[key] = {};
        (privsArray || []).forEach(privilege => {
          initialPerms[key][privilege] = true;
        });
      });
      setPermissions(initialPerms);
    }
  }, [role, isOpen]);

  const handlePermissionChange = (moduleName, submoduleName, privilege) => {
    const key = submoduleName ? `${moduleName}.${submoduleName}` : moduleName;
    setPermissions(prev => {
      const currentPrivs = prev[key] || {};
      return { ...prev, [key]: { ...currentPrivs, [privilege]: !currentPrivs[privilege] } };
    });
  };
  
  const handleSelectAllModule = (moduleName, moduleConfig) => {
    const hasSubmodules = moduleConfig.submodules && moduleConfig.submodules.length > 0;
    const newPermissions = { ...permissions };
    
    let isAllSelected;
    if (hasSubmodules) {
      isAllSelected = moduleConfig.submodules.every(sub => sub.privileges.every(priv => newPermissions[`${moduleName}.${sub.name}`]?.[priv]));
      moduleConfig.submodules.forEach(sub => {
        const key = `${moduleName}.${sub.name}`;
        newPermissions[key] = {};
        if (!isAllSelected) {
          sub.privileges.forEach(priv => { newPermissions[key][priv] = true; });
        }
      });
    } else {
      isAllSelected = moduleConfig.privileges.every(priv => newPermissions[moduleName]?.[priv]);
      newPermissions[moduleName] = {};
      if (!isAllSelected) {
        moduleConfig.privileges.forEach(priv => { newPermissions[moduleName][priv] = true; });
      }
    }
    setPermissions(newPermissions);
  };
  
  const isModuleFullySelected = (moduleName, moduleConfig) => {
    const hasSubmodules = moduleConfig.submodules && moduleConfig.submodules.length > 0;
    if (hasSubmodules) {
      return moduleConfig.submodules.every(sub => sub.privileges.every(priv => permissions[`${moduleName}.${sub.name}`]?.[priv]));
    } else {
      return moduleConfig.privileges.every(priv => permissions[moduleName]?.[priv]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName.trim() || !description.trim()) { alert('Nombre y descripción son obligatorios'); return; }

    setIsSubmitting(true);
    const formattedPermissions = {};
    Object.entries(permissions).forEach(([key, privs]) => {
      const selected = Object.keys(privs).filter(k => privs[k]);
      if (selected.length > 0) formattedPermissions[key] = selected;
    });

    if (Object.keys(formattedPermissions).length === 0) { alert('Debes seleccionar al menos un permiso'); setIsSubmitting(false); return; }

    const updatedRoleData = { name: roleName.trim(), description: description.trim(), permissions: formattedPermissions };
    
    await onUpdate(role.id, updatedRoleData);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen || !role) return null;

  const selectedCount = Object.values(permissions).reduce((acc, privs) => acc + Object.values(privs).filter(Boolean).length, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FaShieldAlt className="text-conv3r-gold" /> Editar Rol: <span className="text-blue-600">{role.name}</span>
            </h2>
            <p className="text-sm text-gray-600 mt-1">{selectedCount} privilegio(s) seleccionado(s)</p>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 p-2 rounded-full"><FaTimes size={24} /></button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <FormLabel>Nombre del Rol *</FormLabel>
                <input type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)} className={inputBaseStyle} required disabled={isSubmitting}/>
              </div>
              <div>
                <FormLabel>Descripción *</FormLabel>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className={`${inputBaseStyle} resize-none`} required disabled={isSubmitting}/>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Permisos y Privilegios</h3>
              <div className="space-y-4">
                {MODULES_CONFIG.map(module => (
                  <div key={module.name} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3"><span className="text-lg">{module.icon}</span><h4 className="font-bold text-gray-800">{module.name}</h4></div>
                        <button type="button" onClick={() => handleSelectAllModule(module.name, module)} disabled={isSubmitting} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${isModuleFullySelected(module.name, module) ? 'bg-conv3r-gold text-conv3r-dark' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-200'}`}>
                          {isModuleFullySelected(module.name, module) ? 'Desmarcar Todo' : 'Marcar Todo'}
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      {!module.submodules ? (
                        <div className="flex flex-wrap gap-x-6 gap-y-3">
                          {module.privileges.map(priv => (
                            <label key={priv} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!permissions[module.name]?.[priv]} onChange={() => handlePermissionChange(module.name, null, priv)} disabled={isSubmitting} className="h-4 w-4 text-conv3r-gold border-gray-300 rounded focus:ring-conv3r-gold"/> <span className="text-sm text-gray-700 flex items-center gap-1.5">{privilegeIcons[priv]} {priv}</span></label>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {module.submodules.map(submodule => (
                            <div key={submodule.name} className="bg-white border border-gray-200 rounded-lg p-4">
                              <h5 className="font-semibold text-gray-700 mb-3">{submodule.name}</h5>
                              <div className="flex flex-wrap gap-x-6 gap-y-3">
                                {submodule.privileges.map(privilege => (
                                  <label key={privilege} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!permissions[`${module.name}.${submodule.name}`]?.[privilege]} onChange={() => handlePermissionChange(module.name, submodule.name, privilege)} disabled={isSubmitting} className="h-4 w-4 text-conv3r-gold border-gray-300 rounded focus:ring-conv3r-gold"/> <span className="text-sm text-gray-700 flex items-center gap-1.5">{privilegeIcons[privilege]} {privilege}</span></label>
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
          </div>

          <div className="p-6 border-t flex justify-end gap-4 bg-gray-50 rounded-b-xl">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg border font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-lg bg-conv3r-gold text-conv3r-dark font-bold hover:brightness-95 flex items-center gap-2 disabled:opacity-50">
              {isSubmitting && <FaSpinner className="animate-spin" />}
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoleModal;