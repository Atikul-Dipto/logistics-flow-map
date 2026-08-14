import { geoMercator } from 'd3-geo'

// Fits a Mercator projection to the division geojson's own bounds, so
// the map always fills the given pixel box regardless of viewport
// size -- same idea as the fitbounds="locations" used on the
// Streamlit choropleth, just computed client-side.
export function createProjection(geojson, width, height, padding = 24) {
  const projection = geoMercator().fitExtent(
    [
      [padding, padding],
      [width - padding, height - padding],
    ],
    geojson,
  )
  return { projection }
}

export function project(projection, lat, lon) {
  const point = projection([lon, lat])
  return point ? { x: point[0], y: point[1] } : { x: 0, y: 0 }
}

// d3-geo's geoPath adaptive resampler produced garbage (a giant
// bogus frame) for a couple of these polygons even though every
// individual vertex projects correctly point-by-point (verified) --
// so build the SVG path string directly instead of going through
// geoPath's stream/resample pipeline, which we don't need anyway at
// this scale (a handful of small, already-simplified polygons). Also
// tracks each ring's pixel bounding box while we're already walking
// every point, so click-to-zoom doesn't need a second pass.
function ringToPathAndBounds(ring, projection, bounds) {
  const points = ring.map(([lon, lat]) => projection([lon, lat])).filter(Boolean)
  if (!points.length) return ''
  for (const [x, y] of points) {
    if (x < bounds.minX) bounds.minX = x
    if (y < bounds.minY) bounds.minY = y
    if (x > bounds.maxX) bounds.maxX = x
    if (y > bounds.maxY) bounds.maxY = y
  }
  return `M${points.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join('L')}Z`
}

// Returns { d, bbox } for a Polygon/MultiPolygon geometry, projected
// to pixel space with the given projection.
export function geometryPathAndBounds(geometry, projection) {
  const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  if (!geometry) return { d: '', bbox: bounds }

  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : []
  const parts = []
  for (const poly of polygons) {
    for (const ring of poly) {
      parts.push(ringToPathAndBounds(ring, projection, bounds))
    }
  }
  return { d: parts.join(' '), bbox: bounds }
}
