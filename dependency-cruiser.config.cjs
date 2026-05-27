/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'src-must-not-import-tests',
      severity: 'error',
      from: {
        path: '^src/',
      },
      to: {
        path: '^tests/',
      },
    },
    {
      name: 'src-must-not-import-readonly-references',
      severity: 'error',
      from: {
        path: '^src/',
      },
      to: {
        path: '^(Blueprints_lib|Osiris_ref|plugins/pl-ru-codex/skills/(blueprint-design|osiris-design))/',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    exclude: {
      path: '^(node_modules|\\.next|Blueprints_lib|Osiris_ref|plugins/pl-ru-codex/skills/(blueprint-design|osiris-design))/',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
};
