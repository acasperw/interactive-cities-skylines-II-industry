import Dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";

export const NODE_WIDTH = 170;
export const NODE_HEIGHT = 44;

/**
 * Runs a top-to-bottom layered layout so raw resources sit near the top and
 * downstream goods flow toward the bottom, mirroring the game chart.
 *
 * After dagre runs, every raw resource is snapped onto a single shared top row
 * and evenly spaced, so all extraction resources line up regardless of how deep
 * their only consumer sits.
 */
export function layout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 45, ranksep: 110 });

  nodes.forEach((n) =>
    g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  );
  edges.forEach((e) => g.setEdge(e.source, e.target));

  Dagre.layout(g);

  const positioned = nodes.map((n) => {
    const { x, y } = g.node(n.id);
    return {
      ...n,
      // dagre positions are centers; React Flow expects top-left.
      position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 },
    };
  });

  alignRawRow(positioned);
  return positioned;
}

/** Snaps all raw-resource nodes onto one evenly spaced top row. */
function alignRawRow(nodes: Node[]): void {
  const raws = nodes.filter((n) => n.data?.category === "raw");
  if (raws.length === 0) return;

  const xs = nodes.map((n) => n.position.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const topY = Math.min(...nodes.map((n) => n.position.y));

  raws.sort((a, b) => a.position.x - b.position.x);

  const minStep = NODE_WIDTH + 40;
  const step = Math.max((maxX - minX) / Math.max(raws.length - 1, 1), minStep);
  const totalWidth = step * (raws.length - 1);
  const center = (minX + maxX) / 2;
  const startX = center - totalWidth / 2;

  raws.forEach((n, i) => {
    n.position = { x: startX + i * step, y: topY };
  });
}

/**
 * Given a node id, returns every node connected to it by following edges both
 * upstream (what it's made from, recursively) and downstream (what it feeds).
 */
export function connectedNodeIds(edges: Edge[], startId: string): Set<string> {
  const upstream = new Map<string, string[]>();
  const downstream = new Map<string, string[]>();

  for (const e of edges) {
    (downstream.get(e.source) ?? downstream.set(e.source, []).get(e.source)!).push(
      e.target
    );
    (upstream.get(e.target) ?? upstream.set(e.target, []).get(e.target)!).push(
      e.source
    );
  }

  const result = new Set<string>([startId]);

  const walk = (id: string, map: Map<string, string[]>) => {
    for (const next of map.get(id) ?? []) {
      if (!result.has(next)) {
        result.add(next);
        walk(next, map);
      }
    }
  };

  walk(startId, upstream);
  walk(startId, downstream);
  return result;
}
