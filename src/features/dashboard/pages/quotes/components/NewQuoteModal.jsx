import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import SearchSelector from '../../products_sale/components/SearchSelector';

const inputBaseStyle = 'block w-full text-sm text-gray-500 border rounded-lg shadow-sm p-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold';

const FormSection = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const FormLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const NewQuoteModal = ({ isOpen, onClose, onSave, clients, products, services }) => {
  const [nombreCotizacion, setNombreCotizacion] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [cliente, setCliente] = useState(null);
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [metodoProductoSeleccionado, setMetodoProductoSeleccionado] = useState('');
  const [productoSel, setProductoSel] = useState(null);
  const [cantidadProducto, setCantidadProducto] = useState('');
  const [productosAgregados, setProductosAgregados] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [servicioSel, setServicioSel] = useState(null);
  const [cantidadServicio, setCantidadServicio] = useState('');
  const [serviciosAgregados, setServiciosAgregados] = useState([]);
  const [observaciones, setObservaciones] = useState('');
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (!isOpen) {
      // Limpiar estado al cerrar
      setNombreCotizacion('');
      setClienteSeleccionado('');
      setCliente(null);
      setFechaVencimiento('');
      setProductosAgregados([]);
      setServiciosAgregados([]);
      setObservaciones('');
      setErrores({});
      return;
    }
    // Fecha de vencimiento por defecto +7 días
    const today = new Date();
    const plus7 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const y = plus7.getFullYear();
    const m = String(plus7.getMonth() + 1).padStart(2, '0');
    const d = String(plus7.getDate()).padStart(2, '0');
    setFechaVencimiento(`${y}-${m}-${d}`);
  }, [isOpen]);

  // Cliente seleccionado (objeto)
  useEffect(() => {
    if (clienteSeleccionado === '') {
      setCliente(null);
      return;
    }
    const found = clients?.find(c => c.id_cliente === Number(clienteSeleccionado));
    setCliente(found || null);
  }, [clienteSeleccionado, clients]);

  // Producto seleccionado (objeto)
  useEffect(() => {
    if (metodoProductoSeleccionado === '') {
      setProductoSel(null);
      return;
    }
    const found = products?.find(p => p.id_producto === Number(metodoProductoSeleccionado));
    setProductoSel(found || null);
  }, [metodoProductoSeleccionado, products]);

  // Servicio seleccionado (objeto)
  useEffect(() => {
    if (servicioSeleccionado === '') {
      setServicioSel(null);
      return;
    }
    // servicios vienen con id_servicio
    const found = services?.find(s => s.id_servicio === Number(servicioSeleccionado) || s.id === Number(servicioSeleccionado));
    setServicioSel(found || null);
  }, [servicioSeleccionado, services]);

  if (!isOpen) return null;

  const handleAgregarProducto = () => {
    if (!productoSel || !cantidadProducto || Number(cantidadProducto) <= 0) {
      setErrores(prev => ({ ...prev, producto: 'Completa producto y cantidad válida' }));
      return;
    }
    if (productoSel.stock !== undefined && productoSel.stock < Number(cantidadProducto)) {
      setErrores(prev => ({ ...prev, producto: `Stock insuficiente. Disponible: ${productoSel.stock}` }));
      return;
    }
    const idx = productosAgregados.findIndex(p => p.id_producto === productoSel.id_producto);
    if (idx !== -1) {
      const copy = [...productosAgregados];
      const exist = copy[idx];
      const nuevaCantidad = exist.cantidad + Number(cantidadProducto);
      if (productoSel.stock !== undefined && productoSel.stock < nuevaCantidad) {
        setErrores(prev => ({ ...prev, producto: `Stock insuficiente. Disponible: ${productoSel.stock}` }));
        return;
      }
      copy[idx] = { ...exist, cantidad: nuevaCantidad, subtotal: nuevaCantidad * exist.precio };
      setProductosAgregados(copy);
    } else {
      setProductosAgregados(prev => ([
        ...prev,
        {
          id_producto: productoSel.id_producto,
          nombre: productoSel.nombre,
          modelo: productoSel.modelo,
          precio: productoSel.precio,
          cantidad: Number(cantidadProducto),
          subtotal: Number(cantidadProducto) * productoSel.precio,
        }
      ]));
    }
    setMetodoProductoSeleccionado('');
    setProductoSel(null);
    setCantidadProducto('');
    setErrores(prev => ({ ...prev, producto: null }));
  };

  const handleAgregarServicio = () => {
    if (!servicioSel || !cantidadServicio || Number(cantidadServicio) <= 0) {
      setErrores(prev => ({ ...prev, servicio: 'Completa servicio y cantidad válida' }));
      return;
    }
    const idx = serviciosAgregados.findIndex(s => (s.id_servicio ?? s.id) === (servicioSel.id_servicio ?? servicioSel.id));
    if (idx !== -1) {
      const copy = [...serviciosAgregados];
      const exist = copy[idx];
      const nuevaCantidad = exist.cantidad + Number(cantidadServicio);
      copy[idx] = { ...exist, cantidad: nuevaCantidad, subtotal: nuevaCantidad * exist.precio };
      setServiciosAgregados(copy);
    } else {
      const idServicio = servicioSel.id_servicio ?? servicioSel.id;
      setServiciosAgregados(prev => ([
        ...prev,
        {
          id_servicio: idServicio,
          nombre: servicioSel.nombre,
          precio: servicioSel.precio,
          cantidad: Number(cantidadServicio),
          subtotal: Number(cantidadServicio) * servicioSel.precio,
        }
      ]));
    }
    setServicioSeleccionado('');
    setServicioSel(null);
    setCantidadServicio('');
    setErrores(prev => ({ ...prev, servicio: null }));
  };

  const subtotalProductos = useMemo(() => productosAgregados.reduce((acc, p) => acc + p.subtotal, 0), [productosAgregados]);
  const subtotalServicios = useMemo(() => serviciosAgregados.reduce((acc, s) => acc + s.subtotal, 0), [serviciosAgregados]);
  const iva = useMemo(() => (subtotalProductos + subtotalServicios) * 0.19, [subtotalProductos, subtotalServicios]);
  const total = useMemo(() => subtotalProductos + subtotalServicios + iva, [subtotalProductos, subtotalServicios, iva]);

  const handleGuardar = () => {
    const errs = {};
    if (!nombreCotizacion?.trim()) errs.nombre = 'Ingresa el nombre de la cotización';
    if (!cliente) errs.cliente = 'Selecciona un cliente';
    if (!fechaVencimiento) errs.fecha = 'Selecciona la fecha de vencimiento';
    if (productosAgregados.length === 0 && serviciosAgregados.length === 0) errs.detalles = 'Agrega al menos un producto o servicio';
    setErrores(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      nombre_cotizacion: nombreCotizacion.trim(),
      id_cliente: Number(clienteSeleccionado),
      fecha_vencimiento: new Date(fechaVencimiento).toISOString(),
      estado: 'Pendiente',
      observaciones: observaciones.trim() || undefined,
      detalles: [
        ...productosAgregados.map(p => ({ id_producto: p.id_producto, cantidad: p.cantidad })),
        ...serviciosAgregados.map(s => ({ id_servicio: s.id_servicio, cantidad: s.cantidad })),
      ],
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scroll" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-3xl font-bold text-gray-800">Crear Cotización</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2">
            <FaTimes />
          </button>
        </header>

        <form className="p-6 space-y-6">
          <FormSection title="Información General">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <FormLabel htmlFor="nombreCotizacion">Nombre de la cotización <span className="text-red-500">*</span></FormLabel>
                <input
                  id="nombreCotizacion"
                  type="text"
                  value={nombreCotizacion}
                  onChange={(e) => { setNombreCotizacion(e.target.value); setErrores(prev => ({ ...prev, nombre: null })); }}
                  className={`${inputBaseStyle} ${errores.nombre ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Ej. Sistema CCTV para Sede Norte"
                />
                {errores.nombre && <p className="text-red-500 text-sm mt-1">{errores.nombre}</p>}
              </div>
              <div className="md:col-span-1">
                <SearchSelector
                  options={clients || []}
                  value={clienteSeleccionado}
                  onChange={(value) => { setClienteSeleccionado(value); setErrores(prev => ({ ...prev, cliente: null })); }}
                  placeholder="Buscar cliente por nombre o documento..."
                  displayKey={(client) => `${client.nombre} ${client.apellido}`}
                  searchKeys={[ 'nombre', 'apellido', 'documento' ]}
                  error={errores.cliente}
                  label="Cliente"
                  required={true}
                />
              </div>
              <div className="md:col-span-1">
                <FormLabel htmlFor="fechaVenc">Fecha de vencimiento <span className="text-red-500">*</span></FormLabel>
                <input
                  id="fechaVenc"
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => { setFechaVencimiento(e.target.value); setErrores(prev => ({ ...prev, fecha: null })); }}
                  className={`${inputBaseStyle} ${errores.fecha ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errores.fecha && <p className="text-red-500 text-sm mt-1">{errores.fecha}</p>}
              </div>
            </div>
            {cliente && (
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p><strong>Nombre:</strong> {cliente.nombre} {cliente.apellido}</p>
                <p><strong>Documento:</strong> {cliente.documento}</p>
                <p><strong>Email:</strong> {cliente.correo}</p>
                <p><strong>Celular:</strong> {cliente.telefono}</p>
              </div>
            )}
          </FormSection>

          <FormSection title="Productos">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <SearchSelector
                  options={products || []}
                  value={metodoProductoSeleccionado}
                  onChange={(value) => { setMetodoProductoSeleccionado(value); setErrores(prev => ({ ...prev, producto: null })); }}
                  placeholder="Buscar producto por nombre, modelo o código..."
                  displayKey={(product) => `${product.nombre} - ${product.modelo}`}
                  searchKeys={[ 'nombre', 'modelo', 'codigo_barra' ]}
                  error={errores.producto}
                  label="Producto"
                  required={false}
                />
              </div>
              <div>
                <FormLabel htmlFor="cantidadProducto">Cantidad</FormLabel>
                <div className="flex gap-2">
                  <input
                    id="cantidadProducto"
                    type="number"
                    value={cantidadProducto}
                    onChange={(e) => { setCantidadProducto(e.target.value); setErrores(prev => ({ ...prev, producto: null })); }}
                    className={`${inputBaseStyle} ${errores.producto ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Cantidad"
                  />
                  <button
                    type="button"
                    onClick={handleAgregarProducto}
                    className="inline-flex items-center justify-center w-10 h-10 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-2 py-2 rounded-lg shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            </div>
            {productoSel && (
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p><strong>Producto:</strong> {productoSel.nombre}</p>
                <p><strong>Modelo:</strong> {productoSel.modelo}</p>
                <p><strong>Precio:</strong> ${productoSel.precio?.toLocaleString?.() ?? productoSel.precio}</p>
                {productoSel.stock !== undefined && <p><strong>Stock disponible:</strong> {productoSel.stock}</p>}
                <p><strong>Código:</strong> {productoSel.codigo_barra || 'Sin código'}</p>
              </div>
            )}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-center border border-gray-200">
                <thead className="bg-conv3r-dark text-white">
                  <tr>
                    <th className="p-3 font-semibold">Producto</th>
                    <th className="font-semibold">Modelo</th>
                    <th className="font-semibold">Unidad</th>
                    <th className="font-semibold">Cantidad</th>
                    <th className="font-semibold">Precio Unitario</th>
                    <th className="font-semibold">Subtotal</th>
                    <th className="p-3">Eliminar</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-gray-700">
                  {productosAgregados.map((p, idx) => (
                    <tr key={idx} className="border-t border-gray-200">
                      <td className="p-3">{p.nombre}</td>
                      <td className="p-3">{p.modelo}</td>
                      <td className="p-3">{p.unidad_medida || 'N/A'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...productosAgregados];
                              if (copy[idx].cantidad > 1) {
                                copy[idx].cantidad -= 1;
                                copy[idx].subtotal = copy[idx].cantidad * copy[idx].precio;
                                setProductosAgregados(copy);
                              }
                            }}
                            className="text-gray-600 hover:text-gray-800 p-1"
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="w-8 text-center">{p.cantidad}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...productosAgregados];
                              copy[idx].cantidad += 1;
                              copy[idx].subtotal = copy[idx].cantidad * copy[idx].precio;
                              setProductosAgregados(copy);
                            }}
                            className="text-gray-600 hover:text-gray-800 p-1"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="p-3">${p.precio.toLocaleString('es-CO')}</td>
                      <td className="p-3">${p.subtotal.toLocaleString('es-CO')}</td>
                      <td className="w-12">
                        <button
                          type="button"
                          onClick={() => { const copy = [...productosAgregados]; copy.splice(idx, 1); setProductosAgregados(copy); }}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t text-sm text-gray-700">
                  <tr>
                    <td colSpan="6" className="text-right font-semibold px-4 py-2">Subtotal:</td>
                    <td className="font-bold px-4 py-2 text-right text-conv3r-gold">
                      ${subtotalProductos.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
              {errores.detalles && <p className="text-red-500 text-sm mt-2">{errores.detalles}</p>}
              {errores.producto && <p className="text-red-500 text-sm mt-2">{errores.producto}</p>}
            </div>
          </FormSection>

          <FormSection title="Servicios">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <SearchSelector
                  options={services || []}
                  value={servicioSeleccionado}
                  onChange={(value) => { setServicioSeleccionado(value); setErrores(prev => ({ ...prev, servicio: null })); }}
                  placeholder="Buscar servicio por nombre..."
                  displayKey={(s) => `${s.nombre}`}
                  searchKeys={[ 'nombre', 'descripcion' ]}
                  error={errores.servicio}
                  label="Servicio"
                  required={false}
                />
              </div>
              <div>
                <FormLabel htmlFor="cantidadServicio">Cantidad</FormLabel>
                <div className="flex gap-2">
                  <input
                    id="cantidadServicio"
                    type="number"
                    value={cantidadServicio}
                    onChange={(e) => { setCantidadServicio(e.target.value); setErrores(prev => ({ ...prev, servicio: null })); }}
                    className={`${inputBaseStyle} ${errores.servicio ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Cantidad"
                  />
                  <button
                    type="button"
                    onClick={handleAgregarServicio}
                    className="inline-flex items-center justify-center w-10 h-10 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-2 py-2 rounded-lg shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            </div>
            {servicioSel && (
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p><strong>Servicio:</strong> {servicioSel.nombre}</p>
                <p><strong>Precio:</strong> ${servicioSel.precio?.toLocaleString?.() ?? servicioSel.precio}</p>
                <p><strong>Descripción:</strong> {servicioSel.descripcion}</p>
              </div>
            )}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-center border border-gray-200">
                <thead className="bg-conv3r-dark text-white">
                  <tr>
                    <th className="p-3 font-semibold">Servicio</th>
                    <th className="font-semibold">Cantidad</th>
                    <th className="font-semibold">Precio Unitario</th>
                    <th className="font-semibold">Subtotal</th>
                    <th className="p-3">Eliminar</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-gray-700">
                  {serviciosAgregados.map((s, idx) => (
                    <tr key={idx} className="border-t border-gray-200">
                      <td className="p-3">{s.nombre}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...serviciosAgregados];
                              if (copy[idx].cantidad > 1) {
                                copy[idx].cantidad -= 1;
                                copy[idx].subtotal = copy[idx].cantidad * copy[idx].precio;
                                setServiciosAgregados(copy);
                              }
                            }}
                            className="text-gray-600 hover:text-gray-800 p-1"
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="w-8 text-center">{s.cantidad}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...serviciosAgregados];
                              copy[idx].cantidad += 1;
                              copy[idx].subtotal = copy[idx].cantidad * copy[idx].precio;
                              setServiciosAgregados(copy);
                            }}
                            className="text-gray-600 hover:text-gray-800 p-1"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="p-3">${s.precio.toLocaleString('es-CO')}</td>
                      <td className="p-3">${s.subtotal.toLocaleString('es-CO')}</td>
                      <td className="w-12">
                        <button
                          type="button"
                          onClick={() => { const copy = [...serviciosAgregados]; copy.splice(idx, 1); setServiciosAgregados(copy); }}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t text-sm text-gray-700">
                  <tr>
                    <td colSpan="4" className="text-right font-semibold px-4 py-2">Subtotal:</td>
                    <td className="font-bold px-4 py-2 text-right text-conv3r-gold">
                      ${subtotalServicios.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
              {errores.servicio && <p className="text-red-500 text-sm mt-2">{errores.servicio}</p>}
            </div>
          </FormSection>

          <FormSection title="Observaciones">
            <div>
              <FormLabel htmlFor="observaciones">Observaciones (opcional)</FormLabel>
              <textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ingresa observaciones adicionales sobre la cotización..."
                rows="4"
                style={{ resize: 'none' }}
                className={`${inputBaseStyle} resize-none`}
              />
            </div>
          </FormSection>

          <FormSection title="Resumen de Cotización">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal Productos:</span>
                <span className="font-semibold text-gray-800">${subtotalProductos.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal Servicios:</span>
                <span className="font-semibold text-gray-800">${subtotalServicios.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IVA (19%):</span>
                <span className="font-semibold text-gray-800">${iva.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-gray-600 font-bold">Total:</span>
                <span className="font-bold text-conv3r-gold">${total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </FormSection>


          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
            <button type="button" onClick={handleGuardar} className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 hover:scale-105 transition-transform">Guardar cotización</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewQuoteModal;


