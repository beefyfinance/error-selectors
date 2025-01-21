import { expect, test } from 'bun:test';
import { extractErrors, readAbi } from '../src/abi-utils.js';

const abi = await readAbi(__dirname + '/abi.json');

test('extractErrors', async () => {
  expect(extractErrors(abi)).toMatchSnapshot();
});