"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { type Note } from '@/hooks/useNotes';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import Image from 'next/image';
import { useUser } from '@/hooks/useUser';
import FileAttachments from '@/components/FileAttachments';
import { useAppStore } from '@/store/useAppStore';

export default function NotePage() {
  useAuthGuard();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { fetchNoteById } = useAppStore();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, profile, signOut } = useUser();
  
  useEffect(() => {
    const loadNote = async () => {
      if (id) {
        setLoading(true);
        const fetchedNote = await fetchNoteById(id);
        if (fetchedNote) {
          setNote(fetchedNote);
        } else {
          // Note not found, redirect to dashboard
          router.push('/dashboard');
        }
        setLoading(false);
      }
    };
    
    loadNote();
  }, [id, fetchNoteById, router]);

  if (loading || !note) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Loading note...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Nav Bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Image src="/neo.png" alt="Nerofea Logo" width={32} height={32} />
            <span className="text-xl font-bold text-gray-900">Nerofea</span>
          </div>
        </div>
        
        {/* Right: User Info & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">{profile?.username}</span>
            <Image
              src={profile?.avatar_url || "/neo.png"}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full border"
            />
          </div>
          <Button type="button" variant="outline" className="ml-2" onClick={() => router.push("/profile")}>Profile</Button>
          <Button type="button" variant="destructive" onClick={signOut}>Sign Out</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Note Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{note.title}</h1>
            <div className="text-sm text-gray-500">
              Created: {new Date(note.created_at).toLocaleDateString()} • 
              Updated: {new Date(note.updated_at).toLocaleDateString()}
            </div>
          </div>

          {/* Note Content */}
          <div className="prose max-w-none mb-8">
            {note.content ? (
              <div dangerouslySetInnerHTML={{ __html: note.content }} />
            ) : (
              <div className="text-gray-400 italic text-center py-8">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                No content available
              </div>
            )}
          </div>

          {/* File Attachments */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">File Attachments</h3>
            <FileAttachments noteId={note.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
