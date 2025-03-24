/**
 * Delegate listener
 *
 * If the return value === `false`, subsequent listeners will not be executed
 */
export type DelegateHandler<E> = (event: E) => false | unknown;

export type DelegateListener<E> = {
	/**
	 * The priority of the listener.
	 *
	 * - Listeners with higher priority will be called first.
	 * - Listeners with the same priority will be called in the order they were added.
	 */
	priority: number;
	/**
	 * How many times the listener will be called.
	 *
	 * If `times` is -1, the listener will be called indefinitely.
	 */
	times: number;

	handler: DelegateHandler<E>;
};

/**
 * A class that manages a list of listeners and allows broadcasting events to them.
 * Listeners can be added with a priority, and they will be called in order of priority.
 * If a listener returns `false`, subsequent listeners will not be executed.
 *
 * @template E The type of event object.
 */
export class Delegate<E> {
	public static readonly DEFAULT_PRIORITY = 0;

	private name: string;

	// From high to low priority
	private listeners: DelegateListener<E>[] = [];

	/**
	 * Creates an instance of Delegate.
	 * @param name The name of the delegate.
	 */
	constructor(name: string = 'Unnamed Delegate') {
		this.name = name;
	}

	/**
	 * Gets the name of the delegate.
	 * @returns The name of the delegate.
	 */
	public getName(): string {
		return this.name;
	}

	public addListener(listener: DelegateListener<E>): void;
	public addListener(
		handler: DelegateHandler<E>,
		priority?: number,
		times?: number,
	): void;

	public addListener(
		...args:
			| [listener: DelegateListener<E>]
			| [handler: DelegateHandler<E>, priority?: number, times?: number]
	): void {
		const listener: DelegateListener<E> = typeof args[0] === 'function'
			? {
				handler: args[0],
				priority: args[1] || Delegate.DEFAULT_PRIORITY,
				times: args[2] || -1,
			}
			: args[0];

		let index = this.listeners
			.findIndex((w) => w.priority < listener.priority);

		if (index === -1) {
			index = this.listeners.length;
		}

		this.listeners.splice(index, 0, listener);
	}

	/**
	 * Remove a listener from the delegate. If a same listener was added multiple times, only the one with the highest priority will be removed.
	 *
	 * Do nothing if the listener is not found.
	 *
	 * @param listener The listener to remove.
	 */
	public removeListener(listener: DelegateHandler<E>): void {
		const index = this.listeners
			.findIndex((l) => l.handler === listener);
		if (index !== -1) {
			this.listeners.splice(index, 1);
		}
	}

	/**
	 * Broadcast an event to all listeners.
	 * @param event The event to broadcast.
	 */
	public broadcast(event: E): void {
		let i = 0;
		while (i < this.listeners.length) {
			const listener = this.listeners[i];

			if (listener.times > 0) {
				listener.times--;
			}

			const result = listener.handler(event);

			if (listener.times === 0) {
				this.listeners.splice(i, 1);

				if (result === false) {
					break;
				} else {
					continue;
				}
			}

			if (result === false) {
				break;
			}

			i++;
		}
	}
}
