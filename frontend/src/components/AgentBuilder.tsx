import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  X, 
  Upload, 
  Wand2, 
  Sparkles, 
  Play,
  Eye,
  EyeOff,
  Users,
  Loader
} from 'lucide-react';
import { toast } from 'sonner';

interface AgentBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: () => void;
  agentData?: {
    _id: string;
    title: string;
    subtitle: string;
    description: string;
    prompt?: string;
    toolName?: string;
    appLink?: string;
    isPublic: boolean;
    icon?: {
      data: string;
      contentType: string;
    };
  } | null;
}

const AgentBuilder: React.FC<AgentBuilderProps> = ({ isOpen, onClose, onAgentCreated, agentData }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    prompt: '',
    toolName: '',
    appLink: '',
    isPublic: false
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onload = () => setIconPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.subtitle || !formData.description || !formData.prompt || !formData.toolName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitFormData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitFormData.append(key, String(value));
      });
      
      if (iconFile) {
        submitFormData.append('icon', iconFile);
      }

      const isEditing = agentData !== null;
      const url = isEditing 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/custom-agents/${agentData._id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/custom-agents/create`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: submitFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} agent`);
      }

      toast.success(isEditing ? '✅ Agent Updated!' : '🎉 Custom Agent Created!', {
        description: isEditing 
          ? 'Your agent has been successfully updated!'
          : 'Your AI agent has been successfully created and is ready to use!'
      });
      
      // Reset form
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        prompt: '',
        toolName: '',
        appLink: '',
        isPublic: false
      });
      setIconFile(null);
      setIconPreview(null);
      
      onAgentCreated();
      onClose();
    } catch (error) {
      console.error(`Error ${agentData ? 'updating' : 'creating'} agent:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${agentData ? 'update' : 'create'} agent`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Populate form when editing
  useEffect(() => {
    if (agentData) {
      setIsInitializing(true);
      
      // Simulate a small delay to show loading state
      setTimeout(() => {
        setFormData({
          title: agentData.title,
          subtitle: agentData.subtitle,
          description: agentData.description,
          prompt: agentData.prompt || '',
          toolName: agentData.toolName || '',
          appLink: agentData.appLink || '',
          isPublic: agentData.isPublic
        });
        
        // Set icon preview if agent has an icon
        if (agentData.icon) {
          setIconPreview(`data:${agentData.icon.contentType};base64,${agentData.icon.data}`);
        } else {
          setIconPreview(null);
        }
        setIconFile(null);
        setIsInitializing(false);
      }, 300);
    } else {
      // Reset form for new agent
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        prompt: '',
        toolName: '',
        appLink: '',
        isPublic: false
      });
      setIconPreview(null);
      setIconFile(null);
      setIsInitializing(false);
    }
  }, [agentData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-0 rounded-3xl">
        <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
        
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  🤖 {agentData ? 'Edit AI Agent' : 'AI Agent Builder'}
                </CardTitle>
                <p className="text-gray-600 text-sm mt-1">
                  {agentData ? 'Update your custom AI learning agent' : 'Create your own custom AI learning agent'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-red-100 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-8 relative">
          {/* Loading Overlay */}
          {isInitializing && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center gap-3">
                <Loader className="w-8 h-8 animate-spin text-purple-600" />
                <p className="text-sm text-gray-600 font-medium">Preparing edit form...</p>
              </div>
            </div>
          )}
          
          {/* Tutorial Video Section */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Play className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                📺 How to Create Your Agent
              </h3>
            </div>
            <div className="relative w-full h-64 bg-gray-200 rounded-xl overflow-hidden shadow-lg">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="How to create your agent"
                frameBorder="0"
                allowFullScreen
                className="absolute inset-0"
              ></iframe>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Watch this quick tutorial to learn how to build amazing AI agents!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Basic Information
                  </h3>
                  
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                      Agent Name *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Math Helper Bot"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="subtitle" className="text-sm font-medium text-gray-700">
                      Short Description *
                    </Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => handleInputChange('subtitle', e.target.value)}
                      placeholder="e.g., Helps solve math problems step by step"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Detailed Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe what your agent does and how it helps learners..."
                      className="mt-1 h-24"
                      required
                    />
                  </div>
                </div>

                {/* Icon Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-purple-600" />
                    Agent Icon
                  </h3>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                      {iconPreview ? (
                        <img src={iconPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <Label htmlFor="icon" className="cursor-pointer">
                        <div className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-block">
                          Choose Icon
                        </div>
                      </Label>
                      <Input
                        id="icon"
                        type="file"
                        accept="image/*"
                        onChange={handleIconChange}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Optional: Upload a custom icon for your agent
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* AI Behavior */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Behavior
                  </h3>
                  
                  <div>
                    <Label htmlFor="prompt" className="text-sm font-medium text-gray-700">
                      Agent Personality & Instructions *
                    </Label>
                    <Textarea
                      id="prompt"
                      value={formData.prompt}
                      onChange={(e) => handleInputChange('prompt', e.target.value)}
                      placeholder="Tell your agent how to behave. E.g., 'You are a friendly math tutor who explains concepts clearly and encourages students...'"
                      className="mt-1 h-32"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This defines how your agent will respond and interact with learners
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="toolName" className="text-sm font-medium text-gray-700">
                      Associated Tool/App 
                    </Label>
                    <Input
                      id="toolName"
                      value={formData.toolName}
                      onChange={(e) => handleInputChange('toolName', e.target.value)}
                      placeholder="e.g., Calculator Pro, Writing Assistant"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="appLink" className="text-sm font-medium text-gray-700">
                      App Link (Optional)
                    </Label>
                    <Input
                      id="appLink"
                      value={formData.appLink}
                      onChange={(e) => handleInputChange('appLink', e.target.value)}
                      placeholder="https://example.com/your-app"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Sharing Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Sharing Settings
                  </h3>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {formData.isPublic ? (
                        <Eye className="w-5 h-5 text-green-600" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">Make Public</p>
                        <p className="text-sm text-gray-600">
                          Allow other learners to discover and use your agent
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={formData.isPublic ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange('isPublic', !formData.isPublic)}
                      className={formData.isPublic ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {formData.isPublic ? "Public" : "Private"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Custom Agent
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  🏆 Earn Builder Badge!
                </Badge>
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4" />
                      Create Agent
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentBuilder;