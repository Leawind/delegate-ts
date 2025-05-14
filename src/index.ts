class DelegateEvent<D> {
	#doStop: boolean = false;
	#doRemoveSelf: boolean = false;

	public get doStop(): boolean {
		return this.#doStop;
	}

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

type DelegateListener<D> = (e: DelegateEvent<D>) => void;
type DelegateHandlerKey = NonNullable<unknown>;

type DelegateHandler<D> = {
	key?: DelegateHandlerKey;
	listener: DelegateListener<D>;
	priority: number;
};

/**
 *  Event delegation system with prioritized listener execution
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
		public name: string = 'Unnamed',
	) {}

	/**
	 * Remove all listeners
	 */
	public clear(): this {
		this.handlers = [];
		return this;
	}

	protected addHandler(handler: DelegateHandler<D>): this {
		let index = this.handlers
			.findIndex((h) => h.priority < handler.priority);

		if (index === -1) {
			index = this.handlers.length;
		}

		this.handlers.splice(index, 0, handler);
		return this;
	}

	public setOnce(
		key: DelegateHandlerKey,
		listener: DelegateListener<D>,
	): this {
		return this.setListener(key, (e) => {
			listener(e);
			e.removeSelf();
		});
	}

	public addOnce(
		listener: DelegateListener<D>,
		priority: number = Delegate.DEFAULT_PRIORITY,
	): this {
		return this.addListener((e) => {
			listener(e);
			e.removeSelf();
		}, priority);
	}

	public setListener(
		key: DelegateHandlerKey,
		listener: DelegateListener<D>,
		priority: number = Delegate.DEFAULT_PRIORITY,
	): this {
		let handler = this.keys.get(key);

		if (handler) {
			handler.listener = listener;
			return this;
		}

		handler = { key, listener, priority };

		this.keys.set(key, handler);
		this.addHandler(handler);

		return this;
	}

	public addListener(
		listener: DelegateListener<D>,
		priority: number = Delegate.DEFAULT_PRIORITY,
	): this {
		return this.addHandler({ listener, priority });
	}

	/**
	 * Remove listeners by key
	 *
	 * If the key doesn't exist, it does nothing
	 *
	 * @param key The key of the listener to remove.
	 */
	public removeListener(key: string): this;
	/**
	 * Removes first occurrence of listener
	 *
	 * Only removes highest-priority instance if duplicate
	 *
	 * @param listener The listener to remove.
	 */
	public removeListener(listener: DelegateListener<D>): this;
	public removeListener(arg: string | DelegateListener<D>): this {
		if (typeof arg === 'string') {
			const handler = this.keys.get(arg);
			if (handler) {
				const index = this.handlers
					.findIndex((h) => h.key === handler.key);
				if (index !== -1) {
					this.handlers.splice(index, 1);
				}
			}
		} else {
			const listener = arg;
			const index = this.handlers.findIndex((h) =>
				h.listener === listener
			);
			if (index !== -1) {
				this.handlers.splice(index, 1);
			}
		}
		return this;
	}

	/**
	 * Broadcasts data to listeners
	 *
	 * Execution order: High -> Low priority
	 */
	public broadcast(event: D): void {
		let i = 0;
		while (i < this.handlers.length) {
			const handler = this.handlers[i];
			const ctx = new DelegateEvent(event);
			handler.listener(ctx);

			if (ctx.doRemoveSelf) {
				this.removeListener(handler.listener);
			}

			if (ctx.doStop) {
				break;
			}

			i++;
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
