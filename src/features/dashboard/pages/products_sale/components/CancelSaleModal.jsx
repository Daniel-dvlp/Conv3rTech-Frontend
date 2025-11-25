import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const CancelSaleModal = ({ isOpen, onClose, onConfirm, sale }) => {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMotivo('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !sale) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = motivo.trim();

    if (!value) {
      setError('Debes ingresar un motivo para anular la venta');
      return;
    }

    if (value.length < 5) {
      setError('El motivo debe tener al menos 5 caracteres');
      return;
    }

    setError('');
    onConfirm(value);
  };

  const handleClose = () => {
    setMotivo('');
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Anular Venta</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-700 text-2xl p-2"
          >
            <FaTimes />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de anulación <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setError('');
              }}
              placeholder="Describe el motivo por el cual deseas anular esta venta..."
              rows="4"
              style={{ resize: 'none' }}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Venta:</strong> {sale.numero_venta || `#${sale.id_venta}`}
            </p>
            <p className="text-sm text-yellow-800 mt-1">
              Esta acción cambiará el estado a "Anulada" y no se podrá revertir desde esta pantalla.
            </p>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-colors"
            >
              Confirmar anulación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelSaleModal;

