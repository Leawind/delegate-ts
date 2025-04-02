/**
 * The result of a delegate listener.
 */
export type DelegateResult = {
	/**
	 * Whether to break the loop.
	 *
	 * If `true`, subsequent listeners will not be executed.
	 *
	 * Default is `false`.
	 */
	break: boolean;

	/**
	 * Whether to remove the listener after the event is broadcast.
	 *
	 * If `true`, the listener will be removed after the event is broadcast.
	 *
	 * Default is `false`.
	 */
	removeSelf: boolean;
};

/**
 * Delegate listener
 *
 * If the return value === `false`, subsequent listeners will not be executed
 */
export type DelegateListener<E> = (event: E) => Partial<DelegateResult> | void;

export type DelegateListenerOptions = {
	/**
	 * The priority of the listener.
	 *
	 * - Listeners with higher priority will be called first.
	 * - Listeners with the same priority will be called in the order they were added.
	 */
	priority: number;
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
	private listenerOptions: DelegateListenerOptions[] = [];

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

	public clear(): this {
		this.listeners = [];
		this.listenerOptions = [];
		return this;
	}

	public addListener(
		listener: DelegateListener<E>,
		options?: Partial<DelegateListenerOptions>,
	): this {
		const parsedOption = Object.assign({
			priority: Delegate.DEFAULT_PRIORITY,
		}, options);

		let index = this.listenerOptions
			.findIndex((o) => o.priority < parsedOption.priority);

		if (index === -1) {
			index = this.listeners.length;
		}

		this.listeners.splice(index, 0, listener);
		this.listenerOptions.splice(index, 0, parsedOption);

		return this;
	}

	/**
	 * Remove a listener from the delegate. If a same listener was added multiple times, only the one with the highest priority will be removed.
	 *
	 * Do nothing if the listener is not found.
	 *
	 * @param listener The listener to remove.
	 */
	public removeListener(listener: DelegateListener<E>): this {
		const index = this.listeners.indexOf(listener);
		if (index !== -1) {
			this.listeners.splice(index, 1);
			this.listenerOptions.splice(index, 1);
		}
		return this;
	}

	/**
	 * Broadcast an event to all listeners.
	 * @param event The event to broadcast.
	 */
	public broadcast(event: E): void {
		let i = 0;
		while (i < this.listeners.length) {
			const listener = this.listeners[i];
			const result = listener(event);

			if (result?.removeSelf) {
				this.removeListener(listener);
			}

			if (result?.break) {
				break;
			}

			i++;
		}
	}
}
