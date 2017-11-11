export default class Event {
	constructor() {
		this.listeners = [];
	}

	add(fn, ctx) {
		this.listeners.push({ fn, ctx });
	}

	once(fn, ctx) {
		this.listeners.push({ fn, ctx, once: true });
	}

	remove(fn, ctx) {
		this.listeners = this.listeners.filter((listener) => {
			return !(listener.fn === fn && listener.ctx === ctx);
		});
	}

	dispatch(...args) {
		for (let i = 0; i < this.listeners.length; i += 1) {
			const { fn, ctx, once } = this.listeners[i];
			if (typeof fn === 'function') {
				fn.call(ctx, ...args);
			}
			if (once) {
				this.remove(fn, ctx);
				console.log(this.listeners);
			}
		}
	}
}
