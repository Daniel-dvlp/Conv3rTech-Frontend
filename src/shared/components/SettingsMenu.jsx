// src/shared/components/SettingsMenu.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUserShield, FaUserEdit } from 'react-icons/fa';

const menuConfig = {
  'Gestión de Roles': <FaUserShield />,
  'Editar mi Perfil': <FaUserEdit />,
};

const SettingsMenu = ({ menuItems, onClose }) => {
  const location = useLocation();

  return (
    <div
      className="bg-[#0B0D2E] border border-yellow-500/30 rounded-xl shadow-xl p-3 w-64
                backdrop-blur-md animate-fade-in transition-all z-50"
    >
      <ul className="space-y-1">
        {menuItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all duration-200
                ${location.pathname === item.path
                  ? 'bg-yellow-400/20 text-yellow-300 font-semibold'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
            >
              <span className="text-lg text-yellow-400">{menuConfig[item.name]}</span>
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SettingsMenu;
