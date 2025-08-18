
import { useCallback, useState } from 'react';
import { 
  ReactFlow, 
  addEdge, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  Connection,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

const initialNodes = [
  // Auth Flow - Neutral blue-gray
  {
    id: 'auth-1',
    type: 'input',
    position: { x: 50, y: 50 },
    data: { label: '🔐 Authentication' },
    style: { background: '#f8fafc', border: '2px solid #64748b', color: '#334155' }
  },
  {
    id: 'auth-2',
    position: { x: 250, y: 50 },
    data: { label: '👤 Profile Creation' },
    style: { background: '#f1f5f9', border: '2px solid #64748b', color: '#334155' }
  },

  // Referral Flow - Muted amber
  {
    id: 'referral-1',
    position: { x: 50, y: 180 },
    data: { label: '🎫 Referral Codes' },
    style: { background: '#fefce8', border: '2px solid #a3a3a3', color: '#525252' }
  },
  {
    id: 'referral-2',
    position: { x: 250, y: 180 },
    data: { label: '🔗 User Referrals' },
    style: { background: '#fefce8', border: '2px solid #a3a3a3', color: '#525252' }
  },

  // Content Flow - Soft purple-gray
  {
    id: 'content-1',
    position: { x: 450, y: 50 },
    data: { label: '💭 Thoughts' },
    style: { background: '#faf7ff', border: '2px solid #9ca3af', color: '#374151' }
  },
  {
    id: 'content-2',
    position: { x: 650, y: 50 },
    data: { label: '🎤 Voice Responses' },
    style: { background: '#faf7ff', border: '2px solid #9ca3af', color: '#374151' }
  },
  {
    id: 'content-3',
    position: { x: 850, y: 50 },
    data: { label: '🗳️ User Votes' },
    style: { background: '#faf7ff', border: '2px solid #9ca3af', color: '#374151' }
  },

  // Admin Flow - Soft red-gray
  {
    id: 'admin-1',
    position: { x: 450, y: 180 },
    data: { label: '👨‍💼 User Roles' },
    style: { background: '#fef2f2', border: '2px solid #9ca3af', color: '#374151' }
  },
  {
    id: 'admin-2',
    position: { x: 650, y: 180 },
    data: { label: '📊 Admin Panel' },
    style: { background: '#fef2f2', border: '2px solid #9ca3af', color: '#374151' }
  },

  // Membership Flow - Soft green-gray
  {
    id: 'membership-1',
    position: { x: 850, y: 180 },
    data: { label: '💎 Membership Plans' },
    style: { background: '#f7fdf7', border: '2px solid #9ca3af', color: '#374151' }
  },
  {
    id: 'membership-2',
    position: { x: 1050, y: 180 },
    data: { label: '👥 Subscribers' },
    style: { background: '#f7fdf7', border: '2px solid #9ca3af', color: '#374151' }
  },

  // Storage - Neutral gray
  {
    id: 'storage-1',
    position: { x: 450, y: 310 },
    data: { label: '🗄️ Voice Storage' },
    style: { background: '#f9fafb', border: '2px solid #6b7280', color: '#374151' }
  }
];

const initialEdges = [
  // Auth Flow
  { id: 'e1', source: 'auth-1', target: 'auth-2', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#64748b' } },
  { id: 'e2', source: 'auth-2', target: 'content-1', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#64748b' } },

  // Referral Flow
  { id: 'e3', source: 'auth-1', target: 'referral-1', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#a3a3a3' } },
  { id: 'e4', source: 'referral-1', target: 'referral-2', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#a3a3a3' } },
  { id: 'e5', source: 'referral-2', target: 'auth-2', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#a3a3a3' } },

  // Content Flow
  { id: 'e6', source: 'content-1', target: 'content-2', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#9ca3af' } },
  { id: 'e7', source: 'content-2', target: 'content-3', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#9ca3af' } },
  { id: 'e8', source: 'content-2', target: 'storage-1', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#6b7280' } },

  // Admin Flow
  { id: 'e9', source: 'auth-2', target: 'admin-1', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#9ca3af' } },
  { id: 'e10', source: 'admin-1', target: 'admin-2', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#9ca3af' } },

  // Membership Flow
  { id: 'e11', source: 'admin-2', target: 'membership-1', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#9ca3af' } },
  { id: 'e12', source: 'membership-1', target: 'membership-2', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#9ca3af' } }
];

export default function SystemFlow() {
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [highlightPath, setHighlightPath] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const highlightPathNodes = (path: string) => {
    setHighlightPath(path);
    
    const pathColors = {
      auth: '#64748b',
      referrals: '#a3a3a3',
      content: '#9ca3af',
      memberships: '#9ca3af'
    };

    const pathNodeIds = {
      auth: ['auth-1', 'auth-2'],
      referrals: ['referral-1', 'referral-2', 'auth-1', 'auth-2'],
      content: ['content-1', 'content-2', 'content-3', 'storage-1', 'auth-2'],
      memberships: ['membership-1', 'membership-2', 'admin-2', 'admin-1', 'auth-2']
    };

    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        style: {
          ...node.style,
          boxShadow: pathNodeIds[path as keyof typeof pathNodeIds]?.includes(node.id)
            ? `0 0 8px ${pathColors[path as keyof typeof pathColors]}`
            : 'none'
        }
      }))
    );
  };

  const clearHighlight = () => {
    setHighlightPath(null);
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        style: {
          ...node.style,
          boxShadow: 'none'
        }
      }))
    );
  };

  return (
    <>
      <Helmet>
        <title>System Flow - Woices Architecture</title>
        <meta name="description" content="Interactive visualization of the Woices application architecture and data flow" />
      </Helmet>
      
      <div className="h-screen w-full relative">
        <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap">
          <Button onClick={() => navigate('/')} variant="outline" size="sm">
            ← Back to App
          </Button>
          <Button onClick={() => navigate('/admin')} variant="outline" size="sm">
            Admin Panel
          </Button>
        </div>

        <div className="absolute top-4 right-4 z-10 flex gap-2 flex-wrap">
          <Badge 
            variant={highlightPath === 'auth' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => highlightPath === 'auth' ? clearHighlight() : highlightPathNodes('auth')}
          >
            🔐 Auth Flow
          </Badge>
          <Badge 
            variant={highlightPath === 'referrals' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => highlightPath === 'referrals' ? clearHighlight() : highlightPathNodes('referrals')}
          >
            🎫 Referrals
          </Badge>
          <Badge 
            variant={highlightPath === 'content' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => highlightPath === 'content' ? clearHighlight() : highlightPathNodes('content')}
          >
            💭 Content
          </Badge>
          <Badge 
            variant={highlightPath === 'memberships' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => highlightPath === 'memberships' ? clearHighlight() : highlightPathNodes('memberships')}
          >
            💎 Memberships
          </Badge>
          <Button variant="ghost" size="sm" onClick={clearHighlight}>
            Clear
          </Button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#e2e8f0" />
          <Controls />
          <MiniMap nodeColor="#f1f5f9" maskColor="rgba(240, 240, 240, 0.6)" />
        </ReactFlow>
      </div>
    </>
  );
}
