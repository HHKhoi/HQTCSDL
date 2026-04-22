import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const InventoryAgingBar = ({ data }) => {
  // Aggregate buckets across all models
  const totals = {
    '0-30': 0,
    '30-60': 0,
    '60+': 0
  };

  data.forEach(item => {
    totals['0-30'] += item.agingBuckets['0-30'] || 0;
    totals['30-60'] += item.agingBuckets['30-60'] || 0;
    totals['60+'] += item.agingBuckets['60+'] || 0;
  });

  const chartData = [
    { name: '0-30 ngày', value: totals['0-30'], color: '#10B981' },
    { name: '30-60 ngày', value: totals['30-60'], color: '#F59E0B' },
    { name: 'Trên 60 ngày', value: totals['60+'], color: '#EF4444' }
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748B' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748B' }}
          />
          <Tooltip 
            cursor={{ fill: '#F1F5F9' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
