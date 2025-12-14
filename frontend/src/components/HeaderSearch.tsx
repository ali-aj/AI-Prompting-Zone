import React, { useState, useMemo, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAgentData } from '@/context/AgentDataContext';
import { useAuth } from '@/context/AuthContext';
import AgentChat from './AgentChat';
import CustomAgentChat from './CustomAgentChat';
import { Link } from 'react-router-dom';

interface BaseAgent {
    _id: string;
    title: string;
    subtitle?: string;
    source: 'main' | 'mine' | 'community';
}

const HeaderSearch: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedAgent, setSelectedAgent] = useState<BaseAgent | null>(null);
    const [showAgentChat, setShowAgentChat] = useState(false);
    const [showCustomChat, setShowCustomChat] = useState(false);

    const { mainAgents, myAgents, communityAgents } = useAgentData();
    const { token } = useAuth();

    // Global click handler to close modals and search when clicking outside
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Check if any modal is open
            if (showAgentChat || showCustomChat) {
                // Check if the click target is not part of the modal content
                const isModalContent = target.closest('[data-modal-content]');

                if (!isModalContent) {
                    setShowAgentChat(false);
                    setShowCustomChat(false);
                    setSelectedAgent(null);
                }
            }

            // Check if search is open
            if (open) {
                // Check if the click target is not part of the search content
                const isSearchContent = target.closest('[data-search-content]');

                if (!isSearchContent) {
                    closeAll();
                }
            }
        };

        // Add event listener if any modal or search is open
        if (showAgentChat || showCustomChat || open) {
            document.addEventListener('mousedown', handleGlobalClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleGlobalClick);
        };
    }, [showAgentChat, showCustomChat, open]);

    const sanitize = (t: string) => t.replace(/\s+/g, ' ').trim().toLowerCase();

    const allAgents = useMemo<BaseAgent[]>(() => {
        const list: BaseAgent[] = [];
        const seen = new Set<string>();
        const push = (a: BaseAgent) => {
            const k = `${sanitize(a.title)}-${a.source}`;
            if (!seen.has(k)) {
                seen.add(k);
                list.push(a);
            }
        };
        mainAgents.forEach((a) => push({ ...a, source: 'main' } as BaseAgent));
        myAgents.forEach((a) => push({ ...a, source: 'mine' } as BaseAgent));
        communityAgents.forEach((a) => push({ ...a, source: 'community' } as BaseAgent));
        return list;
    }, [mainAgents, myAgents, communityAgents]);

    const suggestions = useMemo(() => {
        if (!query.trim()) return [];
        const lower = query.toLowerCase();
        return allAgents.filter((a) => a.title.toLowerCase().includes(lower)).slice(0, 6);
    }, [query, allAgents]);

    const badgeCls = (s: string) =>
        s === 'main'
            ? 'bg-blue-500'
            : s === 'mine'
                ? 'bg-purple-500'
                : 'bg-green-500';

    const closeAll = () => {
        setQuery('');
        setOpen(false);
    };

    const handleSelect = (a: BaseAgent) => {
        if (!token) return;
        // Close any existing chat modals first
        setShowAgentChat(false);
        setShowCustomChat(false);
        setSelectedAgent(null);

        // Then open the new one
        setSelectedAgent(a);
        if (a.source === 'main') setShowAgentChat(true);
        else setShowCustomChat(true);
        closeAll();
    };

    return (
        <>
            {/* Only show search if user is logged in */}
            {token && (
                <div className="relative flex items-center">
                    {/* Collapsed/Expanded pill */}
                    <div
                        className={`relative z-[70] flex items-center transition-[width] duration-300 ease-out bg-white border border-gray-300 rounded-full shadow-md overflow-hidden ${open ? 'w-full max-w-[36rem] h-12' : 'w-36 h-10 justify-center cursor-pointer hover:shadow-md'
                            }`}
                        data-search-content
                        onClick={() => {
                            if (!open) setOpen(true);
                        }}
                    >
                        {/* Left icon */}
                        <Search className={`h-4 w-4 ${open ? 'ml-4' : ''} text-gray-400`} />
                        {/* Label when collapsed */}
                        {!open && (
                            <span className="ml-2 text-sm font-medium text-gray-600 select-none">Search</span>
                        )}
                        {/* Input */}
                        <input
                            type="text"
                            placeholder="Search agents…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className={`flex-1 bg-transparent border-0 outline-none focus:ring-0 text-sm ml-2 ${open ? 'block' : 'hidden'}`}
                            autoFocus={open}
                        />
                        {/* Close */}
                        {open && (
                            <button
                                className="p-2 mr-2 text-gray-500 hover:text-gray-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeAll();
                                }}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Suggestions */}
            {open && query && suggestions.length > 0 && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-full max-w-[36rem] px-4" data-search-content>
                    <Card className="border border-gray-200 shadow-2xl rounded-xl overflow-hidden bg-white">
                        {suggestions.map((s, idx) => (
                            <div
                                key={`${s._id}-${s.source}`}
                                onClick={() => handleSelect(s)}
                                className={`px-6 py-4 cursor-pointer hover:bg-gray-50 flex items-start justify-between transition-colors duration-150 ${idx !== suggestions.length - 1 ? 'border-b border-gray-100' : ''
                                    }`}
                            >
                                <div className="pr-6">
                                    <p className="text-base font-semibold text-gray-900">{s.title}</p>
                                    {s.subtitle && <p className="text-sm text-gray-500 mt-1">{s.subtitle}</p>}
                                </div>
                                <span
                                    className={`text-xs font-bold text-white px-3 py-1 rounded-full self-center ${badgeCls(s.source)}`}
                                >
                                    {s.source.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </Card>
                </div>
            )}



            {/* Chat Modals */}
            {showAgentChat && selectedAgent && (
                <AgentChat
                    agentId={selectedAgent._id}
                    onClose={() => {
                        setShowAgentChat(false);
                        setSelectedAgent(null);
                    }}
                />
            )}
            {showCustomChat && selectedAgent && (
                <CustomAgentChat
                    agentId={selectedAgent._id}
                    onClose={() => {
                        setShowCustomChat(false);
                        setSelectedAgent(null);
                    }}
                />
            )}
        </>
    );
};

export default HeaderSearch; 