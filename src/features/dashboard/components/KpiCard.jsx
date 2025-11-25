import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiArrowRight } from 'react-icons/fi';

const KpiCard = ({ title, value, change }) => {
  const formattedValue = title === 'Ventas Hoy'
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)
    : new Intl.NumberFormat('en-US').format(value);

  const hasNumberChange = typeof change === 'number' && isFinite(change);
  const trend = hasNumberChange ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : 'neutral';
  const changeText = hasNumberChange ? `${change > 0 ? '+' : ''}${Math.abs(change).toFixed(1)}%` : '—';
  const changeColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-400';
  const bubbleBg = trend === 'up' ? 'bg-green-50' : trend === 'down' ? 'bg-red-50' : 'bg-gray-100';
  const bubbleIconColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500';

  return (
    <div className="flex items-center justify-between rounded-xl p-3 bg-white border border-gray-200">
      <div className="flex flex-col">
        <p className="text-gray-900 tracking-tight text-2xl font-bold">{formattedValue}</p>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm font-medium">{title}</span>
          <span className={`text-xs font-semibold ${changeColor}`}>{changeText}</span>
        </div>
      </div>
      <div className={`h-10 w-10 rounded-md flex items-center justify-center ${bubbleBg}`}>
        {trend === 'up' && <FiTrendingUp className={`${bubbleIconColor} text-xl`} />}
        {trend === 'down' && <FiTrendingDown className={`${bubbleIconColor} text-xl`} />}
        {trend === 'neutral' && <FiArrowRight className={`${bubbleIconColor} text-xl`} />}
      </div>
    </div>
  );
};

export default KpiCard;
