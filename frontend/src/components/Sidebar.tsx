import React from 'react';
import { Home, Compass, Library, Plus, User, LogOut, Hexagon } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface SidebarProps {
  user: SupabaseUser | null;
  conversations: any[];
  onNewThread: () => void;
  onSelectConversation: (id: string) => void;
  onLogout: () => void;
  currentChatId: string | null;
}

export function Sidebar({ user, conversations, onNewThread, onSelectConversation, onLogout, currentChatId }: SidebarProps) {
  return (
    <div className="w-[260px] bg-[#202222] h-screen flex flex-col justify-between border-r border-[#2d2f2f] text-sm hidden md:flex shrink-0">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Logo area */}
        <div className="p-4 flex items-center gap-2 cursor-pointer text-xl font-bold tracking-tight text-white mb-2" onClick={onNewThread}>
          <div className="text-white flex items-center justify-center">
            <Hexagon size={28} fill="currentColor" />
          </div>
          poorplexity
        </div>

        {/* New Thread Button */}
        <div className="px-3 mb-4">
          <button 
            onClick={onNewThread}
            className="w-full flex items-center justify-between bg-[#191A1A] border border-[#2d2f2f] hover:bg-[#252626] transition-colors rounded-full py-2 px-4 font-medium text-[rgba(255,255,255,0.9)] shadow-sm"
          >
            <span>New Thread</span>
            <div className="flex items-center gap-1 opacity-50">
              <span className="text-xs border border-gray-600 rounded px-1.5 py-0.5">Ctrl</span>
              <span className="text-xs border border-gray-600 rounded px-1.5 py-0.5">O</span>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <div className="px-2 space-y-0.5 mb-6">
          <button onClick={onNewThread} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${!currentChatId ? 'bg-[#2d2f2f] text-white' : 'text-gray-400 hover:bg-[#252626] hover:text-white'}`}>
            <Home size={18} />
            <span className="font-medium">Home</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-gray-400 hover:bg-[#252626] hover:text-white transition-colors">
            <Compass size={18} />
            <span className="font-medium">Discover</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-gray-400 hover:bg-[#252626] hover:text-white transition-colors">
            <Library size={18} />
            <span className="font-medium">Library</span>
          </button>
        </div>

        {/* History / Conversations */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Threads
          </div>
          <div className="space-y-0.5">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full text-left truncate px-3 py-2 rounded-md text-[13px] transition-colors ${currentChatId === conv.id ? 'bg-[#2d2f2f] text-white' : 'text-gray-400 hover:bg-[#252626] hover:text-white'}`}
              >
                {conv.title || 'Untitled Thread'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User profile area */}
      <div className="p-3 border-t border-[#2d2f2f]">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:bg-[#252626] hover:text-white transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs overflow-hidden">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={14} />
            )}
          </div>
          <span className="font-medium truncate flex-1 text-left">{user?.email?.split('@')[0]}</span>
          <LogOut size={16} className="opacity-50" />
        </button>
      </div>
    </div>
  );
}
