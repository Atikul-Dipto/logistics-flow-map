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

export function Dashboard(props) {
  return (
    <IconBase title="Dashboard" {...props}>
      <rect x="8" y="8" width="48" height="48" rx="7" />
      <path d="M8 24h48M24 24v32" />
      <path d="M31 33h17v15H31z" />
    </IconBase>
  )
}

export function Orders(props) {
  return (
    <IconBase title="Orders" {...props}>
      <rect x="12" y="8" width="34" height="48" rx="4" />
      <path d="M20 19h18M20 29h18M20 39h10" />
      <path d="m46 38 4 4 7-9" />
    </IconBase>
  )
}

export function Pickup(props) {
  return (
    <IconBase title="Pickup" {...props}>
      <path d="M10 20h34v28H10z" />
      <path d="M44 30h9l5 6v12H44" />
      <path d="M20 13v14M14 19l6-6 6 6" />
      <circle cx="19" cy="51" r="4" />
      <circle cx="49" cy="51" r="4" />
    </IconBase>
  )
}

export function Sorting(props) {
  return (
    <IconBase title="Sorting" {...props}>
      <path d="M8 38h48M8 48h48" />
      <path d="M14 38V22h8v16M28 38V16h8v22M42 38V25h8v13" />
      <path d="m20 10 4 4-4 4M36 10l4 4-4 4" />
    </IconBase>
  )
}

export function Transfer(props) {
  return (
    <IconBase title="Transfer" {...props}>
      <circle cx="14" cy="20" r="6" />
      <circle cx="50" cy="44" r="6" />
      <path d="M20 20h22l-5-5M44 44H22l5 5" />
    </IconBase>
  )
}

export function Riders(props) {
  return (
    <IconBase title="Riders" {...props}>
      <circle cx="32" cy="14" r="6" />
      <path d="M25 26h14l5 18H20z" />
      <path d="M25 31 14 42M39 31l11 11M20 44l-6 8M44 44l6 8" />
    </IconBase>
  )
}

export function Vehicle(props) {
  return (
    <IconBase title="Vehicle" {...props}>
      <path d="M9 24h31v23H9zM40 31h11l6 8v8H40z" />
      <circle cx="18" cy="50" r="5" />
      <circle cx="48" cy="50" r="5" />
    </IconBase>
  )
}

export function Truck(props) {
  return (
    <IconBase title="Truck" {...props}>
      <path d="M7 22h34v25H7zM41 30h11l6 8v9H41z" />
      <circle cx="18" cy="51" r="5" />
      <circle cx="48" cy="51" r="5" />
      <path d="M13 16h20v6H13z" />
    </IconBase>
  )
}

export function Delivery(props) {
  return (
    <IconBase title="Delivery" {...props}>
      <path d="M13 20h28v28H13z" />
      <path d="m23 33 6 6 14-17" />
      <path d="M41 28h10l6 7v13H41" />
    </IconBase>
  )
}

export function Ndr(props) {
  return (
    <IconBase title="NDR" {...props}>
      <path d="M12 8h32l8 8v40H12z" />
      <path d="M44 8v10h8M20 29h24M20 39h17" />
      <path d="M47 38v10M47 53v1" />
    </IconBase>
  )
}

export function Returns(props) {
  return (
    <IconBase title="Returns" {...props}>
      <path d="M18 17h31v30H18z" />
      <path d="M18 25h31" />
      <path d="M11 31H5l7-7M5 31c0 14 10 23 23 23 8 0 15-3 20-9" />
    </IconBase>
  )
}

export function Cod(props) {
  return (
    <IconBase title="COD" {...props}>
      <rect x="8" y="16" width="48" height="32" rx="5" />
      <path d="M18 26h28M18 34h12" />
      <circle cx="45" cy="40" r="5" />
      <path d="M43 40h4" />
    </IconBase>
  )
}

export function Sellers(props) {
  return (
    <IconBase title="Sellers" {...props}>
      <circle cx="32" cy="17" r="7" />
      <path d="M18 52c1-10 7-16 14-16s13 6 14 16" />
      <path d="M12 28h40l-5 10H17z" />
    </IconBase>
  )
}

export function Customers(props) {
  return (
    <IconBase title="Customers" {...props}>
      <circle cx="32" cy="18" r="7" />
      <circle cx="15" cy="27" r="5" />
      <circle cx="49" cy="27" r="5" />
      <path d="M19 52c1-10 7-16 13-16s12 6 13 16M6 50c0-7 4-11 9-11M49 39c5 0 9 4 9 11" />
    </IconBase>
  )
}

export function Geofence(props) {
  return (
    <IconBase title="Network" {...props}>
      <path d="M32 8 52 20v24L32 56 12 44V20z" />
      <circle cx="32" cy="32" r="10" />
      <path d="M32 22v20M22 32h20" />
    </IconBase>
  )
}

export function Settings(props) {
  return (
    <IconBase title="Settings" {...props}>
      <circle cx="32" cy="32" r="8" />
      <path d="M32 8v7M32 49v7M8 32h7M49 32h7M15 15l5 5M44 44l5 5M49 15l-5 5M20 44l-5 5" />
      <circle cx="32" cy="32" r="19" />
    </IconBase>
  )
}

export function Search(props) {
  return (
    <IconBase title="Search" {...props}>
      <circle cx="28" cy="28" r="15" />
      <path d="m39 39 14 14" />
    </IconBase>
  )
}

export function Notifications(props) {
  return (
    <IconBase title="Notifications" {...props}>
      <path d="M18 45h28l-4-7V27a10 10 0 0 0-20 0v11z" />
      <path d="M27 51h10" />
      <path d="M52 17v7M48.5 20.5h7" />
    </IconBase>
  )
}

export function Users(props) {
  return (
    <IconBase title="Profile" {...props}>
      <circle cx="32" cy="19" r="7" />
      <path d="M18 52c1-10 7-16 14-16s13 6 14 16" />
      <path d="M48 20a6 6 0 0 1 7 6 6 6 0 0 1-7 6" />
    </IconBase>
  )
}

export function Sla(props) {
  return (
    <IconBase title="SLA" {...props}>
      <circle cx="32" cy="34" r="19" />
      <path d="M32 22v13l8 5M24 8h16M28 8v5M36 8v5" />
    </IconBase>
  )
}

export function FailedDelivery(props) {
  return (
    <IconBase title="Failed Delivery" {...props}>
      <path d="M8 24h31v23H8zM39 31h10l7 8v8H39z" />
      <circle cx="18" cy="50" r="5" />
      <circle cx="47" cy="50" r="5" />
      <path d="m21 16 14 14M35 16 21 30" />
    </IconBase>
  )
}

export function Exception(props) {
  return (
    <IconBase title="Exception" {...props}>
      <path d="M32 8 58 54H6z" />
      <path d="M32 24v14M32 44v2" />
    </IconBase>
  )
}

export function Escalation(props) {
  return (
    <IconBase title="Escalation" {...props}>
      <path d="M32 8 56 50H8z" />
      <path d="M32 39V23M32 45v1" />
      <path d="M14 12h15" />
    </IconBase>
  )
}

// Hand-authored -- nothing in the provided 73-icon set represents
// "AI," so this sparkle glyph is new artwork in the same visual
// language (viewBox 64, stroke-only, round joins) as the rest.
export function Sparkle(props) {
  return (
    <IconBase title="AI Intelligence" {...props}>
      <path d="M32 6c2 12 8 18 20 20-12 2-18 8-20 20-2-12-8-18-20-20 12-2 18-8 20-20Z" />
      <circle cx="51" cy="13" r="2.6" />
    </IconBase>
  )
}
