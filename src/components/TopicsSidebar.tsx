"use client";
import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, X, Check, FileText, Folder, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import NoteEditor from './NoteEditor';

interface TopicsSidebarProps {
  onTopicSelect?: (topicId: string, topicTitle: string) => void;
  selectedTopicId?: string | null;
}

export default function TopicsSidebar({ onTopicSelect, selectedTopicId }: TopicsSidebarProps) {
  const { 
    topics, 
    topicsLoading: loading, 
    addTopic, 
    updateTopic, 
    deleteTopic,
    fetchTopics,
    ensureGeneratedPlansTopicExists
  } = useAppStore();
  
  const { toast } = useToast();
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);

  // Fetch topics when component mounts and ensure Generated Plans topic exists
  useEffect(() => {
    const initializeTopics = async () => {
      await fetchTopics();
      // Auto-create Generated Plans topic if it doesn't exist
      await ensureGeneratedPlansTopicExists();
    };
    
    initializeTopics();
  }, [fetchTopics, ensureGeneratedPlansTopicExists]);

  const handleAddTopic = async () => {
    if (!newTopicTitle.trim()) return;
    
    console.log('Attempting to add topic:', newTopicTitle.trim());
    
    try {
      const result = await addTopic(newTopicTitle.trim());
      
      if (result) {
        console.log('Topic added successfully:', result);
        setNewTopicTitle('');
        setShowAddForm(false);
        toast({
          title: "Topic added successfully",
          description: "Your new topic has been created.",
        });
      } else {
        console.error('addTopic returned null');
        toast({
          title: "Error",
          description: "Failed to add topic. Please check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in handleAddTopic:', error);
      toast({
        title: "Error",
        description: "Failed to add topic. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTopic = async (id: string) => {
    if (!editingTitle.trim()) return;
    
    try {
      await updateTopic(id, editingTitle.trim());
      setEditingId(null);
      setEditingTitle('');
      toast({
        title: "Topic updated successfully",
        description: "Your topic has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update topic. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTopic = async (id: string) => {
    try {
      await deleteTopic(id);
      toast({
        title: "Topic deleted successfully",
        description: "Your topic has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete topic. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startEditing = (topic: { id: string; title: string }) => {
    setEditingId(topic.id);
    setEditingTitle(topic.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleOpenNoteEditor = () => {
    setShowNoteEditor(true);
  };

  const handleCloseNoteEditor = () => {
    setShowNoteEditor(false);
  };

  if (loading) {
    return (
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
        {/* Header Skeleton */}
        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-8 bg-blue-100 border border-blue-200 rounded flex items-center justify-center animate-pulse">
            <div className="h-4 w-4 bg-blue-200 rounded" />
          </div>
        </div>

        {/* Add Topic Button Skeleton */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="w-full h-10 bg-gray-200 rounded flex items-center gap-2 animate-pulse">
            <div className="h-5 w-5 bg-gray-300 rounded ml-3" />
            <div className="h-4 w-20 bg-gray-300 rounded ml-2" />
          </div>
        </div>

        {/* Topics List Skeleton */}
        <div className="space-y-2 p-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white animate-pulse"
            >
              <span className="flex-1">
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </span>
              <div className="flex items-center gap-1 ml-2">
                <div className="h-5 w-5 bg-yellow-100 rounded border border-yellow-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Topics</h2>
        <Button
          onClick={handleOpenNoteEditor}
          size="sm"
          variant="outline"
          className="ml-2 border-blue-300 text-blue-500 hover:bg-blue-50 hover:border-blue-400 flex items-center gap-2"
          title="Add Note"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden md:inline">Create New Note</span>
        </Button>
      </div>

      {/* Add Topic Button */}
      <div className="p-4 bg-white border-b border-gray-200">
        {!showAddForm ? (
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            <Plus className="w-4 h-4" />
            Add Topic
          </Button>
        ) : (
          <div className="space-y-2">
            <Input
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              placeholder="Enter topic name..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddTopic}
                size="sm"
                className="flex-1"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false);
                  setNewTopicTitle('');
                }}
                size="sm"
                variant="outline"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Topics List */}
      <div className="space-y-2 p-2">
        {topics.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No topics yet</p>
            <p className="text-sm">Click "Add Topic" to get started</p>
          </div>
        ) : (
          topics.map((topic) => (
            <div
              key={topic.id}
              className={`group flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                selectedTopicId === topic.id
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
              onClick={() => onTopicSelect?.(topic.id, topic.title)}
            >
              {editingId === topic.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUpdateTopic(topic.id)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    onClick={() => handleUpdateTopic(topic.id)}
                    size="sm"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={cancelEditing}
                    size="sm"
                    variant="outline"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-gray-900 truncate px-2">
                    {topic.title}
                  </span>
                  <div className="flex items-center gap-1">
                    {topic.title === 'Generated Plans' ? (
                      <Calendar className="w-4 h-4 text-purple-500 opacity-80" />
                    ) : (
                      <Folder className="w-4 h-4 text-yellow-500 opacity-80" />
                    )}
                    {topic.title !== 'Generated Plans' && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <Button
                          onClick={(e) => { e.stopPropagation(); startEditing(topic); }}
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 border-gray-300 hover:bg-gray-100"
                          title="Edit Topic"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={(e) => { e.stopPropagation(); handleDeleteTopic(topic.id); }}
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400"
                          title="Delete Topic"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Note Editor Modal */}
      {showNoteEditor && (
        <NoteEditor
          onClose={handleCloseNoteEditor}
        />
      )}
    </div>
  );
} 