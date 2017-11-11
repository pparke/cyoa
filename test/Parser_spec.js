import chai from 'chai';
import Parser from '../src/Parser';

const expect = chai.expect;
const should = chai.should();

describe('Parser', function () {
	it('should parse a sentence into a command', function () {
		const parser = new Parser();
		parser.entities = [
			{ tags: ['cave'] },
			{ tags: ['guard'] },
			{ tags: ['stick'] },
			{ tags: ['coin'] }
		];

		let found = parser.parse('get stick');
		console.log(parser.command);
		found = parser.parse('take the stick');
		console.log(parser.command);
		found = parser.parse('look at the coin');
		console.log(parser.command);
	});
});
