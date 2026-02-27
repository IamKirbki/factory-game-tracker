import { Node } from '@xyflow/react';

export interface MachineData extends Record<string, unknown> {
  machine_id: string;
  label: string;
  recipe: string;
  speed: number;
  energy: number;
  status: 'optimal' | 'bottleneck' | 'idle';
}

export type AppNode = Node<MachineData, 'machine'>;