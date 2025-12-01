import React, { useState, useEffect, useMemo } from 'react';
import { FaTimes, FaTrash } from 'react-icons/fa';
import SearchSelector from '../../products_sale/components/SearchSelector';
import { quotesService } from '../services/quotesService';
import { showError } from '../../../../../shared/utils/alerts';

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

const QuoteEditModal = ({ isOpen, onClose, onSave, quoteToEdit, products, services, clients }) => {
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    const parsedNum = typeof num === 'string' ? parseFloat(num) : num;
    return isNaN(parsedNum) ? '0' : new Intl.NumberFormat('es-ES').format(parsedNum);
  };

  const today = new Date().toISOString().split('T')[0];
  const [quoteData, setQuoteData] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [cliente, setCliente] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [productoSel, setProductoSel] = useState(null);
  const [cantidadProducto, setCantidadProducto] = useState('');
  const [productosAgregados, setProductosAgregados] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [servicioSel, setServicioSel] = useState(null);
  const [cantidadServicio, setCantidadServicio] = useState('');
  const [serviciosAgregados, setServiciosAgregados] = useState([]);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (!quoteToEdit || !isOpen) return;

    const idCliente = quoteToEdit.id_cliente || quoteToEdit.cliente?.id_cliente || quoteToEdit.clienteData?.id_cliente;
    if (idCliente) setClienteSeleccionado(String(idCliente));

    setQuoteData(JSON.parse(JSON.stringify(quoteToEdit)));
    setObservaciones(quoteToEdit.observaciones || '');
    setErrores({});

    // Cargar detalles de productos y servicios desde el backend si existe
    if (quoteToEdit.id_cotizacion) {
      setLoading(true);
      quotesService.getQuoteDetails(quoteToEdit.id_cotizacion)
        .then((details) => {
          const detalles = Array.isArray(details) ? details : details?.data || [];
          
          const prods = detalles
            .filter(d => d.id_producto)
            .map(d => ({
              id_producto: d.id_producto,
              nombre: d.producto?.nombre || d.nombre || `Producto ${d.id_producto}`,
              modelo: d.producto?.modelo || d.modelo || '',
              precio: Number(d.precio_unitario || d.producto?.precio || 0),
              cantidad: Number(d.cantidad || 1),
              subtotal: Number(d.subtotal || (d.precio_unitario * d.cantidad) || 0),
            }));
          
          const servs = detalles
            .filter(d => d.id_servicio)
            .map(d => ({
              id_servicio: d.id_servicio,
              nombre: d.servicio?.nombre || d.nombre || `Servicio ${d.id_servicio}`,
              precio: Number(d.precio_unitario || d.servicio?.precio || 0),
              cantidad: Number(d.cantidad || 1),
              subtotal: Number(d.subtotal || (d.precio_unitario * d.cantidad) || 0),
            }));
          
          setProductosAgregados(prods);
          setServiciosAgregados(servs);
          setLoading(false);
        })
        .catch(() => {
          // Si hay detalleOrden en el objeto original (mocks), usarlo
          if (quoteToEdit.detalleOrden) {
            setProductosAgregados(quoteToEdit.detalleOrden.productos || []);
            setServiciosAgregados(quoteToEdit.detalleOrden.servicios || []);
          }
          setLoading(false);
        });
    } else if (quoteToEdit.detalleOrden) {
      // Compatibilidad con mocks
      setProductosAgregados(quoteToEdit.detalleOrden.productos || []);
      setServiciosAgregados(quoteToEdit.detalleOrden.servicios || []);
    }
  }, [quoteToEdit, isOpen]);

  // Cliente seleccionado
  useEffect(() => {
    if (clienteSeleccionado === '') {
      setCliente(null);
      return;
    }
    const found = clients?.find(c => c.id_cliente === Number(clienteSeleccionado));
    setCliente(found || null);
  }, [clienteSeleccionado, clients]);

  // Producto seleccionado
  useEffect(() => {
    if (productoSeleccionado === '') {
      setProductoSel(null);
      return;
    }
    const found = products?.find(p => p.id_producto === Number(productoSeleccionado));
    setProductoSel(found || null);
  }, [productoSeleccionado, products]);

  // Servicio seleccionado
  useEffect(() => {
    if (servicioSeleccionado === '') {
      setServicioSel(null);
      return;
    }
    const found = services?.find(s => s.id_servicio === Number(servicioSeleccionado) || s.id === Number(servicioSeleccionado));
    setServicioSel(found || null);
  }, [servicioSeleccionado, services]);

  const subtotalProductos = useMemo(() => productosAgregados.reduce((acc, p) => acc + p.subtotal, 0), [productosAgregados]);
  const subtotalServicios = useMemo(() => serviciosAgregados.reduce((acc, s) => acc + s.subtotal, 0), [serviciosAgregados]);
  const iva = useMemo(() => (subtotalProductos + subtotalServicios) * 0.19, [subtotalProductos, subtotalServicios]);
  const total = useMemo(() => subtotalProductos + subtotalServicios + iva, [subtotalProductos, subtotalServicios, iva]);

  const validateField = (name, value) => {
    const newErrors = { ...errores };
    switch (name) {
      case 'nombre_cotizacion':
        if (!value?.trim()) newErrors.nombre = 'El nombre de la cotización es obligatorio';
        else delete newErrors.nombre;
        break;
      case 'clienteSeleccionado':
        if (!value) newErrors.cliente = 'Selecciona un cliente';
        else delete newErrors.cliente;
        break;
      case 'fecha_vencimiento':
        if (!value) newErrors.fecha = 'Selecciona la fecha de vencimiento';
        else if (new Date(value) < new Date(new Date().setHours(0, 0, 0, 0))) newErrors.fecha = 'La fecha de vencimiento no puede ser anterior a hoy';
        else delete newErrors.fecha;
        break;
      default:
        break;
    }
    setErrores(newErrors);
  };

  if (!isOpen || !quoteData) return null;

  const isRejected = quoteData.estado === 'Rechazada' || quoteData.estado === 'Anulada';

  // Si está rechazada, mostrar mensaje
  if (isRejected) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Cotización Rechazada</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl"
            >
              <FaTimes />
            </button>
          </header>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-semibold mb-2">No se puede editar esta cotización</p>
            <p className="text-red-600 text-sm">
              La cotización con estado "{quoteData.estado}" no puede ser modificada.
            </p>
            {quoteData.observaciones && (
              <div className="mt-3 p-2 bg-white rounded border border-red-200">
                <p className="text-xs text-gray-600 font-medium mb-1">Observaciones:</p>
                <p className="text-sm text-gray-800">{quoteData.observaciones}</p>
              </div>
            )}
            {quoteData.motivo_anulacion && (
              <div className="mt-3 p-2 bg-white rounded border border-red-300">
                <p className="text-xs text-red-600 font-medium mb-1">Motivo de anulación:</p>
                <p className="text-sm text-red-800">{quoteData.motivo_anulacion}</p>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAgregarProducto = async () => {
    if (!productoSel || !cantidadProducto || Number(cantidadProducto) <= 0) {
      return;
    }

    try {
      // Calcular cantidad total si ya existe el producto
      const idx = productosAgregados.findIndex(p => p.id_producto === productoSel.id_producto);
      const cantidadExistente = idx !== -1 ? productosAgregados[idx].cantidad : 0;
      const nuevaCantidadTotal = cantidadExistente + Number(cantidadProducto);

      // Validar stock en tiempo real con el backend
      const validation = await quotesService.validateStock(productoSel.id_producto, nuevaCantidadTotal);

      if (!validation.valido) {
        showError(`No hay suficiente stock disponible. Stock actual: ${validation.stock_disponible}, Cantidad solicitada: ${nuevaCantidadTotal}`);
        return;
      }

      if (idx !== -1) {
        const copy = [...productosAgregados];
        const exist = copy[idx];
        copy[idx] = { ...exist, cantidad: nuevaCantidadTotal, subtotal: nuevaCantidadTotal * exist.precio };
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
      setProductoSeleccionado('');
      setProductoSel(null);
      setCantidadProducto('');
    } catch (error) {
      console.error('Error al validar stock:', error);
      showError('Error al validar el stock del producto. Intente nuevamente.');
    }
  };

  const handleAgregarServicio = () => {
    if (!servicioSel || !cantidadServicio || Number(cantidadServicio) <= 0) {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos obligatorios
    const errs = {};
    if (!quoteData.nombre_cotizacion?.trim()) errs.nombre = 'El nombre de la cotización es obligatorio';
    if (!clienteSeleccionado) errs.cliente = 'Selecciona un cliente';
    if (!quoteData.fecha_vencimiento) errs.fecha = 'Selecciona la fecha de vencimiento';
    else if (new Date(quoteData.fecha_vencimiento) < new Date(new Date().setHours(0, 0, 0, 0))) errs.fecha = 'La fecha de vencimiento no puede ser anterior a hoy';
    if (productosAgregados.length === 0) {
      errs.productos = 'Agrega al menos un producto';
    }
    if (serviciosAgregados.length === 0) {
      errs.servicios = 'Agrega al menos un servicio';
    }

    setErrores(errs);
    if (Object.keys(errs).length > 0) return;

    if (!quoteData?.id_cotizacion) {
      // Compatibilidad con mocks
      onSave(quoteData);
      onClose();
      return;
    }

    try {
      // 1. Si el estado cambió a 'Aprobada' o 'Rechazada', primero guardamos los cambios (productos/servicios) manteniendo el estado original
      // para asegurar que la lógica de aprobación (backend) tome los datos actualizados.
      const originalState = quoteToEdit.estado;
      const newState = quoteData.estado;
      const isStateChanging = newState !== originalState;

      const payloadUpdate = {
        nombre_cotizacion: quoteData.nombre_cotizacion,
        id_cliente: clienteSeleccionado ? Number(clienteSeleccionado) : quoteData.id_cliente,
        fecha_vencimiento: quoteData.fecha_vencimiento ? new Date(quoteData.fecha_vencimiento).toISOString() : undefined,
        // Si vamos a cambiar de estado después, mantenemos el original aquí para evitar inconsistencias
        estado: isStateChanging ? originalState : newState,
        observaciones: observaciones.trim() || undefined,
        detalles: [
          ...productosAgregados.map(p => ({ id_producto: p.id_producto, cantidad: p.cantidad })),
          ...serviciosAgregados.map(s => ({ id_servicio: s.id_servicio, cantidad: s.cantidad })),
        ],
      };

      // Actualizar cotización (datos básicos + detalles)
      let resultQuote = await quotesService.updateQuote(quoteData.id_cotizacion, payloadUpdate);

      // 2. Si hubo cambio de estado, llamamos al endpoint específico que maneja la lógica de negocio (stock, proyectos, email)
      if (isStateChanging) {
        const statusData = { estado: newState };
        // Si es rechazada/anulada y tuviera motivo (aunque en este modal no se pide motivo explícito para Aprobar/Rechazar, se asume null)
        // Si quisieras manejar motivo de rechazo aquí, deberías pedirlo en el UI. Por ahora enviamos solo el estado.
        
        const stateChangeResult = await quotesService.changeQuoteState(quoteData.id_cotizacion, newState);
        // El resultado final debe ser la cotización con el nuevo estado
        resultQuote = stateChangeResult.data || stateChangeResult; 
      }

      onSave(resultQuote);
      onClose();
    } catch (error) {
      console.error('Error al actualizar cotización:', error);
      const message = error?.response?.data?.message || error?.message || 'Ocurrió un error al actualizar la cotización';
      showError(message);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <header className="flex justify-between items-center p-4 border-b">
            <h2 className="text-3xl font-bold text-gray-800">
              Editar Cotización - {quoteData.nombre_cotizacion || quoteData.ordenServicio}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl p-2"
            >
              <FaTimes />
            </button>
          </header>

          {loading ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">Cargando detalles...</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <FormSection title="Información General">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <FormLabel htmlFor="nombreCotizacion"><span className="text-red-500">*</span> Nombre de la cotización</FormLabel>
                    <input
                      id="nombreCotizacion"
                      type="text"
                      value={quoteData.nombre_cotizacion || ''}
                      onChange={(e) => {
                        setQuoteData(prev => ({ ...prev, nombre_cotizacion: e.target.value }));
                        validateField('nombre_cotizacion', e.target.value);
                      }}
                      className={`${inputBaseStyle} ${errores.nombre ? 'border-red-500' : ''}`}
                      placeholder="Ej. Sistema CCTV para Sede Norte"
                    />
                    {errores.nombre && (
                      <p className="text-red-500 text-sm mt-1">{errores.nombre}</p>
                    )}
                  </div>
                  <div className="md:col-span-1">
                    <SearchSelector
                      options={clients || []}
                      value={clienteSeleccionado}
                      onChange={(value) => {
                        setClienteSeleccionado(value);
                        validateField('clienteSeleccionado', value);
                      }}
                      placeholder="Buscar cliente por nombre o documento..."
                      displayKey={(client) => `${client.nombre} ${client.apellido}`}
                      searchKeys={['nombre', 'apellido', 'documento']}
                      error={errores.cliente}
                      label="Cliente"
                      required={true}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <FormLabel htmlFor="fechaVenc"><span className="text-red-500">*</span> Fecha de vencimiento</FormLabel>
                    <input
                      id="fechaVenc"
                      type="date"
                      value={(quoteData.fecha_vencimiento || '').slice(0, 10)}
                      min={today}
                      onChange={(e) => {
                        setQuoteData(prev => ({ ...prev, fecha_vencimiento: e.target.value }));
                        validateField('fecha_vencimiento', e.target.value);
                      }}
                      className={`${inputBaseStyle} ${errores.fecha ? 'border-red-500' : ''}`}
                    />
                    {errores.fecha && (
                      <p className="text-red-500 text-sm mt-1">{errores.fecha}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <FormLabel htmlFor="estado">Estado</FormLabel>
                    <select
                      id="estado"
                      value={quoteData.estado || 'Pendiente'}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, estado: e.target.value }))}
                      className={inputBaseStyle}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Aprobada">Aprobada</option>
                      <option value="Rechazada">Rechazada</option>
                    </select>
                  </div>
                  {quoteData.motivo_anulacion && (
                    <div>
                      <FormLabel>Motivo de anulación (solo lectura)</FormLabel>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                        {quoteData.motivo_anulacion}
                      </div>
                    </div>
                  )}
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
                      value={productoSeleccionado}
                      onChange={(value) => setProductoSeleccionado(value)}
                      placeholder="Buscar producto por nombre, modelo o código..."
                      displayKey={(product) => `${product.nombre} - ${product.modelo}`}
                      searchKeys={['nombre', 'modelo', 'codigo_barra']}
                      label="Producto"
                      required={false}
                    />
                  </div>
                  <div>
                    <FormLabel htmlFor="cantidadProducto">Cantidad</FormLabel>
                    <input
                      id="cantidadProducto"
                      type="number"
                      value={cantidadProducto}
                      onChange={(e) => setCantidadProducto(e.target.value)}
                      className={inputBaseStyle}
                      placeholder="Cantidad"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleAgregarProducto}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-4 py-2 rounded-lg shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Agregar producto
                  </button>
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
                      {productosAgregados.map((p, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2">{p.nombre}</td>
                          <td>{p.modelo}</td>
                          <td>{p.cantidad}</td>
                          <td>${formatNumber(p.precio)}</td>
                          <td>${formatNumber(p.subtotal)}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => {
                                const copy = [...productosAgregados];
                                copy.splice(idx, 1);
                                setProductosAgregados(copy);
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t text-sm text-gray-700">
                      <tr>
                        <td colSpan="4" className="text-right font-semibold px-4 py-2">Subtotal productos:</td>
                        <td className="font-bold px-4 py-2 text-right text-conv3r-gold">
                          ${formatNumber(subtotalProductos)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                  {errores.productos && <p className="text-red-500 text-sm mt-2">{errores.productos}</p>}
                </div>
              </FormSection>

              <FormSection title="Servicios">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <SearchSelector
                      options={services || []}
                      value={servicioSeleccionado}
                      onChange={(value) => setServicioSeleccionado(value)}
                      placeholder="Buscar servicio por nombre..."
                      displayKey={(s) => `${s.nombre}`}
                      searchKeys={['nombre', 'descripcion']}
                      label="Servicio"
                      required={false}
                    />
                  </div>
                  <div>
                    <FormLabel htmlFor="cantidadServicio">Cantidad</FormLabel>
                    <input
                      id="cantidadServicio"
                      type="number"
                      value={cantidadServicio}
                      onChange={(e) => setCantidadServicio(e.target.value)}
                      className={inputBaseStyle}
                      placeholder="Cantidad"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleAgregarServicio}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-4 py-2 rounded-lg shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Agregar servicio
                  </button>
                </div>
                {servicioSel && (
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <p><strong>Servicio:</strong> {servicioSel.nombre}</p>
                    <p><strong>Precio:</strong> ${servicioSel.precio?.toLocaleString?.() ?? servicioSel.precio}</p>
                    <p><strong>Descripción:</strong> {servicioSel.descripcion}</p>
                  </div>
                )}
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm text-center border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2">Servicio</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviciosAgregados.map((s, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2">{s.nombre}</td>
                          <td>{s.cantidad}</td>
                          <td>${formatNumber(s.precio)}</td>
                          <td>${formatNumber(s.subtotal)}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => {
                                const copy = [...serviciosAgregados];
                                copy.splice(idx, 1);
                                setServiciosAgregados(copy);
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t text-sm text-gray-700">
                      <tr>
                        <td colSpan="3" className="text-right font-semibold px-4 py-2">Subtotal servicios:</td>
                        <td className="font-bold px-4 py-2 text-right text-conv3r-gold">
                          ${formatNumber(subtotalServicios)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                  {errores.servicios && <p className="text-red-500 text-sm mt-2">{errores.servicios}</p>}
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
                    <span className="font-semibold text-gray-800">${formatNumber(subtotalProductos)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal Servicios:</span>
                    <span className="font-semibold text-gray-800">${formatNumber(subtotalServicios)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal de cotización:</span>
                    <span className="font-semibold text-gray-800">${formatNumber(subtotalProductos + subtotalServicios)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IVA (19%):</span>
                    <span className="font-semibold text-gray-800">${formatNumber(iva)}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600 font-bold">Total:</span>
                    <span className="font-bold text-conv3r-gold">${formatNumber(total)}</span>
                  </div>
                </div>
              </FormSection>
            </div>
          )}

          <div className="flex justify-end gap-4 p-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteEditModal;
