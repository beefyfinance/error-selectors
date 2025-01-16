import { ErrorDecoder } from './lib/ErrorDecoder.js';

const decoder = new ErrorDecoder({
  path: './data', // where .json files with errors are
  prefixLength: 2, // how many characters are of selector are used as file buckets, 2 => 00.json -> ff.json
  maxFilesInCache: 5, // how many data files are kept in memory, set to 256 for all when using 2 prefixLength
  maxSelectorsInCache: 1000, // how many selectors are kept in memory
});

const results = await decoder.decode('0xdb42144d000000000000000000000000d1e13d528123eafe5ae8703c64ef243331040d9d000000000000000000000000000000000000000000000015a8bce1b91eba5e7200000000000000000000000000000000000000000000005f2bb5bf5025c5e226');
console.dir(results, { depth: null });

/*
Output:
[
  {
    type: "decoded",
    selector: "0xdb42144d",
    signature: "InsufficientBalance(address,uint256,uint256)",
    abi: {
      name: "InsufficientBalance",
      type: "error",
      inputs: [
        {
          type: "address",
        }, {
          type: "uint256",
        }, {
          type: "uint256",
        }
      ],
    },
    data: "0xdb42144d000000000000000000000000d1e13d528123eafe5ae8703c64ef243331040d9d000000000000000000000000000000000000000000000015a8bce1b91eba5e7200000000000000000000000000000000000000000000005f2bb5bf5025c5e226",
    params: [
      "0xD1E13d528123EAfE5aE8703c64EF243331040D9D",
      399540466827094810226n,
      1755590320867774947878n
    ],
  }
]
*/
