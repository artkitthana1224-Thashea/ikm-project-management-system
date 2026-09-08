import React, { useState } from "react";
import { useStore } from "@/src/store/useStore";
import { useNavigate } from "react-router-dom";
import {
  Home,
  ClipboardList,
  CheckSquare,
  Calendar,
  MoreHorizontal,
  Bell,
  Search,
  Menu,
  Moon,
  Sun,
  Globe,
  MessageSquare,
  UserCircle,
  Users,
  Clock,
  Activity,
  Briefcase,
  PieChart,
  BarChartHorizontal,
  ShieldCheck,
  Star,
  ClipboardCheck,
  FileText,
  UserCog,
  ScrollText,
  KanbanSquare,
  PanelLeftClose,
  PanelLeft,
  ChevronLeft,
  ChevronRight,
  Pin,
  PinOff,
  Zap,
  X,
} from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { cn } from "@/src/lib/utils";

export function Header() {
  const { 
    user, 
    theme, 
    setTheme, 
    language, 
    setLanguage, 
    toggleSidebar, 
    isSidebarCollapsed, 
    isSidebarAutoHide,
    toggleSidebarAutoHide,
    setMobileMenuOpen 
  } = useStore();

  return (
    <header className="sticky top-0 z-40 flex h-14 md:h-16 w-full items-center justify-between border-b border-ikm-border bg-ikm-card px-3 md:px-6 shadow-sm">
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile menu toggle (below lg) */}
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 text-ikm-text-secondary hover:bg-ikm-bg rounded-lg transition-colors"
          title="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop Sidebar collapse toggle (lg and above) */}
        <button 
          onClick={toggleSidebar}
          className="hidden lg:flex items-center justify-center p-2 text-ikm-text-secondary hover:text-ikm-orange hover:bg-ikm-bg rounded-lg transition-colors"
          title={isSidebarCollapsed ? (language === 'TH' ? "ขยายแถบเมนู (Expand)" : "Expand Sidebar") : (language === 'TH' ? "ย่อแถบเมนู (Collapse)" : "Collapse Sidebar")}
        >
          {isSidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>

        {/* Desktop Auto-Hide toggle (lg and above) */}
        <button
          onClick={toggleSidebarAutoHide}
          className={cn(
            "hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border",
            isSidebarAutoHide
              ? "bg-ikm-orange text-white border-ikm-orange shadow-sm"
              : "border-ikm-border text-ikm-text-secondary hover:text-ikm-text hover:bg-ikm-bg"
          )}
          title={language === 'TH' ? (isSidebarAutoHide ? "ปิดโหมดซ่อนเมนูอัตโนมัติ (ตรึงเมนู)" : "เปิดโหมดซ่อนเมนูอัตโนมัติ (Auto Hide)") : (isSidebarAutoHide ? "Auto-Hide Active (Click to Pin)" : "Enable Auto-Hide")}
        >
          {isSidebarAutoHide ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
          <span>{language === 'TH' ? (isSidebarAutoHide ? "Auto Hide: เปิด" : "Auto Hide") : (isSidebarAutoHide ? "Auto Hide: ON" : "Auto Hide")}</span>
        </button>

        <div className="flex items-center gap-2 ml-1">
          <div className="h-8 w-8 rounded bg-ikm-orange flex items-center justify-center text-white font-bold text-sm shadow-sm">
            IKM
          </div>
          <span className="hidden font-bold text-lg md:block text-ikm-text">
            Project Management
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-4">
        <button
          onClick={() => setLanguage(language === "EN" ? "TH" : "EN")}
          className="flex items-center gap-1 px-2.5 py-1.5 text-ikm-text-secondary hover:bg-ikm-bg rounded-lg transition-colors text-xs font-semibold border border-ikm-border"
        >
          <Globe className="h-3.5 w-3.5" /> {language}
        </button>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 text-ikm-text-secondary hover:bg-ikm-bg rounded-lg transition-colors"
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
        <button className="p-2 text-ikm-text-secondary hover:bg-ikm-bg rounded-lg transition-colors hidden md:block">
          <Search className="h-5 w-5" />
        </button>
        <button className="relative p-2 text-ikm-text-secondary hover:bg-ikm-bg rounded-lg transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-status-red border-2 border-ikm-card"></span>
        </button>
        {user && (
          <div className="hidden md:flex items-center gap-2 ml-2 pl-3 border-l border-ikm-border">
            <div className="text-right">
              <div className="text-sm font-semibold text-ikm-text">{user.name}</div>
              <div className="text-xs text-ikm-text-secondary">{user.role}</div>
            </div>
            <Avatar
              fallback={user.name.charAt(0)}
              src={user.avatar}
              className="h-9 w-9 ml-2"
            />
          </div>
        )}
        {user && (
          <Avatar
            fallback={user.name.charAt(0)}
            src={user.avatar}
            className="h-8 w-8 md:hidden ml-1"
          />
        )}
      </div>
    </header>
  );
}

const navItems = [
  { id: "home", label: "Home", path: "/", icon: <Home className="h-5 w-5" /> },
  {
    id: "requests",
    label: "Requests",
    path: "/requests",
    icon: <ClipboardList className="h-5 w-5" />,
    badge: 2,
  },
  {
    id: "tasks",
    label: "Tasks",
    path: "/tasks",
    icon: <CheckSquare className="h-5 w-5" />,
    badge: 4,
  },
  {
    id: "calendar",
    label: "Calendar",
    path: "/calendar",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    id: "more",
    label: "More",
    path: "/more",
    icon: <MoreHorizontal className="h-5 w-5" />,
  },
];

const sidebarCategories = [
  {
    title: { EN: "Core", TH: "หลัก" },
    items: [
      {
        id: "home",
        label: { EN: "Dashboard", TH: "แดชบอร์ด" },
        path: "/",
        icon: <Home />,
      },
      {
        id: "requests",
        label: { EN: "Requests", TH: "คำของาน" },
        path: "/requests",
        icon: <ClipboardList />,
        badge: 2,
      },
      {
        id: "tasks",
        label: { EN: "My Tasks", TH: "งานของฉัน" },
        path: "/tasks",
        icon: <CheckSquare />,
        badge: 4,
      },
      {
        id: "chat",
        label: { EN: "Chat", TH: "แชท" },
        path: "/chat",
        icon: <MessageSquare />,
      },
      {
        id: "kanban",
        label: { EN: "Kanban Board", TH: "บอร์ดคัมบัง" },
        path: "/kanban",
        icon: <KanbanSquare />,
      },
      {
        id: "calendar",
        label: { EN: "Calendar", TH: "ปฏิทิน" },
        path: "/calendar",
        icon: <Calendar />,
      },
    ],
  },
  {
    title: { EN: "Operations & Team", TH: "การดำเนินงาน & ทีม" },
    items: [
      {
        id: "my-dashboard",
        label: { EN: "My Dashboard", TH: "แดชบอร์ดของฉัน" },
        path: "/my-dashboard",
        icon: <UserCircle />,
      },
      {
        id: "team-dashboard",
        label: { EN: "Team Dashboard", TH: "แดชบอร์ดทีม" },
        path: "/team-dashboard",
        icon: <Users />,
      },
      {
        id: "employee-availability",
        label: { EN: "Availability", TH: "สถานะว่างพนักงาน" },
        path: "/employee-availability",
        icon: <Clock />,
      },
      {
        id: "manpower",
        label: { EN: "Manpower Timeline", TH: "ไทม์ไลน์กำลังคน" },
        path: "/manpower",
        icon: <Activity />,
      },
    ],
  },
  {
    title: { EN: "Projects & Planning", TH: "โครงการ & แผนงาน" },
    items: [
      {
        id: "proj-dashboard",
        label: { EN: "Project Dashboard", TH: "แดชบอร์ดโครงการ" },
        path: "/proj-dashboard",
        icon: <Briefcase />,
      },
      {
        id: "portfolio",
        label: { EN: "Portfolio", TH: "พอร์ตโฟลิโอ" },
        path: "/portfolio",
        icon: <PieChart />,
      },
      {
        id: "gantt",
        label: { EN: "Gantt Chart", TH: "แผนภูมิแกนต์" },
        path: "/gantt",
        icon: <BarChartHorizontal />,
      },
      {
        id: "workload",
        label: { EN: "Workload & Capacity", TH: "ภาระงาน" },
        path: "/workload",
        icon: <Activity />,
      },
    ],
  },
  {
    title: { EN: "Governance & Reports", TH: "การควบคุม & รายงาน" },
    items: [
      {
        id: "approval",
        label: { EN: "Approval Center", TH: "ศูนย์อนุมัติ" },
        path: "/approval",
        icon: <ShieldCheck />,
      },
      {
        id: "performance",
        label: { EN: "Performance Score", TH: "คะแนนผลงาน" },
        path: "/performance",
        icon: <Star />,
      },
      {
        id: "score-audit",
        label: { EN: "Score Audit", TH: "ตรวจสอบคะแนน" },
        path: "/score-audit",
        icon: <ClipboardCheck />,
      },
      {
        id: "reports",
        label: { EN: "Reports", TH: "รายงาน" },
        path: "/reports",
        icon: <FileText />,
      },
    ],
  },
  {
    title: { EN: "Admin", TH: "ผู้ดูแลระบบ" },
    items: [
      {
        id: "users",
        label: { EN: "Users & Permissions", TH: "จัดการผู้ใช้และสิทธิ์" },
        path: "/users",
        icon: <UserCog />,
      },
      {
        id: "audit-log",
        label: { EN: "Audit Log", TH: "บันทึกการตรวจสอบ" },
        path: "/audit-log",
        icon: <ScrollText />,
      },
    ],
  },
];

export function MobileNav() {
  const { activeTab } = useStore();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-ikm-border bg-ikm-card pb-safe md:hidden">
      <div className="flex h-16 w-full items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex h-full min-w-[64px] flex-col items-center justify-center gap-1 transition-colors",
                isActive
                  ? "text-ikm-orange"
                  : "text-ikm-text-secondary hover:text-ikm-text",
              )}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.badge && (
                <span className="absolute top-2 right-3 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-status-red px-1 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileDrawer() {
  const { isMobileMenuOpen, setMobileMenuOpen, activeTab, language } = useStore();
  const navigate = useNavigate();

  if (!isMobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs" 
        onClick={() => setMobileMenuOpen(false)} 
      />
      <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-ikm-card border-r border-ikm-border shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        <div className="p-4 border-b border-ikm-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-ikm-orange flex items-center justify-center text-white font-bold text-xs">
              IKM
            </div>
            <span className="font-bold text-sm text-ikm-text">
              Project Management
            </span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 text-ikm-text-secondary hover:text-ikm-text rounded-lg hover:bg-ikm-bg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {sidebarCategories.map((category, idx) => (
            <div key={idx}>
              <div className="text-[11px] font-bold text-ikm-text-secondary uppercase tracking-wider mb-2 px-2">
                {category.title[language as "EN" | "TH"]}
              </div>
              <nav className="space-y-1">
                {category.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-ikm-orange-light text-ikm-orange-dark font-semibold"
                          : "text-ikm-text-secondary hover:bg-ikm-bg hover:text-ikm-text",
                      )}
                    >
                      {React.cloneElement(item.icon, { className: "h-4 w-4 shrink-0" })}
                      <span className="truncate">
                        {item.label[language as "EN" | "TH"]}
                      </span>
                      {item.badge && (
                        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-status-red px-1.5 text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { 
    activeTab, 
    language, 
    isSidebarCollapsed, 
    setSidebarCollapsed,
    toggleSidebar, 
    isSidebarAutoHide,
    toggleSidebarAutoHide,
    setSidebarAutoHide
  } = useStore();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Automatically collapse / hide sidebar when screen width drops below 'lg' (1024px)
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarCollapsed]);

  // In Auto-Hide mode, sidebar expands when hovered
  const isExpanded = isSidebarAutoHide ? isHovered : !isSidebarCollapsed;

  return (
    <>
      {/* Left Edge Hover/Click Sensor Strip when Auto-Hide is active on lg screens */}
      {isSidebarAutoHide && (
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onClick={() => setIsHovered(true)}
          className="hidden lg:flex fixed left-0 top-16 bottom-0 w-3 hover:w-5 z-40 cursor-pointer items-center justify-center transition-all bg-gradient-to-r from-ikm-orange/30 to-transparent hover:from-ikm-orange/60 group"
          title={language === 'TH' ? "เลื่อนเมาส์ชี้เพื่อเปิดเมนู (Slide Menu)" : "Hover to open Slide Menu"}
        >
          <div className="w-1 h-10 rounded-full bg-ikm-orange opacity-40 group-hover:opacity-100 group-hover:h-16 transition-all duration-300" />
        </div>
      )}

      {/* Backdrop overlay when Auto-Hide sidebar slides out over content on lg */}
      {isSidebarAutoHide && isHovered && (
        <div 
          onClick={() => setIsHovered(false)}
          className="hidden lg:block fixed inset-0 top-16 bg-black/25 z-40 backdrop-blur-[1px] animate-in fade-in duration-200"
        />
      )}

      <aside 
        onMouseEnter={() => isSidebarAutoHide && setIsHovered(true)}
        onMouseLeave={() => isSidebarAutoHide && setIsHovered(false)}
        className={cn(
          "hidden lg:flex flex-col border-r border-ikm-border bg-ikm-card z-50 fixed h-[calc(100vh-64px)] transition-all duration-300 ease-out shadow-lg",
          isSidebarAutoHide 
            ? (isHovered ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full w-64 pointer-events-none")
            : (isSidebarCollapsed ? "w-16" : "w-64")
        )}
      >
        {/* Auto-Hide status badge header inside sidebar */}
        {isSidebarAutoHide && (
          <div className="px-3 py-2 border-b border-ikm-border bg-ikm-orange-light/40 flex items-center justify-between text-xs">
            <span className="font-bold text-ikm-orange-dark flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              {language === 'TH' ? "โหมดซ่อนอัตโนมัติ" : "Auto-Hide Active"}
            </span>
            <button
              onClick={() => setSidebarAutoHide(false)}
              className="text-[11px] font-semibold text-ikm-text-secondary hover:text-ikm-orange px-2 py-0.5 rounded hover:bg-ikm-card transition-colors flex items-center gap-1"
              title={language === 'TH' ? "ตรึงเมนูไว้ตลอดเวลา" : "Pin sidebar"}
            >
              <Pin className="w-3 h-3" />
              <span>{language === 'TH' ? "ปักหมุด" : "Pin"}</span>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 space-y-6 overflow-x-hidden">
          {sidebarCategories.map((category, idx) => (
            <div key={idx}>
              {isExpanded && (
                <div className="text-[11px] font-bold text-ikm-text-secondary uppercase tracking-wider mb-2 px-3 truncate">
                  {category.title[language as "EN" | "TH"]}
                </div>
              )}
              <nav className="space-y-1">
                {category.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.path);
                        if (isSidebarAutoHide) setIsHovered(false);
                      }}
                      title={!isExpanded ? item.label[language as "EN" | "TH"] : undefined}
                      className={cn(
                        "flex items-center rounded-lg py-2 text-sm font-medium transition-all group relative",
                        !isExpanded ? "justify-center px-0 w-10 mx-auto" : "w-full gap-3 px-3",
                        isActive
                          ? "bg-ikm-orange-light text-ikm-orange-dark font-semibold"
                          : "text-ikm-text-secondary hover:bg-ikm-bg hover:text-ikm-text",
                      )}
                    >
                      {React.cloneElement(item.icon, { className: "h-4 w-4 shrink-0" })}
                      
                      {isExpanded && (
                        <span className="truncate flex-1 text-left">
                          {item.label[language as "EN" | "TH"]}
                        </span>
                      )}

                      {isExpanded && item.badge && (
                        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-status-red px-1.5 text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}

                      {/* Floating badge for collapsed mode */}
                      {!isExpanded && item.badge && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-status-red" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-2 border-t border-ikm-border space-y-1 bg-ikm-bg/50">
          {/* Auto-Hide Switch Button */}
          <button
            onClick={toggleSidebarAutoHide}
            className={cn(
              "flex items-center rounded-lg py-1.5 text-xs font-semibold text-ikm-text-secondary hover:bg-ikm-bg hover:text-ikm-text transition-colors w-full",
              !isExpanded ? "justify-center px-0" : "justify-between px-3"
            )}
            title={language === 'TH' ? (isSidebarAutoHide ? "เปลี่ยนเป็นโหมดตรึงเมนู" : "เปลี่ยนเป็นโหมดซ่อนอัตโนมัติ") : (isSidebarAutoHide ? "Switch to Pinned mode" : "Switch to Auto-Hide mode")}
          >
            <div className="flex items-center gap-2">
              {isSidebarAutoHide ? <PinOff className="h-4 w-4 text-ikm-orange" /> : <Pin className="h-4 w-4" />}
              {isExpanded && (
                <span>{language === 'TH' ? "ซ่อนเมนูอัตโนมัติ (Auto-Hide)" : "Auto-Hide Menu"}</span>
              )}
            </div>
            {isExpanded && (
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded font-bold",
                isSidebarAutoHide ? "bg-ikm-orange text-white" : "bg-ikm-border text-ikm-text-secondary"
              )}>
                {isSidebarAutoHide ? "ON" : "OFF"}
              </span>
            )}
          </button>

          {/* Standard Collapse/Expand Toggle Button (when not in Auto-Hide) */}
          {!isSidebarAutoHide && (
            <button
              onClick={toggleSidebar}
              className={cn(
                "flex items-center rounded-lg py-1.5 text-xs font-semibold text-ikm-text-secondary hover:bg-ikm-bg hover:text-ikm-text transition-colors w-full",
                isSidebarCollapsed ? "justify-center px-0" : "gap-2 px-3"
              )}
              title={isSidebarCollapsed ? (language === 'TH' ? "ขยายแถบเมนู" : "Expand Menu") : (language === 'TH' ? "ย่อแถบเมนู" : "Collapse Menu")}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4 text-ikm-orange" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 text-ikm-orange" />
                  <span>{language === 'TH' ? "ย่อเมนูด้านข้าง (Compact)" : "Collapse Menu"}</span>
                </>
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed, isSidebarAutoHide } = useStore();

  return (
    <div className="min-h-screen bg-ikm-bg flex flex-col">
      <Header />
      <MobileDrawer />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main 
          className={cn(
            "flex-1 overflow-y-auto pb-20 md:pb-6 relative w-full transition-all duration-300 ease-in-out ml-0",
            isSidebarAutoHide 
              ? "lg:ml-0" 
              : (isSidebarCollapsed ? "lg:ml-16" : "lg:ml-64")
          )}
        >
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
