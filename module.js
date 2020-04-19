// before: config.js

var player = new Character({
	isPlayer: true,
	name: 'Player',
	startPosition: 20
});

var enemy = new Character({
	isPlayer: false,
	name: 'Enemy',
	startPosition: 4
});

function renderText(target, text){
	target.innerHTML = '';
	target.innerHTML = text;
	return true;
}

function Piece(data){
	this.id = ID();
	this.no = data.no;
	this.name = data.name;
	this.position = data.position;
	this.returned = false;
	this.selected = false;
	this.disabled = true;
	this.move = function(tile){
		console.log(this.id + ' start moving...')

		var newPos = tile.position;

		console.log(this.position)

		console.log('moving '+this.name+' from '+ this.position +' to '+(newPos))

		// add to new tiles
		game.tiles[newPos].pieces.push(this);

		// remove from old tiles
		var oldPos = game.tiles[this.position];
		if(oldPos.pieces.length>0){
			for (var i = 0; i < oldPos.pieces.length; i++) {
				var p = oldPos.pieces[i];
				// console.log(p)
				if(p.id == this.id){
					console.log('! REMOVING PIECE FROM OLD POS')
					oldPos.pieces.splice(i, 1);
				}
			}
			oldPos.html =  htmlSingleTile({
				index: oldPos.position,
				class: '',
				inner: oldPos.position
			});
			console.log('! REMOVED RESULT:', oldPos)
		}

		console.log(game.tiles)

		this.position = newPos;

		console.log('piece has been moved. change turn.');
	};
	this.select = function(){
		this.selected = true;
		this.disabled = true;
		game.turn.selected_piece = this;
		console.log(this.id + ' is selected. pos:' + this.position)
	}

	return this;
}

function Tile(data){
	this.id = ID();
	this.name = data.name;
	this.position = data.position;
	this.selected = false;
	this.html = data.html;
	this.pieces = [];
	this.class = data.class;

	return this;
}

function Character(data){
	this.id = ID();
	this.isPlayer = data.isPlayer;
	this.name = data.name;
	this.pieces = [];
	this.turn = 0;
	this.turns = 0;
	this.selected_piece = null;
	this.generatePieces = function(){
		for (var i = 0; i < 7; i++) {
			this.pieces.push(new Piece({
				no: i+1,
				name: 'Piece'+(parseInt(i)+1).toString(),
				position: data.startPosition
			}));
		}
		this.renderPieces();
	};
	this.renderPieces = function(){
		for (var i = 0; i < this.pieces.length; i++) {
			var p = this.pieces[i];
			game.tiles[p.position].pieces.push(p);
		}
	};
	this.roll = function(e){
		var self = game.turn;
		console.log(self.name + 'rolling...')

		// get available moves

		if(self.isPlayer){
			self.turns = roll(self.isPlayer);
			renderText(playerMoves, 'Available moves: '+self.turns);
			checkTurns();
		}else{
			enemy_roll_btn.style.display = 'inline-block';
			setTimeout(function(){
				self.turns = roll(self.isPlayer);
				enemy_roll_btn.style.display = 'none';
				console.log('Enemy Available moves: '+self.turns)
				renderText(enemyMoves, 'Enemy Available moves: '+self.turns);
				enemyMoves.style.display = 'inline-block';

				checkTurns();
			}, 1000);
		}

		function checkTurns(){
			if(self.turns!==0){
				self.selecting();
			}else{
				game.forceChangeTurn();
			}
		}
	};
	this.selecting = function(){
		var self = this;
		roll_btn.setAttribute('disabled', true);

		if(this.isPlayer){
			
			// enable all piece (bug: harusnya difilter yg udah returned)
			for (var i = 0; i < this.pieces.length; i++) {
				var piece = this.pieces[i];

				console.log(piece)

				var target;

				var am = this.turns;
				var cp = piece.position;
				var limit1 = 16;
				var na1 = 8;

				if(cp-am>=limit1){
					target = cp-am;
				}else if(cp-am<limit1){
					target = na1 + (am - (cp-limit1) ) - 1;
				}else if(cp>=8){
					target = cp+am;
				}

				if(game.tiles[target].pieces.length==0){
					piece.disabled = false;
				}

			}
			renderTiles(game.tiles)



		}else{
			console.log('enemy selecting pieces...')
			// select random available piece
			var p = getRandomPiece(this.pieces, this.turns);
			// if(p){
			// 	console.log('random selected piece: ', p);
			// 	p.selected = true;
			// 	this.selected_piece = p;
			// 	selectPiece(null, this.selected_piece);
			// }else{
			// 	console.log("enemy cannot move :(")


			// }
			// luweh
			p.selected = true;
			this.selected_piece = p;
			selectPiece(null, this.selected_piece);
		}

	};
	this.disablePieces = function(){
		console.log('disabling all pieces...')
		for (var i = 0; i < this.pieces.length; i++) {
			var p = this.pieces[i];
			p.disabled = true;
		}
	};

	return this;
}

function getRandomPiece(pieces, turns){
	var available = [];
	for (var i = 0; i < pieces.length; i++) {
		var p = pieces[i];
		// console.log(p)
		if(!p.selected && !p.returned){
			// console.log('NIHHH', p)
			var targettile = p.position-turns;
			console.log('target tile: '+targettile);

			var filled = false;
			for (var i = 0; i < game.tiles.length; i++) {
				var t = game.tiles[i];
				if(t.position == targettile){
					console.log('target tile examined. ', t)

					if(t.pieces.length==0){
						console.log('available to move!')
						available.push(p);

					}

				}
			}
		}
	}

	if(available.length!=0){
		return available[random(0, available.length-1)];
	}else{
		return false;
	}
}

function ID() {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 9);
}

function sumArr(arr){
	var res = 0;
	for (var i = 0; i < arr.length; i++) {
		var a = parseInt(arr[i]);
		if(a){
			res += a;
		}
	}
	return res;
}

function random(a, b){
	return Math.floor(Math.random() * (b - a + 1)) + a;
}

function roll(isPlayer){
	var html;
	if(isPlayer){
		html = rollRes;
	}else{
		html = enemyRollRes;
	}

	html.innerHTML = '';

	console.log('roll')
	var dices = [];
	for (var i = 0; i < 4; i++) {
		var d = random(0, 1);
		dices.push(d);
		html.innerHTML += d;
	}

	var sum = sumArr(dices);
	console.log(dices, sum);
	return sum;
}

// next: main.js