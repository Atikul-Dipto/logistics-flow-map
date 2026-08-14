// Weighted-degree centrality: each hub's total throughput (shipments
// in + shipments out) across the current edge set. Simple, but it's
// a real graph-theoretic measure of "how important is this node in
// the network" -- computed once per data load / filter change, not
// per animation frame, since it's a property of the graph itself.
export function computeCentrality(nodes, edges) {
  const throughput = new Map(nodes.map((n) => [n.id, { in: 0, out: 0 }]))

  for (const edge of edges) {
    const src = throughput.get(edge.source)
    const tgt = throughput.get(edge.target)
    if (src) src.out += edge.volume
    if (tgt) tgt.in += edge.volume
  }

  return nodes
    .map((n) => {
      const t = throughput.get(n.id) ?? { in: 0, out: 0 }
      return { ...n, inVolume: t.in, outVolume: t.out, totalVolume: t.in + t.out }
    })
    .filter((n) => n.totalVolume > 0)
    .sort((a, b) => b.totalVolume - a.totalVolume)
}
