import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Trash2, Pencil, Type, Hash } from 'lucide-react';
import { apiCarTypes } from '../../../lib/crudApi';
import { Button, Input } from '../../../components/Common/UI/Components';
import Modal from '../../../components/Common/UI/Modal';
import ConfirmDialog from '../../../components/Common/UI/ConfirmDialog';
import { useToast } from '../../../components/Common/UI/ToastContext';

const CarTypesPage = () => {
  const { addToast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  const loadData = useCallback(async (isInitial = false) => {
    try {
      if (!isInitial) setLoading(true);
      const res = await apiCarTypes.getAll();
      setData(res);
    } catch {
      addToast('Lỗi khi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ name: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await apiCarTypes.update(editingItem._id, formData);
        addToast('Cập nhật thành công!');
      } else {
        await apiCarTypes.create(formData);
        addToast('Thêm mới thành công!');
      }
      setIsModalOpen(false);
      loadData();
    } catch {
      addToast('Thao tác thất bại', 'error');
    }
  };

  const handleDeleteClick = (item) => {
    setActiveItem(item);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!activeItem) return;
    try {
      await apiCarTypes.delete(activeItem._id);
      addToast('Đã xóa!');
      loadData();
    } catch {
      addToast('Không thể xóa phân loại này vì có dữ liệu liên quan', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-primary-dark tracking-tight">Phân loại xe</h2>
          <p className="text-primary-muted text-sm font-medium">Quản lý các dòng xe trong hệ thống</p>
        </div>
        <Button 
          variant="primary" 
          size="lg" 
          icon={Plus}
          onClick={handleOpenAdd}
          className="bg-primary-dark hover:bg-slate-800 shadow-xl shadow-slate-200"
        >
          Thêm phân loại
        </Button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <div className="max-w-md">
            <Input 
              icon={Search}
              placeholder="Tìm kiếm phân loại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 border-transparent focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-bold text-primary-muted uppercase tracking-widest">
                <th className="px-8 py-4">ID</th>
                <th className="px-8 py-4">Tên phân loại</th>
                <th className="px-8 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-8 py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-5 h-5 border-2 border-primary-gold border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-8 py-12 text-center text-slate-400">
                    Chưa có dữ liệu nào.
                  </td>
                </tr>
              ) : filteredData.map((item) => (
                <tr key={item._id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <Hash size={12} className="text-slate-300" />
                       <span className="text-xs font-mono text-slate-400">{item._id.slice(-6)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-gold/10 flex items-center justify-center text-primary-gold">
                        <Type size={16} />
                      </div>
                      <span className="font-bold text-slate-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                        icon={Pencil}
                        className="text-slate-400 hover:text-primary-gold hover:bg-gold-50"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(item)}
                        icon={Trash2}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-8 bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl">
          <div className="mb-8">
            <h3 className="text-2xl font-display font-bold text-primary-dark">
              {editingItem ? 'Chỉnh sửa phân loại' : 'Thêm phân loại mới'}
            </h3>
            <p className="text-sm text-primary-muted mt-1">Vui lòng điền thông tin bên dưới</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Tên phân loại"
              placeholder="VD: SUV, Sedan, Luxury..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            
            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1" 
                onClick={() => setIsModalOpen(false)}
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                className="flex-1 bg-primary-dark"
              >
                {editingItem ? 'Cập nhật' : 'Lưu lại'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <ConfirmDialog 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xóa phân loại"
        message={`Bạn có chắc chắn muốn xóa phân loại "${activeItem?.name}"? Các mẫu xe thuộc phân loại này có thể bị ảnh hưởng.`}
        type="danger"
      />
    </div>
  );
};

export default CarTypesPage;
