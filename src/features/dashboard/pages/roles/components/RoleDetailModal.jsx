import React from 'react';
import {
  FaTimes,
  FaShieldAlt,
  FaClipboardList,
  FaPencilAlt,
  FaPlus,
  FaEye,
  FaTrash,
  FaBan,
} from 'react-icons/fa';

// --- SUB-COMPONENTES INTERNOS PARA UN CÓDIGO MÁS LIMPIO ---

// Iconos y clases para cada privilegio
const privilegeMap = {
  Crear: { icon: <FaPlus />, class: 'bg-green-100 text-green-800' },
  Ver: { icon: <FaEye />, class: 'bg-blue-100 text-blue-800' },
  Editar: { icon: <FaPencilAlt />, class: 'bg-yellow-100 text-yellow-800' },
  Eliminar: { icon: <FaTrash />, class: 'bg-red-100 text-red-800' },
  Anular: { icon: <FaBan />, class: 'bg-orange-100 text-orange-800' },
};

// Header del modal: ahora recibe 'onEdit' y lo usa en el botón
const ModalHeader = ({ role, onClose, onEdit }) => (
  <header className="flex justify-between items-center p-5 border-b bg-white rounded-t-xl flex-shrink-0">
    <div>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
        <FaShieldAlt className="text-conv3r-gold" />
        Detalles del Rol
      </h2>
      <p className="text-lg text-gray-600 font-semibold">{role.name}</p>
    </div>
    <div className="flex gap-2 items-center">
      <button
        onClick={onEdit} // Llama a la función del padre para abrir el modal de edición
        className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-lg text-sm transition-colors shadow-sm"
      >
        <FaPencilAlt /> Editar
      </button>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-700 text-2xl p-2 rounded-full transition-colors hover:bg-gray-100"
      >
        <FaTimes />
      </button>
    </div>
  </header>
);

// Sección de Descripción del rol
const RoleDescription = ({ description }) => (
  <section className="bg-gray-50 rounded-lg p-4 mb-6 border">
    <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
      <FaClipboardList /> Descripción
    </h3>
    <p className="text-sm text-gray-600">{description}</p>
  </section>
);

// Sección de Permisos del rol, agrupados por módulo principal
const RolePermissions = ({ permissions }) => {
  const permissionsList = Object.entries(permissions || {});

  const groupedByModule = permissionsList.reduce((acc, [key, privileges]) => {
    const [main, sub] = key.split('.');
    if (!acc[main]) acc[main] = [];
    acc[main].push({ submodule: sub || main, privileges });
    return acc;
  }, {});

  const totalCount = permissionsList.reduce((acc, [, privs]) => acc + privs.length, 0);

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Permisos Asignados</h3>
          <p className="text-sm text-gray-500 font-medium">
            Total de privilegios: <strong>{totalCount}</strong>
          </p>
      </div>
      <div className="space-y-6">
        {Object.entries(groupedByModule).map(([module, submodules]) => (
          <div key={module} className="border border-gray-200 rounded-xl bg-white shadow-sm">
            <h4 className="text-lg font-bold text-gray-900 mb-2 capitalize bg-gray-100 p-4 rounded-t-xl border-b">
              {module}
            </h4>
            <div className="space-y-4 p-4">
              {submodules.map(({ submodule, privileges }) => (
                <div key={submodule} className="border-l-4 border-conv3r-gold pl-4">
                  <h5 className="text-md font-semibold text-gray-700 mb-2">
                    {submodule !== module ? submodule : 'Permisos Generales'}
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {privileges.map((priv) => {
                      const style = privilegeMap[priv] || { icon: null, class: 'bg-gray-100 text-gray-700' };
                      return (
                        <span
                          key={priv}
                          className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full ${style.class}`}
                        >
                          {style.icon} {priv}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};


// --- COMPONENTE PRINCIPAL ---

const RoleDetailModal = ({ role, onClose, onEdit }) => {
  // Ya no se usa 'useNavigate' aquí
  if (!role) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-100 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border" onClick={(e) => e.stopPropagation()}>
        <ModalHeader role={role} onClose={onClose} onEdit={onEdit} />
        <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <RoleDescription description={role.description} />
          <RolePermissions permissions={role.permissions} />
        </div>
      </div>
    </div>
  );
};

export default RoleDetailModal;