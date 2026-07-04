import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartConfig {
  x_key?: string;
  y_keys?: string[];
  name_key?: string;
  value_key?: string;
  colors?: string[];
  height?: number;
  show_grid?: boolean;
  show_legend?: boolean;
  show_tooltip?: boolean;
}

interface DynamicChartProps {
  chart_type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'radar' | 'heatmap';
  data: any[];
  config?: ChartConfig;
  className?: string;
}

export const DynamicChart: React.FC<DynamicChartProps> = ({
  chart_type = 'bar',
  data = [],
  config = {},
  className = '',
}) => {
  const {
    x_key = 'name',
    y_keys = ['value'],
    name_key = 'name',
    value_key = 'value',
    colors = ['#ff9640', '#18d6b0', '#8b7bff', '#ff5c7a', '#ffb86c'],
    height = 300,
    show_grid = true,
    show_legend = true,
    show_tooltip = true,
  } = config;

  if (!data || data.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center border border-dark-600 rounded-xl bg-dark-800/10 text-dark-300 font-medium"
        style={{ height }}
      >
        No chart data available
      </div>
    );
  }

  // Render heatmap as a custom grid when requested
  if (chart_type === 'heatmap') {
    // Expecting data like [{ row: 'Mon', col: '10am', value: 30 }]
    // We group by row and col to draw a grid
    const rows = Array.from(new Set(data.map((d) => d.row || '')));
    const cols = Array.from(new Set(data.map((d) => d.col || '')));

    const getValue = (row: string, col: string) => {
      const match = data.find((d) => d.row === row && d.col === col);
      return match ? match.value : 0;
    };

    const maxVal = Math.max(...data.map((d) => d.value || 1));

    return (
      <div className={`w-full flex flex-col gap-2 p-4 rounded-xl border border-dark-600 bg-dark-800/10 ${className}`}>
        <div className="overflow-x-auto">
          <div className="min-w-[400px]">
            {/* Headers */}
            <div className="grid" style={{ gridTemplateColumns: `80px repeat(${cols.length}, 1fr)` }}>
              <div />
              {cols.map((col) => (
                <div key={col} className="text-center text-xs font-semibold text-dark-300 py-1">
                  {col}
                </div>
              ))}
            </div>

            {/* Rows */}
            {rows.map((row) => (
              <div key={row} className="grid items-center" style={{ gridTemplateColumns: `80px repeat(${cols.length}, 1fr)` }}>
                <div className="text-xs font-semibold text-dark-200 py-2 truncate pr-2">
                  {row}
                </div>
                {cols.map((col) => {
                  const val = getValue(row, col);
                  const intensity = val / (maxVal || 1);
                  return (
                    <div
                      key={col}
                      className="aspect-square m-0.5 rounded-md flex items-center justify-center text-[10px] font-bold text-white transition-all hover:scale-105"
                      style={{
                        backgroundColor: `rgba(108, 99, 255, ${Math.max(intensity, 0.1)})`,
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                      title={`${row}, ${col}: ${val}`}
                    >
                      {val}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {show_legend && (
          <div className="flex justify-end gap-2 items-center text-xs text-dark-300">
            <span>Low</span>
            <div className="w-24 h-2 rounded bg-gradient-to-r from-accent-primary/10 to-accent-primary" />
            <span>High</span>
          </div>
        )}
      </div>
    );
  }

  const renderCartesianContents = () => (
    <>
      {show_grid && <CartesianGrid strokeDasharray="3 3" stroke="#232340" />}
      <XAxis dataKey={x_key} stroke="#8888a8" fontSize={12} tickLine={false} />
      <YAxis stroke="#8888a8" fontSize={12} tickLine={false} />
      {show_tooltip && (
        <Tooltip
          contentStyle={{
            backgroundColor: '#12121a',
            borderColor: '#232340',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
      )}
      {show_legend && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />}
    </>
  );

  const getChart = () => {
    switch (chart_type) {
      case 'line':
        return (
          <LineChart data={data}>
            {renderCartesianContents()}
            {y_keys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 1 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            {renderCartesianContents()}
            {y_keys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey={value_key}
              nameKey={name_key}
              label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {show_tooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: '#12121a',
                  borderColor: '#232340',
                  borderRadius: '8px',
                }}
              />
            )}
            {show_legend && <Legend />}
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart>
            {renderCartesianContents()}
            <Scatter name="Data" data={data} fill={colors[0]} />
          </ScatterChart>
        );

      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#232340" />
            <PolarAngleAxis dataKey={x_key} stroke="#8888a8" fontSize={11} />
            <PolarRadiusAxis stroke="#8888a8" fontSize={11} />
            {y_keys.map((key, index) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.3}
              />
            ))}
            {show_tooltip && <Tooltip />}
            {show_legend && <Legend />}
          </RadarChart>
        );

      case 'bar':
      default:
        return (
          <BarChart data={data}>
            {renderCartesianContents()}
            {y_keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        {getChart()}
      </ResponsiveContainer>
    </div>
  );
};
export default DynamicChart;
