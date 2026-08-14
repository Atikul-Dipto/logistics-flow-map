# Live Logistics Flow Map

A live, animated visualization of package movement across a Bangladesh
logistics network — built as a companion piece to
[logistics-portal](https://github.com/Atikul-Dipto/logistics-portal), a
Streamlit dashboard over the same synthetic-but-realistic shipment
dataset.

There's no real GPS/tracking feed behind this data, so "live" here
means: a genuinely continuous, client-side animation (canvas +
`requestAnimationFrame`, no backend, no polling) driven by the real
historical lane volumes in the dataset, not a static snapshot and not
random noise.

## What it does

- **Choropleth base map** of Bangladesh's 8 divisions, projected with
  `d3-geo` from a boundary file dissolved down from upazila-level
  open data.
- **Weighted-random particle simulation**: each origin→destination
  lane spawns "in-flight package" dots at a rate proportional to its
  real shipment volume — busier lanes are visibly busier.
- **Live DBSCAN clustering** over current particle positions,
  recomputed every few seconds, surfacing where movement is
  concentrated right now as pulsing hotspot rings.
- **Graph centrality ranking**: each hub's total shipment throughput
  (in + out), a real weighted-degree measure over the current lane
  subgraph, re-ranked live as you filter by carrier.
- Every icon in the UI is one shared line-icon set (`src/icons`), no
  emoji.

## Data

`public/data/flow_data.json` and `bd_divisions.geojson` are exported
once from `logistics-portal/data/` via
`logistics-portal/data/export_flow_data.py` — re-run that script and
copy its output here after regenerating the source dataset.

## Development

```bash
npm install
npm run dev
```

## Deploy

Pushes to `main` build and publish to GitHub Pages via
`.github/workflows/deploy.yml`.
