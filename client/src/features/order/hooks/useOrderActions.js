import { useState } from 'react';
import { apiOrders } from '../../../lib/crudApi';
import { useToast } from '../../../components/Common/UI/ToastContext';

export const useOrderActions = (onSuccess) => {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      await apiOrders.create(orderData);
      addToast('Tạo đơn hàng thành công! Xe đã được chuyển sang trạng thái Đặt cọc.', 'success');
      if (onSuccess) onSuccess();
      return true;
    } catch (err) {
      addToast(err?.response?.data?.message || 'Lỗi khi tạo đơn hàng. Vui lòng thử lại.', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, status, label) => {
    try {
      setLoading(true);
      await apiOrders.update(id, { status });
      addToast(`Đã cập nhật trạng thái đơn hàng thành: ${label}`, 'success');
      if (onSuccess) onSuccess();
      return true;
    } catch {
      addToast('Không thể cập nhật trạng thái đơn hàng', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id) => {
    try {
      setLoading(true);
      await apiOrders.delete(id);
      addToast('Đã xóa đơn hàng thành công', 'success');
      if (onSuccess) onSuccess();
      return true;
    } catch {
      addToast('Lỗi khi xóa đơn hàng', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createOrder,
    updateOrderStatus,
    deleteOrder,
    loading
  };
};
