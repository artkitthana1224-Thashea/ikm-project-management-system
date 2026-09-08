import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, 
  Clock, MapPin, Users, CheckCircle2, Circle, AlertTriangle, 
  Filter, Search, X, Tag, Shield, Wrench, Briefcase, 
  Layers, CheckSquare, Trash2, Edit3, ArrowRight, Eye
} from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { format, isSameDay, parseISO } from 'date-fns';

export interface CalendarEvent {
  id: string;
  title: string;
  titleTh: string;
  category: 'inspection' | 'maintenance' | 'safety' | 'meeting' | 'milestone' | 'deadline';
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  location: string;
  project?: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Pending';
  assignees: { id: string; name: string; role: string; avatar?: string }[];
  description: string;
  descriptionTh: string;
  checklist: { id: string; text: string; completed: boolean }[];
}

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'EVT-101',
    title: 'Site Safety Walk & HSE Audit',
    titleTh: 'การตรวจความปลอดภัยหน้างาน & HSE Audit',
    category: 'safety',
    date: '2026-09-08',
    startTime: '08:30',
    endTime: '10:30',
    location: 'Zone B - Compressor Station',
    project: 'P-2026-018',
    priority: 'High',
    status: 'Scheduled',
    assignees: [
      { id: 'E-002', name: 'Siriwan P.', role: 'Safety Inspector', avatar: 'https://i.pravatar.cc/150?u=e-002' },
      { id: 'E-001', name: 'Kittipong M.', role: 'Lead Engineer', avatar: 'https://i.pravatar.cc/150?u=e-001' }
    ],
    description: 'Quarterly environmental, health and safety walk-through inspection with plant manager and contractor leads.',
    descriptionTh: 'การเดินตรวจความปลอดภัยและสุขอนามัยประจำไตรมาสร่วมกับผู้จัดการโรงงานและหัวหน้าผู้รับเหมา',
    checklist: [
      { id: 'c1', text: 'Check PPE compliance at Zone B', completed: true },
      { id: 'c2', text: 'Verify fire extinguisher certification dates', completed: false },
      { id: 'c3', text: 'Inspect scaffold safety tags and anchor points', completed: false }
    ]
  },
  {
    id: 'EVT-102',
    title: 'Turbine Generator Scheduled PM',
    titleTh: 'บำรุงรักษาเชิงป้องกันกังหันเครื่องกำเนิดไฟฟ้า (PM)',
    category: 'maintenance',
    date: '2026-09-10',
    startTime: '13:00',
    endTime: '17:00',
    location: 'Power Generation Building Room 2',
    project: 'P-2026-019',
    priority: 'Critical',
    status: 'Scheduled',
    assignees: [
      { id: 'E-003', name: 'Anurak T.', role: 'Technician', avatar: 'https://i.pravatar.cc/150?u=e-003' },
      { id: 'E-006', name: 'Prapas V.', role: 'Technician', avatar: 'https://i.pravatar.cc/150?u=e-006' }
    ],
    description: 'Routine preventive maintenance overhaul, oil lube analysis, and vibration sensor diagnostics.',
    descriptionTh: 'การบำรุงรักษาตามรอบปกติ การตรวจสอบคุณภาพน้ำมันหล่อลื่น และตรวจวัดความสั่นสะเทือนของเซนเซอร์',
    checklist: [
      { id: 'c1', text: 'Lube oil sampling and filter change', completed: false },
      { id: 'c2', text: 'Vibration analysis report', completed: false },
      { id: 'c3', text: 'Calibrate speed governor unit', completed: false }
    ]
  },
  {
    id: 'EVT-103',
    title: 'Client Progress & Milestone Sync',
    titleTh: 'ประชุมรายงานความคืบหน้าโครงการกับลูกค้า',
    category: 'meeting',
    date: '2026-09-12',
    startTime: '10:00',
    endTime: '11:30',
    location: 'Executive Boardroom & Microsoft Teams',
    project: 'P-2026-018',
    priority: 'High',
    status: 'Scheduled',
    assignees: [
      { id: 'U-001', name: 'Somchai S.', role: 'Site Manager', avatar: 'https://i.pravatar.cc/150?u=somchai' },
      { id: 'E-001', name: 'Kittipong M.', role: 'Lead Engineer', avatar: 'https://i.pravatar.cc/150?u=e-001' }
    ],
    description: 'Phase 2 deliverables review, schedule sign-off, and variation order budget authorization.',
    descriptionTh: 'การทบทวนผลการส่งมอบงานระยะที่ 2 การอนุมัติแผนงานและการลงนามเอกสารขยายงบประมาณ',
    checklist: [
      { id: 'c1', text: 'Prepare S-Curve progress slides', completed: true },
      { id: 'c2', text: 'Review punch-list item closure rate', completed: true },
      { id: 'c3', text: 'Present updated timeline to client director', completed: false }
    ]
  },
  {
    id: 'EVT-104',
    title: 'High-Pressure Piping Hydrotest',
    titleTh: 'การทดสอบแรงดันน้ำท่อส่งความดันสูง (Hydrotest)',
    category: 'inspection',
    date: '2026-09-15',
    startTime: '09:00',
    endTime: '15:00',
    location: 'Offshore Module 4B',
    project: 'P-2026-010',
    priority: 'Critical',
    status: 'Scheduled',
    assignees: [
      { id: 'E-001', name: 'Kittipong M.', role: 'Lead Engineer', avatar: 'https://i.pravatar.cc/150?u=e-001' },
      { id: 'E-004', name: 'Wichai D.', role: 'Foreman', avatar: 'https://i.pravatar.cc/150?u=e-004' }
    ],
    description: 'Hydrostatic pressure integrity validation at 1.5x design pressure witnessed by 3rd party inspector.',
    descriptionTh: 'การทดสอบความสมบูรณ์ของระบบท่อด้วยแรงดันน้ำ 1.5 เท่าของแรงดันออกแบบโดยมีผู้ตรวจรับอิสระร่วมเป็นสักขีพยาน',
    checklist: [
      { id: 'c1', text: 'Verify blind flanges torque specs', completed: false },
      { id: 'c2', text: 'Hold pressure at 150 bar for 4 hours', completed: false },
      { id: 'c3', text: 'Obtain 3rd party QA stamp and sign-off', completed: false }
    ]
  },
  {
    id: 'EVT-105',
    title: 'ISO 9001 Quality Assurance Walk',
    titleTh: 'การตรวจประเมินคุณภาพ ISO 9001 ภาคสนาม',
    category: 'inspection',
    date: '2026-09-18',
    startTime: '13:30',
    endTime: '16:00',
    location: 'Fabrication Yard & Warehouse',
    project: 'P-2026-018',
    priority: 'Medium',
    status: 'Scheduled',
    assignees: [
      { id: 'E-002', name: 'Siriwan P.', role: 'Safety Inspector', avatar: 'https://i.pravatar.cc/150?u=e-002' },
      { id: 'E-005', name: 'Nattapong J.', role: 'Engineer', avatar: 'https://i.pravatar.cc/150?u=e-005' }
    ],
    description: 'Quality surveillance walk focusing on calibration certificates, weld map logs, and material test reports.',
    descriptionTh: 'การตรวจติดตามคุณภาพเน้นใบรับรองการสอบเทียบเครื่องมือ บันทึกการเชื่อม และเอกสารรับรองคุณสมบัติวัสดุ',
    checklist: [
      { id: 'c1', text: 'Audit welding rod storage oven temp log', completed: false },
      { id: 'c2', text: 'Inspect non-conformance report tracking board', completed: false }
    ]
  },
  {
    id: 'EVT-106',
    title: 'Electrical Substation SCADA Integration',
    titleTh: 'เชื่อมต่อและทดสอบระบบ SCADA สถานีไฟฟ้าย่อย',
    category: 'milestone',
    date: '2026-09-22',
    startTime: '08:00',
    endTime: '12:00',
    location: 'Substation Control Center',
    project: 'P-2026-004',
    priority: 'High',
    status: 'Scheduled',
    assignees: [
      { id: 'E-007', name: 'Sunisa K.', role: 'Engineer', avatar: 'https://i.pravatar.cc/150?u=e-007' }
    ],
    description: 'Full signal loop test and real-time telemetry streaming verification to the central monitoring center.',
    descriptionTh: 'การทดสอบวงจรสัญญาณและระบบส่งข้อมูลทางไกลเข้าสู่ศูนย์ควบคุมส่วนกลาง',
    checklist: [
      { id: 'c1', text: 'PLC point-to-point I/O checking', completed: false },
      { id: 'c2', text: 'Emergency shutdown signal verification', completed: false }
    ]
  },
  {
    id: 'EVT-107',
    title: 'Monthly Safety Committee & Fire Drill',
    titleTh: 'ประชุมคณะกรรมการความปลอดภัย & ซักซ้อมแผนดับเพลิง',
    category: 'safety',
    date: '2026-09-25',
    startTime: '14:00',
    endTime: '16:30',
    location: 'Assembly Point A & Main Training Hall',
    project: 'P-2026-018',
    priority: 'Medium',
    status: 'Scheduled',
    assignees: [
      { id: 'E-002', name: 'Siriwan P.', role: 'Safety Inspector', avatar: 'https://i.pravatar.cc/150?u=e-002' },
      { id: 'U-001', name: 'Somchai S.', role: 'Site Manager', avatar: 'https://i.pravatar.cc/150?u=somchai' }
    ],
    description: 'Monthly emergency evacuation drill, fire extinguisher training, and incident trend reviews.',
    descriptionTh: 'การซ้อมอพยพหนีไฟประจำเดือน การอบรมการใช้ถังดับเพลิง และสรุปสถิติความปลอดภัยหน้างาน',
    checklist: [
      { id: 'c1', text: 'Test emergency siren notification system', completed: false },
      { id: 'c2', text: 'Record evacuation headcount timing', completed: false }
    ]
  },
  {
    id: 'EVT-108',
    title: 'Final Commissioning Sign-off Deadline',
    titleTh: 'กำหนดส่งมอบงานทดสอบระบบขั้นสุดท้าย (Commissioning)',
    category: 'deadline',
    date: '2026-09-28',
    startTime: '17:00',
    endTime: '18:00',
    location: 'Project Office Site B',
    project: 'P-2026-018',
    priority: 'Critical',
    status: 'Pending',
    assignees: [
      { id: 'U-001', name: 'Somchai S.', role: 'Site Manager', avatar: 'https://i.pravatar.cc/150?u=somchai' },
      { id: 'E-001', name: 'Kittipong M.', role: 'Lead Engineer', avatar: 'https://i.pravatar.cc/150?u=e-001' }
    ],
    description: 'Official handover documentation and final acceptance certificate sign-off with the client representatives.',
    descriptionTh: 'การส่งมอบเอกสารและลงนามในใบรับรองการตรวจรับงานขั้นสุดท้ายอย่างเป็นทางการ',
    checklist: [
      { id: 'c1', text: 'Compile As-Built drawing dossiers', completed: false },
      { id: 'c2', text: 'Final client punch-list clearance sign-off', completed: false }
    ]
  }
];

export function CalendarView() {
  const { language, employees, user } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 8)); // September 2026 (Month is 0-indexed: 8 = Sep)
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('ikm_calendar_events');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_EVENTS;
  });

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal / Popup State
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [activeEventDetail, setActiveEventDetail] = useState<CalendarEvent | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState<boolean>(false);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<CalendarEvent['category']>('inspection');
  const [newEventStartTime, setNewEventStartTime] = useState('09:00');
  const [newEventEndTime, setNewEventEndTime] = useState('11:00');
  const [newEventLocation, setNewEventLocation] = useState('Site Office Zone A');
  const [newEventProject, setNewEventProject] = useState('P-2026-018');
  const [newEventPriority, setNewEventPriority] = useState<CalendarEvent['priority']>('High');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>(['E-001']);

  // Sync to local storage
  const saveEvents = (updated: CalendarEvent[]) => {
    setEvents(updated);
    localStorage.setItem('ikm_calendar_events', JSON.stringify(updated));
  };

  const t = {
    EN: {
      title: 'Global Calendar & Schedule',
      subtitle: 'Schedule and key events',
      today: 'Today',
      allCategories: 'All Categories',
      safety: 'Safety & HSE',
      inspection: 'Inspection',
      maintenance: 'Maintenance',
      meeting: 'Client / Meeting',
      milestone: 'Milestone',
      deadline: 'Deadline',
      searchPlaceholder: 'Search events, location, project...',
      dayEventsPopup: 'Daily Schedule & Details',
      addEvent: 'Add Event',
      noEvents: 'No events scheduled for this date.',
      addFirstEvent: 'Create First Event',
      close: 'Close',
      time: 'Time',
      location: 'Location',
      project: 'Project',
      priority: 'Priority',
      status: 'Status',
      assignees: 'Team / Assignees',
      description: 'Scope & Details',
      checklist: 'Action Items & Deliverables',
      updateStatus: 'Status:',
      deleteEvent: 'Delete Event',
      saveEvent: 'Save Event',
      cancel: 'Cancel',
      eventTitle: 'Event Title',
      categoryLabel: 'Category',
      startTime: 'Start Time',
      endTime: 'End Time',
      upcomingHighlights: 'Key Upcoming Events',
      monthView: 'Month View',
      totalEvents: 'Events',
      scheduled: 'Scheduled',
      inProgress: 'In Progress',
      completed: 'Completed',
      pending: 'Pending'
    },
    TH: {
      title: 'ปฏิทินและตารางกิจกรรม',
      subtitle: 'Schedule and key events',
      today: 'วันนี้',
      allCategories: 'ทุกหมวดหมู่',
      safety: 'ความปลอดภัย & HSE',
      inspection: 'การตรวจสอบ & QA',
      maintenance: 'ซ่อมบำรุง & PM',
      meeting: 'ประชุมลูกค้า & ทีม',
      milestone: 'หมุดหมายสำคัญ',
      deadline: 'กำหนดส่งมอบงาน',
      searchPlaceholder: 'ค้นหากิจกรรม, สถานที่, รหัสโครงการ...',
      dayEventsPopup: 'รายการกิจกรรมและรายละเอียดประจำวัน',
      addEvent: 'เพิ่มกิจกรรม',
      noEvents: 'ไม่มีรายการกิจกรรมในวันที่เลือก',
      addFirstEvent: 'สร้างกิจกรรมใหม่ในวันนี้',
      close: 'ปิด',
      time: 'เวลา',
      location: 'สถานที่',
      project: 'โครงการ',
      priority: 'ระดับความสำคัญ',
      status: 'สถานะ',
      assignees: 'ผู้รับผิดชอบ / ทีมงาน',
      description: 'ขอบเขตงานและรายละเอียด',
      checklist: 'รายการตรวจสอบ & สิ่งที่ต้องส่งมอบ',
      updateStatus: 'ปรับสถานะ:',
      deleteEvent: 'ลบรายการ',
      saveEvent: 'บันทึกกิจกรรม',
      cancel: 'ยกเลิก',
      eventTitle: 'ชื่องาน / กิจกรรม',
      categoryLabel: 'หมวดหมู่',
      startTime: 'เวลาเริ่ม',
      endTime: 'เวลาสิ้นสุด',
      upcomingHighlights: 'ไฮไลท์กิจกรรมสำคัญเร็วๆ นี้',
      monthView: 'มุมมองรายเดือน',
      totalEvents: 'รายการ',
      scheduled: 'ตามกำหนดการ',
      inProgress: 'กำลังดำเนินการ',
      completed: 'เสร็จสมบูรณ์',
      pending: 'รอดำเนินการ'
    }
  }[language];

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date(2026, 8, 8));

  // Days in grid
  const daysOfWeek = language === 'TH' 
    ? ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const startDayOfMonth = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarGrid = useMemo(() => {
    const grid: { dateStr: string; dayNumber: number; isCurrentMonth: boolean; dateObj: Date }[] = [];
    
    // Previous month filler days
    for (let i = startDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = format(prevDate, 'yyyy-MM-dd');
      grid.push({ dateStr, dayNumber: dayNum, isCurrentMonth: false, dateObj: prevDate });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const curDate = new Date(year, month, dayNum);
      const dateStr = format(curDate, 'yyyy-MM-dd');
      grid.push({ dateStr, dayNumber: dayNum, isCurrentMonth: true, dateObj: curDate });
    }

    // Next month filler days (fill up to 35 or 42 cells)
    const remaining = (7 - (grid.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextDate = new Date(year, month + 1, dayNum);
      const dateStr = format(nextDate, 'yyyy-MM-dd');
      grid.push({ dateStr, dayNumber: dayNum, isCurrentMonth: false, dateObj: nextDate });
    }

    return grid;
  }, [year, month, startDayOfMonth, daysInCurrentMonth, daysInPrevMonth]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchCat = selectedCategory === 'all' || e.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = !query || 
        e.title.toLowerCase().includes(query) || 
        e.titleTh.toLowerCase().includes(query) ||
        e.location.toLowerCase().includes(query) ||
        (e.project && e.project.toLowerCase().includes(query));
      return matchCat && matchSearch;
    });
  }, [events, selectedCategory, searchQuery]);

  // Events map for fast lookup by dateStr
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    filteredEvents.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [filteredEvents]);

  // Open Popup for a clicked date
  const handleDateClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setIsCreatingEvent(false);
    // If there is at least one event, pick the first one by default, otherwise null
    const dayEvts = events.filter(e => e.date === dateStr);
    setActiveEventDetail(dayEvts[0] || null);
    setIsPopupOpen(true);
  };

  // Direct click on specific event badge
  const handleEventBadgeClick = (e: React.MouseEvent, evt: CalendarEvent) => {
    e.stopPropagation();
    setSelectedDateStr(evt.date);
    setActiveEventDetail(evt);
    setIsCreatingEvent(false);
    setIsPopupOpen(true);
  };

  // Category Badge Styles
  const getCategoryStyles = (cat: CalendarEvent['category']) => {
    switch (cat) {
      case 'safety':
        return {
          bg: 'bg-rose-500',
          badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
          dot: 'bg-rose-500',
          label: language === 'TH' ? 'ความปลอดภัย' : 'Safety'
        };
      case 'inspection':
        return {
          bg: 'bg-ikm-orange',
          badge: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-900',
          dot: 'bg-ikm-orange',
          label: language === 'TH' ? 'การตรวจสอบ' : 'Inspection'
        };
      case 'maintenance':
        return {
          bg: 'bg-blue-600',
          badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
          dot: 'bg-blue-600',
          label: language === 'TH' ? 'ซ่อมบำรุง' : 'Maintenance'
        };
      case 'meeting':
        return {
          bg: 'bg-emerald-600',
          badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
          dot: 'bg-emerald-600',
          label: language === 'TH' ? 'การประชุม' : 'Meeting'
        };
      case 'milestone':
        return {
          bg: 'bg-purple-600',
          badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900',
          dot: 'bg-purple-600',
          label: language === 'TH' ? 'หมุดหมาย' : 'Milestone'
        };
      case 'deadline':
        return {
          bg: 'bg-amber-500',
          badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
          dot: 'bg-amber-500',
          label: language === 'TH' ? 'กำหนดส่ง' : 'Deadline'
        };
    }
  };

  // Priority Styles
  const getPriorityBadge = (p: CalendarEvent['priority']) => {
    switch (p) {
      case 'Critical':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300';
      case 'High':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300';
    }
  };

  // Status Styles
  const getStatusBadge = (s: CalendarEvent['status']) => {
    switch (s) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
      case 'Scheduled':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
    }
  };

  // Toggle checklist item in active event
  const handleToggleChecklist = (eventId: string, checkId: string) => {
    const updated = events.map(evt => {
      if (evt.id === eventId) {
        const nextChecklist = evt.checklist.map(c => c.id === checkId ? { ...c, completed: !c.completed } : c);
        return { ...evt, checklist: nextChecklist };
      }
      return evt;
    });
    saveEvents(updated);
    if (activeEventDetail && activeEventDetail.id === eventId) {
      const nextChecklist = activeEventDetail.checklist.map(c => c.id === checkId ? { ...c, completed: !c.completed } : c);
      setActiveEventDetail({ ...activeEventDetail, checklist: nextChecklist });
    }
  };

  // Update Event Status
  const handleStatusChange = (eventId: string, newStatus: CalendarEvent['status']) => {
    const updated = events.map(evt => evt.id === eventId ? { ...evt, status: newStatus } : evt);
    saveEvents(updated);
    if (activeEventDetail && activeEventDetail.id === eventId) {
      setActiveEventDetail({ ...activeEventDetail, status: newStatus });
    }
  };

  // Delete event
  const handleDeleteEvent = (eventId: string) => {
    const updated = events.filter(evt => evt.id !== eventId);
    saveEvents(updated);
    const dayEvts = updated.filter(e => e.date === selectedDateStr);
    setActiveEventDetail(dayEvts[0] || null);
  };

  // Add new event
  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateStr || !newEventTitle.trim()) return;

    const chosenAssignees = employees
      .filter(emp => selectedAssigneeIds.includes(emp.id))
      .map(emp => ({
        id: emp.id,
        name: emp.name,
        role: emp.role,
        avatar: `https://i.pravatar.cc/150?u=${emp.id.toLowerCase()}`
      }));

    const newEvt: CalendarEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      title: newEventTitle,
      titleTh: newEventTitle,
      category: newEventCategory,
      date: selectedDateStr,
      startTime: newEventStartTime,
      endTime: newEventEndTime,
      location: newEventLocation,
      project: newEventProject,
      priority: newEventPriority,
      status: 'Scheduled',
      assignees: chosenAssignees.length > 0 ? chosenAssignees : [
        { id: user?.id || 'U-001', name: user?.name || 'Somchai S.', role: user?.role || 'Site Manager' }
      ],
      description: newEventDescription || 'Standard site schedule task and activity.',
      descriptionTh: newEventDescription || 'งานและกิจกรรมตามแผนงานประจำวัน',
      checklist: [
        { id: 'c1', text: 'Initial site preparation & permits', completed: false },
        { id: 'c2', text: 'Execution & verification log', completed: false }
      ]
    };

    const updated = [newEvt, ...events];
    saveEvents(updated);
    setActiveEventDetail(newEvt);
    setIsCreatingEvent(false);
    setNewEventTitle('');
    setNewEventDescription('');
  };

  // Month Display Header
  const formattedMonthTitle = useMemo(() => {
    if (language === 'TH') {
      const monthNames = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      return `${monthNames[month]} ${year + 543}`;
    }
    return currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate, language, month, year]);

  // Formatted date string for modal header
  const formatModalDate = (dateStr: string) => {
    try {
      const d = parseISO(dateStr);
      if (language === 'TH') {
        const thaiDays = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
        const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        return `${thaiDays[d.getDay()]}ที่ ${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
      }
      return format(d, 'EEEE, MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const selectedDayEvents = selectedDateStr ? events.filter(e => e.date === selectedDateStr) : [];

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ikm-orange to-ikm-orange-dark text-white flex items-center justify-center shadow-md shadow-ikm-orange/20">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-ikm-text">{t.title}</h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-ikm-orange-light text-ikm-orange-dark border border-ikm-orange/30">
                {events.length} {t.totalEvents}
              </span>
            </div>
            <p className="text-sm text-ikm-text-secondary">{t.subtitle}</p>
          </div>
        </div>

        {/* Month Navigation & Today */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={goToToday}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-ikm-border bg-ikm-card text-ikm-text hover:bg-ikm-bg hover:border-ikm-orange transition-all shadow-xs"
          >
            {t.today}
          </button>

          <div className="flex items-center gap-1 bg-ikm-card border border-ikm-border rounded-xl p-1 shadow-xs">
            <button 
              onClick={prevMonth} 
              className="p-2 hover:bg-ikm-bg rounded-lg text-ikm-text-secondary hover:text-ikm-text transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-ikm-text px-3 min-w-[160px] text-center text-sm md:text-base">
              {formattedMonthTitle}
            </span>
            <button 
              onClick={nextMonth} 
              className="p-2 hover:bg-ikm-bg rounded-lg text-ikm-text-secondary hover:text-ikm-text transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3.5 bg-ikm-card border-ikm-border">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === 'all' 
                  ? 'bg-ikm-orange text-white shadow-xs' 
                  : 'bg-ikm-bg text-ikm-text-secondary hover:text-ikm-text border border-ikm-border'
              }`}
            >
              {t.allCategories} ({events.length})
            </button>

            {(['safety', 'inspection', 'maintenance', 'meeting', 'milestone', 'deadline'] as CalendarEvent['category'][]).map(cat => {
              const count = events.filter(e => e.category === cat).length;
              const styles = getCategoryStyles(cat);
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 border ${
                    isSelected 
                      ? `${styles.bg} text-white border-transparent shadow-xs` 
                      : 'bg-ikm-bg text-ikm-text-secondary hover:text-ikm-text border-ikm-border'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : styles.dot}`} />
                  <span>{styles.label}</span>
                  <span className="opacity-80 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ikm-text-secondary" />
            <input 
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-ikm-bg border border-ikm-border text-xs focus:outline-none focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange text-ikm-text"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ikm-text-secondary hover:text-ikm-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Calendar Grid */}
      <Card className="overflow-hidden border-ikm-border shadow-xs">
        {/* Days Header */}
        <div className="grid grid-cols-7 bg-ikm-bg/80 border-b border-ikm-border text-center">
          {daysOfWeek.map((d, index) => (
            <div 
              key={d} 
              className={`py-3 text-xs font-bold uppercase tracking-wider ${
                index === 0 || index === 6 ? 'text-rose-500 dark:text-rose-400' : 'text-ikm-text-secondary'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-ikm-border bg-ikm-border">
          {calendarGrid.map((cell, idx) => {
            const dayEvents = eventsByDate[cell.dateStr] || [];
            const isToday = isSameDay(cell.dateObj, new Date(2026, 8, 8));
            const hasEvents = dayEvents.length > 0;

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(cell.dateStr)}
                className={`bg-ikm-card min-h-[110px] md:min-h-[130px] p-1.5 md:p-2.5 transition-all cursor-pointer flex flex-col justify-between group ${
                  !cell.isCurrentMonth ? 'opacity-40 bg-ikm-bg/50' : 'hover:bg-ikm-orange-light/10 hover:ring-1 hover:ring-ikm-orange/30'
                } ${isToday ? 'ring-2 ring-ikm-orange bg-ikm-orange-light/15 z-10' : ''}`}
              >
                {/* Cell Top: Day number & Add badge */}
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs md:text-sm font-bold w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isToday 
                      ? 'bg-ikm-orange text-white shadow-xs' 
                      : cell.isCurrentMonth ? 'text-ikm-text' : 'text-ikm-text-secondary'
                  }`}>
                    {cell.dayNumber}
                  </span>

                  {hasEvents ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-ikm-bg border border-ikm-border text-ikm-text-secondary group-hover:border-ikm-orange group-hover:text-ikm-orange transition-colors">
                      {dayEvents.length}
                    </span>
                  ) : (
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] text-ikm-orange font-semibold flex items-center gap-0.5 transition-opacity">
                      <Plus className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Event Items in Day Cell */}
                <div className="space-y-1 flex-1 overflow-hidden">
                  {dayEvents.slice(0, 3).map((evt) => {
                    const styles = getCategoryStyles(evt.category);
                    return (
                      <div
                        key={evt.id}
                        onClick={(e) => handleEventBadgeClick(e, evt)}
                        className={`text-[10px] md:text-[11px] font-medium px-1.5 py-0.5 rounded-lg truncate flex items-center gap-1 border transition-all hover:scale-[1.02] active:scale-95 shadow-2xs ${styles.badge}`}
                        title={`${evt.startTime} - ${language === 'TH' ? evt.titleTh : evt.title} (${evt.location})`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
                        <span className="font-bold text-[9px] opacity-80 shrink-0">{evt.startTime}</span>
                        <span className="truncate">{language === 'TH' ? evt.titleTh : evt.title}</span>
                      </div>
                    );
                  })}

                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-ikm-orange font-bold text-center py-0.5 bg-ikm-orange-light/40 rounded">
                      +{dayEvents.length - 3} {language === 'TH' ? 'รายการเพิ่มเติม' : 'more'}
                    </div>
                  )}
                </div>

                {/* Bottom hint for empty current month days */}
                {!hasEvents && cell.isCurrentMonth && (
                  <div className="text-[9px] text-ikm-text-secondary/40 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    {language === 'TH' ? 'คลิกเพื่อดู / เพิ่ม' : 'Click to add'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Upcoming Highlights Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-ikm-orange" />
            <h3 className="text-base md:text-lg font-bold text-ikm-text">{t.upcomingHighlights}</h3>
          </div>
          <span className="text-xs text-ikm-text-secondary">
            {language === 'TH' ? 'กดที่การ์ดเพื่อดูรายละเอียด Popup ทันที' : 'Click any card to open detail popup'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {events.slice(0, 6).map((evt) => {
            const styles = getCategoryStyles(evt.category);
            return (
              <div
                key={evt.id}
                onClick={() => {
                  setSelectedDateStr(evt.date);
                  setActiveEventDetail(evt);
                  setIsCreatingEvent(false);
                  setIsPopupOpen(true);
                }}
                className="p-3.5 rounded-2xl bg-ikm-card border border-ikm-border hover:border-ikm-orange/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles.badge}`}>
                      {styles.label}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(evt.priority)}`}>
                      {evt.priority}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-ikm-text-secondary bg-ikm-bg px-2 py-0.5 rounded-lg border border-ikm-border">
                    {evt.date}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-ikm-text group-hover:text-ikm-orange transition-colors line-clamp-1">
                    {language === 'TH' ? evt.titleTh : evt.title}
                  </h4>
                  <p className="text-xs text-ikm-text-secondary line-clamp-1 mt-0.5">
                    {language === 'TH' ? evt.descriptionTh : evt.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-ikm-border flex items-center justify-between text-xs text-ikm-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-ikm-orange" />
                    <span>{evt.startTime} - {evt.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-ikm-orange font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>{language === 'TH' ? 'ดูรายละเอียด' : 'View'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* --- POPUP DETAIL & EVENTS MODAL (เมื่อกดดูรายการในวันที่นั้นๆ) --- */}
      {/* ========================================================================= */}
      {isPopupOpen && selectedDateStr && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-ikm-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-ikm-border overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 md:p-5 border-b border-ikm-border bg-ikm-bg/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ikm-orange-light text-ikm-orange-dark flex items-center justify-center font-bold">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base md:text-lg font-bold text-ikm-text">
                      {formatModalDate(selectedDateStr)}
                    </h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-ikm-orange text-white">
                      {selectedDayEvents.length} {t.totalEvents}
                    </span>
                  </div>
                  <p className="text-xs text-ikm-text-secondary">
                    {t.dayEventsPopup}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isCreatingEvent && (
                  <button
                    onClick={() => setIsCreatingEvent(true)}
                    className="px-3 py-1.5 bg-ikm-orange hover:bg-ikm-orange-dark text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.addEvent}</span>
                  </button>
                )}
                <button
                  onClick={() => setIsPopupOpen(false)}
                  className="p-2 text-ikm-text-secondary hover:text-ikm-text rounded-xl hover:bg-ikm-bg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
              {/* --- VIEW: CREATE NEW EVENT FORM --- */}
              {isCreatingEvent ? (
                <form onSubmit={handleCreateEventSubmit} className="space-y-4 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-ikm-border">
                    <h3 className="font-bold text-ikm-text text-base flex items-center gap-2">
                      <Plus className="w-4 h-4 text-ikm-orange" />
                      <span>{language === 'TH' ? 'เพิ่มกิจกรรมใหม่สำหรับวันที่' : 'New Event for'} {selectedDateStr}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsCreatingEvent(false)}
                      className="text-xs text-ikm-text-secondary hover:text-ikm-text font-semibold"
                    >
                      {t.cancel}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-ikm-text mb-1">{t.eventTitle} *</label>
                      <input
                        type="text"
                        required
                        placeholder={language === 'TH' ? 'เช่น ตรวจสอบความปลอดภัยประจำสัปดาห์' : 'e.g. Weekly Safety Walk'}
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-ikm-bg border border-ikm-border text-sm focus:outline-none focus:border-ikm-orange text-ikm-text"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-ikm-text mb-1">{t.categoryLabel}</label>
                        <select
                          value={newEventCategory}
                          onChange={(e) => setNewEventCategory(e.target.value as any)}
                          className="w-full h-10 px-3 rounded-xl bg-ikm-bg border border-ikm-border text-sm focus:outline-none focus:border-ikm-orange text-ikm-text"
                        >
                          <option value="inspection">🔍 {language === 'TH' ? 'การตรวจสอบ (Inspection)' : 'Inspection'}</option>
                          <option value="safety">🦺 {language === 'TH' ? 'ความปลอดภัย (Safety & HSE)' : 'Safety & HSE'}</option>
                          <option value="maintenance">🔧 {language === 'TH' ? 'ซ่อมบำรุง (Maintenance)' : 'Maintenance'}</option>
                          <option value="meeting">🤝 {language === 'TH' ? 'ประชุมลูกค้า / ทีม (Meeting)' : 'Meeting'}</option>
                          <option value="milestone">🎯 {language === 'TH' ? 'หมุดหมายโครงการ (Milestone)' : 'Milestone'}</option>
                          <option value="deadline">⏳ {language === 'TH' ? 'กำหนดส่งมอบ (Deadline)' : 'Deadline'}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-ikm-text mb-1">{t.priority}</label>
                        <select
                          value={newEventPriority}
                          onChange={(e) => setNewEventPriority(e.target.value as any)}
                          className="w-full h-10 px-3 rounded-xl bg-ikm-bg border border-ikm-border text-sm focus:outline-none focus:border-ikm-orange text-ikm-text"
                        >
                          <option value="Critical">🔴 Critical (วิกฤติ)</option>
                          <option value="High">🟠 High (สูง)</option>
                          <option value="Medium">🔵 Medium (ปานกลาง)</option>
                          <option value="Low">⚪ Low (ต่ำ)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-ikm-text mb-1">{t.startTime}</label>
                        <input
                          type="time"
                          value={newEventStartTime}
                          onChange={(e) => setNewEventStartTime(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-ikm-bg border border-ikm-border text-sm focus:outline-none focus:border-ikm-orange text-ikm-text"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-ikm-text mb-1">{t.endTime}</label>
                        <input
                          type="time"
                          value={newEventEndTime}
                          onChange={(e) => setNewEventEndTime(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-ikm-bg border border-ikm-border text-sm focus:outline-none focus:border-ikm-orange text-ikm-text"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-ikm-text mb-1">{t.location}</label>
                        <input
                          type="text"
                          value={newEventLocation}
                          onChange={(e) => setNewEventLocation(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-ikm-bg border border-ikm-border text-sm focus:outline-none focus:border-ikm-orange text-ikm-text"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-ikm-text mb-1">{t.project}</label>
                        <input
                          type="text"
                          value={newEventProject}
                          onChange={(e) => setNewEventProject(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-ikm-bg border border-ikm-border text-sm focus:outline-none focus:border-ikm-orange text-ikm-text"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ikm-text mb-1">{t.assignees}</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-ikm-bg p-2.5 rounded-xl border border-ikm-border max-h-36 overflow-y-auto custom-scrollbar">
                        {employees.map(emp => {
                          const isSelected = selectedAssigneeIds.includes(emp.id);
                          return (
                            <label 
                              key={emp.id}
                              className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors text-xs ${
                                isSelected ? 'bg-ikm-orange-light/30 text-ikm-orange-dark font-bold' : 'hover:bg-ikm-card text-ikm-text'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedAssigneeIds([...selectedAssigneeIds, emp.id]);
                                  else setSelectedAssigneeIds(selectedAssigneeIds.filter(id => id !== emp.id));
                                }}
                                className="rounded text-ikm-orange focus:ring-ikm-orange"
                              />
                              <span className="truncate">{emp.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ikm-text mb-1">{t.description}</label>
                      <textarea
                        rows={3}
                        value={newEventDescription}
                        onChange={(e) => setNewEventDescription(e.target.value)}
                        placeholder={language === 'TH' ? 'ระบุรายละเอียด ขอบเขตงาน หรือวาระการประชุม...' : 'Detail description, scope of work or agenda...'}
                        className="w-full p-3 rounded-xl bg-ikm-bg border border-ikm-border text-sm focus:outline-none focus:border-ikm-orange text-ikm-text resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-ikm-border">
                    <button
                      type="button"
                      onClick={() => setIsCreatingEvent(false)}
                      className="px-4 py-2 rounded-xl border border-ikm-border text-xs font-bold text-ikm-text hover:bg-ikm-bg"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-ikm-orange hover:bg-ikm-orange-dark text-white text-xs font-bold transition-all shadow-xs"
                    >
                      {t.saveEvent}
                    </button>
                  </div>
                </form>
              ) : selectedDayEvents.length === 0 ? (
                /* --- EMPTY STATE FOR THIS DAY --- */
                <div className="py-12 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-ikm-bg border border-ikm-border flex items-center justify-center mx-auto text-ikm-text-secondary">
                    <CalendarIcon className="w-8 h-8 opacity-40" />
                  </div>
                  <div>
                    <h4 className="font-bold text-ikm-text text-base">{t.noEvents}</h4>
                    <p className="text-xs text-ikm-text-secondary max-w-sm mx-auto mt-1">
                      {language === 'TH' 
                        ? 'คุณสามารถเพิ่มการนัดหมาย การตรวจสอบงานซ่อมบำรุง หรือกิจกรรมความปลอดภัยในวันนี้ได้ทันที'
                        : 'You can schedule inspections, maintenance activities, meetings or safety audits for this day.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreatingEvent(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-ikm-orange hover:bg-ikm-orange-dark text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.addFirstEvent}</span>
                  </button>
                </div>
              ) : (
                /* --- VIEW: EVENTS LIST & DETAILED PREVIEW --- */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Events Selector */}
                  <div className="lg:col-span-5 space-y-2.5 border-b lg:border-b-0 lg:border-r border-ikm-border pb-4 lg:pb-0 lg:pr-4">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-bold text-ikm-text uppercase tracking-wider">
                        {language === 'TH' ? 'รายการในวันนี้' : 'Events On This Date'} ({selectedDayEvents.length})
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                      {selectedDayEvents.map((evt) => {
                        const styles = getCategoryStyles(evt.category);
                        const isSelected = activeEventDetail?.id === evt.id;

                        return (
                          <div
                            key={evt.id}
                            onClick={() => setActiveEventDetail(evt)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                              isSelected 
                                ? 'bg-ikm-orange-light/20 border-ikm-orange shadow-xs' 
                                : 'bg-ikm-bg/60 border-ikm-border hover:border-ikm-border/80 hover:bg-ikm-bg'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles.badge}`}>
                                {styles.label}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(evt.status)}`}>
                                {evt.status}
                              </span>
                            </div>

                            <h4 className={`text-xs md:text-sm font-bold line-clamp-1 ${isSelected ? 'text-ikm-orange-dark' : 'text-ikm-text'}`}>
                              {language === 'TH' ? evt.titleTh : evt.title}
                            </h4>

                            <div className="flex items-center justify-between text-[11px] text-ikm-text-secondary">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-ikm-orange" />
                                <span>{evt.startTime} - {evt.endTime}</span>
                              </div>
                              <span className="truncate max-w-[120px]">{evt.location}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Full Event Detail Panel */}
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    {activeEventDetail ? (
                      <div className="space-y-4">
                        {/* Event Title & Badges */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getCategoryStyles(activeEventDetail.category).badge}`}>
                                {getCategoryStyles(activeEventDetail.category).label}
                              </span>
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(activeEventDetail.priority)}`}>
                                {t.priority}: {activeEventDetail.priority}
                              </span>
                            </div>

                            {/* Status Changer */}
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="font-bold text-ikm-text-secondary">{t.updateStatus}</span>
                              <select
                                value={activeEventDetail.status}
                                onChange={(e) => handleStatusChange(activeEventDetail.id, e.target.value as any)}
                                className="text-xs font-bold py-1 px-2.5 rounded-lg border border-ikm-border bg-ikm-card text-ikm-text focus:outline-none focus:border-ikm-orange"
                              >
                                <option value="Scheduled">{t.scheduled}</option>
                                <option value="In Progress">{t.inProgress}</option>
                                <option value="Completed">{t.completed}</option>
                                <option value="Pending">{t.pending}</option>
                              </select>
                            </div>
                          </div>

                          <h3 className="text-lg md:text-xl font-bold text-ikm-text">
                            {language === 'TH' ? activeEventDetail.titleTh : activeEventDetail.title}
                          </h3>
                        </div>

                        {/* Meta Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-ikm-bg p-3.5 rounded-xl border border-ikm-border text-xs">
                          <div className="flex items-center gap-2 text-ikm-text">
                            <Clock className="w-4 h-4 text-ikm-orange shrink-0" />
                            <div>
                              <span className="text-[10px] text-ikm-text-secondary block font-bold">{t.time}</span>
                              <span className="font-semibold">{activeEventDetail.startTime} - {activeEventDetail.endTime}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-ikm-text">
                            <MapPin className="w-4 h-4 text-ikm-orange shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] text-ikm-text-secondary block font-bold">{t.location}</span>
                              <span className="font-semibold truncate block">{activeEventDetail.location}</span>
                            </div>
                          </div>

                          {activeEventDetail.project && (
                            <div className="flex items-center gap-2 text-ikm-text sm:col-span-2 pt-2 border-t border-ikm-border/60">
                              <Briefcase className="w-4 h-4 text-ikm-orange shrink-0" />
                              <div>
                                <span className="text-[10px] text-ikm-text-secondary block font-bold">{t.project}</span>
                                <span className="font-semibold">{activeEventDetail.project}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Scope & Description */}
                        <div>
                          <label className="text-xs font-bold text-ikm-text block mb-1 uppercase tracking-wider">
                            {t.description}
                          </label>
                          <p className="text-xs md:text-sm text-ikm-text bg-ikm-bg/40 p-3 rounded-xl border border-ikm-border leading-relaxed">
                            {language === 'TH' ? activeEventDetail.descriptionTh : activeEventDetail.description}
                          </p>
                        </div>

                        {/* Assignees */}
                        <div>
                          <label className="text-xs font-bold text-ikm-text block mb-1.5 uppercase tracking-wider">
                            {t.assignees} ({activeEventDetail.assignees.length})
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {activeEventDetail.assignees.map((a) => (
                              <div key={a.id} className="flex items-center gap-2 bg-ikm-bg px-2.5 py-1.5 rounded-xl border border-ikm-border text-xs">
                                <Avatar src={a.avatar} fallback={a.name.charAt(0)} className="w-6 h-6 ring-1 ring-ikm-border" />
                                <div>
                                  <div className="font-bold text-ikm-text text-[11px] leading-tight">{a.name}</div>
                                  <div className="text-[10px] text-ikm-text-secondary">{a.role}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Checklist & Deliverables */}
                        {activeEventDetail.checklist && activeEventDetail.checklist.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-bold text-ikm-text uppercase tracking-wider flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-ikm-orange" />
                                <span>{t.checklist}</span>
                              </label>
                              <span className="text-[10px] font-bold text-ikm-text-secondary bg-ikm-bg px-2 py-0.5 rounded-md border border-ikm-border">
                                {activeEventDetail.checklist.filter(c => c.completed).length} / {activeEventDetail.checklist.length}
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              {activeEventDetail.checklist.map((item) => (
                                <div
                                  key={item.id}
                                  onClick={() => handleToggleChecklist(activeEventDetail.id, item.id)}
                                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                                    item.completed 
                                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300' 
                                      : 'bg-ikm-bg border-ikm-border text-ikm-text hover:bg-ikm-bg/80'
                                  }`}
                                >
                                  {item.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-ikm-text-secondary shrink-0" />
                                  )}
                                  <span className={`flex-1 ${item.completed ? 'line-through opacity-80' : ''}`}>
                                    {item.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions: Delete button */}
                        <div className="pt-3 border-t border-ikm-border flex justify-end">
                          <button
                            onClick={() => handleDeleteEvent(activeEventDetail.id)}
                            className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t.deleteEvent}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-16 text-center text-ikm-text-secondary">
                        <Eye className="w-8 h-8 mx-auto opacity-40 mb-2" />
                        <p className="text-xs">{language === 'TH' ? 'เลือกรายการกิจกรรมทางด้านซ้ายเพื่อดูรายละเอียด' : 'Select an event on the left to view details'}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 px-6 border-t border-ikm-border bg-ikm-bg/40 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-ikm-text-secondary">
                {language === 'TH' ? 'ระบบปฏิทินและบันทึกกิจกรรมอัจฉริยะ IKM' : 'IKM Global Schedule & Key Events System'}
              </span>
              <button
                onClick={() => setIsPopupOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-ikm-card border border-ikm-border hover:bg-ikm-bg text-xs font-bold text-ikm-text transition-colors shadow-2xs"
              >
                {t.close}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
