#!/usr/bin/env python3
"""
Verify citation links in Jekyll-formatted technical reports.
Checks for valid HTTP/HTTPS responses and broken links.
"""

import re
import sys
from urllib.request import urlopen
from urllib.error import URLError, HTTPError
from pathlib import Path
from typing import Dict, List, Tuple

def extract_urls(markdown_content: str) -> List[Tuple[str, int]]:
    """Extract all URLs from markdown content with line numbers."""
    urls = []
    for i, line in enumerate(markdown_content.split('\n'), 1):
        # Match URLs in markdown links [text](url) and plain URLs
        url_patterns = [
            r'\[.*?\]\((https?://[^\)]+)\)',  # Markdown links
            r'(https?://[^\s\)]+)',  # Plain URLs
        ]
        for pattern in url_patterns:
            for match in re.finditer(pattern, line):
                url = match.group(1)
                if url not in [u[0] for u in urls]:  # Avoid duplicates
                    urls.append((url, i))
    return urls

def verify_url(url: str, timeout: int = 5) -> Tuple[bool, str]:
    """
    Verify that a URL is accessible.
    Returns (is_valid, status_message)
    """
    try:
        # Use a proper User-Agent to avoid bot-blocking (e.g. readthedocs.io)
        from urllib.request import Request
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}
        req = Request(url, headers=headers)
        response = urlopen(req, timeout=timeout)
        status = response.status if hasattr(response, 'status') else 200
        return True, f"✓ HTTP {status}"
    except HTTPError as e:
        return False, f"✗ HTTP {e.code} ({e.reason})"
    except URLError as e:
        return False, f"✗ Connection error: {str(e.reason)[:50]}"
    except Exception as e:
        return False, f"✗ Error: {str(e)[:50]}"

def check_file(filepath: Path) -> Dict:
    """Check all citations in a markdown file."""
    if not filepath.exists():
        return {'error': f"File not found: {filepath}"}

    content = filepath.read_text(encoding='utf-8')
    urls = extract_urls(content)

    results = {
        'file': str(filepath),
        'total_urls': len(urls),
        'valid': 0,
        'broken': 0,
        'details': []
    }

    for url, line_num in urls:
        is_valid, message = verify_url(url)
        results['details'].append({
            'url': url,
            'line': line_num,
            'status': message,
            'valid': is_valid
        })
        if is_valid:
            results['valid'] += 1
        else:
            results['broken'] += 1

    return results

def main():
    """Main entry point."""
    reports_dir = Path('/Users/alyshialedlie/code/personal-site/_reports')

    # Files to check
    files_to_check = [
        reports_dir / 'agentic-self-optimization-architecture.md',
        reports_dir / 'self-optimizing-agentic-systems.md'
    ]

    all_results = []
    total_valid = 0
    total_broken = 0

    print("=" * 70)
    print("Citation Link Verification Report")
    print("=" * 70)

    for filepath in files_to_check:
        print(f"\nFile: {filepath.name}")
        print("-" * 70)

        result = check_file(filepath)

        if 'error' in result:
            print(f"  ERROR: {result['error']}")
            continue

        print(f"  Total URLs: {result['total_urls']}")
        print(f"  Valid: {result['valid']}")
        print(f"  Broken: {result['broken']}")

        all_results.append(result)
        total_valid += result['valid']
        total_broken += result['broken']

        if result['broken'] > 0:
            print("\n  Broken links:")
            for detail in result['details']:
                if not detail['valid']:
                    print(f"    Line {detail['line']:4d}: {detail['url']}")
                    print(f"              {detail['status']}")

    print("\n" + "=" * 70)
    print("Summary")
    print("=" * 70)
    print(f"Total URLs checked: {total_valid + total_broken}")
    print(f"Valid: {total_valid}")
    print(f"Broken: {total_broken}")

    if total_broken > 0:
        print("\n⚠️  Some citations are broken. Fix before publishing.")
        return 1
    else:
        print("\n✓ All citations verified successfully.")
        return 0

if __name__ == '__main__':
    sys.exit(main())
