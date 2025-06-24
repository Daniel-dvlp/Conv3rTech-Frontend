import React from 'react';
import { FaUserCircle, FaBell } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="w-full h-16 bg-[#00012A] text-white flex items-center px-6 shadow-md">
      {/* Aquí podrías poner un logo o texto si quieres */}
      <h1 className="text-lg font-semibold"></h1>

      {/* Este div empuja el contenido siguiente a la derecha */}
      <div className="flex-1" />

      {/* Iconos alineados a la derecha */}
      <div className="flex items-center gap-6">
        <button className="text-2xl hover:text-gray-300 transition-colors">
          <FaBell />
        </button>
        <button className="text-2xl hover:text-gray-300 transition-colors">
          <FaUserCircle />
        </button>
      </div>
    </header>
  );
};

export default Header;
