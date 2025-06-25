import React from 'react';
import { FaEye } from 'react-icons/fa';

const PagosTable = ({ pagos }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-center">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Fecha</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Número de Contrato</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nombre y Apellido</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Monto Total</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Monto Pagado</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Método de Pago</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {pagos.map((pago) => (
                        <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2">{pago.id}</td>
                            <td className="px-4 py-2">{pago.fecha}</td>
                            <td className="px-4 py-2">{pago.numeroContrato}</td>
                            <td className="px-4 py-2">{pago.nombreCompleto}</td>
                            <td className="px-4 py-2">{pago.montoTotal.toLocaleString()}</td>
                            <td className="px-4 py-2">{pago.montoPagado.toLocaleString()}</td>
                            <td className="px-4 py-2">{pago.metodoPago}</td>
                            <td className="px-4 py-2">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${pago.estado === 'Pagado'
                                        ? 'bg-green-100 text-green-800'
                                        : pago.estado === 'Cancelado'
                                            ? 'bg-yellow-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {pago.estado}
                                </span>
                            </td>
                            <td className="px-4 py-2">
                                <button className="text-blue-600 hover:text-blue-800" title="Ver detalle">
                                    <FaEye />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PagosTable;
