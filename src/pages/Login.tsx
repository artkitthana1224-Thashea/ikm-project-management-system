import React, { useState } from 'react';
import { useStore } from '@/src/store/useStore';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Mail } from 'lucide-react';

export function Login() {
  const { login, language, setLanguage } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const t = {
    EN: {
      welcome: "Welcome back",
      subtitle: "Sign in to your account to continue",
      email: "Email / Username",
      pass: "Password",
      forgot: "Forgot password?",
      remember: "Remember me",
      signIn: "Sign In",
      signingIn: "Signing in...",
      or: "OR",
      google: "Continue with Google"
    },
    TH: {
      welcome: "ยินดีต้อนรับกลับมา",
      subtitle: "เข้าสู่ระบบเพื่อดำเนินการต่อ",
      email: "อีเมล / ชื่อผู้ใช้",
      pass: "รหัสผ่าน",
      forgot: "ลืมรหัสผ่าน?",
      remember: "จดจำฉันไว้",
      signIn: "เข้าสู่ระบบ",
      signingIn: "กำลังเข้าสู่ระบบ...",
      or: "หรือ",
      google: "เข้าสู่ระบบด้วย Google"
    }
  }[language];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login({
        id: 'U-001',
        name: 'Somchai S.',
        role: 'Site Manager',
        department: 'Maintenance',
        avatar: 'https://i.pravatar.cc/150?u=somchai'
      });
      setLoading(false);
    }, 800);
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    // Simulating Google OAuth Popup Flow
    const popup = window.open('', 'google-login', 'width=500,height=600');
    if (popup) {
      popup.document.write('<html><head><title>Sign in with Google</title></head><body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff;"><h2>Simulating Google Login...</h2></body></html>');
    }
    
    setTimeout(() => {
      if (popup) popup.close();
      login({
        id: 'G-002',
        name: 'Google User',
        role: 'Engineer',
        department: 'Technical Services',
        avatar: 'https://i.pravatar.cc/150?u=google'
      });
      setGoogleLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-ikm-bg flex transition-colors">
      {/* Desktop Split Graphic */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12 bg-white">
        <div className="absolute inset-0 bg-ikm-green opacity-5 pattern-grid-lg"></div>
        <div className="relative z-10 max-w-lg">
          <div className="h-16 w-16 rounded-xl bg-ikm-orange flex items-center justify-center text-white font-bold text-2xl mb-8 shadow-xl">
            IKM
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Enterprise Project <br/> Management System
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Plan. Assign. Execute. Track. Improve. <br/>
            All in one integrated industrial platform.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-ikm-card p-4 rounded-xl border border-ikm-border shadow-sm">
              <div className="font-semibold text-ikm-green mb-1">99.9%</div>
              <div className="text-sm text-ikm-text-secondary">Uptime Reliability</div>
            </div>
            <div className="bg-ikm-card p-4 rounded-xl border border-ikm-border shadow-sm">
              <div className="font-semibold text-ikm-orange mb-1">Mobile First</div>
              <div className="text-sm text-ikm-text-secondary">Built for the field</div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Container */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-32 relative bg-ikm-bg">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center mb-8">
            <div className="h-12 w-12 rounded-lg bg-ikm-orange flex items-center justify-center text-white font-bold text-xl shadow-lg">
              IKM
            </div>
          </div>
          
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-ikm-text tracking-tight">{t.welcome}</h2>
            <p className="text-sm text-ikm-text-secondary mt-2">{t.subtitle}</p>
          </div>

          <Card className="border-0 shadow-xl shadow-gray-200/50 md:border md:border-ikm-border md:shadow-sm">
            <div className="p-6 md:p-8">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-ikm-text">{t.email}</label>
                  <input 
                    type="text" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-4 rounded-lg border border-ikm-border focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none transition-colors bg-ikm-bg text-ikm-text"
                    placeholder="somchai@example.com"
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-ikm-text">{t.pass}</label>
                    <a href="#" className="text-sm font-medium text-ikm-orange hover:text-ikm-orange-dark">{t.forgot}</a>
                  </div>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 px-4 rounded-lg border border-ikm-border focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none transition-colors bg-ikm-bg text-ikm-text"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center">
                  <input id="remember" type="checkbox" className="h-4 w-4 rounded border-ikm-border text-ikm-orange focus:ring-ikm-orange bg-ikm-bg" />
                  <label htmlFor="remember" className="ml-2 block text-sm text-ikm-text-secondary">{t.remember}</label>
                </div>

                <Button type="submit" className="w-full h-12 text-lg mt-2" disabled={loading || googleLoading}>
                  {loading ? t.signingIn : t.signIn}
                </Button>
                
                <div className="relative mt-6 mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-ikm-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-ikm-card text-ikm-text-secondary">{t.or}</span>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-12 font-medium" 
                  onClick={handleGoogleLogin}
                  disabled={loading || googleLoading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
          
          <div className="mt-8 text-center text-sm text-ikm-text-secondary">
            Language: 
            <span 
              onClick={() => setLanguage('EN')}
              className={`ml-1 cursor-pointer hover:text-ikm-text ${language === 'EN' ? 'font-semibold text-ikm-orange' : ''}`}
            >EN</span> | 
            <span 
              onClick={() => setLanguage('TH')}
              className={`cursor-pointer hover:text-ikm-text ${language === 'TH' ? 'font-semibold text-ikm-orange' : ''}`}
            >TH</span>
          </div>
        </div>
      </div>
    </div>
  );
}

