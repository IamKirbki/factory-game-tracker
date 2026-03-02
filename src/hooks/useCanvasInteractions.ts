import { useCallback, useEffect, useState } from "react";
import {
  addEdge,
  applyNodeChanges,
  Connection,
  Edge,
  NodeChange,
  OnConnect,
  ReactFlowInstance,
} from "@xyflow/react";
import { AppNode } from "../types/factory";
import { snapToNodes } from "../utils/snapUtils";

interface UseCanvasInteractionsParams {
  nodes: AppNode[];
  setNodes: React.Dispatch<React.SetStateAction<AppNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setSelectedNode: React.Dispatch<React.SetStateAction<AppNode | null>>;
  screenToFlowPosition: ReactFlowInstance["screenToFlowPosition"];
}

interface UseCanvasInteractionsResult {
  onNodesChange: (changes: NodeChange[]) => void;
  onConnect: OnConnect;
  onDrop: (event: React.DragEvent) => void;
}

export function useCanvasInteractions({
  nodes,
  setNodes,
  setEdges,
  setSelectedNode,
  screenToFlowPosition,
}: UseCanvasInteractionsParams): UseCanvasInteractionsResult {
  const [clipboard, setClipboard] = useState<AppNode[]>([]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const nextChanges = changes.map((change) => {
        if (change.type === "position" && change.position) {
          return { ...change, position: snapToNodes(change, nodes) };
        }
        return change;
      });

      setNodes((currentNodes) =>
        applyNodeChanges(nextChanges, currentNodes) as AppNode[],
      );
    },
    [nodes, setNodes],
  );

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      setEdges((existingEdges) =>
        addEdge(
          { ...params, animated: true, style: { stroke: "#fb923c" } },
          existingEdges,
        ),
      );
    },
    [setEdges],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const label = event.dataTransfer.getData("application/reactflow");
      const machineId = event.dataTransfer.getData("application/machine-id");

      if (!label) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setNodes((currentNodes) =>
        currentNodes.concat({
          id: `node_${Date.now()}`,
          type: "machine",
          position,
          data: {
            machine_id: machineId,
            label,
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "c") {
        const selected = nodes.filter((node) => node.selected);
        if (selected.length > 0) {
          setClipboard(selected);
        }
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "v") {
        if (clipboard.length === 0) {
          return;
        }

        const pastedNodes = clipboard.map((node) => ({
          ...node,
          id: `n_${Date.now()}_${Math.random()}`,
          position: { x: node.position.x + 40, y: node.position.y + 40 },
          selected: true,
        }));

        setNodes((currentNodes) =>
          currentNodes
            .map((node) => ({ ...node, selected: false }))
            .concat(pastedNodes),
        );
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        setNodes((currentNodes) => currentNodes.filter((node) => !node.selected));
        setSelectedNode(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes, clipboard, setNodes, setSelectedNode]);

  return {
    onNodesChange,
    onConnect,
    onDrop,
  };
}