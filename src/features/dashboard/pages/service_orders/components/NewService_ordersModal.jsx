import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPlus, FaTrash, FaSearch, FaUserPlus, FaEdit } from 'react-icons/fa';
import { mockProductos, mockServicios, mockServiceOrders } from '../data/Service_orders_data';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // Asegúrate de que react-hot-toast esté instalado y configurado

// Componentes reutilizables del diseño estándar
const FormSection = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const FormLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

// Estilo base para los campos de entrada, incluyendo estilos de enfoque
const inputBaseStyle = 'block w-full text-sm text-gray-500 border border-gray-300 rounded-lg shadow-sm p-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold';

const NewServiceOrderModal = ({ isOpen, onClose, onSave }) => {
  const navigate = useNavigate();
  const modalContentRef = useRef(); // Referencia al contenido del modal
  const clientSearchRef = useRef(); // Referencia para el campo de búsqueda de cliente para el desplazamiento
  const projectNameRef = useRef(); // Referencia para el campo de nombre del proyecto para el desplazamiento
  const contactRef = useRef(); // Referencia para el campo de contacto para el desplazamiento
  const serviceSelectRef = useRef(); // Referencia para el selector de servicio para el desplazamiento

  // Función para extraer clientes únicos de las órdenes de servicio existentes
  const getClientsFromOrders = () => {
    const clients = [];
    const clientMap = new Map();

    mockServiceOrders.forEach(order => {
      // Usar una combinación de clientName y contact para una clave única más robusta
      const key = `${order.clientName}-${order.contact}`;
      if (!clientMap.has(key)) {
        clientMap.set(key, true);
        clients.push({
          id: order.clientId || clients.length + 1, // Usar clientId existente o generar uno nuevo
          name: order.clientName,
          contact: order.contact
        });
      }
    });
    return clients;
  };

  // Estado inicial para un nuevo formulario de orden de servicio
  const initialState = {
    orderId: `OS-${Math.floor(1000 + Math.random() * 9000)}`, // Generar un ID de orden aleatorio
    clientId: '',
    clientName: '',
    contact: '',
    requestDate: new Date().toISOString().split('T')[0], // Fecha actual
    projectName: '',
    status: 'Pendiente',
    services: [],
    products: [],
    subtotalProducts: 0,
    subtotalServices: 0,
    iva: 0,
    total: 0,
    observations: '',
  };

  // Variables de estado para los datos del formulario, selecciones, errores e índices de edición
  const [orderData, setOrderData] = useState(initialState);
  const [selectedService, setSelectedService] = useState('');
  const [serviceQuantity, setServiceQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clients, setClients] = useState(getClientsFromOrders());
  const [filteredClients, setFilteredClients] = useState(clients);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [editingServiceIndex, setEditingServiceIndex] = useState(null);
  const [editingProductIndex, setEditingProductIndex] = useState(null);

  // Efecto para filtrar clientes según la entrada de búsqueda
  useEffect(() => {
    if (clientSearch.trim() === '') {
      setFilteredClients(clients);
    } else {
      const searchTerm = clientSearch.toLowerCase();
      setFilteredClients(
        clients.filter(client =>
          client.name.toLowerCase().includes(searchTerm) ||
          client.contact.includes(clientSearch)
        )
      );
    }
  }, [clientSearch, clients]);

  // Efecto para recalcular los totales financieros cada vez que los servicios o productos cambian
  useEffect(() => {
    const subtotalProducts = orderData.products.reduce(
      (sum, p) => sum + (p.price * p.quantity), 0);

    const subtotalServices = orderData.services.reduce(
      (sum, s) => sum + (s.price * s.quantity), 0);

    const iva = subtotalProducts * 0.19; // Asumiendo 19% de IVA sobre los productos
    const total = subtotalProducts + subtotalServices + iva;

    setOrderData(prev => ({
      ...prev,
      subtotalProducts,
      subtotalServices,
      iva,
      total
    }));
  }, [orderData.products, orderData.services]);

  // Manejar cambios en la entrada de contacto, filtrando caracteres no numéricos
  const handleContactChange = (e) => {
    const { value } = e.target;
    // Permitir números, espacios, +, - y paréntesis para el contacto
    const filteredValue = value.replace(/[^0-9\s+\-()]/g, '');
    setOrderData(prev => ({ ...prev, contact: filteredValue }));
    // Validar siempre al cambiar para retroalimentación "en tiempo real"
    validateField('contact', filteredValue);
  };

  // Validar un campo específico y actualizar el estado de errores
  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'clientId':
        newErrors.client = !value ? 'Debe seleccionar un cliente' : null;
        break;
      case 'projectName':
        newErrors.projectName = !value ? 'Debe ingresar un nombre de proyecto' : null;
        break;
      case 'contact':
        // Eliminar caracteres no numéricos para la validación de longitud
        newErrors.contact = !value ? 'Debe ingresar un contacto' :
          value.replace(/[\s+\-()]/g, '').length < 8 ? 'El contacto debe tener al menos 8 caracteres' : null;
        break;
      case 'services':
        newErrors.services = orderData.services.length === 0 ? 'Debe agregar al menos un servicio' : null;
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  // Marcar un campo como "tocado" y validarlo al perder el foco
  const handleBlur = (fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, orderData[fieldName]);
  };

  // Desplazarse al primer campo con un error
  const scrollToError = () => {
    // Timeout para asegurar que el DOM se ha actualizado antes de intentar el scroll
    setTimeout(() => {
      // Prioridad de los campos: Cliente, Proyecto, Contacto, Servicios
      if (errors.client && clientSearchRef.current) {
        clientSearchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        clientSearchRef.current.focus();
      } else if (errors.projectName && projectNameRef.current) {
        projectNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        projectNameRef.current.focus();
      } else if (errors.contact && contactRef.current) {
        contactRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        contactRef.current.focus();
      } else if (errors.services && serviceSelectRef.current) {
        serviceSelectRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        serviceSelectRef.current.focus();
      }
    }, 100); // Pequeño retraso para asegurar que los elementos están renderizados
  };


  // Manejador genérico de cambios para los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
    // Validar siempre al cambiar para retroalimentación "en tiempo real"
    validateField(name, value);
  };

  // Seleccionar un cliente del menú desplegable
  const selectClient = (client) => {
    setOrderData(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      contact: client.contact
    }));
    setClientSearch(client.name);
    setShowClientDropdown(false);
    setErrors(prev => ({ ...prev, client: null })); // Limpiar error de cliente
  };

  // Función para limpiar la selección del cliente
  const clearClientSelection = () => {
    setOrderData(prev => ({
      ...prev,
      clientId: '',
      clientName: '',
      contact: ''
    }));
    setClientSearch('');
    setErrors(prev => ({ ...prev, client: 'Debe seleccionar un cliente' })); // Reestablecer el error si es necesario
    clientSearchRef.current.focus(); // Enfocar el campo de búsqueda
  };

  // Navegar a la página de creación de un nuevo cliente y cerrar el modal
  const navigateToNewClient = () => {
    navigate('/dashboard/clientes')
    if (onClose) onClose();
  };

  // Añadir o actualizar un servicio en la orden
  const addService = () => {
    if (!selectedService) {
      setErrors(prev => ({ ...prev, service: 'Debe seleccionar un servicio' }));
      return;
    }
    if (serviceQuantity < 1) {
      setErrors(prev => ({ ...prev, serviceQuantity: 'La cantidad debe ser al menos 1' }));
      return;
    }

    const service = mockServicios.find(s => s.id === parseInt(selectedService));
    if (!service) return;

    const newService = {
      serviceId: service.id,
      name: service.nombre,
      quantity: parseInt(serviceQuantity),
      price: service.precio
    };

    if (editingServiceIndex !== null) {
      // Editar servicio existente
      const updatedServices = [...orderData.services];
      updatedServices[editingServiceIndex] = newService;
      setOrderData(prev => ({
        ...prev,
        services: updatedServices
      }));
      setEditingServiceIndex(null);
    } else {
      // Agregar nuevo servicio
      setOrderData(prev => ({
        ...prev,
        services: [...prev.services, newService]
      }));
    }

    setSelectedService('');
    setServiceQuantity(1);
    setErrors(prev => ({ ...prev, service: null, serviceQuantity: null, services: null })); // Limpiar errores relacionados con el servicio
  };

  // Añadir o actualizar un producto en la orden
  const addProduct = () => {
    if (!selectedProduct) {
      setErrors(prev => ({ ...prev, product: 'Debe seleccionar un producto' }));
      return;
    }
    if (productQuantity < 1) {
      setErrors(prev => ({ ...prev, productQuantity: 'La cantidad debe ser al menos 1' }));
      return;
    }

    const product = mockProductos.find(p => p.id === parseInt(selectedProduct));
    if (!product) return;

    const newProduct = {
      productId: product.id,
      name: product.nombre,
      quantity: parseInt(productQuantity),
      price: product.precio
    };

    if (editingProductIndex !== null) {
      // Editar producto existente
      const updatedProducts = [...orderData.products];
      updatedProducts[editingProductIndex] = newProduct;
      setOrderData(prev => ({
        ...prev,
        products: updatedProducts
      }));
      setEditingProductIndex(null);
    } else {
      // Agregar nuevo producto
      setOrderData(prev => ({
        ...prev,
        products: [...prev.products, newProduct]
      }));
    }

    setSelectedProduct('');
    setProductQuantity(1);
    setErrors(prev => ({ ...prev, product: null, productQuantity: null }));
  };

  // Establecer el servicio seleccionado para editar
  const editService = (index) => {
    const service = orderData.services[index];
    setSelectedService(service.serviceId.toString());
    setServiceQuantity(service.quantity);
    setEditingServiceIndex(index);
  };

  // Establecer el producto seleccionado para editar
  const editProduct = (index) => {
    const product = orderData.products[index];
    setSelectedProduct(product.productId.toString());
    setProductQuantity(product.quantity);
    setEditingProductIndex(index);
  };

  // Eliminar un servicio de la orden
  const removeService = (index) => {
    setOrderData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
    if (editingServiceIndex === index) {
      setEditingServiceIndex(null);
      setSelectedService('');
      setServiceQuantity(1);
    }
    // Volver a validar los servicios después de la eliminación si era el último
    // Usar el estado actualizado para la validación
    if (orderData.services.length === 1 && index === 0) {
      setErrors(prev => ({ ...prev, services: 'Debe agregar al menos un servicio' }));
    }
  };

  // Eliminar un producto de la orden
  const removeProduct = (index) => {
    setOrderData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
    if (editingProductIndex === index) {
      setEditingProductIndex(null);
      setSelectedProduct('');
      setProductQuantity(1);
    }
  };

  // Validar todo el formulario antes de enviarlo
  const validateForm = () => {
    const newErrors = {};

    if (!orderData.clientId) {
      newErrors.client = 'Debe seleccionar un cliente';
    }
    if (!orderData.projectName) {
      newErrors.projectName = 'Debe ingresar un nombre de proyecto';
    }
    // Eliminar caracteres no numéricos para la validación de longitud
    if (!orderData.contact || orderData.contact.replace(/[\s+\-()]/g, '').length < 8) {
      newErrors.contact = 'Debe ingresar un número de contacto válido (mínimo 8 caracteres)';
    }
    if (orderData.services.length === 0) {
      newErrors.services = 'Debe agregar al menos un servicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      scrollToError(); // Desplazarse al primer error
      toast.error("Por favor, corrige los errores en el formulario.");
      return;
    }

    const newOrder = {
      ...orderData,
      services: orderData.services.map(s => ({
        serviceId: s.serviceId,
        quantity: s.quantity
      })),
      products: orderData.products.map(p => ({
        productId: p.productId,
        quantity: p.quantity
      }))
    };

    onSave(newOrder); // Llamar a la prop onSave con los nuevos datos de la orden
    resetForm(); // Restablecer los campos del formulario
    onClose(); // Cerrar el modal
    toast.success("Orden de servicio creada correctamente");
  };

  // Restablecer todo el formulario a su estado inicial
  const resetForm = () => {
    setOrderData({
      ...initialState,
      orderId: `OS-${Math.floor(1000 + Math.random() * 9000)}` // Generar un nuevo ID de orden
    });
    setSelectedService('');
    setServiceQuantity(1);
    setSelectedProduct('');
    setProductQuantity(1);
    setClientSearch('');
    setErrors({});
    setTouchedFields({});
    setShowClientDropdown(false); // Asegurarse de ocultar el dropdown
    setEditingServiceIndex(null);
    setEditingProductIndex(null);
  };

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" // Added overflow-hidden here
        ref={modalContentRef} // Asignar la referencia al contenido del modal
      >
        {/* Encabezado fijo */}
        <header className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-20">
          <h2 className="text-3xl font-bold text-gray-800">Nueva Orden de Servicio</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2">
            <FaTimes />
          </button>
        </header>

        {/* Área de contenido desplazable */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection title="Información Básica">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormLabel htmlFor="orderId">Número de Orden</FormLabel>
                  <input
                    id="orderId"
                    type="text"
                    value={orderData.orderId}
                    disabled
                    className={`${inputBaseStyle} bg-gray-100`}
                  />
                </div>

                <div className="relative" ref={clientSearchRef}>
                  <FormLabel htmlFor="clientSearch">Cliente<span className="text-red-500">*</span></FormLabel>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <input
                        id="clientSearch"
                        type="text"
                        placeholder="Buscar cliente..."
                        value={clientSearch}
                        onChange={(e) => {
                          setClientSearch(e.target.value);
                          setShowClientDropdown(true);
                        }}
                        onFocus={() => setShowClientDropdown(true)}
                        onBlur={() => {
                          // Pequeño retardo para permitir el clic en los elementos del dropdown
                          setTimeout(() => setShowClientDropdown(false), 200);
                          handleBlur('clientId');
                        }}
                        className={`${inputBaseStyle} ${errors.client ? 'border-red-500' : ''}`}
                        readOnly={!!orderData.clientId && !showClientDropdown} // Hacerlo de solo lectura si un cliente está seleccionado y el desplegable no está activo
                      />
                      <FaSearch className="absolute right-3 top-3 text-gray-400" />
                      {/* Botón para limpiar la selección del cliente */}
                      {orderData.clientId && (
                        <button
                          type="button"
                          onClick={clearClientSelection}
                          className="absolute right-10 top-3 text-gray-400 hover:text-gray-700"
                          title="Limpiar selección de cliente"
                        >
                          <FaTimes size={12} />
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={navigateToNewClient}
                      className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-3 py-2.5 rounded-lg shadow-sm"
                      title="Crear nuevo cliente"
                    >
                      <FaUserPlus />
                    </button>
                  </div>
                  {errors.client && (
                    <p className="text-red-500 text-sm mt-1">{errors.client}</p>
                  )}
                  {showClientDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredClients.length > 0 ? (
                        filteredClients.map(client => (
                          <div
                            key={client.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={(e) => e.preventDefault()} // Prevenir que el desplegable se cierre al hacer clic
                            onClick={() => selectClient(client)}
                          >
                            <div className="font-medium">{client.name}</div>
                            <div className="text-sm text-gray-600">{client.contact}</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500">No se encontraron clientes.</div>
                      )}
                    </div>
                  )}
                </div>

                <div ref={projectNameRef}>
                  <FormLabel htmlFor="projectName">Nombre del Proyecto<span className="text-red-500">*</span></FormLabel>
                  <input
                    id="projectName"
                    type="text"
                    name="projectName"
                    value={orderData.projectName}
                    onChange={handleChange}
                    onBlur={() => handleBlur('projectName')}
                    className={`${inputBaseStyle} ${errors.projectName ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.projectName && (
                    <p className="text-red-500 text-sm mt-1">{errors.projectName}</p>
                  )}
                </div>

                <div>
                  <FormLabel htmlFor="requestDate">Fecha de Solicitud</FormLabel>
                  <input
                    id="requestDate"
                    type="date"
                    name="requestDate"
                    value={orderData.requestDate}
                    onChange={handleChange}
                    className={inputBaseStyle}
                    required
                  />
                </div>

                <div ref={contactRef}>
                  <FormLabel htmlFor="contact">Contacto (Teléfono)<span className="text-red-500">*</span></FormLabel>
                  <input
                    id="contact"
                    type="text"
                    name="contact"
                    value={orderData.contact}
                    onChange={handleContactChange}
                    onBlur={() => handleBlur('contact')}
                    className={`${inputBaseStyle} ${errors.contact ? 'border-red-500' : ''}`}
                    required
                    placeholder="Ej: +56 9 1234 5678"
                  />
                  {errors.contact && (
                    <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
                  )}
                </div>

                <div>
                  <FormLabel htmlFor="status">Estado</FormLabel>
                  <select
                    id="status"
                    name="status"
                    value={orderData.status}
                    onChange={handleChange}
                    className={`${inputBaseStyle} appearance-none`}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Completado">Completado</option>
                    <option value="Esperando repuestos">Esperando repuestos</option>
                  </select>
                </div>
              </div>
            </FormSection>

            <FormSection title="Servicios">
              {errors.services && (
                <p className="text-red-500 text-sm mb-2">{errors.services}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3" ref={serviceSelectRef}>
                <div>
                  <FormLabel>Servicio<span className="text-red-500">*</span></FormLabel>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className={`${inputBaseStyle} ${errors.service ? 'border-red-500' : ''}`}
                  >
                    <option value="">Seleccionar servicio</option>
                    {mockServicios.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.nombre} - ${service.precio.toLocaleString()}
                      </option>
                    ))}
                  </select>
                  {errors.service && (
                    <p className="text-red-500 text-sm mt-1">{errors.service}</p>
                  )}
                </div>
                <div>
                  <FormLabel>Cantidad</FormLabel>
                  <input
                    type="number"
                    min="1"
                    value={serviceQuantity}
                    onChange={(e) => setServiceQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className={`${inputBaseStyle} ${errors.serviceQuantity ? 'border-red-500' : ''}`}
                  />
                  {errors.serviceQuantity && (
                    <p className="text-red-500 text-sm mt-1">{errors.serviceQuantity}</p>
                  )}
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addService}
                    className={`mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] w-full justify-center ${
                      editingServiceIndex !== null ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-conv3r-dark hover:bg-conv3r-dark-700'
                    }`}
                  >
                    <FaPlus className="text-white" size={12} />
                    {editingServiceIndex !== null ? 'Actualizar' : 'Agregar'}
                  </button>
                </div>
              </div>

              {orderData.services.length > 0 && (
                <div className="mt-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio Unitario</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {orderData.services.map((service, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{service.name}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{service.quantity}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${service.price.toLocaleString()}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${(service.price * service.quantity).toLocaleString()}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => editService(index)}
                                  className="text-yellow-600 hover:text-yellow-800"
                                  title="Editar servicio"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeService(index)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Eliminar servicio"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </FormSection>

            <FormSection title="Productos">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <FormLabel>Producto</FormLabel>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className={`${inputBaseStyle} ${errors.product ? 'border-red-500' : ''}`}
                  >
                    <option value="">Seleccionar producto</option>
                    {mockProductos.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.nombre} - ${product.precio.toLocaleString()}
                      </option>
                    ))}
                  </select>
                  {errors.product && (
                    <p className="text-red-500 text-sm mt-1">{errors.product}</p>
                  )}
                </div>
                <div>
                  <FormLabel>Cantidad</FormLabel>
                  <input
                    type="number"
                    min="1"
                    value={productQuantity}
                    onChange={(e) => setProductQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className={`${inputBaseStyle} ${errors.productQuantity ? 'border-red-500' : ''}`}
                  />
                  {errors.productQuantity && (
                    <p className="text-red-500 text-sm mt-1">{errors.productQuantity}</p>
                  )}
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addProduct}
                    className={`mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] w-full justify-center ${
                      editingProductIndex !== null ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-conv3r-dark hover:bg-conv3r-dark-700'
                    }`}
                  >
                    <FaPlus className="text-white" size={12} />
                    {editingProductIndex !== null ? 'Actualizar' : 'Agregar'}
                  </button>
                </div>
              </div>

              {orderData.products.length > 0 && (
                <div className="mt-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio Unitario</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {orderData.products.map((product, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{product.quantity}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${product.price.toLocaleString()}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${(product.price * product.quantity).toLocaleString()}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => editProduct(index)}
                                  className="text-yellow-600 hover:text-yellow-800"
                                  title="Editar producto"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeProduct(index)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Eliminar producto"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </FormSection>

            <FormSection title="Resumen Financiero">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Subtotales</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Productos:</span>
                      <span>${orderData.subtotalProducts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Servicios:</span>
                      <span>${orderData.subtotalServices.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 font-medium flex justify-between">
                      <span>Subtotal:</span>
                      <span>${(orderData.subtotalProducts + orderData.subtotalServices).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Totales</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>IVA (19% sobre productos):</span>
                      <span>${orderData.iva.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 font-medium flex justify-between">
                      <span>Total General:</span>
                      <span>${orderData.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection title="Observaciones">
              <textarea
                name="observations"
                value={orderData.observations}
                onChange={handleChange}
                rows={3}
                className={inputBaseStyle}
                placeholder="Ingrese cualquier observación adicional..."
              />
            </FormSection>
          </form>
        </div>

        {/* Pie de página fijo para los botones */}
        <div className="flex justify-end gap-4 pt-6 pb-4 px-6 border-t sticky bottom-0 bg-white z-20">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit} // Aseguramos que handleSubmit se llama al hacer clic
            className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-6 rounded-lg hover:brightness-95 transition-transform hover:scale-105"
          >
            Guardar Orden
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewServiceOrderModal;