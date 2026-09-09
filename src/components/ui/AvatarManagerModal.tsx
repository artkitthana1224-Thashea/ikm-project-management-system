import React, { useState, useRef } from 'react';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { 
  Upload, Trash2, Link as LinkIcon, Sparkles, 
  Check, X, Image as ImageIcon, Camera, RefreshCw 
} from 'lucide-react';
import { useStore } from '../../store/useStore';

interface AvatarManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  name: string;
  avatarColor?: string;
  onSave: (newAvatarUrl: string | undefined) => Promise<void> | void;
  title?: string;
}

const PRESET_AVATARS = [
  { id: 'eng-1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', label: 'Engineer 1' },
  { id: 'eng-2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', label: 'Engineer 2' },
  { id: 'eng-3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', label: 'Technician 1' },
  { id: 'eng-4', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', label: 'Safety Officer' },
  { id: 'eng-5', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80', label: 'Site Manager' },
  { id: 'eng-6', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80', label: 'Supervisor' },
  { id: 'eng-7', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', label: 'Inspector' },
  { id: 'eng-8', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80', label: 'Operations' },
];

export function AvatarManagerModal({
  isOpen,
  onClose,
  currentAvatar,
  name,
  avatarColor = '#F58220',
  onSave,
  title,
}: AvatarManagerModalProps) {
  const { language } = useStore();
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentAvatar);
  const [customUrl, setCustomUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset preview when opened with new avatar
  React.useEffect(() => {
    setPreviewUrl(currentAvatar);
    setCustomUrl('');
  }, [currentAvatar, isOpen]);

  if (!isOpen) return null;

  const t = {
    EN: {
      modalTitle: title || 'Manage Employee Avatar',
      subtitle: `Update, upload, or remove profile photo for ${name}`,
      preview: 'Avatar Preview',
      uploadTab: 'Upload File',
      urlTab: 'Image URL',
      presetsTab: 'Presets',
      dropzoneText: 'Drag & drop image here or click to browse',
      dropzoneSub: 'Supports JPG, PNG, WebP (Auto-optimized)',
      removePhoto: 'Remove / Delete Photo',
      removeConfirm: 'Photo will be deleted, falling back to monogram badge',
      urlPlaceholder: 'https://example.com/photo.jpg',
      applyUrl: 'Apply URL',
      save: 'Save to Supabase',
      saving: 'Saving...',
      cancel: 'Cancel',
      selectPreset: 'Select a preset portrait:',
    },
    TH: {
      modalTitle: title || 'จัดการรูปโปรไฟล์ / อวตารพนักงาน',
      subtitle: `อัปโหลด เปลี่ยน หรือลบรูปภาพพนักงานสำหรับ ${name}`,
      preview: 'ตัวอย่างรูปภาพ',
      uploadTab: 'อัปโหลดไฟล์รูปภาพ',
      urlTab: 'ใส่ลิงก์ URL',
      presetsTab: 'รูปภาพตัวอย่าง',
      dropzoneText: 'ลากและวางไฟล์รูปภาพที่นี่ หรือคลิกเพื่อเลือกไฟล์',
      dropzoneSub: 'รองรับไฟล์ JPG, PNG, WebP (ปรับขนาดอัตโนมัติ)',
      removePhoto: 'ลบรูปภาพ (ใช้ตัวย่อชื่อ)',
      removeConfirm: 'ระบบจะลบรูปและใช้ป้ายชื่อย่อแทน',
      urlPlaceholder: 'https://example.com/photo.jpg',
      applyUrl: 'ใช้งานลิงก์นี้',
      save: 'บันทึกลง Supabase',
      saving: 'กำลังบันทึก...',
      cancel: 'ยกเลิก',
      selectPreset: 'เลือกรูปโปรไฟล์สำเร็จรูป:',
    },
  }[language];

  // Process file to compressed Base64 Data URL
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(language === 'TH' ? 'กรุณาเลือกไฟล์รูปภาพเท่านั้น' : 'Please select an image file only.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Resize image to max 256x256 for fast loading & storage
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPreviewUrl(compressedDataUrl);
        } else {
          setPreviewUrl(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      setPreviewUrl(customUrl.trim());
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(undefined);
    setCustomUrl('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(previewUrl);
      onClose();
    } catch (err) {
      console.error('Error saving avatar:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-ikm-card rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 dark:border-ikm-border overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-ikm-border flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-ikm-text flex items-center gap-2">
              <Camera className="w-5 h-5 text-ikm-orange" />
              <span>{t.modalTitle}</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-ikm-text-secondary mt-0.5">
              {t.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          
          {/* Live Preview Bar */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-ikm-bg border border-gray-200/70 dark:border-ikm-border">
            <div className="relative">
              <Avatar
                src={previewUrl}
                fallback={name ? name.charAt(0) : 'U'}
                backgroundColor={avatarColor}
                className="w-16 h-16 text-lg ring-4 ring-white dark:ring-ikm-card shadow-md"
              />
              {previewUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute -bottom-1 -right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-sm"
                  title={t.removePhoto}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-gray-900 dark:text-ikm-text truncate">{name}</h4>
                {previewUrl ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    Photo Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-700">
                    Monogram Badge
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-ikm-text-secondary mt-0.5 truncate">
                {previewUrl ? 'Custom photo attached' : 'Default colored initial will be shown'}
              </p>
            </div>

            {previewUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemovePhoto}
                className="text-xs text-red-600 border-red-200 hover:bg-red-50 h-8 px-2.5"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                {language === 'TH' ? 'ลบรูป' : 'Remove'}
              </Button>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 dark:border-ikm-border">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'border-ikm-orange text-ikm-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              {t.uploadTab}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'url'
                  ? 'border-ikm-orange text-ikm-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              {t.urlTab}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'presets'
                  ? 'border-ikm-orange text-ikm-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t.presetsTab}
            </button>
          </div>

          {/* Tab 1: Upload File */}
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-ikm-orange bg-orange-50/50'
                  : 'border-gray-200 dark:border-ikm-border hover:border-ikm-orange hover:bg-gray-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-orange-100 text-ikm-orange flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-gray-800 dark:text-ikm-text mt-1">
                {t.dropzoneText}
              </p>
              <p className="text-[11px] text-gray-400">
                {t.dropzoneSub}
              </p>
            </div>
          )}

          {/* Tab 2: URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700 dark:text-ikm-text">
                {language === 'TH' ? 'ระบุ URL รูปภาพ (Image Link):' : 'Enter Image URL:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder={t.urlPlaceholder}
                  className="flex-1 h-10 px-3 text-xs rounded-xl border border-gray-200 dark:border-ikm-border bg-gray-50 dark:bg-ikm-bg outline-none focus:border-ikm-orange"
                />
                <Button
                  type="button"
                  onClick={handleApplyUrl}
                  disabled={!customUrl.trim()}
                  className="h-10 text-xs px-4 bg-gray-800 hover:bg-gray-900 text-white"
                >
                  {t.applyUrl}
                </Button>
              </div>
            </div>
          )}

          {/* Tab 3: Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-ikm-text mb-2">
                {t.selectPreset}
              </label>
              <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = previewUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setPreviewUrl(preset.url)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all p-0.5 ${
                        isSelected 
                          ? 'border-ikm-orange ring-2 ring-orange-200 scale-95 shadow-sm' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-ikm-orange/30 flex items-center justify-center text-white">
                          <Check className="w-5 h-5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 dark:bg-ikm-bg border-t border-gray-100 dark:border-ikm-border flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs h-9"
          >
            {t.cancel}
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-ikm-orange hover:bg-ikm-orange-dark text-white font-bold text-xs h-9 px-5 rounded-xl shadow-md flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{t.saving}</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t.save}</span>
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
