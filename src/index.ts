/**
 * Delegate listener
 *
 * If the return value === `false`, subsequent listeners will not be executed
 */
export type DelegateListener<E> = (event: E) => boolean | void;

/**
 * A class that manages a list of listeners and allows broadcasting events to them.
 * Listeners can be added with a priority, and they will be called in order of priority.
 * If a listener returns `false`, subsequent listeners will not be executed.
 *
 * @template E The type of event object.
 */
export class Delegate<E> {
	private name: string;

	// From high to low priority
	private priorities: number[] = [];
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

	/**
	 * Add a listener to the delegate.
	 * @param listener The listener to add.
	 */
	public addListener(listener: DelegateListener<E>): void;
	/**
	 * Add a listener to the delegate.
	 * @param priority The priority of the listener. Listeners with higher priority will be called first. Listeners with the same priority will be called in the order they were added.
	 * @param listener The listener to add.
	 */
	public addListener(priority: number, listener: DelegateListener<E>): void;
	public addListener(
		...args:
			| [listener: DelegateListener<E>]
			| [priority: number, listener: DelegateListener<E>]
	): void {
		let priority: number;
		let listener: DelegateListener<E>;

		if (args.length === 2) {
			priority = args[0];
			listener = args[1];
		} else {
			priority = 0;
			listener = args[0];
		}

		let index = this.priorities.findIndex((p) => p < priority);
		if (index === -1) {
			index = this.priorities.length;
		}
		this.priorities.splice(index, 0, priority);
		this.listeners.splice(index, 0, listener);
	}

	/**
	 * Remove a listener from the delegate. If a same listener was added multiple times, only the one with the highest priority will be removed.
	 *
	 * Do nothing if the listener is not found.
	 *
	 * @param listener The listener to remove.
	 */
	public removeListener(listener: DelegateListener<E>): void {
		const index = this.listeners.indexOf(listener);
		if (index !== -1) {
			this.priorities.splice(index, 1);
			this.listeners.splice(index, 1);
		}
	}

	/**
	 * Broadcast an event to all listeners.
	 * @param event The event to broadcast.
	 */
	public broadcast(event: E): void {
		for (let i = 0; i < this.listeners.length; i++) {
			if (this.listeners[i](event) === false) {
				break;
			}
		}
	}
}
