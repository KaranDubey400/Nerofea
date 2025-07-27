"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Trash2, Save, X, FileText, Bot, MessageSquare, Search, Loader2, Paperclip, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabaseClient';
import FileAttachments from './FileAttachments';
import RichNoteEditor from './RichNoteEditor';
import StudyPlanCard from './StudyPlanCard';
import { useAppStore } from '@/store/useAppStore';
import type { Note } from '@/hooks/useNotes';

interface NotesListProps {
  topicId: string;
  topicTitle: string;
}

export default function NotesList({ topicId, topicTitle }: NotesListProps) {
  // Use the app store instead of useNotes hook
  const {
    notes,
    notesLoading: loading,
    updateNote,
    deleteNote,
    fetchNotes,
    setSelectedTopicId
  } = useAppStore();
  
  // Check if this is the Generated Plans topic
  const isGeneratedPlansIndex = topicTitle === 'Generated Plans';
  const router = useRouter();
  
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [showAttachments, setShowAttachments] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  
  // Fetch notes when the component mounts or topicId changes
  useEffect(() => {
    setSelectedTopicId(topicId);
    fetchNotes(topicId);
  }, [topicId, fetchNotes, setSelectedTopicId]);

  // AI Assistant state
  const [showAI, setShowAI] = useState(false);
  const [aiMode, setAiMode] = useState<'research' | 'explain'>('explain');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const startEditing = (note: { id: string; title: string; content: string }) => {
    setEditingId(note.id);
    setEditingTitle(note.title);
    setEditingContent(note.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
    setEditingContent('');
  };

  const handleUpdateNote = async (id: string) => {
    if (!editingTitle.trim()) return;
    
    try {
      // 1. Update the note
      const updatedNote = await updateNote(id, {
        title: editingTitle.trim(),
        content: editingContent.trim()
      });
      
      // 2. Call the edge function to process links
      if (updatedNote) {
        try {
          const { error: functionError } = await supabase.functions.invoke('process-note-links', {
            body: { note: updatedNote },
          });
          
          if (functionError) {
            console.error("Failed to process links:", functionError);
          }
        } catch (functionErr) {
          console.error("Error invoking edge function:", functionErr);
        }
      }
      
      setEditingId(null);
      setEditingTitle('');
      setEditingContent('');
      toast({
        title: "Note updated successfully",
        description: "Your note has been updated and links processed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      toast({
        title: "Note deleted successfully",
        description: "Your note has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    }
  };

  // AI Assistant handlers
  const handleAISubmit = useCallback(async () => {
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
    } catch (err: any) {
      setAiResult('Error: ' + (err?.message || 'Failed to get AI response. Please try again.'));
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, aiMode]);
  
  const toggleAI = () => {
    setShowAI(!showAI);
    if (!showAI) {
      // Reset state when opening
      setAiPrompt('');
      setAiResult('');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-6 bg-gray-200 rounded mb-2 w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{topicTitle}</h1>
        <p className="text-gray-600">
          {notes.length} note{notes.length !== 1 ? 's' : ''} in this topic
        </p>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12">
          {isGeneratedPlansIndex ? (
            <>
              <Calendar className="w-16 h-16 mx-auto mb-4 text-purple-300" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No study plans yet</h3>
              <p className="text-gray-500 mb-4">AI-generated study plans will appear here automatically when you create them</p>
              <Button
                onClick={() => router.push('/ai-features')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Generate Study Plan
              </Button>
            </>
          ) : (
            <>
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No notes yet</h3>
              <p className="text-gray-500">Click the note icon next to this topic to add your first note</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => {
            // Use StudyPlanCard for Generated Plans topic
            if (isGeneratedPlansIndex) {
              return (
                <StudyPlanCard
                  key={note.id}
                  note={note}
                  onEdit={startEditing}
                  onDelete={handleDeleteNote}
                  onView={setSelectedNote}
                />
              );
            }
            
            // Regular note card for other topics
            return (
            <div
              key={note.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              {editingId === note.id ? (
                <div className="space-y-3">
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    placeholder="Note title..."
                    className="font-semibold"
                  />
                  <RichNoteEditor
                    value={editingContent}
                    onChange={setEditingContent}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleUpdateNote(note.id)}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                    <Button
                      onClick={cancelEditing}
                      size="sm"
                      variant="outline"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                    <button 
                      onClick={toggleAI}
                      className={`px-3 py-1.5 rounded-full flex items-center gap-1 text-xs font-medium transition-all ${
                        showAI 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600' 
                          : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                      }`}
                    >
                      {showAI ? <X className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                      {showAI ? 'Close AI' : 'AI Help'}
                    </button>
                  </div>
                  
                  {/* File Attachments Section */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">File Attachments</h4>
                      <Button
                        onClick={() => setShowAttachments(showAttachments === note.id ? null : note.id)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Paperclip className="w-4 h-4" />
                        {showAttachments === note.id ? 'Hide Files' : 'Manage Files'}
                      </Button>
                    </div>
                    {showAttachments === note.id && (
                      <FileAttachments noteId={note.id} />
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNote(note);
                        }}
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-100"
                        title="View Note"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(note);
                        }}
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-100"
                        title="Edit Note"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400"
                        title="Delete Note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div
                    className="text-gray-700 whitespace-pre-wrap cursor-pointer"
                    onClick={() => setSelectedNote(note)}
                  >
                    <div dangerouslySetInnerHTML={{ __html: note.content }} />
                    {!note.content && <span className="text-gray-400 italic">No content</span>}
                  </div>
                  
                  {/* File Attachments Preview */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">File Attachments</h4>
                      <Button
                        onClick={() => setShowAttachments(showAttachments === note.id ? null : note.id)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Paperclip className="w-4 h-4" />
                        {showAttachments === note.id ? 'Hide Files' : 'Manage Files'}
                      </Button>
                    </div>
                    {showAttachments === note.id && (
                      <FileAttachments noteId={note.id} />
                    )}
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    Last updated: {new Date(note.updated_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
      
      {/* AI Assistant - Fixed Position Pink Panel */}
      {showAI && (
        <div className="fixed top-4 right-4 w-80 h-fit z-50">
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl shadow-2xl border border-pink-200 p-6">
            <div className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
              <Bot className="w-5 h-5 text-pink-600" />
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Notes Assistant
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

      {/* Note View Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{selectedNote.title}</h2>
              <Button onClick={() => setSelectedNote(null)} variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 prose max-w-none" style={{ background: 'white' }}>
              <div dangerouslySetInnerHTML={{ __html: selectedNote.content }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 