// Minimal DBSCAN over 2D screen points. Run periodically (not per
// animation frame) against the current in-flight particle positions
// to surface where movement is currently concentrated -- density,
// not just raw count, so a handful of particles crossing paths
// doesn't read as a "hotspot."
export function dbscan(points, epsilon, minPts) {
  const n = points.length
  const labels = new Array(n).fill(0) // 0 = unvisited, -1 = noise, >0 = cluster id
  let clusterId = 0

  const neighborsOf = (i) => {
    const out = []
    for (let j = 0; j < n; j++) {
      if (i === j) continue
      const dx = points[i].x - points[j].x
      const dy = points[i].y - points[j].y
      if (dx * dx + dy * dy <= epsilon * epsilon) out.push(j)
    }
    return out
  }

  for (let i = 0; i < n; i++) {
    if (labels[i] !== 0) continue
    const neighbors = neighborsOf(i)
    if (neighbors.length < minPts) {
      labels[i] = -1
      continue
    }
    clusterId += 1
    labels[i] = clusterId
    const queue = [...neighbors]
    while (queue.length) {
      const j = queue.pop()
      if (labels[j] === -1) labels[j] = clusterId
      if (labels[j] !== 0) continue
      labels[j] = clusterId
      const jNeighbors = neighborsOf(j)
      if (jNeighbors.length >= minPts) queue.push(...jNeighbors)
    }
  }

  const clusters = []
  for (let id = 1; id <= clusterId; id++) {
    const members = points.filter((_, i) => labels[i] === id)
    const cx = members.reduce((s, p) => s + p.x, 0) / members.length
    const cy = members.reduce((s, p) => s + p.y, 0) / members.length
    clusters.push({ id, size: members.length, x: cx, y: cy })
  }
  return clusters.sort((a, b) => b.size - a.size)
}
