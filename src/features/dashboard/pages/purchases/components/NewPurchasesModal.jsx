// src/features/dashboard/pages/purchases/NewPurchasesModal.jsx

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { toast } from 'react-hot-toast';
import useBarcodeScanner from '../../../../../shared/hooks/useBarcodeScanner';

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
  proveedores: proveedoresProp = [],
  productos: productosProp = [],
}) => {
  const proveedores = useMemo(() => proveedoresProp || [], [proveedoresProp]);
  const productos = useMemo(() => productosProp || [], [productosProp]);

  const modalContentRef = useRef();
  const navigate = useNavigate();
  const formRef = useRef();
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
    cantidad: "",
    precioUnitarioCompra: "",
    unidadDeMedida: "",
    codigoDeBarras: "",
  });
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [editingProductIndex, setEditingProductIndex] = useState(null);

  // Hook para el lector de código de barras
  useBarcodeScanner(
    (scannedCode) => {
      // Buscar producto por código de barras
      // Normalizar el código escaneado
      const codigoNormalizado = scannedCode.trim();
      
      const productoEncontrado = productos.find(p => {
        if (!p.codigo_barra) return false;
        
        // Normalizar el código del producto (puede ser string, null, o "n/a")
        const codigoProducto = p.codigo_barra.toString().trim().toLowerCase();
        
        // Ignorar valores vacíos o "n/a"
        if (!codigoProducto || codigoProducto === 'n/a' || codigoProducto === 'null') {
          return false;
        }
        
        // Comparar códigos normalizados
        return codigoProducto === codigoNormalizado.toLowerCase();
      });

      if (productoEncontrado) {
        // Seleccionar el producto automáticamente
        setNuevoProductoSeleccionado((prev) => ({
          ...prev,
          idProducto: productoEncontrado.id_producto.toString(),
        }));
        toast.success(`Producto encontrado: ${productoEncontrado.nombre}`);
      } else {
        toast.error(`No se encontró un producto con el código: ${codigoNormalizado}`);
      }
    },
    {
      minLength: 3,
      scanDuration: 100,
      enabled: isOpen
    }
  );

  useEffect(() => {
    if (!isOpen && isClosingIntentionally) {
      // Resetear estado solo si el modal se cerró intencionalmente
      setPurchaseData(initialState);
      setNuevoProductoSeleccionado({
        idProducto: "",
        cantidad: "",
        precioUnitarioCompra: "",
        unidadDeMedida: "",
        codigoDeBarras: "",
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
        cantidad: "",
        precioUnitarioCompra: "",
        unidadDeMedida: "",
        codigoDeBarras: "",
      });
      setErrors({});
      setTouchedFields({});
      setEditingProductIndex(null);
      setIsClosingIntentionally(false);
    }
  }, [isOpen, isClosingIntentionally, touchedFields.idProveedor, touchedFields.fechaRegistro, purchaseData.productosComprados.length]); // eslint-disable-line react-hooks/exhaustive-deps


  useEffect(() => {
    if (nuevoProductoSeleccionado.idProducto && productos.length > 0) {
      const productoInfo = productos.find(p => p.id_producto === parseInt(nuevoProductoSeleccionado.idProducto));
      if (productoInfo) {
        
        // Usar las propiedades correctas del módulo de productos
        const precio = productoInfo.precio || 0;
        const unidad = productoInfo.unidad_medida || "N/A";
        const codigoBarras = productoInfo.codigo_barra || "N/A";
        
        setNuevoProductoSeleccionado(prev => ({
          ...prev,
          unidadDeMedida: unidad,
          precioUnitarioCompra: precio,
          codigoDeBarras: editingProductIndex !== null
            ? purchaseData.productosComprados[editingProductIndex]?.codigoDeBarras || codigoBarras
            : codigoBarras,
        }));
      }
    } else {
      setNuevoProductoSeleccionado(prev => ({
        ...prev,
        unidadDeMedida: "",
        precioUnitarioCompra: "",
        codigoDeBarras: "",
      }));
    }
  }, [nuevoProductoSeleccionado.idProducto, editingProductIndex, purchaseData.productosComprados, productos]);


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
        else {
          const today = new Date().toISOString().slice(0, 10);
          if (value > today) error = 'La fecha de registro no puede ser mayor a la fecha actual.';
        }
        break;
      case 'numeroRecibo':
        if (!value || value.trim() === '') {
          error = 'Número de recibo es obligatorio.';
        } else if (!/^[0-9-]+$/.test(value)) {
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

  const parsePrecio = (val) => {
    if (!val) return 0;
    // Remove dots (thousands), replace comma with dot (decimal)
    const clean = val.toString().replace(/\./g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  };

  const handleNuevoProductoChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'precioUnitarioCompra') {
      if (value.endsWith('.')) {
        finalValue = value.slice(0, -1) + ',';
      } else if (value.includes('.') && !value.includes(',')) {
        const parts = value.split('.');
        if (parts.length === 2 && parts[1].length !== 3) {
          finalValue = value.replace('.', ',');
        }
      }
    }

    setNuevoProductoSeleccionado((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
    // Limpiar errores relacionados con el nuevo producto al cambiar sus valores
    setErrors(prev => ({
      ...prev,
      nuevoProducto: null,
      productosComprados: null
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

    const productoInfo = productos.find(p => p.id_producto === parseInt(idProducto));
    if (!productoInfo) {
      setErrors(prev => ({ ...prev, nuevoProducto: "Producto no encontrado en la lista." }));
      return;
    }


    const newProduct = {
      idProducto: parseInt(idProducto),
      nombre: productoInfo.nombre || 'Desconocido',
      modelo: productoInfo.modelo || 'N/A',
      unidadDeMedida: productoInfo.unidad_medida || "N/A",
      cantidad: parseInt(cantidad),
      precioUnitarioCompra: parsePrecio(precioUnitarioCompra),
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

  // (validateForm eliminado; la validación vive en handleSubmit)

  // (scrollToError eliminado; el enfoque se gestiona en el flujo de errores inline)


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica como en CreateClientModal
    const newErrors = {};
    
    if (!purchaseData.numeroRecibo.trim()) {
      newErrors.numeroRecibo = "El número de recibo es requerido";
    }
    
    if (!purchaseData.fechaRegistro) {
      newErrors.fechaRegistro = "La fecha de registro es requerida";
    }
    
    if (!purchaseData.idProveedor) {
      newErrors.idProveedor = "El proveedor es requerido";
    }
    
    if (purchaseData.productosComprados.length === 0) {
      newErrors.productosComprados = "Debe agregar al menos un producto";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      setTimeout(() => {
        const firstError = formRef.current?.querySelector('.text-red-500');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }
    
    // Preparar datos en formato que espera el hook (frontend format)
    const compraData = {
      numeroRecibo: purchaseData.numeroRecibo.trim(),
      idProveedor: Number(purchaseData.idProveedor),
      fechaRegistro: purchaseData.fechaRegistro,
      fechaRecibo: purchaseData.fechaRegistro, // El hook usa fechaRecibo o fechaRegistro
      observaciones: purchaseData.observaciones?.trim() || "",
      productos: purchaseData.productosComprados.map(prod => ({
        idProducto: Number(prod.idProducto),
        cantidad: Number(prod.cantidad),
        precioUnitarioCompra: Number(prod.precioUnitarioCompra),
        codigoDeBarra: prod.codigoDeBarras || 'N/A',
        nombre: prod.nombre,
        modelo: prod.modelo,
        unidadDeMedida: prod.unidadDeMedida
      })),
      subtotal: Number(purchaseData.subtotalProductos),
      iva: Number(purchaseData.iva),
      total: Number(purchaseData.total),
      estado: 'Registrada'
    };
    
    console.log("📝 Enviando datos de compra:", compraData);
    
    try {
      await onSave(compraData);
      setIsClosingIntentionally(true);
      onClose();
    } catch (error) {
      console.error("❌ Error al guardar la compra:", error);
      
      // Manejo de errores simplificado como en CreateClientModal
      let mensajeError = "Error al guardar la compra";
      
      if (error.response?.data?.message) {
        mensajeError = error.response.data.message;
      } else if (error.response?.data?.error) {
        mensajeError = error.response.data.error;
      } else if (error.message) {
        mensajeError = error.message;
      }
      
      toast.error(mensajeError);
    }
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
    navigate('/dashboard/productos');
    if (onClose) onClose();
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
          <h2 className="text-3xl font-bold text-gray-800">Nueva compra</h2>
          <button
            onClick={handleCloseModal}
            className="text-gray-400 hover:text-gray-700 text-2xl p-2"
          >
            <FaTimes />
          </button>
        </header>

        {/* El formulario es la parte desplazable */}
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="p-6 space-y-6 overflow-y-auto flex-grow custom-scroll">
          <FormSection title="Información General">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormLabel htmlFor="numeroRecibo"><span className="text-red-500">*</span> Número de recibo:</FormLabel>
                <input
                  id="numeroRecibo"
                  type="text"
                  name="numeroRecibo"
                  value={purchaseData.numeroRecibo}
                  onChange={handleChange}
                  onBlur={() => handleBlur('numeroRecibo')}
                  onKeyPress={(e) => {
                    const charCode = e.charCode;
                    if ((charCode < 48 || charCode > 57) && (charCode < 65 || charCode > 90) && (charCode < 97 || charCode > 122)) {
                      e.preventDefault();
                    }
                  }}
                  className={`${inputBaseStyle} ${
                    errors.numeroRecibo ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                  ref={numeroReciboRef}
                  maxLength="50"
                />
                {errors.numeroRecibo && (
                  <p className="text-red-500 text-sm mt-1">{errors.numeroRecibo}</p>
                )}
              </div>
              <div>
                <FormLabel htmlFor="fechaRegistro"><span className="text-red-500">*</span> Fecha de registro:</FormLabel>
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
                  max={new Date().toISOString().slice(0, 10)}
                />
                {errors.fechaRegistro && (
                  <p className="text-red-500 text-sm mt-1">{errors.fechaRegistro}</p>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection title="Proveedor">
            <div>
              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <FormLabel htmlFor="idProveedor"><span className="text-red-500">*</span> Proveedor:</FormLabel>
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
                    ref={proveedorSelectRef}
                  >
                    <option value="">Seleccione un proveedor</option>
                    {proveedores && proveedores.length > 0 ? proveedores.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.nombre} - NIT: {prov.nit}
                      </option>
                    )) : (
                      <option value="" disabled>No hay proveedores disponibles</option>
                    )}
                  </select>
                  {errors.idProveedor && (
                    <p className="text-red-500 text-sm mt-1">{errors.idProveedor}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/proveedores')}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-white bg-conv3r-dark hover:bg-conv3r-dark-700 transition-colors h-[42px] mt-auto"
                  title="Registrar nuevo proveedor"
                >
                  <FaPlus size={16} />
                </button>
              </div>
            </div>
          </FormSection>

          <FormSection title="Información de los Productos">
            {errors.productosComprados && (
              <p className="text-red-500 text-sm mb-2">{errors.productosComprados}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3" ref={productoSectionRef}>
              {errors.nuevoProducto && errors.nuevoProducto.includes("Cantidad") && (
                <div className="md:col-span-4">
                  <p className="text-red-500 text-sm mb-1">{errors.nuevoProducto}</p>
                </div>
              )}
              <div className="md:col-span-2 flex items-end gap-2">
                <div className="flex-grow">
                  <FormLabel><span className="text-red-500">*</span> Producto:</FormLabel>
                  <select
                    value={nuevoProductoSeleccionado.idProducto}
                    onChange={handleNuevoProductoChange}
                    name="idProducto"
                    className={`${inputBaseStyle} ${
                      errors.nuevoProducto && errors.nuevoProducto.includes("Seleccione") ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccionar producto</option>
                    {productos && productos.length > 0 ? productos.map((prod) => (
                      <option key={prod.id_producto} value={prod.id_producto}>
                        {prod.nombre} ({prod.modelo})
                      </option>
                    )) : (
                      <option value="" disabled>No hay productos disponibles</option>
                    )}
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
                <FormLabel>Unidad:</FormLabel>
                <input
                  type="text"
                  readOnly
                  value={nuevoProductoSeleccionado.unidadDeMedida}
                  className={`${inputBaseStyle} bg-gray-200 text-gray-700 font-semibold cursor-not-allowed`}
                />
              </div>
              <div>
                <FormLabel><span className="text-red-500">*</span> Cantidad:</FormLabel>
                <input
                  type="text"
                  name="cantidad"
                  value={nuevoProductoSeleccionado.cantidad}
                  onChange={handleNuevoProductoChange}
                  onKeyPress={(e) => {
                    const charCode = e.charCode;
                    if ((charCode < 48 || charCode > 57) && charCode !== 46 && charCode !== 44) {
                      e.preventDefault();
                    }
                  }}
                  className={`${inputBaseStyle} ${
                    errors.nuevoProducto && errors.nuevoProducto.includes("Cantidad") ? "border-red-500" : "border-gray-300"
                  }`}
                  ref={nuevoProductoCantidadRef}
                  maxLength="10"
                />
              </div>
              <div className="md:col-span-2">
                <FormLabel><span className="text-red-500">*</span> Precio unitario de compra:</FormLabel>
                <input
                  type="text"
                  name="precioUnitarioCompra"
                  value={nuevoProductoSeleccionado.precioUnitarioCompra}
                  onChange={handleNuevoProductoChange}
                  onKeyPress={(e) => {
                    const charCode = e.charCode;
                    if ((charCode < 48 || charCode > 57) && charCode !== 46 && charCode !== 44) {
                      e.preventDefault();
                    }
                  }}
                  className={`${inputBaseStyle} ${
                    errors.nuevoProducto && errors.nuevoProducto.includes("precio unitario") ? "border-red-500" : "border-gray-300"
                  }`}
                  ref={nuevoProductoPrecioRef}
                  maxLength="20"
                />
                {errors.nuevoProducto && errors.nuevoProducto.includes("precio unitario") && (
                  <p className="text-red-500 text-sm mt-1">{errors.nuevoProducto}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <FormLabel>Código de barras:</FormLabel>
                <input
                  type="text"
                  name="codigoDeBarras"
                  value={nuevoProductoSeleccionado.codigoDeBarras}
                  readOnly
                  className={`${inputBaseStyle} bg-gray-200 text-gray-700 cursor-not-allowed`}
                  ref={nuevoProductoCodigoBarrasRef}
                  placeholder="Se mostrará al seleccionar un producto"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Escanea el código de barras para seleccionar el producto automáticamente
                </p>
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
                  <table className="w-full text-sm text-center border border-gray-200">
                    <thead className="bg-conv3r-dark text-white">
                      <tr>
                        <th className="p-3 font-semibold">Producto</th>
                        <th className="font-semibold">Unidad</th>
                        <th className="font-semibold">Cantidad</th>
                        <th className="font-semibold">Precio Unitario Compra</th>
                        <th className="font-semibold">Subtotal</th>
                        <th className="font-semibold">Cód. Barras</th>
                        <th className="p-3 font-semibold">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white text-gray-700">
                      {purchaseData.productosComprados.map((item, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="p-3">{item.nombre}</td>
                          <td className="p-3">{item.unidadDeMedida}</td>
                          <td className="p-3">{item.cantidad}</td>
                          <td className="p-3">
                            ${item.precioUnitarioCompra.toLocaleString('es-CO')}
                          </td>
                          <td className="p-3">
                            ${(item.precioUnitarioCompra * item.cantidad).toLocaleString('es-CO')}
                          </td>
                          <td className="p-3">{item.codigoDeBarras || 'N/A'}</td>
                          <td className="p-3">
                            <div className="flex justify-center gap-2">
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
                    <tfoot className="bg-gray-50 border-t text-sm text-gray-700">
                      <tr>
                        <td colSpan="5" className="text-right font-semibold px-4 py-2">Subtotal:</td>
                        <td colSpan="2" className="font-bold px-4 py-2 text-right text-conv3r-dark">
                          ${purchaseData.subtotalProductos.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5" className="text-right font-semibold px-4 py-2">IVA (19%):</td>
                        <td colSpan="2" className="font-bold px-4 py-2 text-right text-conv3r-dark">
                          ${purchaseData.iva.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5" className="text-right font-semibold px-4 py-2">Total:</td>
                        <td colSpan="2" className="font-bold text-conv3r-gold text-lg px-4 py-2 text-right">
                          ${purchaseData.total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </FormSection>

          <FormSection title="Observaciones">
            <textarea
              name="observaciones"
              value={purchaseData.observaciones}
              onChange={handleChange}
              rows={3}
              className={`${inputBaseStyle} resize-none`}
              style={{ resize: 'none' }}
              maxLength="500"
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
              className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
            >
              Guardar compra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPurchasesModal;