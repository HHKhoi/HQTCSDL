import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Package,
  Clock,
  AlertCircle,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Calendar,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { analyticsApi } from "../api/analyticsApi";
import { RevenueLineChart } from "../components/RevenueLineChart";
import { OrderStatusPie } from "../components/OrderStatusPie";
import { InventoryAgingBar } from "../components/InventoryAgingBar";
import { useToast } from "../../../components/Common/UI/ToastContext";
import DateRangePicker from "../../../components/Common/UI/DateRangePicker";

const StatCard = ({
  // ... (omitting StatCard definition as it is large)

  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color,
}) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <span
            className={`flex items-center gap-0.5 text-xs font-bold ${trend === "up" ? "text-emerald-500" : "text-rose-500"}`}
          >
            {trend === "up" ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
            {trendValue}%
          </span>
        )}
      </div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
      </div>
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [activeFilter, setActiveFilter] = useState("all");
  const { addToast } = useToast();

  const loadData = React.useCallback(
    async (isInitial = false) => {
      try {
        if (!isInitial) setLoading(true);
        const summary = await analyticsApi.getDashboardSummary(dateRange);
        setData(summary);
      } catch {
        addToast("Lỗi khi tải dữ liệu phân tích", "error");
      } finally {
        setLoading(false);
      }
    },
    [addToast, dateRange],
  );

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  const handleQuickFilter = (type) => {
    const to = new Date().toISOString().split("T")[0];
    let from = new Date();

    if (type === "week") from.setDate(from.getDate() - 7);
    else if (type === "month") from.setDate(from.getDate() - 30);
    else if (type === "year") from.setFullYear(from.getFullYear() - 1);
    else {
      setDateRange({ from: "", to: "" });
      setActiveFilter("all");
      return;
    }

    setDateRange({ from: from.toISOString().split("T")[0], to });
    setActiveFilter(type);
  };

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold"></div>
      </div>
    );
  }

  const { dailySales, inventoryStats, orderStats, carModelStats } = data;

  // Helper to calculate trend by comparing two halves of data
  const calculateTrend = (dataList, key) => {
    if (!dataList || dataList.length < 2) return { trend: "up", value: "0" };

    const mid = Math.floor(dataList.length / 2);
    const firstHalf = dataList.slice(0, mid);
    const secondHalf = dataList.slice(mid);

    const firstSum = firstHalf.reduce((acc, curr) => acc + (curr[key] || 0), 0);
    const secondSum = secondHalf.reduce((acc, curr) => acc + (curr[key] || 0), 0);

    if (firstSum === 0)
      return { trend: secondSum > 0 ? "up" : "up", value: secondSum > 0 ? "100" : "0" };

    const diff = ((secondSum - firstSum) / firstSum) * 100;
    return {
      trend: diff >= 0 ? "up" : "down",
      value: Math.abs(diff).toFixed(1),
    };
  };

  const revenueTrend = calculateTrend(dailySales, "revenue");
  const ordersTrend = calculateTrend(dailySales, "ordersCount");

  const totalRevenue = dailySales.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalOrders =
    orderStats.completed + orderStats.pending + orderStats.cancelled;

  return (
    <div
      className={`p-8 pb-16 space-y-8 animate-in fade-in transition-all duration-300 ${loading ? "opacity-50 pointer-events-none" : ""}`}
    >
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Analytics
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-100 border-t-slate-900" />
            )}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Dữ liệu phân tích chuyên sâu của hệ thống Showroom
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl">
            {[
              { id: "all", label: "Tất cả" },
              { id: "week", label: "Tuần qua" },
              { id: "month", label: "Tháng qua" },
              { id: "year", label: "Năm qua" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleQuickFilter(filter.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === filter.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onChange={(range) => {
              setDateRange(range);
              setActiveFilter("custom");
            }}
          />
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value={`$${(totalRevenue / 1000000).toFixed(1)}M`}
          subtitle="Giai đoạn này"
          icon={DollarSign}
          color="bg-emerald-500"
          trend={revenueTrend.trend}
          trendValue={revenueTrend.value}
        />
        <StatCard
          title="Tổng đơn hàng"
          value={totalOrders}
          subtitle={`${orderStats.completed} hoàn tất`}
          icon={ShoppingCart}
          color="bg-blue-500"
          trend={ordersTrend.trend}
          trendValue={ordersTrend.value}
        />
        <StatCard
          title="Giá trị TB (AOV)"
          value={`$${(orderStats.completed > 0 ? totalRevenue / orderStats.completed : 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={TrendingUp}
          color="bg-primary-gold"
        />
        <StatCard
          title="Tỉ lệ hủy"
          value={`${(orderStats.cancellationRate || 0).toFixed(1)}%`}
          icon={AlertCircle}
          color="bg-rose-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Over Time */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900">
              Doanh thu theo thời gian
            </h2>
            <BarChart3 className="text-slate-300" size={24} />
          </div>
          <RevenueLineChart data={dailySales} />
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900">
              Trạng thái đơn hàng
            </h2>
            <Package className="text-slate-300" size={24} />
          </div>
          <OrderStatusPie data={orderStats} />
        </div>

        {/* Inventory Aging */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900">
              Độ tuổi tồn kho (Sẵn có)
            </h2>
            <Clock className="text-slate-300" size={24} />
          </div>
          <InventoryAgingBar data={inventoryStats} />
        </div>

        {/* Top Selling Models */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-8">
            Hiệu suất theo Model
          </h2>
          <div className="space-y-6">
            {carModelStats.slice(0, 5).map((model, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-400">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{model.modelName}</p>
                  <p className="text-xs text-slate-500">{model.brand}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">
                    {model.unitsSold} bán
                  </p>
                  <p className="text-xs text-emerald-500 font-bold">
                    ${(model.revenue / 1000).toFixed(1)}k
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
