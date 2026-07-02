/** Shared marketing page HTML for static CMS fallback and migration seeds. */

export const LEGAL_PAGES = {
  privacy: {
    title: 'Privacy Policy',
    slug: 'privacy',
    metaDescription: 'How GW Vacation Homes collects, uses, and protects your personal data.',
    bodyHtml: `<h2>Who we are</h2>
<p>GW Vacation Homes is a Dubai-based real estate agency offering vacation rentals and properties for sale. This policy explains how we handle your personal information when you browse listings, book viewings, or submit a property application.</p>
<h2>Information we collect</h2>
<ul>
<li><strong>Account &amp; applications:</strong> name, email, phone, Emirates ID or passport details, and property transaction history.</li>
<li><strong>Inquiries &amp; viewings:</strong> preferred dates, messages, and property interests.</li>
<li><strong>Support:</strong> messages sent through our contact form or email.</li>
<li><strong>Newsletter:</strong> email address when you subscribe to new listings.</li>
<li><strong>Technical data:</strong> IP address, browser type, and cookies (see our <a href="/pages/cookies">Cookie Policy</a>).</li>
</ul>
<h2>How we use your data</h2>
<p>We use your information to process property inquiries, arrange viewings, prepare contracts, coordinate payments and handover, provide customer support, and—where you have opted in—send marketing about new listings.</p>
<h2>Sharing your data</h2>
<p>We share data only with trusted processors including email services, payment providers, and property management partners involved in your transaction. We do not sell your personal data.</p>
<h2>Your rights</h2>
<p>You may request access, correction, or deletion of your data. Contact us via our <a href="/pages/contact">contact page</a>.</p>`,
  },
  terms: {
    title: 'Terms of Service',
    slug: 'terms',
    metaDescription: 'Terms and conditions for using GW Vacation Homes.',
    bodyHtml: `<h2>Agreement</h2>
<p>By using this website you agree to these terms for browsing listings and submitting property inquiries or applications.</p>
<h2>Listings</h2>
<p>Property details, prices, and availability are subject to change without notice until a formal offer or tenancy is agreed. Images are representative; viewings are recommended before commitment.</p>
<h2>Applications &amp; contracts</h2>
<p>Submitting an inquiry or application does not guarantee availability. Rental and sale agreements are subject to owner approval, RERA regulations, and signed contract terms.</p>
<h2>Payments</h2>
<p>Payment schedules, deposits, and agency fees are disclosed in your transaction breakdown before payment is due.</p>
<h2>Handover</h2>
<p>Move-in and completion terms are described in your contract and on individual property pages. See our <a href="/pages/shipping">Handover Information</a> for general guidance.</p>`,
  },
  shipping: {
    title: 'Handover Information',
    slug: 'shipping',
    metaDescription: 'Handover, move-in, and completion guidance for GW Vacation Homes clients.',
    bodyHtml: `<h2>Rental handover</h2>
<p>Once your tenancy contract is signed and initial payments are received, your agent schedules key collection. Allow 30–45 minutes for apartments and 1–2 hours for villas. Ejari registration and DEWA transfer are coordinated as part of move-in.</p>
<h2>Sale completion</h2>
<p>Booking deposits secure the property pending DLD transfer. Your agent arranges snagging visits, NOC clearance, and final key handover on the agreed completion date.</p>
<h2>Documents to bring</h2>
<ul>
<li>Valid Emirates ID or passport</li>
<li>Signed contract copy</li>
<li>Payment confirmation</li>
<li>Security cheque (rentals, where applicable)</li>
</ul>
<h2>After handover</h2>
<p>Report any maintenance issues within 48 hours of move-in. Your agent remains your point of contact for the duration of your tenancy or post-completion support.</p>`,
  },
  cookies: {
    title: 'Cookie Policy',
    slug: 'cookies',
    metaDescription: 'How GW Vacation Homes uses cookies and similar technologies.',
    bodyHtml: `<h2>What are cookies?</h2>
<p>Cookies are small text files stored on your device when you visit our website.</p>
<h2>How we use cookies</h2>
<h3>Strictly necessary</h3>
<p>Required for sign-in, saved properties, and application workflows.</p>
<h3>Analytics (optional)</h3>
<p>Help us understand how visitors browse listings. Enabled only with your consent.</p>
<h2>Managing cookies</h2>
<p>You can change preferences using <strong>Cookie settings</strong> in the footer or your browser settings.</p>`,
  },
  contact: {
    title: 'Contact Us',
    slug: 'contact',
    metaDescription: 'Get in touch with GW Vacation Homes for viewings, rentals, and sales.',
    bodyHtml: `<p>Questions about a listing, viewing availability, or an active application? Send us a message and our team will respond within one business day.</p>`,
  },
} as const
