#!/usr/bin/env python3
"""
Minimal MCP server wrapping coptic.io's public REST API
(https://api.coptic.io), so it can be added to Claude as a custom
connector the same way orthocal.info was.

Exposes two tools, mirroring Orthocal's shape:
  - search_saints(query): find which day(s) a saint is commemorated on
  - get_day(date):        Synaxarium + readings for a Gregorian date

Requires:
    pip install "mcp[cli]" httpx

Run:
    python coptic_mcp_server.py

This starts a Streamable HTTP MCP server. By default FastMCP serves it
at http://0.0.0.0:8000/mcp -- adjust host/port below if needed.

If running in a GitHub Codespace: after starting this, forward port
8000 in the Ports tab, set its visibility to "Public", then add
https://<your-codespace-name>-8000.app.github.dev/mcp as a custom
connector in Claude, exactly as you did for orthocal.info.

NOT independently tested end-to-end against a live deployment --
verify the tool calls return sensible data before relying on it for
corpus work. If FastMCP's default path/port differ in the installed
version, check `mcp.settings` or the printed startup banner.
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
