import React from 'react';
import Modal from './Modal';
import { Button } from './Components';
import { AlertCircle, Trash2, HelpCircle } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Xác nhận', 
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?', 
  confirmText = 'Xác nhận', 
  cancelText = 'Hủy',
  type = 'primary' // 'primary' | 'danger'
}) => {
  const Icon = type === 'danger' ? Trash2 : HelpCircle;
  const iconColor = type === 'danger' ? 'text-red-500 bg-red-50' : 'text-blue-500 bg-blue-50';
  const confirmVariant = type === 'danger' ? 'danger' : 'primary';

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className={`p-4 rounded-2xl mb-6 ${iconColor}`}>
            <Icon size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            {message}
          </p>
          
          <div className="flex gap-3 w-full">
            <Button 
              variant="outline" 
              className="flex-1 rounded-2xl" 
              onClick={onClose}
            >
              {cancelText}
            </Button>
            <Button 
              variant={confirmVariant} 
              className="flex-1 rounded-2xl" 
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
