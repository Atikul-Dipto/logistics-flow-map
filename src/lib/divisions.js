// Hub `region` values (from flow_data.json, same 10 regions as the
// logistics-portal shipments dataset) -> the 8 official divisions in
// bd_divisions.geojson. Comilla and Narayanganj are districts, not
// divisions, so their stats roll up into their parent division for
// map purposes -- same mapping used on the Streamlit choropleth.
export const DIVISION_MAP = {
  Dhaka: 'Dhaka',
  Chattogram: 'Chattogram',
  Sylhet: 'Sylhet',
  Khulna: 'Khulna',
  Rajshahi: 'Rajshahi',
  Barisal: 'Barishal',
  Rangpur: 'Rangpur',
  Mymensingh: 'Mymensingh',
  Comilla: 'Chattogram',
  Narayanganj: 'Dhaka',
}
