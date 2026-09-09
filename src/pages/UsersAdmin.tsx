import React, { useState } from 'react';
import { useStore, Employee } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { 
  UserCog, Shield, Database, Plus, Search, RefreshCw, 
  CheckCircle2, Phone, Mail, Trash2, Edit3, Camera, 
  Filter, Check, X, UserCheck, AlertCircle, Award, 
  Briefcase, Building2, Upload
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { AvatarManagerModal } from '../components/ui/AvatarManagerModal';
import { cn } from '../lib/utils';

export function UsersAdmin() {
  const { 
    language, 
    employees, 
    initSupabaseData, 
    isLoadingData, 
    updateEmployee, 
    addEmployee, 
    deleteEmployee 
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Employee | null>(null);
  const [avatarModalTarget, setAvatarModalTarget] = useState<Employee | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // New staff form state
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Site Engineer',
    department: 'Engineering',
    phone: '',
    email: '',
    availability: 'available' as Employee['availability'],
    avatarUrl: '',
    skills: 'Operations, Field Inspection',
    score: 90,
  });

  const t = {
    EN: {
      title: 'Employee & Personnel Management',
      subtitle: 'Admin portal for managing real employee profiles, roles, avatars, and Supabase user_profiles',
      users: 'Employee',
      role: 'Role & Skills',
      dept: 'Department',
      status: 'Availability',
      contact: 'Contact Info',
      score: 'Score',
      actions: 'Actions',
      add: 'Add New Employee',
      sync: 'Sync Supabase',
      syncing: 'Syncing...',
      searchPlaceholder: 'Search by name, role, department, phone...',
      allDepts: 'All Departments',
      allStatuses: 'All Statuses',
      active: 'Available',
      busy: 'Busy / On-Duty',
      onLeave: 'On Leave',
      offShift: 'Off Shift',
      edit: 'Edit Profile',
      delete: 'Delete',
      changePhoto: 'Change / Remove Photo',
      save: 'Save to Supabase',
      saving: 'Saving to Supabase...',
      cancel: 'Cancel',
      deleteConfirm: 'Are you sure you want to delete this employee from Supabase?',
      saveSuccess: 'Employee profile updated successfully in Supabase',
      addSuccess: 'New employee created and saved to Supabase',
      deleteSuccess: 'Employee deleted from Supabase',
      photoUpdated: 'Avatar photo updated successfully',
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
      sync: 'ซิงค์ข้อมูล Supabase',
      syncing: 'กำลังซิงค์...',
      searchPlaceholder: 'ค้นหาด้วยชื่อ, ตำแหน่ง, แผนก, หรือเบอร์โทร...',
      allDepts: 'ทุกแผนก',
      allStatuses: 'ทุกสถานะ',
      active: 'พร้อมปฏิบัติงาน',
      busy: 'ติดภารกิจ',
      onLeave: 'ลางาน',
      offShift: 'ออกกะ',
      edit: 'แก้ไขข้อมูล',
      delete: 'ลบพนักงาน',
      changePhoto: 'เปลี่ยน/ลบรูปโปรไฟล์',
      save: 'บันทึกลง Supabase',
      saving: 'กำลังบันทึกลง Supabase...',
      cancel: 'ยกเลิก',
      deleteConfirm: 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลพนักงานท่านนี้ออกจาก Supabase?',
      saveSuccess: 'บันทึกการแก้ไขข้อมูลพนักงานลง Supabase สำเร็จ',
      addSuccess: 'เพิ่มพนักงานใหม่ลงใน Supabase สำเร็จ',
      deleteSuccess: 'ลบข้อมูลพนักงานออกจาก Supabase สำเร็จ',
      photoUpdated: 'อัปเดตรูปโปรไฟล์พนักงานสำเร็จ',
    }
  }[language];

  // Show auto-dismissing toast
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Departments list dynamically gathered + defaults
  const defaultDepartments = ['Engineering', 'Maintenance', 'Operations', 'Safety & HSE', 'Logistics', 'Management', 'SCADA & Automation', 'Quality Assurance'];
  const departments = Array.from(new Set([...defaultDepartments, ...employees.map(e => e.department).filter(Boolean)]));

  const roleSuggestions = [
    'Site Manager',
    'Lead Mechanical Engineer',
    'Senior Electrical Engineer',
    'Safety & HSE Officer',
    'Operations Supervisor',
    'SCADA Specialist',
    'Maintenance Technician',
    'Project Coordinator'
  ];

  // Filtered employees
  const filteredEmployees = employees.filter(e => {
    const matchesSearch = !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()) ||
      (e.phone && e.phone.includes(search)) ||
      (e.email && e.email.toLowerCase().includes(search.toLowerCase()));

    const matchesDept = selectedDept === 'all' || e.department === selectedDept;
    const matchesStatus = selectedStatus === 'all' || e.availability === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Handle Create Staff
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name.trim()) return;

    const colors = ['#F58220', '#16794B', '#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#06B6D4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const skillsArray = newStaff.skills.split(',').map(s => s.trim()).filter(Boolean);

    const created: Employee = {
      id: `emp-${Date.now().toString().slice(-4)}-${Math.random().toString(36).slice(2, 6)}`,
      name: newStaff.name.trim(),
      role: newStaff.role,
      department: newStaff.department,
      avatarColor: randomColor,
      avatarUrl: newStaff.avatarUrl.trim() || undefined,
      availability: newStaff.availability,
      utilization: 75,
      score: Number(newStaff.score) || 90,
      skills: skillsArray.length > 0 ? skillsArray : [newStaff.role, newStaff.department],
      phone: newStaff.phone.trim() || '08' + Math.floor(10000000 + Math.random() * 90000000),
      email: newStaff.email.trim() || `${newStaff.name.toLowerCase().replace(/\s+/g, '.')}@ikm-ops.com`,
    };

    await addEmployee(created);
    setIsAddModalOpen(false);
    setNewStaff({
      name: '',
      role: 'Site Engineer',
      department: 'Engineering',
      phone: '',
      email: '',
      availability: 'available',
      avatarUrl: '',
      skills: 'Operations, Field Inspection',
      score: 90,
    });
    showToast(t.addSuccess);
  };

  // Handle Save Edited Staff
  const handleSaveEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    await updateEmployee(editingStaff.id, editingStaff);
    setEditingStaff(null);
    showToast(t.saveSuccess);
  };

  // Handle Delete Staff
  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`${t.deleteConfirm} (${name})`)) return;
    await deleteEmployee(id);
    showToast(t.deleteSuccess);
  };

  // Handle Avatar Update from Modal
  const handleSaveAvatar = async (newUrl: string | undefined) => {
    if (!avatarModalTarget) return;

    await updateEmployee(avatarModalTarget.id, {
      avatarUrl: newUrl,
    });

    // Also update if editingStaff is active
    if (editingStaff && editingStaff.id === avatarModalTarget.id) {
      setEditingStaff({
        ...editingStaff,
        avatarUrl: newUrl,
      });
    }

    setAvatarModalTarget(null);
    showToast(t.photoUpdated);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 space-y-6 max-w-7xl mx-auto pb-24">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{notification}</span>
        </div>
      )}

      {/* Supabase Connection Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-ikm-card p-4 rounded-2xl border border-gray-100 dark:border-ikm-border shadow-xs">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 dark:text-ikm-text">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <span>ตารางข้อมูล: <strong className="font-mono text-emerald-700">public.user_profiles</strong> · จำนวนพนักงาน: <strong className="text-gray-900 dark:text-white font-bold">{employees.length}</strong> คน</span>
            <p className="text-[11px] text-gray-400 font-normal">ระบบบันทึกรูปภาพและข้อมูลพนักงานลง Supabase Database อัตโนมัติแบบเรียลไทม์</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => initSupabaseData()}
          disabled={isLoadingData}
          className="flex items-center gap-1.5 text-xs h-8 text-gray-700 dark:text-ikm-text"
        >
          <RefreshCw className={cn("w-3.5 h-3.5 text-ikm-orange", isLoadingData && "animate-spin")} />
          <span>{isLoadingData ? t.syncing : t.sync}</span>
        </Button>
      </div>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-ikm-text tracking-tight">{t.title}</h1>
            <p className="text-xs text-gray-500 dark:text-ikm-text-secondary mt-0.5">{t.subtitle}</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-ikm-orange hover:bg-ikm-orange-dark text-white text-xs font-bold h-10 px-4 rounded-xl shadow-md shadow-ikm-orange/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.add}</span>
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-card text-xs text-gray-800 dark:text-ikm-text focus:border-ikm-orange outline-none shadow-xs"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-card text-xs text-gray-700 dark:text-ikm-text outline-none focus:border-ikm-orange shadow-xs"
          >
            <option value="all">{t.allDepts}</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-card text-xs text-gray-700 dark:text-ikm-text outline-none focus:border-ikm-orange shadow-xs"
          >
            <option value="all">{t.allStatuses}</option>
            <option value="available">🟢 {t.active}</option>
            <option value="busy">🟠 {t.busy}</option>
            <option value="on-leave">🔴 {t.onLeave}</option>
            <option value="off-shift">⚪ {t.offShift}</option>
          </select>
        </div>
      </div>

      {/* Employees Table Card */}
      <Card className="overflow-hidden border border-gray-100 dark:border-ikm-border bg-white dark:bg-ikm-card shadow-sm rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-ikm-bg text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-ikm-border font-bold">
              <tr>
                <th className="px-5 py-3.5">{t.users}</th>
                <th className="px-5 py-3.5">{t.role}</th>
                <th className="px-5 py-3.5">{t.dept}</th>
                <th className="px-5 py-3.5">{t.contact}</th>
                <th className="px-5 py-3.5">{t.status}</th>
                <th className="px-5 py-3.5">{t.score}</th>
                <th className="px-5 py-3.5 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-ikm-border">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <UserCog className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold">ไม่พบข้อมูลพนักงานที่ตรงกับเงื่อนไขการค้นหา</p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/70 dark:hover:bg-ikm-bg/50 transition-colors">
                    
                    {/* User Profile & Avatar Click to Edit */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="relative group cursor-pointer"
                          onClick={() => setAvatarModalTarget(u)}
                          title={t.changePhoto}
                        >
                          <Avatar
                            src={u.avatarUrl}
                            fallback={u.name.charAt(0)}
                            backgroundColor={u.avatarColor || '#F58220'}
                            className="w-11 h-11 ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-ikm-orange transition-all"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                            <Camera className="w-4 h-4" />
                          </div>
                        </div>

                        <div 
                          className="cursor-pointer group/name" 
                          onClick={() => setEditingStaff(u)}
                          title="คลิกเพื่อแก้ไขข้อมูลพนักงานนี้"
                        >
                          <div className="font-bold text-gray-900 dark:text-ikm-text flex items-center gap-1.5 group-hover/name:text-ikm-orange transition-colors">
                            <span>{u.name}</span>
                            <Edit3 className="w-3 h-3 opacity-0 group-hover/name:opacity-100 text-ikm-orange transition-opacity" />
                            {u.role.toLowerCase().includes('manager') && (
                              <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-1.5 py-0.5 rounded-full font-bold">
                                Manager
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                            ID: {u.id.length > 14 ? `${u.id.slice(0, 8)}...` : u.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Skills */}
                    <td 
                      className="px-5 py-4 cursor-pointer group/role"
                      onClick={() => setEditingStaff(u)}
                      title="คลิกเพื่อแก้ไขตำแหน่งและงาน"
                    >
                      <div className="font-semibold text-gray-800 dark:text-ikm-text group-hover/role:text-ikm-orange transition-colors flex items-center gap-1">
                        <span>{u.role}</span>
                        <Edit3 className="w-3 h-3 opacity-0 group-hover/role:opacity-100 text-ikm-orange transition-opacity" />
                      </div>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {u.skills?.slice(0, 3).map((sk, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Department */}
                    <td 
                      className="px-5 py-4 cursor-pointer group/dept"
                      onClick={() => setEditingStaff(u)}
                      title="คลิกเพื่อแก้ไขแผนก"
                    >
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-ikm-orange/10 text-ikm-orange group-hover/dept:bg-ikm-orange group-hover/dept:text-white transition-colors">
                        <span>{u.department}</span>
                        <Edit3 className="w-3 h-3 opacity-0 group-hover/dept:opacity-100 transition-opacity" />
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4 text-gray-600 dark:text-ikm-text-secondary">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{u.phone || '081-998-8776'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate max-w-[140px]">{u.email || `${u.name.toLowerCase().replace(/\s+/g, '.')}@ikm-ops.com`}</span>
                        </div>
                      </div>
                    </td>

                    {/* Availability toggle */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => {
                          const nextAvail: Employee['availability'] = 
                            u.availability === 'available' ? 'busy' : 
                            u.availability === 'busy' ? 'on-leave' : 
                            u.availability === 'on-leave' ? 'off-shift' : 'available';
                          updateEmployee(u.id, { availability: nextAvail });
                        }}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all active:scale-95 shadow-2xs",
                          u.availability === 'available' && "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
                          u.availability === 'busy' && "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100",
                          u.availability === 'on-leave' && "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100",
                          u.availability === 'off-shift' && "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200",
                        )}
                        title="Click to toggle status"
                      >
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          u.availability === 'available' && "bg-emerald-500",
                          u.availability === 'busy' && "bg-amber-500",
                          u.availability === 'on-leave' && "bg-rose-500",
                          u.availability === 'off-shift' && "bg-gray-400",
                        )} />
                        <span className="capitalize">{u.availability}</span>
                      </button>
                    </td>

                    {/* KPI Score */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-ikm-text">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>{u.score || 90}</span>
                        <span className="text-[10px] text-gray-400 font-normal">/100</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setAvatarModalTarget(u)}
                          className="p-1.5 text-gray-400 hover:text-ikm-orange rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title={t.changePhoto}
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingStaff(u)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title={t.edit}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(u.id, u.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title={t.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD STAFF MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg p-6 space-y-4 bg-white dark:bg-ikm-card border border-gray-100 dark:border-ikm-border shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-ikm-border pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-ikm-text flex items-center gap-2">
                <UserCog className="w-5 h-5 text-ikm-orange" />
                <span>{t.add}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              
              {/* Avatar Preview & Upload in Add Form */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-ikm-bg border border-gray-200/80 flex items-center gap-4">
                <Avatar
                  src={newStaff.avatarUrl}
                  fallback={newStaff.name ? newStaff.name.charAt(0) : 'N'}
                  className="w-14 h-14 ring-2 ring-white shadow-sm"
                />
                <div className="flex-1 space-y-1.5">
                  <label className="block font-bold text-gray-700 dark:text-ikm-text">
                    รูปโปรไฟล์ / อวตาร (Avatar Image)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newStaff.avatarUrl}
                      onChange={(e) => setNewStaff({ ...newStaff, avatarUrl: e.target.value })}
                      placeholder="ใส่ URL รูปภาพ หรือเลือกไฟล์"
                      className="flex-1 h-8 px-2.5 rounded-lg border border-gray-200 dark:border-ikm-border bg-white text-xs outline-none"
                    />
                    {newStaff.avatarUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewStaff({ ...newStaff, avatarUrl: '' })}
                        className="h-8 px-2 text-red-600 border-red-200"
                      >
                        ลบรูป
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1">
                    ชื่อ-นามสกุล (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    placeholder="e.g. สมชาย สุขสันต์"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-bg outline-none focus:border-ikm-orange"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1">
                    ตำแหน่ง (Role) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    placeholder="e.g. Lead Mechanical Engineer"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-bg outline-none focus:border-ikm-orange"
                  />
                </div>
              </div>

              {/* Department & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1">
                    แผนก (Department)
                  </label>
                  <select
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-bg outline-none focus:border-ikm-orange"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1">
                    สถานะการทำงาน (Availability)
                  </label>
                  <select
                    value={newStaff.availability}
                    onChange={(e) => setNewStaff({ ...newStaff, availability: e.target.value as any })}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-bg outline-none focus:border-ikm-orange"
                  >
                    <option value="available">🟢 พร้อมปฏิบัติงาน (Available)</option>
                    <option value="busy">🟠 ติดภารกิจ (Busy)</option>
                    <option value="on-leave">🔴 ลางาน (On Leave)</option>
                    <option value="off-shift">⚪ ออกกะ (Off Shift)</option>
                  </select>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1">
                    เบอร์โทรศัพท์ (Phone)
                  </label>
                  <input
                    type="tel"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    placeholder="081-234-5678"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-bg outline-none focus:border-ikm-orange"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1">
                    อีเมล (Email)
                  </label>
                  <input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="staff@ikm-ops.com"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-bg outline-none focus:border-ikm-orange"
                  />
                </div>
              </div>

              {/* Skills & KPI */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1">
                    ทักษะความชำนาญ (Skills)
                  </label>
                  <input
                    type="text"
                    value={newStaff.skills}
                    onChange={(e) => setNewStaff({ ...newStaff, skills: e.target.value })}
                    placeholder="คั่นด้วยเครื่องหมายจุลภาค เช่น Turbine, SCADA, Safety"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-bg outline-none focus:border-ikm-orange"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1">
                    คะแนน KPI (Score)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newStaff.score}
                    onChange={(e) => setNewStaff({ ...newStaff, score: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-bg outline-none focus:border-ikm-orange font-bold"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-ikm-border">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-9 px-4 text-xs"
                >
                  {t.cancel}
                </Button>
                <Button 
                  type="submit"
                  className="h-9 px-5 bg-ikm-orange hover:bg-ikm-orange-dark text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{t.save}</span>
                </Button>
              </div>

            </form>
          </Card>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {editingStaff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg p-6 space-y-4 bg-white dark:bg-ikm-card border border-gray-100 dark:border-ikm-border shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-ikm-border pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-ikm-text flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-ikm-orange" />
                <span>{t.edit} : {editingStaff.name}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setEditingStaff(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStaff} className="space-y-4 text-xs">
              
              {/* Avatar Preview & Action */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-ikm-bg border border-gray-200/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={editingStaff.avatarUrl}
                    fallback={editingStaff.name ? editingStaff.name.charAt(0) : 'U'}
                    backgroundColor={editingStaff.avatarColor}
                    className="w-14 h-14 ring-2 ring-white shadow-sm"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-ikm-text">{editingStaff.name}</h4>
                    <p className="text-[11px] text-gray-500">
                      {editingStaff.avatarUrl ? 'มีรูปโปรไฟล์พนักงาน' : 'ใช้ป้ายตัวย่อชื่อเริ่มต้น'}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAvatarModalTarget(editingStaff)}
                  className="text-xs h-8 px-3 border-gray-300"
                >
                  <Camera className="w-3.5 h-3.5 mr-1 text-ikm-orange" />
                  <span>{t.changePhoto}</span>
                </Button>
              </div>

              {/* Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1">
                    ชื่อ-นามสกุล (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStaff.name}
                    onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-bg outline-none focus:border-ikm-orange font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1">
                    ตำแหน่ง (Role / Position) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStaff.role}
                    onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-bg outline-none focus:border-ikm-orange font-semibold"
                  />
                </div>
              </div>

              {/* Role Suggestions */}
              <div>
                <span className="text-[10px] text-gray-400 block mb-1">เลือกตำแหน่งแนะนำ:</span>
                <div className="flex flex-wrap gap-1">
                  {roleSuggestions.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setEditingStaff({ ...editingStaff, role: r })}
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] border transition-colors",
                        editingStaff.role === r 
                          ? "bg-ikm-orange text-white border-ikm-orange" 
                          : "bg-gray-50 dark:bg-ikm-bg text-gray-600 dark:text-gray-300 border-gray-200 dark:border-ikm-border hover:border-ikm-orange"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Department & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-gray-700 dark:text-ikm-text">
                      แผนก (Department) *
                    </label>
                  </div>
                  <input
                    type="text"
                    list="departments-list"
                    value={editingStaff.department}
                    onChange={(e) => setEditingStaff({ ...editingStaff, department: e.target.value })}
                    placeholder="เลือกหรือพิมพ์ชื่อแผนก"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-bg outline-none focus:border-ikm-orange font-semibold"
                  />
                  <datalist id="departments-list">
                    {departments.map((dept) => (
                      <option key={dept} value={dept} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1">
                    สถานะ (Availability)
                  </label>
                  <select
                    value={editingStaff.availability}
                    onChange={(e) => setEditingStaff({ ...editingStaff, availability: e.target.value as any })}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-bg outline-none focus:border-ikm-orange"
                  >
                    <option value="available">🟢 พร้อมปฏิบัติงาน (Available)</option>
                    <option value="busy">🟠 ติดภารกิจ (Busy)</option>
                    <option value="on-leave">🔴 ลางาน (On Leave)</option>
                    <option value="off-shift">⚪ ออกกะ (Off Shift)</option>
                  </select>
                </div>
              </div>

              {/* Job Tasks / Skills / Responsibilities */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1">
                  งานที่รับผิดชอบ / ทักษะความชำนาญ (Job Tasks & Skills)
                </label>
                <input
                  type="text"
                  value={editingStaff.skills ? editingStaff.skills.join(', ') : ''}
                  onChange={(e) => {
                    const parsed = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setEditingStaff({ ...editingStaff, skills: parsed });
                  }}
                  placeholder="คั่นด้วยเครื่องหมายจุลภาค เช่น Turbine Overhaul, SCADA, Safety Inspection"
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-bg outline-none focus:border-ikm-orange"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1">
                    เบอร์โทรศัพท์ (Phone)
                  </label>
                  <input
                    type="tel"
                    value={editingStaff.phone || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-bg outline-none focus:border-ikm-orange"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1">
                    อีเมล (Email)
                  </label>
                  <input
                    type="email"
                    value={editingStaff.email || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-bg outline-none focus:border-ikm-orange"
                  />
                </div>
              </div>

              {/* Score */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1">
                  คะแนนประสิทธิภาพ KPI (0 - 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingStaff.score || 90}
                  onChange={(e) => setEditingStaff({ ...editingStaff, score: Number(e.target.value) })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-bg outline-none focus:border-ikm-orange font-bold"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-ikm-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDeleteStaff(editingStaff.id, editingStaff.name)}
                  className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-9 px-3"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span>{t.delete}</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setEditingStaff(null)}
                    className="h-9 px-4 text-xs"
                  >
                    {t.cancel}
                  </Button>
                  <Button 
                    type="submit"
                    className="h-9 px-5 bg-ikm-orange hover:bg-ikm-orange-dark text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t.save}</span>
                  </Button>
                </div>
              </div>

            </form>
          </Card>
        </div>
      )}

      {/* DEDICATED AVATAR MANAGER MODAL */}
      {avatarModalTarget && (
        <AvatarManagerModal
          isOpen={Boolean(avatarModalTarget)}
          onClose={() => setAvatarModalTarget(null)}
          currentAvatar={avatarModalTarget.avatarUrl}
          name={avatarModalTarget.name}
          avatarColor={avatarModalTarget.avatarColor}
          onSave={handleSaveAvatar}
        />
      )}

    </div>
  );
}
