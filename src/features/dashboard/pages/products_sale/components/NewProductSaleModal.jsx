import React, { useState } from 'react';
import { FaTrash, FaTimes } from 'react-icons/fa';
import { mockProducts } from '../../products/data/Products_data';
import { mockClientes } from '../../clients/data/Clientes_data';

const FormSection = ({ title, children }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const FormLabel = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const inputBaseStyle = 'block w-full text-sm text-gray-500 border border-gray-300 rounded-lg shadow-sm p-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold';

const NewProductSaleModal = ({ isOpen, onClose, onSave }) => {
    const [documentoCliente, setDocumentoCliente] = useState('');
    const [cliente, setCliente] = useState(null);
    const [codigoProducto, setCodigoProducto] = useState('');
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [cantidad, setCantidad] = useState('');
    const [productosAgregados, setProductosAgregados] = useState([]);
    const [metodoPago, setMetodoPago] = useState('');
    const [errores, setErrores] = useState({});

    if (!isOpen) return null;

    const handleBuscarCliente = () => {
        const encontrado = mockClientes.find(c => c.documento === documentoCliente);
        setCliente(encontrado || null);
    };

    const handleBuscarProducto = () => {
        const encontrado = mockProducts.find(p => p.codigo === codigoProducto);
        setProductoSeleccionado(encontrado || null);
    };

    const handleAgregarProducto = () => {
        if (productoSeleccionado && cantidad > 0) {
            const nuevo = {
                ...productoSeleccionado,
                cantidad: Number(cantidad),
                subtotal: productoSeleccionado.precio * cantidad,
            };
            setProductosAgregados(prev => [...prev, nuevo]);
            setCodigoProducto('');
            setProductoSeleccionado(null);
            setCantidad('');
            setErrores(prev => ({ ...prev, producto: null }));
        } else {
            setErrores(prev => ({ ...prev, producto: 'Completa todos los campos del producto' }));
        }
    };

    const subtotal = productosAgregados.reduce((acc, p) => acc + p.subtotal, 0);
    const iva = subtotal * 0.19;
    const monto = subtotal + iva;

    const handleGuardar = () => {
        const nuevosErrores = {};
        if (!cliente) nuevosErrores.cliente = 'Selecciona un cliente';
        if (!metodoPago) nuevosErrores.metodoPago = 'Selecciona un método de pago';
        if (productosAgregados.length === 0) nuevosErrores.productos = 'Agrega al menos un producto';

        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length === 0) {
            const nuevaVenta = {
                numero: `V-${Date.now()}`,
                cliente: `${cliente.nombre} ${cliente.apellido}`, // para mostrar rápido en tablas
                clienteData: cliente, // objeto completo del cliente
                metodoPago,
                productos: productosAgregados,
                fechaHora: new Date().toLocaleString(),
                estado: 'Pendiente',
                subtotal,
                iva,
                monto,
            };

            onSave(nuevaVenta);
            onClose();
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scroll" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-3xl font-bold text-gray-800">Crear Venta</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2">
                        <FaTimes />
                    </button>
                </header>

                <form className="p-6 space-y-6">
                    <FormSection title="Cliente">
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <FormLabel htmlFor="documento">Número de identificación:</FormLabel>
                                <input
                                    type="text"
                                    id="documento"
                                    value={documentoCliente}
                                    onChange={(e) => setDocumentoCliente(e.target.value)}
                                    className={inputBaseStyle}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleBuscarCliente}
                                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-4 py-2 rounded-lg  shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Buscar
                            </button>
                        </div>
                        {cliente && (
                            <div className="mt-2 text-sm text-gray-600">
                                <p><strong>Nombre:</strong> {cliente.nombre}</p>
                                <p><strong>Email:</strong> {cliente.email}</p>
                                <p><strong>Celular:</strong> {cliente.celular}</p>
                            </div>
                        )}
                        {errores.cliente && <p className="text-red-500 text-sm mt-1">{errores.cliente}</p>}
                    </FormSection>

                    <FormSection title="Productos">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <FormLabel htmlFor="codigo">Código de barras:</FormLabel>
                                <input
                                    type="text"
                                    id="codigo"
                                    value={codigoProducto}
                                    onChange={(e) => setCodigoProducto(e.target.value)}
                                    className={inputBaseStyle}
                                />
                            </div>
                            <div>
                                <FormLabel htmlFor="cantidad">Cantidad:</FormLabel>
                                <input
                                    type="number"
                                    id="cantidad"
                                    value={cantidad}
                                    onChange={(e) => setCantidad(e.target.value)}
                                    className={inputBaseStyle}
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={handleBuscarProducto}
                                    className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-4 py-2 rounded-lg  shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Buscar Producto
                                </button>
                            </div>
                        </div>

                        {productoSeleccionado && (
                            <div className="mt-2 text-sm text-gray-600">
                                <p><strong>Producto:</strong> {productoSeleccionado.nombre}</p>
                                <p><strong>Modelo:</strong> {productoSeleccionado.modelo}</p>
                                <p><strong>Precio:</strong> ${productoSeleccionado.precio.toLocaleString()}</p>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleAgregarProducto}
                            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-4 py-2 rounded-lg  shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Agregar producto
                        </button>

                        <div className="overflow-x-auto mt-6">
                            <table className="w-full text-sm text-center border">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2">Producto</th>
                                        <th>Modelo</th>
                                        <th>Cantidad</th>
                                        <th>Precio Unit.</th>
                                        <th>Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productosAgregados.map((p, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="p-2">{p.nombre}</td>
                                            <td>{p.modelo}</td>
                                            <td>{p.cantidad}</td>
                                            <td>${p.precio.toLocaleString()}</td>
                                            <td>${p.subtotal.toLocaleString()}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const copia = [...productosAgregados];
                                                        copia.splice(index, 1);
                                                        setProductosAgregados(copia);
                                                    }}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {errores.productos && <p className="text-red-500 text-sm mt-2">{errores.productos}</p>}
                        </div>
                    </FormSection>

                    <FormSection title="Método de pago">
                        <div className="relative">
                            <select
                                value={metodoPago}
                                onChange={(e) => setMetodoPago(e.target.value)}
                                className={`${inputBaseStyle} appearance-none pr-10 text-gray-500`}
                                required
                            >
                                <option value="">Seleccionar método</option>
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">Transferencia</option>
                            </select>

                            {/* Icono de flecha */}
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                        </div>

                        {errores.metodoPago && (
                            <p className="text-red-500 text-sm mt-1">{errores.metodoPago}</p>
                        )}
                    </FormSection>


                    <FormSection title="Resumen">
                        <p>Subtotal productos: <span className="font-semibold">${subtotal.toLocaleString()}</span></p>
                        <p>IVA (19%): <span className="font-semibold">${iva.toLocaleString()}</span></p>
                        <p>Total: <span className="font-bold text-conv3r-dark text-lg">${monto.toLocaleString()}</span></p>
                    </FormSection>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={handleGuardar}
                            className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-transform hover:scale-105"
                        >
                            Guardar y finalizar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewProductSaleModal;
