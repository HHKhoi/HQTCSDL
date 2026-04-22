import React from "react";

// --- Button ---
export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon: Icon,
  ...props
}) => {
  const variants = {
    primary:
      "bg-slate-900 border-slate-900 text-white hover:bg-slate-800 shadow-sm shadow-slate-200",
    secondary: "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",
    ghost:
      "bg-transparent border-transparent text-slate-500 hover:bg-slate-100",
    danger:
      "bg-red-600 border-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-100",
    outline:
      "bg-transparent border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-bold rounded-xl border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === "sm" ? 16 : 18} />}
      {children}
    </button>
  );
};

// --- Input ---
export const Input = React.forwardRef(
  ({ label, error, icon: Icon, className = "", ...props }, ref) => {
    return (
      <div className={`space-y-1.5 ${className}`}>
        {label && (
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
          )}
          <input
            ref={ref}
            className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all ${Icon ? "pl-10" : ""} ${error ? "border-red-500 ring-red-500/5" : ""}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{error}</p>
        )}
      </div>
    );
  },
);

import CustomSelect from "./CustomSelect";

// --- Select ---
export const Select = CustomSelect;

// --- StatusBadge ---
export const StatusBadge = ({ status }) => {
  const configs = {
    available: {
      label: "Sẵn sàng",
      color: "bg-green-50 text-green-700 border-green-200",
    },
    reserved: {
      label: "Đã đặt",
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    sold: {
      label: "Đã bán",
      color: "bg-gray-100 text-gray-600 border-gray-300",
    },
    pending: {
      label: "Chờ xử lý",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    completed: {
      label: "Hoàn tất",
      color: "bg-teal-50 text-teal-700 border-teal-200",
    },
    cancelled: {
      label: "Đã hủy",
      color: "bg-red-50 text-red-700 border-red-200",
    },
  };

  const config = configs[status] || configs.available;

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border ${config.color}`}
    >
      {config.label}
    </span>
  );
};
