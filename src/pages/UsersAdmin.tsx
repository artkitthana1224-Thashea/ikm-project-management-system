import React, { useState } from 'react';
import { useStore, Employee } from '../store/useStore';
import { EmployeeCertificate, UserRole } from '../types';
import { Card } from '../components/ui/Card';
import { 
  Plus, Search, Phone, Mail, Trash2, Edit3, Camera, 
  Check, X, Award, FileText, Calendar, AlertTriangle, 
  Download, Eye, Shield, Lock, UserCheck, CheckCircle2,
  ExternalLink, Clock, Sparkles, Building, Briefcase, User as UserIcon
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { AvatarManagerModal } from '../components/ui/AvatarManagerModal';
import { cn } from '../lib/utils';
import { 
  canManageUsers, 
  canReviewEmployee, 
  canDeleteEquipment, 
  getUserRole, 
  isSelfEditOnly 
} from '../lib/rbac';

export function UsersAdmin() {
  const { 
    language, 
    employees, 
    user: currentUser,
    updateEmployee, 
    addEmployee, 
    archiveEmployee,
    deleteEmployee,
    switchUser
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Employee | null>(null);
  const [avatarModalTarget, setAvatarModalTarget] = useState<Employee | null>(null);
  const [reviewStaff, setReviewStaff] = useState<Employee | null>(null);
  const [activeReviewTab, setActiveReviewTab] = useState<'cv' | 'certs'>('certs');
  const [viewingPdfCert, setViewingPdfCert] = useState<{ cert: EmployeeCertificate; employeeName: string } | null>(null);
  const [deleteConfirmStaff, setDeleteConfirmStaff] = useState<Employee | null>(null);
  const [notification, setNotification] = useState<{ msg: string; type?: 'success' | 'warning' } | null>(null);

  // New Certificate Form inside Review Modal
  const [isAddingCert, setIsAddingCert] = useState(false);
  const [newCert, setNewCert] = useState({
    name: '',
    issuingBody: '',
    certificateNo: '',
    issueDate: new Date().toISOString().slice(0, 10),
    expireDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: '',
  });

  // New staff form state
  const [newStaff, setNewStaff] = useState({
    name: '',
    username: '',
    password: 'password123',
    role: 'Lead Engineer',
    userLevel: 'Supervisor' as UserRole,
    department: 'Mechanical Engineering',
    phone: '',
    email: '',
    availability: 'available' as Employee['availability'],
    avatarUrl: '',
    skills: 'Piping, Welding, ASME Codes',
    score: 92,
    baseLocation: 'IKM Rayong (RY)' as Employee['baseLocation'],
    bio: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  // Translations
  const t = {
    EN: {
      title: 'ระบบจัดการข้อมูลพนักงาน (Admin Management)',
      subtitle: 'Manage personnel roster, roles, profile pictures/avatars, certifications, and availability connected to Supabase',
      users: 'Employee / Profile',
      role: 'Role & Skills',
      dept: 'Department',
      status: 'Availability',
      contact: 'Contact Info',
      score: 'KPI Score',
      actions: 'Actions',
      add: 'Add New Employee',
      searchPlaceholder: 'ค้นหาด้วยชื่อ, ตำแหน่ง, แผนก, หรือเบอร์โทร...',
      allDepts: 'ทุกแผนก',
      allStatuses: 'ทุกสถานะ',
      active: 'Available',
      busy: 'Busy',
      onLeave: 'On Leave',
      offShift: 'Off Shift',
      edit: 'Edit Profile',
      delete: 'Archive / Delete',
      cvCertReview: 'Review CV & Certificates',
      changePhoto: 'Change Profile Photo',
      save: 'Save Changes',
      cancel: 'Cancel',
      addSuccess: 'New employee added successfully',
      updateSuccess: 'Employee profile updated successfully',
      archiveSuccess: 'Employee moved to archive (soft deleted for audit trail)',
      selfEditNotice: 'Self-Service Mode: You can edit your personal text information (Bio, Skills, Phone, Email). Role & Score are locked for Admin.',
      certExpireWarning: 'Certificates expiring within 30 days require immediate renewal!',
    },
    TH: {
      title: 'ระบบจัดการข้อมูลพนักงาน (Admin Management)',
      subtitle: 'จัดการรายชื่อ บทบาท รูปภาพโปรไฟล์/อวตาร และความพร้อม เชื่อมโยงฐานข้อมูล Supabase',
      users: 'พนักงาน / รูปโปรไฟล์',
      role: 'ตำแหน่งและทักษะ',
      dept: 'แผนก',
      status: 'สถานะความพร้อม',
      contact: 'ข้อมูลติดต่อ',
      score: 'คะแนน KPI',
      actions: 'จัดการ',
      add: 'เพิ่มพนักงานใหม่',
      searchPlaceholder: 'ค้นหาด้วยชื่อ, ตำแหน่ง, แผนก, หรือเบอร์โทร...',
      allDepts: 'ทุกแผนก',
      allStatuses: 'ทุกสถานะ',
      active: 'Available',
      busy: 'Busy',
      onLeave: 'On Leave',
      offShift: 'Off Shift',
      edit: 'แก้ไขข้อมูล',
      delete: 'ลบ / เก็บเข้าคลัง (Archive)',
      cvCertReview: 'ตรวจสอบ CV และใบรับรอง (Certificates)',
      changePhoto: 'เปลี่ยนรูปโปรไฟล์',
      save: 'บันทึกข้อมูล',
      cancel: 'ยกเลิก',
      addSuccess: 'เพิ่มพนักงานใหม่เรียบร้อยแล้ว',
      updateSuccess: 'บันทึกการแก้ไขข้อมูลพนักงานสำเร็จ',
      archiveSuccess: 'จัดเก็บพนักงานเข้าคลัง (Archive) สำเร็จเพื่อรักษา Audit Trail',
      selfEditNotice: 'โหมดแก้ไขข้อมูลส่วนตัว: สามารถแก้ไขข้อความ (ประวัติ, ทักษะ, เบอร์โทร, อีเมล) ได้ แต่ตำแหน่งและคะแนนถูกล็อกโดย Admin',
      certExpireWarning: 'มีใบรับรองกำลังจะหมดอายุภายใน 30 วัน กรุณาต่ออายุล่วงหน้า!',
    }
  }[language];

  const showToast = (msg: string, type: 'success' | 'warning' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const userRole = getUserRole(currentUser);
  const isAdminOrCountryManager = userRole === 'Admin' || userRole === 'Country Manager';
  const canAddStaff = ['Admin', 'Country Manager', 'Manager', 'Coordinator'].includes(userRole);

  const departments = ['Operations', 'Mechanical Engineering', 'Health, Safety & Environment (HSE)', 'IT & Security', 'Field Services', 'Client Asset Services', 'Management', 'Engineering'];

  const roleLevelOptions: { label: string; value: UserRole }[] = [
    { label: 'Admin (ตั้งค่าระบบ, จัดการผู้ใช้, สิทธิ์, Master Data)', value: 'Admin' },
    { label: 'Country Manager (ภาพรวมทั้งหมด, ทุก Base, สิทธิ์สูงสุด, อนุมัติระดับสูง)', value: 'Country Manager' },
    { label: 'Manager (ภาพรวมโปรเจกต์ที่รับผิดชอบ, Assign งาน, อนุมัติคำขอ)', value: 'Manager' },
    { label: 'Coordinator (จัดทีมเสนอ Assign งาน, Update Manpower, ตรวจงาน)', value: 'Coordinator' },
    { label: 'Supervisor (จัดเครื่องมือหลัก, Assign สู่ Tech, Update Progress/Checklist)', value: 'Supervisor' },
    { label: 'Technician (ดูงานที่ได้รับมอบหมาย, บันทึกความคืบหน้า, แนบรูปหลักฐาน)', value: 'Technician' },
    { label: 'Requester (สร้าง Work Request, ติดตามสถานะ, แนบไฟล์)', value: 'Requester' },
  ];

  // Expiration calculation helper
  const getCertExpirationStatus = (expireDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expireDate);
    exp.setHours(0, 0, 0, 0);
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', days: diffDays, badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900', label: '⛔ หมดอายุแล้ว' };
    }
    if (diffDays <= 30) {
      return { status: 'expiring', days: diffDays, badgeClass: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 animate-pulse', label: `⚠️ หมดอายุใน ${diffDays} วัน` };
    }
    return { status: 'valid', days: diffDays, badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900', label: `✅ ใช้งานได้ (${diffDays} วัน)` };
  };

  // Filtered employees
  const filteredEmployees = employees.filter(e => {
    if (!showArchived && e.isArchived) return false;
    if (showArchived && !e.isArchived) return false;

    const matchesSearch = !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()) ||
      (e.phone && e.phone.includes(search)) ||
      (e.email && e.email.toLowerCase().includes(search.toLowerCase())) ||
      (e.username && e.username.toLowerCase().includes(search.toLowerCase()));

    const matchesDept = selectedDept === 'all' || e.department === selectedDept;
    const matchesStatus = selectedStatus === 'all' || e.availability === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Handle Add Employee
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name.trim()) return;

    const colors = ['#F58220', '#16794B', '#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#06B6D4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const skillsArray = newStaff.skills.split(',').map(s => s.trim()).filter(Boolean);

    const createdEmp: Employee = {
      id: `emp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: newStaff.name.trim(),
      username: newStaff.username.trim() || newStaff.name.toLowerCase().replace(/\s+/g, '.'),
      password: newStaff.password || 'password123',
      role: newStaff.role.trim(),
      userLevel: newStaff.userLevel,
      department: newStaff.department,
      avatarColor: randomColor,
      avatarUrl: newStaff.avatarUrl.trim() || undefined,
      availability: newStaff.availability,
      utilization: 75,
      score: Number(newStaff.score) || 90,
      skills: skillsArray.length > 0 ? skillsArray : ['Operations', 'Field Safety'],
      phone: newStaff.phone.trim() || '081-000-0000',
      email: newStaff.email.trim() || `${newStaff.name.toLowerCase().replace(/\s+/g, '')}@ikm-ops.com`,
      baseLocation: newStaff.baseLocation,
      bio: newStaff.bio.trim() || `Professional ${newStaff.role} with expertise in industrial asset services.`,
      certificates: [],
      cv: {
        summary: newStaff.bio.trim() || `Professional ${newStaff.role} with expertise in industrial asset services.`,
        education: ['B.Eng. Engineering - Top University'],
        experiences: [
          {
            period: '2023 - Present',
            position: newStaff.role,
            company: 'IKM Operations Base',
            description: 'Responsible for key execution, project coordination, and site operations.'
          }
        ]
      }
    };

    await addEmployee(createdEmp);
    setIsAddModalOpen(false);
    showToast(t.addSuccess, 'success');
    setNewStaff({
      name: '',
      username: '',
      password: 'password123',
      role: 'Lead Engineer',
      userLevel: 'Supervisor',
      department: 'Mechanical Engineering',
      phone: '',
      email: '',
      availability: 'available',
      avatarUrl: '',
      skills: 'Piping, Welding, ASME Codes',
      score: 92,
      baseLocation: 'IKM Rayong (RY)',
      bio: '',
    });
  };

  // Handle Edit Employee
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    const isSelfOnly = isSelfEditOnly(currentUser, editingStaff.id);

    const skillsArray = typeof editingStaff.skills === 'string'
      ? (editingStaff.skills as string).split(',').map((s: string) => s.trim()).filter(Boolean)
      : editingStaff.skills;

    const updates: Partial<Employee> = {
      name: editingStaff.name,
      phone: editingStaff.phone,
      email: editingStaff.email,
      skills: skillsArray,
      bio: editingStaff.bio,
      availability: editingStaff.availability,
    };

    if (!isSelfOnly) {
      updates.role = editingStaff.role;
      updates.userLevel = editingStaff.userLevel;
      updates.department = editingStaff.department;
      updates.score = Number(editingStaff.score);
      updates.username = editingStaff.username;
      updates.password = editingStaff.password;
      updates.baseLocation = editingStaff.baseLocation;
    }

    await updateEmployee(editingStaff.id, updates);
    setEditingStaff(null);
    showToast(t.updateSuccess, 'success');
  };

  // Handle Add Certificate to reviewed employee
  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewStaff || !newCert.name.trim()) return;

    const certItem: EmployeeCertificate = {
      id: `CERT-${Date.now()}`,
      name: newCert.name.trim(),
      issuingBody: newCert.issuingBody.trim() || 'Accredited Safety Institute',
      certificateNo: newCert.certificateNo.trim() || `IKM-CERT-${Math.floor(100000 + Math.random() * 900000)}`,
      issueDate: newCert.issueDate,
      expireDate: newCert.expireDate,
      notes: newCert.notes.trim(),
      documentName: `${newCert.name.replace(/\s+/g, '_')}_Cert.pdf`,
    };

    const currentCerts = reviewStaff.certificates || [];
    const updatedCerts = [...currentCerts, certItem];

    await updateEmployee(reviewStaff.id, { certificates: updatedCerts });
    setReviewStaff({ ...reviewStaff, certificates: updatedCerts });
    setIsAddingCert(false);
    setNewCert({
      name: '',
      issuingBody: '',
      certificateNo: '',
      issueDate: new Date().toISOString().slice(0, 10),
      expireDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      notes: '',
    });
    showToast('เพิ่มใบรับรองและตั้งค่าการแจ้งเตือนสำเร็จ', 'success');
  };

  // Handle Delete / Archive Employee (Rule 6: soft delete with audit preservation)
  const handleArchiveStaff = async () => {
    if (!deleteConfirmStaff) return;
    await archiveEmployee(deleteConfirmStaff.id);
    setDeleteConfirmStaff(null);
    showToast(t.archiveSuccess, 'warning');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {notification && (
        <div className={cn(
          "fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium border backdrop-blur-md animate-in slide-in-from-top-4 duration-200",
          notification.type === 'warning' 
            ? "bg-amber-500 text-white border-amber-600 shadow-amber-500/20" 
            : "bg-ikm-orange text-white border-orange-600 shadow-orange-500/25"
        )}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header section matching image.png */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F58220] flex items-center justify-center text-white shadow-md shadow-orange-500/20 flex-shrink-0 mt-0.5">
            <UserIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-ikm-text tracking-tight flex items-center gap-2">
              {t.title}
            </h1>
            <p className="text-xs md:text-sm text-ikm-text-secondary mt-1">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Add Employee Button (Authorized for Admin, Country Manager, Manager, Coordinator) */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            disabled={!canAddStaff}
            title={!canAddStaff ? 'เฉพาะ Admin, Country Manager, Manager และ Coordinator ที่สามารถเพิ่มพนักงานได้' : undefined}
            className={cn(
              "bg-[#F58220] hover:bg-[#e07110] text-white font-medium px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 text-sm",
              !canAddStaff && "opacity-50 cursor-not-allowed"
            )}
          >
            <Plus className="w-4 h-4" />
            <span>+ {t.add}</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar matching image.png */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search input with search icon */}
        <div className="md:col-span-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ikm-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-ikm-card border border-ikm-border text-ikm-text text-sm placeholder:text-ikm-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-[#F58220]/40 focus:border-[#F58220] transition-all shadow-sm"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ikm-text-secondary hover:text-ikm-text p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Department filter */}
        <div className="md:col-span-3">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-ikm-card border border-ikm-border text-ikm-text text-sm focus:outline-none focus:ring-2 focus:ring-[#F58220]/40 focus:border-[#F58220] transition-all shadow-sm"
          >
            <option value="all">{t.allDepts}</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="md:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-ikm-card border border-ikm-border text-ikm-text text-sm focus:outline-none focus:ring-2 focus:ring-[#F58220]/40 focus:border-[#F58220] transition-all shadow-sm"
          >
            <option value="all">{t.allStatuses}</option>
            <option value="available">Available (พร้อมปฏิบัติงาน)</option>
            <option value="busy">Busy (ติดภารกิจ)</option>
            <option value="on-leave">On Leave (ลางาน)</option>
            <option value="off-shift">Off Shift (ออกกะ)</option>
          </select>
        </div>
      </div>

      {/* Main Table Card matching exact visual design of image.png */}
      <Card className="overflow-hidden border border-ikm-border rounded-2xl shadow-sm bg-ikm-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-ikm-border bg-slate-50/70 dark:bg-slate-900/40 text-ikm-text-secondary text-xs font-semibold select-none">
                <th className="py-3.5 px-5 font-semibold">{t.users}</th>
                <th className="py-3.5 px-5 font-semibold">{t.role}</th>
                <th className="py-3.5 px-5 font-semibold">{t.dept}</th>
                <th className="py-3.5 px-5 font-semibold">{t.contact}</th>
                <th className="py-3.5 px-5 font-semibold">{t.status}</th>
                <th className="py-3.5 px-5 font-semibold">{t.score}</th>
                <th className="py-3.5 px-5 font-semibold text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ikm-border">
              {filteredEmployees.map((emp) => {
                // Check if any certificate is expiring in <= 30 days
                const expiringCerts = (emp.certificates || []).filter(c => {
                  const st = getCertExpirationStatus(c.expireDate);
                  return st.status === 'expiring' || st.status === 'expired';
                });

                const isCurrentUser = currentUser?.id === emp.id;
                const canEditThis = isAdminOrCountryManager || isCurrentUser;
                const canDeleteThis = isAdminOrCountryManager;

                return (
                  <tr 
                    key={emp.id} 
                    className={cn(
                      "hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group",
                      emp.isArchived && "opacity-60 bg-slate-100/50 dark:bg-slate-900/50"
                    )}
                  >
                    {/* 1. Employee / Profile Picture with ID & Badge */}
                    <td className="py-4 px-5 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar
                            name={emp.name}
                            avatarUrl={emp.avatarUrl}
                            backgroundColor={emp.avatarColor || '#F58220'}
                            size="md"
                            className="rounded-full shadow-sm ring-2 ring-white dark:ring-slate-900"
                          />
                          {/* Role mini chip if manager/admin */}
                          {emp.userLevel && (
                            <span className="absolute -bottom-1.5 -right-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-xs scale-90">
                              {emp.userLevel}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-ikm-text text-sm truncate">{emp.name}</span>
                            {emp.userLevel === 'Manager' && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                                Manager
                              </span>
                            )}
                            {emp.userLevel === 'Country Manager' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                                Country Manager
                              </span>
                            )}
                            {emp.userLevel === 'Admin' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-ikm-text-secondary font-mono tracking-tight mt-0.5">
                            ID: {emp.id.length > 12 ? `${emp.id.slice(0, 10)}...` : emp.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 2. Role and Skills Chips */}
                    <td className="py-4 px-5 align-middle">
                      <div>
                        <p className="font-semibold text-ikm-text text-sm">{emp.role}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {emp.skills?.slice(0, 3).map((skill, idx) => (
                            <span 
                              key={idx} 
                              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-ikm-text-secondary font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {emp.skills && emp.skills.length > 3 && (
                            <span className="text-[10px] text-ikm-text-secondary self-center">
                              +{emp.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 3. Department Pill matching image.png */}
                    <td className="py-4 px-5 align-middle">
                      <span className={cn(
                        "inline-block px-3 py-1 rounded-full text-xs font-medium",
                        emp.department.includes('Operations') ? "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300" :
                        emp.department.includes('Mechanical') ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" :
                        emp.department.includes('Safety') || emp.department.includes('HSE') ? "bg-orange-50/80 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300" :
                        "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                      )}>
                        {emp.department}
                      </span>
                    </td>

                    {/* 4. Contact Info (Phone & Email) */}
                    <td className="py-4 px-5 align-middle">
                      <div className="space-y-1 text-xs text-ikm-text-secondary">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-ikm-text-secondary/70 flex-shrink-0" />
                          <span className="font-mono">{emp.phone || '081-998-8776'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-ikm-text-secondary/70 flex-shrink-0" />
                          <span className="truncate max-w-[170px]">{emp.email || `${emp.name.toLowerCase().replace(/\s+/g, '.')}@ikm-ops.com`}</span>
                        </div>
                      </div>
                    </td>

                    {/* 5. Availability Status Pill */}
                    <td className="py-4 px-5 align-middle">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
                        emp.availability === 'available' ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900" :
                        emp.availability === 'busy' ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900" :
                        emp.availability === 'on-leave' ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900" :
                        "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          emp.availability === 'available' ? "bg-emerald-500" :
                          emp.availability === 'busy' ? "bg-amber-500" :
                          emp.availability === 'on-leave' ? "bg-red-500" : "bg-slate-400"
                        )} />
                        {emp.availability === 'available' ? 'Available' :
                         emp.availability === 'busy' ? 'Busy' :
                         emp.availability === 'on-leave' ? 'On Leave' : 'Off Shift'}
                      </span>
                    </td>

                    {/* 6. KPI Score */}
                    <td className="py-4 px-5 align-middle">
                      <div className="flex items-center gap-1.5 font-bold text-sm text-ikm-text">
                        <Award className="w-4 h-4 text-[#F58220]" />
                        <span>{emp.score || 95} <span className="text-xs text-ikm-text-secondary font-normal">/100</span></span>
                      </div>
                    </td>

                    {/* 7. Action Icons matching image.png (Camera, Review CV/Cert, Edit, Delete) */}
                    <td className="py-4 px-5 align-middle text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Change Avatar Photo */}
                        <button
                          onClick={() => setAvatarModalTarget(emp)}
                          title={t.changePhoto}
                          className="p-1.5 rounded-lg text-ikm-text-secondary hover:text-ikm-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Camera className="w-4 h-4" />
                        </button>

                        {/* Review CV & Certificates (Available for Admin, Country Mgr, Mgr, Coord, and the employee themselves) */}
                        <button
                          onClick={() => {
                            setReviewStaff(emp);
                            setActiveReviewTab('certs');
                          }}
                          title={t.cvCertReview}
                          className={cn(
                            "relative p-1.5 rounded-lg text-ikm-text-secondary hover:text-[#F58220] hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors",
                            expiringCerts.length > 0 && "text-amber-600 bg-amber-50 dark:bg-amber-950/30"
                          )}
                        >
                          <FileText className="w-4 h-4" />
                          {expiringCerts.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900 animate-ping" />
                          )}
                        </button>

                        {/* Edit Profile */}
                        <button
                          onClick={() => setEditingStaff(emp)}
                          title={canEditThis ? t.edit : 'ล็อกการแก้ไข (เฉพาะ Admin หรือพนักงานเจ้าของโปรไฟล์)'}
                          className={cn(
                            "p-1.5 rounded-lg text-ikm-text-secondary hover:text-ikm-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                            !canEditThis && "opacity-40 cursor-not-allowed"
                          )}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Archive / Delete Profile (Allowed ONLY for Admin and Country Manager) */}
                        <button
                          onClick={() => canDeleteThis && setDeleteConfirmStaff(emp)}
                          disabled={!canDeleteThis}
                          title={canDeleteThis ? t.delete : 'เฉพาะ Admin และ Country Manager เท่านั้นที่สามารถลบหรือจัดเก็บได้'}
                          className={cn(
                            "p-1.5 rounded-lg text-ikm-text-secondary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors",
                            !canDeleteThis && "opacity-30 cursor-not-allowed"
                          )}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ikm-text-secondary">
                    <UserIcon className="w-12 h-12 mx-auto mb-2 opacity-30 text-ikm-text-secondary" />
                    <p className="text-sm">ไม่พบข้อมูลพนักงานตามเงื่อนไขการค้นหา</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* MODAL 1: Review CV & Certificates Modal with 30-Day Alert & PDF Reader   */}
      {/* ========================================================================= */}
      {reviewStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-ikm-card border border-ikm-border w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8">
            
            {/* Modal Header with Employee Banner */}
            <div className="bg-slate-900 text-white p-6 relative">
              <button 
                onClick={() => setReviewStaff(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar
                  name={reviewStaff.name}
                  avatarUrl={reviewStaff.avatarUrl}
                  backgroundColor={reviewStaff.avatarColor || '#F58220'}
                  size="lg"
                  className="ring-4 ring-white/10 rounded-2xl"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{reviewStaff.name}</h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F58220] font-semibold text-white">
                      {reviewStaff.userLevel || reviewStaff.role}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm mt-0.5">{reviewStaff.role} &bull; {reviewStaff.department}</p>
                  <p className="text-slate-400 text-xs mt-1 font-mono">{reviewStaff.email} &bull; {reviewStaff.phone}</p>
                </div>
              </div>

              {/* Tabs Switcher: Certificates vs CV */}
              <div className="flex gap-2 mt-6 border-b border-slate-700 pb-0.5">
                <button
                  onClick={() => setActiveReviewTab('certs')}
                  className={cn(
                    "px-4 py-2 text-sm font-semibold rounded-t-lg transition-all flex items-center gap-2 border-b-2",
                    activeReviewTab === 'certs' 
                      ? "border-[#F58220] text-[#F58220] bg-white/5" 
                      : "border-transparent text-slate-400 hover:text-white"
                  )}
                >
                  <Award className="w-4 h-4" />
                  <span>ใบรับรอง & วุฒิบัตร (Certificates)</span>
                  <span className="text-xs px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-200">
                    {reviewStaff.certificates?.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => setActiveReviewTab('cv')}
                  className={cn(
                    "px-4 py-2 text-sm font-semibold rounded-t-lg transition-all flex items-center gap-2 border-b-2",
                    activeReviewTab === 'cv' 
                      ? "border-[#F58220] text-[#F58220] bg-white/5" 
                      : "border-transparent text-slate-400 hover:text-white"
                  )}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>ประวัติ & CV ย่อ (Career Bio)</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
              
              {/* TAB 1: CERTIFICATES & 30-DAY EXPIRATION ALERTS */}
              {activeReviewTab === 'certs' && (
                <div className="space-y-4">
                  
                  {/* Expiration Banner if any cert expiring within 30 days */}
                  {(() => {
                    const expiring = (reviewStaff.certificates || []).filter(c => {
                      const st = getCertExpirationStatus(c.expireDate);
                      return st.status === 'expiring' || st.status === 'expired';
                    });
                    if (expiring.length === 0) return null;
                    return (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 dark:bg-amber-950/40 dark:border-amber-800 flex items-start gap-3 text-amber-900 dark:text-amber-200">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 animate-bounce" />
                        <div>
                          <p className="font-bold text-sm">การแจ้งเตือนการหมดอายุของใบรับรอง (30-Day Alert)</p>
                          <p className="text-xs mt-0.5 text-amber-800 dark:text-amber-300">
                            มี {expiring.length} ใบรับรองที่หมดอายุแล้วหรือกำลังจะหมดอายุภายใน 30 วัน กรุณาจัดตารางส่งพนักงานเข้าอบรมต่ออายุ
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-ikm-text text-sm flex items-center gap-2">
                      <span>รายการใบรับรองความรู้ (Certificates List)</span>
                    </h3>
                    <Button 
                      size="sm"
                      onClick={() => setIsAddingCert(!isAddingCert)}
                      className="bg-[#F58220] hover:bg-[#e07110] text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAddingCert ? 'ปิดฟอร์ม' : 'เพิ่ม Certificate'}</span>
                    </Button>
                  </div>

                  {/* Add New Certificate Form */}
                  {isAddingCert && (
                    <form onSubmit={handleAddCertificate} className="p-4 rounded-xl border border-dashed border-[#F58220] bg-orange-50/40 dark:bg-orange-950/20 space-y-3 animate-in fade-in">
                      <p className="text-xs font-bold text-ikm-orange uppercase">เพิ่มใบรับรอง / อบรมใหม่</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-ikm-text-secondary font-medium mb-1">ชื่อหลักสูตร / วุฒิบัตร *</label>
                          <input
                            type="text"
                            required
                            placeholder="เช่น BOSIET, ASME IX, CompEx, NEBOSH"
                            value={newCert.name}
                            onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-ikm-card border border-ikm-border text-ikm-text focus:outline-none focus:ring-1 focus:ring-ikm-orange"
                          />
                        </div>
                        <div>
                          <label className="block text-ikm-text-secondary font-medium mb-1">สถาบันผู้ออกบัตร</label>
                          <input
                            type="text"
                            placeholder="เช่น OPITO, TWI, NEBOSH UK"
                            value={newCert.issuingBody}
                            onChange={(e) => setNewCert({ ...newCert, issuingBody: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-ikm-card border border-ikm-border text-ikm-text focus:outline-none focus:ring-1 focus:ring-ikm-orange"
                          />
                        </div>
                        <div>
                          <label className="block text-ikm-text-secondary font-medium mb-1">เลขที่ใบรับรอง (Certificate No.)</label>
                          <input
                            type="text"
                            placeholder="เช่น OPITO-2026-9988"
                            value={newCert.certificateNo}
                            onChange={(e) => setNewCert({ ...newCert, certificateNo: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-ikm-card border border-ikm-border text-ikm-text focus:outline-none focus:ring-1 focus:ring-ikm-orange"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-ikm-text-secondary font-medium mb-1">วันออกบัตร</label>
                            <input
                              type="date"
                              value={newCert.issueDate}
                              onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                              className="w-full px-2 py-2 rounded-lg bg-ikm-card border border-ikm-border text-ikm-text text-xs focus:outline-none focus:ring-1 focus:ring-ikm-orange"
                            />
                          </div>
                          <div>
                            <label className="block text-ikm-text-secondary font-medium mb-1">วันหมดอายุ *</label>
                            <input
                              type="date"
                              required
                              value={newCert.expireDate}
                              onChange={(e) => setNewCert({ ...newCert, expireDate: e.target.value })}
                              className="w-full px-2 py-2 rounded-lg bg-ikm-card border border-ikm-border text-ikm-text text-xs focus:outline-none focus:ring-1 focus:ring-ikm-orange"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => setIsAddingCert(false)} className="text-xs">
                          ยกเลิก
                        </Button>
                        <Button type="submit" size="sm" className="bg-ikm-orange hover:bg-orange-600 text-white text-xs">
                          บันทึกใบรับรอง
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Certificates Cards */}
                  <div className="space-y-3">
                    {(!reviewStaff.certificates || reviewStaff.certificates.length === 0) ? (
                      <div className="p-8 text-center border border-dashed border-ikm-border rounded-xl text-ikm-text-secondary text-xs">
                        ยังไม่มีข้อมูลใบรับรองสำหรับพนักงานท่านนี้
                      </div>
                    ) : (
                      reviewStaff.certificates.map((cert) => {
                        const expInfo = getCertExpirationStatus(cert.expireDate);
                        return (
                          <div 
                            key={cert.id}
                            className="p-4 rounded-xl border border-ikm-border bg-ikm-card hover:border-[#F58220]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-bold text-ikm-text text-sm">{cert.name}</h4>
                                <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border", expInfo.badgeClass)}>
                                  {expInfo.label}
                                </span>
                              </div>
                              <p className="text-xs text-ikm-text-secondary">
                                สถาบัน: <span className="text-ikm-text font-medium">{cert.issuingBody}</span> &bull; เลขที่: <span className="font-mono text-ikm-text">{cert.certificateNo}</span>
                              </p>
                              <p className="text-[11px] text-ikm-text-secondary">
                                วันที่ออก: {cert.issueDate} &bull; <span className="font-semibold text-ikm-text">หมดอายุ: {cert.expireDate}</span>
                              </p>
                              {cert.notes && <p className="text-xs text-ikm-text-secondary italic">{cert.notes}</p>}
                            </div>

                            {/* Actions: View PDF / Download */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewingPdfCert({ cert, employeeName: reviewStaff.name })}
                                className="text-xs flex items-center gap-1.5 border-ikm-border hover:border-[#F58220]"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#F58220]" />
                                <span>เปิดอ่าน PDF</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // Simulated download
                                  showToast(`ดาวน์โหลด ${cert.documentName || cert.name + '.pdf'} สำเร็จ`, 'success');
                                }}
                                className="text-xs flex items-center gap-1.5 border-ikm-border hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <Download className="w-3.5 h-3.5 text-ikm-text-secondary" />
                                <span>Download</span>
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: CV & CAREER PROFILE */}
              {activeReviewTab === 'cv' && (
                <div className="space-y-5 text-sm">
                  <div>
                    <h4 className="font-bold text-ikm-text text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 text-[#F58220]">
                      <FileText className="w-4 h-4" />
                      <span>บทสรุปประวัติส่วนตัว (Professional Summary)</span>
                    </h4>
                    <p className="text-ikm-text-secondary text-xs leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-ikm-border">
                      {reviewStaff.bio || reviewStaff.cv?.summary || 'No bio available.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-ikm-text text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 text-[#F58220]">
                      <Award className="w-4 h-4" />
                      <span>ประวัติการศึกษา (Education)</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-ikm-text-secondary">
                      {reviewStaff.cv?.education?.map((edu, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F58220]" />
                          <span>{edu}</span>
                        </li>
                      )) || (
                        <li className="text-ikm-text-secondary/60">B.Eng. Mechanical Engineering</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-ikm-text text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 text-[#F58220]">
                      <Briefcase className="w-4 h-4" />
                      <span>ประสบการณ์การทำงาน (Work History)</span>
                    </h4>
                    <div className="space-y-2">
                      {reviewStaff.cv?.experiences?.map((exp, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-ikm-card border border-ikm-border text-xs space-y-1">
                          <div className="flex justify-between font-semibold text-ikm-text">
                            <span>{exp.position} - {exp.company}</span>
                            <span className="text-[#F58220] font-mono">{exp.period}</span>
                          </div>
                          <p className="text-ikm-text-secondary">{exp.description}</p>
                        </div>
                      )) || (
                        <div className="p-3 rounded-xl bg-ikm-card border border-ikm-border text-xs">
                          <p className="font-semibold text-ikm-text">{reviewStaff.role} - IKM Operations</p>
                          <p className="text-ikm-text-secondary">On-site execution and plant turnaround.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {reviewStaff.cv?.emergencyContact && (
                    <div className="pt-2 border-t border-ikm-border">
                      <h4 className="font-bold text-ikm-text text-xs uppercase tracking-wider mb-1.5 text-ikm-text-secondary">
                        ผู้ติดต่อฉุกเฉิน (Emergency Contact)
                      </h4>
                      <p className="text-xs text-ikm-text-secondary">
                        ชื่อ: <span className="font-semibold text-ikm-text">{reviewStaff.cv.emergencyContact.name}</span> ({reviewStaff.cv.emergencyContact.relation}) &bull; โทร: <span className="font-mono text-[#F58220]">{reviewStaff.cv.emergencyContact.phone}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-ikm-border flex justify-between items-center">
              <p className="text-[11px] text-ikm-text-secondary">
                {isAdminOrCountryManager ? '🔒 สิทธิ์ผู้ดูแลระบบ: สามารถเพิ่ม/ลบ Certificate ได้เต็มรูปแบบ' : '👁️ โหมดตรวจสอบข้อมูลพนักงาน'}
              </p>
              <Button onClick={() => setReviewStaff(null)} className="bg-ikm-text text-ikm-card text-xs">
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Interactive PDF Certificate Viewer & Reader                      */}
      {/* ========================================================================= */}
      {viewingPdfCert && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-300 dark:border-slate-700">
            
            {/* Top Toolbar */}
            <div className="bg-slate-800 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono">
                <FileText className="w-4 h-4 text-[#F58220]" />
                <span>{viewingPdfCert.cert.documentName || 'Certificate_Viewer.pdf'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm"
                  onClick={() => showToast(`ดาวน์โหลด ${viewingPdfCert.cert.name} PDF สำเร็จ`, 'success')}
                  className="bg-[#F58220] hover:bg-[#e07110] text-white text-xs px-3 py-1 h-7 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </Button>
                <button 
                  onClick={() => setViewingPdfCert(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Formatted Certificate Document Sheet */}
            <div className="p-8 bg-slate-50 dark:bg-slate-950 flex justify-center">
              <div className="w-full bg-white text-slate-900 p-8 rounded-lg shadow-xl border-8 border-double border-amber-800/40 relative">
                
                {/* Watermark Seal */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <Award className="w-64 h-64 text-amber-900" />
                </div>

                <div className="text-center space-y-4 relative z-10">
                  <div className="w-16 h-16 mx-auto rounded-full bg-amber-700 text-white flex items-center justify-center shadow-lg">
                    <Award className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-amber-800">
                      {viewingPdfCert.cert.issuingBody || 'International Safety Qualification Body'}
                    </h3>
                    <h2 className="text-2xl font-serif font-extrabold text-slate-900 mt-1">
                      CERTIFICATE OF COMPETENCY
                    </h2>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Certificate No: {viewingPdfCert.cert.certificateNo}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 italic">This is to certify that</p>
                  <h1 className="text-2xl font-bold text-slate-900 underline decoration-amber-600 decoration-2 underline-offset-4">
                    {viewingPdfCert.employeeName}
                  </h1>
                  <p className="text-xs text-slate-600">has successfully satisfied all competency assessments and requirements for</p>

                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 inline-block max-w-md">
                    <h3 className="font-bold text-amber-900 text-base">
                      {viewingPdfCert.cert.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-200 mt-4 text-slate-600">
                    <div>
                      <p className="font-semibold text-slate-900">Issue Date:</p>
                      <p className="font-mono">{viewingPdfCert.cert.issueDate}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Expiry Date:</p>
                      <p className="font-mono font-bold text-amber-800">{viewingPdfCert.cert.expireDate}</p>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between items-end text-xs text-slate-500">
                    <div className="text-left">
                      <div className="w-28 border-b border-slate-400 mb-1" />
                      <p>Authorized Lead Assessor</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-700 flex items-center justify-center text-[9px] font-bold text-amber-800 uppercase tracking-tighter">
                      Official Seal
                    </div>
                    <div className="text-right">
                      <div className="w-28 border-b border-slate-400 mb-1 ml-auto" />
                      <p>Registrar & Auditor</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800 flex justify-end">
              <Button onClick={() => setViewingPdfCert(null)} className="bg-slate-900 text-white text-xs">
                ปิดเอกสาร
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Add New Employee Modal                                           */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-ikm-card border border-ikm-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-ikm-border flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F58220] flex items-center justify-center text-white">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-ikm-text">{t.add}</h3>
                  <p className="text-xs text-ikm-text-secondary">เพิ่มข้อมูลพนักงาน กำหนด Username/Password และ Role สิทธิ์การใช้งาน</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-ikm-text-secondary hover:text-ikm-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4 text-sm max-h-[70vh] overflow-y-auto">
              
              {/* Row 1: Name & Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">ชื่อ-นามสกุล *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น Kittipong Mechai"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">แผนก (Department) *</label>
                  <select
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Role Title & Role Permission Level (7 User Levels) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">ตำแหน่ง (Job Title) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น Lead Mechanical Engineer, Safety Officer"
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">
                    ระดับสิทธิ์ (User Role Level) *
                  </label>
                  <select
                    value={newStaff.userLevel}
                    onChange={(e) => setNewStaff({ ...newStaff, userLevel: e.target.value as UserRole })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text font-medium focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                  >
                    {roleLevelOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Credentials (Username & Password) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-ikm-border space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-ikm-text">
                  <Lock className="w-4 h-4 text-[#F58220]" />
                  <span>ข้อมูลเข้าสู่ระบบ (Username & Password)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-ikm-text-secondary mb-1">Username</label>
                    <input
                      type="text"
                      placeholder="เช่น kittipong.m"
                      value={newStaff.username}
                      onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-ikm-card border border-ikm-border text-ikm-text text-xs focus:outline-none focus:ring-1 focus:ring-ikm-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-ikm-text-secondary mb-1">Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="รหัสผ่านเข้าสู่ระบบ"
                      value={newStaff.password}
                      onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-ikm-card border border-ikm-border text-ikm-text text-xs focus:outline-none focus:ring-1 focus:ring-ikm-orange"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Contact info (Phone & Email) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">เบอร์โทรศัพท์ (Phone)</label>
                  <input
                    type="text"
                    placeholder="081-445-5667"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">อีเมล (Email)</label>
                  <input
                    type="email"
                    placeholder="kittipong.m@ikm-ops.com"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                  />
                </div>
              </div>

              {/* Row 5: Skills (comma separated) */}
              <div>
                <label className="block text-xs font-semibold text-ikm-text mb-1.5">ทักษะความชำนาญ (คั่นด้วยจุลภาค ,)</label>
                <input
                  type="text"
                  placeholder="เช่น Piping, Welding, ASME Codes, Hydrotest"
                  value={newStaff.skills}
                  onChange={(e) => setNewStaff({ ...newStaff, skills: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-ikm-border">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  {t.cancel}
                </Button>
                <Button type="submit" className="bg-[#F58220] hover:bg-[#e07110] text-white">
                  + {t.add}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Edit Employee Profile Modal                                      */}
      {/* ========================================================================= */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-ikm-card border border-ikm-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-ikm-border flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ikm-orange flex items-center justify-center text-white">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-ikm-text">{t.edit}</h3>
                  <p className="text-xs text-ikm-text-secondary">{editingStaff.name} (ID: {editingStaff.id})</p>
                </div>
              </div>
              <button onClick={() => setEditingStaff(null)} className="text-ikm-text-secondary hover:text-ikm-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Self-service notice if editing self without admin role */}
            {isSelfEditOnly(currentUser, editingStaff.id) && (
              <div className="px-6 py-3 bg-blue-50 border-b border-blue-200 dark:bg-blue-950/40 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>{t.selfEditNotice}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-sm max-h-[70vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">ชื่อ-นามสกุล *</label>
                  <input
                    type="text"
                    required
                    value={editingStaff.name}
                    onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">สถานะความพร้อม (Availability)</label>
                  <select
                    value={editingStaff.availability}
                    onChange={(e) => setEditingStaff({ ...editingStaff, availability: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                  >
                    <option value="available">Available (พร้อมปฏิบัติงาน)</option>
                    <option value="busy">Busy (ติดภารกิจ)</option>
                    <option value="on-leave">On Leave (ลางาน)</option>
                    <option value="off-shift">Off Shift (ออกกะ)</option>
                  </select>
                </div>
              </div>

              {/* Role & User Level (Locked if not admin/country manager) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">ตำแหน่ง (Job Title)</label>
                  <input
                    type="text"
                    disabled={isSelfEditOnly(currentUser, editingStaff.id)}
                    value={editingStaff.role}
                    onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                    className={cn(
                      "w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange",
                      isSelfEditOnly(currentUser, editingStaff.id) && "bg-slate-100 dark:bg-slate-900 cursor-not-allowed opacity-70"
                    )}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">ระดับสิทธิ์ (User Role Level)</label>
                  <select
                    disabled={isSelfEditOnly(currentUser, editingStaff.id)}
                    value={editingStaff.userLevel || getUserRole(editingStaff)}
                    onChange={(e) => setEditingStaff({ ...editingStaff, userLevel: e.target.value as UserRole })}
                    className={cn(
                      "w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text font-medium focus:outline-none focus:ring-2 focus:ring-ikm-orange",
                      isSelfEditOnly(currentUser, editingStaff.id) && "bg-slate-100 dark:bg-slate-900 cursor-not-allowed opacity-70"
                    )}
                  >
                    {roleLevelOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Username & Password */}
              {!isSelfEditOnly(currentUser, editingStaff.id) && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-ikm-border space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-ikm-text">
                    <Lock className="w-4 h-4 text-[#F58220]" />
                    <span>จัดการ Username & Password</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-ikm-text-secondary mb-1">Username</label>
                      <input
                        type="text"
                        value={editingStaff.username || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, username: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-ikm-card border border-ikm-border text-ikm-text text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-ikm-text-secondary mb-1">Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={editingStaff.password || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, password: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-ikm-card border border-ikm-border text-ikm-text text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">เบอร์โทรศัพท์ (Phone)</label>
                  <input
                    type="text"
                    value={editingStaff.phone || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">อีเมล (Email)</label>
                  <input
                    type="email"
                    value={editingStaff.email || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-semibold text-ikm-text mb-1.5">ทักษะความชำนาญ (Skills)</label>
                <input
                  type="text"
                  value={Array.isArray(editingStaff.skills) ? editingStaff.skills.join(', ') : (editingStaff.skills || '')}
                  onChange={(e) => setEditingStaff({ ...editingStaff, skills: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-ikm-text mb-1.5">ประวัติและข้อมูลส่วนตัว (Bio & Profile Summary)</label>
                <textarea
                  rows={3}
                  value={editingStaff.bio || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, bio: e.target.value })}
                  placeholder="รายละเอียดประวัติส่วนตัว ทักษะและประสบการณ์..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-ikm-border">
                <Button type="button" variant="outline" onClick={() => setEditingStaff(null)}>
                  {t.cancel}
                </Button>
                <Button type="submit" className="bg-[#F58220] hover:bg-[#e07110] text-white">
                  {t.save}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: Soft-Delete / Archive Confirmation (Rule 6: preserves audit)    */}
      {/* ========================================================================= */}
      {deleteConfirmStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-ikm-card border border-ikm-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg text-ikm-text">ยืนยันการจัดเก็บพนักงาน (Archive)</h3>
              <p className="text-xs text-ikm-text-secondary">
                ต้องการจัดเก็บพนักงาน <span className="font-bold text-ikm-text">{deleteConfirmStaff.name}</span> เข้าคลังข้อมูลใช่หรือไม่?
              </p>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 text-left mt-3">
                <p className="font-semibold mb-0.5">📌 นโยบายความปลอดภัยและ Audit Trail:</p>
                <p>ระบบจะไม่ลบข้อมูลทิ้งจริง แต่จะทำการย้ายเข้าคลัง (Soft-delete Archive) เพื่อให้บันทึกประวัติการทำงานและใบงานเก่าคงความสมบูรณ์</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeleteConfirmStaff(null)}>
                ยกเลิก
              </Button>
              <Button onClick={handleArchiveStaff} className="bg-red-600 hover:bg-red-700 text-white">
                จัดเก็บเข้าคลัง (Archive)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Manager Modal */}
      {avatarModalTarget && (
        <AvatarManagerModal
          isOpen={true}
          onClose={() => setAvatarModalTarget(null)}
          currentAvatar={avatarModalTarget.avatarUrl}
          name={avatarModalTarget.name}
          avatarColor={avatarModalTarget.avatarColor}
          onSave={async (newAvatarUrl) => {
            await updateEmployee(avatarModalTarget.id, { avatarUrl: newAvatarUrl });
            setAvatarModalTarget(null);
            showToast('อัปเดตรูปภาพโปรไฟล์สำเร็จ', 'success');
          }}
        />
      )}

    </div>
  );
}
