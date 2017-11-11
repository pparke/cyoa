import Event from './Event';
import output from './Output';

const singleton = Symbol();
const enforcer = Symbol();

class Input {
	constructor(enf) {
		if (enf !== enforcer) {
			throw new Error('Cannot instantiate more than one input.');
		}
		this.element = null;
		this.onCommand = () => {};

		this.onMove = new Event();
		this.onLook = new Event();
	}

	/**
	 * Return the singleton store instance
	 * @type {[type]}
	 */
	static get instance() {
		// if a store instance doesn't exist, create one
		if (!this[singleton]) {
			this[singleton] = new Input(enforcer);
		}
		return this[singleton];
	}

	setup(elem, pawn) {
		this.setElement(elem);
		this.addEnterListener();
	}

	setElement(elem) {
		this.element = elem;
	}

	setCommandHandler(fn) {
		this.onCommand = fn;
	}

	addEnterListener() {
		this.element.addEventListener('keyup', (e) => {
			e.preventDefault();
			if (e.keyCode === 13) {
				this.onCommand(e);
			}
		});
	}

	parse(line) {
		const parts = line.split(/\s+/);
		const verb = parts[0];
		const noun = parts[1];

		switch (verb) {
		case 'go':
			this.onMove.dispatch(noun);
			this.pawn.perform('move', noun);
			break;
		case 'look':
			this.onLook.dispatch(noun);
			break;
		case 'get':
			movement.move(noun, this.pawn);
 			this.pawn.perform('get', noun);
			break;
		default:
			output.addLine(`I don't understand how to ${verb}`);
		}
	}
}


const input = Input.instance;

export default input;
