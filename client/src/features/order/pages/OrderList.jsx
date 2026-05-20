import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Package, 
  Trash2, 
  Calendar,
  DollarSign,
  Pencil,
  Check,
  X,
  Download,
} from 'lucide-react';
import { useToast } from '../../../components/Common/UI/ToastContext';
import { Button, Input, StatusBadge } from '../../../components/Common/UI/Components';
import { apiOrders } from '../../../lib/crudApi';
import ConfirmDialog from '../../../components/Common/UI/ConfirmDialog';
import { useOrderActions } from '../hooks/useOrderActions';
import { exportToExcel } from '../../../shared/utils/excelHelper';

const OrderList = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, type: 'primary', title: '', message: '', onConfirm: () => {} });

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiOrders.getAll();
      setOrders(data);
    } catch {
      addToast('Không thể tải danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const { updateOrderStatus, deleteOrder } = useOrderActions(loadOrders);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter(order => {
    const carName = order.carId?.modelId?.name || '';
    const carBrand = order.carId?.modelId?.brand || '';
    const orderCode = order.orderCode?.toLowerCase() || '';
    const orderId = order._id.toLowerCase();
    const query = search.toLowerCase();
    
    return carName.toLowerCase().includes(query) || 
           carBrand.toLowerCase().includes(query) ||
           orderCode.includes(query) ||
           orderId.includes(query);
  });

  const handleDeleteClick = (id, e) => {
    e.stopPropagation();
    setConfirmConfig({
      isOpen: true,
      type: 'danger',
      title: 'Hủy đơn hàng',
      message: 'Bạn có chắc chắn muốn hủy đơn hàng này? Xe sẽ được chuyển về trạng thái Sẵn sàng.',
      onConfirm: () => deleteOrder(id)
    });
  };

  const handleUpdateStatusClick = (id, status, e) => {
    e.stopPropagation();
    const actions = {
      completed: { label: 'hoàn tất', title: 'Hoàn tất đơn hàng', message: 'Xác nhận khách hàng đã thanh toán và nhận xe?' },
      cancelled: { label: 'hủy', title: 'Hủy đơn hàng', message: 'Xác nhận hủy đơn hàng này?' }
    };

    setConfirmConfig({
      isOpen: true,
      type: status === 'cancelled' ? 'danger' : 'primary',
      title: actions[status].title,
      message: actions[status].message,
      onConfirm: () => updateOrderStatus(id, status, actions[status].label)
    });
  };

  const handleEdit = async (order, e) => {
    e.stopPropagation();
    const newPrice = prompt('Nhập giá trị thanh toán mới:', order.price);
    
    if (newPrice !== null) {
      try {
        await apiOrders.update(order._id, { price: parseInt(newPrice) });
        addToast('Cập nhật đơn hàng thành công');
        loadOrders();
      } catch {
        addToast('Lỗi khi cập nhật đơn hàng', 'error');
      }
    }
  };

  const handleExportClick = () => {
    if (orders.length === 0) {
      return addToast('Không có dữ liệu để xuất!', 'warning');
    }

    try {
      addToast('Đang chuẩn bị file...', 'info');
      
      const exportData = orders.map(order => ({
        'Mã đơn hàng': order.orderCode || order._id,
        'Ngày tạo': new Date(order.createdAt).toLocaleDateString('vi-VN'),
        'Hãng xe': order.carId?.modelId?.brand || 'N/A',
        'Dòng xe': order.carId?.modelId?.name || 'N/A',
        'Giá bán ($)': order.price || 0,
        'Tên khách hàng': order.customerName || 'N/A',
        'Số điện thoại': order.phoneNumber || 'N/A',
        'Email': order.customerEmail || '',
        'Ghi chú': order.note || '',
        'Trạng thái': order.status === 'completed' ? 'Hoàn tất' : order.status === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'
      }));

      exportToExcel(exportData, 'Danh_sach_don_hang.xlsx', 'Đơn hàng');
      addToast('Xuất file Excel thành công!', 'success');
    } catch (err) {
      addToast('Lỗi khi xuất file Excel', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Đơn hàng</h2>
          <p className="text-slate-500 text-sm font-medium">Theo dõi hoạt động bán hàng của showroom</p>
        </div>
        <Button 
          variant="ghost" 
          size="md" 
          icon={Download}
          onClick={handleExportClick}
          className="hover:bg-slate-100 border border-slate-200"
        >
          Xuất Excel
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-100">
        <div className="flex-1">
          <Input 
            icon={Search}
            placeholder="Tìm theo mã đơn hoặc tên xe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4 border-b border-slate-100 font-bold">Mã Đơn & Ngày tạo</th>
                <th className="px-6 py-4 border-b border-slate-100 font-bold">Sản phẩm</th>
                <th className="px-6 py-4 border-b border-slate-100 font-bold">Tổng thanh toán</th>
                <th className="px-6 py-4 border-b border-slate-100 font-bold text-center">Trạng thái</th>
                <th className="px-6 py-4 border-b border-slate-100 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang tải đơn hàng...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    Chưa có giao dịch nào được thực hiện.
                  </td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order._id} className="group hover:bg-slate-50/80 transition-all">
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Package size={14} className="text-primary-gold" />
                        {order.orderCode || `#${order._id.slice(-8).toUpperCase()}`}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                        <Calendar size={12} />
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <ShoppingCart size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">
                          {order.carId?.modelId?.name || 'Unknown Model'}
                        </p>
                        <p className="text-xs text-slate-500">{order.carId?.modelId?.brand || 'No Brand'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1 font-bold text-slate-900">
                      <DollarSign size={14} className="text-slate-400" />
                      {order.price?.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <StatusBadge status={order.status || 'pending'} />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-1.5">
                      {order.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleUpdateStatusClick(order._id, 'completed', e)}
                            title="Xác nhận hoàn tất"
                            icon={Check}
                            className="p-2! text-emerald-600 hover:bg-emerald-50"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleUpdateStatusClick(order._id, 'cancelled', e)}
                            title="Hủy đơn hàng"
                            icon={X}
                            className="p-2! text-amber-600 hover:bg-amber-50"
                          />
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEdit(order, e)}
                        title="Chỉnh sửa giá"
                        icon={Pencil}
                        className="p-2! text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteClick(order._id, e)}
                        title="Xóa bản ghi"
                        icon={Trash2}
                        className="p-2! text-slate-400 hover:text-red-500 hover:bg-red-50"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
      />
    </div>
  );
};

export default OrderList;
