import React, { useEffect } from 'react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'default',
  closeOnOverlayClick = true
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    default: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300" 
      onClick={handleOverlayClick}
    >
      <div 
        className={`rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden border border-white/10 bg-white animate-in fade-in scale-95 duration-300`}
      >
        {title && (
          <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-left tracking-tight">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200 ml-4"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="overflow-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

const ModalHeader = ({ children, className = '', ...props }) => (
  <div className={`p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 ${className}`} {...props}>
    {children}
  </div>
);

const ModalBody = ({ children, className = '', ...props }) => (
  <div className={`p-6  ${className}`} {...props}>
    {children}
  </div>
);

const ModalFooter = ({ children, className = '', ...props }) => (
  <div className={`p-6 border-t border-slate-700 bg-slate-800 ${className}`} {...props}>
    {children}
  </div>
);

export { Modal, ModalHeader, ModalBody, ModalFooter };
export default Modal;