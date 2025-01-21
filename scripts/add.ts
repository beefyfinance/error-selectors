import { extractErrors, readAbi, type SelectorSignature, type SelectorSignatureByPrefix } from '../src/abi-utils.js';
import type { ErrorSignature } from '../src/types.js';
import { readFile, writeFile } from 'node:fs/promises';
import { join as pathJoin } from 'node:path';

const dataPath = pathJoin(__dirname, '..', 'src', 'data');
const prefixLength = 2;
const args = process.argv.slice(2);

if (args.length !== 1) {
  console.error('Usage: bun run add path/to/abi.json');
  process.exit(1);
}

const [ abiPath ] = args;
const abi = await readAbi(abiPath);
const errors = extractErrors(abi);
if (errors.length === 0) {
  console.error('No errors found in ABI');
  process.exit(1);
}

const byPrefix = errors.reduce((acc: SelectorSignatureByPrefix, error: SelectorSignature) => {
  const prefix = error.selector.substring(2, 2 + prefixLength);
  acc[prefix] ??= [];
  acc[prefix].push(error);
  return acc;
}, {});

for (const [ prefix, errors ] of Object.entries(byPrefix)) {
  const path = `${dataPath}/${prefix}.json`;
  const data = await readFile(path, 'utf-8').then(JSON.parse);
  let updated = false;
  let inserted = false;

  for (const error of errors) {
    const existingSelector = data[error.selector];
    if (existingSelector) {
      const existingSignature = existingSelector.find((s: ErrorSignature) => s === error.signature);
      if (existingSignature) {
        console.error(`${error.signature} already exists`);
      } else {
        console.warn(`Adding ${error.signature} to ${error.selector}`);
        existingSelector.push(error.signature);
        updated = true;
      }
    } else {
      data[error.selector] = [ data.signature ];
      inserted = true;
    }
  }

  if (updated || inserted) {
    let dataToWrite = data;
    if (inserted) {
      dataToWrite = Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b)));
    }
    await writeFile(path, JSON.stringify(dataToWrite, null, 2));
    console.log(`Wrote ${path}`);
  }
}

