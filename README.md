# `@leawind/delegate`

[![GitHub License](https://img.shields.io/github/license/Leawind/delegate-ts)](https://github.com/Leawind/delegate-ts)
[![JSR Version](https://jsr.io/badges/@leawind/delegate)](https://jsr.io/@leawind/delegate)
[![deno score](https://jsr.io/badges/@leawind/delegate/score)](https://jsr.io/@leawind/delegate/doc)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Leawind/delegate-ts/deno-test.yaml?branch=main&logo=github-actions&label=test)](https://github.com/Leawind/delegate-ts/actions/workflows/deno-test.yaml)

`Delegate` handles event listeners with features such as priority-based execution, one-time listeners, listener keys, and event control mechanisms. Ideal for scenarios requiring fine-grained control over event propagation and handler lifecycle management.

## Features

- **Priority Control** Define execution order using priorities. Higher-priority listeners run first.
- **Listener Keys** Associate listeners with unique keys to override or manage them independently.
- **Event Object API**
  - `event.data` Get the event data which being broadcasted.
  - `event.stop()`: Stop the event from propagating to other listeners.
  - `event.removeSelf()`: Remove the current listener from the delegate.

## Installation

|          |                                      |
| -------- | ------------------------------------ |
| **deno** | `deno add jsr:@leawind/delegate`     |
| **npm**  | `npx jsr add @leawind/delegate`      |
| **yarn** | `yarn dlx jsr add @leawind/delegate` |
| **pnpm** | `pnpm dlx jsr add @leawind/delegate` |
| **bun**  | `bunx jsr add @leawind/delegate`     |

## Example

Here is a simple example of how to use `Delegate` in TypeScript:

```typescript
import { Delegate } from '@leawind/delegate';

// Create a new delegate
// The type of the event data is `string`
const delegate = new Delegate<string>('Example');

let str = '';

delegate.addListener((event) => {
	str += event.data;
});

delegate.broadcast('Hello');
delegate.broadcast(', World!');

assertStrictEquals(str, 'Hello, World!');
```
