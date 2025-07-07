import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// react-force-graph-2d ko SSR ke bina load karna zaroori hai
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface GraphNode {
  id: string;
  label?: string;
  type?: string;
  topic_id?: string;
}
interface GraphLink {
  source: string;
  target: string;
}
interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const dummyData: GraphData = {
  nodes: [
    { id: 'Note 1', label: 'Note 1', type: 'note' },
    { id: 'Note 2', label: 'Note 2', type: 'note' },
    { id: 'Folder 1', label: 'Folder 1', type: 'topic' },
    { id: 'Note 3', label: 'Note 3', type: 'note' },
  ],
  links: [
    { source: 'Note 1', target: 'Note 2' },
    { source: 'Folder 1', target: 'Note 1' },
    { source: 'Folder 1', target: 'Note 3' },
  ],
};

interface GraphViewProps {
  graphData?: GraphData;
  onNodeClick?: (node: GraphNode) => void;
}

const GraphView = ({ graphData, onNodeClick }: GraphViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });

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

  const data = graphData || dummyData;

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeAutoColorBy="type"
        nodeLabel="label"
        nodeColor={(node: any) => {
          return node.type === 'topic' ? '#3b82f6' : '#10b981';
        }}
        nodeRelSize={6}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        linkColor={() => '#9ca3af'}
        linkWidth={2}
        nodeCanvasObjectMode={() => 'after'}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = (node.label || node.id) as string;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = '#1f2937';
          const x = typeof node.x === 'number' ? node.x : 0;
          const y = typeof node.y === 'number' ? node.y : 0;
          ctx.fillText(label, x + 10, y + 4);
        }}
        onNodeHover={(node) => {
          if (node) {
            document.body.style.cursor = 'pointer';
          } else {
            document.body.style.cursor = 'default';
          }
        }}
        onBackgroundClick={() => {
          // Background click pe kuch nahi karna, graph stable rakhna
          console.log('Background clicked - graph remains stable');
        }}
        onNodeClick={onNodeClick ? ((node, event) => {
          try {
            if (event) {
              event.stopPropagation();
              event.preventDefault();
            }
            console.log('Node clicked safely:', node);
            onNodeClick(node as GraphNode);
          } catch (error) {
            console.error('Error in node click:', error);
          }
        }) : (() => {
          console.log('No onNodeClick handler defined');
        })}
        cooldownTicks={100}
        linkHoverPrecision={10}
      />
    </div>
  );
};

export default GraphView; 