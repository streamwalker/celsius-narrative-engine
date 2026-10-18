import { readFile } from 'node:fs/promises';
const audit = JSON.parse(await readFile('ionos-release/dependency-audit.json', 'utf8'));
const graph = JSON.parse(await readFile('dist/bundle-policy.json', 'utf8'));
if (audit.error || !audit.metadata?.vulnerabilities || !audit.vulnerabilities) throw new Error('The dependency audit is incomplete; do not publish.');
if (graph.cliModulesInBrowserBundle !== 0 || graph.checkedModuleCount < 1) throw new Error('Browser module exclusion was not verified.');
const exceptions = new Set(['mammoth', 'argparse', 'sprintf-js']);
for (const [name, finding] of Object.entries(audit.vulnerabilities)) {
  if (['high', 'critical'].includes(finding.severity) || !exceptions.has(name)) throw new Error(`Unreviewed runtime dependency finding: ${name} (${finding.severity}).`);
  for (const via of finding.via) {
    if (typeof via === 'object' && via.url !== 'https://github.com/advisories/GHSA-hp3w-g68c-fv3c') throw new Error(`New advisory requires review: ${via.url}`);
  }
}
console.log(JSON.stringify({ status: 'passed-with-documented-CLI-only-exception', counts: audit.metadata.vulnerabilities, excludedFromBrowser: graph.excludedCliPackages, note: 'No high/critical production dependency findings. The remaining sprintf-js CLI advisory is not fixed upstream; argparse/sprintf-js are absent from the actual browser module graph. Do not expose the Mammoth CLI as a server service.' }, null, 2));
