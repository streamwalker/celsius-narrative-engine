"""CI smoke checks of the full compiled frontend. No production accounts or network calls.
Uses real browser-profile storage, not a Storage mock. Apache rules are tested separately.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlsplit
import json
import tempfile
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[2]
out = root / 'ionos-release' / 'browser-checks'
out.mkdir(parents=True, exist_ok=True)

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        local = Path(self.translate_path(self.path))
        if not local.exists() and '.' not in urlsplit(self.path).path.rsplit('/', 1)[-1]:
            self.path = '/index.html'
        return super().do_GET()
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(root / 'dist')))
Thread(target=server.serve_forever, daemon=True).start()
origin = f'http://127.0.0.1:{server.server_port}'
report = {'scope': 'Full compiled app, isolated CI Chromium, real browser-profile localStorage', 'checks': [], 'runtimeErrors': [], 'limitation': 'External requests blocked. No live sign-in, email, RLS, cloud records, uploads or AI execution is asserted.'}
profile = tempfile.mkdtemp(prefix='celsius-browser-profile-')
try:
    with sync_playwright() as pw:
        def launch():
            c = pw.chromium.launch_persistent_context(profile, headless=True, viewport={'width': 1536, 'height': 1000})
            c.route('**/*', lambda route: route.continue_() if route.request.url.startswith(origin + '/') or route.request.url.startswith(('data:', 'blob:')) else route.abort())
            return c
        c = launch()
        p = c.pages[0]
        p.on('pageerror', lambda error: report['runtimeErrors'].append(str(error)))
        p.goto(origin + '/story-architect', wait_until='domcontentloaded')
        p.get_by_role('heading', name='Build a world that pushes back.').wait_for()
        consent = p.get_by_role('button', name='Essential Only')
        if consent.count():
            consent.click()
        p.get_by_role('button', name='Explore a sample').click()
        p.get_by_label('Working title', exact=True).fill('IONOS persistence check')
        p.get_by_label('What happens?', exact=True).fill('This edit survives a browser restart.')
        p.get_by_text('Saved on this device', exact=True).wait_for()
        p.reload(wait_until='domcontentloaded')
        p.get_by_label('Working title', exact=True).wait_for()
        assert p.get_by_label('Working title', exact=True).input_value() == 'IONOS persistence check'
        report['checks'].append('Story edit persists after full page reload')
        c.close()
        c = launch()
        p = c.pages[0]
        p.on('pageerror', lambda error: report['runtimeErrors'].append(str(error)))
        p.goto(origin + '/story-architect', wait_until='domcontentloaded')
        p.get_by_label('Working title', exact=True).wait_for()
        assert p.get_by_label('Working title', exact=True).input_value() == 'IONOS persistence check'
        assert p.get_by_label('What happens?', exact=True).input_value() == 'This edit survives a browser restart.'
        report['checks'].append('Story survives browser process close/reopen')
        with p.expect_download() as download:
            p.get_by_role('button', name='Export story', exact=True).click()
        export = out / 'sample-export.json'
        download.value.save_as(str(export))
        assert json.loads(export.read_text())['project']['title'] == 'IONOS persistence check'
        p.locator('input[type=file]').set_input_files(str(export))
        p.get_by_role('button', name='Import as new story', exact=True).click()
        assert p.get_by_label('Current story').locator('option').count() == 3
        report['checks'].append('Real JSON download/import creates a separate project')
        p.get_by_role('button', name='World atlas').click()
        p.get_by_label('Rule / what this makes possible or impossible', exact=True).fill('A revised rule requires renewed approval.')
        p.get_by_role('button', name='Review desk').click()
        p.get_by_role('button', name='Story journey').click()
        report['checks'].append('World editing and Review Desk navigation')
        p.screenshot(path=str(out / 'desktop.png'), full_page=True)
        for route in ['/narrative-engine/guide', '/library', '/characters', '/terms', '/privacy']:
            p.goto(origin + route, wait_until='domcontentloaded')
            p.wait_for_function('document.querySelector("#root")?.innerText.trim().length > 0')
            report['checks'].append('Full app route renders: ' + route)
        p.set_viewport_size({'width': 390, 'height': 844})
        p.goto(origin + '/story-architect', wait_until='domcontentloaded')
        p.get_by_label('Working title', exact=True).wait_for()
        assert p.evaluate('document.documentElement.scrollWidth <= innerWidth')
        report['checks'].append('390px mobile viewport has no horizontal page overflow')
        p.screenshot(path=str(out / 'mobile.png'), full_page=True)
        c.close()
    assert not report['runtimeErrors'], report['runtimeErrors']
    report['result'] = 'passed'
except Exception as error:
    report['result'] = 'failed'
    report['error'] = str(error)
    raise
finally:
    server.shutdown()
    (out / 'report.json').write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))
