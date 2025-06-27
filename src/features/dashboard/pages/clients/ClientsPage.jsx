import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import ClientesTable from './components/ClientesTable';
import SkeletonRow from './components/SkeletonRow';
import { mockClientes } from './data/Clientes_data';
import Pagination from '../../../../shared/components/Pagination'; // si tienes paginación

const ITEMS_PER_PAGE = 5; // o el número que desees

const ClientsPage = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setClientes(mockClientes);
      setLoading(false);
    }, 1200);
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
        <button className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all">
          <FaPlus />
          Crear Cliente
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-gray-50">
              <tr>
                {['Documento', 'Tipo de Documento', 'Nombre', 'Apellido', 'Correo electrónico', 'Celular', 'Estado', 'Acciones'].map((header, i) => (
                  <th key={i} className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(5)].map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
        <ClientesTable clientes={clientes} />
        <Pagination 
          totalItems={clientes.length}
          itemsPerPage={ITEMS_PER_PAGE}
          currentPage={1} // Aquí puedes manejar el estado de la página actual
          onPageChange={(page) => console.log(`Página cambiada a: ${page}`)} // Maneja el cambio de página
        ></Pagination>
        </>
        
      )}
    </div>
  );
};

export default ClientsPage;
