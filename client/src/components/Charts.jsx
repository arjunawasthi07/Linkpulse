import React, { useState } from 'react';

// Modern Interactive SVG Line Chart
export const LineChart = ({ data = [], height = 240 }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        No click activity recorded in this period yet.
      </div>
    );
  }

  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const width = 700;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.clicks), 5);
  const points = data.map((d, index) => {
    const x = padding.left + (index / Math.max(data.length - 1, 1)) * chartWidth;
    const y = padding.top + chartHeight - (d.clicks / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${
    padding.top + chartHeight
  } Z`;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = padding.top + chartHeight * (1 - pct);
          const val = Math.round(maxVal * pct);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(255, 255, 255, 0.06)"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                fill="#64748b"
                fontSize="11"
                fontFamily="var(--font-mono)"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Gradient fill under the line */}
        <path d={areaD} fill="url(#lineGrad)" />

        {/* The line itself */}
        <path
          d={pathD}
          fill="none"
          stroke="#6366f1"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => {
          const isHovered = hoverIndex === i;
          return (
            <g
              key={i}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 6 : 4}
                fill={isHovered ? '#38bdf8' : '#6366f1'}
                stroke="#0d1322"
                strokeWidth="2"
                style={{ transition: 'all 0.15s ease' }}
              />
              {/* Invisible larger hover target */}
              <circle cx={p.x} cy={p.y} r="14" fill="transparent" />

              {/* X Axis Labels */}
              {(i === 0 || i === Math.floor(points.length / 2) || i === points.length - 1) && (
                <text
                  x={p.x}
                  y={height - 10}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                >
                  {p.time}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoverIndex !== null && points[hoverIndex] && (
        <div
          style={{
            position: 'absolute',
            left: `${(points[hoverIndex].x / width) * 100}%`,
            top: `${(points[hoverIndex].y / height) * 100}%`,
            transform: 'translate(-50%, -130%)',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '0.5rem',
            padding: '0.4rem 0.75rem',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{points[hoverIndex].time}</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>
            {points[hoverIndex].clicks} {points[hoverIndex].clicks === 1 ? 'click' : 'clicks'}
          </div>
        </div>
      )}
    </div>
  );
};

// Horizontal breakdown bar list
export const HorizontalBarChart = ({ items = [], maxDisplay = 5, color = '#6366f1' }) => {
  if (!items || items.length === 0) {
    return <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '1rem 0' }}>No data captured yet</div>;
  }

  const sliced = items.slice(0, maxDisplay);
  const total = items.reduce((acc, curr) => acc + curr.count, 0) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {sliced.map((item, idx) => {
        const pct = Math.round((item.count / total) * 100);
        return (
          <div key={idx}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{item.name}</span>
              <span style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                {item.count} ({pct}%)
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '7px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '9999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: color,
                  borderRadius: '9999px',
                  transition: 'width 0.5s ease-out',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// SVG Donut Chart
export const DonutChart = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '1rem 0' }}>No data captured yet</div>;
  }

  const total = items.reduce((acc, curr) => acc + curr.count, 0) || 1;
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

  let accumulatedPercent = 0;

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
      <div style={{ width: '130px', height: '130px', flexShrink: 0 }}>
        <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
          {items.map((item, index) => {
            const fraction = item.count / total;
            const [startX, startY] = getCoordinatesForPercent(accumulatedPercent);
            accumulatedPercent += fraction;
            const [endX, endY] = getCoordinatesForPercent(accumulatedPercent);
            const largeArcFlag = fraction > 0.5 ? 1 : 0;
            const pathData = `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
            const sliceColor = colors[index % colors.length];

            return <path key={index} d={pathData} fill={sliceColor} stroke="#090d16" strokeWidth="0.04" />;
          })}
          {/* Inner cutout for donut shape */}
          <circle cx="0" cy="0" r="0.65" fill="#0d1322" />
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1, minWidth: '120px' }}>
        {items.map((item, idx) => {
          const pct = Math.round((item.count / total) * 100);
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: colors[idx % colors.length],
                  }}
                />
                <span style={{ color: '#e2e8f0' }}>{item.name}</span>
              </div>
              <span style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
