import type { ErrorSignaturesLoaderOptions } from './ErrorSignaturesLoader.js';
import { ErrorAbisLoader, type ErrorAbisLoaderOptions } from './ErrorAbisLoader.js';
import { type ByteArray, decodeAbiParameters } from 'viem';
import {
  compareErrorResults,
  dataToHex,
  dataToString,
  isDataEmpty,
  type SelectorParams,
  splitRevertData
} from './data-utils.js';
import type {
  AnyResult,
  DecodedResult, EmptyResult,
  ErrorSignatureAbi,
  MatchedResult,
  Selector,
  TextResult,
  UnmatchedResult,
  UnparsedResult
} from './types.js';

export type ErrorDecoderOptions = ErrorSignaturesLoaderOptions & Omit<ErrorAbisLoaderOptions, 'data'>;

export class ErrorDecoder {
  private readonly abis: ErrorAbisLoader;

  constructor(options: ErrorDecoderOptions) {
    this.abis = new ErrorAbisLoader({
      maxSelectorsInCache: options.maxSelectorsInCache,
      data: {
        path: options.path,
        maxFilesInCache: options.maxFilesInCache,
        prefixLength: options.prefixLength,
      }
    });
  }

  async decode(revertData: string | ByteArray): Promise<Array<AnyResult>> {
    if (isDataEmpty(revertData)) {
      return [ this.makeEmptyResult(revertData) ];
    }

    const split = this.trySplitData(revertData);
    if (!split) {
      return [ this.tryDecodeAsText(revertData) ];
    }

    const { selector, params } = split;
    const signatureAbis = await this.abis.get(selector);
    if (!signatureAbis || !signatureAbis.length) {
      return [ this.tryDecodeAsText(revertData, selector) ];
    }

    const results = signatureAbis.map(signatureAbi => this.tryDecodeWithSignature(revertData, selector, signatureAbi, params)).filter(Boolean).sort(compareErrorResults);
    if (results.length) {
      return results;
    }

    return [ this.makeUnmatchedResult(revertData, selector) ];
  }

  private makeTextResult(data: string | ByteArray, value: string): TextResult {
    return {
      type: 'text',
      data: dataToHex(data),
      value
    };
  }

  private makeUnmatchedResult(data: string | ByteArray, selector: Selector): UnmatchedResult {
    return {
      type: 'unmatched',
      data: dataToHex(data),
      selector
    };
  }

  private makeUnparsedResult(data: string | ByteArray): UnparsedResult {
    return {
      type: 'unparsed',
      data: dataToHex(data),
    };
  }

  private makeEmptyResult(data: string | ByteArray): EmptyResult {
    return {
      type: 'empty',
      data: dataToHex(data),
    };
  }

  private makeMatchedResult(data: string | ByteArray, selector: Selector, signatureAbi: ErrorSignatureAbi): MatchedResult {
    return {
      type: 'matched',
      selector,
      signature: signatureAbi.signature,
      abi: signatureAbi.abi,
      data: dataToHex(data),
    };
  }

  private makeDecodedResult(data: string | ByteArray, selector: Selector, signatureAbi: ErrorSignatureAbi, params?: readonly unknown[]): DecodedResult {
    return {
      type: 'decoded',
      selector,
      signature: signatureAbi.signature,
      abi: signatureAbi.abi,
      data: dataToHex(data),
      params,
    };
  }

  private tryDecodeWithSignature(data: string | ByteArray, selector: Selector, signatureAbi: ErrorSignatureAbi, paramsData: ByteArray): MatchedResult | DecodedResult {
    if (signatureAbi.abi.inputs.length === 0) {
      return this.makeDecodedResult(data, selector, signatureAbi);
    }

    try {
      const params = decodeAbiParameters(signatureAbi.abi.inputs, paramsData);
      return this.makeDecodedResult(data, selector, signatureAbi, params);
    } catch {
      return this.makeMatchedResult(data, selector, signatureAbi);
    }
  }

  private trySplitData(revertData: string | ByteArray): SelectorParams | false {
    try {
      return splitRevertData(revertData);
    } catch {
      return false;
    }
  }

  private tryDecodeAsText(revertData: string | ByteArray, selector?: Selector): TextResult | UnmatchedResult | UnparsedResult {
    if (!isDataEmpty(revertData)) {
      try {
        const text = dataToString(revertData);
        if (text && text.length) {
          return this.makeTextResult(revertData, text);
        }
      } catch {
      }
    }

    return selector ? this.makeUnmatchedResult(revertData, selector) : this.makeUnparsedResult(revertData);
  }
}