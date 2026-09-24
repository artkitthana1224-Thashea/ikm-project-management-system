import React from 'react';
import { useStore } from '@/src/store/useStore';
import { 
  Bell, CheckCircle, AlertTriangle, Clock, X, 
  ExternalLink, Check, ShieldAlert, Wrench, Users, FileText 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { notifications, markNotificationAsRead, language } = useStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleAction = (notif: any) => {
    markNotificationAsRead(notif.id);
    if (notif.jobId) {
      navigate('/workflow');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 md:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-md bg-ikm-card border border-ikm-border rounded-2xl shadow-2xl overflow-hidden mt-12 md:mt-14 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-ikm-border flex items-center justify-between bg-ikm-bg">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/10 text-ikm-orange">
              <Bell className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-sm text-ikm-text">
              {language === 'TH' ? 'ศูนย์การแจ้งเตือน (Notifications)' : 'Notification Center'}
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-red text-white">
                {unreadCount} {language === 'TH' ? 'ใหม่' : 'new'}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-ikm-text-secondary hover:text-ikm-text hover:bg-ikm-border rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-3 space-y-2.5 flex-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-ikm-text-secondary">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">{language === 'TH' ? 'ไม่มีการแจ้งเตือนในขณะนี้' : 'No notifications yet'}</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => handleAction(notif)}
                className={cn(
                  "p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-1 relative",
                  notif.read 
                    ? "bg-ikm-bg/50 border-ikm-border opacity-75 hover:opacity-100" 
                    : "bg-orange-50/60 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/60 shadow-xs"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ikm-text flex items-center gap-1.5">
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-ikm-orange shrink-0"></span>}
                    {notif.title}
                  </span>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase",
                    notif.priority === 'Critical' ? "bg-red-100 text-status-red" :
                    notif.priority === 'High' ? "bg-orange-100 text-orange-700" :
                    "bg-blue-100 text-blue-700"
                  )}>
                    {notif.priority}
                  </span>
                </div>
                <p className="text-ikm-text-secondary leading-relaxed text-[11px]">
                  {notif.message}
                </p>
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                  <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-ikm-orange font-semibold hover:underline flex items-center gap-1">
                    {language === 'TH' ? 'ดูรายละเอียด' : 'Open'}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
