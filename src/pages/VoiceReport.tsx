import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { SupabaseService } from '../lib/supabaseService';
import { VoiceReport as VoiceReportType } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Mic, MicOff, Sparkles, CheckCircle2, AlertTriangle, 
  Clock, Tag, Building, Wrench, ShieldAlert, FileText, 
  Trash2, RefreshCw, Plus, Database, Filter, Search, 
  Volume2, Check, ArrowRight, Share2, Download, ListFilter,
  CheckSquare, ArrowUpRight
} from 'lucide-react';

export function VoiceReport() {
  const { language, user, tasks } = useStore();
  
  // State
  const [reports, setReports] = useState<VoiceReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [recordingLanguage, setRecordingLanguage] = useState<'th-TH' | 'en-US'>('th-TH');
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  
  // Form fields (populated by AI or manual)
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState<VoiceReportType['category']>('Inspection');
  const [priority, setPriority] = useState<VoiceReportType['priority']>('Medium');
  const [equipmentId, setEquipmentId] = useState('');
  const [siteLocation, setSiteLocation] = useState('Zone B - Compressor Yard');
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [newActionItem, setNewActionItem] = useState('');
  const [tags, setTags] = useState<string[]>(['VoiceLog', 'FieldOps']);
  const [newTag, setNewTag] = useState('');
  const [createLinkedTask, setCreateLinkedTask] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<VoiceReportType | null>(null);

  // Audio animation visualizer state
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 30, 60, 40, 75, 50, 85, 45, 60, 20]);

  // Refs
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const animRef = useRef<any>(null);

  // Load Voice Reports from Supabase
  const loadReports = async () => {
    setLoading(true);
    try {
      await SupabaseService.seedIfEmpty();
      const data = await SupabaseService.getVoiceReports();
      setReports(data);
    } catch (err) {
      console.error('Error fetching voice reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();

    // Subscribe to realtime updates
    const unsubscribe = SupabaseService.subscribeToVoiceReports(async () => {
      const freshData = await SupabaseService.getVoiceReports();
      setReports(freshData);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Timer effect for recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);

      // Audio waveform randomizer for UI visualizer
      animRef.current = setInterval(() => {
        setAudioLevels([
          Math.floor(20 + Math.random() * 60),
          Math.floor(30 + Math.random() * 70),
          Math.floor(40 + Math.random() * 60),
          Math.floor(50 + Math.random() * 50),
          Math.floor(30 + Math.random() * 70),
          Math.floor(20 + Math.random() * 80),
          Math.floor(40 + Math.random() * 60),
          Math.floor(25 + Math.random() * 65),
        ]);
      }, 120);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animRef.current) clearInterval(animRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [isRecording]);

  // Initialize Speech Recognition
  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(language === 'TH' ? 'เบราว์เซอร์ของคุณยังไม่รองรับ Web Speech API กรุณาพิมพ์ข้อความแทน หรือใช้ Chrome/Edge' : 'Speech recognition is not supported in this browser. You can type directly.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = recordingLanguage;

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordDuration(0);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setTranscript(prev => {
            const separator = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
            return prev + separator + currentTranscript;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow microphone permissions.');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
  };

  // AI Structure Analyzer
  const handleAnalyzeWithAI = async () => {
    if (!transcript.trim()) {
      alert(language === 'TH' ? 'กรุณาอัดเสียงหรือพิมพ์ข้อความรายงานก่อนวิเคราะห์' : 'Please record or enter a voice transcript first.');
      return;
    }

    setIsAnalyzingAI(true);
    try {
      const res = await fetch('/api/ai/process-voice-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          language: recordingLanguage.startsWith('th') ? 'TH' : 'EN',
        }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        const r = data.report;
        if (r.title) setTitle(r.title);
        if (r.summary) setSummary(r.summary);
        if (r.category) setCategory(r.category);
        if (r.priority) setPriority(r.priority);
        if (r.equipmentId && r.equipmentId !== 'N/A') setEquipmentId(r.equipmentId);
        if (r.siteLocation) setSiteLocation(r.siteLocation);
        if (Array.isArray(r.actionItems) && r.actionItems.length > 0) setActionItems(r.actionItems);
        if (Array.isArray(r.tags) && r.tags.length > 0) setTags(r.tags);
      }
    } catch (err) {
      console.error('AI analysis error:', err);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Preset Scenarios for quick field testing
  const loadPreset = (presetType: 'gasLeak' | 'turbine' | 'scada' | 'safety') => {
    if (presetType === 'gasLeak') {
      const text = 'ตรวจพบรอยรั่วซึมขนาดเล็กที่วาล์วท่อส่งก๊าซหลัก Valve-4B บริเวณแท่นขุดเจาะโมดูล 4 สั่งการปิดวาล์วรองแล้ว ต้องเตรียมซีลยางทนแรงดันสูงเข้าเปลี่ยนด่วน';
      setTranscript(text);
      setTitle('ตรวจสอบรอยรั่วท่อส่งก๊าซ Valve-4B (ฉุกเฉิน)');
      setSummary('พบรอยรั่วซึมที่วาล์ว 4B บริเวณแท่นเจาะโมดูล 4 สั่งปิดวาล์วสำรองแล้ว แนะนำเปลี่ยนซีลยางทนแรงดันทันที');
      setCategory('Mechanical');
      setPriority('Critical');
      setEquipmentId('VALVE-4B');
      setSiteLocation('Offshore Module 4B');
      setActionItems(['ปิดวาล์วสำรองและตัดระบบแรงดัน', 'เบิกซีลยาง Viton ทนแรงดันสูง', 'จัดทีมช่างเข้าตรวจสอบและทดสอบรั่ว']);
      setTags(['GasLeak', 'Valve4B', 'Offshore', 'Critical']);
    } else if (presetType === 'turbine') {
      const text = 'Completed acoustic and vibration check on Turbine Generator 2. Vibration peak at 2.1 mm/s within ISO 10816-3 norm. Bearing oil temp 64°C.';
      setTranscript(text);
      setTitle('Turbine Generator 2 Vibration & Thermal Check');
      setSummary('Acoustic and vibration inspection on TG-2 completed. All metrics are within acceptable operating tolerances.');
      setCategory('Inspection');
      setPriority('Low');
      setEquipmentId('TURBINE-TG2');
      setSiteLocation('Powerhouse Building 1');
      setActionItems(['Log vibration data in CMMS', 'Next scheduled overhaul at 5,000 hrs']);
      setTags(['Turbine', 'Vibration', 'Normal', 'ISO10816']);
    } else if (presetType === 'scada') {
      const text = 'สถานีไฟฟ้าย่อย Substation 3 มีสัญญาณ Alarm แจ้งเตือน Circuit Breaker 22kV มีค่า Partial Discharge สูงกว่าเกณฑ์ ต้องเข้า Calibrate Sensor';
      setTranscript(text);
      setTitle('แจ้งเตือน Partial Discharge ที่ตู้สวิตช์เกียร์ 22kV');
      setSummary('ตรวจพบสัญญาณเตือน Partial Discharge ผิดปกติที่สถานีไฟฟ้าย่อย 3 ต้องทำการวัดค่าฉนวนและสอบเทียบเซนเซอร์');
      setCategory('Electrical & SCADA');
      setPriority('High');
      setEquipmentId('SWG-22KV-03');
      setSiteLocation('Substation 3 Control Room');
      setActionItems(['นำเครื่องตรวจ Partial Discharge เข้าสแกน', 'ตรวจสอบความชื้นในตู้สวิตช์เกียร์', 'ประสานงานขอดับไฟบางส่วนหากจำเป็น']);
      setTags(['Substation', 'HighVoltage', 'PD-Alarm', 'SCADA']);
    } else {
      const text = 'Safety Walk ประจำสัปดาห์ โซนลานพักคลังสินค้า พบถังดับเพลิงหมดอายุ 2 ถัง และทางหนีไฟมีกล่องวัสดุกีดขวาง สั่งการให้เคลียร์พื้นที่ทันที';
      setTranscript(text);
      setTitle('Safety Walk Inspection - Warehouse Yard');
      setSummary('ตรวจพบถังดับเพลิงหมดอายุ 2 ถัง และมีสิ่งกีดขวางทางหนีไฟ สั่งการฝ่ายคลังเคลื่อนย้ายและเปลี่ยนถังดับเพลิงใหม่');
      setCategory('Safety & HSE');
      setPriority('Medium');
      setEquipmentId('FIRE-EXT-W2');
      setSiteLocation('Warehouse Logistics Yard');
      setActionItems(['เคลื่อนย้ายกล่องออกจากแนวทางหนีไฟ', 'ส่งถังดับเพลิงตรวจสภาพและเปลี่ยนใหม่', 'บันทึกรายงาน Safety Violation']);
      setTags(['SafetyHSE', 'FireSafety', 'Warehouse', 'Audit']);
    }
  };

  // Submit to Supabase
  const handleSaveToSupabase = async () => {
    if (!title.trim() && !transcript.trim()) {
      alert(language === 'TH' ? 'กรุณาระบุหัวข้อหรือบันทึกเสียงก่อนบันทึก' : 'Please provide a title or voice recording.');
      return;
    }

    setSaving(true);
    try {
      const finalTitle = title.trim() || transcript.slice(0, 40) || 'Voice Field Report';
      const finalSummary = summary.trim() || transcript.trim();

      const newReport: Partial<VoiceReportType> = {
        title: finalTitle,
        transcript: transcript.trim(),
        summary: finalSummary,
        category,
        priority,
        equipmentId: equipmentId.trim() || 'N/A',
        siteLocation,
        actionItems: actionItems.length > 0 ? actionItems : ['Review report and perform on-site check'],
        tags,
        durationSeconds: recordDuration || (transcript.length > 0 ? 15 : 0),
        language: recordingLanguage.startsWith('th') ? 'TH' : 'EN',
        createdBy: user?.name || 'Somchai Suksan',
        status: 'Recorded',
      };

      const created = await SupabaseService.createVoiceReport(newReport, createLinkedTask);

      if (created) {
        setSuccessMessage(
          language === 'TH' 
            ? `บันทึกลง Supabase สำเร็จ! ${createLinkedTask ? '(พร้อมสร้างงานติดตามในระบบ Tasks เรียบร้อย)' : ''}` 
            : `Voice Report saved to Supabase! ${createLinkedTask ? '(Linked task created in database)' : ''}`
        );

        // Reset form
        setTranscript('');
        setTitle('');
        setSummary('');
        setEquipmentId('');
        setActionItems([]);
        setRecordDuration(0);

        // Refresh list
        await loadReports();

        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        alert('Failed to save to Supabase. Check console.');
      }
    } catch (e) {
      console.error('Save voice report error:', e);
      alert('Error saving voice report to database.');
    } finally {
      setSaving(false);
    }
  };

  // Delete from Supabase
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(language === 'TH' ? 'ต้องการลบรายงานเสียงนี้ออกจากฐานข้อมูลหรือไม่?' : 'Delete this voice report from Supabase?')) {
      return;
    }
    const ok = await SupabaseService.deleteVoiceReport(id);
    if (ok) {
      setReports(prev => prev.filter(r => r.id !== id));
      if (selectedReport?.id === id) setSelectedReport(null);
    }
  };

  // Add Action Item
  const handleAddActionItem = () => {
    if (newActionItem.trim()) {
      setActionItems([...actionItems, newActionItem.trim()]);
      setNewActionItem('');
    }
  };

  // Add Tag
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // Filtered reports
  const filteredReports = reports.filter(r => {
    const matchesSearch = !searchQuery || 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.equipmentId && r.equipmentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.siteLocation && r.siteLocation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || r.priority === selectedPriority;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'Critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'High': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Safety & HSE': return ShieldAlert;
      case 'Mechanical': return Wrench;
      case 'Electrical & SCADA': return Building;
      default: return FileText;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
            <Mic className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {language === 'TH' ? 'รายงานด้วยเสียง (Voice Report)' : 'Voice Report Module'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Supabase Connected
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {language === 'TH'
                ? 'บันทึกเสียงรายงานหน้างานภาคสนาม แปลงเป็นข้อความ และสร้างงานอัตโนมัติลงฐานข้อมูล Supabase'
                : 'Speech-to-text field reporting and automated database synchronization with Supabase.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadReports}
            className="flex items-center gap-2 text-gray-700 border-gray-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-ikm-orange' : ''}`} />
            {language === 'TH' ? 'รีเฟรชข้อมูล' : 'Sync Database'}
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold">{successMessage}</p>
        </div>
      )}

      {/* Main Grid: Voice Dictation Panel & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT / TOP: Voice Dictation & AI Extraction Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl bg-white space-y-5">
            
            {/* Recording Controls */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">
                  {language === 'TH' ? 'บันทึกเสียงหน้างาน (Live Dictation)' : 'Live Voice Dictation'}
                </span>
                {isRecording && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700 animate-pulse">
                    REC {formatSeconds(recordDuration)}
                  </span>
                )}
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setRecordingLanguage('th-TH')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    recordingLanguage === 'th-TH' ? 'bg-white text-ikm-orange shadow-xs' : 'text-gray-500'
                  }`}
                >
                  🇹🇭 ไทย
                </button>
                <button
                  type="button"
                  onClick={() => setRecordingLanguage('en-US')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    recordingLanguage === 'en-US' ? 'bg-white text-ikm-orange shadow-xs' : 'text-gray-500'
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            {/* Microphone Button & Visualizer */}
            <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-dashed border-gray-200">
              
              {/* Waveform Bars */}
              <div className="flex items-center gap-1.5 h-12 mb-4">
                {audioLevels.map((lvl, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 rounded-full transition-all duration-100 ${
                      isRecording ? 'bg-rose-500' : 'bg-gray-200'
                    }`}
                    style={{ height: isRecording ? `${lvl}%` : '20%' }}
                  />
                ))}
              </div>

              {/* Big Record Button */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                  isRecording 
                    ? 'bg-rose-600 text-white scale-105 shadow-rose-500/40 animate-pulse ring-4 ring-rose-200' 
                    : 'bg-ikm-orange text-white hover:bg-ikm-orange-dark shadow-ikm-orange/30 hover:scale-105'
                }`}
              >
                {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>

              <p className="text-xs font-semibold text-gray-500 mt-3">
                {isRecording 
                  ? (language === 'TH' ? 'กำลังรับฟังเสียงพูด... กดอีกครั้งเพื่อหยุด' : 'Listening... Click to stop recording')
                  : (language === 'TH' ? 'แตะปุ่มเพื่อเริ่มอัดเสียงพูด' : 'Click microphone to begin dictation')}
              </p>
            </div>

            {/* Quick Demo Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {language === 'TH' ? 'สถานการณ์จำลองหน้างาน (Field Presets):' : 'Quick Field Presets:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => loadPreset('gasLeak')}
                  className="px-2.5 py-2 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 transition-colors text-left flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">ท่อก๊าซรั่วซึม</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('turbine')}
                  className="px-2.5 py-2 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors text-left flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Turbine Vibration</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('scada')}
                  className="px-2.5 py-2 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 transition-colors text-left flex items-center gap-1.5"
                >
                  <Building className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">SCADA 22kV</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('safety')}
                  className="px-2.5 py-2 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-colors text-left flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Safety Walk</span>
                </button>
              </div>
            </div>

            {/* Spoken Transcript Area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {language === 'TH' ? 'ข้อความถอดเสียง (Voice Transcript)' : 'Voice Transcript'}
                </label>
                <span className="text-xs text-gray-400">
                  {transcript.length} {language === 'TH' ? 'ตัวอักษร' : 'chars'}
                </span>
              </div>
              <textarea
                rows={3}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={
                  language === 'TH'
                    ? 'ข้อความเสียงที่พูดจะแสดงที่นี่โดยอัตโนมัติ หรือสามารถพิมพ์เพิ่มเติมได้...'
                    : 'Spoken words appear here in real-time. You can also edit manually...'
                }
                className="w-full p-3 text-sm rounded-xl border border-gray-200 focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none bg-gray-50 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* AI Auto-Structure Trigger Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleAnalyzeWithAI}
                disabled={isAnalyzingAI || !transcript.trim()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-500/20 text-xs font-bold h-9 px-4 rounded-xl flex items-center gap-2"
              >
                <Sparkles className={`w-4 h-4 ${isAnalyzingAI ? 'animate-spin' : ''}`} />
                {isAnalyzingAI
                  ? (language === 'TH' ? 'กำลังวิเคราะห์ด้วย AI...' : 'AI Analyzing...')
                  : (language === 'TH' ? 'วิเคราะห์และจัดโครงสร้างด้วย AI (Gemini)' : 'Analyze with Gemini AI')}
              </Button>
            </div>

            {/* Structured Report Form Fields */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {language === 'TH' ? 'รายละเอียดรายงานที่จัดโครงสร้างแล้ว' : 'Structured Report Details'}
              </h3>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === 'TH' ? 'หัวข้อรายงาน' : 'Report Title'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ตรวจสอบรอยรั่วท่อก๊าซ Valve 4B"
                  className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none bg-white font-medium"
                />
              </div>

              {/* Grid: Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {language === 'TH' ? 'หมวดหมู่งาน' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none bg-white"
                  >
                    <option value="Safety & HSE">Safety & HSE</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical & SCADA">Electrical & SCADA</option>
                    <option value="Civil & Structural">Civil & Structural</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Emergency Maintenance">Emergency Maintenance</option>
                    <option value="Routine Observation">Routine Observation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {language === 'TH' ? 'ระดับความเร่งด่วน' : 'Priority'}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none bg-white font-medium"
                  >
                    <option value="Low">Low (ปกติ)</option>
                    <option value="Medium">Medium (ปานกลาง)</option>
                    <option value="High">High (สูง)</option>
                    <option value="Critical">Critical (วิกฤต/ด่วนที่สุด)</option>
                  </select>
                </div>
              </div>

              {/* Equipment ID & Site Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {language === 'TH' ? 'รหัสอุปกรณ์ (Equipment Tag)' : 'Equipment ID'}
                  </label>
                  <input
                    type="text"
                    value={equipmentId}
                    onChange={(e) => setEquipmentId(e.target.value)}
                    placeholder="e.g. VALVE-4B, PUMP-02"
                    className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {language === 'TH' ? 'สถานที่หน้างาน' : 'Site Location'}
                  </label>
                  <input
                    type="text"
                    value={siteLocation}
                    onChange={(e) => setSiteLocation(e.target.value)}
                    placeholder="e.g. Zone B - Compressor Yard"
                    className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none bg-white"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === 'TH' ? 'บทสรุปผู้บริหาร (Executive Summary)' : 'Summary'}
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Executive summary of the issue or inspection observation..."
                  className="w-full p-2.5 text-sm rounded-lg border border-gray-200 focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none bg-white"
                />
              </div>

              {/* Action Items */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  {language === 'TH' ? 'การดำเนินการถัดไป (Action Items)' : 'Action Items'}
                </label>
                <div className="space-y-1.5">
                  {actionItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 rounded-lg border border-gray-200/60">
                      <span className="flex items-center gap-2 text-gray-800">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActionItems(actionItems.filter((_, i) => i !== idx))}
                        className="text-gray-400 hover:text-red-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newActionItem}
                      onChange={(e) => setNewActionItem(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddActionItem())}
                      placeholder={language === 'TH' ? 'เพิ่มข้อกำหนดการทำงาน...' : 'Add an action item...'}
                      className="flex-1 h-8 px-2.5 text-xs rounded-lg border border-gray-200 focus:border-ikm-orange outline-none bg-white"
                    />
                    <Button type="button" size="sm" variant="outline" onClick={handleAddActionItem} className="h-8 px-3 text-xs">
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      {language === 'TH' ? 'เพิ่ม' : 'Add'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Supabase Task Link Toggle */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="createTaskCheck"
                  checked={createLinkedTask}
                  onChange={(e) => setCreateLinkedTask(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-ikm-orange focus:ring-ikm-orange accent-ikm-orange cursor-pointer"
                />
                <label htmlFor="createTaskCheck" className="text-xs text-amber-900 cursor-pointer">
                  <span className="font-bold block">
                    {language === 'TH' ? 'สร้างงานติดตามอัตโนมัติในตาราง Tasks (Supabase)' : 'Auto-create linked Task in Supabase Database'}
                  </span>
                  <span className="text-amber-700/80">
                    {language === 'TH'
                      ? 'เมื่อบันทึก ระบบจะสร้าง Task มอบหมายให้ทีมวิศวกรเข้าตรวจสอบหน้างานทันที'
                      : 'Automatically spawn a live work task in the Supabase tasks table for site personnel.'}
                  </span>
                </label>
              </div>

              {/* Submit Action */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTranscript('');
                    setTitle('');
                    setSummary('');
                    setActionItems([]);
                  }}
                  className="text-xs h-10 px-4"
                >
                  {language === 'TH' ? 'ล้างฟอร์ม' : 'Clear Form'}
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveToSupabase}
                  disabled={saving || (!title.trim() && !transcript.trim())}
                  className="bg-ikm-orange hover:bg-ikm-orange-dark text-white font-bold text-xs h-10 px-6 rounded-xl shadow-md shadow-ikm-orange/20 flex items-center gap-2"
                >
                  <Database className={`w-4 h-4 ${saving ? 'animate-pulse' : ''}`} />
                  {saving
                    ? (language === 'TH' ? 'กำลังบันทึกลง Supabase...' : 'Saving to Database...')
                    : (language === 'TH' ? 'บันทึกลงฐานข้อมูล Supabase' : 'Save to Supabase Database')}
                </Button>
              </div>

            </div>

          </Card>
        </div>

        {/* RIGHT: Voice Reports Archive & Database Log (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 border border-gray-100 shadow-sm rounded-2xl bg-white space-y-4">
            
            {/* Header & Stats */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {language === 'TH' ? 'คลังรายงานเสียง (Supabase Logs)' : 'Voice Logs Archive'}
                </h2>
                <p className="text-xs text-gray-500">
                  {reports.length} {language === 'TH' ? 'รายการที่บันทึกในระบบ' : 'records stored in database'}
                </p>
              </div>
              <span className="px-2 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-700">
                Live Audit
              </span>
            </div>

            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'TH' ? 'ค้นหารายงาน, อุปกรณ์, หรือข้อความ...' : 'Search reports, equipment, tags...'}
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-ikm-orange outline-none"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 h-8 px-2 text-xs rounded-lg border border-gray-200 bg-gray-50 text-gray-700 outline-none"
                >
                  <option value="all">{language === 'TH' ? 'ทุกหมวดหมู่' : 'All Categories'}</option>
                  <option value="Safety & HSE">Safety & HSE</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical & SCADA">Electrical & SCADA</option>
                  <option value="Inspection">Inspection</option>
                </select>

                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="flex-1 h-8 px-2 text-xs rounded-lg border border-gray-200 bg-gray-50 text-gray-700 outline-none"
                >
                  <option value="all">{language === 'TH' ? 'ทุกระดับความเร่งด่วน' : 'All Priorities'}</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {loading ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-ikm-orange" />
                  {language === 'TH' ? 'กำลังโหลดข้อมูลจาก Supabase...' : 'Loading from Supabase...'}
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                  <Mic className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  {language === 'TH' ? 'ยังไม่มีรายงานเสียงที่ตรงกับเงื่อนไข' : 'No matching voice reports found'}
                </div>
              ) : (
                filteredReports.map((rep) => {
                  const CategoryIcon = getCategoryIcon(rep.category);
                  const isSelected = selectedReport?.id === rep.id;

                  return (
                    <div
                      key={rep.id}
                      onClick={() => setSelectedReport(rep)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-ikm-orange bg-orange-50/40 shadow-xs' 
                          : 'border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-md bg-gray-100 text-gray-600">
                            <CategoryIcon className="w-3.5 h-3.5" />
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(rep.priority)}`}>
                            {rep.priority}
                          </span>
                          {rep.equipmentId && rep.equipmentId !== 'N/A' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                              {rep.equipmentId}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDelete(rep.id, e)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                          title="Delete from Supabase"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-gray-900 line-clamp-1 mb-1">
                        {rep.title}
                      </h4>

                      <p className="text-[11px] text-gray-500 line-clamp-2 mb-2">
                        {rep.summary || rep.transcript}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-100">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(rep.createdAt).toLocaleDateString()} {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="font-medium text-gray-600">
                          {rep.createdBy}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </Card>
        </div>

      </div>

      {/* Selected Report Full Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-5 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getPriorityBadge(selectedReport.priority)}`}>
                    {selectedReport.priority}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    {selectedReport.category}
                  </span>
                  {selectedReport.equipmentId && selectedReport.equipmentId !== 'N/A' && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-ikm-orange-light text-ikm-orange">
                      {selectedReport.equipmentId}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedReport.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Audio & Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-gray-50 rounded-xl text-xs">
              <div>
                <span className="text-gray-400 block">{language === 'TH' ? 'สถานที่' : 'Location'}</span>
                <span className="font-semibold text-gray-800">{selectedReport.siteLocation || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 block">{language === 'TH' ? 'ผู้รายงาน' : 'Reporter'}</span>
                <span className="font-semibold text-gray-800">{selectedReport.createdBy}</span>
              </div>
              <div>
                <span className="text-gray-400 block">{language === 'TH' ? 'ความยาวเสียง' : 'Duration'}</span>
                <span className="font-semibold text-gray-800">{formatSeconds(selectedReport.durationSeconds || 10)}</span>
              </div>
              <div>
                <span className="text-gray-400 block">{language === 'TH' ? 'วันที่บันทึก' : 'Created At'}</span>
                <span className="font-semibold text-gray-800">{new Date(selectedReport.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Voice Transcript */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {language === 'TH' ? 'ถอดความเสียงต้นฉบับ (Original Spoken Words)' : 'Spoken Voice Transcript'}
              </h4>
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 leading-relaxed font-sans">
                "{selectedReport.transcript || selectedReport.summary}"
              </div>
            </div>

            {/* Summary */}
            {selectedReport.summary && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {language === 'TH' ? 'บทสรุปผู้บริหาร (AI Executive Summary)' : 'Executive Summary'}
                </h4>
                <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-sm text-indigo-950 font-medium">
                  {selectedReport.summary}
                </div>
              </div>
            )}

            {/* Action Items */}
            {selectedReport.actionItems && selectedReport.actionItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {language === 'TH' ? 'ข้อกำหนดการปฏิบัติงาน (Action Items)' : 'Action Items'}
                </h4>
                <div className="space-y-1.5">
                  {selectedReport.actionItems.map((act, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs bg-white p-2.5 rounded-lg border border-gray-200 text-gray-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {selectedReport.tags && selectedReport.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedReport.tags.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(selectedReport, null, 2))}`;
                  const dl = document.createElement('a');
                  dl.setAttribute('href', jsonStr);
                  dl.setAttribute('download', `VoiceReport_${selectedReport.id.slice(0, 8)}.json`);
                  dl.click();
                }}
                className="text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                {language === 'TH' ? 'ดาวน์โหลด JSON' : 'Export JSON'}
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReport(null)}
                  className="text-xs"
                >
                  {language === 'TH' ? 'ปิด' : 'Close'}
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
