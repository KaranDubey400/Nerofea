'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

// react-force-graph-2d ko SSR ke bina load karna zaroori hai
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

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

interface GraphViewProps {
  initialData?: GraphData;
}

export default function GraphView({ initialData }: GraphViewProps) {
  // Use the app store instead of local state
  const {
    fetchNotes,
    fetchLinks,
    getGraphData,
    notesLoading,
    linksLoading
  } = useAppStore();
  
  const [graphData, setGraphData] = useState<GraphData>(initialData || { nodes: [], links: [] });
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });

  // Handle resize
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch data from the store if no initial data provided
  useEffect(() => {
    if (!initialData || (initialData.nodes.length === 0 && initialData.links.length === 0)) {
      const loadData = async () => {
        console.log("Loading graph data from store...");
        
        // Fetch notes and links if they're not already in the store
        await Promise.all([
          fetchNotes(),
          fetchLinks()
        ]);
        
        // Get the formatted graph data from the store
        const data = getGraphData();
        console.log("Graph data from store:", data);
        
        setGraphData(data);
      };

      loadData();
    }
  }, [fetchNotes, fetchLinks, getGraphData, initialData]);
  
  // Loading state
  const isLoading = notesLoading || linksLoading;
  if (isLoading && (!initialData || (initialData.nodes.length === 0 && initialData.links.length === 0))) {
    return <div className="flex items-center justify-center h-full text-white">Loading Graph...</div>;
  }
  
  // Empty state
  if (!graphData.nodes.length) {
     return <div className="flex items-center justify-center h-full text-white">No notes found to build graph.</div>;
  }

  // Handle node click
  const handleNodeClick = (node: any) => {
    router.push(`/dashboard/notes/${node.id}`);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel="name"
        nodeAutoColorBy="name"
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkColor={() => 'rgba(100,100,100,0.6)'}
        nodeRelSize={6}
        onNodeClick={handleNodeClick}
        onNodeHover={(node: any) => {
          if (typeof window !== 'undefined') {
            document.body.style.cursor = node ? 'pointer' : 'default';
          }
        }}
        nodeCanvasObjectMode={() => 'after'}
        nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
          const label = node.name || node.id;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = '#ffffff';
          const x = typeof node.x === 'number' ? node.x : 0;
          const y = typeof node.y === 'number' ? node.y : 0;
          ctx.fillText(label, x + 10, y + 4);
        }}
      />
    </div>
  );
}