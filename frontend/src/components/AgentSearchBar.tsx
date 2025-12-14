import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAgentData } from '@/context/AgentDataContext';
import AgentChat from './AgentChat';
import CustomAgentChat from './CustomAgentChat';

// Shared base type across main & custom agents
interface BaseAgent {
    _id: string;
    title: string;
    subtitle?: string;
    prompt?: string;
    toolName?: string;
    icon?: { data: string; contentType: string } | null;
    source: 'main' | 'mine' | 'community';
}

type Suggestion = BaseAgent;

const AgentSearchBar: React.FC = () => {
    const [query, setQuery] = useState('');
    const { mainAgents, myAgents, communityAgents, loading: dataLoading } = useAgentData();
    const [isLoading] = useState(false); // deprecated local loading
    const [selectedAgent, setSelectedAgent] = useState<BaseAgent | null>(null);
    const sanitize = (t: string) => t.replace(/\s+/g, ' ').trim().toLowerCase();
    const [showAgentChat, setShowAgentChat] = useState(false);
    const [showCustomChat, setShowCustomChat] = useState(false);
    const { token } = useAuth();
    const navigate = useNavigate();

    // Combine agents from context
    const allAgents = useMemo<BaseAgent[]>(() => {
        const combined: BaseAgent[] = [];
        const seen = new Set<string>();

        const pushUnique = (agent: BaseAgent) => {
            const key = `${sanitize(agent.title)}-${agent.source}`;
            if (!seen.has(key)) {
                combined.push(agent);
                seen.add(key);
            }
        };

        mainAgents.forEach((a) => pushUnique({ ...a, source: 'main' as const }));
        myAgents.forEach((a) => pushUnique({ ...a, source: 'mine' as const }));
        communityAgents.forEach((a) => pushUnique({ ...a, source: 'community' as const }));

        return combined;
    }, [mainAgents, myAgents, communityAgents]);

    // Filter suggestions
    const suggestions: Suggestion[] = useMemo(() => {
        if (!query) return [];
        const lower = query.toLowerCase();
        const filtered = allAgents.filter((a) => a.title.toLowerCase().includes(lower));
        const map = new Map<string, Suggestion>();
        for (const a of filtered) {
            const key = `${sanitize(a.title)}-${a.source}`;
            if (!map.has(key)) map.set(key, a);
        }
        return Array.from(map.values()).slice(0, 8);
    }, [query, allAgents]);

    const handleSelect = (agent: Suggestion) => {
        // If not logged in, redirect to login (chat requires auth)
        const requiresAuth = true; // all chats currently require token
        if (requiresAuth && !token) {
            navigate('/student/signin');
            return;
        }

        setSelectedAgent(agent);
        if (agent.source === 'main') {
            setShowAgentChat(true);
        } else {
            setShowCustomChat(true);
        }
        setQuery('');
    };

    return (
        <div className="relative max-w-xl mx-auto mb-6">
            <Input
                type="text"
                placeholder="Search agents…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full"
            />
            {query && suggestions.length > 0 && (
                <Card className="absolute w-full mt-1 z-20 max-h-80 overflow-y-auto shadow-lg">
                    {suggestions.map((sug) => (
                        <div
                            key={`${sug._id}-${sug.source}`}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                            onClick={() => handleSelect(sug)}
                        >
                            <span>{sug.title}</span>
                            <span className="text-xs text-gray-400 capitalize">{sug.source}</span>
                        </div>
                    ))}
                </Card>
            )}

            {/* AgentChat Modal */}
            {showAgentChat && selectedAgent && (
                <AgentChat
                    agentId={selectedAgent._id}
                    onClose={() => {
                        setShowAgentChat(false);
                        setSelectedAgent(null);
                    }}
                />
            )}

            {/* CustomAgentChat Modal */}
            {showCustomChat && selectedAgent && (
                <CustomAgentChat
                    agentId={selectedAgent._id}
                    onClose={() => {
                        setShowCustomChat(false);
                        setSelectedAgent(null);
                    }}
                />
            )}
        </div>
    );
};

export default AgentSearchBar; 