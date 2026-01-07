const { execSync } = require('child_process');
const { writeFileSync } = require('fs');
const { resolve } = require('path');

function getCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch (error) {
    console.warn('Nao foi possivel obter o hash do commit. Usando "dev".', error.message);
    return 'dev';
  }
}

function getPackageVersion() {
  try {
    const pkg = require('../package.json');
    return pkg.version || '0.0.0';
  } catch (error) {
    console.warn('Nao foi possivel ler package.json. Usando versao "0.0.0".', error.message);
    return '0.0.0';
  }
}

(function main() {
  const commit = getCommitHash();
  const version = getPackageVersion();

  const targetPath = resolve(__dirname, '../src/environments/build-info.ts');

  const content = `// Arquivo gerado automaticamente por scripts/set-build-info.cjs\n` +
    `// Nao edite manualmente.\n` +
    `export const buildInfo = {\n` +
    `  version: '${version}',\n` +
    `  commit: '${commit}'\n` +
    `} as const;\n`;

  writeFileSync(targetPath, content, { encoding: 'utf-8' });
  console.log('Arquivo build-info.ts gerado com sucesso:', { version, commit });
})();
