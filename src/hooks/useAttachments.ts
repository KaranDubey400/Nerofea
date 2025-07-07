import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { useUser } from './useUser';

export interface Attachment {
  id: string;
  note_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  created_at: string;
  publicUrl?: string;
}

export function useAttachments(noteId?: string) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Fetch attachments for a specific note
  const fetchAttachments = async (noteId?: string) => {
    if (!user || !noteId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('note_attachments')
        .select('*')
        .eq('note_id', noteId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Add public URLs to attachments (Supabase storage)
      const attachmentsWithUrls = (data || []).map(attachment => ({
        ...attachment,
        publicUrl: supabase.storage
          .from('note-attachments')
          .getPublicUrl(attachment.file_path).data.publicUrl
      }));

      setAttachments(attachmentsWithUrls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attachments');
    } finally {
      setLoading(false);
    }
  };

  // Upload file attachment (using Supabase storage like profile picture)
  const uploadAttachment = async (file: File, noteId: string) => {
    if (!user) return null;
    
    try {
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum 10MB allowed.');
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'text/plain', 'text/csv',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not allowed. Please upload images, PDFs, documents, or text files.');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${noteId}/${fileName}`;

      // Upload file to Supabase Storage (like profile picture)
      const { error: uploadError } = await supabase.storage
        .from('note-attachments')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error('Failed to upload file: ' + uploadError.message);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('note-attachments')
        .getPublicUrl(filePath);

      // Save attachment record to database
      const { data: attachmentData, error: dbError } = await supabase
        .from('note_attachments')
        .insert({
          note_id: noteId,
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: fileExt || 'unknown',
          mime_type: file.type
        })
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('note-attachments').remove([filePath]);
        throw new Error('Failed to save attachment record: ' + dbError.message);
      }

      const attachment = {
        ...attachmentData,
        publicUrl
      };

      setAttachments(prev => [attachment, ...prev]);
      return attachment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload attachment');
      throw err;
    }
  };

  // Delete attachment (using Supabase storage like profile picture)
  const deleteAttachment = async (attachmentId: string) => {
    try {
      // Get attachment details first
      const { data: attachment, error: fetchError } = await supabase
        .from('note_attachments')
        .select('*')
        .eq('id', attachmentId)
        .eq('user_id', user?.id)
        .single();

      if (fetchError || !attachment) {
        throw new Error('Attachment not found');
      }

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('note-attachments')
        .remove([attachment.file_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete attachment record from database
      const { error: dbError } = await supabase
        .from('note_attachments')
        .delete()
        .eq('id', attachmentId)
        .eq('user_id', user?.id);

      if (dbError) {
        throw new Error('Failed to delete attachment: ' + dbError.message);
      }

      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete attachment');
      throw err;
    }
  };

  // Get file icon based on file type
  const getFileIcon = (fileType: string, mimeType?: string) => {
    if (mimeType?.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType?.includes('word') || fileType === 'doc' || fileType === 'docx') return '📝';
    if (mimeType?.includes('excel') || fileType === 'xls' || fileType === 'xlsx') return '📊';
    if (mimeType?.includes('powerpoint') || fileType === 'ppt' || fileType === 'pptx') return '📈';
    if (mimeType === 'text/plain' || fileType === 'txt') return '📄';
    if (mimeType === 'text/csv' || fileType === 'csv') return '📊';
    return '📎';
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    fetchAttachments(noteId);
  }, [user, noteId]);

  return {
    attachments,
    loading,
    error,
    uploadAttachment,
    deleteAttachment,
    getFileIcon,
    formatFileSize,
    refetch: () => fetchAttachments(noteId)
  };
} 