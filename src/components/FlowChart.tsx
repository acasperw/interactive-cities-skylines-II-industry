import { useCallback, useMemo, useState } from "react";
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CATEGORY_COLORS, ITEMS, type Category } from "../data/industries";
import { connectedNodeIds, layout, NODE_HEIGHT, NODE_WIDTH } from "../graph/layout";
import { ItemNode } from "./ItemNode";

const nodeTypes = { item: ItemNode };

const CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(
  ITEMS.map((item) => [item.id, item.category])
);

const DIM_COLOR = "#2a3346";
const ACTIVE_COLOR = "#4aa8ff";

/** Build the base (unstyled) nodes + edges from the data once. */
function buildGraph(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = ITEMS.map((item) => ({
    id: item.id,
    type: "item",
    position: { x: 0, y: 0 },
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    data: {
      label: item.label,
      category: item.category,
      dimmed: false,
      selected: false,
    },
  }));

  const edges: Edge[] = [];
  for (const item of ITEMS) {
    for (const source of item.inputs ?? []) {
      edges.push({
        id: `${source}->${item.id}`,
        source,
        target: item.id,
        // Orthogonal runs with generously rounded corners: a hybrid between
        // straight step edges and full bezier curves.
        type: "smoothstep",
        pathOptions: { borderRadius: 28 },
      });
    }
  }

  return { nodes, edges };
}

export function FlowChart() {
  const base = useMemo(() => {
    const { nodes, edges } = buildGraph();
    return { nodes: layout(nodes, edges), edges };
  }, []);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const highlighted = useMemo(
    () => (selectedId ? connectedNodeIds(base.edges, selectedId) : null),
    [selectedId, base.edges]
  );

  const nodes = useMemo<Node[]>(
    () =>
      base.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          dimmed: highlighted ? !highlighted.has(n.id) : false,
          selected: n.id === selectedId,
        },
      })),
    [base.nodes, highlighted, selectedId]
  );

  const edges = useMemo<Edge[]>(
    () =>
      base.edges.map((e) => {
        const active =
          highlighted?.has(e.source) && highlighted?.has(e.target);
        const dimmed = highlighted && !active;
        // Color each edge by the category of the item it flows FROM, so a chain
        // keeps a consistent color as it moves downstream.
        const sourceColor = CATEGORY_COLORS[CATEGORY_BY_ID[e.source]];
        const stroke = active
          ? ACTIVE_COLOR
          : dimmed
          ? DIM_COLOR
          : sourceColor;
        return {
          ...e,
          animated: !!active,
          style: {
            stroke,
            strokeWidth: active ? 2.5 : 1.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: stroke,
            width: 16,
            height: 16,
          },
        };
      }),
    [base.edges, highlighted]
  );

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    setSelectedId((prev) => (prev === node.id ? null : node.id));
  }, []);

  const onPaneClick = useCallback(() => setSelectedId(null), []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      fitView
      minZoom={0.1}
      nodesConnectable={false}
      edgesReconnectable={false}
      proOptions={{ hideAttribution: true }}
    >
      <Background gap={20} color="#212a3d" />
      <Controls />
      <MiniMap
        pannable
        zoomable
        maskColor="rgba(15,20,32,0.7)"
        nodeColor={(n) => CATEGORY_COLORS[(n.data as { category: Category }).category]}
      />
    </ReactFlow>
  );
}
