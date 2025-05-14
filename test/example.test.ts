import { assertStrictEquals } from '@std/assert';
import { Delegate } from '@/index.ts';

Deno.test('Simple Example', () => {
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
});

Deno.test('Once Example', () => {
	// Create a new delegate
	const delegate = new Delegate<string>('Example');

	let str = '';

	// Add a listener that will only be called once
	delegate.addOnce((event) => str += event.data);

	delegate.broadcast('Hello');
	delegate.broadcast(', World!');

	assertStrictEquals(str, 'Hello');
});
