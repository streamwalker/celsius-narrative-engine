/** Prove command-line-only dependencies are absent from emitted browser chunks. */
export function ionosBundlePolicy() {
  return {
    name: 'celsius-browser-module-policy',
    generateBundle(_options, bundle) {
      const ids = [...new Set(Object.values(bundle).filter(x => x.type === 'chunk').flatMap(x => Object.keys(x.modules)))];
      const forbidden = ids.filter(id => /node_modules\/(?:argparse|sprintf-js)\//.test(id.replaceAll('\\', '/')));
      if (forbidden.length) this.error('The unpatched Mammoth CLI dependency chain must not enter the frontend bundle.');
      this.emitFile({ type: 'asset', fileName: 'bundle-policy.json', source: JSON.stringify({ policyVersion: 1, checkedModuleCount: ids.length, excludedCliPackages: ['argparse', 'sprintf-js'], cliModulesInBrowserBundle: forbidden.length, limitation: 'This is a module-graph check, not a complete application security audit.' }, null, 2) });
    },
  };
}
