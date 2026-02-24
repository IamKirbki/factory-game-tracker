import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Panel,
  OnConnect,
  NodeTypes,
  ReactFlowProvider,
  useReactFlow,
  applyNodeChanges,
  NodeChange,
  XYPosition,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { MachineNode } from './components/MachineNode';
import { Box, Play, Database, Settings, Info, Trash2, Copy } from 'lucide-react';
import { AppNode } from './types/factory';

const nodeTypes: NodeTypes = {
  machine: MachineNode,
};

function snapToNodes(change: NodeChange, nodes: AppNode[], distance = 5): XYPosition {
  if (change.type !== 'position' || !change.position) return { x: 0, y: 0 };

  const node = nodes.find((n) => n.id === change.id);
  if (!node || !node.measured) return change.position;

  const { x, y } = change.position;
  const width = node.measured.width ?? 0;
  const height = node.measured.height ?? 0;

  const snapPos = { x, y };

  for (const n of nodes) {
    if (n.id === node.id || !n.measured) continue;

    const nX = n.position.x;
    const nY = n.position.y;
    const nW = n.measured.width ?? 0;
    const nH = n.measured.height ?? 0;

    const vPoints = [nX, nX - width, nX + nW, nX + nW - width, nX + nW / 2 - width / 2];
    vPoints.forEach((p) => {
      if (Math.abs(p - x) < distance) snapPos.x = p;
    });

    const hPoints = [nY, nY - height, nY + nH, nY + nH - height, nY + nH / 2 - height / 2];
    hPoints.forEach((p) => {
      if (Math.abs(p - y) < distance) snapPos.y = p;
    });
  }

  return snapPos;
}

function PlaygroundCanvas() {
  const [nodes, setNodes] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<AppNode | null>(null);
  const [clipboard, setClipboard] = useState<AppNode[]>([]);
  const { screenToFlowPosition } = useReactFlow();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const nextChanges = changes.map((change) => {
        if (change.type === 'position' && change.position) {
          const snappedPos = snapToNodes(change, nodes);
          return { ...change, position: snappedPos };
        }
        return change;
      });
      setNodes((nds) => applyNodeChanges(nextChanges, nds) as AppNode[]);
    },
    [nodes, setNodes]
  );

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#fb923c' } }, eds)),
    [setEdges]
  );

  const onDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow');
    if (!type) return;
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    setNodes((nds) => nds.concat({
      id: `node_${Date.now()}`, type: 'machine', position,
      data: { label: type, recipe: 'Idle', speed: 1, energy: 5, status: 'idle' },
    }));
  }, [screenToFlowPosition, setNodes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const selected = nodes.filter(n => n.selected);
        if (selected.length) setClipboard(selected);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (!clipboard.length) return;
        const newNodes = clipboard.map(n => ({
          ...n, id: `n_${Date.now()}_${Math.random()}`, position: { x: n.position.x + 40, y: n.position.y + 40 }, selected: true
        }));
        setNodes(nds => nds.map(n => ({ ...n, selected: false })).concat(newNodes));
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        setNodes(nds => nds.filter(n => !n.selected));
        setSelectedNode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, clipboard, setNodes]);

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-300 overflow-hidden font-sans">
      <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col z-10">
        <div className="p-4 border-b border-slate-800 font-bold text-white flex items-center gap-2 text-sm">
          <Database size={16} className="text-blue-500" /> LIBRARY
        </div>
        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          {['Smelter', 'Constructor', 'Assembler', 'Manufacturer'].map(m => (
            <div key={m} draggable onDragStart={(e) => onDragStart(e, m)}
              className="p-3 bg-slate-800 border border-slate-700 rounded-md cursor-grab active:cursor-grabbing hover:border-blue-500 transition-all flex items-center gap-3 group text-sm"
            >
              <Box size={14} className="group-hover:text-blue-400" /> {m}
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 relative">
        <ReactFlow<AppNode>
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect} onNodeClick={(_, n) => setSelectedNode(n)}
          onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
          nodeTypes={nodeTypes} fitView colorMode="dark"
        >
          <Background color="#1e293b" gap={20} />
          <Controls />
          <MiniMap nodeStrokeColor="#3b82f6" maskColor="rgba(15, 23, 42, 0.7)" />
          <Panel position="top-right" className="bg-slate-900 border border-slate-700 p-2 rounded shadow-2xl flex items-center gap-2">
            <button className="p-1 hover:bg-slate-800 rounded text-green-400 cursor-pointer"><Play size={18}/></button>
            <button className="p-1 hover:bg-slate-800 rounded text-slate-400 cursor-pointer"><Settings size={18}/></button>
          </Panel>
        </ReactFlow>
      </main>

      <aside className="w-72 border-l border-slate-800 bg-slate-900 z-10 p-6">
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 font-bold text-white text-sm"><Info size={16} className="text-orange-500" /> INSPECTOR</div>
          {selectedNode && <button onClick={() => setNodes(nds => nds.filter(n => n.id !== selectedNode.id))} className="text-slate-500 hover:text-red-500 cursor-pointer"><Trash2 size={14}/></button>}
        </div>
        {selectedNode ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">{selectedNode.data.label}</h2>
            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-blue-400 font-mono text-xs text-center">{selectedNode.data.recipe}</div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Speed</p>
                <p className="font-bold">{selectedNode.data.speed}x</p>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Power</p>
                <p className="font-bold">{selectedNode.data.energy}MW</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-600 mt-20 italic text-sm">
            <Copy size={32} className="mx-auto mb-4 opacity-10" />
            Drag items to canvas
          </div>
        )}
      </aside>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <PlaygroundCanvas />
    </ReactFlowProvider>
  );
}