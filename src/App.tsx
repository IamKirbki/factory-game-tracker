import { useCallback, useState, useEffect } from "react";
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
  OnConnect,
  NodeTypes,
  ReactFlowProvider,
  useReactFlow,
  applyNodeChanges,
  NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { MachineNode } from "./components/MachineNode";
import { Sidebar } from "./components/Sidebar";
import { Inspector } from "./components/Inspector";
import { snapToNodes } from "./utils/snapUtils";
import { PanelLeft, PanelRight } from "lucide-react";
import { AppNode, MachineData } from "./types/factory";
import { CreateMachineModal } from "./components/CreateMachineModal";

const nodeTypes: NodeTypes = { machine: MachineNode };

function PlaygroundCanvas() {
  const [nodes, setNodes] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<AppNode | null>(null);
  const [clipboard, setClipboard] = useState<AppNode[]>([]);
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightVisible, setRightVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateMachine = (data: {
    name: string;
    multiplier: number;
    image: File | null;
  }) => {
    console.log("User created machine:", data);
    // This is where you will add your logic to save to dummy data or DB
  };

  const onUpdateNode = useCallback(
    (id: string, newData: Partial<MachineData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            // Merge the existing data with the new configuration
            return { ...node, data: { ...node.data, ...newData } };
          }
          return node;
        }),
      );

      // Also update the selectedNode state so the Inspector updates immediately
      setSelectedNode((prev) => {
        if (prev?.id === id) {
          return { ...prev, data: { ...prev.data, ...newData } };
        }
        return prev;
      });
    },
    [setNodes],
  );

  const { screenToFlowPosition } = useReactFlow();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const nextChanges = changes.map((change) => {
        if (change.type === "position" && change.position) {
          return { ...change, position: snapToNodes(change, nodes) };
        }
        return change;
      });
      setNodes((nds) => applyNodeChanges(nextChanges, nds) as AppNode[]);
    },
    [nodes, setNodes],
  );

  const onConnect: OnConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          { ...params, animated: true, style: { stroke: "#fb923c" } },
          eds,
        ),
      ),
    [setEdges],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/reactflow");
      if (!type) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      setNodes((nds) =>
        nds.concat({
          id: `node_${Date.now()}`,
          type: "machine",
          position,
          data: {
            label: type,
            recipe: "Idle",
            speed: 1,
            energy: 5,
            status: "idle",
          },
        }),
      );
    },
    [screenToFlowPosition, setNodes],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        const selected = nodes.filter((n) => n.selected);
        if (selected.length) setClipboard(selected);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        if (!clipboard.length) return;
        const newNodes = clipboard.map((n) => ({
          ...n,
          id: `n_${Date.now()}_${Math.random()}`,
          position: { x: n.position.x + 40, y: n.position.y + 40 },
          selected: true,
        }));
        setNodes((nds) =>
          nds.map((n) => ({ ...n, selected: false })).concat(newNodes),
        );
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        setNodes((nds) => nds.filter((n) => !n.selected));
        setSelectedNode(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes, clipboard, setNodes]);

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-300 overflow-hidden font-sans">
      <Sidebar
        visible={leftVisible}
        onClose={() => setLeftVisible(false)}
        onCreate={() => setIsModalOpen(true)}
        onDragStart={(e, type) => {
          e.dataTransfer.setData("application/reactflow", type);
          e.dataTransfer.effectAllowed = "move";
        }}
      />

      <main className="flex-1 relative flex flex-col">
        {!leftVisible && (
          <button
            onClick={() => setLeftVisible(true)}
            className="absolute left-4 top-4 z-30 p-2 bg-slate-900 border border-slate-700 rounded shadow-xl text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <PanelLeft size={18} />
          </button>
        )}
        {!rightVisible && (
          <button
            onClick={() => setRightVisible(true)}
            className="absolute right-4 top-4 z-30 p-2 bg-slate-900 border border-slate-700 rounded shadow-xl text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <PanelRight size={18} />
          </button>
        )}

        <ReactFlow<AppNode>
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, n) => setSelectedNode(n)}
          onPaneClick={() => setSelectedNode(null)}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          nodeTypes={nodeTypes}
          fitView
          colorMode="dark"
        >
          <Background color="#1e293b" gap={20} />
          <Controls />
          <MiniMap
            nodeStrokeColor="#3b82f6"
            maskColor="rgba(15, 23, 42, 0.7)"
          />
        </ReactFlow>
      </main>

      <Inspector
        visible={rightVisible}
        selectedNode={selectedNode}
        onClose={() => setRightVisible(false)}
        onDelete={(id) => {
          setNodes((nds) => nds.filter((n) => n.id !== id));
          setSelectedNode(null);
        }}
        onUpdateNode={onUpdateNode} // Pass the function here
      />
      <CreateMachineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateMachine}
      />
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
