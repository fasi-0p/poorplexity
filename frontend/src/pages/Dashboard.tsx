import { createClient } from '@supabase/supabase-js'
import { useEffect, useState, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router'
import axios from 'axios'
import { BACKEND_URL } from '../lib/config'
import { Sidebar } from '../components/Sidebar'
import { ArrowRight, Search, Paperclip, Text, Hexagon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const supabase = createClient('https://ltfeptqhfkdfjivuthul.supabase.co', 'sb_publishable_LPIRFBCiUAfkODTJn8yHuw_yB1n7teP')

export default function Dashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null)
    const [conversations, setConversations] = useState<any[]>([])
    const [currentChatId, setCurrentChatId] = useState<string | null>(null)
    const [messages, setMessages] = useState<any[]>([])
    const [query, setQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading])

    useEffect(() => {
        async function getInfo() {
            const { data, error } = await supabase.auth.getUser()
            if (data.user) {
                setUser(data.user)
            } else {
                navigate('/auth')
            }
        }
        getInfo()
    }, [navigate])

    useEffect(() => {
        async function getExistingConversations() {
            if (user) {
                const { data: { session } } = await supabase.auth.getSession()
                const jwt = session?.access_token
                if (!jwt) return;
                try {
                    const response = await axios.get(`${BACKEND_URL}/conversations`, {
                        headers: { Authorization: jwt }
                    })
                    setConversations(response.data.conversations || response.data)
                } catch (e) {
                    console.error("Failed to load conversations", e)
                }
            }
        }
        getExistingConversations()
    }, [user, currentChatId]) // Refresh when a new chat is created

    const fetchConversation = async (id: string) => {
        setCurrentChatId(id)
        setMessages([])
        const { data: { session } } = await supabase.auth.getSession()
        const jwt = session?.access_token
        try {
            const response = await axios.get(`${BACKEND_URL}/conversation/${id}`, {
                headers: { Authorization: jwt }
            })
            if (response.data && response.data.messages) {
                setMessages(response.data.messages)
            }
        } catch (e) {
            console.error("Failed to fetch conversation", e)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim() || isLoading) return
        
        const userQuery = query
        setQuery('')
        setIsLoading(true)
        
        // Optimistically add user message
        const newMessages = [...messages, { role: 'USER', content: userQuery }]
        setMessages(newMessages)
        
        // Add a placeholder assistant message
        setMessages([...newMessages, { role: 'ASSISTANT', content: '', sources: [] }])

        const { data: { session } } = await supabase.auth.getSession()
        const jwt = session?.access_token

        const isFollowUp = currentChatId !== null
        const endpoint = isFollowUp ? '/poorplexity_ask/follow_up' : '/poorplexity_ask'
        const body = isFollowUp ? { query: userQuery, conversationId: currentChatId } : { query: userQuery }

        try {
            const response = await fetch(`${BACKEND_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': jwt || ''
                },
                body: JSON.stringify(body)
            })

            if (!response.body) throw new Error("No response body")

            const reader = response.body.getReader()
            const decoder = new TextDecoder('utf-8')
            let assistantResponse = ""
            let sourcesJson = ""
            let isParsingSources = false
            let isParsingConvId = false
            let newChatId = currentChatId

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                
                // Extremely basic parsing for <SOURCES> and <CONVERSATION_ID> tags which come at the end
                const parts = chunk.split(/(<SOURCES>|<\/SOURCES>|<CONVERSATION_ID>|<\/CONVERSATION_ID>)/)
                
                for (let i = 0; i < parts.length; i++) {
                    const p = parts[i]
                    if (p === "<SOURCES>") {
                        isParsingSources = true
                        continue
                    } else if (p === "</SOURCES>") {
                        isParsingSources = false
                        try {
                            const sourcesData = JSON.parse(sourcesJson)
                            setMessages(prev => {
                                const last = prev[prev.length - 1]
                                return [...prev.slice(0, -1), { ...last, sources: sourcesData }]
                            })
                        } catch (e) {}
                        continue
                    } else if (p === "<CONVERSATION_ID>") {
                        isParsingConvId = true
                        continue
                    } else if (p === "</CONVERSATION_ID>") {
                        isParsingConvId = false
                        continue
                    }

                    if (isParsingSources) {
                        sourcesJson += p
                    } else if (isParsingConvId) {
                        newChatId = p.trim()
                        if (!currentChatId && newChatId) {
                            setCurrentChatId(newChatId)
                        }
                    } else if (p.trim() || p === " " || p === "\n") {
                        assistantResponse += p
                        setMessages(prev => {
                            const last = prev[prev.length - 1]
                            return [...prev.slice(0, -1), { ...last, content: assistantResponse }]
                        })
                    }
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleNewThread = () => {
        setCurrentChatId(null)
        setMessages([])
        setQuery('')
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        navigate('/auth')
    }

    return (
        <div className="flex h-screen bg-[#191A1A] text-white font-sans overflow-hidden">
            <Sidebar 
                user={user} 
                conversations={conversations} 
                onNewThread={handleNewThread} 
                onSelectConversation={fetchConversation}
                onLogout={handleLogout}
                currentChatId={currentChatId}
            />

            <main className="flex-1 flex flex-col relative h-full">
                {/* Header (Mobile) */}
                <header className="md:hidden flex items-center p-4 border-b border-[#2d2f2f] bg-[#191A1A] z-10">
                    <div className="text-white mr-2 flex items-center justify-center">
                        <Hexagon size={24} fill="currentColor" />
                    </div>
                    <span className="font-bold tracking-tight">poorplexity</span>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-4 md:px-0">
                    {!currentChatId && messages.length === 0 ? (
                        // Homepage Search State
                        <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto w-full px-4">
                            <h1 className="text-3xl md:text-4xl font-normal mb-8 text-center text-[rgba(255,255,255,0.9)]">What do you want to know?</h1>
                            
                            <form onSubmit={handleSubmit} className="w-full relative">
                                <div className="bg-[#202222] border border-[#2d2f2f] rounded-[24px] focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500 transition-all flex flex-col min-h-[140px] shadow-lg">
                                    <textarea
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSubmit(e);
                                            }
                                        }}
                                        placeholder="Ask anything..."
                                        className="w-full bg-transparent border-none outline-none resize-none px-5 py-4 text-[16px] text-white placeholder-gray-500 flex-1 min-h-[80px]"
                                        autoFocus
                                    />
                                    <div className="px-3 pb-3 pt-2 flex items-center justify-between border-t border-transparent">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <button type="button" className="p-2 hover:bg-[#2d2f2f] rounded-full transition-colors flex items-center gap-2 text-xs font-medium">
                                                <Text size={16} />
                                                <span className="hidden sm:inline">Focus</span>
                                            </button>
                                            <button type="button" className="p-2 hover:bg-[#2d2f2f] rounded-full transition-colors flex items-center gap-2 text-xs font-medium">
                                                <Paperclip size={16} />
                                                <span className="hidden sm:inline">Attach</span>
                                            </button>
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={!query.trim() || isLoading}
                                            className="bg-white text-black p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                                        >
                                            <ArrowRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            </form>
                            
                            <div className="mt-6 flex flex-wrap gap-2 justify-center text-sm text-gray-400">
                                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2d2f2f] bg-[#202222] hover:bg-[#2d2f2f] cursor-pointer transition-colors"><Search size={14} /> Who is the CEO of Google?</span>
                                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2d2f2f] bg-[#202222] hover:bg-[#2d2f2f] cursor-pointer transition-colors"><Search size={14} /> Rust vs Go performance</span>
                            </div>
                        </div>
                    ) : (
                        // Conversation State
                        <div className="max-w-3xl mx-auto w-full pb-32 pt-8 px-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className="mb-10">
                                    {msg.role === 'USER' ? (
                                        <div className="text-2xl font-medium text-[rgba(255,255,255,0.9)] mb-6">
                                            {msg.content}
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Sources Grid */}
                                            {msg.sources && msg.sources.length > 0 && (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-3 text-[rgba(255,255,255,0.9)] font-medium">
                                                        <Search size={18} />
                                                        <h2>Sources</h2>
                                                    </div>
                                                    <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
                                                        {msg.sources.map((src: any, sIdx: number) => (
                                                            <a 
                                                                key={sIdx} 
                                                                href={src.url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="flex flex-col gap-1 min-w-[160px] max-w-[200px] p-3 rounded-xl bg-[#202222] hover:bg-[#2d2f2f] border border-[#2d2f2f] transition-colors shrink-0"
                                                            >
                                                                <span className="text-xs text-gray-400 truncate">{new URL(src.url).hostname.replace('www.', '')}</span>
                                                                <span className="text-sm text-white font-medium line-clamp-2">{src.title || src.url}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* AI Answer */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-3 text-[rgba(255,255,255,0.9)] font-medium">
                                                    <div className="text-white flex items-center justify-center">
                                                        <Hexagon size={18} fill="currentColor" />
                                                    </div>
                                                    <h2>Answer</h2>
                                                </div>
                                                <div className="prose prose-invert max-w-none text-gray-300 prose-p:leading-relaxed prose-pre:bg-[#202222] prose-pre:border prose-pre:border-[#2d2f2f] marker:text-gray-500">
                                                    {msg.content ? (
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    ) : (
                                                        <div className="animate-pulse flex space-x-2 items-center h-6">
                                                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Follow-up input at bottom */}
                {(currentChatId || messages.length > 0) && (
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#191A1A] via-[#191A1A] to-transparent pt-10 pb-6 px-4 md:px-0 z-20">
                        <div className="max-w-3xl mx-auto w-full">
                            <form onSubmit={handleSubmit} className="w-full relative">
                                <div className="bg-[#202222] border border-[#2d2f2f] rounded-full focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500 transition-all flex items-center shadow-lg px-2">
                                    <input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Ask follow-up..."
                                        className="w-full bg-transparent border-none outline-none px-4 py-3.5 text-[15px] text-white placeholder-gray-500 flex-1"
                                        disabled={isLoading}
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!query.trim() || isLoading}
                                        className="bg-white text-black p-1.5 mr-1 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                                    >
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}