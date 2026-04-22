import React, { useState, useEffect } from 'react';
import { Save, X, Car, DollarSign, Activity } from 'lucide-react';
import { apiCarModels } from '../../../lib/crudApi';
import { Button, Input } from '../../../components/Common/UI/Components';
import CustomSelect from '../../../components/Common/UI/CustomSelect';

const CarFormDialog = ({ car, onSubmit, onCancel }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    modelId: car?.modelId?._id || car?.modelId || '',
    price: car?.price || '',
    status: car?.status || 'available'
  });

  useEffect(() => {
    const loadModels = async () => {
      try {
        const data = await apiCarModels.getAll();
        setModels(data);
        if (!car && data.length > 0) {
          setFormData(prev => ({ ...prev, modelId: data[0]._id }));
        }
      } catch (err) {
        console.error('Failed to load models', err);
      } finally {
        setLoading(false);
      }
    };
    loadModels();
  }, [car]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.modelId || !formData.price) return;
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-xl border border-slate-100 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
            {car ? 'Chỉnh sửa xe' : 'Thêm xe vào kho'}
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Thiết lập thông tin chi tiết cho xe trong hệ thống
          </p>
        </div>
        <button 
          onClick={onCancel}
          className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 text-slate-400"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <CustomSelect
              label="Mẫu xe (Model)"
              icon={Car}
              options={models.map(m => ({ value: m._id, label: `${m.brand} ${m.name}` }))}
              value={formData.modelId}
              onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <Input
            label="Giá niêm yết (VNĐ)"
            type="number"
            icon={DollarSign}
            placeholder="Nhập giá xe..."
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />

          <CustomSelect
            label="Trạng thái"
            icon={Activity}
            options={[
              { value: 'available', label: 'Sẵn sàng' },
              { value: 'reserved', label: 'Đã đặt cọc' },
              { value: 'sold', label: 'Đã bán' }
            ]}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            required
          />
        </div>

        <div className="flex gap-4 pt-6 border-t border-slate-50">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1 py-4 rounded-2xl border-slate-200"
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800"
            icon={Save}
          >
            {car ? 'Lưu thay đổi' : 'Thêm vào kho'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CarFormDialog;
