"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, FileText, Edit2, Trash2, Calendar, Bot } from 'lucide-react';
import type { Note } from '@/hooks/useNotes';

interface StudyPlanCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onView: (note: Note) => void;
}

export default function StudyPlanCard({ note, onEdit, onDelete, onView }: StudyPlanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Extract plan overview from content
  const getPreviewContent = (content: string): string => {
    // Remove HTML tags for preview
    const plainText = content.replace(/<[^>]*>/g, '');
    
    // Find the overview section or take first 200 characters
    const overviewMatch = plainText.match(/##\s*Overview\s*(.*?)(?=##|$)/s);
    if (overviewMatch && overviewMatch[1]) {
      return overviewMatch[1].trim().substring(0, 300) + '...';
    }
    
    // Fallback to first few lines
    const lines = plainText.split('\n').filter(line => line.trim());
    return lines.slice(0, 3).join(' ').substring(0, 200) + '...';
  };

  // Check if this is a study plan based on title
  const isStudyPlan = note.title.toLowerCase().includes('study plan') || 
                      note.title.toLowerCase().includes('day') && 
                      (note.title.toLowerCase().includes('plan') || 
                       note.title.toLowerCase().includes('beginner') || 
                       note.title.toLowerCase().includes('intermediate'));

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          {isStudyPlan ? (
            <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
          ) : (
            <Bot className="w-5 h-5 text-purple-600 flex-shrink-0" />
          )}
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{note.title}</h3>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onView(note);
            }}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-100"
            title="View Full Plan"
          >
            <FileText className="w-4 h-4" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-100"
            title="Edit Plan"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400"
            title="Delete Plan"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-3">
        {isExpanded ? (
          <div 
            className="text-gray-700 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        ) : (
          <p className="text-gray-600 text-sm leading-relaxed">
            {getPreviewContent(note.content)}
          </p>
        )}
      </div>

      {/* Expand/Collapse Button */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Show Full Plan
            </>
          )}
        </Button>
        
        <div className="text-xs text-gray-500">
          Last updated: {new Date(note.updated_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
