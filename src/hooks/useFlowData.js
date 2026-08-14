import { useEffect, useState } from 'react'

// The network graph (nodes/edges) + division boundaries -- extracted
// out of App.jsx so any page can use it, not just Command Center.
export function useFlowData() {
  const [data, setData] = useState(null)
  const [geojson, setGeojson] = useState(null)

  useEffect(() => {
    const base = import.meta.env.BASE_URL
    Promise.all([
      fetch(`${base}data/flow_data.json`).then((r) => r.json()),
      fetch(`${base}data/bd_divisions.geojson`).then((r) => r.json()),
    ]).then(([flow, geo]) => {
      setData(flow)
      setGeojson(geo)
    })
  }, [])

  return { data, geojson, loading: !data || !geojson }
}
