import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface AgentBase {
    _id: string;
    title: string;
    subtitle?: string;
    prompt?: string;
    toolName?: string;
    color?: string;
    icon?: { data: string; contentType: string } | null;
    videoUrl?: string | null;
    isActive?: boolean;
    order?: number;
    appLink?: string | null;
    // additional fields for custom agents
    isPublic?: boolean;
    createdBy?: { name: string; username: string };
}

interface AgentDataContextType {
    mainAgents: AgentBase[];
    myAgents: AgentBase[];
    communityAgents: AgentBase[];
    loading: boolean;
    refresh: () => void;
}

const AgentDataContext = createContext<AgentDataContextType | undefined>(undefined);

export const AgentDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    const [mainAgents, setMainAgents] = useState<AgentBase[]>([]);
    const [myAgents, setMyAgents] = useState<AgentBase[]>([]);
    const [communityAgents, setCommunityAgents] = useState<AgentBase[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchAllAgents = useCallback(async () => {
        setLoading(true);
        try {
            // Built-in agents
            const resMain = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/agents`);
            if (resMain.ok) {
                const data = await resMain.json();
                setMainAgents(Array.isArray(data) ? data.filter((a: any) => a.isActive) : []);
            }

            // My custom agents (requires auth)
            if (token) {
                const resMy = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/custom-agents/my-agents`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (resMy.ok) {
                    const data = await resMy.json();
                    setMyAgents(Array.isArray(data) ? data : []);
                }
            } else {
                setMyAgents([]);
            }

            // Public community agents
            const resComm = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/custom-agents/public`);
            if (resComm.ok) {
                const data = await resComm.json();
                setCommunityAgents(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Error fetching agents in context:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchAllAgents();
    }, [fetchAllAgents]);

    const refresh = useCallback(() => {
        fetchAllAgents();
    }, [fetchAllAgents]);

    return (
        <AgentDataContext.Provider value={{ mainAgents, myAgents, communityAgents, loading, refresh }}>
            {children}
        </AgentDataContext.Provider>
    );
};

export const useAgentData = () => {
    const ctx = useContext(AgentDataContext);
    if (!ctx) {
        throw new Error('useAgentData must be used within an AgentDataProvider');
    }
    return ctx;
}; 