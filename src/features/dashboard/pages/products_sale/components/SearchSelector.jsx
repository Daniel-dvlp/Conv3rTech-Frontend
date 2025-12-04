import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaChevronDown } from 'react-icons/fa';

const SearchSelector = ({
    options = [],
    value,
    onChange,
    placeholder = "Buscar...",
    displayKey = "nombre",
    searchKeys = ["nombre"],
    error = null,
    label = "",
    required = false,
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    // Asegurar que options sea siempre un array
    const safeOptions = Array.isArray(options) ? options : [];
    const [filteredOptions, setFilteredOptions] = useState(safeOptions);
    const [selectedOption, setSelectedOption] = useState(null);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Filtrar opciones basado en el término de búsqueda y actualizar cuando cambian las opciones
    useEffect(() => {
        const currentOptions = Array.isArray(options) ? options : [];
        
        if (!searchTerm.trim()) {
            setFilteredOptions(currentOptions);
        } else {
            const filtered = currentOptions.filter(option => {
                if (!option) return false;
                return searchKeys.some(key => {
                    const fieldValue = option[key];
                    return fieldValue && fieldValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
                });
            });
            setFilteredOptions(filtered);
        }
    }, [searchTerm, options, searchKeys]);

    // Actualizar opción seleccionada cuando cambia el value
    useEffect(() => {
        const currentOptions = Array.isArray(options) ? options : [];
        
        if (value && currentOptions.length > 0) {
            // Convertir value a número y string para comparación flexible
            const valueNum = Number(value);
            const valueStr = String(value);
            
            const option = currentOptions.find(opt => {
                if (!opt) return false;
                // Comparar tanto como número como string para manejar ambos casos
                return (
                    opt.id === value || opt.id === valueNum || String(opt.id) === valueStr ||
                    opt.id_cliente === value || opt.id_cliente === valueNum || String(opt.id_cliente) === valueStr ||
                    opt.id_producto === value || opt.id_producto === valueNum || String(opt.id_producto) === valueStr ||
                    opt.id_servicio === value || opt.id_servicio === valueNum || String(opt.id_servicio) === valueStr
                );
            });
            setSelectedOption(option || null);
        } else {
            setSelectedOption(null);
        }
    }, [value, options]);

    // Manejar selección de opción
    const handleSelect = (option) => {
        setSelectedOption(option);
        const optionValue = option.id || option.id_cliente || option.id_producto || option.id_servicio;
        onChange(optionValue);
        setSearchTerm('');
        setIsOpen(false);
    };

    // Manejar limpieza de selección
    const handleClear = () => {
        setSelectedOption(null);
        setSearchTerm('');
        onChange('');
        inputRef.current?.focus();
    };

    // Manejar click fuera del dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Generar texto de display para la opción
    const getDisplayText = (option) => {
        if (typeof displayKey === 'function') {
            return displayKey(option);
        }
        return option[displayKey] || '';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {required && <span className="text-red-500">*</span>}{label}
                </label>
            )}

            <div className="relative">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={isOpen ? searchTerm : (selectedOption ? getDisplayText(selectedOption) : '')}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            if (!isOpen) setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder={selectedOption ? getDisplayText(selectedOption) : placeholder}
                        disabled={disabled}
                        className={`w-full px-3 py-2.5 pr-20 text-sm border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold ${error ? 'border-red-500' : 'border-gray-300'
                            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />

                    <div className="absolute inset-y-0 right-0 flex items-center">
                        {selectedOption && !isOpen ? (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={disabled}
                            >
                                <FaTimes size={14} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={disabled}
                            >
                                <FaChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={option.id || option.id_cliente || option.id_producto || option.id_servicio || index}
                                    onClick={() => handleSelect(option)}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                >
                                    <div className="text-sm text-gray-900">
                                        {getDisplayText(option)}
                                    </div>
                                    {option.documento && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Documento: {option.documento}
                                        </div>
                                    )}
                                    {option.codigo_barra && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Código: {option.codigo_barra}
                                        </div>
                                    )}
                                    {option.stock !== undefined && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Stock: {option.stock}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                No se encontraron resultados
                            </div>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
        </div>
    );
};

export default SearchSelector;
