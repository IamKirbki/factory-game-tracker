import { NodeChange, XYPosition } from '@xyflow/react';
import { AppNode } from '../types/factory';

export function snapToNodes(change: NodeChange, nodes: AppNode[], distance = 5): XYPosition {
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
    vPoints.forEach((p) => { if (Math.abs(p - x) < distance) snapPos.x = p; });
    
    const hPoints = [nY, nY - height, nY + nH, nY + nH - height, nY + nH / 2 - height / 2];
    hPoints.forEach((p) => { if (Math.abs(p - y) < distance) snapPos.y = p; });
  }
  return snapPos;
}