const singleton = Symbol();
const enforcer = Symbol();

class World {
	constructor(enf) {
		if (enf !== enforcer) {
			throw new Error('Cannot instantiate more than one store.');
		}

		this.entities = [];

		this.DISTANCE = {
			unknown: -1,
			identity: 0,
			inside: 1,
			held: 2,
			here: 3,
			nestedHeld: 4,
			nestedHere: 5,
			near: 6,
			far: 7
		};
	}

	/**
	 * Return the singleton store instance
	 * @type {[type]}
	 */
	static get instance() {
		// if a store instance doesn't exist, create one
		if (!this[singleton]) {
			this[singleton] = new World(enforcer);
		}
		return this[singleton];
	}


	// props { entities, location, description, tags, name }
	createEntity(props) {
		const entity = {
			name: props.name,
			location: props.location,
			description: props.description,
			tags: props.tags,
			destination: props.destination,
			components: {}
		};

		this.entities.push(entity);

		return entity;
	}

	findEntity(tag, location) {
		return this.entities.filter(entity => (
			entity.location === location &&
			entity.tags.includes(tag)
		));
	}

	contains(a, b) {
		// if the second entity is inside the first
		return (a === b.location);

		// TODO: recurse to find entities in entities?
	}

	/**
	 * Gets all the entities whose location
	 * is equal to the subject entity
	 * @param  {entity} subject
	 * @param  {object} options
	 * @return {Array}
	 */
	contents(subject, { exclude = [] } = {}) {
		return this.entities.reduce((accum, entity) => {
			if (!exclude.includes(entity) && this.contains(subject, entity)) {
				accum.push(entity);
			}
			return accum;
		}, []);
	}

	/**
	 * Gets all entities that are accessible
	 * from the given location (entity) including
	 * those accessible via passages (destinations
	 * of present entities) or inside of other
	 * entities
	 * @param  {[type]} location [description]
	 * @return {[type]}          [description]
	 */
	accessibleFrom(location) {
		const present = this.contents(location);
		const byPassage = this.destinations(location);
		const contents = [].concat(...present.map(this.contents.bind(this)));
		return present.concat(byPassage, contents);
	}

	/**
	 * Get the destinations accessible from here.
	 * @param  {[type]} location [description]
	 * @return {[type]}          [description]
	 */
	destinations(location) {
		const entities = this.contents(location);
		return entities.map(entity => entity.destination).filter(e => !!e);
	}

	colocated(a, b) {
		// prevent undefined locations from being equal
		if (!a.location || !b.location) {
			return false;
		}
		return a.location === b.location;
	}

	/**
	 * A connects to b when the destination
	 * of a is b
	 * @param  {entity} a
	 * @param  {entity} b
	 * @return {boolean}
	 */
	connectsTo(a, b) {
		if (!a.destination) {
			return false;
		}
		return this.equal(a.destination, b);
	}

	distanceBetween(a, b) {
		// one or both unknown
		if (!a || !b) {
			return this.DISTANCE.unknown;
		}
		else if (a === b) {
			return this.DISTANCE.identity;
		}
		else if (a === b.location) {
			return this.DISTANCE.inside;
		}
		else if (a.location === b) {
			return this.DISTANCE.held;
		}
		else if (a.location === b.location) {
			return this.DISTANCE.here;
		}
		else if (a.location && a.location.location === b) {
			return this.DISTANCE.nestedHeld;
		}
		else if (a.location && a.location.location === b.location) {
			return this.DISTANCE.nestedHere;
		}
		// if a is the destination of one of the present passages
		else if (this.destinations(b.location).find(dest => a === dest)) {
			return this.DISTANCE.near;
		}

		return this.DISTANCE.far;
	}

	/**
	 * Attempt to perform the requested task on all
	 * components
	 * @param  {[type]} task [description]
	 * @param  {[type]} args [description]
	 * @return {[type]}      [description]
	 */
	perform(task, entity, ...args) {
		Object.values(entity.components).forEach((comp) => {
			if (comp[task]) {
				comp[task](...args);
			}
		});
	}

	hasComponents(entity, subset) {
		const superset = Object.keys(entity.components);
		return subset.every(comp => (superset.indexOf(comp) > -1));
	}

	addComponent(entity, component) {
		entity.components[component.name] = component;
		component.setTarget(entity);
		return component;
	}

	getComponent(entity, name) {
		return entity.components[name];
	}

	update() {
		for (let i = 0; i < this.entities.length; i += 1) {
			const entity = this.entities[i];
			const components = Object.values(entity.components);
			for (let j = 0; j < components.length; j += 1) {
				components[j].update();
			}
		}
	}
}

const world = World.instance;

export default world;
