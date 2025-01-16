import type { AbiError } from 'abitype';
import type { Hex } from 'viem';

export type Selector = `0x${string}`; // 0x + 4 bytes (8 characters) = 10 characters

export type ErrorSignature<
  name extends string = string,
  parameters extends string = string
> = `${name}(${parameters})`;

export type ErrorSignaturesBySelector = Record<Selector, ErrorSignature[]>;

export type ErrorSignatureAbi = {
  signature: ErrorSignature;
  abi: AbiError;
}

/** Selector matched a signature, and decoding succeeded */
export type DecodedResult = {
  type: 'decoded';
  selector: Selector;
  signature: ErrorSignature;
  abi: AbiError;
  data: Hex;
  params?: readonly unknown[];
}

/** Selector matched a signature, but the decoding failed */
export type MatchedResult = {
  type: 'matched';
  selector: Selector;
  signature: ErrorSignature;
  abi: AbiError;
  data: Hex;
}

/** Did not match any selectors, decoded whole data as string */
export type TextResult = {
  type: 'text';
  data: Hex;
  value: string;
}

/** Did not match any selectors */
export type UnmatchedResult = {
  type: 'unmatched';
  data: Hex;
  selector: Selector;
}

/** Did not match any selectors and failed to decode whole data as string */
export type UnparsedResult = {
  type: 'unparsed';
  data: Hex;
}

/** Revert data was empty */
export type EmptyResult = {
  type: 'empty';
  data: Hex;
}

export type AnyResult = DecodedResult | MatchedResult | TextResult | UnmatchedResult | UnparsedResult | EmptyResult;
