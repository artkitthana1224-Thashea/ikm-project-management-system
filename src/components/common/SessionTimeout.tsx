import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useStore } from '@/src/store/useStore';
import { Clock, AlertTriangle, LogOut, CheckCircle2 } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

// 5 minutes timeout (300,000 ms)
const TIMEOUT_DURATION_MS = 5 * 60 * 1000;
// Warning shows 30 seconds before timeout (30,000 ms)
const WARNING_THRESHOLD_MS = 30 * 1000;
const STORAGE_KEY = 'ikm_last_activity_ts';

export function SessionTimeout() {
  const { user, logout, language } = useStore();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActiveRef = useRef<number>(Date.now());

  // Update activity timestamp
  const recordActivity = useCallback(() => {
    const now = Date.now();
    lastActiveRef.current = now;
    try {
      localStorage.setItem(STORAGE_KEY, now.toString());
    } catch (e) {}

    // If warning was showing and user interacted, dismiss warning
    if (showWarning) {
      setShowWarning(false);
    }
  }, [showWarning]);

  const handleManualStayLoggedIn = () => {
    recordActivity();
    setShowWarning(false);
  };

  const handleManualLogout = () => {
    setShowWarning(false);
    try {
      localStorage.setItem('ikm_session_expired', 'manual');
    } catch (e) {}
    logout();
  };

  useEffect(() => {
    if (!user) {
      setShowWarning(false);
      return;
    }

    // Initialize last active timestamp
    const now = Date.now();
    lastActiveRef.current = now;
    try {
      localStorage.setItem(STORAGE_KEY, now.toString());
    } catch (e) {}

    // Check interval every 1 second
    const interval = setInterval(() => {
      let lastActivity = lastActiveRef.current;
      
      // Also check cross-tab activity in localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed) && parsed > lastActivity) {
            lastActivity = parsed;
            lastActiveRef.current = parsed;
          }
        }
      } catch (e) {}

      const currentTime = Date.now();
      const elapsed = currentTime - lastActivity;
      const remainingMs = TIMEOUT_DURATION_MS - elapsed;

      if (remainingMs <= 0) {
        // Inactive for more than 5 minutes -> Auto logout!
        clearInterval(interval);
        setShowWarning(false);
        try {
          localStorage.setItem('ikm_session_expired', 'timeout');
        } catch (e) {}
        logout();
      } else if (remainingMs <= WARNING_THRESHOLD_MS) {
        // Within warning window (last 30 seconds)
        setShowWarning(true);
        setSecondsRemaining(Math.max(1, Math.ceil(remainingMs / 1000)));
      } else {
        setShowWarning(false);
      }
    }, 1000);

    timerRef.current = interval;

    // Listen for user interactions
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    // Throttled handler to avoid firing too often on mouse move
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledActivity = () => {
      if (!throttleTimeout) {
        recordActivity();
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, 1500);
      }
    };

    events.forEach(evt => {
      window.addEventListener(evt, throttledActivity, { passive: true });
    });

    // When tab becomes visible again or window gains focus, verify elapsed time
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        recordActivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    // Cross-tab storage listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const ts = parseInt(e.newValue, 10);
        if (!isNaN(ts)) {
          lastActiveRef.current = ts;
          if (showWarning) setShowWarning(false);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (throttleTimeout) clearTimeout(throttleTimeout);
      events.forEach(evt => {
        window.removeEventListener(evt, throttledActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, logout, recordActivity, showWarning]);

  if (!showWarning || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-ikm-border p-6 sm:p-7 relative overflow-hidden"
      >
        {/* Top visual banner */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Clock className="w-3 h-3" />
                {language === 'TH' ? 'ความปลอดภัยของระบบ (Session Security)' : 'Session Security'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {language === 'TH' ? 'แจ้งเตือนเซสชันกำลังจะหมดเวลา' : 'Session Timeout Warning'}
            </h3>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {language === 'TH' 
              ? 'ไม่มีการใช้งานระบบต่อเนื่องเป็นเวลาเกือบ 5 นาที เพื่อความปลอดภัยของข้อมูล ระบบจะนำคุณออกจากระบบโดยอัตโนมัติในอีก:'
              : 'You have been inactive for almost 5 minutes. For security, your session will automatically end in:'}
          </p>

          <div className="mt-3 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {secondsRemaining}
            </span>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              {language === 'TH' ? 'วินาที (Seconds)' : 'seconds'}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            onClick={handleManualLogout}
            className="w-full sm:w-1/2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
          >
            <LogOut className="w-4 h-4 mr-1.5 text-red-500" />
            {language === 'TH' ? 'ออกจากระบบ' : 'Log Out Now'}
          </Button>

          <Button
            onClick={handleManualStayLoggedIn}
            className="w-full sm:w-1/2 bg-ikm-orange hover:bg-ikm-orange-dark text-white font-bold text-xs shadow-md shadow-orange-500/20"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            {language === 'TH' ? 'ใช้งานระบบต่อ' : 'Stay Signed In'}
          </Button>
        </div>
      </div>
    </div>
  );
}
