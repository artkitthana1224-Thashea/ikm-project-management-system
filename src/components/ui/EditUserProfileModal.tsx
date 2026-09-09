import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { 
  User, Briefcase, Building2, Phone, Mail, Sparkles, 
  Camera, Upload, Trash2, Link as LinkIcon, Check, X, 
  Layers, CheckCircle2, AlertCircle, Edit3, Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface EditUserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const COMMON_DEPARTMENTS = [
  'Engineering',
  'Maintenance',
  'Operations',
  'Safety & HSE',
  'Logistics',
  'Management',
  'SCADA & Automation',
  'Quality Assurance',
];

const PRESET_ROLES = [
  'Site Manager',
  'Lead Mechanical Engineer',
  'Senior Electrical Engineer',
  'Safety & HSE Officer',
  'Operations Supervisor',
  'SCADA Specialist',
  'Maintenance Technician',
  'Project Coordinator',
];

const PRESET_AVATARS = [
  { id: 'eng-1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', label: 'Engineer 1' },
  { id: 'eng-2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', label: 'Engineer 2' },
  { id: 'eng-3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', label: 'Technician' },
  { id: 'eng-4', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', label: 'Safety Officer' },
  { id: 'eng-5', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80', label: 'Manager' },
  { id: 'eng-6', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80', label: 'Supervisor' },
  { id: 'eng-7', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', label: 'Inspector' },
  { id: 'eng-8', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80', label: 'Operations' },
];

export function EditUserProfileModal({ isOpen, onClose, title }: EditUserProfileModalProps) {
  const { user, language, updateUserProfile } = useStore();
  
  const [activeTab, setActiveTab] = useState<'info' | 'photo'>('info');
  const [photoSubTab, setPhotoSubTab] = useState<'upload' | 'url' | 'presets'>('upload');
  
  // Form fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [customDeptInput, setCustomDeptInput] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>('');
  
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setRole(user.role || '');
      const dept = user.department || 'Engineering';
      if (COMMON_DEPARTMENTS.includes(dept)) {
        setDepartment(dept);
        setIsCustomDept(false);
      } else {
        setDepartment(dept);
        setIsCustomDept(true);
        setCustomDeptInput(dept);
      }
      setSkillsText(user.skills ? user.skills.join(', ') : 'Project Management, Inspection, Operations');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setAvatarUrl(user.avatar);
      setCustomUrlInput('');
      setSaveSuccess(false);
      setErrorMessage(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const t = {
    EN: {
      modalTitle: title || 'Edit User Profile & Role',
      subtitle: 'Modify name, position, assigned work/skills, department and avatar synced with Supabase',
      tabInfo: 'Personal & Job Info',
      tabPhoto: 'Profile Photo / Avatar',
      nameLabel: 'Full Name',
      roleLabel: 'Position / Role',
      deptLabel: 'Department',
      customDeptLabel: 'Custom Department Name',
      skillsLabel: 'Assigned Work / Skills / Responsibilities',
      skillsHint: 'Separate skills or responsibilities with commas (e.g. Field Inspection, Turbine Overhaul)',
      phoneLabel: 'Phone Number',
      emailLabel: 'Email Address',
      saveBtn: 'Save Changes to Supabase',
      savingBtn: 'Saving to Supabase...',
      cancelBtn: 'Cancel',
      successMsg: 'Profile updated and saved to Supabase successfully!',
      selectPresetRole: 'Quick Suggestions:',
      orTypeCustom: 'Or type custom role',
      customDeptToggle: '+ Add Custom Department',
      presetDeptToggle: 'Select from standard list',
      uploadTab: 'Upload Image',
      urlTab: 'Image URL',
      presetsTab: 'Presets',
      dragDrop: 'Drag and drop an image here, or click to browse',
      chooseFile: 'Choose Image File',
      removePhoto: 'Remove Photo',
      photoRemoved: 'Photo will be removed on save',
    },
    TH: {
      modalTitle: title || 'แก้ไขข้อมูลส่วนตัว ตำแหน่ง งาน และแผนก',
      subtitle: 'แก้ไขชื่อ ตำแหน่ง หน้าที่รับผิดชอบ แผนก และรูปโปรไฟล์ บันทึกลง Supabase ทันที',
      tabInfo: 'ข้อมูลพนักงาน & งาน',
      tabPhoto: 'รูปโปรไฟล์ / อวตาร',
      nameLabel: 'ชื่อ-นามสกุล',
      roleLabel: 'ตำแหน่ง (Position / Role)',
      deptLabel: 'แผนก (Department)',
      customDeptLabel: 'ระบุชื่อแผนกใหม่',
      skillsLabel: 'งานที่รับผิดชอบ / ทักษะความชำนาญ (Job / Skills)',
      skillsHint: 'ใส่หน้าที่รับผิดชอบหรือทักษะ คั่นด้วยเครื่องหมายจุลภาค เช่น งานบำรุงรักษา, ตรวจสอบความปลอดภัย, SCADA',
      phoneLabel: 'เบอร์โทรศัพท์',
      emailLabel: 'อีเมล',
      saveBtn: 'บันทึกข้อมูลลง Supabase',
      savingBtn: 'กำลังบันทึกลง Supabase...',
      cancelBtn: 'ยกเลิก',
      successMsg: 'บันทึกการแก้ไขข้อมูลลง Supabase เรียบร้อยแล้ว!',
      selectPresetRole: 'ตำแหน่งแนะนำ:',
      orTypeCustom: 'หรือพิมพ์ตำแหน่งตามต้องการ',
      customDeptToggle: '+ ระบุชื่อแผนกใหม่',
      presetDeptToggle: 'เลือกจากแผนกมาตรฐาน',
      uploadTab: 'อัปโหลดรูปจากเครื่อง',
      urlTab: 'ใส่ลิงก์รูปภาพ (URL)',
      presetsTab: 'รูปโปรไฟล์สำเร็จรูป',
      dragDrop: 'ลากและวางรูปภาพที่นี่ หรือคลิกเพื่อเลือกไฟล์',
      chooseFile: 'เลือกไฟล์รูปภาพ',
      removePhoto: 'ลบรูปภาพโปรไฟล์',
      photoRemoved: 'ระบบจะลบรูปและใช้ตัวอักษรย่อเมื่อกดบันทึก',
    }
  }[language];

  // Image file processing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage(language === 'TH' ? 'กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, WebP)' : 'Please select a valid image file');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage(language === 'TH' ? 'ขนาดไฟล์ใหญ่เกิน 8MB' : 'File is too large (max 8MB)');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarUrl(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const handleApplyUrl = () => {
    if (!customUrlInput.trim()) return;
    setAvatarUrl(customUrlInput.trim());
    setCustomUrlInput('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage(language === 'TH' ? 'กรุณาระบุชื่อ-นามสกุล' : 'Name is required');
      return;
    }

    const finalDept = isCustomDept ? customDeptInput.trim() || department : department;
    const skillsArray = skillsText.split(',').map(s => s.trim()).filter(Boolean);

    try {
      setIsSaving(true);
      setErrorMessage(null);

      await updateUserProfile({
        name: name.trim(),
        role: role.trim() || 'Site Engineer',
        department: finalDept || 'Engineering',
        avatar: avatarUrl,
        skills: skillsArray.length > 0 ? skillsArray : undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      });

      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setErrorMessage(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 md:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-ikm-card border border-gray-100 dark:border-ikm-border shadow-2xl rounded-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-gray-100 dark:border-ikm-border flex items-center justify-between bg-gradient-to-r from-gray-50/80 to-white dark:from-ikm-bg dark:to-ikm-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ikm-orange/10 text-ikm-orange flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-ikm-text">
                {t.modalTitle}
              </h3>
              <p className="text-xs text-gray-500 dark:text-ikm-text-secondary line-clamp-1">
                {t.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview Card Bar */}
        <div className="px-5 py-3.5 bg-ikm-orange/5 dark:bg-ikm-orange/10 border-b border-ikm-orange/15 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('photo')}>
              <Avatar
                src={avatarUrl}
                fallback={name ? name.charAt(0) : 'U'}
                className="w-12 h-12 ring-2 ring-ikm-orange shadow-sm shrink-0"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900 dark:text-ikm-text truncate">
                  {name || 'ชื่อพนักงาน'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-ikm-orange/20 text-ikm-orange">
                  {isCustomDept ? (customDeptInput || 'แผนกใหม่') : (department || 'Engineering')}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium truncate">
                {role || 'ตำแหน่ง'}
              </p>
            </div>
          </div>

          <div className="flex gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                activeTab === 'info'
                  ? "bg-ikm-orange text-white shadow-xs"
                  : "bg-white dark:bg-ikm-bg text-gray-600 dark:text-gray-300 hover:bg-gray-100"
              )}
            >
              {t.tabInfo}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('photo')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'photo'
                  ? "bg-ikm-orange text-white shadow-xs"
                  : "bg-white dark:bg-ikm-bg text-gray-600 dark:text-gray-300 hover:bg-gray-100"
              )}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{t.tabPhoto}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 text-xs">
          
          {/* Messages */}
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-2.5 text-red-600 dark:text-red-400 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{t.successMsg}</span>
            </div>
          )}

          {/* TAB 1: PERSONAL & JOB INFO */}
          {activeTab === 'info' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Name & Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-ikm-orange" />
                    <span>{t.nameLabel} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น สมชาย สุขสันต์ (Somchai Suksan)"
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-ikm-border bg-gray-50/50 dark:bg-ikm-bg text-sm font-semibold outline-none focus:border-ikm-orange focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-ikm-orange" />
                    <span>{t.roleLabel} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="เช่น Site Manager, Lead Mechanical Engineer"
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-ikm-border bg-gray-50/50 dark:bg-ikm-bg text-sm font-semibold outline-none focus:border-ikm-orange focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Role Suggestions */}
              <div>
                <span className="text-[11px] font-semibold text-gray-500 mb-1.5 block">
                  {t.selectPresetRole}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border",
                        role === r
                          ? "bg-ikm-orange text-white border-ikm-orange"
                          : "bg-gray-50 dark:bg-ikm-bg text-gray-600 dark:text-gray-300 border-gray-200 dark:border-ikm-border hover:border-ikm-orange"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Department */}
              <div className="p-4 rounded-xl border border-gray-100 dark:border-ikm-border bg-gray-50/60 dark:bg-ikm-bg/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-700 dark:text-ikm-text flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-ikm-orange" />
                    <span>{t.deptLabel} *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomDept(!isCustomDept);
                      if (!isCustomDept && !customDeptInput) setCustomDeptInput(department);
                    }}
                    className="text-xs font-bold text-ikm-orange hover:underline"
                  >
                    {isCustomDept ? t.presetDeptToggle : t.customDeptToggle}
                  </button>
                </div>

                {!isCustomDept ? (
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-card text-sm font-semibold outline-none focus:border-ikm-orange"
                  >
                    {COMMON_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customDeptInput}
                      onChange={(e) => setCustomDeptInput(e.target.value)}
                      placeholder="พิมพ์ชื่อแผนกใหม่ เช่น Automation, Field Logistics"
                      className="flex-1 h-10 px-3.5 rounded-xl border border-ikm-orange bg-white dark:bg-ikm-card text-sm font-semibold outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Job Tasks / Skills / Responsibilities */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-ikm-orange" />
                  <span>{t.skillsLabel}</span>
                </label>
                <p className="text-[11px] text-gray-500 dark:text-ikm-text-secondary mb-1.5">
                  {t.skillsHint}
                </p>
                <textarea
                  rows={2}
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="เช่น Site Inspection, Gas Turbine, SCADA Control, Safety HSE Audit"
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-ikm-border bg-gray-50/50 dark:bg-ikm-bg text-xs outline-none focus:border-ikm-orange focus:bg-white resize-none font-medium leading-relaxed"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-ikm-orange" />
                    <span>{t.phoneLabel}</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081-234-5678"
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-ikm-border bg-gray-50/50 dark:bg-ikm-bg text-xs outline-none focus:border-ikm-orange focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-ikm-text mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-ikm-orange" />
                    <span>{t.emailLabel}</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@ikm-ops.com"
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-ikm-border bg-gray-50/50 dark:bg-ikm-bg text-xs outline-none focus:border-ikm-orange focus:bg-white"
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PROFILE PHOTO / AVATAR */}
          {activeTab === 'photo' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Photo Subtabs */}
              <div className="flex border-b border-gray-200 dark:border-ikm-border gap-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPhotoSubTab('upload')}
                  className={cn(
                    "pb-2.5 flex items-center gap-1.5 border-b-2 transition-all",
                    photoSubTab === 'upload'
                      ? "border-ikm-orange text-ikm-orange"
                      : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t.uploadTab}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPhotoSubTab('url')}
                  className={cn(
                    "pb-2.5 flex items-center gap-1.5 border-b-2 transition-all",
                    photoSubTab === 'url'
                      ? "border-ikm-orange text-ikm-orange"
                      : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{t.urlTab}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPhotoSubTab('presets')}
                  className={cn(
                    "pb-2.5 flex items-center gap-1.5 border-b-2 transition-all",
                    photoSubTab === 'presets'
                      ? "border-ikm-orange text-ikm-orange"
                      : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.presetsTab}</span>
                </button>
              </div>

              {/* Subtab: Upload */}
              {photoSubTab === 'upload' && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer",
                    isDragging 
                      ? "border-ikm-orange bg-ikm-orange/5" 
                      : "border-gray-200 dark:border-ikm-border hover:border-ikm-orange bg-gray-50/50 dark:bg-ikm-bg"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="w-12 h-12 rounded-full bg-ikm-orange/10 text-ikm-orange mx-auto flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-gray-800 dark:text-ikm-text mb-1">
                    {t.chooseFile}
                  </p>
                  <p className="text-[11px] text-gray-400 mb-3">
                    {t.dragDrop}
                  </p>
                  <span className="inline-block px-3 py-1 rounded-full bg-white dark:bg-ikm-card border border-gray-200 dark:border-ikm-border text-[10px] text-gray-500">
                    PNG, JPG, WebP สูงสุด 8MB (บีบอัดอัตโนมัติ)
                  </span>
                </div>
              )}

              {/* Subtab: URL */}
              {photoSubTab === 'url' && (
                <div className="space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-ikm-bg border border-gray-200 dark:border-ikm-border">
                  <label className="block font-bold text-gray-700 dark:text-ikm-text">
                    ใส่ลิงก์รูปภาพโดยตรง (Direct Image URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="flex-1 h-9 px-3 rounded-lg border border-gray-200 dark:border-ikm-border bg-white dark:bg-ikm-card text-xs outline-none focus:border-ikm-orange"
                    />
                    <Button
                      type="button"
                      onClick={handleApplyUrl}
                      className="h-9 px-4 bg-ikm-orange text-white text-xs font-bold"
                    >
                      ปรับใช้
                    </Button>
                  </div>
                </div>
              )}

              {/* Subtab: Presets */}
              {photoSubTab === 'presets' && (
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {PRESET_AVATARS.map((p) => {
                    const isSelected = avatarUrl === p.url;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setAvatarUrl(p.url)}
                        className={cn(
                          "relative rounded-xl overflow-hidden p-1 border-2 transition-all group flex flex-col items-center",
                          isSelected ? "border-ikm-orange scale-105 shadow-sm" : "border-transparent hover:border-gray-300"
                        )}
                      >
                        <Avatar
                          src={p.url}
                          fallback={p.label.charAt(0)}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <span className="text-[9px] text-gray-500 mt-1 truncate w-full text-center">
                          {p.label}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-ikm-orange text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Remove Photo Option */}
              {avatarUrl && (
                <div className="pt-2 flex justify-between items-center border-t border-gray-100 dark:border-ikm-border">
                  <span className="text-xs text-gray-500 font-medium">ต้องการใช้ตัวอักษรย่อแทนรูปภาพ?</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAvatarUrl(undefined)}
                    className="text-xs h-8 text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.removePhoto}</span>
                  </Button>
                </div>
              )}

            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-ikm-border flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-4 text-xs font-semibold"
            >
              {t.cancelBtn}
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 px-6 bg-ikm-orange hover:bg-ikm-orange-dark text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
            >
              {isSaving ? (
                <span>{t.savingBtn}</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t.saveBtn}</span>
                </>
              )}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
