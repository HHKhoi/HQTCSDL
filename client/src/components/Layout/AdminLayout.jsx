import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import {
  LayoutDashboard,
  CarFront,
  Settings,
  ListOrdered,
  LogOut,
  Tags,
  User,
  Boxes,
} from "lucide-react";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-surface-bg font-sans text-primary-dark">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-dark text-slate-400 flex flex-col transition-all duration-300">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-primary-gold p-2 rounded-xl text-primary-dark shadow-lg shadow-primary-gold/20">
            <CarFront size={22} />
          </div>
          <span className="text-xl font-display font-bold text-white tracking-tight">
            AutoAdmin
          </span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {/* Dashboard Link */}
          <Link
            to="/"
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive("/")
                ? "bg-white/10 text-primary-gold shadow-sm font-bold"
                : "hover:bg-white/5 hover:text-white"
            }`}
          >
            <LayoutDashboard size={20} className="mr-3" />
            <span className="text-sm tracking-wide">Phân tích</span>
          </Link>

          {/* Orders Link */}
          <Link
            to="/orders"
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive("/orders")
                ? "bg-white/10 text-primary-gold shadow-sm font-bold"
                : "hover:bg-white/5 hover:text-white"
            }`}
          >
            <ListOrdered size={20} className="mr-3" />
            <span className="text-sm tracking-wide">Đơn hàng</span>
          </Link>

          {/* Inventory Items directly */}
          <Link
            to="/cars"
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive("/cars")
                ? "bg-white/10 text-primary-gold shadow-sm font-bold"
                : "hover:bg-white/5 hover:text-white"
            }`}
          >
            <Boxes size={20} className="mr-3" />
            <span className="text-sm tracking-wide">Danh sách xe</span>
          </Link>

          <Link
            to="/car-models"
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive("/car-models")
                ? "bg-white/10 text-primary-gold shadow-sm font-bold"
                : "hover:bg-white/5 hover:text-white"
            }`}
          >
            <Settings size={20} className="mr-3" />
            <span className="text-sm tracking-wide">Mẫu xe</span>
          </Link>

          <Link
            to="/car-types"
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive("/car-types")
                ? "bg-white/10 text-primary-gold shadow-sm font-bold"
                : "hover:bg-white/5 hover:text-white"
            }`}
          >
            <Tags size={20} className="mr-3" />
            <span className="text-sm tracking-wide">Phân loại</span>
          </Link>
        </nav>

        {/* User / Logout */}
        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="w-10 h-10 rounded-full border-2 border-primary-gold/30 p-0.5">
              <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-primary-gold overflow-hidden">
                <User size={20} />
              </div>
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-bold text-white truncate">
                {user?.email?.split("@")[0] || "Admin"}
              </p>
              <p className="text-[10px] text-slate-500 truncate uppercase tracking-widest font-bold">
                Quản trị viên
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-xs uppercase tracking-widest cursor-pointer"
          >
            <LogOut size={18} className="mr-3" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-12 bg-surface-bg custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
