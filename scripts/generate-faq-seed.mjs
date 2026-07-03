#!/usr/bin/env node
/**
 * Generates supabase/seeds/faq_seed.sql — 150 Dubai real-estate FAQs with internal links.
 * Run: node scripts/generate-faq-seed.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, '..', 'supabase', 'seeds', 'faq_seed.sql')

const L = {
  rentals: '<a href="/collection/rentals">holiday and long-term rentals</a>',
  sales: '<a href="/collection/sales">properties for sale</a>',
  all: '<a href="/collection/all">all listings</a>',
  new: '<a href="/collection/new">new listings</a>',
  search: '<a href="/search">property search</a>',
  account: '<a href="/account">My Account</a>',
  applications: '<a href="/account/transactions">property applications</a>',
  viewings: '<a href="/account/viewings">viewing requests</a>',
  profile: '<a href="/account/profile">My Profile</a>',
  contact: '<a href="/pages/contact">contact our team</a>',
  how: '<a href="/pages/how-it-works">How It Works</a>',
  rentGuide: '<a href="/pages/renting-guide">Renting Guide</a>',
  buyGuide: '<a href="/pages/buying-guide">Buying Guide</a>',
  handover: '<a href="/pages/shipping">Handover Information</a>',
  about: '<a href="/pages/about">About GW Vacation Homes</a>',
  privacy: '<a href="/pages/privacy">Privacy Policy</a>',
  terms: '<a href="/pages/terms">Terms of Service</a>',
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

function esc(s) {
  return s.replace(/'/g, "''")
}

const CATEGORIES = [
  {
    id: 'a0000001-0001-4001-8001-000000000001',
    slug: 'renting-dubai',
    title: 'Renting in Dubai',
    description: 'Tenancy contracts, cheques, deposits, and rental regulations in Dubai.',
    sort: 0,
    faqs: [
      ['How much deposit do I pay when renting in Dubai?', `<p>Most landlords require a security deposit of 5–10% of the annual rent, refundable at end of tenancy subject to property condition. Your ${L.applications} shows the exact deposit before you pay. See our ${L.rentGuide} for a full cost breakdown.</p>`],
      ['Can I pay rent in multiple cheques in Dubai?', `<p>Yes. Cheque plans vary by property — from one annual cheque to twelve monthly post-dated cheques. Each listing displays the available plan. Browse ${L.rentals} and filter by payment terms, or ${L.contact} for custom arrangements.</p>`],
      ['What is Ejari and do I need it for my rental?', `<p>Ejari is Dubai\'s official tenancy registration with RERA. It protects both tenant and landlord and is required for DEWA connection and visa processes. We coordinate Ejari as part of move-in — details in ${L.handover} and ${L.rentGuide}.</p>`],
      ['How long is a standard Dubai tenancy contract?', `<p>Most residential leases run 12 months. Some short-term ${L.rentals} may offer 3–6 month terms. Contract duration is confirmed in your ${L.applications} before signing.</p>`],
      ['Can tourists rent a property in Dubai?', `<p>Yes, many vacation and furnished rentals accept tourist visas with valid passport copies. Long-term leases typically require Emirates ID or a valid UAE visa. Submit an inquiry on any listing or use ${L.search} to find furnished options.</p>`],
      ['What documents do I need to rent an apartment in Dubai?', `<p>Usually: passport, UAE visa/Emirates ID, salary certificate or bank statements, and sometimes a security cheque. Upload details to ${L.profile} so your agent can prepare the contract faster.</p>`],
      ['Is agency commission charged on rentals in Dubai?', `<p>Yes — typically 5% of annual rent plus VAT, paid once at contract signing. Commission is itemised in your payment breakdown inside ${L.applications}. Compare ${L.new} listings for transparent fee disclosure.</p>`],
      ['Can I negotiate rent on a Dubai property listing?', `<p>Negotiation depends on the owner and market conditions. Submit an inquiry through the listing; your agent will advise on realistic offers. Explore ${L.all} to compare similar units in the same area.</p>`],
      ['What is RERA and how does it protect tenants?', `<p>The Real Estate Regulatory Agency (RERA) regulates brokers, contracts, and escrow. GW Vacation Homes operates under RERA guidelines. Learn more on our ${L.about} page and ${L.terms}.</p>`],
      ['Can I sublet my rental property in Dubai?', `<p>Subletting requires explicit written consent from the landlord. Unauthorized subletting can void your tenancy. Check your contract terms in ${L.applications} or ask via ${L.contact}.</p>`],
      ['What happens if a rent cheque bounces in Dubai?', `<p>Bounced cheques are a serious offence in the UAE and can lead to legal action. Ensure sufficient funds before issuing post-dated cheques. Your ${L.rentGuide} explains cheque best practices.</p>`],
      ['Are utilities included in Dubai rent?', `<p>Most long-term leases exclude DEWA (electricity/water) and district cooling (chiller). Short-term ${L.rentals} may include utilities — check each listing. See Ejari and DEWA FAQs in this help centre.</p>`],
      ['Can I break a tenancy contract early in Dubai?', `<p>Early termination clauses vary. Some contracts require 1–3 months\' notice and penalty fees. Review terms before signing; your agent explains options in ${L.applications}.</p>`],
      ['Do I need home insurance as a tenant in Dubai?', `<p>Contents insurance is recommended but not always mandatory. Building insurance is typically the landlord\'s responsibility. ${L.contact} for partner referrals if needed.</p>`],
      ['What is a fit-out or furnishing clause in a lease?', `<p>It defines whether the unit is unfurnished, semi-furnished, or fully furnished. Listings show furnishing type on each property page. Browse ${L.rentals} and filter by preference.</p>`],
      ['How do I renew my tenancy in Dubai?', `<p>Renewals usually start 90 days before expiry. Your agent contacts you via ${L.account} notifications. Updated terms and rent adjustments are shared before re-signing.</p>`],
      ['Can two people share a tenancy contract in Dubai?', `<p>Yes — joint tenancy is common. All tenants should be named on the Ejari contract. Add co-tenant details in ${L.profile} when applying.</p>`],
      ['Are pets allowed in Dubai rental apartments?', `<p>Pet policies are owner-specific. Many buildings also have Emaar/DAMAC pet rules. Check listing amenities or ${L.contact} before booking a ${L.viewings}.</p>`],
      ['What is a RERA tenancy contract Form A vs Form B?', `<p>Form A is the standard RERA unified tenancy contract used for most residential leases. Your agent generates the correct form through ${L.applications}. See ${L.rentGuide} for the full process.</p>`],
      ['How quickly can I move in after approving a rental?', `<p>Typically 5–10 business days after contract signing and cheque clearance. Timeline appears in ${L.handover}. Track status in ${L.applications}.</p>`],
      ['Do I pay VAT on residential rent in Dubai?', `<p>Residential rent is generally VAT-exempt. Agency fees and some admin charges may include 5% VAT — shown in your payment breakdown in ${L.applications}.</p>`],
      ['Can I rent a property without a UAE bank account?', `<p>Some owners accept international transfers for short stays; long-term leases usually require UAE cheques or local bank transfer. ${L.contact} to discuss options for your situation.</p>`],
      ['What is district cooling and who pays for it?', `<p>District cooling (Empower/Faruq) is separate from DEWA and billed monthly based on usage. Confirm whether chiller is landlord-paid or tenant-paid in your contract via ${L.applications}.</p>`],
      ['How do I schedule a rental viewing in Dubai?', `<p>Open any listing and book a viewing online. Track confirmations in ${L.viewings}. Read ${L.how} for the full journey from inquiry to keys.</p>`],
      ['Where can I browse verified rental listings in Dubai?', `<p>Explore ${L.rentals}, ${L.new} additions, or use ${L.search} by area and budget. Save favourites in ${L.account}.</p>`],
    ],
  },
  {
    id: 'a0000001-0001-4001-8001-000000000002',
    slug: 'buying-dubai',
    title: 'Buying Property in Dubai',
    description: 'Freehold ownership, DLD transfer, mortgages, and off-plan purchases.',
    sort: 1,
    faqs: [
      ['Can foreigners buy property in Dubai?', `<p>Yes — nationals of most countries can buy freehold property in designated areas. Eligibility is confirmed per listing. Start with ${L.buyGuide} and browse ${L.sales}.</p>`],
      ['What is a freehold area in Dubai?', `<p>Freehold zones allow full foreign ownership (e.g. Dubai Marina, Downtown, JVC, Palm Jumeirah). Leasehold areas grant long-term rights only. Each ${L.sales} listing notes ownership type.</p>`],
      ['How much is the DLD transfer fee when buying in Dubai?', `<p>Dubai Land Department (DLD) charges 4% of the sale price plus admin fees. Amounts appear in your transaction breakdown in ${L.applications} before payment.</p>`],
      ['What is an Oqood vs a title deed?', `<p>Oqood registers off-plan sales; title deed is issued after handover/completion. Your agent explains which stage applies in ${L.applications}. See ${L.buyGuide} for off-plan vs ready property.</p>`],
      ['Do I need a mortgage to buy property in Dubai?', `<p>Cash and mortgage purchases are both common. UAE residents may finance up to 80% LTV for first homes (subject to bank approval). ${L.contact} for mortgage partner introductions.</p>`],
      ['What is a booking deposit when buying in Dubai?', `<p>A booking deposit (often 5–10%) secures the unit while SPA is prepared. It\'s held per RERA escrow rules for off-plan. Details in ${L.buyGuide} and ${L.applications}.</p>`],
      ['How long does property transfer take at DLD?', `<p>Ready property transfers often complete in 1–3 weeks after NOC and funds clear. Off-plan follows developer handover schedules. Track milestones in ${L.applications}.</p>`],
      ['What is snagging on a new Dubai property?', `<p>Snagging is a pre-handover inspection listing defects for the developer to fix. We recommend snagging for new builds — ${L.handover} explains the process.</p>`],
      ['Can I buy off-plan property as a non-resident?', `<p>Many developers sell to non-residents with passport copies and proof of funds. Payment plans vary. Browse ${L.sales} and read ${L.buyGuide} for off-plan due diligence.</p>`],
      ['What is RERA escrow for off-plan purchases?', `<p>Buyer payments must go into RERA-approved escrow accounts for registered projects — protecting funds until construction milestones. Verified in ${L.applications}.</p>`],
      ['Are service charges included when buying an apartment?', `<p>Service charges are annual fees for building maintenance, separate from purchase price. Ask your agent for the latest SC rate on any ${L.sales} listing.</p>`],
      ['What is a No Objection Certificate (NOC) for resale?', `<p>Developers issue NOCs confirming no outstanding dues before DLD transfer. Your agent obtains NOC as part of ${L.applications} workflow.</p>`],
      ['Can I buy property in Dubai through a company?', `<p>Yes — corporate ownership is allowed with proper licensing and documentation. ${L.contact} for corporate purchase requirements.</p>`],
      ['What taxes apply when buying property in Dubai?', `<p>Dubai has no annual property tax; one-time DLD 4% transfer fee applies. No capital gains tax for individuals currently. Confirm latest rules via ${L.contact}.</p>`],
      ['How do I make an offer on a Dubai property?', `<p>Submit an inquiry on the listing with your offer terms. Your agent negotiates with the owner and updates ${L.applications}. Compare comps via ${L.search}.</p>`],
      ['What is the difference between ready and off-plan?', `<p>Ready units are completed and transferable immediately. Off-plan is under construction with staged payments. Both appear in ${L.sales} — filter by availability.</p>`],
      ['Do I need a lawyer when buying in Dubai?', `<p>Many buyers use the SPA prepared by the developer or agency; complex deals may need independent legal review. Contract review happens in ${L.applications} before you sign.</p>`],
      ['Can I buy property in Dubai on a visit visa?', `<p>Yes for cash purchases with valid ID; mortgage approval typically requires residency. ${L.contact} to plan your purchase timeline.</p>`],
      ['What is Golden Visa property investment threshold?', `<p>UAE Golden Visa property routes have minimum investment thresholds (historically around AED 2M+ for certain categories — verify current GDRFA rules). ${L.contact} for latest eligibility.</p>`],
      ['How is agency commission calculated on sales?', `<p>Typically 2% of sale price plus VAT, paid by buyer or seller per agreement. Disclosed in ${L.applications} payment breakdown before you commit.</p>`],
      ['What happens at property handover for buyers?', `<p>Final payment, DLD transfer, and key collection. See ${L.handover} and ${L.buyGuide}. Status updates appear in ${L.account}.</p>`],
      ['Can I buy auction property in Dubai?', `<p>Court and bank auctions follow different rules and due diligence. Our ${L.sales} focus on standard listings — ${L.contact} for auction referrals.</p>`],
      ['Is property inspection available before buying?', `<p>Yes — schedule a viewing via any listing. ${L.viewings} tracks appointments. For off-plan, review developer track record in ${L.buyGuide}.</p>`],
      ['How do I verify a property title is clean?', `<p>Your agent runs DLD title deed checks for liens and encumbrances before contract. Part of our ${L.how} workflow.</p>`],
      ['Where do I start browsing Dubai properties for sale?', `<p>Visit ${L.sales}, ${L.new} listings, or ${L.search}. Create ${L.account} to save favourites and apply online.</p>`],
    ],
  },
  {
    id: 'a0000001-0001-4001-8001-000000000003',
    slug: 'viewings-applications',
    title: 'Viewings & Applications',
    description: 'Booking viewings, declaring interest, and tracking your property application.',
    sort: 2,
    faqs: [
      ['How do I book a property viewing online?', `<p>Open a listing and click Book a Viewing or submit an inquiry with preferred dates. Confirmations appear in ${L.viewings} and ${L.account} notifications.</p>`],
      ['Can I reschedule a viewing in Dubai?', `<p>Yes — ${L.contact} your agent or reply to the notification. Updated times sync to ${L.viewings}.</p>`],
      ['What should I bring to a property viewing?', `<p>Emirates ID or passport, questions list, and tape measure if furnishing planning. Complete ${L.profile} beforehand for faster applications.</p>`],
      ['How long does a typical viewing take?', `<p>Apartments: 20–30 minutes. Villas: 45–60 minutes. Your agent allows time for building amenities inspection.</p>`],
      ['Can I view multiple properties in one day?', `<p>Yes — ${L.contact} to arrange a viewing route. Save targets from ${L.search} or ${L.all} first.</p>`],
      ['What happens after my viewing is completed?', `<p>Declare Proceed, Not Proceed, or Need More Info in ${L.applications}. Your agent reviews and updates status. See ${L.how}.</p>`],
      ['How do I track my property application status?', `<p>Sign in to ${L.applications} for a step-by-step timeline: viewing → contract → payment → handover.</p>`],
      ['Can I apply for a property without a viewing?', `<p>Some off-plan or remote buyers proceed with video tours; most owners prefer in-person viewings for ready units. ${L.contact} for virtual options.</p>`],
      ['How many properties can I apply for at once?', `<p>Multiple inquiries are fine, but serious applications should focus on 1–2 priorities. Each has a separate ${L.applications} record.</p>`],
      ['What is a property transaction number?', `<p>A unique reference (e.g. PT-000123) for your application. Shown in ${L.applications} and all email notifications.</p>`],
      ['Who is my assigned agent?', `<p>Displayed in ${L.applications} and viewing confirmations. ${L.about} introduces our agent standards.</p>`],
      ['Can my spouse join the application?', `<p>Yes — add co-applicant details in ${L.profile} and inform your agent via ${L.contact}.</p>`],
      ['How fast do agents respond to inquiries?', `<p>We aim within one business day. Urgent requests: ${L.contact} or WhatsApp from any listing page.</p>`],
      ['What if the property is already under offer?', `<p>Your agent notifies you immediately and suggests similar ${L.new} or ${L.search} alternatives.</p>`],
      ['Do I need an account to book a viewing?', `<p>An account lets you track ${L.viewings} and ${L.applications}. Guest inquiries are possible but limit dashboard tracking — sign up via ${L.account}.</p>`],
      ['Can I cancel a viewing request?', `<p>Yes — notify your agent before the scheduled time. Status updates in ${L.viewings}.</p>`],
      ['What is client declaration after viewing?', `<p>Your formal Proceed / Not Proceed response that unlocks contract stage if approved. Submit inside ${L.applications}.</p>`],
      ['How do notifications work for my application?', `<p>Email and in-app alerts for viewing updates, contracts, and payments. Manage in ${L.account} notifications settings.</p>`],
      ['Can agents show properties on weekends?', `<p>Many viewings happen Friday–Saturday. Request preferred slots when booking or via ${L.contact}.</p>`],
      ['Where is the full step-by-step application guide?', `<p>Read ${L.how} for inquiry → viewing → contract → payment → handover. Rent-specific: ${L.rentGuide}. Buy-specific: ${L.buyGuide}.</p>`],
    ],
  },
  {
    id: 'a0000001-0001-4001-8001-000000000004',
    slug: 'contracts-legal',
    title: 'Contracts & Legal',
    description: 'Tenancy contracts, SPA, RERA forms, and signed document review.',
    sort: 3,
    faqs: [
      ['When do I receive my tenancy contract?', `<p>After agent approval of your application and contract request in ${L.applications}. Download from your dashboard when ready.</p>`],
      ['How do I upload a signed contract?', `<p>Sign the PDF, scan or photograph, upload in ${L.applications}. Agent reviews within 1–2 business days.</p>`],
      ['What if my signed contract is rejected?', `<p>Agent requests re-upload with notes — fix signatures, dates, or initials and resubmit via ${L.applications}.</p>`],
      ['Is the tenancy contract legally binding in Dubai?', `<p>Yes — once signed and Ejari-registered per RERA. Review ${L.terms} and ask questions before signing.</p>`],
      ['What is a Sale and Purchase Agreement (SPA)?', `<p>The binding contract for property sales outlining price, payment plan, and completion date. Generated through ${L.applications} for buyers.</p>`],
      ['Can I review a contract before committing?', `<p>Yes — contracts are shared for review before payment. Never pay before reviewing your breakdown in ${L.applications}.</p>`],
      ['What personal data goes on a contract?', `<p>Name, ID, contact, and property details from ${L.profile}. Keep ${L.profile} updated for accuracy.</p>`],
      ['Are digital signatures accepted?', `<p>Scanned wet signatures are standard; some developers accept e-sign. Your agent confirms format in ${L.applications}.</p>`],
      ['What is an addendum to a tenancy contract?', `<p>A supplemental document modifying terms (e.g. pet clause, maintenance). Attached to main contract in ${L.applications}.</p>`],
      ['Who holds the original tenancy contract?', `<p>Both parties receive copies; Ejari registration holds the official record. Digital copies in ${L.applications}.</p>`],
      ['What is RERA Form F for sales?', `<p>Memorandum of Understanding between buyer and seller before SPA. Used in resale ${L.sales} transactions.</p>`],
      ['Can I assign my off-plan contract to another buyer?', `<p>Developer assignment policies vary; fees may apply. ${L.contact} before any assignment.</p>`],
      ['What happens if the seller withdraws after MOU?', `<p>MOU terms define forfeiture and remedies. Legal review recommended for high-value deals — ${L.contact}.</p>`],
      ['Is my contract data kept private?', `<p>Yes — per ${L.privacy}. Only assigned agents and admins access ${L.applications} documents.</p>`],
      ['What language are contracts written in?', `<p>English is standard; Arabic versions may be provided for official registration. Bilingual Ejari is common.</p>`],
      ['Do I need attestation for overseas buyers?', `<p>Some transactions require notarized documents from abroad. ${L.contact} for country-specific requirements.</p>`],
      ['What is a security cheque vs rental cheque?', `<p>Security cheque covers damages (refundable); rental cheques pay rent per schedule. Both explained in ${L.rentGuide}.</p>`],
      ['Can contract terms be negotiated?', `<p>Some clauses (rent, cheques, break terms) are negotiable with owner approval. Your agent advocates during ${L.applications}.</p>`],
      ['How long is contract review turnaround?', `<p>Agent review of uploaded contracts: typically 1–2 business days. You are notified in ${L.account}.</p>`],
      ['Where are contract and legal FAQs for handover?', `<p>See ${L.handover} for post-contract steps and this section for signing. Full journey: ${L.how}.</p>`],
    ],
  },
  {
    id: 'a0000001-0001-4001-8001-000000000005',
    slug: 'payments-fees',
    title: 'Payments & Fees',
    description: 'Deposits, commissions, invoices, Stripe checkout, and payment breakdowns.',
    sort: 4,
    faqs: [
      ['When can I pay for my property application?', `<p>After signed contract approval and invoice generation in ${L.applications}. See payment section when status is Payment Pending.</p>`],
      ['What appears in my payment breakdown?', `<p>Rent or sale price, deposit, agency commission, admin fees, Ejari, VAT where applicable. Itemised before invoice in ${L.applications}.</p>`],
      ['Can I pay online with a card?', `<p>Yes — when Stripe checkout is enabled, pay securely from ${L.applications}. Otherwise bank transfer with manual confirmation.</p>`],
      ['Is my online payment secure?', `<p>Card payments process via Stripe; we never store full card numbers. See ${L.privacy} for data handling.</p>`],
      ['What currency are payments in?', `<p>AED (UAE Dirham) for Dubai properties. Display follows site currency settings on listings.</p>`],
      ['When is the invoice generated?', `<p>After agent builds payment breakdown — you or your agent creates invoice in ${L.applications}.</p>`],
      ['Can I pay in instalments for a sale?', `<p>Off-plan follows developer payment plans; ready sales usually require staged payments per SPA. Details in ${L.buyGuide} and ${L.applications}.</p>`],
      ['What if my payment fails online?', `<p>Retry from ${L.applications} or ${L.contact} for bank transfer instructions. Invoice stays pending until paid.</p>`],
      ['Are refunds available after payment?', `<p>Refund rules depend on contract stage and owner policy. Deposits may be non-refundable after MOU/SPA — review ${L.terms}.</p>`],
      ['Who receives my payment?', `<p>Agency fees to GW Vacation Homes; rent/sale funds per contract (owner/developer/escrow). Breakdown clarifies each line in ${L.applications}.</p>`],
      ['Do I get a receipt after payment?', `<p>Yes — invoice marked paid in ${L.applications} with confirmation notification. Email receipt when Stripe is used.</p>`],
      ['What is the agency commission on rent?', `<p>Typically 5% of annual rent + VAT. Shown in breakdown before you pay — browse ${L.rentals} with confidence.</p>`],
      ['What is the agency commission on sales?', `<p>Typically 2% of sale price + VAT unless otherwise agreed. Disclosed in ${L.applications}.</p>`],
      ['Are admin fees mandatory?', `<p>Admin/Ejari fees cover registration and processing — itemised in breakdown. See ${L.rentGuide} for typical ranges.</p>`],
      ['Can I pay from outside the UAE?', `<p>International wire accepted for many transactions. ${L.contact} for SWIFT details and currency conversion notes.</p>`],
      ['When is the security deposit due?', `<p>Usually at contract signing with first rent cheque. Timeline in ${L.applications} payment schedule.</p>`],
      ['Does VAT apply to agency fees?', `<p>Yes — 5% UAE VAT on taxable agency services. Included in breakdown total in ${L.applications}.</p>`],
      ['How do I confirm a bank transfer payment?', `<p>Upload proof or click Confirm Payment in ${L.applications} if quote mode is enabled. Agent verifies and updates status.</p>`],
      ['What payment methods are accepted?', `<p>Visa, Mastercard, Amex (via Stripe where enabled), bank transfer, and post-dated cheques for rent per contract.</p>`],
      ['Where do I see payment history?', `<p>Inside each transaction in ${L.applications} — invoices and payment status per property.</p>`],
    ],
  },
  {
    id: 'a0000001-0001-4001-8001-000000000006',
    slug: 'ejari-dewa-utilities',
    title: 'Ejari, DEWA & Utilities',
    description: 'Tenancy registration, electricity, water, cooling, and internet setup.',
    sort: 5,
    faqs: [
      ['How do I register Ejari for my tenancy?', `<p>We coordinate Ejari after contract signing and initial payment. Required documents listed in ${L.handover} and ${L.rentGuide}.</p>`],
      ['How much does Ejari registration cost?', `<p>Ejari fees are approximately AED 220 including VAT — included in your ${L.applications} breakdown when applicable.</p>`],
      ['How do I connect DEWA electricity and water?', `<p>Apply online at DEWA with Ejari, ID, and deposit (typically AED 2,130 for apartments). We guide you at handover — ${L.handover}.</p>`],
      ['What is a DEWA security deposit?', `<p>Refundable deposit held by DEWA — AED 2,000 apartments / AED 4,000 villas (approx.). Refunded minus final bill on move-out.</p>`],
      ['How long does DEWA activation take?', `<p>Usually 1–24 hours after application with valid Ejari. Plan activation for handover day in ${L.applications}.</p>`],
      ['What is district cooling vs DEWA?', `<p>DEWA covers electricity and water; district cooling (Empower) is separate chilled water AC billing. Confirm payer in lease via ${L.applications}.</p>`],
      ['Can the previous tenant DEWA account be transferred?', `<p>Final bill must close old account before new registration. Coordinate move-in/out dates with agent via ${L.contact}.</p>`],
      ['How do I set up home internet in Dubai?', `<p>Etisalat or du after Ejari — choose fiber plan. Not included in agency fees; arrange post handover.</p>`],
      ['Is chiller included in rent?', `<p>Listing-specific. Some landlords include capped chiller; others bill tenant directly. Check listing or ${L.applications} contract.</p>`],
      ['What happens to Ejari when I move out?', `<p>Cancel Ejari after final DEWA bill and deposit return. Agent advises on notice period per ${L.rentGuide}.</p>`],
      ['Do short-term rentals need Ejari?', `<p>Holiday lets under DTCM holiday home rules may differ from long-term Ejari. ${L.contact} for your rental type.</p>`],
      ['Can Ejari be done without an agent?', `<p>Yes via Dubai REST app, but agencies typically handle it for accuracy. Included in our ${L.how} service.</p>`],
      ['What documents does Ejari require?', `<p>Signed tenancy contract, landlord title deed copy, tenant passport/Emirates ID, DEWA premise number. Prepare via ${L.profile}.</p>`],
      ['How do I update Ejari for contract renewal?', `<p>Renew through Ejari system with new contract dates — agent handles on renewal in ${L.applications}.</p>`],
      ['Where can I learn more about move-in utilities?', `<p>${L.handover} and ${L.rentGuide} cover DEWA, Ejari, and key collection in detail.</p>`],
    ],
  },
  {
    id: 'a0000001-0001-4001-8001-000000000007',
    slug: 'handover-move-in',
    title: 'Handover & Move-in',
    description: 'Key collection, snagging, inspections, and possession day.',
    sort: 6,
    faqs: [
      ['When is handover scheduled after payment?', `<p>Agent schedules once payment is confirmed — typically within days for rentals, per SPA for sales. Track in ${L.applications}.</p>`],
      ['What should I inspect at handover?', `<p>Fixtures, appliances, AC, plumbing, meters readings, and community access cards. Report issues within 48 hours per ${L.handover}.</p>`],
      ['Who attends the handover meeting?', `<p>Tenant/buyer, agent, sometimes landlord or building manager. Details in handover notification via ${L.account}.</p>`],
      ['What documents do I bring on handover day?', `<p>Emirates ID/passport, paid invoice proof, signed contract copy, and cheques if not yet collected. List in ${L.handover}.</p>`],
      ['How do I get building access cards and parking?', `<p>Issued at handover or from building management — agent coordinates. Notes appear in ${L.applications} handover section.</p>`],
      ['What is a handover checklist?', `<p>Itemised list of keys, remotes, meter readings, and condition notes. Available for tenants post lease activation in tenant portal.</p>`],
      ['Can handover be done remotely?', `<p>Power of attorney or authorized representative possible with notarized documents. ${L.contact} to arrange.</p>`],
      ['What if defects are found at handover?', `<p>Document with photos; landlord/developer fixes per contract. Snagging applies to new builds — ${L.buyGuide}.</p>`],
      ['When do I receive keys?', `<p>After payment clearance, Ejari (rentals), and signed handover protocol. ${L.handover} explains timing.</p>`],
      ['How is move-in date communicated?', `<p>Email and ${L.account} notification with date, time, location, and agent contact.</p>`],
      ['What about furniture delivery after handover?', `<p>Coordinate with building rules for elevator booking and working hours. Common in Marina/Downtown towers.</p>`],
      ['Is professional cleaning required before move-in?', `<p>Contract may require professional clean — verify in lease. Standard in premium ${L.rentals}.</p>`],
      ['Can I pre-book DEWA before handover?', `<p>Yes once Ejari is active — align activation date with key collection per ${L.rentGuide}.</p>`],
      ['What happens after handover is marked complete?', `<p>Transaction status becomes Completed in ${L.applications}. Rentals may activate tenant portal for ongoing rent.</p>`],
      ['Where is the full handover guide?', `<p>Read ${L.handover} for rental and sale completion steps, plus ${L.how} for the full journey.</p>`],
    ],
  },
  {
    id: 'a0000001-0001-4001-8001-000000000008',
    slug: 'investment-roi',
    title: 'Investment & ROI',
    description: 'Rental yields, capital growth, holiday home income, and market insights.',
    sort: 7,
    faqs: [
      ['What rental yield can I expect in Dubai?', `<p>Yields vary by area — often 5–8% gross for apartments, lower for premium Palm/Downtown. Compare ${L.sales} and ${L.contact} for analysis.</p>`],
      ['Is Dubai property a good investment in 2026?', `<p>Market depends on area, supply, and visa policies. Review ${L.new} listings and ${L.buyGuide} before investing.</p>`],
      ['Can I earn from holiday home rentals?', `<p>Yes — short-term ${L.rentals} in licensed holiday homes can generate seasonal income. Check DTCM licensing for your building.</p>`],
      ['What is the difference between gross and net yield?', `<p>Gross = annual rent / price; net deducts service charges, maintenance, and vacancy. Agent provides estimates on ${L.contact}.</p>`],
      ['Should I buy off-plan for investment?', `<p>Off-plan offers payment plans and potential capital gain but carries completion risk. Due diligence in ${L.buyGuide}.</p>`],
      ['Which Dubai areas have highest rental demand?', `<p>Marina, JVC, Business Bay, and Downtown remain strong for tenants. Browse ${L.search} by community.</p>`],
      ['Can non-residents collect rent remotely?', `<p>Yes with property management and proper accounting. ${L.contact} for management referrals.</p>`],
      ['What are service charges impact on ROI?', `<p>SC reduces net yield — typically AED 12–25/sq ft annually. Request SC on any ${L.sales} listing.</p>`],
      ['Is flipping property allowed in Dubai?', `<p>Resale before handover may need developer NOC and fees. Hold period affects ROI — see ${L.buyGuide}.</p>`],
      ['Where do I browse investment-ready listings?', `<p>${L.sales}, ${L.new}, and ${L.all}. ${L.about} describes our advisory approach for investors.</p>`],
    ],
  },
]

// Count check
let total = 0
for (const c of CATEGORIES) {
  total += c.faqs.length
  if (c.faqs.length === 0) throw new Error(`Empty category ${c.slug}`)
}
if (total !== 150) {
  throw new Error(`Expected 150 FAQs, got ${total}`)
}

const lines = [
  '-- Generated by scripts/generate-faq-seed.mjs — 150 Dubai real estate FAQs',
  'begin;',
  '',
]

for (const cat of CATEGORIES) {
  lines.push(
    `insert into public.faq_categories (id, slug, title, description, sort_order, is_active) values ('${cat.id}', '${cat.slug}', '${esc(cat.title)}', '${esc(cat.description)}', ${cat.sort}, true) on conflict (slug) do update set title = excluded.title, description = excluded.description, sort_order = excluded.sort_order, updated_at = now();`,
  )
}

lines.push('')

const usedSlugs = new Set()
let sortGlobal = 0
for (const cat of CATEGORIES) {
  cat.faqs.forEach(([question, answer], idx) => {
    let slug = slugify(question)
    let n = 2
    while (usedSlugs.has(slug)) {
      slug = `${slugify(question).slice(0, 70)}-${n++}`
    }
    usedSlugs.add(slug)
    const meta = question.slice(0, 155)
    lines.push(
      `insert into public.faqs (category_id, slug, question, answer_html, meta_description, sort_order, is_published) select id, '${esc(slug)}', '${esc(question)}', '${esc(answer)}', '${esc(meta)}', ${sortGlobal++}, true from public.faq_categories where slug = '${cat.slug}' on conflict (slug) do update set question = excluded.question, answer_html = excluded.answer_html, meta_description = excluded.meta_description, sort_order = excluded.sort_order, updated_at = now();`,
    )
  })
}

lines.push('')
lines.push(`update public.marketing_pages set meta_description = '150+ answers about renting, buying, viewings, contracts, Ejari, DEWA, payments, and handover in Dubai. GW Vacation Homes help centre.', body_html = '<p>Browse our comprehensive FAQ library below — organised by topic with quick search.</p>', updated_at = now() where slug = 'faq';`)
lines.push('commit;')
lines.push('')

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, lines.join('\n'), 'utf8')
console.log(`Wrote ${total} FAQs to ${outPath}`)
