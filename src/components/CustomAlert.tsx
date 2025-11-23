import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface CustomAlertProps {
  type: AlertType;
  title: string;
  message: string;
  onClose: () => void;
  suggestion?: string;
}

const CustomAlert = ({ type, title, message, onClose, suggestion }: CustomAlertProps) => {
  const configs = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      textColor: 'text-green-800'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      textColor: 'text-red-800'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      textColor: 'text-yellow-800'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      textColor: 'text-blue-800'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-in zoom-in-95 duration-200">
        <div className={`${config.bgColor} ${config.borderColor} border-l-4 rounded-t-2xl p-6 flex items-start gap-4`}>
          <Icon className={`${config.iconColor} w-8 h-8 flex-shrink-0`} />
          <div className="flex-1">
            <h3 className={`${config.titleColor} font-bold text-lg mb-1`}>
              {title}
            </h3>
            <p className={`${config.textColor} text-sm leading-relaxed`}>
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {suggestion && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-sm text-gray-600 flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
              <span>{suggestion}</span>
            </p>
          </div>
        )}

        <div className="p-6 flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-lg font-semibold transition ${
              type === 'success'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : type === 'error'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : type === 'warning'
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            OK, Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  type = 'warning',
  onConfirm,
  onCancel
}: ConfirmDialogProps) => {
  const configs = {
    danger: {
      icon: XCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      buttonColor: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className={`${config.bgColor} rounded-xl p-4 flex items-start gap-4 mb-4`}>
            <Icon className={`${config.iconColor} w-8 h-8 flex-shrink-0`} />
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">
                {title}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 ${config.buttonColor} text-white font-semibold rounded-lg transition`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;