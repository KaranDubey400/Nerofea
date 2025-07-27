"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Save, X, Bot, MessageSquare, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import RichNoteEditor from './RichNoteEditor';
import { useAppStore } from '@/store/useAppStore';

interface NoteEditorProps {
  onClose: () => void;
  initialTopicId?: string;
}

export default function NoteEditor({ onClose, initialTopicId }: NoteEditorProps) {
  const { topics, addNote, fetchTopics } = useAppStore();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('<p></p>');
  const [selectedTopicId, setSelectedTopicId] = useState(initialTopicId || '');
  const [saving, setSaving] = useState(false);
  
  // Fetch topics when component mounts
  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // Grind-style AI states
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiMode, setAiMode] = useState<'research' | 'explain'>('explain');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a note title.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTopicId) {
      toast({
        title: "Error",
        description: "Please select a topic.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      // Save the note using the store (which handles link processing internally)
      const savedNote = await addNote(selectedTopicId, title.trim(), content.trim());
      
      if (savedNote) {
        toast({
          title: "Note saved successfully",
          description: "Your note has been created and links processed.",
        });
        onClose();
      } else {
        throw new Error("Failed to save note");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  // Grind-style AI handler
  const handleAISubmit = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResult('');
    try {
      if (aiMode === 'research') {
        const query = `Study notes related: ${aiPrompt}`;
        const response = await supabase.functions.invoke('tavily-search', { body: { query } });
        if (response.error) throw response.error;
        setAiResult(response.data?.content || 'No resources found.');
      } else if (aiMode === 'explain') {
        const response = await supabase.functions.invoke('groq-chat', { body: { message: aiPrompt } });
        if (response.error) throw response.error;
        setAiResult(response.data?.response || 'No explanation found.');
      }
    } catch (err) {
      setAiResult('Error: ' + ((err as any)?.message || 'Failed to get AI response. Please try again.'));
    } finally {
      setAiLoading(false);
    }
  };

  // Prevent closing when clicking inside the modal
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        // Prevent the modal from closing when clicking inside
        // Only close if clicking directly on the backdrop
        if (e.target === e.currentTarget) {
          // Do nothing, prevent closing
          e.stopPropagation();
        }
      }}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create New Note</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Topic Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Topic</label>
            <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
              <option value="">Select a topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </Select>
          </div>

          {/* Note Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Note Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full"
            />
          </div>

          {/* Note Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Content</label>
            <RichNoteEditor value={content} onChange={setContent} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={saving}
          >
            Cancel
          </Button>
          <button
            type="button"
            onClick={() => setShowAIAssistant(true)}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1 text-xs font-medium transition-all ${
              showAIAssistant
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
            }`}
            title="Ask Nerofea Assistant"
          >
            <Bot className="w-4 h-4" />
            Help
          </button>
          <Button
            onClick={handleSave}
            disabled={saving || !title.trim() || !selectedTopicId}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Note'}
          </Button>
        </div>

        {/* AI Assistant Panel (grind style) */}
        {showAIAssistant && (
          <div className="fixed top-4 right-4 w-80 h-fit z-50">
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl shadow-2xl border border-pink-200 p-6">
              <div className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                <Bot className="w-5 h-5 text-pink-600" />
                <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Nerofea Assistant
                </span>
              </div>
              {/* Mode Selection */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => { setAiMode('explain'); setAiResult(''); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    aiMode === 'explain'
                      ? 'bg-pink-500 text-white shadow-md'
                      : 'bg-white text-pink-600 hover:bg-pink-50 border border-pink-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Explain
                </button>
                <button
                  onClick={() => { setAiMode('research'); setAiResult(''); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    aiMode === 'research'
                      ? 'bg-pink-500 text-white shadow-md'
                      : 'bg-white text-pink-600 hover:bg-pink-50 border border-pink-200'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Research
                </button>
              </div>
              {/* Input Area */}
              <div className="space-y-3">
                <Textarea
                  placeholder={aiMode === 'explain' ? 'Ask about your notes or study topics...' : 'What study resources do you need?'}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={3}
                  className="border-pink-200 focus:ring-pink-400 focus:border-pink-400 bg-white/80"
                  disabled={aiLoading}
                />
                <Button
                  onClick={handleAISubmit}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-2"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Ask AI ${aiMode === 'explain' ? 'to Explain' : 'for Research'}`
                  )}
                </Button>
              </div>
              {/* Result Area */}
              {aiResult && (
                <div className="mt-4 bg-white/90 rounded-lg p-4 border border-pink-200">
                  <div className="text-sm font-semibold text-pink-700 mb-2">AI Response:</div>
                  <div className="text-sm text-gray-700 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {aiResult}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 