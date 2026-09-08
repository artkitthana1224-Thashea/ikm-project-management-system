import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { 
  Search, Send, Phone, Video, MoreVertical, Image as ImageIcon, 
  Paperclip, Users, Plus, X, UserCheck, Shield, CheckCircle2,
  Clock, Circle, UserPlus, Trash2, ArrowLeft
} from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

const dictionary = {
  EN: {
    messages: "Messages",
    searchPlaceholder: "Search messages...",
    all: "All",
    online: "Online",
    groups: "Groups",
    typeMessage: "Type a message...",
    createGroup: "Create Group",
    groupName: "Group Name",
    selectMembers: "Select Members",
    cancel: "Cancel",
    create: "Create",
    onlineStatus: "Online",
    offlineStatus: "Offline",
    manageGroup: "Manage Members",
    addMembers: "Invite / Add Members",
    currentMembers: "Current Members",
    remove: "Remove",
    back: "Back",
    save: "Save & Add",
    approveMembers: "Group Members & Roles",
    myPresence: "My Status:",
    available: "Available / Online",
    busy: "Busy / In Meeting",
    away: "Away",
    offline: "Offline",
  },
  TH: {
    messages: "ข้อความและการสื่อสาร",
    searchPlaceholder: "ค้นหาการสนทนา...",
    all: "ทั้งหมด",
    online: "ออนไลน์",
    groups: "กลุ่ม",
    typeMessage: "พิมพ์ข้อความ...",
    createGroup: "สร้างกลุ่มสนทนาใหม่",
    groupName: "ชื่อกลุ่ม",
    selectMembers: "เลือกสมาชิก",
    cancel: "ยกเลิก",
    create: "สร้างกลุ่ม",
    onlineStatus: "ออนไลน์",
    offlineStatus: "ออฟไลน์",
    manageGroup: "จัดการสมาชิก",
    addMembers: "เชิญ / เพิ่มสมาชิก",
    currentMembers: "สมาชิกปัจจุบัน",
    remove: "นำออก",
    back: "ย้อนกลับ",
    save: "บันทึกและเพิ่ม",
    approveMembers: "สมาชิกกลุ่มและสิทธิ์",
    myPresence: "สถานะของฉัน:",
    available: "พร้อมทำงาน / ออนไลน์",
    busy: "ติดประชุม / ไม่ว่าง",
    away: "ไม่อยู่ชั่วคราว",
    offline: "ออฟไลน์",
  }
};

interface ChatContact {
  id: string;
  name: string;
  role: string;
  isGroup: boolean;
  online: boolean;
  unread: number;
  avatar: string;
  members?: string[];
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface PresenceData {
  status: 'online' | 'busy' | 'away' | 'offline';
  lastActive: string;
}

export function Chat() {
  const { user, language, employees } = useStore();
  const t = (key: keyof typeof dictionary.EN) => dictionary[language][key];

  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'groups'>('all');
  const [messageText, setMessageText] = useState('');
  const [search, setSearch] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  const [showManageGroup, setShowManageGroup] = useState(false);
  const [manageGroupMode, setManageGroupMode] = useState<'view' | 'add'>('view');
  const [pendingNewMembers, setPendingNewMembers] = useState<string[]>([]);
  const [groupMembersList, setGroupMembersList] = useState<any[]>([]);
  
  const [chats, setChats] = useState<ChatContact[]>([]);
  const [activeChat, setActiveChat] = useState<ChatContact | null>(null);
  const [messagesList, setMessagesList] = useState<Message[]>([]);
  const [showMobileChatList, setShowMobileChatList] = useState(true);

  // Presence state
  const [presenceMap, setPresenceMap] = useState<Record<string, PresenceData>>({});
  const [myPresenceStatus, setMyPresenceStatus] = useState<'online' | 'busy' | 'away' | 'offline'>('online');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch presence from backend and poll
  const fetchPresence = async () => {
    try {
      const res = await fetch('/api/presence');
      if (res.ok) {
        const data = await res.json();
        setPresenceMap(data);
      }
    } catch (e) {
      console.error('Error fetching presence:', e);
    }
  };

  const updateMyPresence = async (status: 'online' | 'busy' | 'away' | 'offline') => {
    if (!user) return;
    setMyPresenceStatus(status);
    try {
      await fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, status })
      });
      fetchPresence();
    } catch (e) {
      console.error('Error updating presence:', e);
    }
  };

  // Fetch group members from backend
  const fetchGroupMembers = async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}/members`);
      if (res.ok) {
        const data = await res.json();
        setGroupMembersList(data);
        return data;
      }
    } catch (e) {
      console.error('Error fetching group members:', e);
    }
    return [];
  };

  // Initialize Chats
  useEffect(() => {
    const initializeChats = async () => {
      // Basic employee direct chats
      const empChats: ChatContact[] = employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        role: emp.role,
        isGroup: false,
        online: emp.availability === 'available',
        unread: 0,
        avatar: `https://i.pravatar.cc/150?u=${emp.id.toLowerCase()}`
      }));
      
      const groupChats: ChatContact[] = [
        { id: '11111111-1111-1111-1111-111111111111', name: 'Engineering & Field Ops', role: 'Group Chat', isGroup: true, online: false, unread: 0, avatar: 'https://i.pravatar.cc/150?u=team', members: ['E-001', 'E-003', 'E-007'] },
        { id: '22222222-2222-2222-2222-222222222222', name: 'Site Managers & QMS', role: 'Group Chat', isGroup: true, online: false, unread: 0, avatar: 'https://i.pravatar.cc/150?u=managers', members: ['E-001', 'E-002'] }
      ];

      const allChats = [...groupChats, ...empChats];

      try {
        // Register groups and initial members in backend
        await Promise.all(allChats.map(c => 
          fetch('/api/chats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id: c.id, 
              name: c.name, 
              isGroup: c.isGroup,
              members: c.members || []
            })
          })
        ));
      } catch (err) {
        console.error("Failed to sync chats with backend:", err);
      }

      setChats(allChats);
      if (allChats.length > 0) setActiveChat(allChats[0]);
    };

    initializeChats();
    fetchPresence();
    const presenceInterval = setInterval(fetchPresence, 10000);
    return () => clearInterval(presenceInterval);
  }, [employees]);

  // Load active chat messages & members
  useEffect(() => {
    if (!activeChat) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${activeChat.id}`);
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        setMessagesList(data);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch (e) {
        console.error("Failed to load messages", e);
      }
    };
    fetchMessages();
    if (activeChat.isGroup) {
      fetchGroupMembers(activeChat.id);
    }
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeChat]);

  // Helper to determine contact presence status
  const getContactPresence = (contactId: string) => {
    const presence = presenceMap[contactId];
    if (presence) return presence.status;
    const emp = employees.find(e => e.id === contactId);
    if (emp?.availability === 'available') return 'online';
    if (emp?.availability === 'busy') return 'busy';
    return 'offline';
  };

  const onlineCount = chats.filter(c => !c.isGroup && getContactPresence(c.id) === 'online').length;
  const groupCount = chats.filter(c => c.isGroup).length;

  let filteredChats = chats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  if (activeTab === 'online') {
    filteredChats = filteredChats.filter(c => !c.isGroup && (getContactPresence(c.id) === 'online' || getContactPresence(c.id) === 'busy'));
  } else if (activeTab === 'groups') {
    filteredChats = filteredChats.filter(c => c.isGroup);
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeChat || !user) return;
    const tempText = messageText;
    setMessageText('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: activeChat.id,
          senderId: user.id,
          content: tempText
        })
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessagesList(prev => [...prev, newMsg]);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (e) {
      console.error(e);
      setMessageText(tempText);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedMembers.length === 0) return;
    
    const newId = crypto.randomUUID();
    const allMembers = Array.from(new Set([...selectedMembers, user?.id || 'E-001']));
    
    const newGroup: ChatContact = {
      id: newId,
      name: newGroupName,
      role: 'Group Chat',
      isGroup: true,
      online: false,
      unread: 0,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newGroupName)}&background=random`,
      members: allMembers
    };
    
    try {
      await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: newGroup.id, 
          name: newGroup.name, 
          isGroup: newGroup.isGroup,
          members: allMembers
        })
      });
      setChats([newGroup, ...chats]);
      setActiveChat(newGroup);
    } catch (e) {
      console.error(e);
    }
    
    setShowCreateGroup(false);
    setNewGroupName('');
    setSelectedMembers([]);
    setShowMobileChatList(false);
  };

  const toggleMember = (id: string) => {
    if (selectedMembers.includes(id)) setSelectedMembers(selectedMembers.filter(m => m !== id));
    else setSelectedMembers([...selectedMembers, id]);
  };

  const handleAddMembersToGroup = async () => {
    if (!activeChat || pendingNewMembers.length === 0) return;
    try {
      await Promise.all(
        pendingNewMembers.map(userId => 
          fetch(`/api/chats/${activeChat.id}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, role: 'member' })
          })
        )
      );

      const updatedMembers = Array.from(new Set([...(activeChat.members || []), ...pendingNewMembers]));
      const updatedChat = { ...activeChat, members: updatedMembers };
      setChats(chats.map(c => c.id === updatedChat.id ? updatedChat : c));
      setActiveChat(updatedChat);
      fetchGroupMembers(activeChat.id);
      setManageGroupMode('view');
      setPendingNewMembers([]);
    } catch (e) {
      console.error('Failed to add members:', e);
    }
  };

  const handleRemoveMemberFromGroup = async (userId: string) => {
    if (!activeChat) return;
    try {
      await fetch(`/api/chats/${activeChat.id}/members/${userId}`, {
        method: 'DELETE'
      });
      const updatedMembers = (activeChat.members || []).filter(m => m !== userId);
      const updatedChat = { ...activeChat, members: updatedMembers };
      setChats(chats.map(c => c.id === updatedChat.id ? updatedChat : c));
      setActiveChat(updatedChat);
      setGroupMembersList(prev => prev.filter(m => m.userId !== userId));
    } catch (e) {
      console.error('Failed to remove member:', e);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] flex animate-in fade-in duration-300 bg-ikm-bg relative overflow-hidden">
      
      {/* Sidebar - Contacts & Presence */}
      <div className={cn(
        "w-full md:w-84 border-r border-ikm-border bg-ikm-card flex flex-col shrink-0 absolute md:relative z-20 h-full transition-transform duration-300",
        showMobileChatList ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-4 border-b border-ikm-border flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-ikm-text">{t('messages')}</h2>
              <span className="text-[11px] text-ikm-text-secondary">
                {onlineCount} {language === 'TH' ? 'คนออนไลน์' : 'people online'}
              </span>
            </div>
            
            <button 
              onClick={() => setShowCreateGroup(true)}
              className="p-2 bg-ikm-orange text-white hover:bg-ikm-orange-dark rounded-xl transition-all shadow-xs flex items-center gap-1 text-xs font-semibold"
              title={t('createGroup')}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'TH' ? 'สร้างกลุ่ม' : 'New Group'}</span>
            </button>
          </div>

          {/* User's Presence Status Selector */}
          <div className="bg-ikm-bg p-2 rounded-xl border border-ikm-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Avatar src={user?.avatar || "https://i.pravatar.cc/150?u=user"} fallback="Me" className="w-7 h-7 ring-1 ring-ikm-border" />
                <span className={cn(
                  "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-ikm-card",
                  myPresenceStatus === 'online' && "bg-emerald-500 ring-1 ring-emerald-400 animate-pulse",
                  myPresenceStatus === 'busy' && "bg-rose-500",
                  myPresenceStatus === 'away' && "bg-amber-500",
                  myPresenceStatus === 'offline' && "bg-slate-400"
                )} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-ikm-text-secondary font-bold uppercase tracking-wider">{t('myPresence')}</span>
                <span className="font-semibold text-ikm-text text-[11px]">
                  {myPresenceStatus === 'online' ? t('available') : 
                   myPresenceStatus === 'busy' ? t('busy') :
                   myPresenceStatus === 'away' ? t('away') : t('offline')}
                </span>
              </div>
            </div>

            <select 
              value={myPresenceStatus}
              onChange={(e) => updateMyPresence(e.target.value as any)}
              className="text-[11px] py-1 px-2 rounded-lg border border-ikm-border bg-ikm-card text-ikm-text focus:outline-none focus:border-ikm-orange font-medium"
            >
              <option value="online">🟢 {language === 'TH' ? 'ออนไลน์' : 'Online'}</option>
              <option value="busy">🔴 {language === 'TH' ? 'ติดประชุม' : 'Busy'}</option>
              <option value="away">🟡 {language === 'TH' ? 'ไม่อยู่' : 'Away'}</option>
              <option value="offline">⚪ {language === 'TH' ? 'ออฟไลน์' : 'Offline'}</option>
            </select>
          </div>
          
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ikm-text-secondary" />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-ikm-bg border border-ikm-border text-xs md:text-sm focus:outline-none focus:border-ikm-orange"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 bg-ikm-bg p-1 rounded-xl border border-ikm-border">
             <button 
               className={cn("flex-1 text-xs font-semibold py-1.5 rounded-lg transition-colors", activeTab === 'all' ? "bg-ikm-card shadow-xs text-ikm-text font-bold" : "text-ikm-text-secondary hover:text-ikm-text")}
               onClick={() => setActiveTab('all')}
             >{t('all')}</button>
             <button 
               className={cn("flex-1 text-xs font-semibold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1", activeTab === 'online' ? "bg-ikm-card shadow-xs text-ikm-text font-bold" : "text-ikm-text-secondary hover:text-ikm-text")}
               onClick={() => setActiveTab('online')}
             >
               <span>{t('online')}</span>
               <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                 {onlineCount}
               </span>
             </button>
             <button 
               className={cn("flex-1 text-xs font-semibold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1", activeTab === 'groups' ? "bg-ikm-card shadow-xs text-ikm-text font-bold" : "text-ikm-text-secondary hover:text-ikm-text")}
               onClick={() => setActiveTab('groups')}
             >
               <span>{t('groups')}</span>
               <span className="bg-ikm-orange-light text-ikm-orange-dark text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                 {groupCount}
               </span>
             </button>
          </div>
        </div>
        
        {/* Contact list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredChats.map((contact) => {
            const presence = getContactPresence(contact.id);
            const isOnline = presence === 'online';
            const isBusy = presence === 'busy';
            const isAway = presence === 'away';

            return (
              <div 
                key={contact.id} 
                onClick={() => {
                  setActiveChat(contact);
                  setShowMobileChatList(false);
                }}
                className={cn(
                  "flex items-center gap-3 p-3.5 border-b border-ikm-border cursor-pointer transition-colors hover:bg-ikm-bg",
                  activeChat?.id === contact.id && "bg-ikm-orange-light/30 border-l-4 border-l-ikm-orange"
                )}
              >
                <div className="relative shrink-0">
                  <Avatar src={contact.avatar} fallback={contact.name.charAt(0)} className="h-11 w-11 ring-1 ring-ikm-border" />
                  
                  {contact.isGroup ? (
                     <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-ikm-orange border-2 border-ikm-card flex items-center justify-center" title="Group Chat">
                       <Users className="h-2.5 w-2.5 text-white" />
                     </span>
                  ) : (
                    <span 
                      className={cn(
                        "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-ikm-card",
                        isOnline && "bg-emerald-500 shadow-xs",
                        isBusy && "bg-rose-500",
                        isAway && "bg-amber-500",
                        !isOnline && !isBusy && !isAway && "bg-slate-400"
                      )} 
                      title={presence.toUpperCase()}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-ikm-text text-sm truncate">{contact.name}</h4>
                    {contact.isGroup && (
                      <span className="text-[10px] text-ikm-orange bg-ikm-orange-light px-1.5 py-0.5 rounded font-bold shrink-0">
                        {contact.members?.length || 0} {language === 'TH' ? 'คน' : 'members'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-xs text-ikm-text-secondary truncate">{contact.role}</p>
                    {!contact.isGroup && (
                      <span className={cn(
                        "text-[10px] px-1 py-0.2 rounded font-medium",
                        isOnline && "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
                        isBusy && "text-rose-600 bg-rose-50 dark:bg-rose-950/40",
                        isAway && "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
                        !isOnline && !isBusy && !isAway && "text-slate-500"
                      )}>
                        • {presence}
                      </span>
                    )}
                  </div>
                </div>

                {contact.unread > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-ikm-orange px-1.5 text-[10px] font-bold text-white">
                    {contact.unread}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChat ? (
      <div className="flex-1 flex flex-col bg-ikm-bg relative h-full w-full">
        {/* Chat Header */}
        <div className="h-16 border-b border-ikm-border bg-ikm-card px-4 md:px-6 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 text-ikm-text-secondary hover:text-ikm-text"
              onClick={() => setShowMobileChatList(true)}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative">
              <Avatar src={activeChat.avatar} fallback={activeChat.name.charAt(0)} className="h-10 w-10 ring-1 ring-ikm-border" />
              {activeChat.isGroup ? (
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-ikm-orange border-2 border-ikm-card flex items-center justify-center">
                  <Users className="h-2 w-2 text-white" />
                </span>
              ) : (
                <span className={cn(
                  "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-ikm-card",
                  getContactPresence(activeChat.id) === 'online' && "bg-emerald-500",
                  getContactPresence(activeChat.id) === 'busy' && "bg-rose-500",
                  getContactPresence(activeChat.id) === 'away' && "bg-amber-500",
                  getContactPresence(activeChat.id) === 'offline' && "bg-slate-400"
                )} />
              )}
            </div>
            <div>
              <h3 className="font-bold text-ikm-text leading-tight text-sm md:text-base flex items-center gap-2">
                <span>{activeChat.name}</span>
                {activeChat.isGroup && (
                  <span className="text-xs font-normal text-ikm-orange bg-ikm-orange-light px-2 py-0.5 rounded-full border border-ikm-orange/30">
                    Group
                  </span>
                )}
              </h3>
              <p className="text-xs text-ikm-text-secondary flex items-center gap-1.5">
                {activeChat.isGroup ? (
                  <span>{activeChat.members?.length || groupMembersList.length || 0} {language === 'TH' ? 'สมาชิกในกลุ่ม' : 'members in room'}</span>
                ) : (
                  <span className="capitalize">{getContactPresence(activeChat.id)}</span>
                )}
              </p>
            </div>
          </div>

          {/* Chat Header Actions */}
          <div className="flex items-center gap-2 text-ikm-text-secondary">
            {!activeChat.isGroup && (
              <button 
                onClick={() => alert(`Calling ${activeChat.name}...`)}
                className="p-2 hover:bg-ikm-bg rounded-lg transition-colors"
                title="Voice Call"
              >
                <Phone className="h-4 w-4" />
              </button>
            )}
            {!activeChat.isGroup && (
              <button 
                onClick={() => alert(`Starting video meeting with ${activeChat.name}...`)}
                className="p-2 hover:bg-ikm-bg rounded-lg transition-colors hidden sm:block"
                title="Video Call"
              >
                <Video className="h-4 w-4" />
              </button>
            )}
            {activeChat.isGroup && (
              <button 
                className="px-3 py-1.5 bg-ikm-bg hover:bg-ikm-orange-light text-ikm-text hover:text-ikm-orange-dark border border-ikm-border rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-xs"
                onClick={() => {
                  fetchGroupMembers(activeChat.id);
                  setShowManageGroup(true);
                  setManageGroupMode('view');
                  setPendingNewMembers([]);
                }}
                title={t('manageGroup')}
              >
                <Users className="h-4 w-4 text-ikm-orange" />
                <span>{language === 'TH' ? 'จัดการสมาชิก' : 'Manage Members'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 flex flex-col custom-scrollbar">
          {messagesList.length === 0 ? (
            <div className="m-auto text-center space-y-2 py-12">
              <div className="w-12 h-12 rounded-full bg-ikm-orange-light text-ikm-orange mx-auto flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-ikm-text text-sm">
                {language === 'TH' ? 'ยังไม่มีข้อความในการสนทนานี้' : 'No messages in this chat yet.'}
              </h4>
              <p className="text-xs text-ikm-text-secondary max-w-xs mx-auto">
                {language === 'TH' ? 'พิมพ์ข้อความด้านล่างเพื่อเริ่มการสนทนาและประสานงาน' : 'Type a message below to start collaborating with the team.'}
              </p>
            </div>
          ) : (
            messagesList.map((msg) => {
              const isMe = msg.senderId === user?.id;
              const sender = employees.find(e => e.id === msg.senderId) || user;
              const timeString = msg.createdAt ? format(new Date(msg.createdAt), 'hh:mm a') : '';

              return (
                <div key={msg.id} className={cn("flex gap-3 max-w-[85%] md:max-w-[70%]", isMe ? "ml-auto justify-end" : "")}>
                  {!isMe && (
                    <Avatar 
                      src={`https://i.pravatar.cc/150?u=${msg.senderId}`} 
                      fallback={sender?.name?.charAt(0) || '?'} 
                      className="h-8 w-8 shrink-0 mt-1 ring-1 ring-ikm-border" 
                    />
                  )}
                  <div>
                    <div className={cn(
                      "rounded-2xl p-3 shadow-xs", 
                      isMe ? "bg-ikm-orange text-white rounded-tr-none" : "bg-ikm-card border border-ikm-border rounded-tl-none text-ikm-text"
                    )}>
                      {activeChat.isGroup && !isMe && (
                        <div className="text-xs font-bold text-ikm-orange mb-1 flex items-center gap-1">
                          <span>{sender?.name || msg.senderId}</span>
                        </div>
                      )}
                      <p className={cn("text-sm whitespace-pre-wrap leading-relaxed", isMe ? "text-white" : "text-ikm-text")}>
                        {msg.content}
                      </p>
                    </div>
                    <span className={cn("text-[10px] text-ikm-text-secondary mt-1 block font-medium", isMe ? "mr-1 text-right" : "ml-1")}>
                      {timeString}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-ikm-card border-t border-ikm-border">
          <div className="flex items-end gap-2 bg-ikm-bg p-2 rounded-xl border border-ikm-border focus-within:border-ikm-orange focus-within:ring-1 focus-within:ring-ikm-orange transition-all">
            <button 
              onClick={() => alert('Attachment upload ready')}
              className="p-2 text-ikm-text-secondary hover:text-ikm-orange transition-colors shrink-0"
              title="Attach File"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={t('typeMessage')}
              className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-32 min-h-[40px] text-sm py-2 outline-none text-ikm-text"
              rows={1}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              className="h-10 w-10 bg-ikm-orange hover:bg-ikm-orange-dark disabled:opacity-50 text-white rounded-lg flex items-center justify-center shrink-0 transition-all shadow-sm active:scale-95"
            >
              <Send className="h-5 w-5 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center text-ikm-text-secondary">
          <Users className="w-16 h-16 text-ikm-border mb-3" />
          <h3 className="font-bold text-ikm-text text-lg">Select a conversation</h3>
          <p className="text-sm">Choose a contact or group from the list on the left to start chatting.</p>
        </div>
      )}

      {/* --- MANAGE GROUP & APPROVE MEMBERS MODAL --- */}
      {showManageGroup && activeChat?.isGroup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-ikm-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-ikm-border animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-5 border-b border-ikm-border shrink-0 bg-ikm-bg/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-ikm-orange-light text-ikm-orange-dark">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-ikm-text">
                    {manageGroupMode === 'view' ? t('approveMembers') : t('addMembers')}
                  </h2>
                  <p className="text-xs text-ikm-text-secondary">
                    {activeChat.name} • {language === 'TH' ? 'จัดการสมาชิกและสิทธิ์ในฐานข้อมูล' : 'Database-backed member access'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowManageGroup(false)} className="text-ikm-text-secondary hover:text-ikm-text p-1.5 rounded-lg hover:bg-ikm-bg">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {manageGroupMode === 'view' ? (
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-ikm-border">
                    <span className="text-xs font-bold text-ikm-text uppercase tracking-wider">
                      {t('currentMembers')} ({activeChat.members?.length || 0})
                    </span>
                    <button 
                      onClick={() => setManageGroupMode('add')}
                      className="text-xs font-semibold text-ikm-orange hover:text-ikm-orange-dark flex items-center gap-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{t('addMembers')}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {employees.filter(emp => activeChat.members?.includes(emp.id)).map(emp => {
                      const presence = getContactPresence(emp.id);
                      return (
                        <div key={emp.id} className="flex items-center justify-between p-2.5 bg-ikm-bg/60 border border-ikm-border rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar src={`https://i.pravatar.cc/150?u=${emp.id.toLowerCase()}`} fallback={emp.name.charAt(0)} className="h-9 w-9" />
                              <span className={cn(
                                "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-ikm-card",
                                presence === 'online' ? "bg-emerald-500" : presence === 'busy' ? "bg-rose-500" : "bg-slate-400"
                              )} />
                            </div>
                            <div>
                              <div className="text-xs md:text-sm font-semibold text-ikm-text flex items-center gap-1.5">
                                <span>{emp.name}</span>
                                {emp.id === 'E-001' && (
                                  <span className="text-[10px] bg-ikm-orange-light text-ikm-orange-dark font-bold px-1.5 py-0.2 rounded">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-ikm-text-secondary">{emp.role} • {emp.department}</div>
                            </div>
                          </div>

                          <button 
                            onClick={() => handleRemoveMemberFromGroup(emp.id)}
                            className="p-1.5 text-ikm-text-secondary hover:text-status-red hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title={t('remove')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-ikm-text uppercase tracking-wider">
                      {t('selectMembers')} ({pendingNewMembers.length} {language === 'TH' ? 'คนที่เลือก' : 'selected'})
                    </label>
                  </div>

                  <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                    {employees.filter(emp => !activeChat.members?.includes(emp.id)).map(emp => {
                      const isSelected = pendingNewMembers.includes(emp.id);
                      return (
                        <div 
                          key={emp.id} 
                          className={cn(
                            "flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all",
                            isSelected ? "border-ikm-orange bg-ikm-orange-light/20" : "border-ikm-border bg-ikm-bg hover:bg-ikm-bg/80"
                          )}
                          onClick={() => {
                            if (isSelected) {
                              setPendingNewMembers(pendingNewMembers.filter(m => m !== emp.id));
                            } else {
                              setPendingNewMembers([...pendingNewMembers, emp.id]);
                            }
                          }}
                        >
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            readOnly
                            className="h-4 w-4 rounded border-gray-300 text-ikm-orange focus:ring-ikm-orange"
                          />
                          <Avatar src={`https://i.pravatar.cc/150?u=${emp.id.toLowerCase()}`} fallback={emp.name.charAt(0)} className="h-8 w-8" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-ikm-text truncate">{emp.name}</div>
                            <div className="text-[11px] text-ikm-text-secondary truncate">{emp.role} • {emp.department}</div>
                          </div>
                        </div>
                      );
                    })}
                    {employees.filter(emp => !activeChat.members?.includes(emp.id)).length === 0 && (
                      <div className="text-center text-xs text-ikm-text-secondary py-6 bg-ikm-bg rounded-xl border border-dashed border-ikm-border">
                        {language === 'TH' ? 'พนักงานทุกคนอยู่ในกลุ่มนี้แล้ว' : 'All employees are already members of this group.'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-ikm-border flex justify-end gap-2 shrink-0 bg-ikm-bg/50">
              {manageGroupMode === 'view' ? (
                <button 
                  onClick={() => setShowManageGroup(false)}
                  className="px-4 py-2 text-xs md:text-sm font-semibold bg-ikm-card border border-ikm-border hover:bg-ikm-bg rounded-lg text-ikm-text"
                >
                  {language === 'TH' ? 'ปิดหน้าต่าง' : 'Close'}
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => { setManageGroupMode('view'); setPendingNewMembers([]); }}
                    className="px-4 py-2 text-xs md:text-sm font-semibold text-ikm-text-secondary hover:text-ikm-text rounded-lg"
                  >
                    {t('back')}
                  </button>
                  <button 
                    onClick={handleAddMembersToGroup}
                    disabled={pendingNewMembers.length === 0}
                    className="px-5 py-2 text-xs md:text-sm font-semibold bg-ikm-orange hover:bg-ikm-orange-dark disabled:opacity-50 text-white rounded-lg shadow-sm"
                  >
                    {t('save')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CREATE NEW GROUP MODAL --- */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-ikm-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-ikm-border animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-5 border-b border-ikm-border shrink-0 bg-ikm-bg/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-ikm-orange-light text-ikm-orange-dark">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-ikm-text">{t('createGroup')}</h2>
                  <p className="text-xs text-ikm-text-secondary">
                    {language === 'TH' ? 'บันทึกลงตาราง chat_members ในฐานข้อมูล' : 'Saves room & member relations to Supabase'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowCreateGroup(false)} className="text-ikm-text-secondary hover:text-ikm-text p-1.5 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ikm-text">{t('groupName')} *</label>
                <input 
                  type="text" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-ikm-border focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none bg-ikm-bg text-xs md:text-sm text-ikm-text"
                  placeholder={language === 'TH' ? 'เช่น ทีมช่างซ่อมบำรุง, คณะกรรมการความปลอดภัย' : 'e.g., Mechanical Maintenance Team, Safety QMS'}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ikm-text">{t('selectMembers')} ({selectedMembers.length})</label>
                <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar">
                  {employees.map(emp => {
                    const isSelected = selectedMembers.includes(emp.id);
                    return (
                      <div 
                        key={emp.id} 
                        className={cn(
                          "flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all",
                          isSelected ? "border-ikm-orange bg-ikm-orange-light/20" : "border-ikm-border bg-ikm-bg hover:bg-ikm-bg/80"
                        )}
                        onClick={() => toggleMember(emp.id)}
                      >
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          readOnly
                          className="h-4 w-4 rounded border-gray-300 text-ikm-orange focus:ring-ikm-orange"
                        />
                        <Avatar src={`https://i.pravatar.cc/150?u=${emp.id.toLowerCase()}`} fallback={emp.name.charAt(0)} className="h-8 w-8" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-ikm-text truncate">{emp.name}</div>
                          <div className="text-[11px] text-ikm-text-secondary truncate">{emp.role} • {emp.department}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-ikm-border flex justify-end gap-2 shrink-0 bg-ikm-bg/50">
              <button 
                onClick={() => setShowCreateGroup(false)} 
                className="px-4 py-2 text-xs md:text-sm font-semibold text-ikm-text-secondary hover:text-ikm-text rounded-lg"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleCreateGroup} 
                className="px-5 py-2 text-xs md:text-sm font-semibold bg-ikm-orange hover:bg-ikm-orange-dark text-white rounded-lg shadow-sm disabled:opacity-50"
                disabled={!newGroupName.trim() || selectedMembers.length === 0}
              >
                {t('create')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

