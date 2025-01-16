import { type ByteArray, bytesToHex, type Hex, hexToBytes, isHex } from 'viem';
import type { AnyResult, Selector } from './types.js';

export function isSelector(value: unknown): value is Selector {
  return isHex(value, { strict: true }) && value.length === 10 && value !== '0x';
}

export function prefixHex(value: string): Hex {
  if (value.length % 2 !== 0) {
    throw new Error('Invalid hex data length');
  }

  const maybeHex = value.startsWith('0x') ? value : `0x${value}`;
  if (!isHex(maybeHex, { strict: true })) {
    throw new Error('Invalid hex data');
  }

  return maybeHex;
}

export function isDataEmpty(data: string | ByteArray): boolean {
  return typeof data === 'string' ? !data.length || data === '0x' : data.length === 0;
}

export function dataToString(data: string | ByteArray, onlyPrintable = true): string {
  const text = bytesToString(typeof data === 'string' ? hexToBytes(prefixHex(data)) : data);
  if (onlyPrintable && !isPrintable(text)) {
    throw new Error('Non-printable characters');
  }
  return text;
}

export function dataToHex(data: string | ByteArray): Hex {
  return typeof data === 'string' ? prefixHex(data) : bytesToHex(data);
}

export function bytesToString(data: ByteArray): string {
  const decoder = new TextDecoder('utf-8', { fatal: true });
  // @ts-ignore
  return decoder.decode(data.buffer);
}

export function isPrintable(text: string): boolean {
  // if there are no control characters, the string is printable
  return !text.match(/\p{C}/u);
}

export type SelectorParams = {
  selector: Selector;
  params: ByteArray;
}

export function splitRevertData(revertData: string | ByteArray): SelectorParams {
  let selector: string;
  let params: ByteArray;

  if (typeof revertData === 'string') {
    revertData = prefixHex(revertData);
    selector = revertData.substring(0, 10).toLowerCase();
    params = hexToBytes(`0x${revertData.substring(10)}`);
  } else {
    selector = bytesToHex(revertData.slice(0, 5));
    params = revertData.slice(5);
  }

  if (!isSelector(selector)) {
    throw new Error('Invalid selector');
  }

  return { selector, params };
}

export function scoreErrorResult(error: AnyResult): number {
  switch (error.type) {
    case 'decoded':
      return 100000;
    case 'matched':
      return 10000;
    case 'text':
      return 1000;
    case 'unmatched':
      return 100;
    case 'empty':
      return 10;
    case 'unparsed':
      return 1;
  }
}

export function compareErrorResults(a: AnyResult, b: AnyResult): number {
  const scoreA = scoreErrorResult(a);
  const scoreB = scoreErrorResult(b);
  return scoreA === scoreB ? 0 : scoreA > scoreB ? -1 : 1;
}