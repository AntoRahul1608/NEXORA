import React, { useState } from 'react';
import { useNexoraStore } from '../store/store';
import { DynamicUI } from '../renderer/DynamicRenderer';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, FileText } from 'lucide-react';

export const RightCanvas: React.FC = () => {
  const currentUI = useNexoraStore((state) => state.currentUI);
  const sessionId = useNexoraStore((state) => state.sessionId);
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'insights'>('overview');

  if (!sessionId) {
    return (
      <div className="w-[380px] h-screen bg-dark-800 border-l border-dark-400/50 flex flex-col items-center justify-center p-8 text-center select-none">
        <FileText size={40} className="text-dark-300 mb-3" />
        <h3 className="text-sm font-bold text-dark-100 mb-1">No Active Session</h3>
        <p className="text-xs text-dark-200">Create a conversation in the sidebar to begin analysis.</p>
      </div>
    );
  }

  // If the agent has generated a UI, we render it directly
  if (currentUI) {
    return (
      <div className="w-[380px] h-screen bg-dark-800 border-l border-dark-400/50 flex flex-col overflow-y-auto p-6 select-none z-10 relative">
        <div className="flex items-center gap-2 mb-6 border-b border-dark-500 pb-4">
          <span className="h-2.5 w-2.5 rounded-full bg-accent-secondary glow-secondary animate-pulse" />
          <h2 className="text-xs font-bold font-mono tracking-widest text-dark-200 uppercase">
            Active Workspace
          </h2>
        </div>
        <div className="flex-1 space-y-4">
          <DynamicUI schema={currentUI} />
        </div>
      </div>
    );
  }

  // Mock static charts for empty state dashboard
  const compositionData = [
    { name: 'Numeric', value: 8, color: '#ff9640' },
    { name: 'Categorical', value: 6, color: '#8b7bff' },
    { name: 'Date', value: 2, color: '#18d6b0' },
    { name: 'Text', value: 2, color: '#ff5c7a' },
  ];

  const heatCells = [
    { val: 1.0, op: 1.0 }, { val: 0.8, op: 0.8 }, { val: 0.4, op: 0.4 }, { val: 0.1, op: 0.1 }, { val: -0.2, op: 0.2 },
    { val: 0.8, op: 0.8 }, { val: 1.0, op: 1.0 }, { val: 0.5, op: 0.5 }, { val: 0.2, op: 0.2 }, { val: 0.0, op: 0.05 },
    { val: 0.4, op: 0.4 }, { val: 0.5, op: 0.5 }, { val: 1.0, op: 1.0 }, { val: -0.6, op: 0.6 }, { val: 0.1, op: 0.1 },
    { val: 0.1, op: 0.1 }, { val: 0.2, op: 0.2 }, { val: -0.6, op: 0.6 }, { val: 1.0, op: 1.0 }, { val: 0.3, op: 0.3 },
    { val: -0.2, op: 0.2 }, { val: 0.0, op: 0.05 }, { val: 0.1, op: 0.1 }, { val: 0.3, op: 0.3 }, { val: 1.0, op: 1.0 },
  ];

  return (
    <div className="w-[380px] h-screen bg-dark-800 border-l border-dark-400/50 flex flex-col select-none z-10">
      {/* Tabs list */}
      <div className="flex border-b border-dark-500 px-4">
        {(['overview', 'predictions', 'insights'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3.5 text-xs font-bold cursor-pointer relative transition-all uppercase tracking-wider ${
              activeTab === tab ? 'text-white' : 'text-dark-200 hover:text-dark-100'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute left-0 right-0 bottom-[-1px] h-[2px] bg-gradient-to-r from-accent-primary to-accent-tertiary" />
            )}
          </button>
        ))}
      </div>

      {/* Pane Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'overview' && (
          <>
            <div>
              <h3 className="text-sm font-bold text-white mb-3">Dataset Overview</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-dark-700 border border-dark-500">
                  <span className="text-[10px] text-dark-200 block mb-1 uppercase font-bold">ROWS</span>
                  <span className="text-lg font-bold font-mono text-white">12,458</span>
                </div>
                <div className="p-3.5 rounded-xl bg-dark-700 border border-dark-500">
                  <span className="text-[10px] text-dark-200 block mb-1 uppercase font-bold">COLUMNS</span>
                  <span className="text-lg font-bold font-mono text-white">18</span>
                </div>
                <div className="p-3.5 rounded-xl bg-dark-700 border border-dark-500">
                  <span className="text-[10px] text-dark-200 block mb-1 uppercase font-bold">MISSING</span>
                  <span className="text-lg font-bold font-mono text-accent-error">2.45%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-dark-700 border border-dark-500">
                  <span className="text-[10px] text-dark-200 block mb-1 uppercase font-bold">MEMORY</span>
                  <span className="text-lg font-bold font-mono text-accent-secondary">12.6 MB</span>
                </div>
              </div>
            </div>

            {/* Column Composition Chart */}
            <div className="p-4 rounded-xl bg-dark-700 border border-dark-500 space-y-4">
              <h4 className="text-xs font-bold text-white flex justify-between">
                <span>Column Composition</span>
                <span className="text-dark-200 font-normal">18 total</span>
              </h4>
              <div className="h-[140px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={compositionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {compositionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1">
                {compositionData.map((item) => (
                  <div key={item.name} className="flex justify-between items-center text-xs text-dark-200">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-bold text-white">{item.value} · {((item.value / 18) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Correlation Matrix */}
            <div className="p-4 rounded-xl bg-dark-700 border border-dark-500 space-y-3">
              <h4 className="text-xs font-bold text-white">Correlation Matrix</h4>
              <div className="grid grid-cols-5 gap-1.5">
                {heatCells.map((cell, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-md flex items-center justify-center text-[10px] font-bold text-dark-900 transition-all hover:scale-105"
                    style={{
                      backgroundColor: `rgba(255, 150, 64, ${cell.op})`,
                    }}
                    title={`Correlation: ${cell.val}`}
                  >
                    {cell.val > 0 ? `+${cell.val}` : cell.val}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-dark-300 font-bold uppercase pt-1">
                <span>Sales</span>
                <span>Qty</span>
                <span>Disc.</span>
                <span>Profit</span>
                <span>Ship</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'predictions' && (
          <>
            <h3 className="text-sm font-bold text-white mb-3">Predictions Model</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-dark-700 border border-dark-500">
                <span className="text-[10px] text-dark-200 block mb-1 uppercase font-bold">PROJECTED GROWTH</span>
                <span className="text-lg font-bold font-mono text-accent-secondary">+18.4%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-dark-700 border border-dark-500">
                <span className="text-[10px] text-dark-200 block mb-1 uppercase font-bold">CONFIDENCE</span>
                <span className="text-lg font-bold font-mono text-accent-primary">91%</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-accent-primary/10 to-transparent border border-accent-primary/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-accent-primary">
                <TrendingUp size={14} />
                Model Note
              </div>
              <p className="text-xs leading-relaxed text-dark-100">
                Gradient-boosted forecast trained on 24 months of seasonality. Confidence narrows past December — treat that tail as directional, not exact.
              </p>
            </div>
          </>
        )}

        {activeTab === 'insights' && (
          <>
            <h3 className="text-sm font-bold text-white mb-3">Ranked Insights</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-dark-700 border-l-4 border-accent-primary border-dark-500">
                <div className="flex justify-between items-center text-xs font-bold text-white mb-1">
                  <span>Electronics drives 38.6% of revenue</span>
                  <span className="text-accent-primary uppercase font-mono">High</span>
                </div>
                <p className="text-xs text-dark-200 leading-relaxed">
                  Concentration risk — a single category anchors over a third of sales.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-dark-700 border-l-4 border-accent-secondary border-dark-500">
                <div className="flex justify-between items-center text-xs font-bold text-white mb-1">
                  <span>August & December peak</span>
                  <span className="text-accent-secondary uppercase font-mono">Med</span>
                </div>
                <p className="text-xs text-dark-200 leading-relaxed">
                  Consistent seasonal lift — plan inventory 4–6 weeks ahead.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-dark-700 border-l-4 border-accent-error border-dark-500">
                <div className="flex justify-between items-center text-xs font-bold text-white mb-1">
                  <span>2.45% missing values in Discount</span>
                  <span className="text-accent-error uppercase font-mono">Low</span>
                </div>
                <p className="text-xs text-dark-200 leading-relaxed">
                  Mostly in early Q1 rows — safe to impute with category median.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Pane Footer Actions */}
      <div className="p-4 border-t border-dark-500 bg-dark-900/40 grid grid-cols-2 gap-3.5">
        <button
          onClick={() => setActiveTab('predictions')}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dark-500 bg-dark-700 text-xs text-dark-100 hover:bg-dark-600 transition-colors font-bold cursor-pointer"
        >
          <TrendingUp size={13} />
          Forecast
        </button>
        <button
          onClick={() => alert('Report downloaded (demo)')}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-accent-primary to-orange-500 text-xs text-dark-900 hover:brightness-105 transition-all font-bold cursor-pointer"
        >
          <FileText size={13} />
          Report PDF
        </button>
      </div>
    </div>
  );
};
