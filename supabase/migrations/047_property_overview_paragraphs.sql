-- Enrich all seeded property overviews with at least two HTML paragraphs

with overview_data (slug, overview) as (
  values
  (
    'marina-view-2br-apartment',
    '<p>Stunning two-bedroom apartment with full marina views, open-plan living, and premium finishes throughout. This bright corner unit features floor-to-ceiling windows, a modern kitchen, and dedicated parking in a well-managed tower.</p><p>Positioned in the heart of Dubai Marina, you are steps from the promenade, dining, and the tram. Offered for annual rent through GW Vacation Homes with transparent fees and coordinated viewings.</p>'
  ),
  (
    'downtown-luxury-3br-penthouse',
    '<p>Exclusive three-bedroom penthouse in Downtown Dubai with uninterrupted Burj Khalifa views and exceptional ceiling heights. The residence includes a private terrace, integrated smart-home controls, and a full concierge building experience.</p><p>Live within walking distance of Dubai Mall, the Opera District, and flagship dining. Presented for sale by GW Vacation Homes with full buyer advisory and handover support.</p>'
  ),
  (
    'jvc-family-villa',
    '<p>Spacious four-bedroom villa with a private garden, generous living areas, and a layout suited to family life. The home offers multiple ensuite bedrooms, a practical kitchen, and quiet street positioning in a mature JVC district.</p><p>Jumeirah Village Circle combines affordability with schools, parks, and retail within minutes. This rental is managed by GW Vacation Homes with clear contract terms and move-in assistance.</p>'
  ),
  (
    'business-bay-executive-studio',
    '<p>Compact executive studio designed for professionals who want a turnkey home close to the metro and canal. The unit is fully furnished with efficient storage, a defined sleeping zone, and a balcony for morning light.</p><p>Business Bay places you near DIFC, major towers, and waterfront cafes. Rent through GW Vacation Homes with gym and pool access included in the building amenities package.</p>'
  ),
  (
    'palm-jumeirah-beach-villa',
    '<p>Signature beachfront villa on Palm Jumeirah with private beach access, infinity pool, and panoramic Gulf views. Six bedrooms, expansive entertaining spaces, and premium finishes define this ultra-rare shoreline residence.</p><p>The Palm offers an iconic lifestyle with five-star hotels, marinas, and exclusivity at every turn. Listed for sale with GW Vacation Homes and available for private accompanied viewings.</p>'
  ),
  (
    'marina-heights-1br-apartment',
    '<p>Modern one-bedroom apartment with marina skyline views and resort-style building amenities. The open layout maximizes natural light, while the fitted kitchen and wardrobe storage suit long-term tenants.</p><p>Ideal for singles or couples seeking a waterfront lifestyle without compromising on connectivity. Marketed for rent by GW Vacation Homes with flexible cheque options and fast inquiry response.</p>'
  ),
  (
    'downtown-boulevard-2br',
    '<p>Elegant two-bedroom apartment steps from Dubai Mall and the Opera District, with a high-floor outlook over the city skyline. Semi-furnished interiors allow you to personalize the space while keeping move-in timelines short.</p><p>Downtown living means world-class retail, dining, and cultural events year-round. This listing is handled by GW Vacation Homes with covered parking and structured rental documentation.</p>'
  ),
  (
    'jvc-townhouse-3br',
    '<p>Three-bedroom townhouse with community pool access, landscaped gardens, and a family-oriented floor plan. A maid room, private patio, and dual parking make daily life practical for growing households.</p><p>JVC remains one of Dubai''s most balanced communities for families seeking space and value. Available to rent through GW Vacation Homes with transparent commission disclosure before signing.</p>'
  ),
  (
    'business-bay-canal-view-2br',
    '<p>Spacious two-bedroom apartment overlooking the canal with a contemporary kitchen, ample storage, and a comfortable primary suite. Fully furnished for immediate occupancy in a vibrant mixed-use district.</p><p>Walking distance to restaurants, offices, and the Business Bay metro link keeps commutes simple. Offered by GW Vacation Homes with canal-facing views and professional tenancy coordination.</p>'
  ),
  (
    'palm-shoreline-4br-villa',
    '<p>Luxury four-bedroom villa on Palm Jumeirah with landscaped garden, staff quarters, and generous indoor-outdoor flow. Premium finishes, multiple living zones, and beach proximity define this upscale family rental.</p><p>Shoreline living combines privacy with access to Palm retail and hospitality destinations. Presented by GW Vacation Homes with beach access and premium community facilities highlighted in the contract pack.</p>'
  ),
  (
    'marina-walk-studio',
    '<p>Affordable studio on Marina Walk with balcony, built-in storage, and community gym access. The efficient layout suits first-time renters and young professionals who want to live on the waterfront.</p><p>Cafes, supermarkets, and the marina promenade are moments from your door. Listed for rent through GW Vacation Homes as a practical starter home with low maintenance requirements.</p>'
  ),
  (
    'downtown-creek-1br',
    '<p>Cozy one-bedroom with partial creek views, hotel-style lobby, and a semi-furnished interior ready for personalization. The building delivers concierge services, valet parking, and a polished arrival experience.</p><p>Downtown Creek positions you between business hubs and leisure destinations with excellent road links. Managed by GW Vacation Homes with premium building credentials and clear availability dates.</p>'
  ),
  (
    'jvc-garden-apartment-2br',
    '<p>Ground-floor two-bedroom apartment with direct garden access in a quiet JVC cluster. Unfurnished layout allows tenants to design their own space while benefiting from pet-friendly community guidelines.</p><p>Parks, supermarkets, and schools sit nearby, making daily errands straightforward for families. This rental is marketed by GW Vacation Homes with community retail and green spaces within walking distance.</p>'
  ),
  (
    'business-bay-office-suite',
    '<p>Fitted office suite with meeting room, reception area, and Grade-A tower credentials. The floor plan supports small teams with visible frontage, structured cabling, and professional building management.</p><p>Metro access and ample parking strengthen appeal for businesses scaling in Business Bay. Leased through GW Vacation Homes with commercial terms documented before handover of keys.</p>'
  ),
  (
    'marina-crown-3br-penthouse',
    '<p>Duplex penthouse with wraparound terrace, panoramic marina views, and private elevator access. A premium smart-home package, double-height living, and four bathrooms elevate everyday comfort.</p><p>Marina Crown is among the district''s most recognizable addresses for high-net-worth tenants. Exclusive rental listing via GW Vacation Homes with bespoke viewing arrangements on request.</p>'
  ),
  (
    'downtown-skyline-2br-apartment',
    '<p>Investment-grade two-bedroom apartment with strong rental yield potential and a semi-furnished interior suited to end users or landlords. City views, quality build, and a sensible service-charge profile support long-term holding.</p><p>Downtown continues to attract global buyers seeking liquidity and lifestyle in one asset. Sold through GW Vacation Homes with a motivated seller and flexible handover timeline.</p>'
  ),
  (
    'marina-gate-3br-duplex',
    '<p>Rare duplex layout with double-height living, marina frontage, and full-length glazing across the main level. Three bedrooms, premium finishes, and an iconic tower address make this a standout owner-occupier or trophy purchase.</p><p>Marina Gate offers direct access to the waterfront walk and Dubai Marina Mall. Listed for sale by GW Vacation Homes with full specification pack and accompanied inspections.</p>'
  ),
  (
    'jvc-corner-villa-5br',
    '<p>Large corner villa with upgraded kitchen, landscaped plot, and five ensuite bedrooms for extended families. The plot is pool-ready and positioned on a quiet frond-style street within District 10.</p><p>JVC corner plots remain in demand for buyers who want villa scale without Palm pricing. Offered by GW Vacation Homes with vacant possession negotiable and design consultation available.</p>'
  ),
  (
    'business-bay-retail-unit',
    '<p>High-footfall retail space on the main boulevard with double frontage, signage rights, and dedicated loading bay. The unit suits F&amp;B, showroom, or service brands seeking visibility in Business Bay.</p><p>Strong daytime traffic from offices and evening demand from residents supports diverse trading formats. Sold through GW Vacation Homes with visibility studies and handover coordination for fit-out teams.</p>'
  ),
  (
    'palm-signature-5br-mansion',
    '<p>Statement five-bedroom mansion on Palm Jumeirah with private cinema, elevator, and bespoke interiors throughout. Ultra-luxury scale, beach proximity, and entertaining terraces define this signature residence.</p><p>Frond living on the Palm remains the benchmark for Dubai prestige property. Exclusive sale mandate with GW Vacation Homes and discreet marketing to qualified buyers only.</p>'
  ),
  (
    'downtown-opera-1br',
    '<p>Boutique one-bedroom overlooking the Dubai Opera district with turnkey furnishing and hotel-managed services available. Compact yet refined, the unit suits investors and owner-occupiers seeking a cultural address.</p><p>Opera District events, fine dining, and Burj Khalifa proximity add daily lifestyle value. Sold by GW Vacation Homes with service-charge transparency and fast SPA preparation.</p>'
  ),
  (
    'marina-quays-4br-townhouse',
    '<p>Waterfront four-bedroom townhouse with private mooring, rooftop lounge, and direct water access—a rare marina typology. Semi-furnished interiors balance flexibility with immediate usability for family buyers.</p><p>Marina Quays combines townhouse privacy with yacht-club adjacency and marina promenade life. Premium sale listing through GW Vacation Homes with mooring rights documented in the transfer pack.</p>'
  ),
  (
    'jvc-plot-for-villa',
    '<p>Freehold residential plot ready for custom villa construction in a established JVC district. Approved G+1 villa design is available on request, accelerating planning for owner-builders and developers.</p><p>District 17 offers strong comparables for bespoke family homes with mature infrastructure already in place. Sold by GW Vacation Homes with plot survey, authority notes, and introduction to approved consultants.</p>'
  ),
  (
    'business-bay-canal-penthouse',
    '<p>Full-floor penthouse with private pool and 360-degree city views in The Opus, Business Bay. Architect-designed interiors, four bedrooms, and statement entertaining zones define this trophy asset.</p><p>Canal and skyline panoramas place this residence among Dubai''s most photographed addresses. Exclusive sale through GW Vacation Homes with optional art-collection staging package for viewings.</p>'
  ),
  (
    'palm-garden-home-3br',
    '<p>Garden home on Palm Jumeirah with tranquil landscaping, community beach access, and a family-oriented three-bedroom layout. Semi-furnished rooms and generous outdoor space suit year-round island living.</p><p>Garden Homes remain popular for families who want Palm prestige with schools and nurseries nearby. Listed for sale by GW Vacation Homes with community facility tour included in every viewing.</p>'
  )
)
update public.products p
set overview = d.overview
from overview_data d
where p.slug = d.slug
  and p.listing_type in ('rent', 'sale');
