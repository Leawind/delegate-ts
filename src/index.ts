/**
 * Event object passed to delegate listeners
 * @template D Type of event data
 */
class DelegateEvent<D> {
	#doStop: boolean = false;
	#doRemoveSelf: boolean = false;

	/**
	 * Whether event propagation is going to be stopped
	 */
	public get doStop(): boolean {
		return this.#doStop;
	}

	/**
	 * Whether the listener should be removed after execution
	 */
	public get doRemoveSelf(): boolean {
		return this.#doRemoveSelf;
	}

	public constructor(
		/**
		 * Current event data
		 */
		public readonly data: D,
	) {}

	/**
	 * Stops event propagation
	 *
	 * - It can be invoked multiple times in a listener
	 * - It can't be canceled once invoked
	 */
	public stop(): void {
		this.#doStop = true;
	}

	/**
	 * Remove this listener after execution
	 *
	 * - It can be invoked multiple times in a listener
	 * - It can't be canceled once invoked
	 */
	public removeSelf(): void {
		this.#doRemoveSelf = true;
	}
}

/**
 * Type for delegate event listener function
 * @template D Type of event data
 */
type DelegateListener<D> = (e: DelegateEvent<D>) => void;
/**
 * Type for delegate handler key
 */
type DelegateHandlerKey = string | symbol | number | bigint | boolean;
/**
 * Type representing a delegate handler
 * @template D Type of event data
 */
type DelegateHandler<D> = {
	/**
	 * Optional unique key for the handler
	 */
	key?: DelegateHandlerKey;
	/**
	 * The listener function to be called
	 */
	listener: DelegateListener<D>;
	/**
	 * Priority of the handler (higher executes first)
	 */
	priority: number;
	/**
	 * Whether the handler is one-time
	 */
	once: boolean;
};

/**
 * Event delegation system with prioritized listener execution
 *
 * @template D Type of event data
 */
export class Delegate<D> {
	private static readonly DEFAULT_PRIORITY = 0;

	// From high to low priority
	private handlers: DelegateHandler<D>[] = [];

	/**
	 * Map: key => handler
	 */
	private keys: Map<unknown, DelegateHandler<D>> = new Map();

	public constructor(
		/**
		 * Name of the delegate (for debugging purposes)
		 */
		public name: string = 'Unnamed',
	) {}

	/**
	 * Remove all listeners
	 */
	public clear(): this {
		this.handlers = [];
		return this;
	}

	/**
	 * Sets a one-time listener with a key (replaces existing if key exists)
	 *
	 * @param key Unique key for the listener
	 * @param listener The listener function
	 * @param priority Priority of the listener, higher executes first
	 */
	public setOnce(
		key: DelegateHandlerKey,
		listener: DelegateListener<D>,
		priority: number = Delegate.DEFAULT_PRIORITY,
	): this {
		return this.addHandler({ key, listener, priority, once: true });
	}
	/**
	 * Adds a one-time listener
	 * @param listener The listener function
	 * @param priority Priority of the listener, higher executes first
	 */
	public addOnce(
		listener: DelegateListener<D>,
		priority: number = Delegate.DEFAULT_PRIORITY,
	): this {
		return this.addHandler({ listener, priority, once: true });
	}
	/**
	 * Sets a listener with a key (replaces existing if key exists)
	 *
	 * @param key Unique key for the listener
	 * @param listener The listener function
	 * @param priority Priority of the listener, higher executes first
	 */
	public setListener(
		key: DelegateHandlerKey,
		listener: DelegateListener<D>,
		priority: number = Delegate.DEFAULT_PRIORITY,
	): this {
		return this.addHandler({ key, listener, priority, once: false });
	}
	/**
	 * Adds a listener
	 * @param listener The listener function
	 * @param priority Priority of the listener, higher executes first
	 */
	public addListener(
		listener: DelegateListener<D>,
		priority: number = Delegate.DEFAULT_PRIORITY,
	): this {
		return this.addHandler({ listener, priority, once: false });
	}

	/**
	 * Internal method to add a handler to the list in the correct position based on priority
	 *
	 * If key is specified in given handler, it replaces the existing handler with the same key
	 *
	 * @param handler The handler to add
	 */
	protected addHandler(handler: DelegateHandler<D>): this {
		if (handler.key !== undefined) {
			if (this.keys.has(handler.key)) {
				this.removeListener(handler.key);
			}

			this.keys.set(handler.key, handler);
		}

		let index = this.handlers
			.findIndex((h) => h.priority < handler.priority);

		if (index === -1) {
			index = this.handlers.length;
		}

		this.handlers.splice(index, 0, handler);
		return this;
	}

	/**
	 * Remove listeners by key
	 *
	 * If the key doesn't exist, it does nothing
	 *
	 * @param key The key of the listener to remove.
	 */
	public removeListener(key: DelegateHandlerKey): this;
	/**
	 * Removes first occurrence of listener
	 *
	 * Only removes highest-priority instance if duplicate
	 *
	 * @param listener The listener to remove.
	 */
	public removeListener(listener: DelegateListener<D>): this;
	public removeListener(arg: DelegateHandlerKey | DelegateListener<D>): this {
		if (typeof arg === 'function') {
			const listener = arg;
			const index = this.handlers.findIndex((h) =>
				h.listener === listener
			);
			if (index !== -1) {
				const handler = this.handlers.splice(index, 1)[0];
				this.keys.delete(handler.key);
			}
		} else {
			const handler = this.keys.get(arg);
			if (handler) {
				const index = this.handlers
					.findIndex((h) => h.key === handler.key);
				if (index !== -1) {
					this.handlers.splice(index, 1);
				}

				this.keys.delete(arg);
			}
		}
		return this;
	}

	/**
	 * Broadcasts data to listeners
	 *
	 * Execution order: High -> Low priority
	 */
	public broadcast(data: D): void {
		let i = 0;
		while (i < this.handlers.length) {
			const handler = this.handlers[i];
			const event = new DelegateEvent(data);

			if (handler.once) {
				event.removeSelf();
			}

			handler.listener(event);

			if (event.doRemoveSelf) {
				this.keys.delete(handler.key);
				this.handlers.splice(i, 1);
			}

			if (event.doStop) {
				break;
			}

			if (!event.doRemoveSelf) {
				i++;
			}
		}
	}

	/**
	 * Syntax sugar for listener declaration
	 *
	 * Example:
	 *
	 * ```ts
	 * const listener = delegate.listener(event => result += event.data);
	 * ```
	 *
	 * equals to:
	 *
	 * ```ts
	 * const listener: DelegateListener<string> = event => result += event.data;
	 * ```
	 */
	public listener(listener: DelegateListener<D>): DelegateListener<D> {
		return listener;
	}
}
