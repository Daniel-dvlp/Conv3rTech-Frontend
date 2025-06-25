import React from 'react';
import { FaUserCircle, FaBell } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="w-full h-16 bg-white text-white flex items-center justify-between px-6 shadow-sm">
      <h1></h1>
      {/* Iconos alineados a la derecha */}
      <div className="flex items-center gap-6">
        <button className="text-2xl text-[#00012A] hover:text-gray-400 transition-colors">
          <FaBell />
        </button>
        <button className="text-2xl text-[#00012A] hover:text-gray-400 transition-colors">
          <FaUserCircle />
        </button>
      </div>
    </header>
  );
};

export default Header;