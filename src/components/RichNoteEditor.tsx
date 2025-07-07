import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useRef } from 'react';
import { Button } from './ui/button';
import { supabase } from '@/supabaseClient';
import { useUser } from '@/hooks/useUser';

interface RichNoteEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function RichNoteEditor({ value, onChange }: RichNoteEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Image upload handler
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor || !user) return;

    // Supabase upload logic
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    // Use user.id in path for RLS
    const filePath = `${user.id}/inline-images/${fileName}`;

    const { error } = await supabase.storage.from('note-attachments').upload(filePath, file);
    if (error) {
      alert('Upload failed! ' + error.message);
      console.error('Supabase upload error:', error);
      return;
    }
    const { data } = supabase.storage.from('note-attachments').getPublicUrl(filePath);
    if (!data?.publicUrl) {
      alert('Could not get public URL!');
      return;
    }
    // Insert image in editor
    editor.chain().focus().setImage({ src: data.publicUrl }).run();
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Button type="button" onClick={() => fileInputRef.current?.click()}>
          Insert Image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
      </div>
      <div className="border rounded min-h-[200px] p-2 bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
} 