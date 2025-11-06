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
    <div className="bg-white rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.1)] border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        {/* Content */}
        <div className="flex-1">
          {/* Label */}
          <p className="text-base font-medium text-gray-600 mb-2">{title}</p>
          
          {/* Value */}
          <div className="flex items-baseline gap-2">
            <p className="text-[2.25rem] font-bold text-gray-900 leading-none">
              {formattedValue}
            </p>
            {unit && <span className="text-lg font-medium text-gray-500">{unit}</span>}
          </div>
        </div>
        
        {/* Icon Container */}
        {IconComponent && (
          <div className="bg-gradient-to-br from-conv3r-gold/15 to-conv3r-gold/8 rounded-full p-3 flex items-center justify-center">
            <IconComponent className="text-[28px] text-conv3r-gold" />
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;

