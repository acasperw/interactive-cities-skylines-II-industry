import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Category } from "../data/industries";

export interface ItemNodeData {
  label: string;
  category: Category;
  dimmed: boolean;
  selected: boolean;
  [key: string]: unknown;
}

export function ItemNode({ data }: NodeProps) {
  const { label, category, dimmed, selected } = data as ItemNodeData;

  const className = [
    "rf-node",
    `rf-node--${category}`,
    selected ? "rf-node--selected" : "",
    dimmed ? "dimmed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <Handle type="target" position={Position.Top} />
      {label}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
