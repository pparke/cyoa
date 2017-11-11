export default class Component {
	constructor(name) {
		this.name = name;
		this.target = null;
	}

	setTarget(target) {
		this.target = target;
		console.log(`[${this.name}] ==> added target`);
	}

	update() {

	}
}
