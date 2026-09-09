import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { 
  Users, Building2, Calendar, Download, Printer, Copy, Check, 
  Plus, Search, Filter, TrendingUp, BarChart3, PieChart as PieIcon, 
  ArrowLeft, ArrowRight, RefreshCw, FileSpreadsheet, Briefcase, 
  Clock, ShieldAlert, Sparkles, AlertCircle, ChevronDown
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Legend, PieChart, Pie, Cell 
} from 'recharts';

export type SiteCode = 'RY' | 'LKU' | 'ALL';

export interface ManpowerRow {
  id: string;
  category: 'direct' | 'job' | 'leave' | 'off' | 'absent' | 'other';
  description: string;
  isCustom?: boolean;
  days: number[]; // 7 days of values
}

export interface SiteReportData {
  siteCode: SiteCode;
  siteName: string;
  siteLocation: string;
  periodLabel: string;
  dates: string[]; // e.g. ["28", "29", "30", "31", "1", "2", "3"]
  daysOfWeek: string[]; // e.g. ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"]
  workingRows: ManpowerRow[];
  leaveRows: ManpowerRow[];
  absentRows: ManpowerRow[];
  offRows: ManpowerRow[];
  otherRows: ManpowerRow[];
}

const DEFAULT_RY_DATA: SiteReportData = {
  siteCode: 'RY',
  siteName: 'IKM-TH RY (Rayong Base)',
  siteLocation: 'Rayong Workshop & Offshore Operations',
  periodLabel: '28 Aug - 3 Sep 2026',
  dates: ['28', '29', '30', '31', '1', '2', '3'],
  daysOfWeek: ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
  workingRows: [
    { id: 'ry-w1', category: 'direct', description: 'IKM - Staff - Office', days: [10, 10, 10, 10, 10, 10, 10] },
    { id: 'ry-w2', category: 'direct', description: 'IKM - Staff - workshop', days: [1, 3, 0, 2, 2, 3, 5] },
    { id: 'ry-w3', category: 'direct', description: 'IKM - Freelance - Workshop', days: [0, 1, 0, 0, 0, 0, 2] },
    { id: 'ry-w4', category: 'direct', description: 'IKM - Freelancer - Office', days: [1, 1, 1, 1, 1, 1, 1] },
    { id: 'ry-w5', category: 'job', description: '002-26 Zeaquest', days: [0, 0, 0, 0, 3, 0, 0] },
    { id: 'ry-w6', category: 'direct', description: 'Freelancer - LKU', days: [1, 1, 0, 1, 1, 1, 1] },
    { id: 'ry-w7', category: 'job', description: 'Job No. 004-26 Unithai', days: [4, 4, 4, 4, 4, 4, 4] },
    { id: 'ry-w8', category: 'job', description: 'Job No. 046-25 SCC', days: [4, 4, 0, 4, 4, 7, 3] },
    { id: 'ry-w9', category: 'job', description: 'Job No. 010-26 Siaptek', days: [3, 3, 3, 3, 0, 0, 0] },
    { id: 'ry-w10', category: 'job', description: 'Adhoc-26', days: [2, 2, 2, 2, 1, 2, 2] },
    { id: 'ry-w11', category: 'job', description: 'Job No. 018-26 Go boating', days: [1, 1, 0, 1, 1, 1, 1] },
    { id: 'ry-w12', category: 'job', description: 'Job No. 020-26 S.Sirisaeng', days: [6, 6, 0, 6, 8, 6, 6] },
  ],
  leaveRows: [
    { id: 'ry-l1', category: 'leave', description: 'Leave half day', days: [0, 0, 0, 0, 0, 0, 0] },
    { id: 'ry-l2', category: 'leave', description: 'Leave Office Staff', days: [0, 0, 0, 0, 0, 0, 0] },
    { id: 'ry-l3', category: 'leave', description: 'Leave Office Freelancer', days: [0, 0, 0, 0, 0, 0, 0] },
    { id: 'ry-l4', category: 'leave', description: 'Leave Operation Staff', days: [0, 0, 0, 0, 0, 0, 0] },
    { id: 'ry-l5', category: 'leave', description: 'Leave Operation Freelancer', days: [0, 0, 0, 1, 0, 0, 0] },
  ],
  absentRows: [
    { id: 'ry-a1', category: 'absent', description: 'Absent', days: [0, 0, 0, 0, 0, 0, 0] },
  ],
  offRows: [
    { id: 'ry-o1', category: 'off', description: "Off / stand by but don't come work shop", days: [0, 0, 16, 0, 0, 0, 0] },
  ],
  otherRows: []
};

const DEFAULT_LKU_DATA: SiteReportData = {
  siteCode: 'LKU',
  siteName: 'IKM-TH LKU (Laem Chabang Base)',
  siteLocation: 'Laem Chabang Fabrication & Testing Facility',
  periodLabel: '28 Aug - 3 Sep 2026',
  dates: ['28', '29', '30', '31', '1', '2', '3'],
  daysOfWeek: ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
  workingRows: [
    { id: 'lku-w1', category: 'direct', description: 'IKM - Staff', days: [1, 1, 1, 1, 1, 1, 1] },
    { id: 'lku-w2', category: 'direct', description: 'IKM - Office Workshop', days: [7, 8, 0, 2, 3, 3, 3] },
    { id: 'lku-w3', category: 'direct', description: 'IKM - Operation Workshop', days: [0, 0, 0, 0, 0, 0, 0] },
    { id: 'lku-w4', category: 'job', description: '024-25 BV', days: [0, 0, 0, 0, 0, 0, 0] },
    { id: 'lku-w5', category: 'job', description: '026-25 BPE', days: [0, 0, 0, 0, 0, 0, 0] },
    { id: 'lku-w6', category: 'job', description: '038-25 TESCO', days: [24, 22, 14, 28, 30, 27, 31] },
    { id: 'lku-w7', category: 'job', description: 'Adhoc-26 Vena', days: [6, 6, 0, 4, 0, 2, 0] },
  ],
  leaveRows: [
    { id: 'lku-l1', category: 'leave', description: 'Leave', days: [2, 3, 0, 5, 6, 7, 5] },
  ],
  absentRows: [
    { id: 'lku-a1', category: 'absent', description: 'Absent', days: [0, 0, 0, 0, 0, 0, 0] },
  ],
  offRows: [
    { id: 'lku-o1', category: 'off', description: 'Off', days: [0, 0, 25, 0, 0, 0, 0] },
  ],
  otherRows: [
    { id: 'lku-ot1', category: 'other', description: 'IKM Rayong', days: [1, 1, 1, 1, 1, 1, 1] },
  ]
};

const COLORS = ['#F58220', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4', '#64748B'];

export function ManpowerReport() {
  const { language } = useStore();
  const [selectedSite, setSelectedSite] = useState<SiteCode>('RY');
  const [activeTab, setActiveTab] = useState<'matrix' | 'analytics' | 'summary'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditingCell, setIsEditingCell] = useState<{ rowId: string; dayIndex: number } | null>(null);
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [newJobName, setNewJobName] = useState('');
  const [newJobCategory, setNewJobCategory] = useState<'job' | 'direct'>('job');

  // Load custom data state with LocalStorage persistence
  const [ryData, setRyData] = useState<SiteReportData>(() => {
    try {
      const saved = localStorage.getItem('ikm_manpower_ry_data');
      return saved ? JSON.parse(saved) : DEFAULT_RY_DATA;
    } catch {
      return DEFAULT_RY_DATA;
    }
  });

  const [lkuData, setLkuData] = useState<SiteReportData>(() => {
    try {
      const saved = localStorage.getItem('ikm_manpower_lku_data');
      return saved ? JSON.parse(saved) : DEFAULT_LKU_DATA;
    } catch {
      return DEFAULT_LKU_DATA;
    }
  });

  const currentData = selectedSite === 'RY' ? ryData : lkuData;

  // Persist helper
  const updateCurrentData = (newData: SiteReportData) => {
    if (selectedSite === 'RY') {
      setRyData(newData);
      try {
        localStorage.setItem('ikm_manpower_ry_data', JSON.stringify(newData));
      } catch {}
    } else {
      setLkuData(newData);
      try {
        localStorage.setItem('ikm_manpower_lku_data', JSON.stringify(newData));
      } catch {}
    }
  };

  const handleCellChange = (rowId: string, dayIndex: number, valueStr: string) => {
    const val = parseInt(valueStr, 10);
    const num = isNaN(val) || val < 0 ? 0 : val;

    const updateRows = (rows: ManpowerRow[]) =>
      rows.map(r => {
        if (r.id === rowId) {
          const newDays = [...r.days];
          newDays[dayIndex] = num;
          return { ...r, days: newDays };
        }
        return r;
      });

    const newData: SiteReportData = {
      ...currentData,
      workingRows: updateRows(currentData.workingRows),
      leaveRows: updateRows(currentData.leaveRows),
      absentRows: updateRows(currentData.absentRows),
      offRows: updateRows(currentData.offRows),
      otherRows: updateRows(currentData.otherRows),
    };

    updateCurrentData(newData);
    setIsEditingCell(null);
  };

  const handleAddNewJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobName.trim()) return;

    const newRow: ManpowerRow = {
      id: `${selectedSite.toLowerCase()}-custom-${Date.now()}`,
      category: newJobCategory,
      description: newJobName.trim(),
      isCustom: true,
      days: [0, 0, 0, 0, 0, 0, 0],
    };

    const newData: SiteReportData = {
      ...currentData,
      workingRows: [...currentData.workingRows, newRow],
    };

    updateCurrentData(newData);
    setNewJobName('');
    setIsAddJobModalOpen(false);
  };

  const handleResetDefaults = () => {
    if (window.confirm(language === 'TH' ? 'คุณต้องการรีเซ็ตข้อมูลตารางกลับเป็นค่าเริ่มต้นใช่หรือไม่?' : 'Reset table to default data?')) {
      if (selectedSite === 'RY') {
        setRyData(DEFAULT_RY_DATA);
        localStorage.removeItem('ikm_manpower_ry_data');
      } else {
        setLkuData(DEFAULT_LKU_DATA);
        localStorage.removeItem('ikm_manpower_lku_data');
      }
    }
  };

  // Calculations
  const calcSum = (rows: ManpowerRow[]) => {
    const totals = [0, 0, 0, 0, 0, 0, 0];
    rows.forEach(r => {
      r.days.forEach((d, i) => {
        totals[i] += d || 0;
      });
    });
    return totals;
  };

  const totalWorking = useMemo(() => calcSum(currentData.workingRows), [currentData.workingRows]);
  const totalLeave = useMemo(() => calcSum(currentData.leaveRows), [currentData.leaveRows]);
  const totalAbsent = useMemo(() => calcSum(currentData.absentRows), [currentData.absentRows]);
  const totalOff = useMemo(() => calcSum(currentData.offRows), [currentData.offRows]);
  const totalOther = useMemo(() => calcSum(currentData.otherRows), [currentData.otherRows]);

  const grandTotal = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6].map(i => {
      return totalWorking[i] + totalLeave[i] + totalAbsent[i] + totalOff[i] + totalOther[i];
    });
  }, [totalWorking, totalLeave, totalAbsent, totalOff, totalOther]);

  // Overall Stats
  const avgDailyWorking = useMemo(() => {
    const sum = totalWorking.reduce((a, b) => a + b, 0);
    return (sum / 7).toFixed(1);
  }, [totalWorking]);

  const peakWorking = useMemo(() => Math.max(...totalWorking), [totalWorking]);
  const peakWorkingDay = useMemo(() => {
    const max = Math.max(...totalWorking);
    const idx = totalWorking.indexOf(max);
    return `${currentData.dates[idx]} Aug/Sep (${currentData.daysOfWeek[idx]})`;
  }, [totalWorking, currentData]);

  // Top Active Jobs Chart Data
  const jobDistribution = useMemo(() => {
    const jobRows = currentData.workingRows.filter(r => r.category === 'job' || r.days.some(d => d > 0));
    return jobRows.map(r => ({
      name: r.description.replace(/^Job No\.\s*/i, ''),
      fullName: r.description,
      totalManDays: r.days.reduce((a, b) => a + b, 0),
    })).filter(j => j.totalManDays > 0)
      .sort((a, b) => b.totalManDays - a.totalManDays);
  }, [currentData.workingRows]);

  // Daily Chart Series
  const dailyChartData = useMemo(() => {
    return currentData.dates.map((date, idx) => ({
      date: `${date} (${currentData.daysOfWeek[idx]})`,
      Working: totalWorking[idx],
      Leave: totalLeave[idx],
      Off: totalOff[idx],
      Absent: totalAbsent[idx],
      Total: grandTotal[idx]
    }));
  }, [currentData, totalWorking, totalLeave, totalOff, totalAbsent, grandTotal]);

  // Filtered Rows
  const filteredWorkingRows = useMemo(() => {
    return currentData.workingRows.filter(r => {
      const matchSearch = r.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchActive = filterActiveOnly ? r.days.some(d => d > 0) : true;
      return matchSearch && matchActive;
    });
  }, [currentData.workingRows, searchQuery, filterActiveOnly]);

  // Copy Summary text for LINE / Email
  const handleCopySummary = () => {
    const lines = [
      `📊 ${currentData.siteName}`,
      `📅 Manpower Weekly Report: ${currentData.periodLabel}`,
      `---------------------------------------`,
      ...currentData.dates.map((d, i) => {
        return `• วันที่ ${d} (${currentData.daysOfWeek[i]}): ทำงาน ${totalWorking[i]} คน | ลา ${totalLeave[i]} | Off ${totalOff[i]} (รวม ${grandTotal[i]} คน)`;
      }),
      `---------------------------------------`,
      `⭐ สรุปยอดเฉลี่ยทำงาน: ${avgDailyWorking} คน/วัน (สูงสุด ${peakWorking} คน)`,
      `🏭 IKM Operations Management System`
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Category', 'Description', ...currentData.dates.map((d, i) => `${d} (${currentData.daysOfWeek[i]})`), 'Total Man-Days'];
    const rowsData: (string | number)[][] = [];

    // Working rows
    currentData.workingRows.forEach(r => {
      rowsData.push([
        r.category,
        `"${r.description}"`,
        ...r.days,
        r.days.reduce((a, b) => a + b, 0)
      ]);
    });

    rowsData.push(['Summary', 'Total Working', ...totalWorking, totalWorking.reduce((a, b) => a + b, 0)]);

    // Leave rows
    currentData.leaveRows.forEach(r => {
      rowsData.push(['Leave', `"${r.description}"`, ...r.days, r.days.reduce((a, b) => a + b, 0)]);
    });
    rowsData.push(['Summary', 'Total Leave', ...totalLeave, totalLeave.reduce((a, b) => a + b, 0)]);

    // Absent & Off
    currentData.absentRows.forEach(r => rowsData.push(['Absent', `"${r.description}"`, ...r.days, r.days.reduce((a, b) => a + b, 0)]));
    currentData.offRows.forEach(r => rowsData.push(['Off', `"${r.description}"`, ...r.days, r.days.reduce((a, b) => a + b, 0)]));
    currentData.otherRows.forEach(r => rowsData.push(['Other', `"${r.description}"`, ...r.days, r.days.reduce((a, b) => a + b, 0)]));

    rowsData.push(['Summary', 'GRAND TOTAL', ...grandTotal, grandTotal.reduce((a, b) => a + b, 0)]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rowsData.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IKM_Manpower_Report_${selectedSite}_${currentData.periodLabel.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const t = {
    EN: {
      title: 'Manpower Job Summary Report',
      subtitle: 'Daily & Weekly Manpower Allocation by Project & Base',
      siteRY: 'Rayong Base (RY)',
      siteLKU: 'Laem Chabang (LKU)',
      tabMatrix: 'Spreadsheet Report Matrix',
      tabAnalytics: 'Analytics & Allocation',
      tabSummary: 'Executive Brief',
      workingHeader: 'Total Manpower Work',
      leaveHeader: 'Total Manpower Leave',
      grandTotal: 'Total Active Headcount',
      addJob: 'Add Job / Line',
      reset: 'Reset Default',
      exportCSV: 'Export CSV',
      print: 'Print Report',
      copyLine: 'Copy Text Summary',
      copied: 'Copied to Clipboard!',
      searchPlaceholder: 'Search Job No. or Description...',
      activeOnly: 'Active Only (>0)',
      kpiTotalWork: 'Avg Daily Deployed',
      kpiPeak: 'Peak Deployment Day',
      kpiJobs: 'Active Client Jobs',
      kpiSites: 'Selected Site Base',
      personUnit: 'people',
      manDays: 'Man-Days',
      clickToEdit: 'Click number cell to edit value directly',
    },
    TH: {
      title: 'รายงานสรุป Manpower ประจำโครงการ & ไซต์งาน',
      subtitle: 'สรุปยอดจัดสรรกำลังคนของแต่ละ Job ประจำวันและรายสัปดาห์',
      siteRY: 'ฐานปฏิบัติการระยอง (IKM-TH RY)',
      siteLKU: 'ฐานแหลมฉบัง (IKM-TH LKU)',
      tabMatrix: 'ตารางรายงาน Manpower (Matrix View)',
      tabAnalytics: 'สถิติและสัดส่วนกราฟ (Analytics)',
      tabSummary: 'สรุปผู้บริหาร (Executive Summary)',
      workingHeader: selectedSite === 'RY' ? 'Total Manpower Work' : 'Total working',
      leaveHeader: 'Total Manpower Leave',
      grandTotal: 'Total (ยอดกำลังพลรวมทั้งหมด)',
      addJob: 'เพิ่ม Job / รายการงาน',
      reset: 'รีเซ็ตค่าเริ่มต้น',
      exportCSV: 'ส่งออกไฟล์ CSV / Excel',
      print: 'พิมพ์รายงาน (Print)',
      copyLine: 'คัดลอกสรุปส่ง LINE',
      copied: 'คัดลอกข้อความสรุปแล้ว!',
      searchPlaceholder: 'ค้นหา Job No. หรือชื่อโครงการ...',
      activeOnly: 'แสดงเฉพาะที่มีคนทำงาน (>0)',
      kpiTotalWork: 'กำลังคนเฉลี่ย/วัน',
      kpiPeak: 'วันที่ใช้งานกำลังคนสูงสุด',
      kpiJobs: 'จำนวน Job ที่กำลังทำ',
      kpiSites: 'ฐานปฏิบัติการปัจจุบัน',
      personUnit: 'คน',
      manDays: 'แมนเดย์ (Man-Days)',
      clickToEdit: 'คลิกที่ตัวเลขในตารางเพื่อแก้ไขจำนวนคนได้ทันที',
    }
  }[language];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-28">
      
      {/* 1. Header Banner & Site Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-ikm-card to-ikm-bg border border-ikm-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-ikm-orange/10 text-ikm-orange flex items-center justify-center shadow-inner flex-shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                selectedSite === 'RY' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
              }`}>
                {currentData.siteCode} Base
              </span>
              <span className="text-xs font-semibold text-ikm-text-secondary flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-ikm-orange" />
                {currentData.periodLabel}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-ikm-text tracking-tight">{t.title}</h1>
            <p className="text-sm text-ikm-text-secondary mt-0.5">{currentData.siteName} — {currentData.siteLocation}</p>
          </div>
        </div>

        {/* Site Switcher Buttons */}
        <div className="flex items-center gap-2 bg-ikm-bg p-1.5 rounded-xl border border-ikm-border self-start lg:self-center">
          <button
            onClick={() => setSelectedSite('RY')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
              selectedSite === 'RY' 
                ? 'bg-ikm-orange text-white shadow-md shadow-ikm-orange/20' 
                : 'text-ikm-text-secondary hover:text-ikm-text hover:bg-ikm-card'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>IKM-TH RY (ระยอง)</span>
          </button>
          <button
            onClick={() => setSelectedSite('LKU')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
              selectedSite === 'LKU' 
                ? 'bg-status-blue text-white shadow-md shadow-blue-500/20' 
                : 'text-ikm-text-secondary hover:text-ikm-text hover:bg-ikm-card'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>IKM-TH LKU (แหลมฉบัง)</span>
          </button>
        </div>
      </div>

      {/* 2. Top KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow border-l-4 border-l-ikm-orange">
          <div className="w-11 h-11 rounded-xl bg-ikm-orange/10 text-ikm-orange flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-ikm-text-secondary font-medium">{t.kpiTotalWork}</div>
            <div className="text-xl font-bold text-ikm-text mt-0.5">
              {avgDailyWorking} <span className="text-xs font-normal text-ikm-text-secondary">{t.personUnit}/วัน</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow border-l-4 border-l-status-blue">
          <div className="w-11 h-11 rounded-xl bg-status-blue/10 text-status-blue flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-ikm-text-secondary font-medium">{t.kpiPeak}</div>
            <div className="text-xl font-bold text-ikm-text mt-0.5">
              {peakWorking} <span className="text-xs font-normal text-ikm-text-secondary">{t.personUnit}</span>
            </div>
            <div className="text-[11px] text-ikm-text-secondary truncate">{peakWorkingDay}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow border-l-4 border-l-status-green">
          <div className="w-11 h-11 rounded-xl bg-status-green/10 text-status-green flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-ikm-text-secondary font-medium">{t.kpiJobs}</div>
            <div className="text-xl font-bold text-ikm-text mt-0.5">
              {jobDistribution.length} <span className="text-xs font-normal text-ikm-text-secondary">Jobs</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-ikm-text-secondary font-medium">Total Man-Days</div>
            <div className="text-xl font-bold text-ikm-text mt-0.5">
              {totalWorking.reduce((a, b) => a + b, 0)} <span className="text-xs font-normal text-ikm-text-secondary">Days</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Action Toolbar & View Mode Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-ikm-bg p-1 rounded-xl border border-ikm-border">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'matrix' ? 'bg-ikm-card text-ikm-orange shadow-sm' : 'text-ikm-text-secondary hover:text-ikm-text'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{t.tabMatrix}</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'analytics' ? 'bg-ikm-card text-ikm-orange shadow-sm' : 'text-ikm-text-secondary hover:text-ikm-text'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{t.tabAnalytics}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddJobModalOpen(true)}
            className="h-9 px-3 rounded-lg bg-ikm-orange hover:bg-ikm-orange-dark text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addJob}</span>
          </button>

          <button
            onClick={handleCopySummary}
            className={`h-9 px-3 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
              copied 
                ? 'bg-status-green text-white border-status-green' 
                : 'bg-ikm-card hover:bg-ikm-bg text-ikm-text border-ikm-border'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-ikm-orange" />}
            <span>{copied ? t.copied : t.copyLine}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="h-9 px-3 rounded-lg bg-ikm-card hover:bg-ikm-bg text-ikm-text border border-ikm-border text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-status-green" />
            <span>{t.exportCSV}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="h-9 px-3 rounded-lg bg-ikm-card hover:bg-ikm-bg text-ikm-text border border-ikm-border text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-ikm-text-secondary" />
            <span>{t.print}</span>
          </button>

          <button
            onClick={handleResetDefaults}
            title={t.reset}
            className="h-9 w-9 rounded-lg bg-ikm-card hover:bg-ikm-bg text-ikm-text-secondary hover:text-ikm-text border border-ikm-border flex items-center justify-center transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Tab 1: Spreadsheet Matrix View (Exact Form as in Images) */}
      {activeTab === 'matrix' && (
        <Card className="overflow-hidden border border-ikm-border shadow-md">
          {/* Table Header Filter & Info */}
          <div className="p-3.5 bg-ikm-bg border-b border-ikm-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ikm-text-secondary" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-ikm-border bg-ikm-card text-ikm-text focus:outline-none focus:ring-1 focus:ring-ikm-orange"
                />
              </div>
              <button
                onClick={() => setFilterActiveOnly(!filterActiveOnly)}
                className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                  filterActiveOnly ? 'bg-ikm-orange text-white border-ikm-orange' : 'bg-ikm-card text-ikm-text-secondary border-ikm-border'
                }`}
              >
                <Filter className="w-3 h-3" />
                <span>{t.activeOnly}</span>
              </button>
            </div>
            <div className="text-[11px] text-ikm-text-secondary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-ikm-orange animate-pulse" />
              <span>{t.clickToEdit}</span>
            </div>
          </div>

          {/* SPREADSHEET TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              {/* Top Banner Row */}
              <thead>
                <tr className={`${selectedSite === 'RY' ? 'bg-[#FFDFC2] dark:bg-orange-950/60' : 'bg-[#FFD7BA] dark:bg-amber-950/60'}`}>
                  <th className="px-4 py-3 text-left font-black text-gray-900 dark:text-gray-100 text-base md:text-lg border border-gray-400 dark:border-gray-700 w-72 md:w-80">
                    {currentData.siteCode === 'RY' ? 'IKM-TH RY' : 'IKM-TH LKU'}
                  </th>
                  <th colSpan={7} className="px-4 py-3 text-center font-black text-gray-900 dark:text-gray-100 text-sm md:text-base border border-gray-400 dark:border-gray-700">
                    {currentData.siteCode === 'RY' ? `Period on ${currentData.periodLabel}` : `Manpower weekly report ${currentData.periodLabel}`}
                  </th>
                  <th className="px-3 py-3 text-center font-black text-gray-900 dark:text-gray-100 text-xs border border-gray-400 dark:border-gray-700 bg-gray-200 dark:bg-gray-800 w-20">
                    Total
                  </th>
                </tr>

                {/* Column Headers (Date columns) */}
                <tr className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  <th className="px-4 py-2.5 text-left font-bold text-xs uppercase border border-gray-300 dark:border-gray-700">
                    Description
                  </th>
                  {currentData.dates.map((date, idx) => {
                    const isSunday = idx === 2; // Date 30 Sunday highlight
                    return (
                      <th 
                        key={idx} 
                        className={`px-2 py-2 text-center font-bold text-xs md:text-sm border border-gray-300 dark:border-gray-700 ${
                          isSunday ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 font-black' : ''
                        }`}
                      >
                        <div>{date}</div>
                        <div className="text-[10px] font-normal text-gray-500 dark:text-gray-400">{currentData.daysOfWeek[idx]}</div>
                      </th>
                    );
                  })}
                  <th className="px-2 py-2 text-center font-bold text-xs border border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-800">
                    Man-Days
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* SECTION 1: WORKING ROWS / CLIENT JOBS */}
                {filteredWorkingRows.map((row) => {
                  const rowSum = row.days.reduce((a, b) => a + b, 0);
                  const isJob = row.category === 'job';
                  const isSpecialHighlight = row.description.toLowerCase().includes('freelancer - lku') || row.description.toLowerCase().includes('ikm rayong');

                  return (
                    <tr 
                      key={row.id} 
                      className={`hover:bg-ikm-orange/5 transition-colors ${
                        isSpecialHighlight ? 'bg-amber-50 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="px-4 py-2 border border-gray-300 dark:border-gray-700 font-semibold text-gray-800 dark:text-gray-200 text-xs md:text-sm">
                        <div className="flex items-center justify-between">
                          <span className={isJob ? 'font-bold text-ikm-text' : ''}>{row.description}</span>
                          {row.isCustom && (
                            <span className="text-[9px] bg-ikm-orange/10 text-ikm-orange px-1 rounded">Custom</span>
                          )}
                        </div>
                      </td>

                      {row.days.map((val, dIdx) => {
                        const isSunday = dIdx === 2;
                        const isEditing = isEditingCell?.rowId === row.id && isEditingCell.dayIndex === dIdx;

                        return (
                          <td 
                            key={dIdx} 
                            onClick={() => setIsEditingCell({ rowId: row.id, dayIndex: dIdx })}
                            className={`px-2 py-1.5 text-center text-xs md:text-sm border border-gray-300 dark:border-gray-700 cursor-pointer font-bold ${
                              isSunday ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                            } ${val > 0 ? 'text-gray-900 dark:text-gray-100 font-extrabold' : 'text-gray-400 dark:text-gray-500'}`}
                          >
                            {isEditing ? (
                              <input
                                type="number"
                                autoFocus
                                min={0}
                                defaultValue={val}
                                onBlur={(e) => handleCellChange(row.id, dIdx, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleCellChange(row.id, dIdx, (e.target as HTMLInputElement).value);
                                  if (e.key === 'Escape') setIsEditingCell(null);
                                }}
                                className="w-10 h-7 text-center font-bold bg-white text-black border border-ikm-orange rounded shadow-sm focus:outline-none"
                              />
                            ) : (
                              <span className="inline-block w-full py-0.5 hover:bg-ikm-orange/20 rounded transition-colors">
                                {val}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      <td className="px-2 py-1.5 text-center font-bold text-xs border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-ikm-orange">
                        {rowSum}
                      </td>
                    </tr>
                  );
                })}

                {/* SUBTOTAL 1: TOTAL WORKING */}
                <tr className={`${
                  selectedSite === 'RY' ? 'bg-[#D9EAD3] dark:bg-emerald-950/60' : 'bg-[#D9E1F2] dark:bg-indigo-950/60'
                } font-black text-gray-900 dark:text-gray-100`}>
                  <td className="px-4 py-2.5 border border-gray-400 dark:border-gray-700 text-xs md:text-sm uppercase tracking-wide">
                    {t.workingHeader}
                  </td>
                  {totalWorking.map((sum, idx) => (
                    <td 
                      key={idx} 
                      className={`px-2 py-2.5 text-center font-black text-xs md:text-base border border-gray-400 dark:border-gray-700 ${
                        idx === 2 ? 'bg-blue-200 dark:bg-blue-900/60' : ''
                      }`}
                    >
                      {sum}
                    </td>
                  ))}
                  <td className="px-2 py-2.5 text-center font-black text-xs md:text-sm border border-gray-400 dark:border-gray-700">
                    {totalWorking.reduce((a, b) => a + b, 0)}
                  </td>
                </tr>

                {/* SECTION 2: LEAVE ROWS */}
                {currentData.leaveRows.map((row) => {
                  const rowSum = row.days.reduce((a, b) => a + b, 0);
                  return (
                    <tr key={row.id} className="hover:bg-red-50/20 transition-colors">
                      <td className="px-4 py-1.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs md:text-sm">
                        {row.description}
                      </td>
                      {row.days.map((val, dIdx) => (
                        <td 
                          key={dIdx}
                          onClick={() => setIsEditingCell({ rowId: row.id, dayIndex: dIdx })}
                          className={`px-2 py-1.5 text-center text-xs md:text-sm border border-gray-300 dark:border-gray-700 cursor-pointer ${
                            dIdx === 2 ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                          } ${val > 0 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-400'}`}
                        >
                          {isEditingCell?.rowId === row.id && isEditingCell.dayIndex === dIdx ? (
                            <input
                              type="number"
                              autoFocus
                              min={0}
                              defaultValue={val}
                              onBlur={(e) => handleCellChange(row.id, dIdx, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellChange(row.id, dIdx, (e.target as HTMLInputElement).value);
                                if (e.key === 'Escape') setIsEditingCell(null);
                              }}
                              className="w-10 h-7 text-center font-bold bg-white text-black border border-ikm-orange rounded shadow-sm"
                            />
                          ) : (
                            val
                          )}
                        </td>
                      ))}
                      <td className="px-2 py-1.5 text-center font-semibold text-xs border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        {rowSum}
                      </td>
                    </tr>
                  );
                })}

                {/* SUBTOTAL 2: TOTAL LEAVE (FOR RY) */}
                {selectedSite === 'RY' && (
                  <tr className="bg-[#D9EAD3] dark:bg-emerald-950/50 font-bold text-gray-900 dark:text-gray-100">
                    <td className="px-4 py-2 border border-gray-400 dark:border-gray-700 text-xs md:text-sm">
                      {t.leaveHeader}
                    </td>
                    {totalLeave.map((sum, idx) => (
                      <td key={idx} className="px-2 py-2 text-center font-bold text-xs md:text-sm border border-gray-400 dark:border-gray-700">
                        {sum}
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center font-bold text-xs border border-gray-400 dark:border-gray-700">
                      {totalLeave.reduce((a, b) => a + b, 0)}
                    </td>
                  </tr>
                )}

                {/* SECTION 3: ABSENT & OFF & OTHER ROWS */}
                {currentData.absentRows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-1.5 border border-gray-300 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 text-xs md:text-sm">
                      {row.description}
                    </td>
                    {row.days.map((val, dIdx) => (
                      <td 
                        key={dIdx}
                        onClick={() => setIsEditingCell({ rowId: row.id, dayIndex: dIdx })}
                        className={`px-2 py-1.5 text-center text-xs md:text-sm border border-gray-300 dark:border-gray-700 cursor-pointer ${
                          val > 0 ? 'text-red-600 font-bold' : 'text-gray-400'
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                    <td className="px-2 py-1.5 text-center font-semibold text-xs border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      {row.days.reduce((a, b) => a + b, 0)}
                    </td>
                  </tr>
                ))}

                {currentData.offRows.map((row) => (
                  <tr key={row.id} className="bg-[#E2EFDA]/60 dark:bg-emerald-950/20">
                    <td className="px-4 py-1.5 border border-gray-300 dark:border-gray-700 font-semibold text-gray-800 dark:text-gray-200 text-xs md:text-sm">
                      {row.description}
                    </td>
                    {row.days.map((val, dIdx) => (
                      <td 
                        key={dIdx}
                        onClick={() => setIsEditingCell({ rowId: row.id, dayIndex: dIdx })}
                        className={`px-2 py-1.5 text-center text-xs md:text-sm border border-gray-300 dark:border-gray-700 cursor-pointer font-bold ${
                          val > 0 ? 'text-emerald-700 dark:text-emerald-300 font-black' : 'text-gray-400'
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                    <td className="px-2 py-1.5 text-center font-bold text-xs border border-gray-300 dark:border-gray-700">
                      {row.days.reduce((a, b) => a + b, 0)}
                    </td>
                  </tr>
                ))}

                {currentData.otherRows.map((row) => (
                  <tr key={row.id} className="bg-purple-50 dark:bg-purple-950/20">
                    <td className="px-4 py-1.5 border border-gray-300 dark:border-gray-700 font-bold text-purple-900 dark:text-purple-200 text-xs md:text-sm">
                      {row.description}
                    </td>
                    {row.days.map((val, dIdx) => (
                      <td key={dIdx} className="px-2 py-1.5 text-center font-bold text-xs md:text-sm border border-gray-300 dark:border-gray-700 text-purple-700 dark:text-purple-300">
                        {val}
                      </td>
                    ))}
                    <td className="px-2 py-1.5 text-center font-bold text-xs border border-gray-300 dark:border-gray-700">
                      {row.days.reduce((a, b) => a + b, 0)}
                    </td>
                  </tr>
                ))}

                {/* BOTTOM GRAND TOTAL */}
                <tr className={`${
                  selectedSite === 'RY' ? 'bg-[#A9D08E] dark:bg-emerald-800 text-gray-950 dark:text-white' : 'bg-[#5B9BD5] dark:bg-blue-800 text-white'
                } font-black text-sm md:text-base`}>
                  <td className="px-4 py-3 border border-gray-500 dark:border-gray-600 uppercase tracking-wider">
                    Total
                  </td>
                  {grandTotal.map((sum, idx) => (
                    <td key={idx} className="px-2 py-3 text-center font-black border border-gray-500 dark:border-gray-600">
                      {sum}
                    </td>
                  ))}
                  <td className="px-2 py-3 text-center font-black border border-gray-500 dark:border-gray-600">
                    {grandTotal.reduce((a, b) => a + b, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. Tab 2: Visual Charts & Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Deployment Trend */}
            <Card className="p-5">
              <h3 className="text-base font-bold text-ikm-text mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-ikm-orange" />
                <span>แนวโน้มกำลังพลรายวัน (Daily Working vs Leave vs Off)</span>
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} width={30} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)' }} />
                    <Legend />
                    <Bar dataKey="Working" fill="#F58220" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Leave" fill="#EF4444" stackId="a" />
                    <Bar dataKey="Off" fill="#10B981" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Manpower by Project Allocation */}
            <Card className="p-5">
              <h3 className="text-base font-bold text-ikm-text mb-4 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-status-blue" />
                <span>สัดส่วนกำลังคนตามแต่ละ Job / โครงการ (Man-Days Share)</span>
              </h3>
              <div className="h-72 flex flex-col md:flex-row items-center">
                <div className="w-full md:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={jobDistribution}
                        dataKey="totalManDays"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        paddingAngle={3}
                      >
                        {jobDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-border)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 max-h-56 overflow-y-auto space-y-2 pr-2">
                  {jobDistribution.map((j, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-ikm-bg transition-colors">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="font-semibold text-ikm-text truncate">{j.name}</span>
                      </div>
                      <span className="font-bold text-ikm-orange flex-shrink-0">{j.totalManDays} d</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Project Detailed Table Breakdown */}
          <Card className="p-5">
            <h3 className="text-base font-bold text-ikm-text mb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-ikm-green" />
              <span>สรุปรายละเอียดกำลังพลแยกตาม Job No. (Job Ranking)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {jobDistribution.map((job, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-ikm-bg border border-ikm-border flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-ikm-text">{job.fullName}</div>
                    <div className="text-xs text-ikm-text-secondary mt-0.5">
                      เฉลี่ย {(job.totalManDays / 7).toFixed(1)} คน/วัน
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-extrabold text-ikm-orange">{job.totalManDays}</div>
                    <div className="text-[10px] text-ikm-text-secondary uppercase">Man-Days</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 6. Modal: Add New Job / Line Item */}
      {isAddJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-ikm-card border border-ikm-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-ikm-border pb-3">
              <h3 className="text-lg font-bold text-ikm-text flex items-center gap-2">
                <Plus className="w-5 h-5 text-ikm-orange" />
                <span>เพิ่ม Job / โครงการใหม่ในตาราง</span>
              </h3>
              <button 
                onClick={() => setIsAddJobModalOpen(false)}
                className="text-ikm-text-secondary hover:text-ikm-text text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewJob} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ikm-text mb-1.5">
                  ชื่อ Job No. หรือรายการ (เช่น Job No. 052-26 Chevron)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Job No. xxx-xx หรือ ชื่องาน..."
                  value={newJobName}
                  onChange={(e) => setNewJobName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-ikm-border bg-ikm-bg text-sm text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ikm-text mb-1.5">
                  ประเภทรายการ (Category)
                </label>
                <select
                  value={newJobCategory}
                  onChange={(e) => setNewJobCategory(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-ikm-border bg-ikm-bg text-sm text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange"
                >
                  <option value="job">Client Job / Project (โครงการลูกค้า)</option>
                  <option value="direct">Direct Staff / Workshop (บุคลากรประจำ/ช็อป)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddJobModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-ikm-text-secondary hover:bg-ikm-bg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-ikm-orange text-white hover:bg-ikm-orange-dark transition-all shadow-md"
                >
                  เพิ่มรายการลงตาราง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
