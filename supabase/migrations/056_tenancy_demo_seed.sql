-- Demo seed: tenancy + acquisition samples (8+ records per entity, mixed states)
-- ALWAYS include real-estate storefront data when seeding:
--   • Replace ecommerce categories → run 058_real_estate_categories_and_reviews.sql
--   • Seed property-centered reviews (tenancy/viewing/handover), not product/electronics copy

-- ── Property owners (8) ─────────────────────────────────────────────────────
insert into public.property_owners (id, auth_user_id, full_name, email, phone, company_name, tax_id, is_active) values
  ('b1111111-1111-1111-1111-111111111101', 'e839333b-5e72-419e-90e6-e39e9c6ca557', 'Khalid Al Maktoum', 'khalid.owner@gwvacation.example', '+971501000001', 'Al Maktoum Holdings', 'TRN-100001', true),
  ('b1111111-1111-1111-1111-111111111102', null, 'Fatima Al Nahyan', 'fatima.owner@gwvacation.example', '+971501000002', null, 'TRN-100002', true),
  ('b1111111-1111-1111-1111-111111111103', null, 'Rajesh Mehta', 'rajesh.owner@gwvacation.example', '+971501000003', 'Mehta Properties LLC', 'TRN-100003', true),
  ('b1111111-1111-1111-1111-111111111104', null, 'Sophia Laurent', 'sophia.owner@gwvacation.example', '+971501000004', null, 'TRN-100004', true),
  ('b1111111-1111-1111-1111-111111111105', null, 'Ahmed bin Rashid', 'ahmed.owner@gwvacation.example', '+971501000005', 'Bin Rashid Estates', 'TRN-100005', true),
  ('b1111111-1111-1111-1111-111111111106', null, 'Priya Sharma', 'priya.owner@gwvacation.example', '+971501000006', null, 'TRN-100006', true),
  ('b1111111-1111-1111-1111-111111111107', null, 'James Morrison', 'james.owner@gwvacation.example', '+971501000007', 'Morrison Capital', 'TRN-100007', true),
  ('b1111111-1111-1111-1111-111111111108', null, 'Layla Hassan', 'layla.owner@gwvacation.example', '+971501000008', null, 'TRN-100008', true)
on conflict (id) do nothing;

insert into public.property_owner_assignments (id, property_owner_id, product_id, ownership_share, management_fee_pct) values
  ('ba111111-1111-1111-1111-111111111101', 'b1111111-1111-1111-1111-111111111101', 'f1111111-1111-1111-1111-111111111101', 100, 5),
  ('ba111111-1111-1111-1111-111111111102', 'b1111111-1111-1111-1111-111111111102', 'f1111111-1111-1111-1111-111111111104', 100, 5),
  ('ba111111-1111-1111-1111-111111111103', 'b1111111-1111-1111-1111-111111111103', 'f1111111-1111-1111-1111-111111111103', 100, 7.5),
  ('ba111111-1111-1111-1111-111111111104', 'b1111111-1111-1111-1111-111111111104', 'f1111111-1111-1111-1111-111111111111', 100, 5),
  ('ba111111-1111-1111-1111-111111111105', 'b1111111-1111-1111-1111-111111111105', 'f1111111-1111-1111-1111-111111111107', 100, 6),
  ('ba111111-1111-1111-1111-111111111106', 'b1111111-1111-1111-1111-111111111106', 'f1111111-1111-1111-1111-111111111108', 100, 5),
  ('ba111111-1111-1111-1111-111111111107', 'b1111111-1111-1111-1111-111111111107', 'f1111111-1111-1111-1111-111111111109', 100, 5),
  ('ba111111-1111-1111-1111-111111111108', 'b1111111-1111-1111-1111-111111111108', 'f1111111-1111-1111-1111-111111111110', 100, 8)
on conflict (id) do nothing;

-- ── Acquisition transactions (8 pipeline states) ───────────────────────────
insert into public.property_transactions (id, transaction_number, property_id, client_user_id, client_email, assigned_agent_id, listing_type, status) values
  ('9a111111-1111-1111-1111-111111111101', 'PT-DEMO-001', 'f1111111-1111-1111-1111-111111111112', 'd1111111-1111-1111-1111-111111111103', 'marcus.demo@astor.example', 'a1111111-1111-1111-1111-111111111102', 'rent', 'inquiry_submitted'),
  ('9a111111-1111-1111-1111-111111111102', 'PT-DEMO-002', 'f1111111-1111-1111-1111-111111111113', 'd1111111-1111-1111-1111-111111111104', 'emma.demo@astor.example', 'a1111111-1111-1111-1111-111111111101', 'rent', 'viewing_scheduled'),
  ('9a111111-1111-1111-1111-111111111103', 'PT-DEMO-003', 'f1111111-1111-1111-1111-111111111115', 'd1111111-1111-1111-1111-111111111105', 'alex.demo@astor.example', 'a1111111-1111-1111-1111-111111111102', 'rent', 'contract_generated'),
  ('9a111111-1111-1111-1111-111111111104', 'PT-DEMO-004', 'f1111111-1111-1111-1111-111111111106', 'd1111111-1111-1111-1111-111111111102', 'sarah.demo@astor.example', 'a1111111-1111-1111-1111-111111111101', 'rent', 'payment_pending'),
  ('9a111111-1111-1111-1111-111111111105', 'PT-DEMO-005', 'f1111111-1111-1111-1111-111111111109', 'd1111111-1111-1111-1111-111111111101', 'ian.demo@astor.example', 'a1111111-1111-1111-1111-111111111102', 'rent', 'handover_scheduled'),
  ('9a111111-1111-1111-1111-111111111106', 'PT-DEMO-006', 'f1111111-1111-1111-1111-111111111101', 'd1111111-1111-1111-1111-111111111101', 'ian.demo@astor.example', 'a1111111-1111-1111-1111-111111111102', 'rent', 'handover_completed'),
  ('9a111111-1111-1111-1111-111111111107', 'PT-DEMO-007', 'f1111111-1111-1111-1111-111111111104', 'd1111111-1111-1111-1111-111111111102', 'sarah.demo@astor.example', 'a1111111-1111-1111-1111-111111111101', 'rent', 'transaction_completed'),
  ('9a111111-1111-1111-1111-111111111108', 'PT-DEMO-008', 'f1111111-1111-1111-1111-111111111110', 'd1111111-1111-1111-1111-111111111105', 'alex.demo@astor.example', 'a1111111-1111-1111-1111-111111111102', 'rent', 'cancelled')
on conflict (id) do nothing;

-- ── Leases (8: active×5, notice×1, pending×1, ended×1) ───────────────────
insert into public.leases (id, property_transaction_id, product_id, tenant_user_id, landlord_owner_id, assigned_agent_id, start_date, end_date, rent_amount, payment_frequency, cheque_count, security_deposit, status) values
  ('c1111111-1111-1111-1111-111111111101', '9a111111-1111-1111-1111-111111111106', 'f1111111-1111-1111-1111-111111111101', 'd1111111-1111-1111-1111-111111111101', 'b1111111-1111-1111-1111-111111111101', 'a1111111-1111-1111-1111-111111111102', current_date - 90, current_date + 275, 145000, 'cheque', 4, 145000, 'active'),
  ('c1111111-1111-1111-1111-111111111102', '9a111111-1111-1111-1111-111111111107', 'f1111111-1111-1111-1111-111111111104', 'd1111111-1111-1111-1111-111111111102', 'b1111111-1111-1111-1111-111111111102', 'a1111111-1111-1111-1111-111111111101', current_date - 60, current_date + 305, 72000, 'monthly', 1, 72000, 'active'),
  ('c1111111-1111-1111-1111-111111111103', null, 'f1111111-1111-1111-1111-111111111103', 'd1111111-1111-1111-1111-111111111103', 'b1111111-1111-1111-1111-111111111103', 'a1111111-1111-1111-1111-111111111102', current_date - 30, current_date + 335, 220000, 'cheque', 6, 220000, 'active'),
  ('c1111111-1111-1111-1111-111111111104', null, 'f1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111104', 'b1111111-1111-1111-1111-111111111104', 'a1111111-1111-1111-1111-111111111101', current_date - 45, current_date + 320, 65000, 'cheque', 12, 65000, 'active'),
  ('c1111111-1111-1111-1111-111111111105', null, 'f1111111-1111-1111-1111-111111111107', 'd1111111-1111-1111-1111-111111111105', 'b1111111-1111-1111-1111-111111111105', 'a1111111-1111-1111-1111-111111111102', current_date - 15, current_date + 350, 165000, 'cheque', 4, 165000, 'active'),
  ('c1111111-1111-1111-1111-111111111106', null, 'f1111111-1111-1111-1111-111111111108', 'e839333b-5e72-419e-90e6-e39e9c6ca557', 'b1111111-1111-1111-1111-111111111106', 'a1111111-1111-1111-1111-111111111101', current_date - 200, current_date + 30, 185000, 'cheque', 6, 185000, 'notice'),
  ('c1111111-1111-1111-1111-111111111107', null, 'f1111111-1111-1111-1111-111111111109', 'd1111111-1111-1111-1111-111111111101', 'b1111111-1111-1111-1111-111111111107', 'a1111111-1111-1111-1111-111111111102', current_date + 14, current_date + 379, 155000, 'cheque', 4, 155000, 'pending'),
  ('c1111111-1111-1111-1111-111111111108', null, 'f1111111-1111-1111-1111-111111111106', 'd1111111-1111-1111-1111-111111111102', 'b1111111-1111-1111-1111-111111111108', 'a1111111-1111-1111-1111-111111111101', current_date - 400, current_date - 35, 98000, 'cheque', 12, 98000, 'ended')
on conflict (id) do nothing;

-- ── Rent installments (8 per status type across leases) ──────────────────────
insert into public.rent_installments (id, lease_id, due_date, amount, installment_type, status) values
  ('d2111111-1111-1111-1111-111111111101', 'c1111111-1111-1111-1111-111111111101', current_date - 60, 36250, 'rent', 'paid'),
  ('d2111111-1111-1111-1111-111111111102', 'c1111111-1111-1111-1111-111111111101', current_date - 5, 36250, 'rent', 'due'),
  ('d2111111-1111-1111-1111-111111111103', 'c1111111-1111-1111-1111-111111111102', current_date - 10, 72000, 'rent', 'overdue'),
  ('d2111111-1111-1111-1111-111111111104', 'c1111111-1111-1111-1111-111111111103', current_date + 30, 36666.67, 'rent', 'scheduled'),
  ('d2111111-1111-1111-1111-111111111105', 'c1111111-1111-1111-1111-111111111104', current_date, 5416.67, 'rent', 'pending_verification'),
  ('d2111111-1111-1111-1111-111111111106', 'c1111111-1111-1111-1111-111111111105', current_date - 90, 41250, 'rent', 'paid'),
  ('d2111111-1111-1111-1111-111111111107', 'c1111111-1111-1111-1111-111111111106', current_date - 30, 30833.33, 'rent', 'due'),
  ('d2111111-1111-1111-1111-111111111108', 'c1111111-1111-1111-1111-111111111108', current_date - 120, 8166.67, 'rent', 'waived'),
  ('d2111111-1111-1111-1111-111111111109', 'c1111111-1111-1111-1111-111111111101', current_date + 30, 36250, 'rent', 'scheduled'),
  ('d2111111-1111-1111-1111-111111111110', 'c1111111-1111-1111-1111-111111111102', current_date + 25, 72000, 'rent', 'scheduled'),
  ('d2111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111103', current_date - 15, 36666.67, 'rent', 'paid'),
  ('d2111111-1111-1111-1111-111111111112', 'c1111111-1111-1111-1111-111111111104', current_date - 20, 5416.67, 'rent', 'overdue'),
  ('d2111111-1111-1111-1111-111111111113', 'c1111111-1111-1111-1111-111111111105', current_date + 5, 41250, 'rent', 'due'),
  ('d2111111-1111-1111-1111-111111111114', 'c1111111-1111-1111-1111-111111111106', current_date + 15, 30833.33, 'rent', 'scheduled'),
  ('d2111111-1111-1111-1111-111111111115', 'c1111111-1111-1111-1111-111111111107', current_date + 14, 38750, 'rent', 'scheduled'),
  ('d2111111-1111-1111-1111-111111111116', 'c1111111-1111-1111-1111-111111111101', current_date - 90, 145000, 'deposit', 'paid')
on conflict (id) do nothing;

-- ── Rent payments (8 verification states) ────────────────────────────────────
insert into public.rent_payments (id, installment_id, amount, payment_method, proof_url, submitted_by, status, admin_notes) values
  ('e2111111-1111-1111-1111-111111111101', 'd2111111-1111-1111-1111-111111111105', 5416.67, 'bank_transfer', 'https://example.com/proof/pending-1.pdf', 'd1111111-1111-1111-1111-111111111104', 'pending_verification', null),
  ('e2111111-1111-1111-1111-111111111102', 'd2111111-1111-1111-1111-111111111102', 36250, 'cheque', 'https://example.com/proof/pending-2.pdf', 'd1111111-1111-1111-1111-111111111101', 'pending_verification', null),
  ('e2111111-1111-1111-1111-111111111103', 'd2111111-1111-1111-1111-111111111107', 30833.33, 'bank_transfer', 'https://example.com/proof/pending-3.pdf', 'e839333b-5e72-419e-90e6-e39e9c6ca557', 'pending_verification', null),
  ('e2111111-1111-1111-1111-111111111104', 'd2111111-1111-1111-1111-111111111101', 36250, 'bank_transfer', null, 'd1111111-1111-1111-1111-111111111101', 'approved', 'Verified against bank statement'),
  ('e2111111-1111-1111-1111-111111111105', 'd2111111-1111-1111-1111-111111111106', 41250, 'cheque', null, 'd1111111-1111-1111-1111-111111111105', 'approved', null),
  ('e2111111-1111-1111-1111-111111111106', 'd2111111-1111-1111-1111-111111111111', 36666.67, 'bank_transfer', null, 'd1111111-1111-1111-1111-111111111103', 'approved', null),
  ('e2111111-1111-1111-1111-111111111107', 'd2111111-1111-1111-1111-111111111103', 72000, 'bank_transfer', 'https://example.com/proof/rejected-1.pdf', 'd1111111-1111-1111-1111-111111111102', 'rejected', 'Amount mismatch — please resubmit'),
  ('e2111111-1111-1111-1111-111111111108', 'd2111111-1111-1111-1111-111111111112', 5416.67, 'cheque', 'https://example.com/proof/rejected-2.pdf', 'd1111111-1111-1111-1111-111111111104', 'rejected', 'Cheque image unclear')
on conflict (id) do nothing;

-- ── Service requests: 8 complaints ───────────────────────────────────────────
insert into public.service_requests (id, lease_id, product_id, tenant_user_id, request_type, category, priority, title, description, status, assigned_agent_id, sla_due_at) values
  ('f3111111-1111-1111-1111-111111111101', 'c1111111-1111-1111-1111-111111111101', 'f1111111-1111-1111-1111-111111111101', 'd1111111-1111-1111-1111-111111111101', 'complaint', 'noise', 'high', 'Loud renovation next door', 'Construction noise daily 7am–6pm affecting work-from-home.', 'open', 'a1111111-1111-1111-1111-111111111102', now() + interval '2 days'),
  ('f3111111-1111-1111-1111-111111111102', 'c1111111-1111-1111-1111-111111111102', 'f1111111-1111-1111-1111-111111111104', 'd1111111-1111-1111-1111-111111111102', 'complaint', 'building', 'normal', 'Lift out of service', 'Main lift has been down for 3 days.', 'in_progress', 'a1111111-1111-1111-1111-111111111101', now() + interval '1 day'),
  ('f3111111-1111-1111-1111-111111111103', 'c1111111-1111-1111-1111-111111111103', 'f1111111-1111-1111-1111-111111111103', 'd1111111-1111-1111-1111-111111111103', 'complaint', 'neighbour', 'urgent', 'Parking dispute', 'Neighbour repeatedly blocks assigned parking bay.', 'resolved', 'a1111111-1111-1111-1111-111111111102', now() - interval '1 day'),
  ('f3111111-1111-1111-1111-111111111104', 'c1111111-1111-1111-1111-111111111104', 'f1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111104', 'complaint', 'general', 'low', 'Package room access', 'Access card not working for parcel room.', 'closed', 'a1111111-1111-1111-1111-111111111101', now() - interval '5 days'),
  ('f3111111-1111-1111-1111-111111111105', 'c1111111-1111-1111-1111-111111111105', 'f1111111-1111-1111-1111-111111111107', 'd1111111-1111-1111-1111-111111111105', 'complaint', 'noise', 'normal', 'Late-night gatherings', 'Repeated parties in adjacent unit after midnight.', 'open', 'a1111111-1111-1111-1111-111111111102', now() + interval '3 days'),
  ('f3111111-1111-1111-1111-111111111106', 'c1111111-1111-1111-1111-111111111106', 'f1111111-1111-1111-1111-111111111108', 'e839333b-5e72-419e-90e6-e39e9c6ca557', 'complaint', 'building', 'high', 'AC common area too cold', 'Lobby and corridor AC set extremely low.', 'in_progress', 'a1111111-1111-1111-1111-111111111101', now() + interval '2 days'),
  ('f3111111-1111-1111-1111-111111111107', 'c1111111-1111-1111-1111-111111111101', 'f1111111-1111-1111-1111-111111111101', 'd1111111-1111-1111-1111-111111111101', 'complaint', 'general', 'low', 'Gym equipment broken', 'Treadmill out of order for two weeks.', 'open', 'a1111111-1111-1111-1111-111111111102', now() + interval '4 days'),
  ('f3111111-1111-1111-1111-111111111108', 'c1111111-1111-1111-1111-111111111103', 'f1111111-1111-1111-1111-111111111103', 'd1111111-1111-1111-1111-111111111103', 'complaint', 'neighbour', 'normal', 'Pet policy violation', 'Neighbour keeps large dog in no-pet building.', 'resolved', 'a1111111-1111-1111-1111-111111111102', now() - interval '2 days')
on conflict (id) do nothing;

-- ── Service requests: 8 maintenance ──────────────────────────────────────────
insert into public.service_requests (id, lease_id, product_id, tenant_user_id, request_type, category, priority, title, description, status, assigned_agent_id, sla_due_at) values
  ('f3111111-1111-1111-1111-111111111201', 'c1111111-1111-1111-1111-111111111101', 'f1111111-1111-1111-1111-111111111101', 'd1111111-1111-1111-1111-111111111101', 'maintenance', 'plumbing', 'urgent', 'Kitchen sink leak', 'Water pooling under kitchen sink cabinet.', 'open', 'a1111111-1111-1111-1111-111111111102', now() + interval '1 day'),
  ('f3111111-1111-1111-1111-111111111202', 'c1111111-1111-1111-1111-111111111102', 'f1111111-1111-1111-1111-111111111104', 'd1111111-1111-1111-1111-111111111102', 'maintenance', 'hvac', 'high', 'AC not cooling', 'Master bedroom AC blowing warm air.', 'in_progress', 'a1111111-1111-1111-1111-111111111101', now() + interval '2 days'),
  ('f3111111-1111-1111-1111-111111111203', 'c1111111-1111-1111-1111-111111111103', 'f1111111-1111-1111-1111-111111111103', 'd1111111-1111-1111-1111-111111111103', 'maintenance', 'electrical', 'normal', 'Flickering lights', 'Living room ceiling lights flicker intermittently.', 'resolved', 'a1111111-1111-1111-1111-111111111102', now() - interval '1 day'),
  ('f3111111-1111-1111-1111-111111111204', 'c1111111-1111-1111-1111-111111111104', 'f1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111104', 'maintenance', 'appliance', 'low', 'Dishwasher error', 'Dishwasher shows E24 drain error.', 'closed', 'a1111111-1111-1111-1111-111111111101', now() - interval '7 days'),
  ('f3111111-1111-1111-1111-111111111205', 'c1111111-1111-1111-1111-111111111105', 'f1111111-1111-1111-1111-111111111107', 'd1111111-1111-1111-1111-111111111105', 'maintenance', 'plumbing', 'normal', 'Bathroom tap drip', 'Guest bathroom tap drips constantly.', 'open', 'a1111111-1111-1111-1111-111111111102', now() + interval '3 days'),
  ('f3111111-1111-1111-1111-111111111206', 'c1111111-1111-1111-1111-111111111106', 'f1111111-1111-1111-1111-111111111108', 'e839333b-5e72-419e-90e6-e39e9c6ca557', 'maintenance', 'hvac', 'high', 'Thermostat unresponsive', 'Smart thermostat not responding to app.', 'in_progress', 'a1111111-1111-1111-1111-111111111101', now() + interval '1 day'),
  ('f3111111-1111-1111-1111-111111111207', 'c1111111-1111-1111-1111-111111111104', 'f1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111104', 'maintenance', 'general', 'low', 'Balcony door stuck', 'Sliding balcony door difficult to open.', 'open', 'a1111111-1111-1111-1111-111111111101', now() + interval '5 days'),
  ('f3111111-1111-1111-1111-111111111208', 'c1111111-1111-1111-1111-111111111103', 'f1111111-1111-1111-1111-111111111103', 'd1111111-1111-1111-1111-111111111103', 'maintenance', 'electrical', 'urgent', 'Power outlet sparking', 'Kitchen outlet sparked when plugging in kettle.', 'resolved', 'a1111111-1111-1111-1111-111111111102', now() - interval '3 days')
on conflict (id) do nothing;

-- ── Service request messages (8) ─────────────────────────────────────────────
insert into public.service_request_messages (id, request_id, author_user_id, author_role, body) values
  ('f4111111-1111-1111-1111-111111111101', 'f3111111-1111-1111-1111-111111111101', 'd1111111-1111-1111-1111-111111111101', 'tenant', 'Noise starts at 7am sharp every weekday.'),
  ('f4111111-1111-1111-1111-111111111102', 'f3111111-1111-1111-1111-111111111102', 'e839333b-5e72-419e-90e6-e39e9c6ca557', 'agent', 'Building management contacted — technician scheduled tomorrow.'),
  ('f4111111-1111-1111-1111-111111111103', 'f3111111-1111-1111-1111-111111111201', 'd1111111-1111-1111-1111-111111111101', 'tenant', 'Please attend before 5pm if possible.'),
  ('f4111111-1111-1111-1111-111111111104', 'f3111111-1111-1111-1111-111111111201', 'e839333b-5e72-419e-90e6-e39e9c6ca557', 'agent', 'Plumber assigned for today 2–4pm.'),
  ('f4111111-1111-1111-1111-111111111105', 'f3111111-1111-1111-1111-111111111206', 'e839333b-5e72-419e-90e6-e39e9c6ca557', 'tenant', 'Tried resetting the thermostat — no change.'),
  ('f4111111-1111-1111-1111-111111111106', 'f3111111-1111-1111-1111-111111111103', 'e839333b-5e72-419e-90e6-e39e9c6ca557', 'agent', 'Security spoke with neighbour — issue resolved.'),
  ('f4111111-1111-1111-1111-111111111107', 'f3111111-1111-1111-1111-111111111202', 'd1111111-1111-1111-1111-111111111102', 'tenant', 'AC filter was cleaned last month.'),
  ('f4111111-1111-1111-1111-111111111108', 'f3111111-1111-1111-1111-111111111208', 'e839333b-5e72-419e-90e6-e39e9c6ca557', 'agent', 'Electrician replaced faulty outlet — safe to use.')
on conflict (id) do nothing;

-- ── Move-in checklists (8, varied completion) ────────────────────────────────
insert into public.move_in_checklists (id, lease_id, items, tenant_signed_at) values
  ('f5111111-1111-1111-1111-111111111101', 'c1111111-1111-1111-1111-111111111101', '[{"id":"keys","label":"Collect keys","done":true},{"id":"ejari","label":"Ejari registration","done":true},{"id":"dewa","label":"DEWA connection","done":true},{"id":"inspection","label":"Move-in inspection","done":true}]'::jsonb, now() - interval '85 days'),
  ('f5111111-1111-1111-1111-111111111102', 'c1111111-1111-1111-1111-111111111102', '[{"id":"keys","label":"Collect keys","done":true},{"id":"ejari","label":"Ejari registration","done":true},{"id":"dewa","label":"DEWA connection","done":false},{"id":"inspection","label":"Move-in inspection","done":true}]'::jsonb, null),
  ('f5111111-1111-1111-1111-111111111103', 'c1111111-1111-1111-1111-111111111103', '[{"id":"keys","label":"Collect keys","done":true},{"id":"ejari","label":"Ejari registration","done":false},{"id":"dewa","label":"DEWA connection","done":false},{"id":"inspection","label":"Move-in inspection","done":false}]'::jsonb, null),
  ('f5111111-1111-1111-1111-111111111104', 'c1111111-1111-1111-1111-111111111104', '[{"id":"keys","label":"Collect keys","done":true},{"id":"ejari","label":"Ejari registration","done":true},{"id":"dewa","label":"DEWA connection","done":true},{"id":"inspection","label":"Move-in inspection","done":false}]'::jsonb, null),
  ('f5111111-1111-1111-1111-111111111105', 'c1111111-1111-1111-1111-111111111105', '[{"id":"keys","label":"Collect keys","done":true},{"id":"ejari","label":"Ejari registration","done":false},{"id":"dewa","label":"DEWA connection","done":false},{"id":"inspection","label":"Move-in inspection","done":false}]'::jsonb, null),
  ('f5111111-1111-1111-1111-111111111106', 'c1111111-1111-1111-1111-111111111106', '[{"id":"keys","label":"Collect keys","done":true},{"id":"ejari","label":"Ejari registration","done":true},{"id":"dewa","label":"DEWA connection","done":true},{"id":"inspection","label":"Move-in inspection","done":true}]'::jsonb, now() - interval '190 days'),
  ('f5111111-1111-1111-1111-111111111107', 'c1111111-1111-1111-1111-111111111107', '[{"id":"keys","label":"Collect keys","done":false},{"id":"ejari","label":"Ejari registration","done":false},{"id":"dewa","label":"DEWA connection","done":false},{"id":"inspection","label":"Move-in inspection","done":false}]'::jsonb, null),
  ('f5111111-1111-1111-1111-111111111108', 'c1111111-1111-1111-1111-111111111108', '[{"id":"keys","label":"Collect keys","done":true},{"id":"ejari","label":"Ejari registration","done":true},{"id":"dewa","label":"DEWA connection","done":true},{"id":"inspection","label":"Move-in inspection","done":true}]'::jsonb, now() - interval '395 days')
on conflict (id) do nothing;

-- ── Tenant documents (8) ─────────────────────────────────────────────────────
insert into public.tenant_documents (id, lease_id, doc_type, file_url, verified_at) values
  ('f6111111-1111-1111-1111-111111111101', 'c1111111-1111-1111-1111-111111111101', 'ejari', 'https://example.com/docs/ejari-marina-view.pdf', now() - interval '80 days'),
  ('f6111111-1111-1111-1111-111111111102', 'c1111111-1111-1111-1111-111111111101', 'lease', 'https://example.com/docs/lease-marina-view.pdf', now() - interval '88 days'),
  ('f6111111-1111-1111-1111-111111111103', 'c1111111-1111-1111-1111-111111111102', 'dewa', 'https://example.com/docs/dewa-studio.pdf', null),
  ('f6111111-1111-1111-1111-111111111104', 'c1111111-1111-1111-1111-111111111103', 'id', 'https://example.com/docs/id-marcus.pdf', now() - interval '25 days'),
  ('f6111111-1111-1111-1111-111111111105', 'c1111111-1111-1111-1111-111111111104', 'ejari', 'https://example.com/docs/ejari-marina-walk.pdf', null),
  ('f6111111-1111-1111-1111-111111111106', 'c1111111-1111-1111-1111-111111111106', 'lease', 'https://example.com/docs/lease-townhouse.pdf', now() - interval '195 days'),
  ('f6111111-1111-1111-1111-111111111107', 'c1111111-1111-1111-1111-111111111105', 'other', 'https://example.com/docs/inventory-downtown.pdf', null),
  ('f6111111-1111-1111-1111-111111111108', 'c1111111-1111-1111-1111-111111111108', 'dewa', 'https://example.com/docs/dewa-heights-archived.pdf', now() - interval '400 days')
on conflict (id) do nothing;

-- ── Owner statements (8) ─────────────────────────────────────────────────────
insert into public.owner_statements (id, property_owner_id, period_start, period_end, gross_rent, fees, net_payout) values
  ('f7111111-1111-1111-1111-111111111101', 'b1111111-1111-1111-1111-111111111101', '2026-01-01', '2026-01-31', 36250, 1812.50, 34437.50),
  ('f7111111-1111-1111-1111-111111111102', 'b1111111-1111-1111-1111-111111111102', '2026-01-01', '2026-01-31', 72000, 3600, 68400),
  ('f7111111-1111-1111-1111-111111111103', 'b1111111-1111-1111-1111-111111111103', '2026-01-01', '2026-01-31', 36666.67, 2750, 33916.67),
  ('f7111111-1111-1111-1111-111111111104', 'b1111111-1111-1111-1111-111111111104', '2025-12-01', '2025-12-31', 5416.67, 270.83, 5145.84),
  ('f7111111-1111-1111-1111-111111111105', 'b1111111-1111-1111-1111-111111111105', '2026-01-01', '2026-01-31', 41250, 2475, 38775),
  ('f7111111-1111-1111-1111-111111111106', 'b1111111-1111-1111-1111-111111111106', '2026-01-01', '2026-01-31', 30833.33, 1541.67, 29291.66),
  ('f7111111-1111-1111-1111-111111111107', 'b1111111-1111-1111-1111-111111111107', '2025-11-01', '2025-11-30', 0, 0, 0),
  ('f7111111-1111-1111-1111-111111111108', 'b1111111-1111-1111-1111-111111111108', '2025-10-01', '2025-10-31', 8166.67, 653.33, 7513.34)
on conflict (id) do nothing;

-- ── Notifications (8 tenant + 4 landlord) ────────────────────────────────────
insert into public.notifications (id, user_id, recipient_role, title, body, link_href, is_read) values
  ('f8111111-1111-1111-1111-111111111101', 'd1111111-1111-1111-1111-111111111101', 'tenant', 'Rent due in 5 days', 'Your next cheque of AED 36,250 is due soon.', '/tenant/rent', false),
  ('f8111111-1111-1111-1111-111111111102', 'd1111111-1111-1111-1111-111111111102', 'tenant', 'Payment overdue', 'Studio rent payment is overdue. Please settle or upload proof.', '/tenant/rent', false),
  ('f8111111-1111-1111-1111-111111111103', 'd1111111-1111-1111-1111-111111111104', 'tenant', 'Complaint update', 'Your package room access complaint has been closed.', '/tenant/complaints', true),
  ('f8111111-1111-1111-1111-111111111104', 'e839333b-5e72-419e-90e6-e39e9c6ca557', 'tenant', 'Lease notice period', 'Your tenancy enters notice period — review renewal options.', '/tenant', false),
  ('f8111111-1111-1111-1111-111111111105', 'd1111111-1111-1111-1111-111111111103', 'tenant', 'Maintenance resolved', 'Electrical outlet repair completed.', '/tenant/maintenance', true),
  ('f8111111-1111-1111-1111-111111111106', 'd1111111-1111-1111-1111-111111111105', 'tenant', 'Move-in reminder', 'Complete DEWA registration on your move-in checklist.', '/tenant/move-in', false),
  ('f8111111-1111-1111-1111-111111111107', 'd1111111-1111-1111-1111-111111111101', 'tenant', 'Payment verified', 'Your rent payment of AED 36,250 has been confirmed.', '/tenant/rent', true),
  ('f8111111-1111-1111-1111-111111111108', 'd1111111-1111-1111-1111-111111111102', 'tenant', 'Payment rejected', 'Cheque proof rejected — please resubmit.', '/tenant/rent', false),
  ('f8111111-1111-1111-1111-111111111201', 'e839333b-5e72-419e-90e6-e39e9c6ca557', 'landlord', 'January statement ready', 'Your January owner statement is available.', '/owner/statements', false),
  ('f8111111-1111-1111-1111-111111111202', 'e839333b-5e72-419e-90e6-e39e9c6ca557', 'landlord', 'Maintenance on your unit', 'HVAC work order in progress at JVC Townhouse.', '/owner/maintenance', false),
  ('f8111111-1111-1111-1111-111111111203', 'e839333b-5e72-419e-90e6-e39e9c6ca557', 'landlord', 'Rent collected', 'AED 36,250 collected for Marina View 2BR.', '/owner', true),
  ('f8111111-1111-1111-1111-111111111204', 'e839333b-5e72-419e-90e6-e39e9c6ca557', 'landlord', 'Tenant notice', 'Tenant on JVC Townhouse has entered notice period.', '/owner/portfolio', false)
on conflict (id) do nothing;
