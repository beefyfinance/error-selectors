import { type Abi, type AbiFunction, type Hex, toFunctionSelector } from 'viem';
import type { AbiError } from 'abitype';
import type { ErrorSignature, Selector } from './types.js';
import { formatAbiItem } from 'viem/utils';
import { readFile } from 'node:fs/promises';

export function isAbi(item: unknown): item is Abi {
  return !!item && Array.isArray(item) && item.every((item) => typeof item === 'object');
}

export function isAbiError(item: Abi[number]): item is AbiError {
  return item.type === 'error';
}

export function toErrorSelector(abi: AbiError): Hex {
  const fnAbi: AbiFunction = {
    type: 'function',
    name: abi.name,
    inputs: abi.inputs,
    outputs: [],
    stateMutability: 'nonpayable',
  }

  return toFunctionSelector(fnAbi);
}

export async function readAbi(path: string): Promise<Abi> {
  const abi = await readFile(path, 'utf-8').then(JSON.parse);
  if (!isAbi(abi)) {
    throw new Error('Invalid ABI');
  }
  return abi;
}

export type SelectorSignature = {
  selector: Selector;
  signature: ErrorSignature;
}

export type SelectorSignatureByPrefix = Record<string, SelectorSignature[]>;

export function extractErrors(abi: Abi): Array<{selector: Selector, signature: ErrorSignature}> {
  const abiErrors = abi.filter(isAbiError);
  if (!abiErrors.length) {
    return [];
  }

  return abiErrors.map((error) => ({
    selector: toErrorSelector(error),
    signature: formatAbiItem(error) as ErrorSignature
  }));
}