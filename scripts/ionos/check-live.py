#!/usr/bin/env python3
"""Read-only, public HTTP checks after upload. Python 3.10+, no packages.
Usage: python3 check-live.py https://your-confirmed-domain.example --profile production
Does not sign in, create records, send email or invoke AI generation.
"""
import argparse
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('origin')
parser.add_argument('--profile', choices=['staging', 'production'], required=True)
args = parser.parse_args()
base = urllib.parse.urlsplit(args.origin)
if base.scheme != 'https' or not base.netloc or base.path not in ('', '/') or base.query or base.fragment or base.username:
    parser.error('Use the final HTTPS domain root, not a subdirectory.')
origin = args.origin.rstrip('/')
failures = []

def fetch(path):
    try:
        with urllib.request.urlopen(urllib.request.Request(origin + path, headers={'User-Agent': 'Celsius-Release-Check/1.0'}), timeout=25) as r:
            return r.status, r.headers, r.read(8 * 1024 * 1024)
    except urllib.error.HTTPError as e:
        return e.code, e.headers, e.read()

def check(ok, label):
    print(('PASS ' if ok else 'FAIL ') + label)
    if not ok:
        failures.append(label)

try:
    status, headers, body = fetch('/')
    check(status == 200 and b'id="root"' in body, 'Built Celsius entry page')
    check(headers.get('X-Content-Type-Options') == 'nosniff', 'Apache security headers')
    check('no-cache' in headers.get('Cache-Control', ''), 'HTML revalidation')
    check(('noindex' in headers.get('X-Robots-Tag', '')) == (args.profile == 'staging'), 'Correct indexing profile')
    html = body.decode('utf8')
    scripts = re.findall(r'src="(/assets/[^"?#]+\.js)"', html)
    check(bool(scripts), 'Production entry script present')
    for script in scripts:
        s, h, b = fetch(script)
        check(s == 200 and ('javascript' in h.get('Content-Type', '')) and not b.lstrip().startswith(b'<!doctype'), 'JavaScript MIME: ' + script)
    for route in ['/story-architect', '/narrative-engine/guide', '/library', '/characters', '/terms', '/privacy']:
        s, _, b = fetch(route)
        check(s == 200 and b'id="root"' in b, 'Direct navigation: ' + route)
    for route, expected in [('/assets/celsius-missing.js', 404), ('/.env', 403), ('/.git/config', 403), ('/src/main.tsx', 403), ('/api/celsius-missing', 404)]:
        s, _, _ = fetch(route)
        check(s == expected, 'Protected/missing path: ' + route)
    s, _, b = fetch('/release.json')
    manifest = json.loads(b)
    check(s == 200 and manifest.get('app') == 'Celsius' and manifest.get('profile') == args.profile, 'Release manifest/profile')
    print('Source revision:', manifest.get('sourceRevision'))
except Exception as e:
    failures.append(str(e))
    print('FAIL', e)
print('These checks do not verify account login, cloud projects, RLS or AI functions.')
sys.exit(1 if failures else 0)
