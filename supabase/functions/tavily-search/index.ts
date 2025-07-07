import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Valid search query is required')
    }

    const tavilyApiKey = Deno.env.get('TAVILY_API_KEY')
    if (!tavilyApiKey) {
      throw new Error('TAVILY_API_KEY not configured in environment variables')
    }

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': tavilyApiKey
      },
      body: JSON.stringify({
        query,
        search_depth: 'advanced',
        include_answer: true,
        include_raw_content: false,
        max_results: 5
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Tavily API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    let content = ''
    if (data.answer) {
      content += `**Direct Answer:**\n${data.answer}\n\n`
    }
    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      content += '**Research Sources:**\n\n'
      data.results.forEach((result, index) => {
        content += `**${index + 1}. ${result.title || 'Untitled'}**\n`
        if (result.url) {
          content += `🔗 ${result.url}\n`
        }
        if (result.content) {
          content += `📄 ${result.content.substring(0, 300)}${result.content.length > 300 ? '...' : ''}\n\n`
        }
      })
    } else {
      content += 'No specific sources found for this query.'
    }

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
