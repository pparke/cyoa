export default class Parser {
	constructor() {
		this.cursor = 0;
		this.savedCursor = 0;
		this.source = [];

		this.command = {
			subject: null, // usually the player
			predicate: null, // the action being performed
			object: null, // the thing the action is performed on
		};

		// the entities whose tags will be searched for nouns
		this.entities = {};

		this.verbs = {
			move: ['move', 'walk', 'go', 'travel'],
			look: ['look', 'examine', 'inspect'],
			get: ['get', 'take'],
			drop: ['drop', 'place']
		};

		this.articles = ['the', 'a', 'an'];

		this.prepositions = [
			'to', 'on', 'at', 'in', 'about', 'with', 'into',
			'from', 'upon', 'by'
		];

		this.verb = this.verb.bind(this);
		this.noun = this.noun.bind(this);
		this.article = this.article.bind(this);
		this.preposition = this.preposition.bind(this);

		// TODO re-order?
		this.patterns = [
			{ predicate: this.verb, object: this.noun },
			{ predicate: this.verb, art1: this.article, object: this.noun },
			{ predicate: this.verb, prep1: this.preposition, object: this.noun },
			{ predicate: this.verb, prep1: this.preposition, art1: this.article, object: this.noun }
		];
	}

	saveCursor() {
		this.savedCursor = this.cursor;
	}

	backtrack() {
		this.cursor = this.savedCursor;
	}

	term(expected) {
		return this.getNextToken() === expected;
	}

	getNextToken() {
		if (this.cursor >= this.source.length) {
			return null;
		}
		const nextToken = this.source[this.cursor];
		this.cursor += 1;
		return nextToken;
	}

	reset() {
		this.cursor = 0;
		this.savedCursor = 0;
		this.command = {
			subject: null,
			predicate: null,
			object: null,
		};
		this.source = [];
	}

	parse(s) {
		this.reset();
		this.source = s.trim().split(/\s/);
		return this.root() && this.cursor === this.source.length;
	}

	root() {
		// try each pattern and set verb and noun
		// based on the first match
		return this.patterns.some((pattern) => {
			this.saveCursor();
			let match = true;
			// stop matching as soon as possible
			Object.keys(pattern).every((key) => {
				const fn = pattern[key];
				// get next token and check if it matches the pattern
				match = (match && fn(key));
				return match;
			});
			// if the pattern didn't match, backtrack and try again
			if (!match) {
				this.backtrack();
			}
			return match;
		});
	}

	noun(position) {
		const token = this.getNextToken();
		const noun = this.entities.find((entity) => {
			return entity.tags.includes(token);
		});

		if (noun) {
			this.command[position] = noun;
		}
		return !!noun;
	}

	verb(position) {
		const token = this.getNextToken();
		const verb = Object.keys(this.verbs).find((key) => {
			return this.verbs[key].includes(token);
		});

		if (verb) {
			this.command[position] = verb;
		}
		return !!verb;
	}

	article() {
		const token = this.getNextToken();
		return this.articles.includes(token);
	}

	preposition() {
		const token = this.getNextToken();
		return this.prepositions.includes(token);
	}
}
