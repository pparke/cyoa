import Component from './Component';
import Event from '../Event';

export default class Movable extends Component {
	constructor({ onMove, onInvalidMove, onSameMove } = {}) {
		super('Movable');

		this.onMove = new Event();
		this.onInvalidMove = new Event();
		this.onSameMove = new Event();

		if (onMove) {
			this.onMove.add(onMove, this);
		}

		if (onInvalidMove) {
			this.onInvalidMove.add(onInvalidMove, this);
		}

		if (onSameMove) {
			this.onSameMove.add(onSameMove, this);
		}
	}

	move(location) {
		if (location === this.target.location) {
			this.onSameMove.dispatch(location);
		}
		else if (location) {
			this.target.location = location;
			this.onMove.dispatch(location);
		}
		else {
			this.onInvalidMove.dispatch(location);
		}
	}
}
