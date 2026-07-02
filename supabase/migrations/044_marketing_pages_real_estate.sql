-- Align live marketing pages with GW Vacation Homes real estate copy

update public.marketing_pages set
  title = 'Handover Information',
  meta_description = 'Handover, move-in, and completion guidance for GW Vacation Homes clients.',
  body_html = '<h2>Rental handover</h2><p>Once your tenancy contract is signed and initial payments are received, your agent schedules key collection. Ejari registration and DEWA transfer are coordinated as part of move-in.</p><h2>Sale completion</h2><p>Booking deposits secure the property pending DLD transfer. Your agent arranges snagging visits and final key handover on the agreed completion date.</p>',
  updated_at = now()
where slug = 'shipping';

update public.marketing_pages set
  meta_description = 'How GW Vacation Homes collects, uses, and protects your personal data.',
  body_html = '<p>GW Vacation Homes is a Dubai-based real estate agency. We collect contact details, application information, and viewing preferences to process property inquiries and transactions. Contact us to exercise your data rights.</p>',
  updated_at = now()
where slug = 'privacy';

update public.marketing_pages set
  meta_description = 'Terms and conditions for using GW Vacation Homes.',
  body_html = '<p>By using this website you agree to our terms for browsing listings and submitting property applications. Listings are subject to availability until a formal contract is signed.</p>',
  updated_at = now()
where slug = 'terms';

update public.marketing_pages set
  meta_description = 'Get in touch with GW Vacation Homes for viewings, rentals, and sales.',
  body_html = '<p>Questions about a listing or an active application? Send us a message and our team will respond within one business day.</p>',
  updated_at = now()
where slug = 'contact';
