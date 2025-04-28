import { assertStrictEquals } from '@std/assert';
import { Delegate } from '@/index.ts';

Deno.test('Delegate', () => {
	const delegate = new Delegate<string>();

	// Test getName
	assertStrictEquals(delegate.name, 'Unnamed');
});

Deno.test('Add listener', () => {
	const delegate = new Delegate<string>();

	let result = '';
	delegate.addListener((event) => {
		result += event.data;
	});
	delegate.addListener((event) => {
		result += event.data.toUpperCase();
	});

	delegate.broadcast('test');
	assertStrictEquals(result, 'testTEST');
});

Deno.test('Remove listener', () => {
	const delegate = new Delegate<string>();
	let result = '';

	// Test removeListener
	const listener = delegate.listener((event) => result += event.data);

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

	delegate.addListener(() => result += 'a', 1);
	delegate.addListener(() => result += 'b', 2);
	delegate.addListener(() => result += 'c', 2);
	delegate.addListener(() => result += 'd', 1);

	delegate.broadcast();
	assertStrictEquals(result, 'bcad');
});

Deno.test('Listener returns false', () => {
	const delegate = new Delegate<string>();

	let result = '';
	delegate.addListener((event) => {
		result += event.data;
		event.stop();
	});
	delegate.addListener((event) => {
		result += event.data.toUpperCase();
	});

	delegate.broadcast('test');
	assertStrictEquals(result, 'test');
});
