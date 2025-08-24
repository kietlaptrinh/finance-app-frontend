import React from 'react';
import { useTranslation } from 'react-i18next';

const Modal = ({ children, isOpen, onClose }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
          aria-label={t('modal.close')}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;