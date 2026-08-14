// Unified line-icon set (stroke="currentColor", 64x64 viewBox) shared
// with the rest of the project. Verbatim paths from the provided SVG
// set -- only the wrapper is componentized, not the artwork itself.

function IconBase({ title, className = 'icon', children, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
      {...props}
    >
      <title>{title}</title>
      <g fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  )
}

export function Analytics(props) {
  return (
    <IconBase title="Analytics" {...props}>
      <path d="M10 52V12M10 52h44" />
      <path d="M17 43 28 32l8 6 15-20" />
      <path d="M46 18h5v5" />
    </IconBase>
  )
}

export function LiveTracking(props) {
  return (
    <IconBase title="Live Tracking" {...props}>
      <circle cx="32" cy="32" r="22" />
      <path d="M32 10v7M32 47v7M10 32h7M47 32h7" />
      <circle cx="32" cy="32" r="7" />
      <path d="m32 32 10-8" />
    </IconBase>
  )
}

export function Route(props) {
  return (
    <IconBase title="Route" {...props}>
      <circle cx="14" cy="48" r="5" />
      <circle cx="50" cy="16" r="5" />
      <circle cx="36" cy="34" r="5" />
      <path d="M18 45c10-7 8-10 13-12M39 31c7-5 3-11 8-12" />
    </IconBase>
  )
}

export function Hub(props) {
  return (
    <IconBase title="Hub" {...props}>
      <path d="M10 24 32 10l22 14v28H10z" />
      <path d="M20 32h24v20H20zM27 32v20M37 32v20" />
      <path d="M5 52h54" />
    </IconBase>
  )
}

export function Warehouse(props) {
  return (
    <IconBase title="Warehouse" {...props}>
      <path d="M7 25 32 10l25 15v29H7z" />
      <path d="M15 31h34v23H15z" />
      <path d="M21 38h7v7h-7zM36 38h7v7h-7zM21 48h7v6h-7zM36 48h7v6h-7z" />
    </IconBase>
  )
}

export function Shipments(props) {
  return (
    <IconBase title="Shipments" {...props}>
      <path d="M7 22h31v24H7zM38 30h12l7 8v8H38z" />
      <circle cx="18" cy="49" r="5" />
      <circle cx="47" cy="49" r="5" />
      <path d="M38 38h18" />
    </IconBase>
  )
}

export function DeliveryRate(props) {
  return (
    <IconBase title="Delivery Rate" {...props}>
      <circle cx="32" cy="32" r="22" />
      <path d="m21 32 7 7 15-17" />
    </IconBase>
  )
}

export function Cost(props) {
  return (
    <IconBase title="Cost" {...props}>
      <circle cx="32" cy="32" r="22" />
      <path d="M20 24h20M20 32h15M20 40h20" />
      <path d="M45 24v16" />
    </IconBase>
  )
}

export function Trends(props) {
  return (
    <IconBase title="Trends" {...props}>
      <path d="M9 48h46M13 42l10-10 8 7 18-22" />
      <path d="M41 17h8v8" />
    </IconBase>
  )
}

export function Zones(props) {
  return (
    <IconBase title="Zones" {...props}>
      <circle cx="32" cy="32" r="22" />
      <path d="M32 10v44M10 32h44" />
      <circle cx="32" cy="32" r="7" />
    </IconBase>
  )
}

export function Filter(props) {
  return (
    <IconBase title="Filter" {...props}>
      <path d="M9 12h46L38 31v17l-12 5V31z" />
    </IconBase>
  )
}

export function Refresh(props) {
  return (
    <IconBase title="Refresh" {...props}>
      <path d="M52 25a21 21 0 0 0-37-8l-5 7M12 16v9h9M12 39a21 21 0 0 0 37 8l5-7M52 48v-9h-9" />
    </IconBase>
  )
}
