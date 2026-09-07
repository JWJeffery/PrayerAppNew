#!/usr/bin/env python3
"""
Minimal MCP server wrapping coptic.io's public REST API
(https://api.coptic.io), so it can be added to Claude as a custom
connector the same way orthocal.info was.

Exposes two tools, mirroring Orthocal's shape:
  - search_saints(query): find which day(s) a saint is commemorated on
  - get_day(date):        Synaxarium + readings for a Gregorian date

Requires:
    pip install "mcp[cli]>=1.10.1,<2.0.0" httpx

IMPORTANT: pin mcp<2. The mcp Python SDK's 2.x line (released July 2026)
renamed FastMCP to MCPServer and moved the whole module -- an unpinned
`pip install "mcp[cli]"` will grab 2.x and this script fails at import
with "No module named 'mcp.server.fastmcp'". Confirmed 2026-09-07:
`pip install "mcp[cli]>=1.10.1,<2.0.0" httpx` fixes it, no code change
needed.

Also confirmed 2026-09-07, worth remembering in a Codespace with
several Pythons floating around: install and run with the SAME
explicit interpreter path (e.g. `/workspaces/PrayerAppNew/.venv/bin/python`
for both the pip install and the run), or a bare `python` invocation
can silently pick up a different environment than the one just
installed into and hit the same v2 import error again.

Run (from that same pinned interpreter):
    python scripts/coptic-mcp-server.py

This starts a Streamable HTTP MCP server on http://127.0.0.1:8000/mcp.

VERIFIED WORKING 2026-09-07: connected as a custom connector via a
GitHub Codespace port-forward (Ports tab -> forward 8000 -> set
visibility to Public -> add https://<codespace-name>-8000.app.github.dev/mcp
as the connector URL -- note the path is /mcp, not /mpc, a typo that
tripped this up once already). Both search_saints and get_day
confirmed returning real Synaxarium data, cross-checked against
copticchurch.net. A GET to / or /favicon.ico from the Codespace port
preview correctly 404s -- that's not a failure, the server only
answers at /mcp. One early call failed with "No approval received";
an immediate retry succeeded -- cause not identified, watch for
recurrence.

This process must be running for the connector to work. It does NOT
survive a Codespace restart/rebuild on its own -- after any restart,
re-run it and re-check the forwarded port is still Public (Codespaces
can reset port visibility on restart).
"""

import httpx
from mcp.server.fastmcp import FastMCP

BASE = "https://api.coptic.io/api"

mcp = FastMCP("coptic")


@mcp.tool()
async def search_saints(query: str) -> dict:
    """
    Search the Coptic Synaxarium for a saint or commemoration by name.
    Returns matches with the Coptic-calendar date(s) each is kept on.
    """
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(f"{BASE}/synaxarium/search/query", params={"q": query})
        r.raise_for_status()
        return r.json()


@mcp.tool()
async def get_day(date: str) -> dict:
    """
    Get the Synaxarium (saints commemorated) and daily readings for a
    single Gregorian date. `date` must be in YYYY-MM-DD format, e.g.
    "2026-01-01".
    """
    async with httpx.AsyncClient(timeout=15.0) as client:
        synaxarium = await client.get(f"{BASE}/synaxarium/{date}")
        synaxarium.raise_for_status()
        readings = await client.get(f"{BASE}/readings/{date}")
        readings.raise_for_status()
        return {
            "date": date,
            "synaxarium": synaxarium.json(),
            "readings": readings.json(),
        }


@mcp.tool()
async def get_day_coptic(coptic_date: str) -> dict:
    """
    Get the Synaxarium for a date given in the Coptic calendar directly,
    e.g. "7 Toba". Useful when a corpus row's dayLegacy is already a
    Coptic-calendar date rather than a Gregorian one.
    """
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(f"{BASE}/synaxarium/coptic/{coptic_date}")
        r.raise_for_status()
        return r.json()


if __name__ == "__main__":
    # Streamable HTTP transport, so it can be added as a remote connector
    # the same way orthocal.info's server was.
    mcp.run(transport="streamable-http")
