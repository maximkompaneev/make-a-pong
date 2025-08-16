import React from "react";

interface PopupProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

export const Popup: React.FC<PopupProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="popup"
    >
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};
