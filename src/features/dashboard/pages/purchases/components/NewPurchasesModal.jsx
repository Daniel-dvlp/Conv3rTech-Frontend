// src/features/dashboard/pages/purchases/NewPurchasesModal.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaTimes, FaPlus, FaTrash, FaEdit, FaBarcode } from "react-icons/fa";
import { mockProductosParaCompra, mockProveedores } from '../data/Purchases_data';
import { toast } from 'react-hot-toast';

// Componentes reutilizables del diseño estándar (sin cambios aquí)
const FormSection = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const FormLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const inputBaseStyle = 'block w-full text-sm text-gray-500 border rounded-lg shadow-sm p-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold';

const NewPurchasesModal = ({
  isOpen,
  onClose,
  onSave,
  proveedores = mockProveedores,
  productos = mockProductosParaCompra,
}) => {
  const modalContentRef = useRef();
  const proveedorSelectRef = useRef();
  const fechaRegistroRef = useRef();
  const numeroReciboRef = useRef();
  const productoSectionRef = useRef();
  const nuevoProductoPrecioRef = useRef();
  const nuevoProductoCantidadRef = useRef();
  const nuevoProductoCodigoBarrasRef = useRef();
  // Eliminado mouseDownTargetRef y relacionado con el cierre al hacer clic fuera

  const [isClosingIntentionally, setIsClosingIntentionally] = useState(false);

  const initialState = {
    numeroRecibo: "",
    idProveedor: "",
    nombreProveedor: "",
    fechaRegistro: new Date().toISOString().slice(0, 10),
    productosComprados: [],
    observaciones: "",
    subtotalProductos: 0,
    iva: 0,
    total: 0,
  };

  const [purchaseData, setPurchaseData] = useState(initialState);
  const [nuevoProductoSeleccionado, setNuevoProductoSeleccionado] = useState({
    idProducto: "",
    cantidad: 1,
    precioUnitarioCompra: "",
    unidadDeMedida: "N/A",
    codigoDeBarras: "N/A",
  });
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [editingProductIndex, setEditingProductIndex] = useState(null);

  useEffect(() => {
    if (!isOpen && isClosingIntentionally) {
      // Resetear estado solo si el modal se cerró intencionalmente
      setPurchaseData(initialState);
      setNuevoProductoSeleccionado({
        idProducto: "",
        cantidad: 1,
        precioUnitarioCompra: "",
        unidadDeMedida: "N/A",
        codigoDeBarras: "N/A",
      });
      setErrors({});
      setTouchedFields({});
      setEditingProductIndex(null);
      setIsClosingIntentionally(false);
    } else if (isOpen && !touchedFields.idProveedor && !touchedFields.fechaRegistro && purchaseData.productosComprados.length === 0) {
      // Resetear estado al abrir si el formulario está virgen (primera vez o se reseteó completamente)
      setPurchaseData(initialState);
      setNuevoProductoSeleccionado({
        idProducto: "",
        cantidad: 1,
        precioUnitarioCompra: "",
        unidadDeMedida: "N/A",
        codigoDeBarras: "N/A",
      });
      setErrors({});
      setTouchedFields({});
      setEditingProductIndex(null);
      setIsClosingIntentionally(false);
    }
  }, [isOpen, isClosingIntentionally, touchedFields.idProveedor, touchedFields.fechaRegistro, purchaseData.productosComprados.length]);


  useEffect(() => {
    if (nuevoProductoSeleccionado.idProducto) {
      const productoInfo = productos.find(p => p.id === parseInt(nuevoProductoSeleccionado.idProducto));
      if (productoInfo) {
        setNuevoProductoSeleccionado(prev => ({
          ...prev,
          unidadDeMedida: productoInfo.unidadDeMedida || "N/A",
          // Mantener precio/código de barras si se está editando y ya tenían un valor diferente
          precioUnitarioCompra: editingProductIndex !== null
            ? purchaseData.productosComprados[editingProductIndex]?.precioUnitarioCompra || productoInfo.precioUnitario
            : productoInfo.precioUnitario,
          codigoDeBarras: editingProductIndex !== null
            ? purchaseData.productosComprados[editingProductIndex]?.codigoDeBarras || "N/A" // Usar el del producto original o N/A si no tiene
            : "N/A", // Reiniciar a N/A si no se está editando
        }));
      }
    } else {
      setNuevoProductoSeleccionado(prev => ({
        ...prev,
        unidadDeMedida: "N/A",
        precioUnitarioCompra: "",
        codigoDeBarras: "N/A",
      }));
    }
  }, [nuevoProductoSeleccionado.idProducto, productos, editingProductIndex, purchaseData.productosComprados]);


  useEffect(() => {
    const subtotal = purchaseData.productosComprados.reduce(
      (sum, p) => sum + (parseFloat(p.precioUnitarioCompra || 0) * parseInt(p.cantidad || 0)), 0);

    const ivaCalculado = subtotal * 0.19;
    const totalConIVA = subtotal + ivaCalculado;

    setPurchaseData(prev => ({
      ...prev,
      subtotalProductos: subtotal,
      iva: ivaCalculado,
      total: totalConIVA,
    }));
  }, [purchaseData.productosComprados]);

  const validateField = useCallback((fieldName, value) => {
    let error = null;
    switch (fieldName) {
      case 'idProveedor':
        if (!value) error = 'Debe seleccionar un proveedor.';
        break;
      case 'fechaRegistro':
        if (!value) error = 'Fecha de registro es obligatoria.';
        break;
      case 'numeroRecibo':
        if (value && !/^[0-9-]+$/.test(value)) {
          error = 'Solo números y guiones son permitidos.';
        }
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return !error;
  }, []);

  const handleBlur = (fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    // Si el campo es numeroRecibo, lo validamos solo si tiene valor o si estamos en submit
    if (fieldName === 'numeroRecibo' && !purchaseData.numeroRecibo && !touchedFields.numeroRecibo) return;
    validateField(fieldName, purchaseData[fieldName]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "idProveedor") {
      const selectedProvider = proveedores.find(p => p.id === parseInt(value));
      setPurchaseData((prev) => ({
        ...prev,
        idProveedor: value,
        nombreProveedor: selectedProvider ? selectedProvider.nombre : "",
      }));
    } else {
      setPurchaseData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    // Validar en el cambio si el campo ya fue tocado o si es numeroRecibo para validación en tiempo real
    if (touchedFields[name] || name === 'numeroRecibo') {
      validateField(name, value);
    }
  };

  const handleNuevoProductoChange = (e) => {
    const { name, value } = e.target;
    setNuevoProductoSeleccionado((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar errores relacionados con el nuevo producto al cambiar sus valores
    setErrors(prev => ({
      ...prev,
      nuevoProducto: null,
      productosComprados: null
    }));
  };

  const generateRandomBarcode = () => {
    let code = '';
    for (let i = 0; i < 10; i++) {
      code += Math.floor(Math.random() * 10);
    }
    setNuevoProductoSeleccionado(prev => ({
      ...prev,
      codigoDeBarras: code,
    }));
  };

  const clearBarcode = () => {
    setNuevoProductoSeleccionado(prev => ({
      ...prev,
      codigoDeBarras: "N/A",
    }));
  };

  const handleAddProduct = () => {
    const { idProducto, cantidad, precioUnitarioCompra, codigoDeBarras } = nuevoProductoSeleccionado;
    let newProductError = null;

    if (!idProducto) {
      newProductError = "Seleccione un producto.";
    } else if (!cantidad || parseInt(cantidad) <= 0) {
      newProductError = "Cantidad debe ser mayor que cero.";
    } else if (!precioUnitarioCompra || parseFloat(precioUnitarioCompra) <= 0) {
      newProductError = "El precio unitario de compra debe ser mayor que cero.";
    }

    if (newProductError) {
      setErrors(prev => ({ ...prev, nuevoProducto: newProductError }));
      if (productoSectionRef.current) {
        productoSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Foco al campo específico de error en la sección de producto
        if (idProducto === "") {
          const selectElement = productoSectionRef.current.querySelector('select[name="idProducto"]');
          if (selectElement) selectElement.focus();
        } else if (parseInt(cantidad) <= 0) {
          if (nuevoProductoCantidadRef.current) nuevoProductoCantidadRef.current.focus();
        } else if (parseFloat(precioUnitarioCompra) <= 0) {
          if (nuevoProductoPrecioRef.current) nuevoProductoPrecioRef.current.focus();
        }
      }
      return;
    }

    const productoInfo = productos.find(p => p.id === parseInt(idProducto));
    if (!productoInfo) {
      setErrors(prev => ({ ...prev, nuevoProducto: "Producto no encontrado en la lista." }));
      return;
    }

    const newProduct = {
      idProducto: parseInt(idProducto),
      nombre: productoInfo.nombre,
      modelo: productoInfo.modelo,
      unidadDeMedida: productoInfo.unidadDeMedida,
      cantidad: parseInt(cantidad),
      precioUnitarioCompra: parseFloat(precioUnitarioCompra),
      codigoDeBarras: codigoDeBarras === "N/A" ? "" : codigoDeBarras, // Guardar como string vacío si es N/A
    };

    if (editingProductIndex !== null) {
      const updatedProducts = [...purchaseData.productosComprados];
      updatedProducts[editingProductIndex] = newProduct;
      setPurchaseData(prev => ({
        ...prev,
        productosComprados: updatedProducts
      }));
      setEditingProductIndex(null);
      toast.success("Producto actualizado.");
    } else {
      const productoExistente = purchaseData.productosComprados.find(p => p.idProducto === parseInt(idProducto));
      if (productoExistente) {
        setErrors(prev => ({ ...prev, nuevoProducto: "Este producto ya ha sido añadido." }));
        if (productoSectionRef.current) {
          productoSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const selectElement = productoSectionRef.current.querySelector('select[name="idProducto"]');
          if (selectElement) selectElement.focus();
        }
        return;
      }
      setPurchaseData((prev) => ({
        ...prev,
        productosComprados: [...prev.productosComprados, newProduct],
      }));
      toast.success("Producto añadido.");
    }

    // Resetear el formulario de adición de producto
    setNuevoProductoSeleccionado({
      idProducto: "",
      cantidad: 1,
      precioUnitarioCompra: "",
      unidadDeMedida: "N/A",
      codigoDeBarras: "N/A",
    });
    setErrors(prev => ({ ...prev, nuevoProducto: null, productosComprados: null })); // Limpiar errores de producto y lista
  };

  const handleDeleteProduct = (index) => {
    const updatedProducts = purchaseData.productosComprados.filter((_, i) => i !== index);
    setPurchaseData((prev) => ({
      ...prev,
      productosComprados: updatedProducts,
    }));

    if (editingProductIndex === index) {
      setEditingProductIndex(null);
      setNuevoProductoSeleccionado({
        idProducto: "",
        cantidad: 1,
        precioUnitarioCompra: "",
        unidadDeMedida: "N/A",
        codigoDeBarras: "N/A",
      });
    }
    // Añadir validación para la lista de productos comprados después de eliminar
    if (updatedProducts.length === 0) {
      setErrors(prev => ({ ...prev, productosComprados: 'Debe agregar al menos un producto.' }));
    } else {
      setErrors(prev => ({ ...prev, productosComprados: null }));
    }
    toast.success("Producto eliminado.");
  };

  const handleEditProduct = (index) => {
    const productToEdit = purchaseData.productosComprados[index];
    setNuevoProductoSeleccionado({
      idProducto: productToEdit.idProducto.toString(),
      cantidad: productToEdit.cantidad,
      precioUnitarioCompra: productToEdit.precioUnitarioCompra,
      unidadDeMedida: productToEdit.unidadDeMedida,
      codigoDeBarras: productToEdit.codigoDeBarras || "N/A", // Asegurar N/A si está vacío
    });
    setEditingProductIndex(index);
    setErrors(prev => ({ ...prev, nuevoProducto: null })); // Limpiar errores al editar
    if (productoSectionRef.current) {
      productoSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const selectElement = productoSectionRef.current.querySelector('select[name="idProducto"]');
      if (selectElement) selectElement.focus();
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!purchaseData.idProveedor) {
      newErrors.idProveedor = "Debe seleccionar un proveedor.";
      isValid = false;
    }
    if (!purchaseData.fechaRegistro) {
      newErrors.fechaRegistro = "Fecha de registro es obligatoria.";
      isValid = false;
    }
    if (purchaseData.productosComprados.length === 0) {
      newErrors.productosComprados = "Debe agregar al menos un producto.";
      isValid = false;
    }
    if (purchaseData.numeroRecibo && !/^[0-9-]+$/.test(purchaseData.numeroRecibo)) {
      newErrors.numeroRecibo = 'Solo números y guiones son permitidos.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const scrollToError = () => {
    const errorFieldNames = Object.keys(errors).filter(key => errors[key]);
    if (errorFieldNames.length > 0) {
      let targetElement = null;
      let refToFocus = null;

      // Prioridad de scroll y foco
      if (errors.idProveedor && proveedorSelectRef.current) {
        targetElement = proveedorSelectRef.current;
        refToFocus = proveedorSelectRef.current.querySelector('select');
      } else if (errors.fechaRegistro && fechaRegistroRef.current) {
        targetElement = fechaRegistroRef.current;
        refToFocus = fechaRegistroRef.current;
      } else if (errors.numeroRecibo && numeroReciboRef.current) {
        targetElement = numeroReciboRef.current;
        refToFocus = numeroReciboRef.current;
      } else if (errors.productosComprados && productoSectionRef.current) {
        // Si el error es de la lista de productos vacía, se enfoca en el select de añadir producto
        targetElement = productoSectionRef.current;
        refToFocus = productoSectionRef.current.querySelector('select[name="idProducto"]');
      } else if (errors.nuevoProducto && productoSectionRef.current) {
        // Si el error es de un campo específico al añadir/editar producto
        targetElement = productoSectionRef.current;
        if (errors.nuevoProducto.includes("Seleccione un producto")) {
          refToFocus = productoSectionRef.current.querySelector('select[name="idProducto"]');
        } else if (errors.nuevoProducto.includes("Cantidad")) {
          refToFocus = nuevoProductoCantidadRef.current;
        } else if (errors.nuevoProducto.includes("precio unitario")) {
          refToFocus = nuevoProductoPrecioRef.current;
        }
      }

      if (targetElement && modalContentRef.current) {
        const modalScrollContainer = modalContentRef.current;
        const offset = 150; // Ajuste para que quede más centrado en la pantalla

        const elementRect = targetElement.getBoundingClientRect();
        const containerRect = modalScrollContainer.getBoundingClientRect();

        const elementTopInContainer = elementRect.top - containerRect.top;

        modalScrollContainer.scrollTo({
          top: modalScrollContainer.scrollTop + elementTopInContainer - offset,
          behavior: 'smooth'
        });

        if (refToFocus) {
          refToFocus.focus();
        }
      }
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    // Marcar todos los campos principales como "tocados" para que se muestren los errores
    const allFieldNames = ['idProveedor', 'fechaRegistro', 'numeroRecibo', 'productosComprados'];
    const updatedTouchedFields = {};
    allFieldNames.forEach(name => {
      updatedTouchedFields[name] = true;
    });
    setTouchedFields(prev => ({ ...prev, ...updatedTouchedFields }));

    if (!validateForm()) {
      console.log("Errores de validación:", errors); // Para depuración
      scrollToError();
      toast.error("Por favor, corrige los errores en el formulario.");
      return;
    }

    onSave({
      numeroRecibo: purchaseData.numeroRecibo,
      proveedor: purchaseData.nombreProveedor,
      fechaRegistro: purchaseData.fechaRegistro,
      productos: purchaseData.productosComprados,
      observaciones: purchaseData.observaciones,
      subtotal: purchaseData.subtotalProductos,
      iva: purchaseData.iva,
      total: purchaseData.total,
    });
    toast.success("Compra registrada correctamente.");
    setIsClosingIntentionally(true); // Indicar que el cierre es intencional para resetear el estado
    onClose();
  };

  const handleCloseModal = () => {
    setIsClosingIntentionally(true);
    onClose();
  };

  const handleCancel = () => {
    setIsClosingIntentionally(true);
    onClose();
  };

  // Función placeholder para el botón de nuevo producto
  const handleRegisterNewProduct = () => {
    toast.info("Funcionalidad para registrar nuevo producto no implementada aún.");
    // Aquí se podría abrir otro modal, redirigir a una página, etc.
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12"
      // Eliminado onMouseDown y onMouseUp para prevenir el cierre al hacer clic fuera
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" // Added flex-col here
        onClick={(e) => e.stopPropagation()} // Prevents clicks inside the modal from closing it
        ref={modalContentRef} // Referencia para el scroll
      >
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-3xl font-bold text-gray-800">Nueva Compra</h2>
          <button
            onClick={handleCloseModal}
            className="text-gray-400 hover:text-gray-700 text-2xl p-2"
          >
            <FaTimes />
          </button>
        </header>

        {/* El formulario es la parte desplazable */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300">
          <FormSection title="Información General">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormLabel htmlFor="numeroRecibo">Número de Recibo (Opcional)</FormLabel>
                <input
                  id="numeroRecibo"
                  type="text"
                  name="numeroRecibo"
                  value={purchaseData.numeroRecibo}
                  onChange={handleChange}
                  onBlur={() => handleBlur('numeroRecibo')}
                  className={`${inputBaseStyle} ${
                    errors.numeroRecibo ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ej: REC-2024001"
                  ref={numeroReciboRef}
                />
                {errors.numeroRecibo && (
                  <p className="text-red-500 text-sm mt-1">{errors.numeroRecibo}</p>
                )}
              </div>
              <div>
                <FormLabel htmlFor="fechaRegistro">Fecha de Registro <span className="text-red-500">*</span></FormLabel>
                <input
                  id="fechaRegistro"
                  type="date"
                  name="fechaRegistro"
                  value={purchaseData.fechaRegistro}
                  onChange={handleChange}
                  onBlur={() => handleBlur('fechaRegistro')}
                  className={`${inputBaseStyle} ${
                    errors.fechaRegistro ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                  ref={fechaRegistroRef}
                />
                {errors.fechaRegistro && (
                  <p className="text-red-500 text-sm mt-1">{errors.fechaRegistro}</p>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection title="Proveedor">
            <div ref={proveedorSelectRef}>
              <FormLabel htmlFor="idProveedor">Proveedor <span className="text-red-500">*</span></FormLabel>
              <select
                id="idProveedor"
                name="idProveedor"
                value={purchaseData.idProveedor}
                onChange={handleChange}
                onBlur={() => handleBlur('idProveedor')}
                className={`${inputBaseStyle} appearance-none ${
                  errors.idProveedor ? "border-red-500" : "border-gray-300"
                }`}
                required
              >
                <option value="">Seleccione un proveedor</option>
                {proveedores.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre} - NIT: {prov.nit}
                  </option>
                ))}
              </select>
              {errors.idProveedor && (
                <p className="text-red-500 text-sm mt-1">{errors.idProveedor}</p>
              )}
            </div>
          </FormSection>

          <FormSection title="Productos de la Compra">
            {errors.productosComprados && (
              <p className="text-red-500 text-sm mb-2">{errors.productosComprados}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3" ref={productoSectionRef}>
              <div className="md:col-span-2 flex items-end gap-2">
                <div className="flex-grow">
                  <FormLabel>Producto <span className="text-red-500">*</span></FormLabel>
                  <select
                    value={nuevoProductoSeleccionado.idProducto}
                    onChange={handleNuevoProductoChange}
                    name="idProducto"
                    className={`${inputBaseStyle} ${
                      errors.nuevoProducto && errors.nuevoProducto.includes("Seleccione") ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccionar producto</option>
                    {productos.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.nombre} ({prod.modelo})
                      </option>
                    ))}
                  </select>
                  {errors.nuevoProducto && (errors.nuevoProducto.includes("Seleccione") || errors.nuevoProducto.includes("encontrado")) && (
                    <p className="text-red-500 text-sm mt-1">{errors.nuevoProducto}</p>
                  )}
                  {errors.nuevoProducto && errors.nuevoProducto.includes("añadido") && (
                    <p className="text-red-500 text-sm mt-1">{errors.nuevoProducto}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRegisterNewProduct}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-white bg-conv3r-dark hover:bg-conv3r-dark-700 transition-colors h-[42px] mt-auto"
                  title="Registrar nuevo producto"
                >
                  <FaPlus size={16} />
                </button>
              </div>
              <div>
                <FormLabel>Unidad</FormLabel>
                <input
                  type="text"
                  readOnly
                  value={nuevoProductoSeleccionado.unidadDeMedida}
                  className={`${inputBaseStyle} bg-gray-200 text-gray-700 font-semibold cursor-not-allowed`}
                />
              </div>
              <div>
                <FormLabel>Cantidad <span className="text-red-500">*</span></FormLabel>
                <input
                  type="number"
                  name="cantidad"
                  min="1"
                  value={nuevoProductoSeleccionado.cantidad}
                  onChange={handleNuevoProductoChange}
                  className={`${inputBaseStyle} ${
                    errors.nuevoProducto && errors.nuevoProducto.includes("Cantidad") ? "border-red-500" : "border-gray-300"
                  }`}
                  ref={nuevoProductoCantidadRef}
                />
                {errors.nuevoProducto && errors.nuevoProducto.includes("Cantidad") && (
                  <p className="text-red-500 text-sm mt-1">{errors.nuevoProducto}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <FormLabel>Precio Unitario de Compra <span className="text-red-500">*</span></FormLabel>
                <input
                  type="number"
                  name="precioUnitarioCompra"
                  min="0"
                  step="0.01"
                  value={nuevoProductoSeleccionado.precioUnitarioCompra}
                  onChange={handleNuevoProductoChange}
                  className={`${inputBaseStyle} ${
                    errors.nuevoProducto && errors.nuevoProducto.includes("precio unitario") ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ej: 15000.00"
                  ref={nuevoProductoPrecioRef}
                />
                {errors.nuevoProducto && errors.nuevoProducto.includes("precio unitario") && (
                  <p className="text-red-500 text-sm mt-1">{errors.nuevoProducto}</p>
                )}
              </div>
              <div className="md:col-span-2 flex items-end gap-2">
                <div className="flex-1">
                  <FormLabel>Código de Barras</FormLabel>
                  <input
                    type="text"
                    name="codigoDeBarras"
                    value={nuevoProductoSeleccionado.codigoDeBarras}
                    readOnly
                    className={`${inputBaseStyle} bg-gray-200 text-gray-700 cursor-not-allowed`}
                    ref={nuevoProductoCodigoBarrasRef}
                  />
                </div>
                <button
                  type="button"
                  onClick={nuevoProductoSeleccionado.codigoDeBarras === "N/A" ? generateRandomBarcode : clearBarcode}
                  className={`flex-shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] h-[42px] ${
                    nuevoProductoSeleccionado.codigoDeBarras === "N/A" ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                  title={nuevoProductoSeleccionado.codigoDeBarras === "N/A" ? "Generar código de barras" : "Eliminar código de barras"}
                >
                  <FaBarcode size={14} />
                  {nuevoProductoSeleccionado.codigoDeBarras === "N/A" ? '' : <FaTimes size={14} />}
                </button>
              </div>
              <div className="md:col-span-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className={`mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] w-full md:w-auto justify-center ${
                    editingProductIndex !== null ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-conv3r-dark hover:bg-conv3r-dark-700'
                  }`}
                >
                  <FaPlus className="text-white" size={12} />
                  {editingProductIndex !== null ? 'Actualizar Producto' : 'Añadir Producto'}
                </button>
              </div>
            </div>


            {purchaseData.productosComprados.length > 0 && (
              <div className="mt-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio Unitario Compra</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cód. Barras</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {purchaseData.productosComprados.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.nombre}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.unidadDeMedida}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.cantidad}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${item.precioUnitarioCompra.toLocaleString('es-CO')}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${(item.precioUnitarioCompra * item.cantidad).toLocaleString('es-CO')}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.codigoDeBarras || 'N/A'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditProduct(index)}
                                className="text-yellow-600 hover:text-yellow-800"
                                title="Editar producto"
                              >
                                <FaEdit />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(index)}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Detalles</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal Productos:</span>
                    <span className="text-sm font-semibold">${purchaseData.subtotalProductos.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">IVA (19%):</span>
                    <span className="text-sm font-semibold">${purchaseData.iva.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-1 bg-white border border-gray-300 text-gray-800 p-4 rounded-lg flex flex-col items-center justify-center h-full">
                <span className="text-sm font-bold uppercase mb-1">Total Compra</span>
                <span className="text-3xl font-extrabold">${purchaseData.total.toLocaleString('es-CO')}</span>
              </div>
            </div>
          </FormSection>

          <FormSection title="Observaciones">
            <textarea
              name="observaciones"
              value={purchaseData.observaciones}
              onChange={handleChange}
              rows={3}
              className={inputBaseStyle}
              placeholder="Añade cualquier nota o detalle relevante sobre la compra..."
            ></textarea>
          </FormSection>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-conv3r-dark bg-conv3r-gold hover:brightness-95 transition-transform hover:scale-105"
            >
              Guardar Compra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPurchasesModal;