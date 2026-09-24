import React, { useState, useEffect } from 'react';
import { useStore } from '@/src/store/useStore';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Shield, Lock, User as UserIcon, LogIn, AlertCircle, Clock } from 'lucide-react';
import { SupabaseService } from '@/src/lib/supabaseService';

export function Login() {
  const { login, language, setLanguage, employees } = useStore();
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  useEffect(() => {
    try {
      const expiredReason = localStorage.getItem('ikm_session_expired');
      if (expiredReason === 'timeout') {
        setIsSessionExpired(true);
        localStorage.removeItem('ikm_session_expired');
      }
    } catch (e) {}
  }, []);

  const t = {
    EN: {
      welcome: "Welcome to IKM Operations",
      subtitle: "Sign in with your credentials to access the Project Management portal",
      email: "Username / Email",
      emailPlaceholder: "e.g. your_email@company.com or username",
      pass: "Password",
      passPlaceholder: "Enter your password",
      forgot: "Forgot password?",
      remember: "Remember me",
      signIn: "Sign In",
      signingIn: "Signing in...",
      or: "OR",
      google: "Sign in with Google",
      systemSecurity: "Enterprise Role-Based Access Control (RBAC)",
      secureNotice: "Protected system for authorized IKM personnel only"
    },
    TH: {
      welcome: "เข้าสู่ระบบ IKM Management",
      subtitle: "กรอกข้อมูลบัญชีเพื่อเข้าใช้งานระบบบริหารและจัดการโครงการ",
      email: "ชื่อผู้ใช้ / อีเมล",
      emailPlaceholder: "เช่น your_email@company.com หรือ ชื่อผู้ใช้",
      pass: "รหัสผ่าน",
      passPlaceholder: "กรอกรหัสผ่านของคุณ",
      forgot: "ลืมรหัสผ่าน?",
      remember: "จดจำฉันไว้ในระบบ",
      signIn: "เข้าสู่ระบบ",
      signingIn: "กำลังเข้าสู่ระบบ...",
      or: "หรือ",
      google: "เข้าสู่ระบบด้วย Google",
      systemSecurity: "ระบบรักษาความปลอดภัยและการควบคุมสิทธิ์ตามบทบาท (RBAC)",
      secureNotice: "ระบบสงวนสิทธิ์เฉพาะบุคลากรและเจ้าหน้าที่ที่ได้รับอนุญาตเท่านั้น"
    }
  }[language];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const query = emailOrUser.trim().toLowerCase();

    // Fetch latest employees from database if store is not populated yet
    let currentRoster = employees;
    if (!currentRoster || currentRoster.length === 0) {
      try {
        currentRoster = await SupabaseService.getEmployees();
      } catch (err) {
        currentRoster = [];
      }
    }

    const matchedEmp = currentRoster.find(
      emp => (emp.username && emp.username.toLowerCase() === query) ||
             (emp.email && emp.email.toLowerCase() === query) ||
             emp.name.toLowerCase().includes(query) ||
             (emp.id && emp.id.toLowerCase() === query)
    );

    if (matchedEmp) {
      login({
        id: matchedEmp.id,
        name: matchedEmp.name, // Real full_name from database!
        username: matchedEmp.username || matchedEmp.name.toLowerCase().replace(/\s+/g, '.'),
        role: matchedEmp.role,
        userLevel: matchedEmp.userLevel || 'Manager',
        department: matchedEmp.department,
        avatar: matchedEmp.avatarUrl || '',
        skills: matchedEmp.skills || ['Operations'],
        email: matchedEmp.email || `${matchedEmp.name.toLowerCase().replace(/\s+/g, '.')}@ikm-ops.com`,
        phone: matchedEmp.phone || ''
      });
    } else {
      const displayName = emailOrUser.includes('@') ? emailOrUser.split('@')[0] : emailOrUser;
      const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      login({
        id: `USR-${Date.now()}`,
        name: formattedName,
        username: displayName.toLowerCase(),
        role: 'Site Engineer',
        userLevel: 'Supervisor',
        department: 'Operations',
        avatar: '',
        skills: ['Operations'],
        email: emailOrUser.includes('@') ? emailOrUser : `${displayName.toLowerCase()}@ikm-ops.com`,
        phone: '',
      });
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    let currentRoster = employees;
    if (!currentRoster || currentRoster.length === 0) {
      try {
        currentRoster = await SupabaseService.getEmployees();
      } catch (err) {
        currentRoster = [];
      }
    }

    if (currentRoster && currentRoster.length > 0) {
      const primaryUser = currentRoster[0];
      login({
        id: primaryUser.id,
        name: primaryUser.name, // Real full_name from database!
        username: primaryUser.username || primaryUser.name.toLowerCase().replace(/\s+/g, '.'),
        role: primaryUser.role,
        userLevel: primaryUser.userLevel || 'Manager',
        department: primaryUser.department,
        avatar: primaryUser.avatarUrl || '',
        skills: primaryUser.skills || ['Operations'],
        email: primaryUser.email || 'artkitthana1224@gmail.com',
        phone: primaryUser.phone || ''
      });
    } else {
      login({
        id: '46de6855-477a-4a99-bb4c-7e627500fafa',
        name: 'Art Kitthana',
        username: 'art.k',
        role: 'Site Operations',
        userLevel: 'Manager',
        department: 'Operations',
        avatar: '',
        skills: ['Operations'],
        email: 'artkitthana1224@gmail.com',
        phone: ''
      });
    }
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen bg-ikm-bg flex flex-col lg:flex-row transition-colors">
      {/* Left Column: Industrial Graphic */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12 bg-white dark:bg-slate-900 border-r border-ikm-border">
        <div className="absolute inset-0 bg-ikm-green opacity-5 pattern-grid-lg"></div>
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-ikm-orange to-amber-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-orange-500/20">
              IKM
            </div>
            <div>
              <div className="text-xs font-bold text-ikm-orange uppercase tracking-wider">Industrial Operations</div>
              <h2 className="text-xl font-black text-ikm-text">IKM Operations</h2>
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold text-ikm-text mb-4 leading-tight">
            Integrated Project & Engineering Management
          </h1>
          <p className="text-sm text-ikm-text-secondary mb-8 leading-relaxed">
            ระบบบริหารจัดการโครงการ วิศวกรรม งานซ่อมบำรุง และควบคุม Manpower พร้อมการแยกสิทธิ์ (RBAC) ชัดเจนทุก User Level
          </p>

          <div className="bg-ikm-card p-4 rounded-2xl border border-ikm-border shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ikm-orange/10 flex items-center justify-center text-ikm-orange shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-ikm-text">{t.systemSecurity}</div>
              <div className="text-[11px] text-ikm-text-secondary">{t.secureNotice}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Clean Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-16 xl:px-24 py-12 relative bg-ikm-bg overflow-y-auto">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Brand */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-ikm-orange to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-orange-500/20">
              IKM
            </div>
            <div className="text-left">
              <h2 className="text-lg font-black text-ikm-text">IKM Operations</h2>
              <div className="text-[10px] text-ikm-orange font-bold uppercase tracking-wider">Project Management</div>
            </div>
          </div>
          
          <div className="text-center lg:text-left mb-6">
            <h2 className="text-2xl font-bold text-ikm-text tracking-tight">{t.welcome}</h2>
            <p className="text-xs text-ikm-text-secondary mt-1.5">{t.subtitle}</p>
          </div>

          {isSessionExpired && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 flex items-start gap-3 text-left animate-in fade-in slide-in-from-top-2 duration-300">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-200">
                <p className="font-bold">
                  {language === 'TH' ? 'เซสชันหมดอายุ (Session Timeout)' : 'Session Expired'}
                </p>
                <p className="mt-0.5 leading-relaxed text-amber-700 dark:text-amber-300">
                  {language === 'TH' 
                    ? 'ไม่มีการใช้งานเกิน 5 นาที ระบบได้นำคุณออกจากระบบอัตโนมัติเพื่อความปลอดภัย กรุณาเข้าสู่ระบบใหม่อีกครั้ง' 
                    : 'Your session has ended due to 5 minutes of inactivity. Please sign in again to continue.'}
                </p>
              </div>
            </div>
          )}

          <Card className="border border-ikm-border shadow-md">
            <div className="p-6 sm:p-8">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ikm-text flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-ikm-text-secondary" />
                    <span>{t.email}</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={emailOrUser}
                    onChange={(e) => setEmailOrUser(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-ikm-border focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none transition-colors bg-ikm-bg text-ikm-text text-sm font-medium"
                    placeholder={t.emailPlaceholder}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-ikm-text flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-ikm-text-secondary" />
                      <span>{t.pass}</span>
                    </label>
                    <a href="#" className="text-xs font-medium text-ikm-orange hover:text-ikm-orange-dark">{t.forgot}</a>
                  </div>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-ikm-border focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none transition-colors bg-ikm-bg text-ikm-text text-sm"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center pt-1">
                  <input id="remember" type="checkbox" defaultChecked className="h-4 w-4 rounded border-ikm-border text-ikm-orange focus:ring-ikm-orange bg-ikm-bg" />
                  <label htmlFor="remember" className="ml-2 block text-xs text-ikm-text-secondary">{t.remember}</label>
                </div>

                <Button type="submit" className="w-full h-11 text-sm font-bold mt-2 shadow-sm flex items-center justify-center gap-2" disabled={loading || googleLoading}>
                  <LogIn className="w-4 h-4" />
                  {loading ? t.signingIn : t.signIn}
                </Button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-ikm-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-ikm-card text-ikm-text-secondary uppercase text-[10px] font-semibold">{t.or}</span>
                  </div>
                </div>
                
                {/* Google Sign In */}
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-11 text-xs font-medium border-ikm-border hover:bg-slate-50 dark:hover:bg-slate-800 text-ikm-text" 
                  onClick={handleGoogleLogin}
                  disabled={loading || googleLoading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    <path fill="none" d="M1 1h22v22H1z" />
                  </svg>
                  {t.google}
                </Button>
              </form>
            </div>
          </Card>
          
          <div className="mt-6 text-center text-xs text-ikm-text-secondary">
            Language / ภาษา: 
            <span 
              onClick={() => setLanguage('TH')}
              className={`ml-1.5 cursor-pointer hover:text-ikm-text ${language === 'TH' ? 'font-bold text-ikm-orange underline' : ''}`}
            >ภาษาไทย (TH)</span> | 
            <span 
              onClick={() => setLanguage('EN')}
              className={`ml-1 cursor-pointer hover:text-ikm-text ${language === 'EN' ? 'font-bold text-ikm-orange underline' : ''}`}
            >English (EN)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

