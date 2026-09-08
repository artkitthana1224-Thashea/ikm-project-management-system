import React, { useState } from 'react';
import { useStore, Employee } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { UserCog, MoreVertical, Shield, Database, Plus, Search, RefreshCw, CheckCircle2, Phone, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

export function UsersAdmin() {
  const { language, employees, initSupabaseData, isLoadingData, updateEmployee, addEmployee } = useStore();
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Engineer',
    department: 'Engineering',
    phone: '',
    email: '',
  });

  const t = {
    EN: {
      title: 'Staff & Personnel Directory (Supabase DB)',
      subtitle: 'Real-time staff profiles, roles, and department allocations synced from Supabase user_profiles',
      users: 'Employee / User',
      role: 'Role',
      dept: 'Department',
      status: 'Availability',
      contact: 'Contact',
      actions: 'Actions',
      add: 'Add New Staff',
      sync: 'Sync Supabase',
      syncing: 'Syncing...',
      searchPlaceholder: 'Search employees by name, role, department...',
      active: 'Active',
      save: 'Save to Supabase',
      cancel: 'Cancel',
      createSuccess: 'Employee profile added to Supabase',
    },
    TH: {
      title: 'รายชื่อและสิทธิ์พนักงาน (ฐานข้อมูล Supabase)',
      subtitle: 'ข้อมูลพนักงาน บทบาท แผนก และการติดต่อ เชื่อมโยงตรงจากตาราง user_profiles ใน Supabase',
      users: 'พนักงาน / ผู้ใช้งาน',
      role: 'ตำแหน่ง / บทบาท',
      dept: 'แผนก',
      status: 'ความพร้อม',
      contact: 'ข้อมูลติดต่อ',
      actions: 'จัดการ',
      add: 'เพิ่มพนักงานใหม่',
      sync: 'ซิงค์ข้อมูล Supabase',
      syncing: 'กำลังซิงค์...',
      searchPlaceholder: 'ค้นหาพนักงานด้วยชื่อ, ตำแหน่ง, หรือแผนก...',
      active: 'พร้อมปฏิบัติงาน',
      save: 'บันทึกลง Supabase',
      cancel: 'ยกเลิก',
      createSuccess: 'บันทึกข้อมูลพนักงานลง Supabase สำเร็จ',
    }
  }[language];

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name.trim()) return;

    const colors = ['#F58220', '#16794B', '#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const created: Employee = {
      id: `emp-${Date.now().toString().slice(-4)}-${Math.random().toString(36).slice(2, 6)}`,
      name: newStaff.name.trim(),
      role: newStaff.role,
      department: newStaff.department,
      avatarColor: randomColor,
      availability: 'available',
      utilization: 75,
      score: 90,
      skills: [newStaff.role, newStaff.department],
      phone: newStaff.phone || '08' + Math.floor(10000000 + Math.random() * 90000000),
      email: newStaff.email || `${newStaff.name.toLowerCase().replace(/\s+/g, '.')}@ikm-ops.com`,
    };

    await addEmployee(created);
    setIsAddModalOpen(false);
    setNewStaff({ name: '', role: 'Engineer', department: 'Engineering', phone: '', email: '' });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 space-y-5 max-w-6xl mx-auto pb-24">
      {/* Supabase Live Status Header */}
      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-semibold">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Table: <strong className="font-mono">public.user_profiles</strong> &amp; <strong className="font-mono">public.departments</strong> · Total Staff: <strong>{employees.length}</strong></span>
        </div>
        <button 
          onClick={() => initSupabaseData()}
          disabled={isLoadingData}
          className="flex items-center gap-1.5 hover:underline text-emerald-700 dark:text-emerald-200 font-bold"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isLoadingData && "animate-spin")} />
          <span>{isLoadingData ? t.syncing : t.sync}</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-status-purple/10 text-status-purple flex items-center justify-center shadow-sm">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ikm-text">{t.title}</h1>
            <p className="text-sm text-ikm-text-secondary">{t.subtitle}</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-ikm-orange hover:bg-ikm-orange-dark text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t.add}</span>
        </Button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-11 pr-4 rounded-xl border border-ikm-border bg-ikm-card text-sm text-ikm-text focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none shadow-sm"
        />
      </div>

      {/* Employees Table */}
      <Card className="overflow-hidden border-ikm-border bg-ikm-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-ikm-bg text-ikm-text-secondary text-xs uppercase tracking-wider border-b border-ikm-border">
              <tr>
                <th className="px-6 py-4 font-semibold">{t.users}</th>
                <th className="px-6 py-4 font-semibold">{t.role}</th>
                <th className="px-6 py-4 font-semibold">{t.dept}</th>
                <th className="px-6 py-4 font-semibold">{t.contact}</th>
                <th className="px-6 py-4 font-semibold">{t.status}</th>
                <th className="px-6 py-4 font-semibold text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ikm-border">
              {filteredEmployees.map((u) => (
                <tr key={u.id} className="hover:bg-ikm-bg/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0" 
                        style={{ background: u.avatarColor || '#F58220' }}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-ikm-text flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {u.role.toLowerCase().includes('manager') && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">Admin</span>
                          )}
                        </div>
                        <div className="text-xs text-ikm-text-secondary font-mono">
                          ID: {u.id.length > 15 ? `${u.id.slice(0, 8)}...` : u.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-ikm-text font-medium">
                      {u.role.toLowerCase().includes('manager') && <Shield className="w-3.5 h-3.5 text-status-purple" />}
                      <span>{u.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-ikm-text">
                      {u.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-ikm-text-secondary">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{u.phone || '081-998-8776'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span>{u.email || `${u.name.toLowerCase().replace(/\s+/g, '.')}@ikm-ops.com`}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        const nextAvail = u.availability === 'available' ? 'busy' : u.availability === 'busy' ? 'on-leave' : 'available';
                        updateEmployee(u.id, { availability: nextAvail });
                      }}
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide transition-transform active:scale-95",
                        u.availability === 'available' && "bg-status-green/10 text-status-green hover:bg-status-green/20",
                        u.availability === 'busy' && "bg-ikm-orange/10 text-ikm-orange hover:bg-ikm-orange/20",
                        u.availability === 'on-leave' && "bg-status-red/10 text-status-red hover:bg-status-red/20",
                        u.availability === 'off-shift' && "bg-gray-100 text-gray-600 hover:bg-gray-200",
                      )}
                    >
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        u.availability === 'available' && "bg-status-green",
                        u.availability === 'busy' && "bg-ikm-orange",
                        u.availability === 'on-leave' && "bg-status-red",
                        u.availability === 'off-shift' && "bg-gray-400",
                      )} />
                      <span className="capitalize">{u.availability}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-ikm-text-secondary hover:text-ikm-orange p-1.5 rounded transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 bg-ikm-card border-ikm-border shadow-xl">
            <h3 className="text-lg font-bold text-ikm-text flex items-center gap-2">
              <UserCog className="w-5 h-5 text-ikm-orange" />
              <span>{t.add}</span>
            </h3>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ikm-text-secondary mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Somporn Prasert"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-ikm-border bg-ikm-bg text-sm text-ikm-text focus:border-ikm-orange outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ikm-text-secondary mb-1">Role</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-ikm-border bg-ikm-bg text-sm text-ikm-text focus:border-ikm-orange outline-none"
                  >
                    <option value="Lead Engineer">Lead Engineer</option>
                    <option value="Safety Inspector">Safety Inspector</option>
                    <option value="Electrical Technician">Electrical Technician</option>
                    <option value="Mechanical Foreman">Mechanical Foreman</option>
                    <option value="Civil Engineer">Civil Engineer</option>
                    <option value="Pump Technician">Pump Technician</option>
                    <option value="SCADA Specialist">SCADA Specialist</option>
                    <option value="Engineer">Engineer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ikm-text-secondary mb-1">Department</label>
                  <select
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-ikm-border bg-ikm-bg text-sm text-ikm-text focus:border-ikm-orange outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Electrical & Instrumentation">Electrical & Instrumentation</option>
                    <option value="Health, Safety & Environment (HSE)">HSE</option>
                    <option value="Quality Assurance (QA/QC)">QA/QC</option>
                    <option value="Operations & Maintenance">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ikm-text-secondary mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 081-234-5678"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-ikm-border bg-ikm-bg text-sm text-ikm-text focus:border-ikm-orange outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ikm-text-secondary mb-1">Email</label>
                <input
                  type="email"
                  placeholder="e.g. staff@ikm-ops.com"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-ikm-border bg-ikm-bg text-sm text-ikm-text focus:border-ikm-orange outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  {t.cancel}
                </Button>
                <Button type="submit" className="bg-ikm-orange hover:bg-ikm-orange-dark text-white">
                  {t.save}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
