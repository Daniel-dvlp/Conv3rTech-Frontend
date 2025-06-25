import React from 'react';
import { FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';

const ClientesTable = ({ clientes }) => {
  return (
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
          {clientes.map((cliente) => (
            <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2">{cliente.documento}</td>
              <td className="px-4 py-2">{cliente.tipoDocumento}</td>
              <td className="px-4 py-2">{cliente.nombre}</td>
              <td className="px-4 py-2">{cliente.apellido}</td>
              <td className="px-4 py-2">{cliente.email}</td>
              <td className="px-4 py-2">{cliente.celular}</td>
              <td className="px-4 py-2">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  cliente.estado === 'Activo'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {cliente.estado}
                </span>
              </td>
              <td className="px-4 py-2">
                <div className="flex justify-center gap-3">
                  <button className="text-blue-600 hover:text-blue-800" title="Ver">
                    <FaEye />
                  </button>
                  <button className="text-yellow-600 hover:text-yellow-800" title="Editar">
                    <FaEdit />
                  </button>
                  <button className="text-red-600 hover:text-red-800" title="Eliminar">
                    <FaTrashAlt />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientesTable;
