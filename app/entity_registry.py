"""
entity_registry.py — the generic get/compare/rank/lookup engine (doc §3.2)
============================================================================
PHASE A of the router refactor. Nothing in stage4_lookup_area_data.py
changes. Every function this file imports is used exactly as it exists
today — this file only makes them addressable by (entity_type, metric)
instead of buried inside ai_chat.py's if/elif chain.

Where an original branch did more than call one resolver (roi combines
sale + rent; developer_lookup combines projects + license info; area
comparison uses a dedicated SQL path for efficiency), that composition
is preserved here as a named "shaped resolver" — so the exact same
computation still happens, it's just reachable through get()/compare()
instead of only through a hardcoded branch. These are documented
composites, not hidden special cases: each one is a metric like any
other, just defined in terms of other metrics.

Four operations (doc §3.2):
    get(entity_type, entity_value, metric, **filters)
    compare(entity_type, entity_values, metric, **filters)
    rank(entity_type, metric, **filters)
    lookup(entity_type, entity_value)   # == get(..., metric="profile")
"""
from clients import logger, normalize_area
from stage4_lookup_area_data import (
    lookup_area_data,
    lookup_project_data,
    lookup_comparison_data,
    get_recent_transactions,
    get_all_areas,
    get_district_properties,
    get_area_projects,
    get_developer_projects,
    get_price_trend,
    get_top_areas,
    get_top_projects,
    get_top_developers,
    get_market_overview,
    get_budget_area_recommendations,
    get_rental_yield,
    get_developer_info,
    get_area_developers,
    get_unit_inventory,
    get_sale_index,
    get_valuation_stats,
    get_legal_knowledge,
    get_broker_info,
    compute_market_signal,
    get_escrow_agent,
)


# ---------------------------------------------------------------------------
# Shaped resolvers — thin wrappers ONLY where the original branch did more
# than "call one stage4 function and return its result." Every one of these
# is a straight copy of the logic that used to live inline in
# ai_chat.py's _build_lookup_data(), just given a name and a registry slot.
# ---------------------------------------------------------------------------

def _area_profile(area, bedrooms=None, **_):
    return lookup_area_data(area, bedrooms=bedrooms)


def _area_properties(area, **_):
    properties, total = get_district_properties(area)
    if not properties:
        return None
    return {"area": area, "properties": properties, "total_property_count": total}


def _area_projects(area, **_):
    projects = get_area_projects(area)
    if not projects:
        return None
    return {"area": normalize_area(area) or area, "area_projects": projects}


def _area_developers(area, **_):
    developers = get_area_developers(area)
    if not developers:
        return None
    data = {"area": normalize_area(area) or area, "area_developers": developers}
    developer_ids = sorted({d["developer_id"] for d in developers if d.get("developer_id") is not None})
    info = get_developer_info(developer_ids)
    if info:
        data["developer_info"] = info
    return data


def _area_valuation(area, bedrooms=None, **_):
    data = _area_profile(area, bedrooms=bedrooms)
    if data is not None:
        valuation = get_valuation_stats(area)
        if valuation is not None:
            data["valuation"] = valuation
        else:
            logger.info(
                "get(area, valuation): sale data found for %r but no valuation "
                "records exist — returning sale data alone", area,
            )
    return data


def _make_roi_resolver(entity_type):
    """roi is a composite metric: sale-side profile + rental yield, combined
    in Python from two real numbers. Registered once per entity_type so
    get('area', ..., 'roi') and get('project', ..., 'roi') both work."""
    def _resolver(entity_value, bedrooms=None, **_):
        data = get(entity_type, entity_value, "profile", bedrooms=bedrooms)
        if data is None:
            return None
        rent_area = entity_value if entity_type == "area" else data.get("area")
        rental = get_rental_yield(rent_area, bedrooms=bedrooms)
        if rental is not None:
            sale_ppsqm = data.get("avg_price_per_sqm")
            rent_ppsqm = rental.get("avg_rent_per_sqm")
            if sale_ppsqm and rent_ppsqm:
                rental["gross_yield_pct"] = round((rent_ppsqm / sale_ppsqm) * 100, 2)
            data["rental_yield"] = rental
        else:
            logger.info(
                "get(%s, roi): sale data found for %r but no rent contracts "
                "exist — returning sale data alone", entity_type, entity_value,
            )
        # NOTE on escrow_agent: no separate call needed here. For
        # entity_type="project", the get(..., "profile", ...) call above
        # already resolves through _project_profile(), which attaches
        # "escrow_agent" itself — adding a second call here would just
        # fire the same RPC twice for no benefit (caught by
        # test_get_project_roi_attaches_escrow_agent expecting exactly
        # one call). data already carries escrow_agent when found.
        return data
    return _resolver


def _developer_profile(developer, **_):
    projects = get_developer_projects(developer)
    if not projects:
        return None
    data = {"developer": developer, "developer_projects": projects}
    developer_ids = sorted({p["developer_id"] for p in projects if p.get("developer_id") is not None})
    info = get_developer_info(developer_ids)
    if info:
        data["developer_info"] = info
    return data


def _broker_profile(broker_name, **_):
    brokers = get_broker_info(broker_name)
    if not brokers:
        return None
    return {"broker_name": broker_name, "brokers": brokers}


def _project_profile(project, bedrooms=None, **_):
    """NEW FUNCTIONALITY — mirrors the escrow-agent append ai_chat.py's
    default path does inline for a plain project lookup (see
    get_escrow_agent's docstring in stage4). Additive only: same
    lookup_project_data() call as before, only ever adds a new
    "escrow_agent" key on top of its existing return."""
    data = lookup_project_data(project, bedrooms=bedrooms)
    if data is not None:
        escrow = get_escrow_agent(project)
        if escrow:
            data["escrow_agent"] = escrow
    return data


def _unit_inventory(project, **_):
    inventory = get_unit_inventory(project)
    if not inventory:
        return None
    return {"project": project, "unit_inventory": inventory}


def _market_overview(year=None, **_):
    result = get_market_overview(year=year)
    return result if result else None


def _budget_areas(budget=None, limit=6, **_):
    """Closes the confirmed-live "which areas fit my budget" gap — see
    get_budget_area_recommendations()'s own docstring in stage4 for the
    full story (previously fell through to market_overview)."""
    result = get_budget_area_recommendations(budget, limit=limit)
    return result if result else None


def _market_index(index_property_type="all", **_):
    result = get_sale_index(property_type=index_property_type)
    return result if result else None


def _document_profile(question_text, **_):
    """§3.7: lookup() applied to documents instead of database rows."""
    chunks = get_legal_knowledge(question_text)
    if not chunks:
        return None
    return {"legal_chunks": chunks}


def _area_list(**_):
    areas = get_all_areas()
    return {"all_areas": areas} if areas else None


# ---------------------------------------------------------------------------
# The registry: (entity_type, metric) -> resolver
# ---------------------------------------------------------------------------

ENTITY_METRICS = {
    "area": {
        "profile":             _area_profile,
        "properties":          _area_properties,
        "projects":            _area_projects,
        "developers":          _area_developers,
        "valuation":           _area_valuation,
        "roi":                 _make_roi_resolver("area"),
        "list":                _area_list,   # entity_value=None
    },
    "project": {
        "profile":              _project_profile,
        "roi":                  _make_roi_resolver("project"),
        "unit_inventory":       _unit_inventory,
    },
    "developer": {
        "profile": _developer_profile,
    },
    "broker": {
        "profile": _broker_profile,
    },
    "market": {
        "overview":     _market_overview,
        "index":        _market_index,
        "budget_areas": _budget_areas,
    },
    "document": {
        "profile": _document_profile,
    },
}

# rank() targets — each maps straight onto an existing stage4 ranking fn.
RANKABLE_ENTITIES = {
    "area":      get_top_areas,
    "project":   get_top_projects,
    "developer": get_top_developers,
}

# compare() — where a dedicated, more efficient SQL path already exists
# (two areas in one round trip), use it. Anything not listed here falls
# back to composing get() once per value, which is correct but slower.
COMPARE_RESOLVERS = {
    "area": lambda values, bedrooms=None, **_: lookup_comparison_data(
        values[0], values[1], bedrooms=bedrooms
    ),
}


# ---------------------------------------------------------------------------
# The four generic operations
# ---------------------------------------------------------------------------

def get(entity_type: str, entity_value, metric: str, **filters):
    """One metric for one entity. entity_value may be None for entity
    types that don't need one (e.g. entity_type='market')."""
    resolver = ENTITY_METRICS.get(entity_type, {}).get(metric)
    if resolver is None:
        logger.warning("get(): no resolver registered for entity_type=%r metric=%r", entity_type, metric)
        return None
    try:
        return resolver(entity_value, **filters) if entity_value is not None else resolver(**filters)
    except Exception as e:
        logger.error("get(%r, %r, %r) failed: %s", entity_type, entity_value, metric, e)
        return None


def compare(entity_type: str, entity_values: list, metric: str = "profile", **filters):
    """Same metric, two or more entities, side by side."""
    entity_values = [v for v in (entity_values or []) if v]
    if len(entity_values) < 2:
        return None

    bespoke = COMPARE_RESOLVERS.get(entity_type)
    if bespoke and len(entity_values) == 2:
        try:
            result = bespoke(entity_values, **filters)
            return result if result else None
        except Exception as e:
            logger.error("compare(): bespoke resolver failed for %r %r: %s", entity_type, entity_values, e)
            return None

    results = {v: get(entity_type, v, metric, **filters) for v in entity_values}
    if not any(results.values()):
        return None
    return {"comparison": results}


def rank(entity_type: str, metric: str = "volume", year=None, limit=10, **filters):
    """Top N entities by a metric."""
    resolver = RANKABLE_ENTITIES.get(entity_type)
    if resolver is None:
        logger.warning("rank(): no ranking resolver for entity_type=%r", entity_type)
        return None
    try:
        result = resolver(metric=metric, year=year, limit=limit)
        return result if result else None
    except Exception as e:
        logger.error("rank(%r, %r) failed: %s", entity_type, metric, e)
        return None


def lookup(entity_type: str, entity_value):
    """Profile / reference info for one entity."""
    return get(entity_type, entity_value, "profile")


# ---------------------------------------------------------------------------
# §3.3.1 — market_signal stays a pure derived field, re-exported unchanged
# so callers only need one import (entity_registry) for the whole engine.
# ---------------------------------------------------------------------------
market_signal = compute_market_signal
recent_transactions = get_recent_transactions
price_trend = get_price_trend
