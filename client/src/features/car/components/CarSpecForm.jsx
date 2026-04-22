import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Plus, Save, AlertCircle } from "lucide-react";
import {
  Input,
  Select,
  Button,
} from "../../../components/Common/UI/Components";

// Define the schema for a single spec
const specSchema = z.object({
  key: z.enum(
    [
      "Engine",
      "Transmission",
      "FuelType",
      "Horsepower",
      "Torque",
      "Color",
      "Seat",
      "WheelSize",
      "DriveType",
      "Entertainment",
    ],
    {
      errorMap: () => ({ message: "Vui lòng chọn loại thông số" }),
    },
  ),
  value: z.string().min(1, "Giá trị không được để trống"),
});

// Define the root schema with custom validation for unique keys
const carSpecFormSchema = z
  .object({
    specs: z.array(specSchema),
  })
  .refine(
    (data) => {
      const keys = data.specs.map((s) => s.key);
      return new Set(keys).size === keys.length;
    },
    {
      message: "Không được chọn trùng loại thông số (Key)",
      path: ["specs"],
    },
  );

const SPEC_KEYS = [
  "Engine",
  "Transmission",
  "FuelType",
  "Horsepower",
  "Torque",
  "Color",
  "Seat",
  "WheelSize",
  "DriveType",
  "Entertainment",
];

const CarSpecForm = ({ initialData = [], onSubmit, onCancel }) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(carSpecFormSchema),
    defaultValues: {
      specs:
        initialData.length > 0 ? initialData : [{ key: "Engine", value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "specs",
  });

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data.specs);
    } catch {
      // Submit failed
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl border border-slate-200 shadow-xl">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Quản lý Thông số kỹ thuật
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập chi tiết cấu hình cho xe
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X size={20} className="text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {errors.specs && !Array.isArray(errors.specs) && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle size={18} />
            {errors.specs.message}
          </div>
        )}

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="group flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all duration-200 relative"
            >
              <div className="flex-1 space-y-1">
                <Select
                  label="Loại (Key)"
                  {...register(`specs.${index}.key`)}
                  options={SPEC_KEYS.map((k) => ({ value: k, label: k }))}
                  error={errors.specs?.[index]?.key?.message}
                />
              </div>

              <div className="flex-2 space-y-1">
                <Input
                  label="Giá trị (Value)"
                  {...register(`specs.${index}.value`)}
                  placeholder="Ví dụ: V8 5.0L, Automatic, Red..."
                  error={errors.specs?.[index]?.value?.message}
                />
              </div>

              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => remove(index)}
                  className="sm:mt-6 p-2! text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  title="Xóa dòng"
                  icon={X}
                />
              )}
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => append({ key: "Engine", value: "" })}
          className="w-full justify-center border-dashed border-blue-200 hover:border-blue-300 text-blue-600 hover:bg-blue-50"
          icon={Plus}
        >
          Thêm thông số mới
        </Button>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="flex-1"
            icon={isSubmitting ? null : Save}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CarSpecForm;
