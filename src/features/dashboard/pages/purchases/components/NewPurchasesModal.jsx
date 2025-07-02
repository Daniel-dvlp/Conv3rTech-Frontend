// src/features/dashboard/pages/service_orders/components/NewServiceOrderModal.jsx

import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";

const inputBaseStyle =
  "block w-full text-sm border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold";

const NewPurchaseModal = ({
  isOpen,
  onClose,
  onSave,
  existingPurchases = [], // Lista para validar unicidad [{ receiptNumber, supplierNIT, registrationDate }]
  providers = [], // [{ name, nit }]
}) => {
  // Estado inicial
  const initialState = {
    receiptNumber: "",
    supplier: "", // será el nit del proveedor seleccionado
    registrationDate: "",
    products: [], // { productId (null), productName, quantity, price }
    subtotal: 0,
    iva: 0,
    total: 0,
  };

  // Estados
  const [purchaseData, setPurchaseData] = useState(initialState);

  // Producto temporal para agregar (nombre texto, cantidad, precio)
  const [newProduct, setNewProduct] = useState({
    productName: "",
    quantity: "",
    price: "",
  });

  // Errores de validación
  const [errors, setErrors] = useState({});

  // Actualiza totales cuando cambian productos
  useEffect(() => {
    const subtotal = purchaseData.products.reduce(
      (sum, p) =>
        sum +
        (parseFloat(p.price || 0) * parseFloat(p.quantity || 0)),
      0
    );
    const ivaCalc = subtotal * 0.19;
    setPurchaseData((prev) => ({
      ...prev,
      subtotal,
      iva: ivaCalc,
      total: subtotal + ivaCalc,
    }));
  }, [purchaseData.products]);

  // Manejo de cambios en campos simples (recibo, proveedor, fecha)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPurchaseData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Manejo de cambios en inputs del producto temporal
  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, newProduct: null }));
  };

  // Agregar producto a la lista
  const handleAddProduct = () => {
    if (!newProduct.productName.trim()) {
      setErrors({ newProduct: "Ingrese nombre del producto." });
      return;
    }
    if (!newProduct.quantity || parseFloat(newProduct.quantity) <= 0) {
      setErrors({ newProduct: "Cantidad debe ser mayor que cero." });
      return;
    }
    if (!newProduct.price || parseFloat(newProduct.price) < 0) {
      setErrors({ newProduct: "Precio no válido." });
      return;
    }

    setPurchaseData((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        {
          productId: null,
          productName: newProduct.productName.trim(),
          quantity: newProduct.quantity,
          price: newProduct.price,
        },
      ],
    }));

    setNewProduct({ productName: "", quantity: "", price: "" });
    setErrors((prev) => ({ ...prev, newProduct: null }));
  };

  // Eliminar producto de la lista
  const handleDeleteProduct = (index) => {
    setPurchaseData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  // Validar todo el formulario antes de enviar
  const validateForm = () => {
    const newErrors = {};
    if (!purchaseData.receiptNumber.trim()) {
      newErrors.receiptNumber = "Número de recibo es obligatorio.";
    }
    if (!purchaseData.supplier) {
      newErrors.supplier = "Debe seleccionar un proveedor.";
    }
    if (!purchaseData.registrationDate) {
      newErrors.registrationDate = "Fecha de recibo es obligatoria.";
    }
    if (purchaseData.products.length === 0) {
      newErrors.products = "Debe agregar al menos un producto.";
    }

    // Validar combinación única (receiptNumber + supplierNIT + registrationDate)
    const exists = existingPurchases.some(
      (p) =>
        p.receiptNumber === purchaseData.receiptNumber.trim() &&
        p.supplierNIT === purchaseData.supplier &&
        p.registrationDate === purchaseData.registrationDate
    );
    if (exists) {
      newErrors.unique =
        "Ya existe una compra con el mismo número de recibo, proveedor y fecha.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const dataToSend = {
      receiptNumber: purchaseData.receiptNumber.trim(),
      supplierNIT: purchaseData.supplier,
      registrationDate: purchaseData.registrationDate,
      products: purchaseData.products.map(({ productId, quantity, price, productName }) => ({
        productId,
        productName,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
      })),
      subtotal: purchaseData.subtotal,
      iva: purchaseData.iva,
      total: purchaseData.total,
    };

    onSave(dataToSend);

    // Resetear form
    setPurchaseData(initialState);
    setNewProduct({ productName: "", quantity: "", price: "" });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Nueva Compra</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl p-2"
          >
            <FaTimes />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-300"
        >
          {/* Número de Recibo y Proveedor en fila */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="receiptNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Número de Recibo *
              </label>
              <input
                id="receiptNumber"
                type="text"
                name="receiptNumber"
                value={purchaseData.receiptNumber}
                onChange={handleChange}
                className={`${inputBaseStyle} ${
                  errors.receiptNumber ? "border-red-500" : ""
                }`}
                required
              />
              {errors.receiptNumber && (
                <p className="text-red-600 text-xs mt-1">{errors.receiptNumber}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="supplier"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre del Proveedor *
              </label>
              <select
                id="supplier"
                name="supplier"
                value={purchaseData.supplier}
                onChange={handleChange}
                className={`${inputBaseStyle} ${
                  errors.supplier ? "border-red-500" : ""
                }`}
                required
              >
                <option value="">Seleccione un proveedor</option>
                {providers.map((prov) => (
                  <option key={prov.nit} value={prov.nit}>
                    {prov.name} - NIT: {prov.nit}
                  </option>
                ))}
              </select>
              {errors.supplier && (
                <p className="text-red-600 text-xs mt-1">{errors.supplier}</p>
              )}
            </div>
          </div>

          {/* Fecha recibo */}
          <div>
            <label
              htmlFor="registrationDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha de Recibo *
            </label>
            <input
              id="registrationDate"
              type="date"
              name="registrationDate"
              value={purchaseData.registrationDate}
              onChange={handleChange}
              className={`${inputBaseStyle} ${
                errors.registrationDate ? "border-red-500" : ""
              }`}
              required
            />
            {errors.registrationDate && (
              <p className="text-red-600 text-xs mt-1">{errors.registrationDate}</p>
            )}
          </div>

          {/* Productos (solo texto para nombre) */}
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Productos *</h3>

            <div className="grid grid-cols-3 gap-2 mb-2">
              <input
                type="text"
                name="productName"
                placeholder="Nombre del producto"
                value={newProduct.productName}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    productName: e.target.value,
                  }))
                }
                className={`${inputBaseStyle} ${
                  errors.newProduct ? "border-red-500" : ""
                }`}
              />
              <input
                type="number"
                name="quantity"
                placeholder="Cantidad"
                value={newProduct.quantity}
                onChange={handleNewProductChange}
                min={1}
                className={`${inputBaseStyle} ${
                  errors.newProduct ? "border-red-500" : ""
                }`}
              />
              <input
                type="number"
                name="price"
                placeholder="Precio"
                value={newProduct.price}
                onChange={handleNewProductChange}
                min={0}
                step="0.01"
                className={`${inputBaseStyle} ${
                  errors.newProduct ? "border-red-500" : ""
                }`}
              />

              <button
                type="button"
                onClick={handleAddProduct}
                className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 flex items-center gap-2"
              >
                <FaPlus /> Agregar
              </button>
            </div>

            {errors.newProduct && (
              <p className="text-red-600 text-xs mb-2">{errors.newProduct}</p>
            )}

            {errors.products && (
              <p className="text-red-600 text-xs mb-2">{errors.products}</p>
            )}

            {purchaseData.products.length > 0 && (
              <ul className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded p-2">
                {purchaseData.products.map((p, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center bg-gray-100 p-2 rounded"
                  >
                    <span>
                      {p.productName} - Cantidad: {p.quantity}, Precio: $
                      {parseFloat(p.price).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(i)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Mostrar error de combinación única */}
          {errors.unique && (
            <p className="text-red-600 font-semibold">{errors.unique}</p>
          )}

          {/* Totales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtotal
              </label>
              <input
                type="text"
                value={`$ ${purchaseData.subtotal.toFixed(2)}`}
                disabled
                className={`${inputBaseStyle} bg-gray-100`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IVA (19%)
              </label>
              <input
                type="text"
                value={`$ ${purchaseData.iva.toFixed(2)}`}
                disabled
                className={`${inputBaseStyle} bg-gray-100`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total
              </label>
              <input
                type="text"
                value={`$ ${purchaseData.total.toFixed(2)}`}
                disabled
                className={`${inputBaseStyle} bg-gray-100`}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-transform hover:scale-105"
            >
              Guardar Compra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPurchaseModal;
