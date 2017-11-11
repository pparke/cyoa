const singleton = Symbol();
const enforcer = Symbol();

class Output {
	constructor(enf) {
		if (enf !== enforcer) {
			throw new Error('Cannot instantiate more than one store.');
		}
		this.element = null;
	}

	/**
	 * Return the singleton store instance
	 * @type {[type]}
	 */
	static get instance() {
		// if a store instance doesn't exist, create one
		if (!this[singleton]) {
			this[singleton] = new Output(enforcer);
		}
		return this[singleton];
	}

	setElement(elem) {
		this.element = elem;
	}

	addLine(text) {
		const line = document.createElement('p');

		line.innerHTML = text;

		this.element.appendChild(line);
		this.element.scrollTop = this.element.scrollHeight;
	}
}

const output = Output.instance;

export default output;
