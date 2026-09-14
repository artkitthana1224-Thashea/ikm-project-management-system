import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { MainEquipment, EquipmentCategory, UserRole } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Wrench, Plus, Search, Filter, Eye, Download, Trash2, 
  Edit3, CheckCircle2, AlertTriangle, Clock, X, FileText, 
  Layers, MapPin, Tag, Shield, Award, Calendar, Check, ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  canCreateEquipment, 
  canDeleteEquipment, 
  getUserRole 
} from '../lib/rbac';

export function EquipmentList() {
  const { 
    language, 
    equipments, 
    user: currentUser, 
    addEquipment, 
    updateEquipment, 
    archiveEquipment 
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBase, setSelectedBase] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<MainEquipment | null>(null);
  const [viewingEquipment, setViewingEquipment] = useState<MainEquipment | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<MainEquipment | null>(null);
  const [viewingManualPdf, setViewingManualPdf] = useState<{ equipment: MainEquipment; type: 'manual' | 'calibration' } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // New Equipment Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    serialNumber: '',
    category: 'Hydrotesting' as EquipmentCategory,
    status: 'Available' as MainEquipment['status'],
    baseLocation: 'IKM Rayong (RY)' as MainEquipment['baseLocation'],
    description: '',
    specifications: 'Standard offshore rated specifications.',
    manufacturer: 'IKM Testing AS / Norbar',
    model: 'M-2026',
    calibrationDueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const userRole = getUserRole(currentUser);
  const canCreate = canCreateEquipment(currentUser);
  const canDelete = canDeleteEquipment(currentUser);

  const categories: EquipmentCategory[] = [
    'Hydrotesting',
    'Flange Management & Bolting',
    'Nitrogen & Pipeline',
    'Rigging & Lifting',
    'Instrumentation & Calibration',
    'Safety & HSE',
    'Welding & Fabrication'
  ];

  const bases = ['IKM Rayong (RY)', 'IKM Songkhla (SK)', 'IKM Sattahip (ST)', 'Offshore Platform'];

  const filteredEquipments = equipments.filter(item => {
    if (item.isArchived) return false;

    const matchesSearch = !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      (item.assignedProject && item.assignedProject.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesBase = selectedBase === 'all' || item.baseLocation === selectedBase;

    return matchesSearch && matchesCategory && matchesStatus && matchesBase;
  });

  // Calculate stats
  const stats = {
    total: equipments.filter(e => !e.isArchived).length,
    available: equipments.filter(e => !e.isArchived && e.status === 'Available').length,
    inUse: equipments.filter(e => !e.isArchived && e.status === 'In Use').length,
    maintenance: equipments.filter(e => !e.isArchived && e.status === 'Under Maintenance').length,
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newCode = formData.code.trim() || `IKM-EQ-${Math.floor(1000 + Math.random() * 9000)}`;

    const newEq: MainEquipment = {
      id: `EQ-${Date.now()}`,
      code: newCode,
      name: formData.name.trim(),
      serialNumber: formData.serialNumber.trim() || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      category: formData.category,
      status: formData.status,
      baseLocation: formData.baseLocation,
      description: formData.description.trim() || `${formData.name} for field asset services.`,
      specifications: {
        capacity: formData.specifications,
        manufacturer: formData.manufacturer,
        model: formData.model,
      },
      calibrationDueDate: formData.calibrationDueDate,
      manualPdfUrl: `/docs/manuals/${newCode.toLowerCase()}_manual.pdf`,
      manualPdfName: `${formData.name.replace(/\s+/g, '_')}_UserManual.pdf`,
      calibrationCertPdfUrl: `/docs/certs/${newCode.toLowerCase()}_calib.pdf`,
      calibrationCertName: `${formData.name.replace(/\s+/g, '_')}_Calibration_Certificate.pdf`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Admin',
    };

    await addEquipment(newEq);
    setIsAddModalOpen(false);
    showToast('สร้างเครื่องมือ/อุปกรณ์หลักรายการใหม่สำเร็จ');
    setFormData({
      code: '',
      name: '',
      serialNumber: '',
      category: 'Hydrotesting',
      status: 'Available',
      baseLocation: 'IKM Rayong (RY)',
      description: '',
      specifications: 'Standard offshore rated specifications.',
      manufacturer: 'IKM Testing AS / Norbar',
      model: 'M-2026',
      calibrationDueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEquipment) return;

    await updateEquipment(editingEquipment.id, {
      name: editingEquipment.name,
      category: editingEquipment.category,
      status: editingEquipment.status,
      baseLocation: editingEquipment.baseLocation,
      serialNumber: editingEquipment.serialNumber,
      description: editingEquipment.description,
      calibrationDueDate: editingEquipment.calibrationDueDate,
      assignedProject: editingEquipment.assignedProject,
      assignedSupervisor: editingEquipment.assignedSupervisor,
    });

    setEditingEquipment(null);
    showToast('บันทึกการแก้ไขข้อมูลเครื่องมือสำเร็จ');
  };

  const handleArchive = async () => {
    if (!deleteConfirm) return;
    await archiveEquipment(deleteConfirm.id);
    setDeleteConfirm(null);
    showToast('จัดเก็บเครื่องมือเข้าคลัง (Archive) สำเร็จเพื่อเก็บ Audit Trail');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Toast */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium border bg-ikm-orange text-white border-orange-600 shadow-orange-500/25 backdrop-blur-md animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-[#F58220] flex items-center justify-center shadow-md shadow-slate-900/20 flex-shrink-0 mt-0.5">
            <Wrench className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-ikm-text tracking-tight flex items-center gap-2">
              รายการเครื่องมือและอุปกรณ์หลัก (Main Equipment List)
            </h1>
            <p className="text-xs md:text-sm text-ikm-text-secondary mt-1">
              รวมรายการเครื่องมือหลักแยกตามหมวดหมู่ ตรวจสอบสถานะ (ว่าง, ไม่ว่าง, รอซ่อม) พร้อมเปิดอ่านและดาวน์โหลดคู่มือ PDF
            </p>
          </div>
        </div>

        {/* Add Equipment Button (RBAC: Admin, Country Manager, Manager, Coordinator) */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            disabled={!canCreate}
            title={!canCreate ? 'เฉพาะ Admin, Country Manager, Manager และ Coordinator ที่สามารถสร้างเพิ่มได้' : undefined}
            className={cn(
              "bg-[#F58220] hover:bg-[#e07110] text-white font-medium px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 text-sm",
              !canCreate && "opacity-50 cursor-not-allowed"
            )}
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มเครื่องมือหลัก</span>
          </Button>
        </div>
      </div>

      {/* 4 Overview Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4 bg-ikm-card border border-ikm-border rounded-2xl flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-ikm-text">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-ikm-text-secondary font-medium">อุปกรณ์ทั้งหมด</p>
            <p className="text-xl font-bold text-ikm-text">{stats.total} <span className="text-xs font-normal text-ikm-text-secondary">รายการ</span></p>
          </div>
        </Card>

        <Card className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">สถานะ: ว่าง (Available)</p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{stats.available} <span className="text-xs font-normal text-emerald-800/70">เครื่อง</span></p>
          </div>
        </Card>

        <Card className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">สถานะ: ไม่ว่าง (In Use)</p>
            <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{stats.inUse} <span className="text-xs font-normal text-amber-800/70">เครื่อง</span></p>
          </div>
        </Card>

        <Card className="p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-900/60 flex items-center justify-center text-red-700 dark:text-red-300 font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-red-800 dark:text-red-300 font-medium">สถานะ: รอซ่อม (Maintenance)</p>
            <p className="text-xl font-bold text-red-700 dark:text-red-400">{stats.maintenance} <span className="text-xs font-normal text-red-800/70">เครื่อง</span></p>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Search */}
        <div className="lg:col-span-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ikm-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ, รหัสอุปกรณ์, หรือ Serial Number..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-ikm-card border border-ikm-border text-ikm-text text-sm focus:outline-none focus:ring-2 focus:ring-[#F58220]/40 focus:border-[#F58220] transition-all shadow-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="lg:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-ikm-card border border-ikm-border text-ikm-text text-sm focus:outline-none focus:ring-2 focus:ring-[#F58220]/40 focus:border-[#F58220] transition-all shadow-sm"
          >
            <option value="all">ทุกหมวดหมู่อุปกรณ์</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Status Filter (Available, In Use, Under Maintenance) */}
        <div className="lg:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-ikm-card border border-ikm-border text-ikm-text text-sm focus:outline-none focus:ring-2 focus:ring-[#F58220]/40 focus:border-[#F58220] transition-all shadow-sm font-medium"
          >
            <option value="all">ทุกสถานะความพร้อม</option>
            <option value="Available">🟢 ว่าง (Available)</option>
            <option value="In Use">🟡 ไม่ว่าง (In Use)</option>
            <option value="Under Maintenance">🔴 รอซ่อม (Under Maintenance)</option>
          </select>
        </div>

        {/* Base Location Filter */}
        <div className="lg:col-span-2">
          <select
            value={selectedBase}
            onChange={(e) => setSelectedBase(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-ikm-card border border-ikm-border text-ikm-text text-sm focus:outline-none focus:ring-2 focus:ring-[#F58220]/40 focus:border-[#F58220] transition-all shadow-sm"
          >
            <option value="all">ทุก Base ประจำการ</option>
            {bases.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="overflow-hidden border border-ikm-border rounded-2xl shadow-sm bg-ikm-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-ikm-border bg-slate-50/70 dark:bg-slate-900/40 text-ikm-text-secondary text-xs font-semibold select-none">
                <th className="py-3.5 px-5 font-semibold">รหัสและชื่ออุปกรณ์</th>
                <th className="py-3.5 px-5 font-semibold">หมวดหมู่</th>
                <th className="py-3.5 px-5 font-semibold">Serial Number</th>
                <th className="py-3.5 px-5 font-semibold">สถานะการใช้งาน</th>
                <th className="py-3.5 px-5 font-semibold">Base ประจำการ</th>
                <th className="py-3.5 px-5 font-semibold">คู่มือ & เอกสาร PDF</th>
                <th className="py-3.5 px-5 font-semibold text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ikm-border">
              {filteredEquipments.map((item) => {
                const canEditThis = canCreate;
                const canDeleteThis = canDelete;

                return (
                  <tr 
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* 1. Name and Code */}
                    <td className="py-4 px-5 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-[#F58220] flex items-center justify-center font-bold flex-shrink-0">
                          <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-ikm-text text-sm hover:text-[#F58220] cursor-pointer" onClick={() => setViewingEquipment(item)}>
                            {item.name}
                          </p>
                          <p className="text-xs font-mono text-ikm-text-secondary">
                            Code: <span className="font-semibold text-ikm-text">{item.code}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 2. Category */}
                    <td className="py-4 px-5 align-middle">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-ikm-text-secondary">
                        {item.category}
                      </span>
                    </td>

                    {/* 3. Serial Number */}
                    <td className="py-4 px-5 align-middle font-mono text-xs text-ikm-text">
                      {item.serialNumber}
                    </td>

                    {/* 4. Status: Available, In Use, Under Maintenance */}
                    <td className="py-4 px-5 align-middle">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
                        item.status === 'Available' ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900" :
                        item.status === 'In Use' ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900" :
                        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900"
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          item.status === 'Available' ? "bg-emerald-500" :
                          item.status === 'In Use' ? "bg-amber-500" : "bg-red-500"
                        )} />
                        {item.status === 'Available' ? 'ว่าง (Available)' :
                         item.status === 'In Use' ? 'ไม่ว่าง (In Use)' : 'รอซ่อม (Maintenance)'}
                      </span>
                      {item.assignedProject && (
                        <p className="text-[10px] text-ikm-text-secondary mt-1 truncate max-w-[140px]">
                          งาน: {item.assignedProject}
                        </p>
                      )}
                    </td>

                    {/* 5. Base Location */}
                    <td className="py-4 px-5 align-middle">
                      <div className="flex items-center gap-1 text-xs text-ikm-text-secondary">
                        <MapPin className="w-3.5 h-3.5 text-[#F58220]" />
                        <span>{item.baseLocation || 'IKM Rayong (RY)'}</span>
                      </div>
                    </td>

                    {/* 6. Manual PDF & Certificate Reader Button */}
                    <td className="py-4 px-5 align-middle">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingManualPdf({ equipment: item, type: 'manual' })}
                          className="text-xs px-2.5 py-1 h-7 flex items-center gap-1 border-ikm-border hover:border-[#F58220] hover:text-[#F58220]"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#F58220]" />
                          <span>คู่มือ PDF</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            showToast(`ดาวน์โหลด ${item.manualPdfName || 'Equipment_Manual.pdf'} สำเร็จ`);
                          }}
                          title="Download PDF Manual"
                          className="p-1 h-7 w-7 border-ikm-border text-ikm-text-secondary hover:text-ikm-text"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>

                    {/* 7. Actions: View, Edit, Delete */}
                    <td className="py-4 px-5 align-middle text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View Specs */}
                        <button
                          onClick={() => setViewingEquipment(item)}
                          title="ดูรายละเอียดสเปก"
                          className="p-1.5 rounded-lg text-ikm-text-secondary hover:text-[#F58220] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Equipment */}
                        <button
                          onClick={() => setEditingEquipment(item)}
                          disabled={!canEditThis}
                          title={canEditThis ? 'แก้ไขข้อมูล' : 'ต้องมีสิทธิ์ Coordinator ขึ้นไป'}
                          className={cn(
                            "p-1.5 rounded-lg text-ikm-text-secondary hover:text-ikm-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                            !canEditThis && "opacity-30 cursor-not-allowed"
                          )}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete / Archive (Allowed for Admin and Country Manager only) */}
                        <button
                          onClick={() => canDeleteThis && setDeleteConfirm(item)}
                          disabled={!canDeleteThis}
                          title={canDeleteThis ? 'จัดเก็บ / ลบเครื่องมือ' : 'เฉพาะ Admin และ Country Manager เท่านั้นที่สามารถลบได้'}
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

              {filteredEquipments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ikm-text-secondary">
                    <Wrench className="w-12 h-12 mx-auto mb-2 opacity-30 text-ikm-text-secondary" />
                    <p className="text-sm">ไม่พบรายการเครื่องมือและอุปกรณ์ตามเงื่อนไขที่เลือก</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* MODAL 1: View Equipment Specs & Details                                   */}
      {/* ========================================================================= */}
      {viewingEquipment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-ikm-card border border-ikm-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-6 relative">
              <button 
                onClick={() => setViewingEquipment(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#F58220] flex items-center justify-center text-white font-bold">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{viewingEquipment.name}</h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Code: {viewingEquipment.code} &bull; S/N: {viewingEquipment.serialNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5 text-sm max-h-[65vh] overflow-y-auto">
              
              {/* Status and Category */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-ikm-border">
                  <p className="text-xs text-ikm-text-secondary">หมวดหมู่</p>
                  <p className="font-semibold text-ikm-text text-xs mt-0.5">{viewingEquipment.category}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-ikm-border">
                  <p className="text-xs text-ikm-text-secondary">สถานะปัจจุบัน</p>
                  <p className="font-semibold text-ikm-text text-xs mt-0.5">{viewingEquipment.status}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-ikm-border">
                  <p className="text-xs text-ikm-text-secondary">Base ประจำการ</p>
                  <p className="font-semibold text-ikm-text text-xs mt-0.5">{viewingEquipment.baseLocation}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-ikm-text uppercase tracking-wider mb-1.5 text-[#F58220]">
                  คำอธิบายการใช้งาน (Description)
                </h4>
                <p className="text-xs text-ikm-text-secondary leading-relaxed bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-ikm-border">
                  {viewingEquipment.description}
                </p>
              </div>

              {/* Specifications */}
              <div>
                <h4 className="text-xs font-bold text-ikm-text uppercase tracking-wider mb-1.5 text-[#F58220]">
                  ข้อมูลทางเทคนิค (Technical Specifications)
                </h4>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-ikm-border space-y-1.5 text-xs text-ikm-text-secondary">
                  {typeof viewingEquipment.specifications === 'object' ? (
                    <>
                      {viewingEquipment.specifications.capacity && (
                        <p><span className="font-semibold text-ikm-text">Capacity / Rating:</span> {viewingEquipment.specifications.capacity}</p>
                      )}
                      {viewingEquipment.specifications.model && (
                        <p><span className="font-semibold text-ikm-text">Model:</span> {viewingEquipment.specifications.model}</p>
                      )}
                      {viewingEquipment.specifications.manufacturer && (
                        <p><span className="font-semibold text-ikm-text">Manufacturer:</span> {viewingEquipment.specifications.manufacturer}</p>
                      )}
                    </>
                  ) : (
                    <p>{String(viewingEquipment.specifications)}</p>
                  )}
                  {viewingEquipment.calibrationDueDate && (
                    <p className="pt-1 border-t border-ikm-border">
                      <span className="font-semibold text-ikm-text">วันครบกำหนดสอบเทียบ (Calibration Due):</span> <span className="font-mono font-bold text-amber-600">{viewingEquipment.calibrationDueDate}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Documents and PDF readers */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ikm-text uppercase tracking-wider text-[#F58220]">
                  เอกสารประจำเครื่อง (Documents & Manuals)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-ikm-border bg-ikm-card flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#F58220]" />
                      <div>
                        <p className="font-bold text-xs text-ikm-text">คู่มือการใช้งาน (Manual)</p>
                        <p className="text-[10px] text-ikm-text-secondary font-mono">{viewingEquipment.manualPdfName || 'User_Manual.pdf'}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setViewingManualPdf({ equipment: viewingEquipment, type: 'manual' })}
                      className="text-xs bg-[#F58220] hover:bg-orange-600 text-white h-7 px-2.5"
                    >
                      เปิดอ่าน PDF
                    </Button>
                  </div>

                  <div className="p-3 rounded-xl border border-ikm-border bg-ikm-card flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="font-bold text-xs text-ikm-text">ใบสอบเทียบ (Calibration)</p>
                        <p className="text-[10px] text-ikm-text-secondary font-mono">{viewingEquipment.calibrationCertName || 'Calib_Cert.pdf'}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setViewingManualPdf({ equipment: viewingEquipment, type: 'calibration' })}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-white h-7 px-2.5"
                    >
                      เปิดอ่าน PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-ikm-border flex justify-end">
              <Button onClick={() => setViewingEquipment(null)} className="text-xs bg-ikm-text text-ikm-card">
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Interactive PDF Viewer for Manual & Calibration                  */}
      {/* ========================================================================= */}
      {viewingManualPdf && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-300 dark:border-slate-700">
            
            {/* Top Toolbar */}
            <div className="bg-slate-800 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono">
                <FileText className="w-4 h-4 text-[#F58220]" />
                <span>
                  {viewingManualPdf.type === 'manual' 
                    ? viewingManualPdf.equipment.manualPdfName || 'Equipment_Operation_Manual.pdf' 
                    : viewingManualPdf.equipment.calibrationCertName || 'Calibration_Certificate.pdf'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm"
                  onClick={() => showToast(`ดาวน์โหลดเอกสาร PDF สำเร็จ`)}
                  className="bg-[#F58220] hover:bg-[#e07110] text-white text-xs px-3 py-1 h-7 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </Button>
                <button 
                  onClick={() => setViewingManualPdf(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Viewer Sheet */}
            <div className="p-8 bg-slate-100 dark:bg-slate-950 flex justify-center max-h-[70vh] overflow-y-auto">
              <div className="w-full bg-white text-slate-900 p-8 rounded-lg shadow-xl border border-slate-300 space-y-5">
                
                {/* Header of Doc */}
                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">
                      IKM TESTING ASIA CO., LTD.
                    </h2>
                    <p className="text-xs text-slate-600">Offshore Asset Services & Specialist Engineering</p>
                  </div>
                  <div className="text-right text-xs font-mono text-slate-500">
                    <p>DOC ID: {viewingManualPdf.equipment.code}-DOC</p>
                    <p>REV: 02 / 2026</p>
                  </div>
                </div>

                <div className="text-center py-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <h3 className="text-lg font-bold text-slate-900">
                    {viewingManualPdf.type === 'manual' ? 'STANDARD OPERATING MANUAL & SAFETY GUIDE' : 'OFFICIAL CALIBRATION & TEST CERTIFICATE'}
                  </h3>
                  <p className="text-xs font-semibold text-[#F58220] mt-1">
                    EQUIPMENT: {viewingManualPdf.equipment.name}
                  </p>
                  <p className="text-xs font-mono text-slate-500">
                    SERIAL NO: {viewingManualPdf.equipment.serialNumber} &bull; CATEGORY: {viewingManualPdf.equipment.category}
                  </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase">1. Scope of Equipment & Safety Precautions</h4>
                    <p className="mt-1">
                      {viewingManualPdf.equipment.description} Ensure pre-job inspection, grounding check, and PPE compliance (Eye protection, impact gloves, safety boots) before pressurization or lifting.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 uppercase">2. Standard Operating Parameters</h4>
                    <ul className="list-disc pl-5 space-y-1 mt-1 font-mono">
                      <li>Rated Working Capacity: {typeof viewingManualPdf.equipment.specifications === 'object' ? viewingManualPdf.equipment.specifications.capacity : 'Standard Certified'}</li>
                      <li>Base Location Depot: {viewingManualPdf.equipment.baseLocation}</li>
                      <li>Calibration Due Date: {viewingManualPdf.equipment.calibrationDueDate || '2026-12-31'}</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 uppercase">3. Quality & Calibration Endorsement</h4>
                    <p className="mt-1">
                      This unit has been tested in accordance with ISO 9001:2015 and API/ASME standards by certified IKM QA/QC engineers.
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                  <div>
                    <p className="font-semibold text-slate-800">Approved by QA Manager</p>
                    <p className="text-[10px]">IKM Quality Assurance Dept</p>
                  </div>
                  <div className="w-16 h-16 rounded-full border border-dashed border-amber-800 flex items-center justify-center text-[9px] font-bold text-amber-800 text-center">
                    PASSED QA
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-100 dark:bg-slate-800 flex justify-end">
              <Button onClick={() => setViewingManualPdf(null)} className="bg-slate-900 text-white text-xs">
                ปิดเอกสาร
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Add New Equipment Form                                           */}
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
                  <h3 className="font-bold text-lg text-ikm-text">เพิ่มรายการเครื่องมือและอุปกรณ์หลัก</h3>
                  <p className="text-xs text-ikm-text-secondary">สร้างรหัสเครื่องมือ กำหนดหมวดหมู่ และแนบข้อมูลสเปก PDF</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-ikm-text-secondary hover:text-ikm-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-sm max-h-[70vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">ชื่อเครื่องมือ (Equipment Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น High Pressure Hydrotest Pump 15,000 PSI"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">รหัสอุปกรณ์ (Equipment Code)</label>
                  <input
                    type="text"
                    placeholder="เช่น IKM-HT-001 (เว้นว่างเพื่อสร้างอัตโนมัติ)"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">หมวดหมู่ (Category) *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as EquipmentCategory })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">สถานะเริ่มต้น (Status) *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange text-xs"
                  >
                    <option value="Available">🟢 ว่าง (Available)</option>
                    <option value="In Use">🟡 ไม่ว่าง (In Use)</option>
                    <option value="Under Maintenance">🔴 รอซ่อม (Under Maintenance)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">Base ประจำการ *</label>
                  <select
                    value={formData.baseLocation}
                    onChange={(e) => setFormData({ ...formData, baseLocation: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange text-xs"
                  >
                    {bases.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">Serial Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น SN-HYD-998812"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">วันครบกำหนดสอบเทียบ (Calibration Due)</label>
                  <input
                    type="date"
                    value={formData.calibrationDueDate}
                    onChange={(e) => setFormData({ ...formData, calibrationDueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ikm-text mb-1.5">สเปกและรายละเอียดเครื่องมือ</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="รายละเอียดทางเทคนิค เช่น แรงดันสูงสุด อัตราการไหล อุณหภูมิการทำงาน..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-ikm-border">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit" className="bg-[#F58220] hover:bg-[#e07110] text-white">
                  + เพิ่มเครื่องมือ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Edit Equipment                                                  */}
      {/* ========================================================================= */}
      {editingEquipment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-ikm-card border border-ikm-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-ikm-border flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ikm-orange flex items-center justify-center text-white">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-ikm-text">แก้ไขข้อมูลเครื่องมือหลัก</h3>
                  <p className="text-xs text-ikm-text-secondary">{editingEquipment.name} ({editingEquipment.code})</p>
                </div>
              </div>
              <button onClick={() => setEditingEquipment(null)} className="text-ikm-text-secondary hover:text-ikm-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-sm max-h-[70vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">ชื่อเครื่องมือ *</label>
                  <input
                    type="text"
                    required
                    value={editingEquipment.name}
                    onChange={(e) => setEditingEquipment({ ...editingEquipment, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">สถานะการใช้งาน (Status) *</label>
                  <select
                    value={editingEquipment.status}
                    onChange={(e) => setEditingEquipment({ ...editingEquipment, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text font-semibold focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                  >
                    <option value="Available">🟢 ว่าง (Available)</option>
                    <option value="In Use">🟡 ไม่ว่าง (In Use)</option>
                    <option value="Under Maintenance">🔴 รอซ่อม (Under Maintenance)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">หมวดหมู่</label>
                  <select
                    value={editingEquipment.category}
                    onChange={(e) => setEditingEquipment({ ...editingEquipment, category: e.target.value as EquipmentCategory })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ikm-text mb-1.5">Base ประจำการ</label>
                  <select
                    value={editingEquipment.baseLocation}
                    onChange={(e) => setEditingEquipment({ ...editingEquipment, baseLocation: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                  >
                    {bases.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ikm-text mb-1.5">รายละเอียดและสเปก</label>
                <textarea
                  rows={3}
                  value={editingEquipment.description}
                  onChange={(e) => setEditingEquipment({ ...editingEquipment, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-ikm-border">
                <Button type="button" variant="outline" onClick={() => setEditingEquipment(null)}>
                  ยกเลิก
                </Button>
                <Button type="submit" className="bg-[#F58220] hover:bg-[#e07110] text-white">
                  บันทึกการแก้ไข
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: Soft Delete / Archive Confirmation (Admin/Country Manager only)   */}
      {/* ========================================================================= */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-ikm-card border border-ikm-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg text-ikm-text">ยืนยันการจัดเก็บเครื่องมือ (Archive)</h3>
              <p className="text-xs text-ikm-text-secondary">
                ต้องการย้ายเครื่องมือ <span className="font-bold text-ikm-text">{deleteConfirm.name} ({deleteConfirm.code})</span> เข้าคลังข้อมูลใช่หรือไม่?
              </p>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 text-left mt-3">
                <p className="font-semibold mb-0.5">📌 นโยบาย Audit Trail & RBAC:</p>
                <p>สิทธิ์การลบเครื่องมือจำกัดเฉพาะ Admin และ Country Manager เท่านั้น ระบบจะทำการ Soft-delete Archive เพื่อรักษาบันทึกใบงานในอดีต</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                ยกเลิก
              </Button>
              <Button onClick={handleArchive} className="bg-red-600 hover:bg-red-700 text-white">
                จัดเก็บเข้าคลัง (Archive)
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
