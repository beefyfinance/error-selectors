import { LRUMemoryCache } from './LRUMemoryCache.js';
import type { ErrorSignature, ErrorSignaturesBySelector, Selector } from './types.js';
import type { Hex } from 'viem';
import { readFile } from 'node:fs/promises';

export type ErrorSignaturesLoaderOptions = {
  path: string;
  prefixLength?: number;
  maxFilesInCache?: number;
}

export class ErrorSignaturesLoader {
  private readonly cache: LRUMemoryCache<string, ErrorSignaturesBySelector>;
  private readonly prefixLength: number;
  private readonly path: string;

  constructor({ path, prefixLength = 2, maxFilesInCache = 2 }: ErrorSignaturesLoaderOptions) {
    this.cache = new LRUMemoryCache({
      capacity: maxFilesInCache,
    });
    this.prefixLength = prefixLength;
    this.path = path;
  }

  private async getMatchingPrefix(prefix: string) {
    const cached = this.cache.get(prefix);
    if (cached) {
      return cached;
    }

    const file = await readFile(`${this.path}/${prefix}.json`, 'utf-8');
    const data = JSON.parse(file) as ErrorSignaturesBySelector;
    if (!data || typeof data !== 'object') {
      throw new Error(`Contents of ${prefix}.json is invalid`);
    }
    this.cache.set(prefix, data);
    return data;
  }

  async get(selector: Selector) {
    if (selector.length !== 10 || !selector.startsWith('0x')) {
      throw new Error('Invalid selector');
    }
    const prefix = selector.substring(2, 2 + this.prefixLength);
    const matchingPrefix = await this.getMatchingPrefix(prefix);
    return matchingPrefix[selector];
  }
}