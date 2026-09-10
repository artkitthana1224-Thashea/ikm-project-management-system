import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import {
  BookOpen, Book, Search, ChevronRight, ChevronLeft, Printer, Download,
  ExternalLink, Home, ClipboardList, CheckSquare, MessageSquare,
  KanbanSquare, Calendar, UserCircle, Users, Activity, Clock,
  Briefcase, PieChart, BarChartHorizontal, ShieldCheck, Star,
  ClipboardCheck, FileText, UserCog, ScrollText, Mic, Sparkles,
  Layers, CheckCircle2, ArrowRight, Bookmark, Compass, HelpCircle,
  Smartphone, Laptop, MousePointer, Sliders, Shield, AlertTriangle,
  Building2, FileSpreadsheet, Eye, Award, Info, Share2
} from 'lucide-react';

interface ManualChapter {
  id: string;
  menuId: string;
  category: string;
  categoryTH: string;
  titleEN: string;
  titleTH: string;
  icon: any;
  badge?: string;
  path: string;
  targetRole: string;
  summaryEN: string;
  summaryTH: string;
  steps: {
    stepNumber: number;
    titleEN: string;
    titleTH: string;
    descriptionEN: string;
    descriptionTH: string;
    tipEN?: string;
    tipTH?: string;
  }[];
  mockup: {
    type: string;
    title: string;
    elements: {
      label: string;
      description: string;
      color: string;
    }[];
    notes: string;
  };
  features: string[];
  tips: string[];
}

export function UserManual() {
  const { language } = useStore();
  const navigate = useNavigate();
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'booklet' | 'full' | 'grid'>('booklet');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const chapters: ManualChapter[] = [
    {
      id: 'chap-intro',
      menuId: 'overview',
      category: 'Overview',
      categoryTH: 'ภาพรวมระบบ',
      titleEN: '1. System Overview & Quick Start',
      titleTH: '1. ภาพรวมระบบและการเริ่มต้นใช้งาน',
      icon: Compass,
      badge: 'Getting Started',
      path: '/',
      targetRole: 'All Roles (ทุกคน)',
      summaryEN: 'Introduction to IKM Operations Management System, navigation structure, profile management, and theme settings.',
      summaryTH: 'แนะนำโครงสร้างระบบ IKM Operations การนำทาง แถบเมนูด้านข้าง การตั้งค่าโปรไฟล์ส่วนตัว และการสลับภาษา/ธีม',
      steps: [
        {
          stepNumber: 1,
          titleEN: 'Top Navigation & Profile Control',
          titleTH: 'แถบเมนูด้านบนและโปรไฟล์ผู้ใช้',
          descriptionEN: 'Access notifications, switch Light/Dark theme, toggle English/Thai language, and click your profile avatar to edit your role and contact details.',
          descriptionTH: 'คลิกไอคอนกระดิ่งเพื่อดูการแจ้งเตือน, ปุ่มดวงจันทร์/พระอาทิตย์เพื่อสลับโหมดสว่าง-มืด, ปุ่ม TH/EN เพื่อเปลี่ยนภาษา และคลิกที่รูปโปรไฟล์เพื่อแก้ไขข้อมูลส่วนตัว ตำแหน่ง และทักษะ',
          tipTH: 'ข้อมูลโปรไฟล์ที่บันทึกจะซิงค์ตรงไปยัง Supabase Database และบันทึกถาวร',
        },
        {
          stepNumber: 2,
          titleEN: 'Sidebar Navigation',
          titleTH: 'แถบเมนูหลักด้านข้าง (Sidebar)',
          descriptionEN: 'Explore Core operations, Personnel tracking, Project management, Governance, and Admin tools organized neatly by category.',
          descriptionTH: 'แบ่งออกเป็น 5 หมวดหลัก: งานหลัก (Core), บุคลากร (Operations & Team), โครงการ (Projects), ควบคุมคุณภาพ (Governance) และผู้ดูแล (Admin)',
        },
        {
          stepNumber: 3,
          titleEN: 'Quick Action FAB & Voice AI',
          titleTH: 'ปุ่มลัด Action ด่วน & Voice AI Report',
          descriptionEN: 'Click the orange (+) FAB button at the bottom right to quickly create a request, start a new task, or report field maintenance via Voice AI.',
          descriptionTH: 'ปุ่มสีส้ม (+) มุมขวาล่าง ใช้สร้างคำของานด่วน สร้างงานใหม่ หรือกดปุ่มไมโครโฟนเพื่ออัดเสียงรายงานหน้างานด้วย AI',
        }
      ],
      mockup: {
        type: 'header_and_sidebar',
        title: 'IKM Enterprise Navigation Shell',
        elements: [
          { label: '1️⃣ แถบเมนูด้านบน', description: 'โลโก้ IKM, ค้นหาด่วน, แจ้งเตือน, สลับภาษา TH/EN, ธีม และปุ่มโปรไฟล์', color: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30' },
          { label: '2️⃣ แถบเมนูด้านข้าง (Sidebar)', description: 'จัดกลุ่มเมนูเป็นระเบียบ พร้อม Badge จำนวนงานที่ต้องทำ', color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' },
          { label: '3️⃣ ปุ่ม Action ด่วน (+ FAB)', description: 'กดเพื่อสร้าง Work Request, Task หรือ Voice AI Report ได้จากทุกหน้าจอ', color: 'border-green-500 bg-green-50 dark:bg-green-950/30' },
        ],
        notes: 'รองรับการแสดงผลทั้งบนคอมพิวเตอร์ แท็บเล็ต และสมาร์ทโฟนแบบ Responsive 100%'
      },
      features: [
        'Cloud Database Synchronization (Supabase)',
        'Bilingual UI Support (Thai & English)',
        'Dark / Light Mode Adaptation',
        'Responsive Mobile-First Interface'
      ],
      tips: [
        'สามารถย่อ-ขยาย Sidebar ได้ด้วยปุ่มลูกศรเพื่อเพิ่มพื้นที่ทำงานบนหน้าจอ',
        'ข้อมูลโปรไฟล์จะเชื่อมโยงกับระบบจัดสรรกำลังคน Manpower อัตโนมัติ'
      ]
    },
    {
      id: 'chap-dashboard',
      menuId: 'home',
      category: 'Core',
      categoryTH: 'งานหลัก',
      titleEN: '2. Dashboard & Operational Pulse',
      titleTH: '2. แดชบอร์ดภาพรวมการดำเนินงาน',
      icon: Home,
      badge: 'Core Menu',
      path: '/',
      targetRole: 'Site Manager, Supervisor, Lead Engineer',
      summaryEN: 'Central operations monitoring hub featuring live KPI cards, active work requests, manpower overview, and quick task feeds.',
      summaryTH: 'ศูนย์กลางติดตามภาพรวมการปฏิบัติงาน สรุปตัวเลข KPI สถานะคำของาน รายงาน Manpower สด และงานด่วนที่ต้องดำเนินการ',
      steps: [
        {
          stepNumber: 1,
          titleEN: 'Monitor Real-Time KPI Cards',
          titleTH: 'ตรวจสอบตัวเลข KPI สำคัญประจำวัน',
          descriptionEN: 'Check Active Requests, Tasks in Progress, Urgent Issues, and Supabase Connected status at a glance at the top of the screen.',
          descriptionTH: 'ดูยอดรวมคำของานที่เปิดอยู่ งานที่กำลังทำ ปัญหาเร่งด่วน และสถานะการเชื่อมต่อฐานข้อมูล Supabase',
        },
        {
          stepNumber: 2,
          titleEN: 'Access Manpower Live Summary Banner',
          titleTH: 'เข้าถึงแบนเนอร์สรุป Manpower ประจำสัปดาห์',
          descriptionEN: 'Click the Manpower Report banner to jump directly to the Rayong & Laem Chabang weekly allocation matrix.',
          descriptionTH: 'คลิกที่กล่องแบนเนอร์สีส้มเพื่อเปิดดูตารางสรุปกำลังคนของแต่ละ Job (IKM-TH RY & LKU) ได้ทันที',
        },
        {
          stepNumber: 3,
          titleEN: 'Inspect Recent Requests & Team Activity',
          titleTH: 'ตรวจสอบรายการคำของานและกิจกรรมของทีม',
          descriptionEN: 'Review incoming work orders from offshore and workshops, filter by priority, and approve or assign tasks directly.',
          descriptionTH: 'ตรวจดูรายการงานล่าสุดที่ส่งเข้ามา สามารถกดอนุมัติ มอบหมายทีมงาน หรือเปลี่ยนสถานะงานได้จากหน้าแดชบอร์ด',
        }
      ],
      mockup: {
        type: 'dashboard_cards',
        title: 'Executive Operational Dashboard',
        elements: [
          { label: '📊 4 การ์ดตัวชี้วัด KPI', description: 'Active Requests, In Progress, High Priority, Supabase Tasks', color: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30' },
          { label: '⚡ แบนเนอร์ Manpower สด', description: 'แสดงยอดกำลังพลรวมสัปดาห์ปัจจุบัน (28 Aug - 3 Sep 2026)', color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30' },
          { label: '📋 ลิสต์งานและคำขอเร่งด่วน', description: 'ตารางคำของานล่าสุดพร้อมระดับความเร่งด่วนและสถานะ', color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' },
        ],
        notes: 'หน้าแรกจะโหลดข้อมูลล่าสุดจากฐานข้อมูลทันทีเมื่อเปิดเข้าสู่ระบบ'
      },
      features: [
        'Real-time KPI metrics with color indicators',
        'Direct link to Manpower Weekly Matrix',
        'Recent Work Request activity feed',
        'Quick Task Approval shortcuts'
      ],
      tips: [
        'คลิกที่การ์ดตัวเลขเพื่อกรองเฉพาะรายการในสถานะนั้นๆ',
        'กดปุ่ม รีเฟรช เพื่ออัปเดตข้อมูลล่าสุดจากเซิร์ฟเวอร์แบบ Real-time'
      ]
    },
    {
      id: 'chap-requests',
      menuId: 'requests',
      category: 'Core',
      categoryTH: 'งานหลัก',
      titleEN: '3. Work Requests & Ticket Creation',
      titleTH: '3. ระบบคำของานและการเปิดใบงาน (Requests)',
      icon: ClipboardList,
      badge: 'Core Menu',
      path: '/requests',
      targetRole: 'All Users (ผู้เปิดคำขอ & ช่างเทคนิค)',
      summaryEN: 'Comprehensive ticketing system for requesting maintenance, repairs, offshore mobilization, and equipment overhaul.',
      summaryTH: 'ระบบบันทึกและติดตามใบคำของาน สำหรับงานซ่อมบำรุง งานช่างเครื่องกล ไฟฟ้า งานไซท์ระยอง แหลมฉบัง และออฟชอร์',
      steps: [
        {
          stepNumber: 1,
          titleEN: 'Click "New Request" Button',
          titleTH: 'คลิกปุ่ม "สร้างคำของานใหม่"',
          descriptionEN: 'Navigate to Requests page and click the orange "+ Create Request" button, or use the floating Action button.',
          descriptionTH: 'ไปที่หน้าคำของาน แล้วคลิกปุ่มสีส้ม "+ สร้างคำของาน" เพื่อเปิดแบบฟอร์มเปิดใบงาน',
        },
        {
          stepNumber: 2,
          titleEN: 'Fill in Job Details & Location',
          titleTH: 'กรอกรายละเอียดงานและระบุสถานที่',
          descriptionEN: 'Specify Title, Department (Mechanical, Electrical, Instrumentation, Rigging), Location (Rayong Workshop, Laem Chabang, Offshore Platform), and Priority.',
          descriptionTH: 'ระบุชื่องาน, แผนกช่าง, ไซต์ปฏิบัติงาน, ระดับความสำคัญ (Urgent / High / Medium / Low) และรายละเอียดอุปกรณ์',
        },
        {
          stepNumber: 3,
          titleEN: 'Submit for Supervisor Approval',
          titleTH: 'บันทึกและส่งเข้าสู่ระบบอนุมัติ',
          descriptionEN: 'Submit ticket. The system sends notification to Site Managers for sign-off in the Approval Center.',
          descriptionTH: 'กดปุ่มบันทึก คำขอจะถูกส่งต่อไปยังศูนย์อนุมัติ (Approval Center) เพื่อให้หัวหน้างานตรวจสอบทันที',
        }
      ],
      mockup: {
        type: 'ticket_form',
        title: 'Work Request Lifecycle Flow',
        elements: [
          { label: '1️⃣ ขั้นตอนสร้างใบงาน', description: 'กรอกหัวข้อ, เลือกระดับความสำคัญ, เลือกสถานที่ (RY / LKU / Offshore)', color: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30' },
          { label: '2️⃣ ขั้นตอนตรวจสอบ & อนุมัติ', description: 'Site Manager ตรวจสอบความถูกต้องและอนุมัติใบคำขอ', color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' },
          { label: '3️⃣ ขั้นตอนจ่ายงาน (Task Dispatch)', description: 'แปลงคำขอเป็น Task มอบหมายให้ช่างเทคนิคปฏิบัติงาน', color: 'border-green-500 bg-green-50 dark:bg-green-950/30' },
        ],
        notes: 'คำขอระดับ Urgent จะมีแถบไฮไลท์สีแดงแจ้งเตือนด่วนแก่ทีมบริหาร'
      },
      features: [
        'Priority tagging (Low, Medium, High, Urgent)',
        'Site Location routing (RY, LKU, Offshore Rig)',
        'Photo & document attachment support',
        'Status tracking (Pending, Approved, In Progress, Completed)'
      ],
      tips: [
        'หากหน้างานไม่สะดวกพิมพ์ สามารถใช้เมนู Voice Report AI เพื่อพูดรายงานแล้วระบบจะสร้างคำขอให้อัตโนมัติ',
        'สามารถค้นหาใบงานย้อนหลังด้วยรหัสคำขอหรือชื่อผู้แจ้งได้ตลอดเวลา'
      ]
    },
    {
      id: 'chap-tasks',
      menuId: 'tasks',
      category: 'Core',
      categoryTH: 'งานหลัก',
      titleEN: '4. My Tasks, Time Tracking & Checklists',
      titleTH: '4. งานของฉัน การบันทึกเวลา และเช็กลิสต์ (My Tasks)',
      icon: CheckSquare,
      badge: 'Core Menu',
      path: '/tasks',
      targetRole: 'Engineers, Technicians, Operators',
      summaryEN: 'Actionable workspace for engineers and technicians to view assigned tasks, update progress, complete checklists, and log working hours.',
      summaryTH: 'พื้นที่ทำงานประจำวันสำหรับวิศวกรและช่าง ตรวจสอบรายการงานที่ได้รับมอบหมาย เช็ครายการตรวจสอบ (Checklist) และอัปเดตสถานะงาน',
      steps: [
        {
          stepNumber: 1,
          titleEN: 'Filter & Select Your Assigned Task',
          titleTH: 'เลือกดูงานที่ได้รับมอบหมาย',
          descriptionEN: 'Browse tasks by status: Pending, In Progress, In Review, or Completed. Use search to find specific job codes.',
          descriptionTH: 'เลือกแท็บสถานะงาน: รอดำเนินการ, กำลังทำ, รอตรวจสอบ หรือเสร็จสิ้น พร้อมดูวันครบกำหนด (Due Date)',
        },
        {
          stepNumber: 2,
          titleEN: 'Perform Work & Tick Checklist Items',
          titleTH: 'ปฏิบัติตามรายการตรวจสอบความปลอดภัย (Checklist)',
          descriptionEN: 'Open task detail to tick safety checklist steps, add progress notes, and attach completion photos.',
          descriptionTH: 'เปิดหน้ารายละเอียดงาน เพื่อติ๊กรายการตรวจสอบตามมาตรฐานความปลอดภัย (JSA/PTW) และกรอกข้อสังเกต',
        },
        {
          stepNumber: 3,
          titleEN: 'Mark as In Review or Completed',
          titleTH: 'ส่งมอบงานและบันทึกเวลาปฏิบัติงาน',
          descriptionEN: 'Once work is verified, change status to Complete. The system calculates performance scores and updates project progress.',
          descriptionTH: 'เมื่อทำงานเสร็จสิ้น ปรับสถานะเป็น เสร็จสมบูรณ์ เพื่อส่งคะแนนเข้าสู่ระบบ Performance Score',
        }
      ],
      mockup: {
        type: 'task_card',
        title: 'Task Execution & Safety Verification',
        elements: [
          { label: '📌 รายละเอียดงานและ Due Date', description: 'ชื่องาน, โครงการ, ระดับความสำคัญ, ผู้รับผิดชอบ และเวลากำหนดส่ง', color: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30' },
          { label: '☑️ Safety & Quality Checklist', description: 'รายการขั้นตอนความปลอดภัยที่ต้องติ๊กถูกก่อนปิดงาน', color: 'border-green-500 bg-green-50 dark:bg-green-950/30' },
          { label: '⏱️ สถานะงาน & การประเมินผล', description: 'ปรับสถานะ Pending -> In Progress -> Completed พร้อมคะแนนผลงาน', color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' },
        ],
        notes: 'เมื่อปิดงานเสร็จสิ้น ข้อมูลจะสะท้อนไปยังรายงานชั่วโมงการทำงานทันที'
      },
      features: [
        'Interactive checklist with progress bar',
        'Time tracking & logged hours summary',
        'Direct task assignment to multiple technicians',
        'Quality score linkage for performance audit'
      ],
      tips: [
        'ควรตรวจสอบรายการ Safety Checklist ทุกครั้งก่อนเริ่มทำงานเพื่อความปลอดภัยตามมาตรฐาน IKM',
        'สามารถแนบภาพถ่ายก่อนและหลังการซ่อมบำรุงเพื่อใช้เป็นหลักฐานส่งมอบงาน'
      ]
    },
    {
      id: 'chap-manpower',
      menuId: 'manpower',
      category: 'Operations & Team',
      categoryTH: 'การดำเนินงาน & ทีม',
      titleEN: '5. Weekly Manpower Job Summary Report',
      titleTH: '5. รายงานสรุป Manpower ประจำสัปดาห์ของแต่ละ Job',
      icon: Activity,
      badge: 'Official Template',
      path: '/manpower',
      targetRole: 'Site Manager, Planner, Operations Lead',
      summaryEN: 'Standardized spreadsheet matrix for Rayong (RY) and Laem Chabang (LKU) bases tracking daily manpower by project, workshop, office staff, leave, and standby.',
      summaryTH: 'ตารางรายงานสรุปกำลังพลของฐานระยอง (IKM-TH RY) และแหลมฉบัง (IKM-TH LKU) แยกตามแต่ละ Job No., ช่างช็อป, ออฟฟิศ, วันลา และวันหยุด (Off/Standby) พร้อมแก้ไขตัวเลขสดได้ทันที',
      steps: [
        {
          stepNumber: 1,
          titleEN: 'Switch Between Bases (RY & LKU)',
          titleTH: 'สลับดูฐานปฏิบัติการ (ระยอง หรือ แหลมฉบัง)',
          descriptionEN: 'Use top toggle buttons to switch between IKM-TH RY (Rayong Base) and IKM-TH LKU (Laem Chabang Base).',
          descriptionTH: 'กดปุ่มเลือกฐานปฏิบัติการด้านบน: IKM-TH RY (ระยอง) หรือ IKM-TH LKU (แหลมฉบัง) เพื่อดูตารางของแต่ละฐาน',
        },
        {
          stepNumber: 2,
          titleEN: 'Click-to-Edit Any Cell Directly',
          titleTH: 'คลิกที่ตัวเลขในตารางเพื่อแก้ไขจำนวนคนได้ทันที',
          descriptionEN: 'Click any number in the 7-day columns (Fri 28 to Thu 3) to change manpower. Total rows and Man-Days update automatically in real-time.',
          descriptionTH: 'คลิกที่ช่องตัวเลขในแต่ละวันเพื่อพิมพ์แก้ไขจำนวนคน ระบบจะคำนวณแถบ Total Manpower Work, Total Leave และ Grand Total ให้อัตโนมัติ',
          tipTH: 'ข้อมูลที่แก้ไขจะถูกบันทึกลงหน่วยความจำอัตโนมัติ ไม่สูญหายเมื่อรีเฟรชหน้าเว็บ',
        },
        {
          stepNumber: 3,
          titleEN: 'Add New Jobs / Lines',
          titleTH: 'เพิ่ม Job หรือรายการงานใหม่ลงในตาราง',
          descriptionEN: 'Click "+ Add Job / Line" to insert new client projects (e.g. Job No. 050-26 Chevron) with customizable categories.',
          descriptionTH: 'กดปุ่มสีส้ม "+ เพิ่ม Job / รายการงาน" เพื่อเพิ่มแถวโครงการลูกค้าใหม่เข้าตาราง พร้อมระบุชื่อและประเภทงาน',
        },
        {
          stepNumber: 4,
          titleEN: 'Export CSV & Copy LINE Summary',
          titleTH: 'ส่งออกไฟล์ CSV/Excel หรือคัดลอกข้อความสรุปส่ง LINE',
          descriptionEN: 'Click "Export CSV" for Excel spreadsheet, or click "Copy Text Summary" to paste ready-to-send daily headcount directly into LINE groups.',
          descriptionTH: 'กดปุ่ม "ส่งออก CSV / Excel" เพื่อโหลดไฟล์ หรือกดปุ่ม "คัดลอกสรุปส่ง LINE" เพื่อนำข้อความรายงานไปวางในกลุ่มแชทได้ทันที',
        }
      ],
      mockup: {
        type: 'manpower_matrix',
        title: 'IKM Manpower Weekly Matrix Form (Official)',
        elements: [
          { label: '🏢 ส่วนบน: Direct Staff & Client Jobs', description: 'Office Staff, Workshop, Freelancer และรายการ Job No. (Unithai, SCC, TESCO ฯลฯ)', color: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30' },
          { label: '🟩 แถบ Total Manpower Work (Subtotal)', description: 'แถบสีเขียวอ่อน (RY) หรือสีฟ้า (LKU) สรุปยอดคนทำงานจริงในแต่ละวัน', color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
          { label: '🏖️ ส่วนล่าง: Leave, Absent, Off & Standby', description: 'ยอดการลาป่วย/ลากิจ, ขาดงาน และ Off/Standby พร้อมแถบ Total รวมกำลังพลทั้งหมด', color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' },
        ],
        notes: 'คอลัมน์วันที่ 30 (วันอาทิตย์) ไฮไลท์สีฟ้าตรงตามแบบฟอร์มเอกสารของบริษัท'
      },
      features: [
        'Dual-Site Support: IKM-TH RY & IKM-TH LKU templates',
        'Live Click-to-Edit inline spreadsheet cells',
        'Real-time automated Subtotal & Grand Total formulas',
        'One-Click LINE text summary generator',
        'CSV/Excel full matrix export & Print-ready styling',
        'Analytics tab with Man-Days share & Daily Trend bar charts'
      ],
      tips: [
        'สามารถสลับไปที่แท็บ "Analytics & Allocation" เพื่อดูกราฟสัดส่วน Man-Days ของแต่ละโครงการ',
        'หากต้องการกลับไปใช้ข้อมูลเดิม ให้กดปุ่ม รีเฟรช (Reset Default) ที่แถบเครื่องมือ'
      ]
    },
    {
      id: 'chap-kanban',
      menuId: 'kanban',
      category: 'Core',
      categoryTH: 'งานหลัก',
      titleEN: '6. Kanban Board & Visual Workflow',
      titleTH: '6. บอร์ดคัมบังและการจัดการสถานะงาน (Kanban)',
      icon: KanbanSquare,
      badge: 'Agile Workflow',
      path: '/kanban',
      targetRole: 'Project Leads, Engineers, Supervisors',
      summaryEN: 'Visual drag-and-drop card board representing work order progress across columns: Pending, In Progress, In Review, and Done.',
      summaryTH: 'บอร์ดจัดการงานแบบ Visual Drag & Drop เห็นภาพรวมความคืบหน้าของทุกงานในแต่ละขั้นตอน ช่วยป้องกันงานตกค้างและคอขวด',
      steps: [
        {
          stepNumber: 1,
          titleEN: 'View Workflow Columns',
          titleTH: 'ตรวจดูคอลัมน์ขั้นตอนการทำงาน',
          descriptionEN: '4 Standard Columns: Pending (รอดำเนินการ), In Progress (กำลังปฏิบัติงาน), In Review (รอตรวจรับงาน), and Done (เสร็จสมบูรณ์).',
          descriptionTH: 'แบ่งออกเป็น 4 คอลัมน์ชัดเจนตามขั้นตอนมาตรฐานการทำงานขององค์กร',
        },
        {
          stepNumber: 2,
          titleEN: 'Drag and Drop Task Cards',
          titleTH: 'ลากและวางการ์ดเพื่อเปลี่ยนสถานะงาน',
          descriptionEN: 'Drag task cards between columns to update status instantly. Supabase updates in the background automatically.',
          descriptionTH: 'คลิกลากการ์ดงานจากคอลัมน์หนึ่งไปยังอีกคอลัมน์หนึ่งเมื่อความคืบหน้าเปลี่ยนไป ระบบจะซิงค์สถานะทันที',
        },
        {
          stepNumber: 3,
          titleEN: 'Filter by Assignee & Priority',
          titleTH: 'กรองดูงานตามผู้รับผิดชอบหรือความเร่งด่วน',
          descriptionEN: 'Use quick filters at the top to isolate tasks assigned to specific engineers or urgent offshore milestones.',
          descriptionTH: 'กดเลือกชื่อผู้รับผิดชอบ หรือเลือกระดับ Urgent เพื่อดูเฉพาะงานเร่งด่วนที่ต้องส่งมอบก่อน',
        }
      ],
      mockup: {
        type: 'kanban_columns',
        title: 'Visual Operations Pipeline',
        elements: [
          { label: '⏳ Pending', description: 'คำขอที่ผ่านการอนุมัติแล้ว รอจัดสรรช่างและอะไหล่', color: 'border-gray-500 bg-gray-50 dark:bg-gray-900/40' },
          { label: '⚙️ In Progress', description: 'งานที่ช่างกำลังลงมือปฏิบัติการที่ Workshop หรือหน้างาน', color: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30' },
          { label: '🔍 In Review & Done', description: 'งานที่ทำเสร็จแล้ว รอหัวหน้าตรวจรับ และงานที่ปิดสำเร็จ', color: 'border-green-500 bg-green-50 dark:bg-green-950/30' },
        ],
        notes: 'การ์ดแต่ละใบแสดงชื่อโปรเจกต์ วันกำหนดส่ง และรูปโปรไฟล์ผู้รับผิดชอบ'
      },
      features: [
        'Fluid drag-and-drop mechanics',
        'Assignee avatar badges and job tags',
        'Urgent status indicator badges',
        'Search and category quick filters'
      ],
      tips: [
        'คลิกที่ตัวการ์ดเพื่อเปิดดูรายละเอียดและเช็กลิสต์ย่อยภายในงาน',
        'สามารถใช้ร่วมกับหน้า Dashboard เพื่อให้เห็นการไหลของงานแบบ Real-time'
      ]
    },
    {
      id: 'chap-calendar',
      menuId: 'calendar',
      category: 'Core',
      categoryTH: 'งานหลัก',
      titleEN: '7. Calendar, Shift Scheduling & Deadlines',
      titleTH: '7. ปฏิทินงาน ตารางเวร และกำหนดส่งมอบ (Calendar)',
      icon: Calendar,
      badge: 'Core Menu',
      path: '/calendar',
      targetRole: 'All Users, Planners, Coordinators',
      summaryEN: 'Interactive multi-view calendar displaying task deadlines, scheduled maintenance, offshore mobilization dates, and team shifts.',
      summaryTH: 'ปฏิทินรวมแผนการดำเนินงาน แสดงกำหนดส่งมอบงาน ตารางซ่อมบำรุงตามรอบ วันลงเรือออฟชอร์ และตารางเวรประจำสัปดาห์',
      steps: [
        {
          stepNumber: 1,
          titleEN: 'Switch Month / Week / Day Views',
          titleTH: 'สลับมุมมองรายเดือน รายสัปดาห์ หรือรายวัน',
          descriptionEN: 'Toggle views to inspect high-level monthly deadlines or zoom in on daily technician schedules.',
          descriptionTH: 'เลือกดูภาพรวมรายเดือนเพื่อดูวันส่งมอบโปรเจกต์ หรือดูแบบรายสัปดาห์เพื่อวางแผนงานช่าง',
        },
        {
          stepNumber: 2,
          titleEN: 'Click on Calendar Events',
          titleTH: 'คลิกที่แถบกิจกรรมเพื่อดูรายละเอียด',
          descriptionEN: 'Click any task event to open its detail modal, view assigned crew, location, and checklist status.',
          descriptionTH: 'คลิกที่ชื่อกิจกรรมในปฏิทินเพื่อดูรายละเอียดของงาน ช่างที่รับผิดชอบ และความคืบหน้า',
        }
      ],
      mockup: {
        type: 'calendar_grid',
        title: 'Operational Schedule Matrix',
        elements: [
          { label: '📅 ตารางปฏิทินรายเดือน', description: 'แสดงหมุดงานและแท็กสีแยกตามแผนก (Mechanical, Electrical, Offshore)', color: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30' },
          { label: '🏷️ แท็กสถานะและประเภทงาน', description: 'สีส้ม: งานซ่อมบำรุง, สีน้ำเงิน: งานโปรเจกต์ลูกค้า, สีเขียว: งานเสร็จแล้ว', color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' },
        ],
        notes: 'ซิงค์ข้อมูลวันกำหนดส่งจากระบบ Tasks และ Work Requests อัตโนมัติ'
      },
      features: [
        'Color-coded event categorizations',
        'Direct task jump from calendar click',
        'Previous/Next month navigation and Today shortcut',
        'Mobile touch-friendly grid layout'
      ],
      tips: [
        'ใช้ปฏิทินตรวจสอบวันครบกำหนดส่งงานเพื่อป้องกันงานล่าช้ากว่าแผน',
        'สามารถดูวันลาของเพื่อนร่วมทีมเพื่อวางแผนทดแทนกำลังคนล่วงหน้า'
      ]
    },
    {
      id: 'chap-availability',
      menuId: 'employee-availability',
      category: 'Operations & Team',
      categoryTH: 'การดำเนินงาน & ทีม',
      titleEN: '8. Employee Availability & Roster Status',
      titleTH: '8. สถานะความพร้อมและตารางเวรพนักงาน (Availability)',
      icon: Clock,
      badge: 'Personnel Hub',
      path: '/employee-availability',
      targetRole: 'Site Manager, HR, Team Leads',
      summaryEN: 'Real-time directory of employee duty status: On-Duty, On-Leave, Standby, or Mobilized Offshore with contact shortcuts.',
      summaryTH: 'ระบบติดตามสถานะความพร้อมของทีมงานทุกคน ตรวจสอบว่าใครกำลังปฏิบัติงาน อยู่เวร Standby ลาพักร้อน หรือปฏิบัติงานนอกสถานที่',
      steps: [
        {
          stepNumber: 1,
          titleEN: 'Inspect Staff Status Badges',
          titleTH: 'ตรวจสอบป้ายสถานะของพนักงานแต่ละคน',
          descriptionEN: 'Check green (Available / On-Duty), amber (Standby), red (On-Leave), or purple (Offshore Mobilized) tags.',
          descriptionTH: 'ดูแถบสีสถานะ: สีเขียว (พร้อมปฏิบัติงาน), สีส้ม (Standby), สีแดง (ลาพัก), สีม่วง (ปฏิบัติงานนอกสถานที่/ออฟชอร์)',
        },
        {
          stepNumber: 2,
          titleEN: 'Filter by Department & Role',
          titleTH: 'กรองรายชื่อตามแผนกและตำแหน่ง',
          descriptionEN: 'Filter technicians by skill (e.g. Scaffolding, Turbine, SCADA, Inspection) to find available personnel for urgent dispatch.',
          descriptionTH: 'ค้นหาตามทักษะความเชี่ยวชาญ เช่น ช่างเทอร์ไบน์, ช่างไฟฟ้าแรงสูง เพื่อเลือกจ่ายงานด่วนได้ตรงคน',
        }
      ],
      mockup: {
        type: 'availability_roster',
        title: 'Real-Time Workforce Readiness',
        elements: [
          { label: '🟢 พร้อมปฏิบัติงาน (Available)', description: 'พนักงานประจำไซต์ที่พร้อมรับงานใหม่ได้ทันที', color: 'border-green-500 bg-green-50 dark:bg-green-950/30' },
          { label: '🟡 อยู่เวรเตรียมพร้อม (Standby)', description: 'พนักงานที่อยู่ในโหมดเตรียมพร้อมรอเรียกรวมพลกรณีฉุกเฉิน', color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30' },
          { label: '🔴 ลาพักผ่อน / ป่วย (On Leave)', description: 'พนักงานที่ลาพัก พร้อมระบุวันที่กลับเข้าประจำการ', color: 'border-red-500 bg-red-50 dark:bg-red-950/30' },
        ],
        notes: 'เชื่อมต่อกับรายชื่อพนักงานและโปรไฟล์ในระบบ Supabase Database'
      },
      features: [
        'Live duty status badges and quick search',
        'Skills and certification tags',
        'Direct phone and email contact shortcuts',
        'Department and location filtering'
      ],
      tips: [
        'Site Manager สามารถปรับสถานะของทีมงานเมื่อมีการสลับกะหรือเปลี่ยนตารางเวร',
        'ช่วยในการวางแผนจัดคนลงในตาราง Manpower Report ประจำสัปดาห์'
      ]
    },
    {
      id: 'chap-projects',
      menuId: 'proj-dashboard',
      category: 'Projects & Planning',
      categoryTH: 'โครงการ & แผนงาน',
      titleEN: '9. Project Dashboard, Gantt Chart & Portfolio',
      titleTH: '9. แดชบอร์ดโครงการ แผนภูมิแกนต์ และพอร์ตโฟลิโอ',
      icon: Briefcase,
      badge: 'Project Suite',
      path: '/proj-dashboard',
      targetRole: 'Project Managers, Planners, Executives',
      summaryEN: 'Strategic project governance suite including Gantt timeline dependencies, portfolio health tracking, S-Curves, and capacity workload.',
      summaryTH: 'ชุดเครื่องมือบริหารโครงการระดับมืออาชีพ ดูเส้นทางวิกฤต (Critical Path) ใน Gantt Chart ตรวจสอบงบประมาณ และติดตามความคืบหน้าของทุกสัญญา',
      steps: [
        {
          stepNumber: 1,
          titleEN: 'Project Dashboard & S-Curve',
          titleTH: 'แดชบอร์ดโครงการและกราฟความคืบหน้า (S-Curve)',
          descriptionEN: 'Compare Planned vs Actual progress, monitor budget burn rates, and track major milestone deliverables.',
          descriptionTH: 'เปรียบเทียบแผนงาน (Planned) กับความคืบหน้าจริง (Actual) พร้อมดูสถานะงบประมาณของแต่ละโครงการ',
        },
        {
          stepNumber: 2,
          titleEN: 'Interactive Gantt Chart Timeline',
          titleTH: 'แผนภูมิแกนต์ (Gantt Chart)',
          descriptionEN: 'Explore project phases, start/end dates, task dependencies, and critical milestones across the project lifecycle.',
          descriptionTH: 'ดูแท่งไทม์ไลน์ของแต่ละกิจกรรม ความเชื่อมโยงระหว่างเฟสงาน และวันครบกำหนดส่งมอบ',
        },
        {
          stepNumber: 3,
          titleEN: 'Portfolio & Workload Capacity',
          titleTH: 'พอร์ตโฟลิโอและการวิเคราะห์ภาระงาน (Workload)',
          descriptionEN: 'Analyze overall enterprise portfolio by sector (Oil & Gas, Industrial, Marine) and balance workforce allocation to avoid bottlenecks.',
          descriptionTH: 'ดูภาพรวมโครงการทั้งหมดในมือ แยกตามกลุ่มอุตสาหกรรม และดู Heatmap ภาระงานเพื่อกระจายงานอย่างเหมาะสม',
        }
      ],
      mockup: {
        type: 'gantt_and_portfolio',
        title: 'Enterprise Project Management Suite',
        elements: [
          { label: '📈 แดชบอร์ดโครงการ & งบประมาณ', description: 'เปอร์เซ็นต์ความคืบหน้า, วันสิ้นสุดสัญญา, มูลค่างาน และความเสี่ยง', color: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30' },
          { label: '📊 แผนภูมิแกนต์ (Gantt Chart)', description: 'ไทม์ไลน์งานแนวนอน พร้อมแท่งความคืบหน้าและการเชื่อมโยงเฟส', color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' },
          { label: '⚡ การจัดสรรภาระงาน (Workload)', description: 'กราฟวิเคราะห์ภาระงานของทีม ป้องกันการทำงานเกินกำลัง (Overload)', color: 'border-purple-500 bg-purple-50 dark:bg-purple-950/30' },
        ],
        notes: 'รองรับการซิงค์ข้อมูลกับระบบ Tasks และ Manpower แบบอัตโนมัติ'
      },
      features: [
        'Milestone and S-Curve progress tracking',
        'Interactive Gantt timeline with phase bars',
        'Multi-project portfolio health overview',
        'Capacity and workload heatmap analytics'
      ],
      tips: [
        'ใช้หน้า Portfolio เมื่อต้องการรายงานสถานะโครงการรวมแก่คณะผู้บริหาร',
        'ใช้หน้า Workload เพื่อตรวจสอบว่าแผนกใดมีงานล้นมือและต้องการกำลังคนเสริม'
      ]
    },
    {
      id: 'chap-governance',
      menuId: 'approval',
      category: 'Governance & Reports',
      categoryTH: 'การควบคุม & รายงาน',
      titleEN: '10. Approval Center, Quality Scores & Reports',
      titleTH: '10. ศูนย์อนุมัติ คะแนนผลงาน และรายงานสรุป (Governance)',
      icon: ShieldCheck,
      badge: 'Governance',
      path: '/approval',
      targetRole: 'Site Managers, Lead Auditors, QA/QC',
      summaryEN: 'Governance engine for multi-tier work order approvals, technician performance scoring, audit trails, and executive report generation.',
      summaryTH: 'ระบบควบคุมคุณภาพ การอนุมัติใบงานตามลำดับขั้น การให้คะแนนผลงานและคุณภาพงาน (Quality Score) พร้อมรายงานวิเคราะห์สำหรับผู้บริหาร',
      steps: [
        {
          stepNumber: 1,
          titleEN: 'Approve or Reject Work Requests',
          titleTH: 'ตรวจสอบและอนุมัติใบคำของานใน Approval Center',
          descriptionEN: 'Review submitted work orders, verify manpower & parts requirements, and click "Approve" or "Reject" with feedback notes.',
          descriptionTH: 'ตรวจสอบรายละเอียดคำของานที่ส่งเข้ามา กดปุ่ม "อนุมัติ (Approve)" หรือ "ปฏิเสธ (Reject)" พร้อมระบุเหตุผล',
        },
        {
          stepNumber: 2,
          titleEN: 'Audit Performance Scores',
          titleTH: 'ตรวจสอบคะแนนผลงาน (Performance Score & Audit)',
          descriptionEN: 'Evaluate completed jobs based on safety, punctuality, and workmanship quality scores.',
          descriptionTH: 'ดูคะแนนประเมินการทำงาน ความปลอดภัย ความตรงต่อเวลา และคุณภาพการส่งมอบงานของทีมงาน',
        },
        {
          stepNumber: 3,
          titleEN: 'Generate Executive Business Reports',
          titleTH: 'สร้างและส่งออกรายงานวิเคราะห์ (Reports)',
          descriptionEN: 'Export monthly performance charts, request completion ratios, and download CSV summaries.',
          descriptionTH: 'ดูสถิติคำของานรายเดือน อัตราความสำเร็จ และส่งออกเอกสารสรุปผลการดำเนินงาน',
        }
      ],
      mockup: {
        type: 'approval_flow',
        title: 'Compliance & Quality Control Workflow',
        elements: [
          { label: '✅ ศูนย์อนุมัติ (Approval Center)', description: 'รายการคำขอรอการอนุมัติ พร้อมปุ่ม Approve / Reject ในคลิกเดียว', color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
          { label: '⭐ คะแนนผลงาน (Performance)', description: 'ระบบคำนวณคะแนน KPI ประจำเดือน และประวัติการประเมิน', color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30' },
          { label: '📊 รายงานสถิติ (Reports & Exports)', description: 'กราฟสรุปคำของาน และปุ่มดาวน์โหลดรายงาน', color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' },
        ],
        notes: 'ทุกการอนุมัติจะถูกบันทึกรหัสผู้กระทำและเวลาลงในระบบ Audit Log อัตโนมัติ'
      },
      features: [
        'Single-click approval with comment dialog',
        'Automated KPI calculation algorithms',
        'Transparent quality score audit history',
        'Comprehensive PDF/CSV report generation'
      ],
      tips: [
        'หัวหน้างานสามารถตรวจสอบประวัติการอนุมัติย้อนหลังได้ตลอดเวลา',
        'คะแนนประเมินจะถูกนำไปใช้ในสรุปผลงานประจำปีของช่างเทคนิคแต่ละคน'
      ]
    },
    {
      id: 'chap-admin',
      menuId: 'users',
      category: 'Admin',
      categoryTH: 'ผู้ดูแลระบบ',
      titleEN: '11. User Management, RBAC & Security Audit',
      titleTH: '11. การจัดการผู้ใช้ สิทธิ์ และบันทึกความปลอดภัย (Admin)',
      icon: UserCog,
      badge: 'Admin Only',
      path: '/users',
      targetRole: 'System Administrator, HR Lead',
      summaryEN: 'Administrative console for managing user accounts, role-based access permissions (RBAC), and security audit logs.',
      summaryTH: 'หน้าควบคุมสำหรับแอดมิน จัดการบัญชีผู้ใช้งาน กำหนดสิทธิ์ตามตำแหน่งงาน (RBAC) และตรวจสอบบันทึกความปลอดภัยของระบบ (Audit Log)',
      steps: [
        {
          stepNumber: 1,
          titleEN: 'Manage User Profiles & Roles',
          titleTH: 'จัดการรายชื่อผู้ใช้และบทบาทหน้าที่',
          descriptionEN: 'Create, update, or deactivate user accounts. Assign roles: Admin, Site Manager, Supervisor, Engineer, or Technician.',
          descriptionTH: 'เพิ่ม แก้ไข หรือปิดการใช้งานบัญชีพนักงาน พร้อมกำหนดสิทธิ์ตามตำแหน่งหน้าที่',
        },
        {
          stepNumber: 2,
          titleEN: 'Inspect Security Audit Trail',
          titleTH: 'ตรวจสอบบันทึกกิจกรรมระบบ (Audit Log)',
          descriptionEN: 'Review timestamped system events, logins, data edits, and approval actions with full traceability.',
          descriptionTH: 'ดูประวัติการทำรายการทุกขั้นตอนในระบบ ใครเป็นผู้แก้ไขข้อมูล อนุมัติงาน หรือล็อกอิน เมื่อเวลาใด',
        }
      ],
      mockup: {
        type: 'admin_security',
        title: 'Enterprise RBAC & Security Log',
        elements: [
          { label: '👥 จัดการผู้ใช้และสิทธิ์ (Users)', description: 'ตารางบัญชีพนักงาน บทบาท แผนก และสถานะการเปิดใช้งาน', color: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30' },
          { label: '📜 บันทึกการตรวจสอบ (Audit Log)', description: 'บันทึก Timeline กิจกรรมความปลอดภัย ย้อนรอยได้ 100%', color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' },
        ],
        notes: 'ระบบรักษาความปลอดภัยระดับองค์กร ปกป้องข้อมูลลับของโครงการ'
      },
      features: [
        'Role-Based Access Control (Admin, Manager, Tech)',
        'Comprehensive activity audit logging',
        'Supabase user sync and profile management',
        'Session security and credential safeguarding'
      ],
      tips: [
        'ควรตรวจสอบบันทึก Audit Log เป็นประจำเพื่อความปลอดภัยของข้อมูล',
        'การเปลี่ยนตำแหน่งผู้ใช้จะมีผลต่อสิทธิ์การเข้าถึงเมนูต่างๆ ทันที'
      ]
    },
    {
      id: 'chap-voice',
      menuId: 'voice',
      category: 'Smart AI Tools',
      categoryTH: 'เครื่องมืออัจฉริยะ AI',
      titleEN: '12. AI Voice Report & Speech-to-Ticket',
      titleTH: '12. การรายงานด้วยเสียง AI อัจฉริยะ (Voice Report)',
      icon: Mic,
      badge: 'AI Powered',
      path: '/voice-report',
      targetRole: 'Field Technicians, Offshore Crew, Inspectors',
      summaryEN: 'Field voice recording module that uses AI to transcribe Thai and English speech into structured maintenance tickets and work orders.',
      summaryTH: 'เครื่องมือช่วยรายงานหน้างานด้วยเสียง เพียงกดปุ่มอัดเสียงแล้วพูดรายงาน ระบบ AI จะแปลงเสียงเป็นข้อความและสร้างใบคำของานให้โดยอัตโนมัติ',
      steps: [
        {
          stepNumber: 1,
          titleEN: 'Press Record & Speak Findings',
          titleTH: 'กดปุ่มไมโครโฟนและพูดรายงานความเสียหาย',
          descriptionEN: 'Press the microphone button and speak in Thai or English describing the equipment, issue, location, and urgency.',
          descriptionTH: 'กดปุ่มไมโครโฟนสีส้ม แล้วพูดรายงานอาการเสียของอุปกรณ์ เช่น "ปั๊มน้ำมันไฮดรอลิกหมายเลข 3 ที่ช็อประยองมีเสียงดังผิดปกติ ต้องการอะไหล่ด่วน"',
        },
        {
          stepNumber: 2,
          titleEN: 'Review AI Transcript & Structured Form',
          titleTH: 'ตรวจสอบข้อความถอดเสียงและฟอร์มที่ AI สรุปให้',
          descriptionEN: 'AI automatically categorizes the department, priority level, equipment tag, and generates a formatted ticket draft.',
          descriptionTH: 'ระบบ AI จะจัดหมวดหมู่งาน เลือกระดับความเร่งด่วน และกรอกหัวข้อใบงานให้อัตโนมัติ',
        },
        {
          stepNumber: 3,
          titleEN: 'One-Click Save to Work Requests',
          titleTH: 'กดบันทึกเข้าสู่ระบบคำของานทันที',
          descriptionEN: 'Click "Create Request" to submit the ticket straight into the live operations workflow without manual typing.',
          descriptionTH: 'กดปุ่มบันทึกเพื่อส่งคำขอเข้าสู่ระบบคำของาน (Work Requests) โดยไม่ต้องเสียเวลาพิมพ์ทีละช่อง',
        }
      ],
      mockup: {
        type: 'voice_ai_flow',
        title: 'Voice-to-Ticket AI Pipeline',
        elements: [
          { label: '🎙️ บันทึกเสียงรายงานหน้างาน', description: 'กดอัดเสียง รองรับทั้งภาษาไทยและศัพท์เทคนิคภาษาอังกฤษ', color: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30' },
          { label: '🤖 AI วิเคราะห์และสกัดข้อมูล', description: 'แยกแยะอุปกรณ์ แผนกช่าง ระดับความเร่งด่วน และสาเหตุ', color: 'border-purple-500 bg-purple-50 dark:bg-purple-950/30' },
          { label: '📋 สร้างใบงานเข้าสู่ระบบอัตโนมัติ', description: 'แปลงเป็น Work Request พร้อมส่งเข้าศูนย์อนุมัติทันที', color: 'border-green-500 bg-green-50 dark:bg-green-950/30' },
        ],
        notes: 'เหมาะอย่างยิ่งสำหรับช่างเทคนิคที่สวมถุงมือหรือปฏิบัติงานในพื้นที่หน้างาน'
      },
      features: [
        'Hands-free voice reporting for field technicians',
        'Automatic Thai & English technical term recognition',
        'Smart priority and department inference',
        'Seamless integration with Work Requests & Tasks'
      ],
      tips: [
        'พูดระบุชื่ออุปกรณ์หรือหมายเลข Job No. ให้ชัดเจนเพื่อให้ AI ระบุโครงการได้แม่นยำที่สุด',
        'สามารถเปิดใช้งานได้รวดเร็วจากปุ่ม (+) FAB ที่มุมขวาล่างของทุกหน้าจอ'
      ]
    }
  ];

  // Filtering
  const filteredChapters = useMemo(() => {
    return chapters.filter(c => {
      const matchSearch = 
        c.titleTH.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.titleEN.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.summaryTH.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.summaryEN.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.targetRole.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCategory = selectedCategory === 'all' || c.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [chapters, searchQuery, selectedCategory]);

  const currentChapter = chapters[activeChapterIndex] || chapters[0];

  const categories = [
    { id: 'all', labelEN: 'All Modules', labelTH: 'ทุกโมดูล' },
    { id: 'Overview', labelEN: 'Overview', labelTH: 'ภาพรวมระบบ' },
    { id: 'Core', labelEN: 'Core Operations', labelTH: 'งานหลัก' },
    { id: 'Operations & Team', labelEN: 'Personnel & Manpower', labelTH: 'กำลังพล & ทีม' },
    { id: 'Projects & Planning', labelEN: 'Projects & Planning', labelTH: 'โครงการ' },
    { id: 'Governance & Reports', labelEN: 'Governance', labelTH: 'ควบคุมคุณภาพ' },
    { id: 'Admin', labelEN: 'Admin & Security', labelTH: 'ผู้ดูแลระบบ' },
    { id: 'Smart AI Tools', labelEN: 'AI Tools', labelTH: 'เครื่องมือ AI' },
  ];

  const handleNext = () => {
    if (activeChapterIndex < chapters.length - 1) {
      setActiveChapterIndex(activeChapterIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (activeChapterIndex > 0) {
      setActiveChapterIndex(activeChapterIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const t = {
    EN: {
      headerTitle: 'IKM Operations System User Manual',
      headerSubtitle: 'Comprehensive Illustrated Standard Operating Procedure (SOP) & Feature Handbook',
      bookletMode: 'Booklet Reader',
      fullMode: 'Full Document View',
      gridMode: 'Chapter Grid',
      searchPlaceholder: 'Search manual, menu, workflow, or keyword...',
      chapterNav: 'Table of Contents',
      page: 'Chapter',
      of: 'of',
      nextChapter: 'Next Chapter',
      prevChapter: 'Previous Chapter',
      targetAudience: 'Target Role:',
      stepByStep: 'Step-by-Step Instructions & Workflow',
      keyFeatures: 'Key Capabilities & Features',
      expertTips: 'Best Practices & Operational Tips',
      uiMockup: 'Visual Interface Architecture & Annotations',
      jumpToFeature: 'Open This Feature in App',
      printManual: 'Print Handbook (PDF)',
      sopBadge: 'Official IKM SOP Guide v2.6',
    },
    TH: {
      headerTitle: 'คู่มือการใช้งานระบบ IKM Operations Management',
      headerSubtitle: 'คู่มือรูปเล่มแบบละเอียด แสดงขั้นตอนการทำงาน ภาพประกอบจำลอง และแนวทางปฏิบัติทุกเมนู',
      bookletMode: 'เปิดอ่านแบบรูปเล่ม (Booklet)',
      fullMode: 'เอกสารต่อเนื่อง (Full View)',
      gridMode: 'สารบัญโมดูล (Grid View)',
      searchPlaceholder: 'ค้นหาคู่มือ, ชื่อเมนู, ขั้นตอนการใช้งาน หรือคำค้นหา...',
      chapterNav: 'สารบัญคู่มือ (Table of Contents)',
      page: 'บทที่',
      of: 'จากทั้งหมด',
      nextChapter: 'บทถัดไป',
      prevChapter: 'บทก่อนหน้า',
      targetAudience: 'กลุ่มผู้ใช้งานหลัก:',
      stepByStep: 'ขั้นตอนการใช้งานและกระบวนการทำงาน (Step-by-Step)',
      keyFeatures: 'คุณสมบัติและฟังก์ชันเด่นประจำเมนู',
      expertTips: 'ข้อแนะนำและข้อควรระวังในการปฏิบัติงาน',
      uiMockup: 'แผนผังจำลองหน้าจอและตำแหน่งการใช้งาน (UI Layout)',
      jumpToFeature: 'ทดลองเปิดใช้งานเมนูนี้ในระบบ',
      printManual: 'พิมพ์รูปเล่มคู่มือ (Print / PDF)',
      sopBadge: 'คู่มือมาตรฐานการปฏิบัติงาน IKM SOP v2.6',
    }
  }[language];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-32">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-ikm-card via-ikm-bg to-ikm-card border border-ikm-border rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-ikm-orange text-white uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                {t.sopBadge}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                12 Chapters • All Menus Covered
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-ikm-text tracking-tight">
              {t.headerTitle}
            </h1>
            <p className="text-sm md:text-base text-ikm-text-secondary max-w-3xl">
              {t.headerSubtitle}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
            <button
              onClick={() => window.print()}
              className="h-10 px-4 rounded-xl bg-ikm-card hover:bg-ikm-bg border border-ikm-border text-ikm-text text-xs md:text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              <Printer className="w-4 h-4 text-ikm-orange" />
              <span>{t.printManual}</span>
            </button>
            <div className="flex items-center bg-ikm-bg p-1 rounded-xl border border-ikm-border">
              <button
                onClick={() => setViewMode('booklet')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'booklet' ? 'bg-ikm-orange text-white shadow-sm' : 'text-ikm-text-secondary hover:text-ikm-text'
                }`}
              >
                {t.bookletMode}
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid' ? 'bg-ikm-orange text-white shadow-sm' : 'text-ikm-text-secondary hover:text-ikm-text'
                }`}
              >
                {t.gridMode}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-ikm-card p-3 rounded-2xl border border-ikm-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ikm-text-secondary" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-sm rounded-xl border border-ikm-border bg-ikm-bg text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ikm-text-secondary hover:text-ikm-text"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-ikm-orange text-white shadow-sm'
                  : 'bg-ikm-bg text-ikm-text-secondary hover:text-ikm-text border border-ikm-border'
              }`}
            >
              {language === 'TH' ? cat.labelTH : cat.labelEN}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Content: Booklet Mode vs Grid Mode */}
      {viewMode === 'booklet' ? (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
          
          {/* Left Table of Contents Sidebar (Book Index) */}
          <Card className="p-4 space-y-3 sticky top-20 border border-ikm-border shadow-md">
            <div className="flex items-center justify-between border-b border-ikm-border pb-3">
              <h3 className="font-extrabold text-sm text-ikm-text flex items-center gap-2">
                <Book className="w-4 h-4 text-ikm-orange" />
                <span>{t.chapterNav}</span>
              </h3>
              <span className="text-xs font-bold text-ikm-orange bg-ikm-orange/10 px-2 py-0.5 rounded-full">
                {activeChapterIndex + 1} / {chapters.length}
              </span>
            </div>

            <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
              {filteredChapters.map((chap, idx) => {
                const originalIdx = chapters.findIndex(c => c.id === chap.id);
                const isActive = originalIdx === activeChapterIndex;
                const IconComponent = chap.icon;

                return (
                  <button
                    key={chap.id}
                    onClick={() => setActiveChapterIndex(originalIdx)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                      isActive 
                        ? 'bg-ikm-orange text-white shadow-md shadow-ikm-orange/20 translate-x-1' 
                        : 'text-ikm-text-secondary hover:text-ikm-text hover:bg-ikm-bg'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-ikm-card text-ikm-orange border border-ikm-border'
                      }`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{language === 'TH' ? chap.titleTH : chap.titleEN}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Quick Booklet Navigation Footer */}
            <div className="pt-3 border-t border-ikm-border flex items-center justify-between gap-2">
              <button
                onClick={handlePrev}
                disabled={activeChapterIndex === 0}
                className="flex-1 h-9 rounded-lg bg-ikm-bg hover:bg-ikm-card disabled:opacity-40 disabled:cursor-not-allowed text-ikm-text text-xs font-bold flex items-center justify-center gap-1 border border-ikm-border transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t.prevChapter}</span>
              </button>
              <button
                onClick={handleNext}
                disabled={activeChapterIndex === chapters.length - 1}
                className="flex-1 h-9 rounded-lg bg-ikm-orange hover:bg-ikm-orange-dark disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-sm"
              >
                <span>{t.nextChapter}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </Card>

          {/* Right Main Page: Detailed Chapter Booklet Sheet */}
          <div className="space-y-6">
            <Card className="p-6 md:p-8 border border-ikm-border shadow-lg space-y-8 bg-gradient-to-b from-ikm-card to-ikm-card/90 relative overflow-hidden">
              
              {/* Decorative Book Corner */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-ikm-orange/10 to-transparent pointer-events-none" />

              {/* Chapter Header Banner */}
              <div className="border-b border-ikm-border pb-6 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-ikm-orange/10 text-ikm-orange border border-ikm-orange/20">
                      {language === 'TH' ? currentChapter.categoryTH : currentChapter.category}
                    </span>
                    {currentChapter.badge && (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        {currentChapter.badge}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => navigate(currentChapter.path)}
                    className="h-8 px-3 rounded-lg bg-ikm-orange text-white hover:bg-ikm-orange-dark text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>{t.jumpToFeature}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-ikm-orange text-white flex items-center justify-center shadow-lg flex-shrink-0">
                    <currentChapter.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-ikm-text">
                      {language === 'TH' ? currentChapter.titleTH : currentChapter.titleEN}
                    </h2>
                    <p className="text-sm md:text-base text-ikm-text-secondary mt-1">
                      {language === 'TH' ? currentChapter.summaryTH : currentChapter.summaryEN}
                    </p>
                    <div className="mt-2 text-xs font-semibold text-ikm-orange flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>{t.targetAudience} {currentChapter.targetRole}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-step Execution Flow */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-ikm-text flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-ikm-orange" />
                  <span>{t.stepByStep}</span>
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {currentChapter.steps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-4 md:p-5 rounded-2xl bg-ikm-bg border border-ikm-border flex items-start gap-4 hover:border-ikm-orange/40 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-ikm-orange text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-md">
                        {step.stepNumber}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <h4 className="font-bold text-base text-ikm-text">
                          {language === 'TH' ? step.titleTH : step.titleEN}
                        </h4>
                        <p className="text-sm text-ikm-text-secondary leading-relaxed">
                          {language === 'TH' ? step.descriptionTH : step.descriptionEN}
                        </p>
                        {step.tipTH && (
                          <div className="mt-2 text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 p-2 rounded-lg border border-amber-200 dark:border-amber-800/40 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                            <span><strong>Tip:</strong> {language === 'TH' ? step.tipTH : step.tipEN}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Mockup & Layout Annotation */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-ikm-text flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-status-blue" />
                  <span>{t.uiMockup}</span>
                </h3>

                <div className="p-5 md:p-6 rounded-2xl bg-ikm-bg border-2 border-dashed border-ikm-border space-y-4">
                  <div className="flex items-center justify-between border-b border-ikm-border pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <span className="text-xs font-mono font-bold text-ikm-text-secondary ml-2">
                        {currentChapter.mockup.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-ikm-text-secondary">Interactive Annotation Diagram</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {currentChapter.mockup.elements.map((el, i) => (
                      <div key={i} className={`p-3.5 rounded-xl border ${el.color} space-y-1`}>
                        <div className="text-xs font-extrabold text-gray-900 dark:text-gray-100">{el.label}</div>
                        <div className="text-xs text-gray-700 dark:text-gray-300 leading-normal">{el.description}</div>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-ikm-text-secondary italic pt-2 border-t border-ikm-border/60">
                    💡 <strong>หมายเหตุ:</strong> {currentChapter.mockup.notes}
                  </div>
                </div>
              </div>

              {/* Key Features & Expert Tips Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Features List */}
                <div className="p-5 rounded-2xl bg-ikm-bg border border-ikm-border space-y-3">
                  <h4 className="text-sm font-extrabold text-ikm-text flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-status-green" />
                    <span>{t.keyFeatures}</span>
                  </h4>
                  <ul className="space-y-2">
                    {currentChapter.features.map((feat, i) => (
                      <li key={i} className="text-xs text-ikm-text-secondary flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-green mt-1.5 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Expert Tips */}
                <div className="p-5 rounded-2xl bg-ikm-bg border border-ikm-border space-y-3">
                  <h4 className="text-sm font-extrabold text-ikm-text flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-ikm-orange" />
                    <span>{t.expertTips}</span>
                  </h4>
                  <ul className="space-y-2">
                    {currentChapter.tips.map((tip, i) => (
                      <li key={i} className="text-xs text-ikm-text-secondary flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-ikm-orange mt-1.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Booklet Navigation Bottom Bar */}
              <div className="pt-6 border-t border-ikm-border flex items-center justify-between gap-4">
                <button
                  onClick={handlePrev}
                  disabled={activeChapterIndex === 0}
                  className="px-4 py-2.5 rounded-xl bg-ikm-bg hover:bg-ikm-card disabled:opacity-30 disabled:cursor-not-allowed text-ikm-text text-xs md:text-sm font-bold flex items-center gap-2 border border-ikm-border transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t.prevChapter}</span>
                </button>

                <div className="text-xs font-bold text-ikm-text-secondary">
                  {t.page} {activeChapterIndex + 1} {t.of} {chapters.length}
                </div>

                <button
                  onClick={handleNext}
                  disabled={activeChapterIndex === chapters.length - 1}
                  className="px-4 py-2.5 rounded-xl bg-ikm-orange hover:bg-ikm-orange-dark disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs md:text-sm font-bold flex items-center gap-2 transition-all shadow-md"
                >
                  <span>{t.nextChapter}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </Card>
          </div>

        </div>
      ) : (
        /* Chapter Grid View (Overview of all 12 modules) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredChapters.map((chap, idx) => {
            const originalIdx = chapters.findIndex(c => c.id === chap.id);
            const IconComponent = chap.icon;

            return (
              <Card
                key={chap.id}
                onClick={() => {
                  setActiveChapterIndex(originalIdx);
                  setViewMode('booklet');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-5 hover:shadow-xl hover:border-ikm-orange transition-all cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-ikm-orange/10 text-ikm-orange flex items-center justify-center font-bold group-hover:bg-ikm-orange group-hover:text-white transition-colors">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-ikm-bg text-ikm-text-secondary border border-ikm-border">
                      {language === 'TH' ? chap.categoryTH : chap.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-ikm-text group-hover:text-ikm-orange transition-colors">
                      {language === 'TH' ? chap.titleTH : chap.titleEN}
                    </h3>
                    <p className="text-xs text-ikm-text-secondary line-clamp-2 mt-1">
                      {language === 'TH' ? chap.summaryTH : chap.summaryEN}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-ikm-border flex items-center justify-between text-xs font-bold text-ikm-orange">
                  <span>{language === 'TH' ? 'อ่านคู่มือบทนี้' : 'Read Chapter'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
}
