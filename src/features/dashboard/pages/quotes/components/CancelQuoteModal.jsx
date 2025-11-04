import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';

const CancelQuoteModal = ({ isOpen, onClose, onConfirm, quote }) => {
    const [motivo, setMotivo] = useState('');
    const [error, setError] = useState('');

    if (!isOpen || !quote) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!motivo.trim()) {
            setError('Debes ingresar un motivo para anular la cotización');
            return;
        }
        if (motivo.trim().length < 5) {
            setError('El motivo debe tener al menos 5 caracteres');
            return;
        }
        setError('');
        onConfirm(motivo.trim());
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
                    <h2 className="text-2xl font-bold text-gray-800">Anular Cotización</h2>
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
                            placeholder="Describe el motivo por el cual deseas anular esta cotización..."
                            rows="4"
                            style={{ resize: 'none' }}
                            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none ${error ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            <strong>Cotización:</strong> {quote.nombre_cotizacion || quote.ordenServicio || 'N/A'}
                        </p>
                        <p className="text-sm text-yellow-800 mt-1">
                            Esta acción cambiará el estado a "Rechazada" y no podrá ser editada posteriormente.
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
                            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Confirmar Anulación
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CancelQuoteModal;

