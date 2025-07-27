"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Target } from "lucide-react";
import { FaRobot } from "react-icons/fa";
import { useAuthGuard } from '@/hooks/useAuthGuard';
import GraphView from '@/components/GraphView';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Define types for our graph data
interface GraphNode {
  id: string;
  name: string;
  [key: string]: any;
}

interface GraphLink {
  source: string;
  target: string;
  [key: string]: any;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export default function GraphPage() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useUser();
  
  useAuthGuard();
  
  // Fetch graph data client-side
  useEffect(() => {
    async function fetchGraphData() {
      const supabase = createClientComponentClient();
      
      try {
        const [notesRes, linksRes] = await Promise.all([
          supabase.from('notes').select('id, title'),
          supabase.from('note_links').select('source_note_id, target_note_id')
        ]);
        
        // Transform the data to match the expected GraphData format
        const nodes: GraphNode[] = (notesRes.data || []).map((note: any) => ({
          id: note.id,
          name: note.title
        }));
        
        const links: GraphLink[] = (linksRes.data || []).map((link: any) => ({
          source: link.source_note_id,
          target: link.target_note_id
        }));
        
        setGraphData({
          nodes,
          links
        });
      } catch (error) {
        console.error('Error fetching graph data:', error);
        setGraphData({ nodes: [], links: [] });
      } finally {
        setLoading(false);
      }
    }
    
    fetchGraphData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Image src="/neo.png" alt="Nerofea Logo" width={32} height={32} />
            <span className="text-xl font-bold text-gray-900">Knowledge Graph</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push("/ai-features")}
            className="flex items-center gap-2"
          >
            <FaRobot className="w-4 h-4" />
            AI Features
          </Button>
          <Button 
            className="bg-gradient-to-r from-indigo-500 to-blue-400 text-white hover:from-indigo-600 hover:to-blue-500 flex items-center gap-2"
            onClick={() => router.push("/grind")}
          >
            <Target className="w-4 h-4" />
            Grind
          </Button>
        </div>
      </header>

      {/* Graph Content */}
      <main className="h-[calc(100vh-80px)] w-full">
        <div className="h-full w-full bg-white" onClick={e => e.stopPropagation()}>
          <div className="bg-white border-b border-gray-200 p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Knowledge Graph</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Interactive visualization of your topics and notes. Click on nodes to explore!
                </p>
              </div>
            </div>
          </div>
          <div className="h-[calc(100%-80px)] w-full" onClick={e => e.stopPropagation()}>
            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-gray-500">Loading graph data...</div>
              </div>
            ) : (
              <GraphView initialData={graphData} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
