// src/shared/hooks/useBarcodeScanner.js
import { useEffect, useRef } from 'react';

/**
 * Hook personalizado para detectar escaneo de código de barras
 * Compatible con lectores configurados como teclado (HID)
 * 
 * @param {Function} onScan - Callback que se ejecuta cuando se completa un escaneo
 * @param {Object} options - Opciones de configuración
 * @param {number} options.minLength - Longitud mínima del código (default: 3)
 * @param {number} options.scanDuration - Tiempo máximo entre caracteres en ms (default: 100)
 * @param {boolean} options.enabled - Si el hook está activo (default: true)
 */
const useBarcodeScanner = (onScan, options = {}) => {
    const {
        minLength = 3,
        scanDuration = 100,
        enabled = true
    } = options;

    const barcodeRef = useRef('');
    const scanInProgressRef = useRef(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (!enabled) return;

        const handleKeyPress = (e) => {
            // Ignorar si el usuario está escribiendo en un textarea o input de texto largo
            const target = e.target;
            const isTextArea = target.tagName === 'TEXTAREA';
            const isLongInput = target.tagName === 'INPUT' &&
                target.type !== 'text' &&
                target.id !== 'codigo_barra';

            if (isTextArea || isLongInput) return;

            // Iniciar escaneo si no está en progreso
            if (!scanInProgressRef.current) {
                scanInProgressRef.current = true;
                barcodeRef.current = '';
            }

            // Limpiar timeout anterior
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Si es Enter, finalizar escaneo
            if (e.key === 'Enter' || e.keyCode === 13) {
                e.preventDefault();

                const scannedCode = barcodeRef.current.trim();

                // Validar longitud mínima
                if (scannedCode.length >= minLength) {
                    onScan(scannedCode);
                }

                // Reset
                barcodeRef.current = '';
                scanInProgressRef.current = false;
                return;
            }

            // Acumular caracteres (solo caracteres imprimibles)
            if (e.key.length === 1) {
                barcodeRef.current += e.key;
            }

            // Timeout para detectar fin de escaneo o escritura manual
            timeoutRef.current = setTimeout(() => {
                barcodeRef.current = '';
                scanInProgressRef.current = false;
            }, scanDuration);
        };

        // Agregar listener
        window.addEventListener('keypress', handleKeyPress);

        // Cleanup
        return () => {
            window.removeEventListener('keypress', handleKeyPress);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [onScan, minLength, scanDuration, enabled]);

    return null;
};

export default useBarcodeScanner;