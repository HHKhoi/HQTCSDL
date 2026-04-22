import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = {
  pending: '#F59E0B',   // Amber
  completed: '#10B981', // Emerald
  cancelled: '#EF4444'  // Red
};

const STATUS_LABELS = {
  pending: 'Chờ xử lý',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy'
};

export const OrderStatusPie = ({ data }) => {
  const chartData = Object.entries(data)
    .filter(([key]) => ['pending', 'completed', 'cancelled'].includes(key))
    .map(([key, value]) => ({
      name: STATUS_LABELS[key],
      value: value
    }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => {
              const statusKey = Object.keys(STATUS_LABELS).find(k => STATUS_LABELS[k] === entry.name);
              return <Cell key={`cell-${index}`} fill={COLORS[statusKey]} />;
            })}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
