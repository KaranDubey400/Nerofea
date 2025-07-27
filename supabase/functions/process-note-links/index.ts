import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the note data from the request
    const { note } = await req.json()

    if (!note || !note.id || !note.content || !note.user_id) {
      throw new Error('Invalid note data. Required fields: id, content, user_id')
    }

    // Initialize Supabase client with admin privileges
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find all [[link titles]] in the note content
    const linkRegex = /\[\[(.*?)\]\]/g
    const linkTitles = []
    let match
    
    while ((match = linkRegex.exec(note.content)) !== null) {
      linkTitles.push(match[1].trim())
    }

    console.log(`Found ${linkTitles.length} link titles in note: ${note.id}`)

    // If no links found, just delete existing links
    if (linkTitles.length === 0) {
      const { error: deleteError } = await supabase
        .from('note_links')
        .delete()
        .eq('source_note_id', note.id)

      if (deleteError) throw deleteError

      return new Response(
        JSON.stringify({ message: 'No links found. Cleared existing links.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find the note IDs for these titles
    const { data: targetNotes, error: notesError } = await supabase
      .from('notes')
      .select('id, title')
      .eq('user_id', note.user_id)
      .in('title', linkTitles)

    if (notesError) throw notesError

    console.log(`Found ${targetNotes?.length || 0} matching notes for the links`)

    // Prepare the new links
    const newLinks = (targetNotes || []).map(targetNote => ({
      source_note_id: note.id,
      target_note_id: targetNote.id,
      user_id: note.user_id,
    }))

    // Delete existing links for this note
    const { error: deleteError } = await supabase
      .from('note_links')
      .delete()
      .eq('source_note_id', note.id)

    if (deleteError) throw deleteError

    // Insert new links if any were found
    if (newLinks.length > 0) {
      const { error: insertError } = await supabase
        .from('note_links')
        .insert(newLinks)

      if (insertError) throw insertError
    }

    return new Response(
      JSON.stringify({ 
        message: `Successfully processed ${newLinks.length} links`,
        links: newLinks 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing note links:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})