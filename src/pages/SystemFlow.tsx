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
  Edge,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

const initialNodes = [
  // Auth Flow
  {
    id: 'auth-1',
    type: 'input',
    position: { x: 50, y: 50 },
    data: { label: '🔐 Authentication' },
    style: { background: '#e3f2fd', border: '2px solid #1976d2' }
  },
  {
    id: 'auth-2',
    position: { x: 250, y: 50 },
    data: { label: '👤 Profile Creation' },
    style: { background: '#e8f5e8', border: '2px solid #388e3c' }
  },

  // Referral Flow
  {
    id: 'referral-1',
    position: { x: 50, y: 180 },
    data: { label: '🎫 Referral Codes' },
    style: { background: '#fff3e0', border: '2px solid #f57c00' }
  },
  {
    id: 'referral-2',
    position: { x: 250, y: 180 },
    data: { label: '🔗 User Referrals' },
    style: { background: '#fff3e0', border: '2px solid #f57c00' }
  },

  // Content Flow
  {
    id: 'content-1',
    position: { x: 450, y: 50 },
    data: { label: '💭 Thoughts' },
    style: { background: '#f3e5f5', border: '2px solid #7b1fa2' }
  },
  {
    id: 'content-2',
    position: { x: 650, y: 50 },
    data: { label: '🎤 Voice Responses' },
    style: { background: '#f3e5f5', border: '2px solid #7b1fa2' }
  },
  {
    id: 'content-3',
    position: { x: 850, y: 50 },
    data: { label: '🗳️ User Votes' },
    style: { background: '#f3e5f5', border: '2px solid #7b1fa2' }
  },

  // Admin Flow
  {
    id: 'admin-1',
    position: { x: 450, y: 180 },
    data: { label: '👨‍💼 User Roles' },
    style: { background: '#ffebee', border: '2px solid #d32f2f' }
  },
  {
    id: 'admin-2',
    position: { x: 650, y: 180 },
    data: { label: '📊 Admin Panel' },
    style: { background: '#ffebee', border: '2px solid #d32f2f' }
  },

  // Membership Flow
  {
    id: 'membership-1',
    position: { x: 850, y: 180 },
    data: { label: '💎 Membership Plans' },
    style: { background: '#f1f8e9', border: '2px solid #689f38' }
  },
  {
    id: 'membership-2',
    position: { x: 1050, y: 180 },
    data: { label: '👥 Subscribers' },
    style: { background: '#f1f8e9', border: '2px solid #689f38' }
  },

  // Storage
  {
    id: 'storage-1',
    position: { x: 450, y: 310 },
    data: { label: '🗄️ Voice Storage' },
    style: { background: '#fafafa', border: '2px solid #616161' }
  }
];

const initialEdges = [
  // Auth Flow
  { id: 'e1', source: 'auth-1', target: 'auth-2', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2', source: 'auth-2', target: 'content-1', markerEnd: { type: MarkerType.ArrowClosed } },

  // Referral Flow
  { id: 'e3', source: 'auth-1', target: 'referral-1', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e4', source: 'referral-1', target: 'referral-2', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e5', source: 'referral-2', target: 'auth-2', markerEnd: { type: MarkerType.ArrowClosed } },

  // Content Flow
  { id: 'e6', source: 'content-1', target: 'content-2', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e7', source: 'content-2', target: 'content-3', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e8', source: 'content-2', target: 'storage-1', markerEnd: { type: MarkerType.ArrowClosed } },

  // Admin Flow
  { id: 'e9', source: 'auth-2', target: 'admin-1', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e10', source: 'admin-1', target: 'admin-2', markerEnd: { type: MarkerType.ArrowClosed } },

  // Membership Flow
  { id: 'e11', source: 'admin-2', target: 'membership-1', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e12', source: 'membership-1', target: 'membership-2', markerEnd: { type: MarkerType.ArrowClosed } }
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
      auth: '#1976d2',
      referrals: '#f57c00',
      content: '#7b1fa2',
      memberships: '#689f38'
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
            ? `0 0 10px ${pathColors[path as keyof typeof pathColors]}`
            : 'none',
          transform: pathNodeIds[path as keyof typeof pathNodeIds]?.includes(node.id)
            ? 'scale(1.1)'
            : 'scale(1)',
          transition: 'all 0.3s ease'
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
          boxShadow: 'none',
          transform: 'scale(1)',
          transition: 'all 0.3s ease'
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
            className="cursor-pointer hover:bg-blue-100"
            onClick={() => highlightPath === 'auth' ? clearHighlight() : highlightPathNodes('auth')}
          >
            🔐 Auth Flow
          </Badge>
          <Badge 
            variant={highlightPath === 'referrals' ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-orange-100"
            onClick={() => highlightPath === 'referrals' ? clearHighlight() : highlightPathNodes('referrals')}
          >
            🎫 Referrals
          </Badge>
          <Badge 
            variant={highlightPath === 'content' ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-purple-100"
            onClick={() => highlightPath === 'content' ? clearHighlight() : highlightPathNodes('content')}
          >
            💭 Content
          </Badge>
          <Badge 
            variant={highlightPath === 'memberships' ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-green-100"
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
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </>
  );
}