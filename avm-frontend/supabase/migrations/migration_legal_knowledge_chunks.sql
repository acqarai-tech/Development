-- migration_legal_knowledge_chunks.sql
-- ===================================================
-- APPLIED LIVE to hzgkmvhvivqczxkdcfek on 2026-08-19, in two passes
-- (see LIVE FIX below). This file reflects the CURRENT live state.
--
-- Closes Part Two §2.2 finding + Part Three §3.7: "legal/general
-- questions get the wrong fallback" -- "Am I eligible for a Golden Visa
-- if I buy property?" was correctly classified as legal_or_general but
-- returned the generic no-data-for-that-area template instead of real
-- guidance.
--
-- DEVIATION FROM THE DOC'S SUGGESTION, FOR AN HONEST REASON: §3.7
-- suggests "a simple embeddings table." Real vector embeddings need an
-- embeddings API call (OpenAI/Groq/etc.) -- no such credentials were
-- available to generate or test them in this session. Built on
-- PostgreSQL full-text search instead (tsvector + GIN index) -- zero
-- external API dependency, fully testable now, a legitimate approach
-- for a small, curated knowledge base this size. pgvector is available
-- as an extension (not enabled) for a future upgrade once embedding API
-- credentials exist in the deployed environment.
--
-- CONTENT NOTE: seeded with 3 chunks (Golden Visa AED 2M threshold, DLD
-- 4% transfer fee, freehold ownership areas), researched and cross-
-- verified against 2026 sources -- NOT the actual DLD User Guide PDFs
-- the doc references (not available in this session). Every row's
-- source_note makes this explicit; Stage 5 always surfaces it.
--
-- LIVE FIX (found immediately while verifying, same day): the initial
-- search_legal_knowledge used plainto_tsquery directly, which ANDs
-- every significant word together. The doc's own example question --
-- "Am I eligible for a Golden Visa if I buy property?" -- produced
-- 'elig' & 'golden' & 'visa' & 'buy' & 'properti', and because the
-- Golden Visa chunk says "owning" rather than "buy", one missing term
-- failed the WHOLE match and returned zero rows, even though the chunk
-- is obviously the right answer. Fixed by converting the AND query to
-- OR (any significant word can match), so ts_rank naturally ranks a
-- chunk matching MORE terms higher, without requiring an exact
-- all-terms match. Verified against the exact failing question after
-- the fix -- now correctly returns the Golden Visa chunk top-ranked.

CREATE TABLE IF NOT EXISTS public.legal_knowledge_chunks (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  source_url text,
  source_note text NOT NULL,
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
  ) STORED,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_legal_knowledge_search ON public.legal_knowledge_chunks USING GIN(search_vector);

ALTER TABLE public.legal_knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Read-only reference content, safe for anon/authenticated to read;
-- no write policy, so only the service-role key (used server-side by
-- ai_chat.py) can insert/update.
CREATE POLICY "legal_knowledge_chunks_public_read" ON public.legal_knowledge_chunks
  FOR SELECT USING (true);

-- Current live version (post-fix): OR logic between query terms.
CREATE OR REPLACE FUNCTION public.search_legal_knowledge(query_text text, result_limit int DEFAULT 3)
RETURNS TABLE(
  title text,
  content text,
  category text,
  source_url text,
  source_note text,
  rank real
)
LANGUAGE sql
STABLE
AS $$
  SELECT c.title, c.content, c.category, c.source_url, c.source_note,
         ts_rank(c.search_vector, query) AS rank
  FROM legal_knowledge_chunks c,
       LATERAL (
         SELECT regexp_replace(
           plainto_tsquery('english', query_text)::text, ' & ', ' | ', 'g'
         )::tsquery AS query
       ) q
  WHERE c.search_vector @@ query
  ORDER BY rank DESC
  LIMIT result_limit;
$$;

-- Seed content -- see CONTENT NOTE above.
INSERT INTO legal_knowledge_chunks (title, content, category, source_url, source_note) VALUES
(
  'Golden Visa eligibility through property investment',
  'As of 2026, a real estate investor can qualify for a 10-year UAE Golden Visa by owning property (or a combined property portfolio) worth at least AED 2 million, registered with the Dubai Land Department. In February 2026, the UAE removed the previous requirement to have paid at least 50% of the property value upfront -- eligibility now depends on the DLD-certified value reaching AED 2 million, regardless of how much has actually been paid. Mortgaged properties still qualify, provided the certified value (or the buyer''s equity) meets the threshold, and the lending bank issues a No Objection Certificate (NOC). Off-plan properties qualify if bought from a DLD-approved developer. Joint ownership is allowed if each owner independently meets the threshold. For investors below the AED 2 million threshold, DLD''s separate Taskeen programme offers a 2-year investor visa instead. General eligibility also requires being 18+, a non-UAE national, with a clean criminal record and valid health insurance.',
  'golden_visa',
  'https://www.globalcitizensolutions.com/golden-visa-uae/',
  'General guidance only, cross-verified across multiple 2026 industry sources -- NOT DLD''s own official guide text. Golden Visa rules are federal (issued via ICP/GDRFA, not DLD) and can change; confirm current requirements directly with ICP or a licensed immigration advisor before relying on this for a real application.'
),
(
  'DLD property transfer fee',
  'The Dubai Land Department charges a transfer fee of 4% of the property''s sale price on virtually all real estate transactions -- ready properties, off-plan registrations (called Oqood at this stage, converting to a Title Deed at handover), and resales alike. This rate has been unchanged since a Dubai Executive Council resolution in September 2013 (previously 2%). By law the fee splits 2%/2% between buyer and seller, but Dubai market convention is that the buyer pays the full 4%, unless negotiated otherwise in the sale contract. On top of the 4% fee, buyers should budget for smaller fixed charges: a trustee office fee (roughly AED 4,000-4,200), a title deed issuance fee (around AED 250-580), and a map fee. If financing with a mortgage, add a mortgage registration fee of 0.25% of the loan amount. Altogether, government and administrative fees typically add roughly 6-8% on top of the purchase price.',
  'fees',
  'https://www.uaeexperthub.com/dld-fees-property-transfer-costs-dubai/',
  'General guidance only, cross-verified across multiple 2026 sources -- NOT DLD''s own official fee schedule. Fee amounts can change; confirm the current schedule directly on the DLD website or with a registered trustee office before relying on this for a real transaction.'
),
(
  'Freehold property ownership for foreign nationals in Dubai',
  'Since the 2002 Freehold Decree (Law No. 7), non-UAE nationals have been able to buy property in Dubai with full freehold ownership -- meaning ownership of both the unit and the land it sits on, with no time limit, and the right to sell, lease, or pass the property to heirs. This right only applies inside Dubai''s designated freehold areas -- there are over 60 of them, including Downtown Dubai, Dubai Marina, Business Bay, JVC (Jumeirah Village Circle), Palm Jumeirah, and Dubai Hills Estate. Outside these designated areas, property ownership generally remains restricted to UAE and GCC nationals (some non-freehold areas allow leasehold arrangements of up to 99 years instead of full ownership). There is no cap on the number of freehold properties a foreign national can own, and no nationality-based quota. Every freehold purchase must still be registered with the Dubai Land Department and result in a title deed to be legally valid.',
  'ownership',
  'https://realestateclubdubai.com/blog/buying-guide/can-foreigners-buy-property-in-dubai-eligibility-rules-freehold-areas-and-restrictions-explained',
  'General guidance only, cross-verified across multiple 2026 sources -- NOT DLD''s own official guide text. Whether a SPECIFIC property or area is currently designated freehold should always be confirmed directly with DLD or a licensed broker before relying on this for a real transaction.'
);

NOTIFY pgrst, 'reload schema';
