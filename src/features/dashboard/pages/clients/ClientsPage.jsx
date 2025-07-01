import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import ClientesTable from './components/ClientesTable';
import SkeletonRow from './components/SkeletonRow';
import { mockClientes } from './data/Clientes_data';
import Pagination from '../../../../shared/components/Pagination';
import CreateClientModal from './components/CreateClientModal';

const ITEMS_PER_PAGE = 5;



const ClientsPage = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const handleAddCliente = (nuevoCliente) => {
    setClientes((prev) => [...prev, { id: Date.now(), ...nuevoCliente }]);
  };

  useEffect(() => {
    setTimeout(() => {
      setClientes(mockClientes);
      setLoading(false);
    }, 1200);
  }, []);

  // Filtro por búsqueda
 const term = searchTerm.trim().toLowerCase();

const filteredClients = useMemo(() =>
  clientes.filter(c =>
    (c.nombre || '').toLowerCase().includes(term) ||
    (c.apellido || '').toLowerCase().includes(term) ||
    (c.documento || '').toLowerCase() === term ||
    (c.tipoDocumento || '').toLowerCase() === term ||
    (c.email || '').toLowerCase() === term ||
    (c.estado ? 'activo' : 'inactivo') === term
  ), [clientes, searchTerm]
);


  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredClients, currentPage]);

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all"
            onClick={() => setOpenModal(true)}  >
            <FaPlus />
            Crear Cliente
          </button>
        </div>
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
              {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <ClientesTable clientes={paginatedClients} />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
          <CreateClientModal
            isOpen={openModal}
            onClose={() => setOpenModal(false)}
            onSubmit={handleAddCliente}
          />

        </>
      )}
    </div>
  );
};

export default ClientsPage;
