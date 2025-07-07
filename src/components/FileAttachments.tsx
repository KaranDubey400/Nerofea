"use client";
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAttachments } from '@/hooks/useAttachments';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Download, Eye, Trash2, FileText, Image, File } from 'lucide-react';

interface FileAttachmentsProps {
  noteId: string;
}

export default function FileAttachments({ noteId }: FileAttachmentsProps) {
  const { attachments, loading, uploadAttachment, deleteAttachment, getFileIcon, formatFileSize } = useAttachments(noteId);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);

    try {
      await uploadAttachment(file, noteId);
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been attached to your note.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAttachment = async (attachmentId: string, fileName: string) => {
    try {
      await deleteAttachment(attachmentId);
      toast({
        title: "File deleted successfully",
        description: `${fileName} has been removed from your note.`,
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (attachment: any) => {
    if (attachment.publicUrl) {
      const link = document.createElement('a');
      link.href = attachment.publicUrl;
      link.download = attachment.file_name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePreview = (attachment: any) => {
    if (attachment.publicUrl) {
      window.open(attachment.publicUrl, '_blank');
    }
  };

  const isImage = (mimeType?: string) => {
    return mimeType?.startsWith('image/');
  };

  const isPreviewable = (mimeType?: string) => {
    return isImage(mimeType) || mimeType === 'application/pdf' || mimeType === 'text/plain';
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
        <div className="text-center">
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">
            {uploading ? 'Uploading...' : 'Click to upload files or drag and drop'}
          </p>
          <p className="text-xs text-gray-500 mb-3">
            Supports: Images, PDFs, Documents, Text files (Max 10MB)
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            size="sm"
            className="relative"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                Uploading...
              </div>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
            disabled={uploading}
          />
        </div>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Attachments ({attachments.length})</h4>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-2xl">
                    {getFileIcon(attachment.file_type, attachment.mime_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.file_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.file_size)} • {attachment.file_type.toUpperCase()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {isPreviewable(attachment.mime_type) && (
                    <Button
                      onClick={() => handlePreview(attachment)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => handleDownload(attachment)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={() => handleDeleteAttachment(attachment.id, attachment.file_name)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading attachments...</p>
        </div>
      )}
    </div>
  );
} 