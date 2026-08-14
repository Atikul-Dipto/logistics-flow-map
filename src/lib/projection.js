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
// this scale (a handful of small, already-simplified polygons).
function ringToPath(ring, projection) {
  const points = ring.map(([lon, lat]) => projection([lon, lat])).filter(Boolean)
  if (!points.length) return ''
  return `M${points.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join('L')}Z`
}

export function geometryToPath(geometry, projection) {
  if (!geometry) return ''
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map((ring) => ringToPath(ring, projection)).join(' ')
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map((poly) => poly.map((ring) => ringToPath(ring, projection)).join(' ')).join(' ')
  }
  return ''
}
