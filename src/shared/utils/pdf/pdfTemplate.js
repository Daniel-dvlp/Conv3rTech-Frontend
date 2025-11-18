import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- COLORES CONV3RTECH ---
// conv3r-dark: #00012A = RGB(0, 1, 42)
// conv3r-gold: #FFB300 = RGB(255, 179, 0)
// gray-50: #F9FAFB = RGB(249, 250, 251)
// gray-200: #E5E7EB = RGB(229, 231, 235)
// gray-700: #374151 = RGB(55, 65, 81)

const CONV3R_DARK = [0, 1, 42];
const CONV3R_GOLD = [255, 179, 0];
const GRAY_50 = [249, 250, 251];
const GRAY_200 = [229, 231, 235];
const GRAY_700 = [55, 65, 81];
const WHITE = [255, 255, 255];


// --- CONFIGURACIÓN GENERAL ---
export const createBasePDF = () => {
    const doc = new jsPDF();

    // Fuente general
    doc.setFont('helvetica');

    return doc;
};

// --- ENCABEZADO GENERICO ---
export const addHeader = (doc, title = "Documento") => {
    const HEADER_HEIGHT = 45; // Encabezado más alto
    
    // Fondo con color conv3r-dark
    doc.setFillColor(...CONV3R_DARK);
    doc.rect(0, 0, 210, HEADER_HEIGHT, 'F');

    // Línea decorativa dorada en la parte inferior del encabezado
    doc.setFillColor(...CONV3R_GOLD);
    doc.rect(0, HEADER_HEIGHT - 3, 210, 3, 'F');

    // Logo/Nombre de la empresa (más grande y centrado verticalmente)
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    
    // "Conv" en blanco
    doc.setTextColor(...WHITE);
    const convWidth = doc.getTextWidth("Conv");
    doc.text("Conv", 14, 18);
    
    // Número 3 en dorado
    doc.setTextColor(...CONV3R_GOLD);
    const threeWidth = doc.getTextWidth("3");
    doc.text("3", 14 + convWidth, 18);
    
    // "rTech" en blanco
    doc.setTextColor(...WHITE);
    doc.text("rTech", 14 + convWidth + threeWidth, 18);

    // Línea separadora sutil debajo del logo
    doc.setDrawColor(...CONV3R_GOLD);
    doc.setLineWidth(0.5);
    doc.line(14, 24, 196, 24);

    // Título del documento (más prominente)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text(title, 14, 35);

    // Resetear color de texto para el contenido
    doc.setTextColor(0, 0, 0);

    return HEADER_HEIGHT + 10; // Devuelve la posición inicial del contenido (con espacio adicional)
};

// --- PIE DE PÁGINA GENERICO ---
export const addFooter = (doc) => {
    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Fondo gris claro en el pie de página
        doc.setFillColor(...GRAY_50);
        doc.rect(0, 280, 210, 20, 'F');

        doc.setFontSize(9);
        doc.setTextColor(...GRAY_700);
        doc.setFont('helvetica', 'normal');

        doc.text(
            `Página ${i} de ${pageCount}`,
            105,
            290,
            { align: "center" }
        );
    }
};

// --- FUNCIÓN AUXILIAR: Detectar si una fila es encabezado de columnas ---
const isHeaderRow = (row) => {
    if (!Array.isArray(row) || row.length === 0) return false;
    
    // Lista de palabras comunes en encabezados
    const headerKeywords = [
        'servicios', 'productos'
    ];
    
    // Verificar si la fila contiene palabras clave de encabezado
    const rowText = row.map(cell => {
        if (typeof cell === 'object' && cell !== null && cell.content) {
            return String(cell.content).toLowerCase();
        }
        return String(cell).toLowerCase();
    }).join(' ');
    
    return headerKeywords.some(keyword => rowText.includes(keyword));
};

// --- TABLA GENÉRICA CON ESTILO CONV3RTECH ---
export const addGenericTable = (doc, tableData, startY = 50) => {
    // Procesar los datos para aplicar estilos automáticamente a los encabezados
    const processedData = tableData.map(row => {
        // Si la fila es un encabezado de columnas, aplicar estilo conv3r-dark
        if (isHeaderRow(row)) {
            return row.map(cell => {
                // Si ya es un objeto con estilos, preservar y agregar estilos de encabezado
                if (typeof cell === 'object' && cell !== null && !Array.isArray(cell)) {
                    return {
                        ...cell,
                        styles: {
                            ...cell.styles,
                            fillColor: CONV3R_DARK,
                            textColor: WHITE,
                            fontStyle: 'bold',
                            halign: cell.styles?.halign || 'center'
                        }
                    };
                }
                // Si es un string simple, convertirlo a objeto con estilos
                return {
                    content: cell,
                    styles: {
                        fillColor: CONV3R_DARK,
                        textColor: WHITE,
                        fontStyle: 'bold',
                        halign: 'center'
                    }
                };
            });
        }
        // Si no es encabezado, aplicar centrado a todas las celdas
        return row.map(cell => {
            // Si ya es un objeto con estilos, preservar y agregar centrado
            if (typeof cell === 'object' && cell !== null && !Array.isArray(cell)) {
                return {
                    ...cell,
                    styles: {
                        ...cell.styles,
                        halign: cell.styles?.halign || 'center'
                    }
                };
            }
            // Si es un string simple, convertirlo a objeto con centrado
            return {
                content: cell,
                styles: {
                    halign: 'center'
                }
            };
        });
    });

    autoTable(doc, {
        startY,
        body: processedData,
        theme: 'grid',
        styles: { 
            fontSize: 10,
            font: 'helvetica',
            textColor: GRAY_700,
            cellPadding: 3,
            lineColor: GRAY_200,
            lineWidth: 0.5,
            halign: 'center' // Centrar todo el contenido por defecto
        },
        alternateRowStyles: {
            fillColor: GRAY_50
        },
        margin: { left: 14, right: 14 }
    });

    return doc.lastAutoTable.finalY;
};

