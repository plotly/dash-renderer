const fs = require('fs');
const os = require('os');
const path = require('path');

let version = require('../package.json').version;

if (version.includes('rc')) {
    version = version.replace('-', '');
}

fs.writeFileSync(
    path.resolve(__dirname, '../dash_renderer/version.py'),
    `__version__ = '${version}'${os.EOL}`,
    { flag: 'w' }
);