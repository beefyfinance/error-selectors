import { LRUMemoryCache } from './LRUMemoryCache.js';
import type { ErrorSignatureAbi, Selector } from './types.js';
import { ErrorSignaturesLoader, type ErrorSignaturesLoaderOptions } from './ErrorSignaturesLoader.js';
import { parseAbiItem } from 'viem';

export type ErrorAbisLoaderOptions = {
  maxSelectorsInCache?: number;
  data: ErrorSignaturesLoaderOptions;
}

export class ErrorAbisLoader {
  private readonly signatures: ErrorSignaturesLoader;
  private readonly cache: LRUMemoryCache<Selector, ErrorSignatureAbi[]>;

  constructor({ data, maxSelectorsInCache = 1000 }: ErrorAbisLoaderOptions) {
    this.signatures = new ErrorSignaturesLoader(data);
    this.cache = new LRUMemoryCache({ capacity: maxSelectorsInCache });
  }

  async get(selector: Selector) {
    if (!selector || selector.length !== 10 || !selector.startsWith('0x')) {
      throw new Error(`Invalid selector ${selector}`);
    }

    const cached = this.cache.get(selector);
    if (cached) {
      return cached;
    }

    const signatures = await this.signatures.get(selector);
    if (!signatures) {
      return undefined;
    }
    const withAbis = signatures.map((signature) => ({
      signature,
      abi: parseAbiItem(`error ${signature}` as const),
    }));
    this.cache.set(selector, withAbis);
    return withAbis;
  }
}