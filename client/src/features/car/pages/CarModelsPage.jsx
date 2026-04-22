import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, Pencil, Box, Tag, Activity } from "lucide-react";
import { apiCarModels, apiCarTypes } from "../../../lib/crudApi";
import { Button, Input } from "../../../components/Common/UI/Components";
import CustomSelect from "../../../components/Common/UI/CustomSelect";
import Modal from "../../../components/Common/UI/Modal";
import ConfirmDialog from "../../../components/Common/UI/ConfirmDialog";
import { useToast } from "../../../components/Common/UI/ToastContext";

const CarModelsPage = () => {
  const { addToast } = useToast();
  const [data, setData] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    carTypeId: "",
  });

  const loadData = useCallback(
    async (isInitial = false) => {
      try {
        if (!isInitial) setLoading(true);
        const [modelsRes, typesRes] = await Promise.all([
          apiCarModels.getAll(),
          apiCarTypes.getAll(),
        ]);
        setData(modelsRes);
        setTypes(typesRes);
      } catch {
        addToast("Lỗi khi tải dữ liệu", "error");
      } finally {
        setLoading(false);
      }
    },
    [addToast],
  );

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenAdd = () => {
    if (types.length === 0) {
      return addToast("Vui lòng tạo Phân loại xe trước", "warning");
    }
    setEditingItem(null);
    setFormData({ name: "", brand: "", carTypeId: types[0]._id });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      brand: item.brand,
      carTypeId: item.carTypeId?._id || item.carTypeId,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await apiCarModels.update(editingItem._id, formData);
        addToast("Cập nhật thành công!");
      } else {
        await apiCarModels.create(formData);
        addToast("Thêm mới thành công!");
      }
      setIsModalOpen(false);
      loadData();
    } catch {
      addToast("Thao tác thất bại", "error");
    }
  };

  const handleDeleteClick = (item) => {
    setActiveItem(item);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!activeItem) return;
    try {
      await apiCarModels.delete(activeItem._id);
      addToast("Đã xóa!");
      loadData();
    } catch {
      addToast("Lỗi khi xóa mẫu xe", "error");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-primary-dark tracking-tight">
            Mẫu xe
          </h2>
          <p className="text-primary-muted text-sm font-medium">
            Quản lý các model và thương hiệu xe
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          icon={Plus}
          onClick={handleOpenAdd}
          className="bg-primary-dark hover:bg-slate-800 shadow-xl shadow-slate-200"
        >
          Thêm mẫu xe
        </Button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <div className="max-w-md">
            <Input
              icon={Search}
              placeholder="Tìm theo tên hoặc thương hiệu..."
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
                <th className="px-8 py-4">Thông tin mẫu xe</th>
                <th className="px-8 py-4">Phân loại</th>
                <th className="px-8 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-8 py-12 text-center text-slate-400"
                  >
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-5 h-5 border-2 border-primary-gold border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">
                        Đang tải dữ liệu...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-8 py-12 text-center text-slate-400"
                  >
                    Không tìm thấy mẫu xe nào.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item._id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-gold/10 group-hover:text-primary-gold transition-colors">
                          <Box size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-bold text-primary-muted uppercase tracking-wider">
                              {item.brand}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Activity size={14} className="text-primary-gold/60" />
                        <span className="font-medium">
                          {item.carTypeId?.name || "N/A"}
                        </span>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-8 bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl">
          <div className="mb-8">
            <h3 className="text-2xl font-display font-bold text-primary-dark">
              {editingItem ? "Chỉnh sửa mẫu xe" : "Thêm mẫu xe mới"}
            </h3>
            <p className="text-sm text-primary-muted mt-1">
              Quản lý chi tiết danh mục xe
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <Input
                label="Tên mẫu xe"
                placeholder="VD: Mustang GT, Civic Type R..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <Input
              label="Thương hiệu"
              placeholder="VD: Ford, Honda, BMW..."
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              required
            />

            <CustomSelect
              label="Phân loại"
              options={types.map((t) => ({ value: t._id, label: t.name }))}
              value={formData.carTypeId}
              onChange={(e) =>
                setFormData({ ...formData, carTypeId: e.target.value })
              }
            />

            <div className="col-span-2 flex gap-4 pt-4 border-t border-slate-50 mt-2">
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
                {editingItem ? "Cập nhật" : "Lưu lại"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xóa mẫu xe"
        message={`Bạn có chắc chắn muốn xóa mẫu xe "${activeItem?.name}"? Các dữ liệu kho xe liên quan sẽ bị ảnh hưởng.`}
        type="danger"
      />
    </div>
  );
};

export default CarModelsPage;
