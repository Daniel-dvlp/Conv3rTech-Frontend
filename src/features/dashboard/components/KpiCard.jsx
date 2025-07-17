import React from 'react';
import { FaCalendarAlt, FaBox, FaExclamationTriangle, FaMoneyBillWave } from 'react-icons/fa';

const iconMap = {
  '📅': FaCalendarAlt,
  '📦': FaBox,
  '⚠️': FaExclamationTriangle,
  '💰': FaMoneyBillWave,
};

const KpiCard = ({ title, value, unit, icon }) => {
  const IconComponent = iconMap[icon];
  
  // Formatear el valor si es de tipo dinero
  const formattedValue = title === 'Ventas Hoy' ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value) : value;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2  flex items-center justify-between">
      <div className="p-1">
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {formattedValue} {unit && <span className="text-lg text-gray-600">{unit}</span>}
        </p>
      </div>
      {IconComponent && <IconComponent className="text-2xl text-blue-400 opacity-70 " />}
    </div>
  );
};

export default KpiCard;