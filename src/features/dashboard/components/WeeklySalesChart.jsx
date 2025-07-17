import React, { useState } from 'react';

const WeeklySalesChart = ({ data }) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Calcular la venta máxima para escalar las barras
  const maxSales = Math.max(...data.map(item => item.sales));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Ventas de la Última Semana</h3>
      <div className="flex justify-around items-end h-48">
        {data.map((item) => (
          <div
            key={item.day}
            className="flex flex-col items-center justify-end h-full w-1/7 px-1 relative group"
            onMouseEnter={() => setHoveredDay(item.day)}
            onMouseLeave={() => setHoveredDay(null)}
          >
            {hoveredDay === item.day && (
              <div className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded-md mb-1 whitespace-nowrap">
                Cantidad de Productos Vendidos: {item.productsSold}
              </div>
            )}
            <div
              className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-md transition-all duration-200"
              style={{ height: `${(item.sales / maxSales) * 100}%` }}
            ></div>
            <p className="text-xs text-gray-600 mt-2">{item.day}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(item.sales)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklySalesChart;