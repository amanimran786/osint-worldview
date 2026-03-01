#!/usr/bin/env python3
"""
Standalone CLI OSINT data fetcher.

A lightweight command-line tool for ad-hoc OSINT data collection from
configurable HTTP endpoints. Useful for quick lookups outside the main
web dashboard.

Usage:
    python scripts/cli_fetcher.py -u https://example.com/api/feed
    python scripts/cli_fetcher.py -u https://feed1.com -u https://feed2.com -o results.json
"""
import argparse
import json
import logging
import sys
from typing import Any, Dict, List, Optional

import requests

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")


class OSINTFetcher:
    """
    Basic fetcher that retrieves JSON data from configurable endpoints.
    Extend this class with real OSINT sources and parsing logic.
    """

    def __init__(self, endpoints: Optional[List[str]] = None, timeout: int = 10) -> None:
        self.endpoints = endpoints or []
        self.timeout = timeout

    def add_endpoint(self, url: str) -> None:
        if url not in self.endpoints:
            self.endpoints.append(url)

    def fetch_all(self) -> List[Dict[str, Any]]:
        results: List[Dict[str, Any]] = []
        for url in self.endpoints:
            try:
                logging.info("Fetching from %s", url)
                resp = requests.get(url, timeout=self.timeout)
                resp.raise_for_status()
                data = self._parse_response(resp)
                results.append({"url": url, "data": data})
            except requests.RequestException as exc:
                logging.error("Failed to fetch from %s: %s", url, exc)
            except ValueError as exc:
                logging.error("Invalid response from %s: %s", url, exc)
        return results

    @staticmethod
    def _parse_response(resp: requests.Response) -> Any:
        ctype = resp.headers.get("Content-Type", "")
        if "application/json" in ctype:
            return resp.json()
        if "text/plain" in ctype or "text/html" in ctype:
            return resp.text
        raise ValueError(f"Unsupported content type: {ctype}")


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="OSINT Worldview CLI Fetcher")
    parser.add_argument(
        "-u", "--url",
        action="append",
        dest="urls",
        default=[],
        help="Endpoint URL to collect OSINT data (can be specified multiple times)",
    )
    parser.add_argument(
        "-o", "--output",
        dest="output",
        default=None,
        help="Output file path; prints to stdout if omitted",
    )
    parser.add_argument(
        "-t", "--timeout",
        dest="timeout",
        type=int,
        default=10,
        help="HTTP timeout in seconds (default: 10)",
    )
    return parser.parse_args(argv)


def main(argv: List[str]) -> int:
    args = parse_args(argv)
    if not args.urls:
        logging.error("No endpoints provided. Use -u/--url to specify one or more URLs.")
        return 1

    fetcher = OSINTFetcher(endpoints=args.urls, timeout=args.timeout)
    results = fetcher.fetch_all()

    if args.output:
        try:
            with open(args.output, "w", encoding="utf-8") as f:
                json.dump(results, f, indent=2)
            logging.info("Results written to %s", args.output)
        except OSError as exc:
            logging.error("Unable to write output: %s", exc)
            return 1
    else:
        print(json.dumps(results, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
