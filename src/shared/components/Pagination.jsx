// src/shared/components/Pagination.jsx

import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// El componente recibe props para saber cómo comportarse:
// currentPage: La página actual en la que estamos.
// totalPages: El número total de páginas.
// onPageChange: La función que se debe llamar cuando el usuario hace clic en un botón.
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // No mostramos nada si solo hay una página o menos.
  if (totalPages <= 0 ) {
    return null;
  }

  // Generamos los números de página que se mostrarán.
  // Es una lógica simple, se podría hacer más compleja para mostrar "..."
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 mt-4 border-t border-gray-200">
      {/* Botón "Anterior" */}
      <div className="flex flex-1 justify-start">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1} // Se deshabilita si estamos en la primera página
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaChevronLeft className="h-5 w-5 mr-2" aria-hidden="true" />
          Anterior
        </button>
      </div>

      {/* Números de Página */}
      <div className="hidden sm:flex sm:items-center sm:justify-center">
        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => onPageChange(number)}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                currentPage === number
                  ? 'z-10 bg-conv3r-gold text-conv3r-dark focus:z-20' // Estilo para la página activa
                  : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20'
              }`}
            >
              {number}
            </button>
          ))}
        </nav>
      </div>

      {/* Botón "Siguiente" */}
      <div className="flex flex-1 justify-end">
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages} // Se deshabilita si estamos en la última página
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
          <FaChevronRight className="h-5 w-5 ml-2" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;