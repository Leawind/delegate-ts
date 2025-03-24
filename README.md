# `@leawind/delegate`

[![GitHub License](https://img.shields.io/github/license/Leawind/delegate-ts)](https://github.com/LEAWIND/delegate-ts)
[![JSR Version](https://jsr.io/badges/@leawind/delegate)](https://jsr.io/@leawind/delegate)
[![deno score](https://jsr.io/badges/@leawind/delegate/score)](https://jsr.io/@leawind/delegate/doc)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Leawind/delegate-ts/deno-test.yaml?branch=main&logo=github-actions&label=test)](https://github.com/Leawind/delegate-ts/actions/workflows/deno-test.yaml)

`@leawind/delegate` is a TypeScript library that manages a list of listeners and allows broadcasting events to them. Listeners can be added with a priority, and they will be called in order of priority. If a listener returns `false`, subsequent listeners will not be executed.

## Installation

|          |                                      |
| -------- | ------------------------------------ |
| **deno** | `deno add jsr:@leawind/delegate`     |
| **npm**  | `npx jsr add @leawind/delegate`      |
| **yarn** | `yarn dlx jsr add @leawind/delegate` |
| **pnpm** | `pnpm dlx jsr add @leawind/delegate` |
| **bun**  | `bunx jsr add @leawind/delegate`     |

## Usage

Here is an example of how to use Delegate in TypeScript:

```typescript
import { Delegate } from '@leawind/delegate';

// Create a new delegate
const delegate = new Delegate<string>();

// Add listeners
delegate.addListener((event) => {
	console.log(`Listener 1: ${event}`);
});
delegate.addListener((event) => {
	console.log(`Listener 2: ${event.toUpperCase()}`);
});

// Broadcast an event
delegate.broadcast('hello');
// Output:
// Listener 1: hello
// Listener 2: HELLO
```
