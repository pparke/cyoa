import world from './World';
import Parser from './Parser';
import Movable from './components/Movable';
import Player from './Player';

import main from '../scss/main.scss';
import output from './Output';
import input from './Input';

const parser = new Parser();


const player = new Player(world, world.createEntity({
	description: 'Just you',
	tags: ['player', 'me']
}));

const inventory = world.createEntity({
	name: 'bag',
	description: 'an old leather sack',
	tags: ['inventory', 'bag', 'sack'],
	weight: 0,
	location: player
});

// setup output element
output.setElement(document.getElementById('output'));

// setup input element
input.setup(document.getElementById('input'));
input.setCommandHandler((e) => {
	console.log(e.target.value);
	output.addLine(e.target.value);
	parser.entities = [].concat(Object.values(player.specials), world.accessibleFrom(player.pawn.location));
	if (parser.parse(e.target.value)) {
		player.execute(parser.command);
	}
	else {
		output.addLine(`I don't understand.`);
	}
	console.log(parser.command);
	e.target.value = '';
});

const field = world.createEntity({
	name: 'open field',
	description: `You are standing in the middle of an open field.
	A cool breeze blows through the grass.  You see
	a rocky outcrop with a little cave in it to the north.`,
	tags: ['field', 'open field'],
	exits: ['cave', 'brook']
});


const cave = world.createEntity({
	name: 'little cave',
	description: `The air in the cave has a wet chill to it and is
	lit dimly by the light from the entrance.  Small rocks lay scattered
	across the sandy floor.`,
	tags: ['cave'],
	exits: ['field']
});

const caveEntrance = world.createEntity({
	name: 'cave entrance',
	description: 'An entrance to a cave',
	tags: ['entrance'],
	location: field,
	destination: cave
});

const caveExit = world.createEntity({
	name: 'cave exit',
	description: 'a way out of the cave',
	tags: ['exit', 'out'],
	location: cave,
	destination: field
});

const brook = world.createEntity({
	name: 'babbling brook',
	description: `You're standing on the banks of a little fast
	running brook that gurgles and flashes in the sun as it
	races by.`,
	tags: ['brook'],
	exits: ['field']
});

const pathToBrook = world.createEntity({
	name: 'path to brook',
	description: 'a path leading to a brook',
	tags: ['path'],
	location: field,
	destination: brook
});

const pathToField = world.createEntity({
	name: 'path to field',
	description: 'a path up to the field',
	tags: ['path'],
	location: brook,
	destination: field
});

const coin = world.createEntity({
	name: 'silver coin',
	description: 'A shiny silver coin',
	tags: ['coin'],
	weight: 1,
	location: cave
});

const stick = world.createEntity({
	name: 'stick',
	description: 'a short wooden stick',
	tags: ['stick', 'branch'],
	weight: 1,
	location: brook
});

world.addComponent(coin, new Movable({
	onMove(location) {
		output.addLine(`You put the coin in ${location.name}`);
	},
	onSameMove(location) {
		output.addLine(`The coin is already in ${location.name}`);
	},
	onInvalidMove(location) {
		output.addLine(`The coin can't be moved to ${location.name}`);
	}
}));

world.addComponent(stick, new Movable());

player.pawn.location = field;
player.look(player.specials.here);
