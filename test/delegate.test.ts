import { assertStrictEquals } from '@std/assert';

import { Delegate } from '@/index.ts';

Deno.test('Delegate', () => {
	const delegate = new Delegate<string>();

	// Test getName
	assertStrictEquals(delegate.getName(), 'Unnamed Delegate');
});

Deno.test('Add listener', () => {
	const delegate = new Delegate<string>();

	let result = '';
	delegate.addListener((event) => result += event);
	delegate.addListener((event) => result += event.toUpperCase());

	delegate.broadcast('test');
	assertStrictEquals(result, 'testTEST');
});

Deno.test('Remove listener', () => {
	const delegate = new Delegate<string>();
	let result = '';

	// Test removeListener
	const listener = (event: string) => {
		result += event;
	};

	delegate.addListener(() => result += 'A');
	delegate.addListener(listener);

	delegate.addListener(() => result += 'B');

	delegate.removeListener(listener);

	delegate.addListener(() => result += 'C');

	result = '';
	delegate.broadcast('test');
	assertStrictEquals(result, 'ABC');
});

Deno.test('Priority', () => {
	const delegate = new Delegate<void>();

	// Test priority
	let result = '';

	delegate.addListener(() => result += 'a', { priority: 1 });
	delegate.addListener(() => result += 'b', { priority: 2 });
	delegate.addListener(() => result += 'c', { priority: 2 });
	delegate.addListener(() => result += 'd', { priority: 1 });

	delegate.broadcast();
	assertStrictEquals(result, 'bcad');
});

Deno.test('times', () => {
	const delegate = new Delegate<string>();

	let str = '';
	delegate.addListener(
		(s) => str += s,
		{ times: 2 },
	);

	delegate.broadcast('a');
	delegate.broadcast('b');
	delegate.broadcast('c');
	delegate.broadcast('d');

	assertStrictEquals(str, 'ab');
});

Deno.test('Handler returns false', () => {
	const delegate = new Delegate<string>();

	let result = '';
	delegate.addListener((event) => {
		result += event;
		return false;
	});
	delegate.addListener((event) => result += event.toUpperCase());

	delegate.broadcast('test');
	assertStrictEquals(result, 'test');
});
