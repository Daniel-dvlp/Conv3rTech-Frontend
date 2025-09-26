import React from 'react';
import { FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';
import ClientsDetailModal from './ClientsDetailModal';
import { useState } from 'react';



const ClientesTable = ({ clientes, onEdit, onDelete, onChangeStatus, onChangeCredit }) => {
  const [selectedClient, setSelectedClient] = useState(null);



  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full text-center">
        <thead className="bg-gray-50">
          <tr>
            {['Documento', 'Tipo de Documento', 'Nombre y Apellido', 'Correo electrónico', 'Teléfono', 'Estado', 'Crédito', 'Acciones'].map((header, i) => (
              <th key={i} className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {clientes.map((cliente) => (
            <tr key={cliente.id_cliente} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2">{cliente.documento}</td>
              <td className="px-4 py-2">{cliente.tipo_documento}</td>
              <td className="px-4 py-2">{cliente.nombre} {cliente.apellido}</td>
              <td className="px-4 py-2">{cliente.correo}</td>
              <td className="px-4 py-2">{cliente.telefono}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    cliente.estado_cliente ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {cliente.estado_cliente ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-2">
                <span
                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    cliente.credito ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {cliente.credito ? 'Con Crédito' : 'Sin Crédito'}
                </span>
              </td>
              <td className="px-4 py-2">
                <div className="flex justify-center gap-3">
                  <button className="text-blue-600 hover:text-blue-800" onClick={() => {
                    console.log('Cliente seleccionado:', cliente);
                    setSelectedClient(cliente);
                  }} title="Ver detalles">
                    <FaEye />
                  </button>
                  <button className="text-yellow-600 hover:text-yellow-800" title="Editar"
                  onClick={() => onEdit(cliente)}>
                    <FaEdit />
                  </button>
                  <button className="text-red-600 hover:text-red-800" title="Eliminar" onClick={() => onDelete(cliente.id_cliente)}>
                    <FaTrashAlt />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ClientsDetailModal
        cliente={selectedClient}
        onClose={() => setSelectedClient(null)}
      />
      

    </div>
  );
};

export default ClientesTable;
