import Movable from './components/Movable';
import output from './Output';

export default class Player {
	constructor(world, entity) {
		this.world = world;
		this.pawn = entity;
		this.movable = new Movable();

		this.movable.onMove.add(this.handleMove, this);
		this.movable.onSameMove.add(this.handleSameMove, this);
		this.movable.onInvalidMove.add(this.handleInvalidMove, this);

		this.specials = {
			here: { tags: ['around', 'about', 'here'] },
			inventory: { tags: ['inventory', 'storage'] }
		};

		if (entity) {
			this.possess(entity);
		}
	}

	possess(entity) {
		this.world.addComponent(entity, this.movable);
	}

	handleMove() {
		this.look(this.specials.here);
	}

	handleSameMove() {
		output.addLine('You are already there');
	}

	handleInvalidMove(tag) {
		output.addLine(`You can't go to ${tag}`);
	}

	/**
	 * Attempt to perform the given command
	 * @param  {object} command { subject, predicate, object }
	 */
	execute({ subject, predicate, object } = {}) {
		switch (predicate) {
		case 'move':
			this.moveTo(object);
			//this.world.perform('move', this.pawn, object);
			break;
		case 'look':
			//this.onLook.dispatch(object);
			this.look(object);
			break;
		case 'get':
			if (object.components.Movable) {
				object.components.Movable.onMove.once(() => {
					output.addLine(`You pickup the ${object.name}`);
				});
				this.world.perform('move', object, this.pawn);
			}
			break;
		case 'drop':
			if (this.world.distanceBetween(object, this.pawn) === this.world.DISTANCE.held && object.components.Movable) {
				object.components.Movable.onMove.once(() => {
					output.addLine(`You drop the ${object.name}`);
				});
				this.world.perform('move', object, this.pawn.location);
			}
			else {
				output.addLine(`You're not holding ${object.name}`);
			}
			break;
		default:
			output.addLine(`I don't understand how to ${predicate}`);
		}
	}

	moveTo(entity) {
		const { DISTANCE } = this.world;
		const distanceTo = this.world.distanceBetween(entity, this.pawn);
		console.log('distance is', distanceTo);
		switch (distanceTo) {
		case DISTANCE.unknown:
			output.addLine(`I don't know how to get there`);
			break;
		case DISTANCE.identity:
			output.addLine(`Don't be silly, you can't go to yourself.`);
			break;
		case DISTANCE.inside:
			output.addLine(`You're already inside of it.`);
			break;
		case DISTANCE.held:
			// TODO: try to enter?
			output.addLine(`You can't go to something you're holding.`);
			break;
		case DISTANCE.here:
			if (entity.destination) {
				output.addLine(`You move towards ${entity.destination.name}`);
				this.pawn.location = entity.destination;
				this.pawn.components.Movable.onMove.dispatch();
				break;
			}
			output.addLine(`You're already standing next to it.`);
			break;
		case DISTANCE.nestedHere:
		case DISTANCE.nestedHeld:
			output.addLine(`You might have to take it out to try that.`);
			break;
		case DISTANCE.near:
			output.addLine(`You move towards ${entity.name}`);
			this.pawn.location = entity;
			this.pawn.components.Movable.onMove.dispatch();
			break;
		default:
			output.addLine(`There doesn't appear to be any way to get there from here.`);
		}
	}

	look(entity) {
		const { specials } = this;
		if (entity === specials.here) {
			output.addLine(this.pawn.location.description);
			const contents = this.world.contents(this.pawn.location, { exclude: [this.pawn] });
			if (contents.length > 0) {
				output.addLine('You see here:');
				contents.forEach((item) => {
					output.addLine(item.description);
				});
			}
			return;
		}
		const { DISTANCE } = this.world;
		const distanceTo = this.world.distanceBetween(entity, this.pawn);
		switch (distanceTo) {
		case DISTANCE.unknown:
			output.addLine(`I don't know what you're looking at.`);
			break;
		case DISTANCE.identity:
			output.addLine(`You look at yourself and see ${this.pawn.description}`);
			break;
		case DISTANCE.inside:
		case DISTANCE.held:
		case DISTANCE.here:
			output.addLine(entity.description);
			break;
		case DISTANCE.nestedHere:
		case DISTANCE.nestedHeld:
		case DISTANCE.near:
		default:
			output.addLine(`I can't see that here.`);
		}
	}
}
