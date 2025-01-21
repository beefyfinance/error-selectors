# @beefyfinance/error-selectors

Flat file database of errors selectors extracted from ABIs.

## Usage

```typescript
import { ErrorDecoder } from '@beefyfinance/error-selectors';

const decoder = new ErrorDecoder();
const results = await decoder.decode('0xdb42144d000000000000000000000000d1e13d528123eafe5ae8703c64ef243331040d9d000000000000000000000000000000000000000000000015a8bce1b91eba5e7200000000000000000000000000000000000000000000005f2bb5bf5025c5e226');
console.dir(results, { depth: null });
```

```typescript
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
```

## Development

To install dependencies:

```bash
bun install
```

To run example:

```bash
bun run start
```

To run tests:

```bash
bun test
```

To add more errors:

```bash
bun run add path/to/abi.json
```