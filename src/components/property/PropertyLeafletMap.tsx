import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { cn } from '@/lib/utils'
import 'leaflet/dist/leaflet.css'

const propertyMarkerIcon = L.divIcon({
  className: '',
  html: '<div style="width:28px;height:28px;border-radius:9999px;background:#8b5a2b;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

function MapResizeHelper() {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    const observer = new ResizeObserver(() => {
      map.invalidateSize()
    })
    observer.observe(container)
    map.invalidateSize()
    return () => observer.disconnect()
  }, [map])

  return null
}

type PropertyLeafletMapProps = {
  lat: number
  lng: number
  title: string
  zoom?: number
  className?: string
}

export function PropertyLeafletMap({ lat, lng, title, zoom = 14, className }: PropertyLeafletMapProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      className={cn('h-full w-full', className)}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={propertyMarkerIcon} title={title} />
      <MapResizeHelper />
    </MapContainer>
  )
}
