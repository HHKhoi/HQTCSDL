import React, { useState, useEffect, useCallback } from 'react';
import { apiCars, apiCarSpecs } from '../../../lib/crudApi';
import { 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Settings2, 
  Trash2,
  Activity,
  Pencil,
  ShoppingCart,
} from 'lucide-react';
import Modal from '../../../components/Common/UI/Modal';
import ConfirmDialog from '../../../components/Common/UI/ConfirmDialog';
import OrderCreateDialog from '../../order/components/OrderCreateDialog';
import CarFormDialog from '../components/CarFormDialog';
import CarSpecForm from '../components/CarSpecForm';
import CustomSelect from '../../../components/Common/UI/CustomSelect';
import { useToast } from '../../../components/Common/UI/ToastContext';
import { Button, Input, StatusBadge } from '../../../components/Common/UI/Components';
import { useOrderActions } from '../../order/hooks/useOrderActions';

const CarList = () => {
  const { addToast } = useToast();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [activeCar, setActiveCar] = useState(null);

  const loadCars = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiCars.getAll();
      setCars(data);
    } catch {
      addToast('Không thể tải danh sách xe', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const { createOrder, loading: orderLoading } = useOrderActions(loadCars);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.modelId?.name?.toLowerCase().includes(search.toLowerCase()) || 
                          car.modelId?.brand?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || car.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleAddSpecClick = (car, e) => {
    e.stopPropagation();
    setActiveCar(car);
    setIsSpecModalOpen(true);
  };

  const handleSpecSubmit = async (specs) => {
    try {
      if (activeCar.specId) {
        const specId = typeof activeCar.specId === 'object' ? activeCar.specId._id : activeCar.specId;
        await apiCarSpecs.update(specId, { specs });
      } else {
        const newSpec = await apiCarSpecs.create({ specs });
        await apiCars.update(activeCar._id, { specId: newSpec._id });
      }
      
      setIsSpecModalOpen(false);
      loadCars();
      addToast('Cập nhật thông số kỹ thuật thành công!');
    } catch {
      addToast('Lỗi khi lưu thông số kỹ thuật', 'error');
    }
  };

  const handleDeleteClick = (car, e) => {
    e.stopPropagation();
    setActiveCar(car);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!activeCar) return;
    try {
      await apiCars.delete(activeCar._id);
      loadCars();
      addToast('Đã xóa xe thành công');
    } catch {
      addToast('Lỗi khi xóa xe', 'error');
    }
  };

  const handleCreateOrderClick = (car, e) => {
    e.stopPropagation();
    if (car.status === 'sold' || car.status === 'reserved') {
      return addToast('Xe này không còn khả dụng để đặt hàng', 'warning');
    }
    setActiveCar(car);
    setIsOrderModalOpen(true);
  };

  const handleOrderSubmit = async (orderData) => {
    const success = await createOrder(orderData);
    if (success) {
      setIsOrderModalOpen(false);
    }
  };

  const handleOpenAdd = () => {
    setActiveCar(null);
    setIsCarModalOpen(true);
  };

  const handleOpenEdit = (car, e) => {
    e.stopPropagation();
    setActiveCar(car);
    setIsCarModalOpen(true);
  };

  const handleCarSubmit = async (formData) => {
    try {
      if (activeCar) {
        await apiCars.update(activeCar._id, formData);
        addToast('Cập nhật thông tin xe thành công!');
      } else {
        await apiCars.create(formData);
        addToast('Thêm xe vào kho thành công!');
      }
      setIsCarModalOpen(false);
      loadCars();
    } catch {
      addToast('Lỗi khi lưu thông tin xe', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Kho xe</h2>
          <p className="text-slate-500 text-sm font-medium">Hệ thống quản lý xe chuyên nghiệp</p>
        </div>
        <Button 
          variant="primary" 
          size="lg" 
          icon={Plus}
          onClick={handleOpenAdd}
          className="shadow-xl shadow-slate-900/20"
        >
          Thêm xe mới
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-100">
        <div className="flex-1">
          <Input 
            icon={Search}
            placeholder="Tìm theo hãng hoặc tên xe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-64">
          <CustomSelect 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'available', label: 'Sẵn sàng' },
              { value: 'reserved', label: 'Đã đặt cọc' },
              { value: 'sold', label: 'Đã bán' }
            ]}
          />
        </div>
      </div>

      {/* Cars Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4 border-b border-slate-100 font-bold">Thông tin xe</th>
                <th className="px-6 py-4 border-b border-slate-100 font-bold">Phân loại</th>
                <th className="px-6 py-4 border-b border-slate-100 font-bold">Giá niêm yết</th>
                <th className="px-6 py-4 border-b border-slate-100 font-bold">Trạng thái</th>
                <th className="px-6 py-4 border-b border-slate-100 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang tải kho xe...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCars.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    Không tìm thấy xe nào phù hợp.
                  </td>
                </tr>
              ) : filteredCars.map((car) => (
                <React.Fragment key={car._id}>
                  <tr 
                    onClick={() => toggleExpand(car._id)}
                    className={`group hover:bg-slate-50/80 transition-all cursor-pointer ${expandedRow === car._id ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <Activity size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{car.modelId?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">{car.modelId?.brand || 'No Brand'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Activity size={14} className="text-slate-400" />
                        {car.modelId?.carTypeId?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-bold text-slate-900">${car.price?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={car.status} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleCreateOrderClick(car, e)}
                          title="Tạo đơn hàng"
                          icon={ShoppingCart}
                          className="p-2! text-primary-gold hover:bg-gold-50"
                          disabled={car.status !== 'available'}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleOpenEdit(car, e)}
                          title="Chỉnh sửa chi tiết"
                          icon={Pencil}
                          className="p-2! text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleAddSpecClick(car, e)}
                          title="Thông số kỹ thuật"
                          icon={Settings2}
                          className="p-2! text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteClick(car, e)}
                          title="Xóa xe"
                          icon={Trash2}
                          className="p-2! text-slate-400 hover:text-red-500 hover:bg-red-50"
                        />
                        <div className="ml-2 text-slate-300 group-hover:text-slate-400 transition-all">
                          {expandedRow === car._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expandable row content */}
                  {expandedRow === car._id && (
                    <tr>
                      <td colSpan="5" className="px-6 py-0 border-b border-slate-100 bg-slate-50/30">
                        <div className="py-6 px-12 animate-in slide-in-from-top-2 duration-200">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Thông số chi tiết</h4>
                          {car.specId?.specs?.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              {car.specId.specs.map((spec, idx) => (
                                <div key={idx} className="space-y-1">
                                  <p className="text-xs text-slate-500">{spec.key}</p>
                                  <p className="font-semibold text-slate-800">{spec.value}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-4 py-4 text-slate-400 border border-dashed border-slate-200 rounded-2xl justify-center">
                              <p className="text-sm italic">Chưa có thông số kỹ thuật.</p>
                              <button 
                                onClick={(e) => handleAddSpecClick(car, e)}
                                className="text-blue-600 text-xs font-bold hover:underline cursor-pointer"
                              >
                                Thêm ngay
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={isSpecModalOpen} 
        onClose={() => setIsSpecModalOpen(false)}
      >
        <CarSpecForm 
          initialData={activeCar?.specId?.specs || []}
          onSubmit={handleSpecSubmit}
          onCancel={() => setIsSpecModalOpen(false)}
        />
      </Modal>

      <OrderCreateDialog 
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onConfirm={handleOrderSubmit}
        car={activeCar}
        loading={orderLoading}
      />

      <Modal
        isOpen={isCarModalOpen}
        onClose={() => setIsCarModalOpen(false)}
      >
        <CarFormDialog 
          car={activeCar}
          onSubmit={handleCarSubmit}
          onCancel={() => setIsCarModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xóa xe"
        message={`Bạn có chắc chắn muốn xóa xe ${activeCar?.modelId?.name}? Hành động này không thể hoàn tác.`}
        type="danger"
        confirmText="Xóa ngay"
      />
    </div>
  );
};

export default CarList;
