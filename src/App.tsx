import { useCallback, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Edge,
  NodeTypes,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { MachineNode } from "./components/MachineNode";
import { Sidebar } from "./components/Sidebar";
import { Inspector } from "./components/Inspector";
import { PanelLeft, PanelRight } from "lucide-react";
import { AppNode, MachineData } from "./types/factory";
import { CreateMachineModal } from "./components/CreateMachineModal";
import { createMachine } from "./api/MachineApi";
import { CreateRecipeModal } from "./components/CreateRecipeModal";
import { CreateItemModal } from "./components/CreateItemModal";
import { useCanvasInteractions } from "./hooks/useCanvasInteractions";

const nodeTypes: NodeTypes = { machine: MachineNode };

function PlaygroundCanvas() {
  const [nodes, setNodes] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<AppNode | null>(null);
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightVisible, setRightVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const handleCreateMachine = (data: {
    name: string;
    multiplier: number;
    image: File | null;
  }) => {
    createMachine({
      name: data.name,
      crafting_speed_multiplier: data.multiplier,
      image: data.image,
    });

    setSidebarRefresh((prev) => prev + 1);
  };

  const onUpdateNode = useCallback(
    (id: string, newData: Partial<MachineData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return { ...node, data: { ...node.data, ...newData } };
          }
          return node;
        }),
      );

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

  const { onNodesChange, onConnect, onDrop } = useCanvasInteractions({
    nodes,
    setNodes,
    setEdges,
    setSelectedNode,
    screenToFlowPosition,
  });

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-300 overflow-hidden font-sans">
      <Sidebar
        visible={leftVisible}
        onClose={() => setLeftVisible(false)}
        onCreate={() => setIsModalOpen(true)}
        onAddItem={() => setIsItemModalOpen(true)}
        onDragStart={(e, type, machineId) => {
          e.dataTransfer.setData("application/reactflow", type);
          e.dataTransfer.setData("application/machine-id", machineId);
          e.dataTransfer.effectAllowed = "move";
        }}
        refreshKey={sidebarRefresh}
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
        onUpdateNode={onUpdateNode}
        onAddRecipe={() => setIsRecipeModalOpen(true)}
      />

      <CreateMachineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateMachine}
      />

      <CreateRecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        initialMachineId={selectedNode?.data.machine_id}
        onQuickAddItem={() => setIsItemModalOpen(true)}
      />

      <CreateItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onItemCreated={() => {
          setSidebarRefresh((prev) => prev + 1);
        }}
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
