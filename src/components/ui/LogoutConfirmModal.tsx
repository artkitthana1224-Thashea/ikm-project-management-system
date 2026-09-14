import React from 'react';
import { LogOut, AlertTriangle, X, Check, Shield } from 'lucide-react';
import { useStore } from '@/src/store/useStore';
import { useNavigate } from 'react-router-dom';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutConfirmModal({ isOpen, onClose }: LogoutConfirmModalProps) {
  const { user, logout, language } = useStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleConfirmLogout = () => {
    onClose();
    logout();
    navigate('/login');
  };

  const isTH = language === 'TH';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-md bg-ikm-card border border-ikm-border rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Top Decorative bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-ikm-text-secondary hover:text-ikm-text hover:bg-ikm-bg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-center justify-center text-red-600 shrink-0">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ikm-text">
              {isTH ? 'ยืนยันการออกจากระบบ' : 'Confirm Sign Out'}
            </h3>
            <p className="text-xs text-ikm-text-secondary mt-0.5">
              {isTH 
                ? 'คุณต้องการออกจากระบบ IKM Project Management หรือไม่?' 
                : 'Are you sure you want to sign out of IKM Project Management?'}
            </p>
          </div>
        </div>

        {/* Current User Info Card */}
        {user && (
          <div className="p-3.5 rounded-xl bg-ikm-bg border border-ikm-border mb-6 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-ikm-orange to-amber-500 text-white font-bold flex items-center justify-center shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-ikm-text truncate">{user.name}</div>
                <div className="text-[11px] text-ikm-text-secondary truncate">{user.role} • {user.department}</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 dark:bg-orange-950/60 text-ikm-orange shrink-0">
              {user.userLevel || user.role}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-ikm-text hover:bg-ikm-bg border border-ikm-border transition-colors"
          >
            {isTH ? 'ยกเลิก' : 'Cancel'}
          </button>
          
          <button
            type="button"
            onClick={handleConfirmLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-98 transition-all shadow-md shadow-red-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isTH ? 'ออกจากระบบ' : 'Log Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
