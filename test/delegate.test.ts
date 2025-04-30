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

Deno.test('Set listener', () => {
	const delegate = new Delegate<void>();
	let result = '=';
	delegate.setListener('a', () => result += 'A');
	delegate.setListener('a', () => result += 'B');
	delegate.broadcast();
	assertStrictEquals(result, '=B');
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

Deno.test('Adding the same listener multiple times', () => {
	const delegate = new Delegate<string>();
	let result = '';

	const listener = delegate.listener((e) => result += e.data);
	delegate.addListener(listener);
	delegate.addListener(listener);

	delegate.broadcast('a');
	delegate.removeListener(listener);
	delegate.broadcast('b');

	assertStrictEquals(result, 'aab');
});

Deno.test('Removing non-existent listener', () => {
	const delegate = new Delegate<string>();
	let result = '';

	delegate.removeListener(() => {});
	delegate.addListener((e) => result = e.data);

	delegate.broadcast('valid');
	assertStrictEquals(result, 'valid');
});

Deno.test('Mixed priority execution order', () => {
	const delegate = new Delegate<string>();
	let result = '';

	delegate.addListener(() => result += '3_', 3);
	delegate.addListener(() => result += '1_', 1);
	delegate.addListener(() => result += '2_', 2);

	delegate.broadcast('');
	assertStrictEquals(result, '3_2_1_');
});

Deno.test('Event object property verification', () => {
	const delegate = new Delegate<string>();
	let receivedData = '';
	let stopCalled = false;
	let removeSelfCalled = false;

	delegate.addListener((e) => {
		receivedData = e.data;
		e.stop();
		stopCalled = e.doStop;
		e.removeSelf();
		removeSelfCalled = e.doRemoveSelf;
	});

	delegate.broadcast('test');
	assertStrictEquals(receivedData, 'test');
	assertStrictEquals(stopCalled, true);
	assertStrictEquals(removeSelfCalled, true);
});
