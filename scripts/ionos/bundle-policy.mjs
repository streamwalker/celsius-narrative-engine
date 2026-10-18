/** Verify CLI and build-time tools are absent from the emitted browser modules. */
export function ionosBundlePolicy() {
  return {
    name: 'celsius-browser-module-policy',
    generateBundle(_options, bundle) {
      const ids = [...new Set(Object.values(bundle).filter(x => x.type === 'chunk').flatMap(x => Object.keys(x.modules)))];
      const cli = ['argparse', 'sprintf-js'];
      const buildOnly = ['tailwindcss', 'tailwindcss-animate', 'postcss', 'chokidar', 'fast-glob', 'braces', 'glob'];
      const matches = packages => ids.filter(id => packages.some(name => id.replaceAll('\\', '/').includes(`/node_modules/${name}/`)));
      const forbidden = matches([...cli, ...buildOnly]);
      if (forbidden.length) this.error(`CLI/build dependencies must not enter browser chunks: ${forbidden.join(', ')}`);
      this.emitFile({ type: 'asset', fileName: 'bundle-policy.json', source: JSON.stringify({ policyVersion: 2, checkedModuleCount: ids.length, excludedCliPackages: cli, excludedBuildPackages: buildOnly, cliModulesInBrowserBundle: matches(cli).length, buildToolModulesInBrowserBundle: matches(buildOnly).length, limitation: 'Module-graph check only; development-tool advisories and live backend security are separate reviews.' }, null, 2) });
    },
  };
}
