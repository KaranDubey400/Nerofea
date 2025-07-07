'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/supabaseClient';

export default function TestAPIPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const testGroqAPI = async () => {
    setLoading(true);
    setResult('');
    setError('');

    try {
      console.log('Testing Groq API...');
      const response = await supabase.functions.invoke('groq-chat', {
        body: { message: 'Hello, can you explain what is React in one sentence?' }
      });

      console.log('Groq API Response:', response);

      if (response.error) {
        setError(`Error: ${response.error.message}`);
      } else {
        setResult(response.data?.response || 'No response received');
      }
    } catch (err: any) {
      console.error('Test API Error:', err);
      setError(`Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testTavilyAPI = async () => {
    setLoading(true);
    setResult('');
    setError('');

    try {
      console.log('Testing Tavily API...');
      const response = await supabase.functions.invoke('tavily-search', {
        body: { query: 'React JavaScript framework' }
      });

      console.log('Tavily API Response:', response);

      if (response.error) {
        setError(`Error: ${response.error.message}`);
      } else {
        setResult(response.data?.content || 'No response received');
      }
    } catch (err: any) {
      console.error('Test API Error:', err);
      setError(`Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testHuggingFaceAPI = async () => {
    setLoading(true);
    setResult('');
    setError('');

    try {
      console.log('Testing HuggingFace API...');
      const response = await supabase.functions.invoke('huggingface-generate', {
        body: { prompt: 'Explain React in simple terms:' }
      });

      console.log('HuggingFace API Response:', response);

      if (response.error) {
        setError(`Error: ${response.error.message}`);
      } else {
        setResult(response.data?.generated_text || 'No response received');
      }
    } catch (err: any) {
      console.error('Test API Error:', err);
      setError(`Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">API Test Page</h1>
          <p className="text-gray-600">Test your Supabase Edge Functions and API connectivity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Groq API</CardTitle>
              <CardDescription>Test the Groq chat completion API</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testGroqAPI} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Testing...' : 'Test Groq'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Tavily API</CardTitle>
              <CardDescription>Test the Tavily search API</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testTavilyAPI} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Testing...' : 'Test Tavily'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test HuggingFace API</CardTitle>
              <CardDescription>Test the HuggingFace text generation API</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testHuggingFaceAPI} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Testing...' : 'Test HuggingFace'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {(result || error) && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              {result && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Success:</h3>
                  <Textarea
                    value={result}
                    readOnly
                    className="min-h-[200px] bg-white"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>1. Check Supabase Dashboard:</strong> Go to your Supabase project dashboard and check if Edge Functions are deployed.</p>
            <p><strong>2. Environment Variables:</strong> Make sure GROQ_API_KEY, TAVILY_API_KEY, and HF_API_KEY are set in your Supabase project settings.</p>
            <p><strong>3. Deploy Functions:</strong> Run <code>supabase functions deploy</code> to deploy your Edge Functions.</p>
            <p><strong>4. Check Logs:</strong> View function logs in the Supabase dashboard to see detailed error messages.</p>
            <p><strong>5. API Keys:</strong> Ensure your API keys are valid and have sufficient credits/quota.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 