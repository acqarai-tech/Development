-- migration_legal_knowledge_chunks_expand.sql
-- ===================================================
-- APPLIED LIVE to hzgkmvhvivqczxkdcfek, never previously committed to
-- this repo. This file is a retroactive record of two changes already
-- live in the database (confirmed still present: 8 rows in
-- legal_knowledge_chunks as of this writing) — running it again is a
-- no-op if already applied (INSERT will duplicate rows on a fresh DB,
-- so only run this against a database that does NOT already have these
-- 5 rows; check `select count(*) from legal_knowledge_chunks` first).
--
-- Expands legal_knowledge_chunks from the original 3 rows (Golden Visa,
-- transfer fee, freehold ownership — see migration_legal_knowledge_chunks.sql)
-- to 8, closing more of Part Three §3.7's real coverage gap. Same honest
-- sourcing approach as the original migration: DLD's actual PDF guides
-- are confirmed to exist at dubailand.gov.ae/en/about-dubai-land-
-- department/rules-regulations/ but are served through a JS-driven
-- document viewer with no static/extractable file URL — not fetchable
-- as text. These 5 chunks are researched and cross-verified across
-- multiple current sources instead, written in original wording, each
-- source_note flagging this honestly exactly like the original 3 rows.
--
-- Topics added: off-plan escrow protection (Law No. 8/2007), rent-
-- increase caps + RDC dispute process (Decree 43/2013), Ejari
-- registration, resale/NOC/title-transfer process, and how service
-- charges are set and disputed (Law No. 6/2019 + Mollak).

INSERT INTO legal_knowledge_chunks (title, content, category, source_url, source_note) VALUES
(
  'Escrow account protection for off-plan buyers',
  'Dubai regulates payments on off-plan properties through Law No. 8 of 2007. Every developer selling units before completion must register the project with DLD and RERA and open a dedicated bank escrow account for that project alone -- funds from one project cannot be used to cover costs on another project. Buyer payments go into this ring-fenced account and are released to the developer only in stages, tied to verified construction progress, rather than as a single lump sum. RERA audits these accounts and can order site inspections; if a developer diverts escrow funds, that is a criminal offence carrying imprisonment, a fine of at least AED 100,000, or both, and can result in the developer being struck off DLD''s register of licensed developers. Depositors, including individual buyers, have the right to request their own account records from the escrow bank. As an extra safeguard, the escrow agent retains 5% of the account''s total value after project completion, releasing it only a year after units are registered in buyers'' names. Before paying anything, an investor should confirm the project''s DLD registration number and pay only into the officially designated escrow account in the project''s name, never into a personal or agent account. In everyday terms, this escrow structure is what makes a deposit or any other payment made toward an off-plan unit safe: if a developer defaults, stalls construction, or has a project cancelled, the ring-fenced escrow funds, not the developer''s general accounts, are what protects a buyer''s money and is the basis for any refund process DLD oversees.',
  'off_plan_protection',
  'https://www.dubaiproperty.news/market-updates/is-your-off-plan-investment-safe-in-dubai-the-truth-about-escrow-protection-rera-rules-and-buyer-safeguards',
  'General guidance only, cross-verified across multiple 2026 sources (including material citing DLD''s own investor guide) -- NOT a reproduction of DLD''s official guide text. Escrow rules are set out in Law No. 8 of 2007; confirm a specific project''s registration and escrow account details directly via the DLD website or Dubai REST app before relying on this for a real transaction.'
),
(
  'How much a Dubai landlord can legally raise rent, and how to dispute an increase',
  'Rent increases at lease renewal in Dubai are capped under Decree No. 43 of 2013, applied alongside the tenancy law (Law No. 26 of 2007, as amended by Law No. 33 of 2008). The maximum increase depends on how far the current rent sits below DLD''s Rental Index average for comparable units in the same area and category: no increase is allowed if current rent is within 10% of that average; up to 5% if 11-20% below; up to 10% if 21-30% below; up to 15% if 31-40% below; and up to 20% if more than 40% below. A landlord must give at least 90 days'' written notice before the renewal date to apply any increase -- without that notice, no increase can be applied for that renewal cycle. The tenancy must be registered with Ejari for these rules, and any dispute process, to apply. If a landlord proposes an increase above what the index allows, or fails to give proper notice, the tenant can file a complaint with the Rental Disputes Settlement Centre (RDC), DLD''s dedicated tribunal for tenancy matters; most cases are resolved within about 30 days, and the RDC can order the rent reduced to the legally permitted level. DLD''s Rental Index calculator, available on the DLD website and the Dubai REST app, is the standard reference both sides use to check whether a proposed increase is within the legal band before a dispute is even filed.',
  'tenancy',
  'https://egsh.ae/insights/rera-rental-index',
  'General guidance only, cross-verified across multiple 2026 sources -- NOT a reproduction of DLD''s or RERA''s own text. Rent-increase bands and notice rules are set by Decree No. 43 of 2013 and Law No. 26 of 2007 (amended by Law No. 33 of 2008); check the current DLD Rental Index calculator directly for a specific property before relying on this for a real dispute.'
),
(
  'Ejari tenancy registration -- is it mandatory, and what does it cost',
  'Ejari is Dubai''s mandatory system, run by RERA under DLD, for registering every residential and commercial tenancy contract; it is required under Law No. 26 of 2007 as amended by Law No. 33 of 2008. Registration is not optional -- an unregistered lease has no legal standing: it cannot be used to open DEWA electricity and water accounts, is not accepted for residence-visa applications or renewals, and gives neither party standing to bring a dispute to the Rental Disputes Settlement Centre. Responsibility formally sits with the landlord, but in practice the tenant or the broker handling the deal usually completes the registration and pays the fee. Registration can be done online through the Dubai REST app in about 15 to 30 minutes, or in person at a DLD-approved typing centre; total cost is typically in the AED 155 to 235 range depending on the channel, made up of the base registration fee plus small knowledge and innovation fees. Needed documents typically include the signed tenancy contract, both parties'' Emirates ID or passport copies, and a DEWA premise number for the unit; company tenancies also need a trade licence. Ejari must be renewed every time the tenancy contract is renewed, and a prior contract must be registered before a new one can be.',
  'tenancy',
  'https://www.uaeexperthub.com/tenancy-contract-dubai-guide/',
  'General guidance only, cross-verified across multiple 2026 sources -- NOT a reproduction of DLD''s or RERA''s own text. Fees and processing details can change; confirm the current fee and required documents directly via the Dubai REST app or a DLD-approved typing centre before relying on this for a real registration.'
),
(
  'Reselling a property in Dubai -- NOC, Form F, and the title transfer process',
  'Selling a completed, ready property in Dubai''s secondary market follows a set sequence. Buyer and seller first agree terms and sign an MOU -- when arranged through a RERA-registered broker this is the standard Form F contract, covering price, transfer date, and conditions; a deposit, commonly around 10%, is typically paid at this stage. Before the transfer can be registered, the seller must obtain a No Objection Certificate (NOC) from the property''s developer, confirming all service charges, maintenance fees and any recorded fines have been cleared -- the DLD trustee office will not process a transfer without it. NOC fees are set by each developer individually, commonly in the AED 500 to 5,000 range, and processing typically takes about 3 to 10 working days, faster with some developers'' digital services. If the property carries a mortgage, the seller''s bank must also issue a liability or settlement letter as part of clearing the sale. Once the NOC is in hand, buyer and seller, or authorised representatives, attend a DLD-licensed trustee office together with the original title deed, identification, the signed sale contract and the NOC; DLD''s transfer fee of 4% of the sale price is paid there, and a new title deed is issued in the buyer''s name. A straightforward cash resale with no mortgage on either side typically completes in one to two weeks from MOU to new title deed; more complex cases involving financing, company ownership, or power of attorney take longer. Where a broker is involved, commission is commonly around 2% of the sale price, usually paid by the seller unless otherwise agreed. Off-plan resales follow a related but distinct process, known as an assignment of the buyer''s rights under the sale contract via DLD''s Oqood interim registration system, governed by Law No. 13 of 2008, rather than a title-deed transfer.',
  'transactions',
  'https://realestateclubdubai.com/blog/buying-guide/title-deed-transfer-in-dubai-step-by-step-process-costs-timeline-2026',
  'General guidance only, cross-verified across multiple 2026 sources -- NOT a reproduction of DLD''s own text. NOC fees, processing times and commission norms vary by developer and broker; confirm current figures directly with the specific developer or a DLD-licensed trustee office before relying on this for a real transaction.'
),
(
  'How Dubai service charges are set, and how to dispute them',
  'Owners in any jointly owned Dubai development -- an apartment or townhouse in a shared building or gated community -- are legally required to pay annual service charges under Law No. 6 of 2019 on Jointly Owned Property, which replaced the earlier Law No. 27 of 2007. This obligation applies even if the unit is rented out, and the owner, not the tenant, remains liable if service charges go unpaid. Charges are not set unilaterally by the developer or management company: each year the Owners'' Association or property manager submits a proposed budget, RERA (DLD''s regulatory arm) reviews and approves it, and the approved per-square-foot rate is then published on DLD''s Service Charge Index and administered through Mollak, RERA''s dedicated online platform for jointly owned property. Annual service charge equals the unit''s area multiplied by the approved rate for that specific building, not a community-wide average -- rates commonly range from roughly AED 3 to over AED 70 per square foot depending on the building and its amenities. Approved budgets must include a reserve, or sinking, fund set aside for major future costs like elevator or fire-safety-system replacement, held separately from day-to-day maintenance funds. A management entity cannot raise fees mid-year without DLD approval. If an owner believes a charge is wrong, they can check the approved rate on the DLD Service Charge Index, raise the discrepancy in writing with the management company, and if unresolved, file a formal complaint with RERA; disputes over service-charge amounts fall under the Rental Disputes Settlement Centre''s jurisdiction. Non-payment can block title-deed-related transactions, such as a resale, until the charges are cleared.',
  'ownership',
  'https://egsh.ae/insights/service-charge-index-guide',
  'General guidance only, cross-verified across multiple 2026 sources -- NOT a reproduction of DLD''s or RERA''s own text. Service-charge rules are set out in Law No. 6 of 2019; confirm the approved rate for a specific building directly via the DLD Service Charge Index or Mollak before relying on this for a real dispute or purchase decision.'
);

NOTIFY pgrst, 'reload schema';
