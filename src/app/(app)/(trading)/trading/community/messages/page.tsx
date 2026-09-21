'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function MessagesContent() {
  const searchParams = useSearchParams();
  const initialRoomId = searchParams.get('roomId');
  const router = useRouter();

  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(initialRoomId);
  const [activeRoomName, setActiveRoomName] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isNewMessageMode, setIsNewMessageMode] = useState(false);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/community/chat');
      const data = await res.json();
      if (data.rooms) {
        setRooms(data.rooms);
      }
    } catch (err) {
      console.error("Failed to fetch rooms", err);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const res = await fetch(`/api/community/chat?roomId=${roomId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await fetch('/api/community/friends');
      const data = await res.json();
      if (data.users) setFriendsList(data.users);
    } catch (err) {
      console.error("Failed to fetch friends", err);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchFriends();
  }, []);

  useEffect(() => {
    if (activeRoomId) {
      fetchMessages(activeRoomId);
      // Setup polling for messages every 3 seconds for prototyping real-time
      const interval = setInterval(() => fetchMessages(activeRoomId), 3000);
      return () => clearInterval(interval);
    }
  }, [activeRoomId]);

  useEffect(() => {
    // Auto scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeRoomId) return;

    const content = newMessage;
    setNewMessage('');
    
    // Optimistic update
    setMessages(prev => [...prev, {
      id: Date.now(),
      content,
      created_at: new Date().toISOString(),
      sender: { username: 'ME' } // Temporary placeholder
    }]);

    try {
      await fetch('/api/community/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: activeRoomId, content })
      });
      fetchMessages(activeRoomId);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleStartNewChat = async (userId: string, username: string) => {
    try {
      const res = await fetch('/api/community/chat/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId })
      });
      const data = await res.json();
      if (data.roomId) {
        setIsNewMessageMode(false);
        setActiveRoomId(data.roomId);
        setActiveRoomName(username);
        fetchRooms();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] max-w-[1200px] mx-auto w-full pt-4 pb-8 animate-in fade-in duration-300">
      
      {/* Left Sidebar - Chat List */}
      <div className={`w-full md:w-[350px] flex flex-col bg-surface-container-lowest border border-surface-container-low rounded-l-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] shrink-0 ${activeRoomId && !isNewMessageMode ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 md:p-5 border-b border-surface-container-low flex justify-between items-center">
          <h2 className="font-headline-lg text-[18px] text-on-surface font-bold">
            {isNewMessageMode ? 'New Message' : 'Messages'}
          </h2>
          <button 
            onClick={() => setIsNewMessageMode(!isNewMessageMode)}
            className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">{isNewMessageMode ? 'close' : 'edit_square'}</span>
          </button>
        </div>
        <div className="p-4 border-b border-surface-container-low">
          <input type="text" placeholder={isNewMessageMode ? "Search followers..." : "Search messages..."} className="w-full bg-surface-container-low rounded-[24px] px-4 py-2.5 font-body-sm text-[13px] focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isNewMessageMode ? (
            <div className="flex flex-col">
              <div className="p-4 font-label-sm text-[12px] text-outline uppercase tracking-wider">Suggested / Followers</div>
              {friendsList.map(friend => (
                <div 
                  key={friend.id}
                  onClick={() => handleStartNewChat(friend.id, friend.username || friend.full_name)}
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-surface-container-low/50 transition-colors border-b border-surface-container-low/50"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-[12px] shrink-0">
                    {(friend.username || friend.full_name || 'U').substring(0,2).toUpperCase()}
                  </div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="font-headline-md text-[14px] text-on-surface font-bold truncate">{friend.username || friend.full_name}</span>
                    <span className="font-body-sm text-[12px] text-on-surface-variant truncate">{friend.custom_title || 'Trader'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {isLoadingRooms ? (
                 <div className="p-4 md:p-8 text-center text-outline">Loading...</div>
              ) : rooms.length === 0 ? (
                 <div className="p-4 md:p-8 text-center text-outline font-body-sm">No active conversations. Click the edit icon to start a chat.</div>
              ) : (
                rooms.map((room) => (
                  <div 
                    key={room.id} 
                    onClick={() => { setActiveRoomId(room.id); setActiveRoomName(room.name || 'Chat'); setIsNewMessageMode(false); }} 
                    className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-surface-container-low/50 ${activeRoomId === room.id ? 'bg-primary/10' : 'hover:bg-surface-container-low/50'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-[14px] shrink-0 relative">
                      {(room.name || 'U').substring(0,2).toUpperCase()}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-container-lowest"></div>
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <span className="font-headline-md text-[14px] text-on-surface font-bold truncate">{room.name || 'Private Chat'}</span>
                      </div>
                      <span className="font-body-sm text-[13px] text-on-surface-variant truncate">Click to view messages...</span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Area - Active Chat */}
      <div className={`flex-1 flex-col bg-surface-container-lowest border-y border-r border-surface-container-low rounded-r-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] ${!activeRoomId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {!activeRoomId ? (
          <div className="flex flex-col items-center gap-4 text-on-surface-variant max-w-sm text-center">
            <span className="material-symbols-outlined text-[64px] opacity-20">forum</span>
            <span className="font-headline-md text-[18px]">Your Messages</span>
            <span className="font-body-sm text-[14px]">Send private photos and messages to a friend or group.</span>
          </div>
        ) : (
          <>
            {/* Active Chat Header */}
            <div className="flex items-center gap-4 p-4 md:p-5 border-b border-surface-container-low bg-surface-container-lowest rounded-tr-2xl">
              <button onClick={() => setActiveRoomId(null)} className="md:hidden text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-[12px] shrink-0 relative">
                {activeRoomName.substring(0,2).toUpperCase()}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-container-lowest"></div>
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-headline-md text-[16px] text-on-surface font-bold">{activeRoomName}</span>
                <span className="font-label-sm text-[12px] text-primary">Active now</span>
              </div>
              <button className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">info</span>
              </button>
            </div>
            
            {/* Active Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 md:gap-6 bg-[#F8F9FA]/50">
              <div className="text-center font-label-sm text-[11px] text-outline my-2">Beginning of conversation</div>
              
              {messages.map((msg, i) => {
                const isMe = msg.sender?.username === 'ME'; // simplified check
                return (
                  <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isMe ? 'self-end justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-[10px] shrink-0 mt-auto">
                        {(msg.sender?.username || 'U').substring(0,2).toUpperCase()}
                      </div>
                    )}
                    <div className={`rounded-2xl px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-[14px] ${isMe ? 'bg-primary text-on-primary rounded-tr-sm' : 'bg-surface-container-lowest border border-surface-container rounded-tl-sm text-on-surface'}`}>
                      {msg.content}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-surface-container-lowest border-t border-surface-container-low flex items-center gap-3 rounded-br-2xl">
              <button className="text-on-surface-variant hover:text-primary w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined">add_circle</span>
              </button>
              <input 
                type="text" 
                placeholder="Message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-surface-container-low border border-surface-container-high rounded-full px-5 py-3 font-body-md text-[14px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
              <button onClick={handleSendMessage} className="text-on-primary bg-primary hover:bg-primary/90 w-10 h-10 flex items-center justify-center rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-colors disabled:opacity-50" disabled={!newMessage.trim()}>
                <span className="material-symbols-outlined text-[20px] ml-1">send</span>
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-5 md:p-10 text-center">Loading Messages...</div>}>
      <MessagesContent />
    </Suspense>
  )
}
