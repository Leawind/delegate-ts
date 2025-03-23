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
	delegate.addListener((event) => {
		result += event;
	});
	delegate.addListener((event) => {
		result += event.toUpperCase();
	});

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

	delegate.addListener((e) => {
		result += 'A';
	});
	delegate.addListener(listener);

	delegate.addListener((e) => {
		result += 'B';
	});

	delegate.removeListener(listener);

	delegate.addListener((e) => {
		result += 'C';
	});

	result = '';
	delegate.broadcast('test');
	assertStrictEquals(result, 'ABC');
});

Deno.test('Priority', () => {
	const delegate = new Delegate<void>();

	// Test priority
	let result = '';

	delegate.addListener(1, () => {
		result += 'a';
	});
	delegate.addListener(2, () => {
		result += 'b';
	});
	delegate.addListener(2, () => {
		result += 'c';
	});
	delegate.addListener(1, () => {
		result += 'd';
	});

	delegate.broadcast();
	assertStrictEquals(result, 'bcad');
});
