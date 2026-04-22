import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Common/UI/Modal';
import { Button, Input } from '../../../components/Common/UI/Components';
import { ShoppingCart, User, Phone, FileText, DollarSign, X } from 'lucide-react';

const OrderCreateDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  car,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    price: '',
    customerName: '',
    phoneNumber: '',
    note: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (car) {
      setFormData({
        price: car.price || '',
        customerName: '',
        phoneNumber: '',
        note: ''
      });
      setErrors({});
    }
  }, [car, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = 'Vui lòng nhập tên khách hàng';
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^\d{10,11}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ (10-11 số)';
    }
    if (!formData.price) newErrors.price = 'Vui lòng nhập giá';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onConfirm({
        ...formData,
        carId: car._id,
        price: Number(formData.price)
      });
    }
  };

  if (!car) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-[2.5rem] overflow-hidden max-w-2xl w-full border border-slate-100 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar Info */}
          <div className="bg-slate-900 p-8 md:w-72 text-white flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <ShoppingCart className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">Tạo đơn hàng</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Xác nhận thông tin khách hàng và giá bán cuối cùng cho xe này.
              </p>
            </div>
            
            <div className="mt-12 space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Dòng xe</p>
                <p className="font-bold text-white">{car.modelId?.name}</p>
                <p className="text-xs text-slate-400">{car.modelId?.brand}</p>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="flex-1 p-8 bg-white relative">
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="grid grid-cols-1 gap-5">
                <Input 
                  label="Tên khách hàng"
                  placeholder="Nhập họ và tên..."
                  icon={User}
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  error={errors.customerName}
                />
                
                <Input 
                  label="Số điện thoại"
                  placeholder="Nhập số điện thoại liên hệ..."
                  icon={Phone}
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  error={errors.phoneNumber}
                />

                <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
                  <Input 
                    label="Giá bán thỏa thuận (VNĐ)"
                    type="number"
                    placeholder="Nhập giá bán..."
                    icon={DollarSign}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    error={errors.price}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Ghi chú đơn hàng
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                    <textarea 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 pl-10 text-sm min-h-[100px] outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all resize-none"
                      placeholder="Thông tin thêm về ưu đãi, quà tặng..."
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-12 rounded-2xl" 
                  onClick={onClose}
                  disabled={loading}
                >
                  Hủy bỏ
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="flex-[2] h-12 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    'Xác nhận Tạo đơn'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OrderCreateDialog;
