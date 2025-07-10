import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaTimes, FaPlus, FaTrash, FaSearch, FaUserPlus, FaEdit } from 'react-icons/fa';
import { mockProductos, mockServicios, mockServiceOrders } from '../data/Service_orders_data';
import { useNavigate } from 'react-router-dom';

// Componentes reutilizables
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

const EditServiceOrderModal = ({ isOpen, onClose, onSave, orderToEdit }) => {
  const navigate = useNavigate();
  const formRef = useRef();
  const clientSearchRef = useRef();
  const projectNameRef = useRef();
  const contactRef = useRef();
  const serviceSelectRef = useRef();

  // Obtener lista de clientes
  const getClientsFromOrders = () => {
    const clients = [];
    const clientMap = new Map();
    
    mockServiceOrders.forEach(order => {
      if (!clientMap.has(order.clientName)) {
        clientMap.set(order.clientName, true);
        clients.push({
          id: clients.length + 1,
          name: order.clientName,
          contact: order.contact
        });
      }
    });
    
    return clients;
  };

  // Estado inicial
  const initialState = {
    id: '',
    orderId: '',
    clientId: '',
    clientName: '',
    contact: '',
    requestDate: new Date().toISOString().split('T')[0],
    projectName: '',
    status: 'Pendiente',
    services: [],
    products: [],
    subtotalProducts: 0,
    subtotalServices: 0,
    iva: 0,
    total: 0,
    observations: '',
    quoteId: null,
    isActividad: true
  };

  // Estados del componente
  const [orderData, setOrderData] = useState(initialState);
  const [selectedService, setSelectedService] = useState('');
  const [serviceQuantity, setServiceQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clients] = useState(getClientsFromOrders());
  const [filteredClients, setFilteredClients] = useState([]);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [editingServiceIndex, setEditingServiceIndex] = useState(null);
  const [editingProductIndex, setEditingProductIndex] = useState(null);

  // Cargar datos de la orden a editar
  useEffect(() => {
    if (orderToEdit && isOpen) {
      // Mapear servicios con detalles completos
      const servicesWithDetails = orderToEdit.services.map(service => {
        const serviceDetails = mockServicios.find(s => s.id === service.serviceId);
        return {
          serviceId: service.serviceId,
          name: serviceDetails?.nombre || `Servicio #${service.serviceId}`,
          quantity: service.quantity,
          price: serviceDetails?.precio || 0
        };
      });

      // Mapear productos con detalles completos
      const productsWithDetails = orderToEdit.products?.map(product => {
        const productDetails = mockProductos.find(p => p.id === product.productId);
        return {
          productId: product.productId,
          name: productDetails?.nombre || `Producto #${product.productId}`,
          quantity: product.quantity,
          price: productDetails?.precio || 0
        };
      }) || [];

      setOrderData({
        ...orderToEdit,
        services: servicesWithDetails,
        products: productsWithDetails
      });

      setClientSearch(orderToEdit.clientName || '');
    } else {
      // Resetear el formulario si no hay orden para editar
      setOrderData(initialState);
      setClientSearch('');
    }
  }, [orderToEdit, isOpen]);

  // Filtrar clientes
  useEffect(() => {
    if (clientSearch.trim() === '') {
      setFilteredClients(clients);
    } else {
      const searchTerm = clientSearch.toLowerCase();
      setFilteredClients(
        clients.filter(client => 
          client.name.toLowerCase().includes(searchTerm) ||
          (client.contact && client.contact.toLowerCase().includes(searchTerm))
        )
      );
    }
  }, [clientSearch, clients]);

  // Calcular resumen financiero
  const financialSummary = useMemo(() => {
    const subtotalProducts = orderData.products.reduce(
      (sum, p) => sum + (p.price * p.quantity), 0);
    
    const subtotalServices = orderData.services.reduce(
      (sum, s) => sum + (s.price * s.quantity), 0);
    
    const iva = subtotalProducts * 0.19;
    const total = subtotalProducts + subtotalServices + iva;
    
    return { subtotalProducts, subtotalServices, iva, total };
  }, [orderData.products, orderData.services]);

  // Actualizar datos con resumen financiero
  useEffect(() => {
    setOrderData(prev => ({
      ...prev,
      subtotalProducts: financialSummary.subtotalProducts,
      subtotalServices: financialSummary.subtotalServices,
      iva: financialSummary.iva,
      total: financialSummary.total
    }));
  }, [financialSummary]);

  // Manejadores de eventos
  const handleContactChange = (e) => {
    const { value } = e.target;
    const filteredValue = value.replace(/[^0-9\s+\-()]/g, '');
    setOrderData(prev => ({ ...prev, contact: filteredValue }));
    
    if (touchedFields.contact) {
      validateField('contact', filteredValue);
    }
  };

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
        newErrors.contact = !value ? 'Debe ingresar un contacto' : 
          value.length < 8 ? 'El contacto debe tener al menos 8 caracteres' : null;
        break;
      case 'services':
        newErrors.services = orderData.services.length === 0 ? 'Debe agregar al menos un servicio' : null;
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleBlur = (fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, orderData[fieldName]);
  };

  const scrollToError = () => {
    if (errors.client) {
      clientSearchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      clientSearchRef.current?.focus();
    } else if (errors.projectName) {
      projectNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      projectNameRef.current?.focus();
    } else if (errors.contact) {
      contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      contactRef.current?.focus();
    } else if (errors.services) {
      serviceSelectRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      serviceSelectRef.current?.focus();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
    
    if (touchedFields[name]) {
      validateField(name, value);
    }
  };

  const selectClient = (client) => {
    setOrderData(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      contact: client.contact
    }));
    setClientSearch(client.name);
    setShowClientDropdown(false);
    setErrors(prev => ({ ...prev, client: null }));
  };

  const navigateToNewClient = () => {
    navigate('/clients');
  };

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
    setErrors(prev => ({ ...prev, service: null, serviceQuantity: null }));
  };

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

  const editService = (index) => {
    const service = orderData.services[index];
    setSelectedService(service.serviceId.toString());
    setServiceQuantity(service.quantity);
    setEditingServiceIndex(index);
  };

  const editProduct = (index) => {
    const product = orderData.products[index];
    setSelectedProduct(product.productId.toString());
    setProductQuantity(product.quantity);
    setEditingProductIndex(index);
  };

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
  };

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!orderData.clientId) {
      newErrors.client = 'Debe seleccionar un cliente';
    }
    if (!orderData.projectName) {
      newErrors.projectName = 'Debe ingresar un nombre de proyecto';
    }
    if (!orderData.contact || orderData.contact.length < 8) {
      newErrors.contact = 'Debe ingresar un número de contacto válido (mínimo 8 caracteres)';
    }
    if (orderData.services.length === 0) {
      newErrors.services = 'Debe agregar al menos un servicio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      scrollToError();
      return;
    }
    
    const updatedOrder = {
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
    
    onSave(updatedOrder);
    onClose();
  };

  const resetForm = () => {
    setOrderData(initialState);
    setSelectedService('');
    setServiceQuantity(1);
    setSelectedProduct('');
    setProductQuantity(1);
    setClientSearch('');
    setErrors({});
    setTouchedFields({});
    setEditingServiceIndex(null);
    setEditingProductIndex(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
        ref={formRef}
      >
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-3xl font-bold text-gray-800">Editar Orden de Servicio {orderData.orderId}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2">
            <FaTimes />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                <FormLabel htmlFor="clientSearch">Cliente</FormLabel>
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
                        setTimeout(() => setShowClientDropdown(false), 200);
                        handleBlur('clientId');
                      }}
                      className={`${inputBaseStyle} ${errors.client ? 'border-red-500' : ''}`}
                      readOnly={!!orderData.clientId}
                    />
                    <FaSearch className="absolute right-3 top-3 text-gray-400" />
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
                    {filteredClients.map(client => (
                      <div
                        key={client.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectClient(client)}
                      >
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-600">{client.contact}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div ref={projectNameRef}>
                <FormLabel htmlFor="projectName">Nombre del Proyecto</FormLabel>
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
                <FormLabel htmlFor="contact">Contacto (Teléfono)</FormLabel>
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
                  <option value="Inactiva">Inactiva</option>
                </select>
              </div>

              <div>
                <FormLabel htmlFor="quoteId">ID Cotización (Opcional)</FormLabel>
                <input
                  id="quoteId"
                  type="text"
                  name="quoteId"
                  value={orderData.quoteId || ''}
                  onChange={handleChange}
                  className={inputBaseStyle}
                  placeholder="Ej: 001"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="isActividad"
                  type="checkbox"
                  name="isActividad"
                  checked={orderData.isActividad || false}
                  onChange={(e) => setOrderData(prev => ({ ...prev, isActividad: e.target.checked }))}
                  className="h-4 w-4 text-conv3r-gold focus:ring-conv3r-gold border-gray-300 rounded"
                />
                <label htmlFor="isActividad" className="ml-2 block text-sm text-gray-700">
                  Mostrar como actividad
                </label>
              </div>
            </div>
          </FormSection>

          <FormSection title="Servicios">
            {errors.services && (
              <p className="text-red-500 text-sm mb-2">{errors.services}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3" ref={serviceSelectRef}>
              <div>
                <FormLabel>Servicio</FormLabel>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className={`${inputBaseStyle} ${errors.services ? 'border-red-500' : ''}`}
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
                  className={inputBaseStyle}
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
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio Unitario</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orderData.services.map((service, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{service.name}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{service.quantity}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${service.price.toLocaleString()}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${(service.price * service.quantity).toLocaleString()}</td>
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
                  className={inputBaseStyle}
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
                  className={inputBaseStyle}
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
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio Unitario</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orderData.products.map((product, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{product.quantity}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${product.price.toLocaleString()}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${(product.price * product.quantity).toLocaleString()}</td>
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
              value={orderData.observations || ''}
              onChange={handleChange}
              rows={3}
              className={inputBaseStyle}
              placeholder="Ingrese cualquier observación adicional..."
            />
          </FormSection>

          <div className="flex justify-end gap-4 pt-6 border-t">
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
              className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-6 rounded-lg hover:brightness-95 transition-transform hover:scale-105"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServiceOrderModal;