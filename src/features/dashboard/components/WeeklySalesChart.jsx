import React, { useState } from 'react';

const WeeklySalesChart = ({ data }) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Calcular la venta máxima para escalar las barras
  const maxSales = Math.max(...data.map(item => item.sales));

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.1)] border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">Ventas de la Última Semana</h3>
        <p className="text-sm text-gray-600">Resumen de ventas por día</p>
      </div>
      <div className="flex justify-around items-end h-64 pb-4 gap-2">
        {data.map((item) => (
          <div
            key={item.day}
            className="flex flex-col items-center justify-end h-full flex-1 relative group"
            onMouseEnter={() => setHoveredDay(item.day)}
            onMouseLeave={() => setHoveredDay(null)}
          >
            {hoveredDay === item.day && (
              <div className="absolute -top-12 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg mb-2 whitespace-nowrap shadow-lg z-10">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(item.sales)}
                <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900"></div>
              </div>
            )}
            <div
              className="w-full bg-gradient-to-t from-amber-500 via-conv3r-gold to-amber-300 hover:from-amber-600 hover:via-conv3r-gold hover:to-amber-400 transition-all duration-300 cursor-pointer relative overflow-hidden"
              style={{ 
                height: `${(item.sales / maxSales) * 100}%`,
                borderRadius: '4px 4px 0 0'
              }}
            >
              {/* Subtle shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
            </div>
            <p className="text-sm font-semibold text-gray-600 mt-3">{item.day}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklySalesChart;

