import React, { useState, useMemo, useEffect, useRef } from 'react';

const WeeklySalesChart = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mode, setMode] = useState('week');
  const [mounted, setMounted] = useState(false);
  const svgRef = useRef(null);
  const lineRef = useRef(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 640, height: 220 });

  const chartData = useMemo(() => {
    if (mode === 'week') {
      const normalized = Array.isArray(data)
        ? data.filter((d) => d && typeof d.sales === 'number')
        : [];
      if (normalized.length === 0) {
        const days = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
        return days.map((d) => ({ day: d, sales: 0 }));
      }
      return normalized;
    }
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return months.map((m, i) => ({ day: m, sales: Math.round((i+1) * 180) }));
  }, [data, mode]);

  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setSize({ width: Math.max(320, cr.width), height: Math.max(160, cr.height) });
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const maxData = chartData.reduce((m, d) => Math.max(m, Number(d.sales) || 0), 0);
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.max(1, maxData))));
  const niceMaxCandidate = Math.ceil(maxData / magnitude) * magnitude;
  const maxSales = Math.max(1000, niceMaxCandidate);
  const width = size.width;
  const height = size.height;
  const padding = { top: 20, right: 20, bottom: 30, left: 70 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const denom = Math.max(1, chartData.length - 1);
  const xAt = (i) => padding.left + (i * innerW) / denom;
  const yAt = (v) => padding.top + (1 - v / maxSales) * innerH;
  const points = chartData.map((d, i) => [xAt(i), yAt(d.sales)]);
  const linePath = points.length > 0 ? `M ${points.map(p => `${p[0]} ${p[1]}`).join(' L ')}` : '';
  const areaPath = points.length > 0
    ? `${linePath} L ${xAt(Math.max(0, chartData.length - 1))} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`
    : '';
  const tickCount = 5;
  const tickVals = Array.from({ length: tickCount }, (_, i) => ((i + 1) * maxSales) / tickCount);

  useEffect(() => {
    setMounted(false);
    requestAnimationFrame(() => setMounted(true));
  }, [mode]);

  useEffect(() => {
    const el = lineRef.current;
    if (!el || points.length < 2 || !linePath) return;
    const length = el.getTotalLength();
    el.style.strokeDasharray = `${length}`;
    el.style.strokeDashoffset = `${length}`;
    el.getBoundingClientRect();
    el.style.transition = 'stroke-dashoffset 700ms ease';
    el.style.strokeDashoffset = '0';
  }, [linePath]);

  const onPointerMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const vx = ((e.clientX - rect.left) / rect.width) * width;
    const clamped = Math.max(padding.left, Math.min(vx, width - padding.right));
    const ratio = (clamped - padding.left) / innerW;
    const idx = Math.round(ratio * (chartData.length - 1));
    if (idx !== hoveredIndex) setHoveredIndex(idx);
  };

  const onPointerLeave = () => setHoveredIndex(null);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') setHoveredIndex((i) => Math.min((i ?? 0) + 1, chartData.length - 1));
    if (e.key === 'ArrowLeft') setHoveredIndex((i) => Math.max((i ?? chartData.length - 1) - 1, 0));
  };

  return (
    <div className="rounded-xl p-6 bg-white border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex flex-col">
          <h3 className="text-gray-900 text-lg font-bold leading-normal">Ventas Diarias</h3>
          <p className="text-gray-500 text-sm">Total de ventas de los últimos 7 días.</p>
        </div>
      </div>
      <div className="relative h-[220px] w-full" ref={containerRef}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          role="img"
          aria-label="Gráfico de ventas"
          tabIndex={0}
          onKeyDown={onKeyDown}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {tickVals.map((t, i) => (
            <g key={i}>
              <line x1={padding.left} x2={width - padding.right} y1={yAt(t)} y2={yAt(t)} stroke="#E5E7EB" strokeDasharray="4 4" />
              <text x={padding.left - 8} y={yAt(t)} textAnchor="end" dominantBaseline="middle" fill="#6B7280" fontSize="12">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(t)}</text>
            </g>
          ))}
          <path d={areaPath} fill="url(#areaGradient)" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 700ms ease' }} />
          <path ref={lineRef} d={linePath} fill="none" stroke="#3B82F6" strokeWidth="2.5" />
          {points.map((p, i) => (
            <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
              <circle cx={p[0]} cy={p[1]} r={4} fill="#3B82F6" />
              <text x={p[0]} y={height - 6} textAnchor="middle" fill="#6B7280" fontSize="12">{chartData[i].day}</text>
              {hoveredIndex === i && (
                <g>
                  <line x1={p[0]} x2={p[0]} y1={padding.top} y2={height - padding.bottom} stroke="#E5E7EB" strokeDasharray="3 3" />
                  <circle cx={p[0]} cy={p[1]} r={6} fill="#3B82F6" stroke="white" strokeWidth={2} />
                  <rect x={Math.max(padding.left + 4, Math.min(p[0] - 55, width - padding.right - 110))} y={p[1] - 60 > padding.top ? p[1] - 60 : p[1] + 12} rx={8} ry={8} width={110} height={48} fill="#1F2937" />
                  <text x={Math.max(padding.left + 4, Math.min(p[0] - 55, width - padding.right - 110)) + 55} y={p[1] - 60 > padding.top ? p[1] - 44 : p[1] + 28} textAnchor="middle" fill="#F9FAFB" fontSize="12">
                    {chartData[i].day}
                  </text>
                  <text x={Math.max(padding.left + 4, Math.min(p[0] - 55, width - padding.right - 110)) + 55} y={p[1] - 60 > padding.top ? p[1] - 28 : p[1] + 44} textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="600">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(chartData[i].sales)}
                  </text>
                </g>
              )}
            </g>
          ))}
          {hoveredIndex === null && (
            <g style={{ opacity: 0 }} />
          )}
        </svg>
      </div>
    </div>
  );
};

export default WeeklySalesChart;

