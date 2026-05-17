import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Hexagon, Sparkles } from 'lucide-react'

export default function Auth() {
  const supabase = createClient('https://ltfeptqhfkdfjivuthul.supabase.co', 'sb_publishable_LPIRFBCiUAfkODTJn8yHuw_yB1n7teP')
  const [loading, setLoading] = useState<string | null>(null)
  
  async function login(provider: 'google' | 'github') {
    setLoading(provider)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider
    })
    setLoading(null)
  }

  return (
    <div className="min-h-screen bg-[#0e0f0f] text-white font-sans flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md p-10 bg-[#191A1A]/80 backdrop-blur-xl border border-[#2d2f2f]/80 rounded-[32px] shadow-2xl flex flex-col items-center relative z-10 transition-all duration-500 hover:border-[#3f4141]/80">
        
        {/* Logo */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-white/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="text-white flex items-center justify-center bg-[#202222] p-4 rounded-2xl border border-[#2d2f2f] shadow-inner relative z-10">
            <Hexagon size={42} fill="currentColor" className="text-white" />
          </div>
        </div>

        {/* Headings */}
        <h1 className="text-3xl font-semibold mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
          poorplexity
        </h1>
        <p className="text-[#a1a1aa] mb-10 text-center text-[15px] max-w-[280px] leading-relaxed">
          Where knowledge begins. Sign in to start exploring.
        </p>
        
        {/* Auth Buttons */}
        <div className="w-full space-y-3.5">
          <button 
            onClick={() => login('google')}
            disabled={loading !== null}
            className="group w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 rounded-full font-medium hover:bg-gray-100 transition-all duration-200 shadow-[0_2px_10px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-70"
          >
            {loading === 'google' ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
            )}
            <span className="text-[15px]">Continue with Google</span>
          </button>
          
          <button 
            onClick={() => login('github')}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 bg-[#202222] text-white py-3.5 rounded-full font-medium border border-[#2d2f2f] hover:bg-[#2a2c2c] transition-all duration-200 active:scale-[0.98] disabled:opacity-70"
          >
            {loading === 'github' ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            )}
            <span className="text-[15px]">Continue with Github</span>
          </button>
        </div>

        {/* Footer Text */}
        <div className="mt-8 text-center flex items-center justify-center gap-1.5 text-xs text-[#71717a]">
            <Sparkles size={14} className="text-emerald-500/70" />
            <span>Join the next generation of search</span>
        </div>
      </div>
    </div>
  )
}
