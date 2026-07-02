import type { PropertyAmenity } from '@/lib/property/propertyStorefront'

export function PropertyAmenitiesList({ amenities }: { amenities: PropertyAmenity[] }) {
  return (
    <ul className="list-none space-y-0.5 p-0">
      {amenities.map((amenity) => (
        <li key={amenity.id} className="flex items-baseline gap-2 text-[15px] leading-6 text-text-brown md:text-base md:leading-7">
          <span className="shrink-0 text-muted" aria-hidden>
            –
          </span>
          <span>{amenity.name}</span>
        </li>
      ))}
    </ul>
  )
}

export function PropertyAmenitiesSection({ amenities }: { amenities: PropertyAmenity[] }) {
  if (amenities.length === 0) return null

  return (
    <section>
      <h2 className="font-display text-2xl font-extrabold leading-tight text-text-brown md:text-3xl">
        Amenities & features
      </h2>
      <div className="mt-2">
        <PropertyAmenitiesList amenities={amenities} />
      </div>
    </section>
  )
}
