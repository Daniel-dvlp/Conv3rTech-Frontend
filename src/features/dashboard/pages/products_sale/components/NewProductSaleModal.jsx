import React, { useState } from 'react';
import { FaTrash, FaTimes } from 'react-icons/fa';

const FormSection = ({ title, children }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const FormLabel = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const inputBaseStyle = 'block w-full text-sm border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500';

const NewProductSaleModal = ({ isOpen, onClose, onSave }) => {
    const [cliente, setCliente] = useState('');
    const [metodoPago, setMetodoPago] = useState('');
    const [producto, setProducto] = useState('');
    const [modelo, setModelo] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [productosAgregados, setProductosAgregados] = useState([]);
    const [errores, setErrores] = useState({});

    if (!isOpen) return null;

    const handleAgregarProducto = () => {
        if (producto && modelo && cantidad > 0) {
            const nuevo = {
                producto,
                modelo,
                cantidad: Number(cantidad),
                precio: 200000,
                subtotal: 200000 * cantidad,
            };
            setProductosAgregados(prev => [...prev, nuevo]);
            setProducto('');
            setModelo('');
            setCantidad('');
            setErrores(prev => ({ ...prev, producto: null }));
        } else {
            setErrores(prev => ({ ...prev, producto: 'Completa todos los campos del producto' }));
        }
    };

    const handleGuardar = () => {
        const nuevosErrores = {};
        if (!cliente) nuevosErrores.cliente = 'Selecciona un cliente';
        if (!metodoPago) nuevosErrores.metodoPago = 'Selecciona un método de pago';
        if (productosAgregados.length === 0) nuevosErrores.productos = 'Agrega al menos un producto';

        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length === 0) {
            const nuevaVenta = {
                numero: `V-${Date.now()}`,
                cliente,
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

    const subtotal = productosAgregados.reduce((acc, p) => acc + p.subtotal, 0);
    const iva = subtotal * 0.19;
    const monto = subtotal + iva;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scroll"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-3xl font-bold text-gray-800">Crear Venta</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2">
                        <FaTimes />
                    </button>
                </header>

                <form className="p-6 space-y-6">
                    <FormSection title="Cliente">
                        <div>
                            <FormLabel htmlFor="cliente">Cliente:</FormLabel>
                            <select
                                id="cliente"
                                value={cliente}
                                onChange={(e) => setCliente(e.target.value)}
                                className={inputBaseStyle}
                            >
                                <option value="">Seleccionar cliente</option>
                                <option value="cliente1">Cliente 1</option>
                            </select>
                            {errores.cliente && <p className="text-red-500 text-sm mt-1">{errores.cliente}</p>}
                        </div>
                    </FormSection>

                    <FormSection title="Productos">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <FormLabel htmlFor="producto">Producto:</FormLabel>
                                <select
                                    id="producto"
                                    value={producto}
                                    onChange={(e) => setProducto(e.target.value)}
                                    className={inputBaseStyle}
                                >
                                    <option value="">Seleccionar producto</option>
                                    <option value="Cam">Cámara de seguridad</option>
                                </select>
                            </div>
                            <div>
                                <FormLabel htmlFor="modelo">Modelo:</FormLabel>
                                <select
                                    id="modelo"
                                    value={modelo}
                                    onChange={(e) => setModelo(e.target.value)}
                                    className={inputBaseStyle}
                                >
                                    <option value="">Seleccionar modelo</option>
                                    <option value="CS-01">CS-01</option>
                                </select>
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
                        </div>
                        {errores.producto && <p className="text-red-500 text-sm mt-1">{errores.producto}</p>}

                        <button
                            type="button"
                            onClick={handleAgregarProducto}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
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
                                        <th>Subtotal</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productosAgregados.map((p, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="p-2">{p.producto}</td>
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
                        <div>
                            <FormLabel htmlFor="metodoPago">Método de pago:</FormLabel>
                            <select
                                id="metodoPago"
                                value={metodoPago}
                                onChange={(e) => setMetodoPago(e.target.value)}
                                className={inputBaseStyle}
                            >
                                <option value="">Seleccionar método</option>
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">Transferencia</option>
                            </select>
                            {errores.metodoPago && <p className="text-red-500 text-sm mt-1">{errores.metodoPago}</p>}
                        </div>
                    </FormSection>

                    <FormSection title="Resumen">
                        <p>Subtotal productos: <span className="font-semibold">${subtotal.toLocaleString()}</span></p>
                        <p>IVA (19%): <span className="font-semibold">${iva.toLocaleString()}</span></p>
                        <p>Total: <span className="font-bold text-blue-700 text-lg">${monto.toLocaleString()}</span></p>
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