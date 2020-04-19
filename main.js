// before: module.js

var game = {
	tiles: tiles,
	player: player,
	enemy: enemy,
	turn: this.player,
	start: function(){
		console.log('generate board...')
		this.generateBoard();
		console.log('board generated:', this.tiles)

		console.log('generate pieces...')
		this.generatePieces();
		console.log('pieces generated:', this.player, this.enemy)

		console.log('render turn...');
		this.renderTurn();

		console.log('turn rendered. render tiles...')
		renderTiles(this.tiles);
		// console.log('tiles rendered:', this.tiles);
	},
	renderTurn: function(){
		if(this.turn.isPlayer){
			roll_btn.removeAttribute('disabled');
			turn.innerHTML = this.player.name;
			renderText(turn, this.player.name);
		}else{
			roll_btn.setAttribute('disabled', true);
			renderText(turn, this.enemy.name);
		}
	},
	generateBoard: function(){
		var name = '';
		var html = '';
		var _class = '';

		for (var i = 0; i < this.tiles.length; i++) {
			if(this.tiles[i] === 'es'){
				name = 'enemy start'
				_class = 'enemy-tile'
			}
			else if(this.tiles[i] === 'ps'){
				name = 'player start'
				_class = 'player-tile'
			}
			else if(this.tiles[i] === 'ef'){
				name = 'enemy finish'
				_class = 'enemy-tile finish'
			}
			else if(this.tiles[i] === 'pf'){
				name = 'player finish'
				_class = 'player-tile finish'
			}
			else if(this.tiles[i] === 'r'){
				name = 'rosette'
				_class = 'rosette'
			}
			else{
				name = null
				_class = ''
			}

			html = htmlSingleTile({
				index: i,
				class: _class,
				inner: i
			});

			this.tiles[i] = new Tile({
				position: i,
				name: name,
				class: _class,
				html: html,
			});
		}
	},
	generatePieces: function(){
		this.player.generatePieces();
		this.enemy.generatePieces();
	},
	changeTurn(){
		var last = this.turn;
		this.player.disablePieces();
		this.enemy.disablePieces();
		this.player.selected_piece = null;
		this.enemy.selected_piece = null;
		console.log('last turn is player? ' + last.isPlayer)

		if(last.isPlayer){
			this.turn = this.enemy;
		}else{
			this.turn = this.player;
			this.player.turns = 0;
			roll_btn.removeAttribute('disabled');
		}

		console.log(this.turn)

		rollRes.innerHTML = '';
		playerMoves.innerHTML = '';
		enemyRollRes.innerHTML = '';
		enemyMoves.innerHTML = '';
		selectedPiece.innerHTML = '';
		this.renderTurn();
		renderTiles(this.tiles)

		if(!this.turn.isPlayer){
			this.enemy.roll();
		}
	},
	forceChangeTurn(){
		this.player.disablePieces();
		this.enemy.disablePieces();
		console.log('forcing change turn')
		roll_btn.setAttribute('disabled', true);
		pass_btn.style.display = 'inline-block';
	}
}
// console.log(game)

window.onload = (function(){
	document.getElementById('game').style.display = 'block';
	setListener();
	game.start();
})();

function renderTiles(tiles){
	console.clear();
	console.log('rendering tiles...')

	if(tiles){
		container.innerHTML = '';

		for (var i = 0; i < tiles.length; i++) {
			var inner = '';
			var t = tiles[i];

			// check if tiles contains pieces
			if(t.pieces.length>0){
				for (var j = 0; j < t.pieces.length; j++) {
					var p = t.pieces[j];

					if(p.disabled){
						inner += '<button disabled><small>'+p.no+'</small></button>';
					}else{
						// ready to click
						// ready to selectPiece
						inner += '<button data-id="'+p.id+'" onclick="selectPiece(event, this)"><small>'+p.no+'</small></button>';
					}
				}
			}

			// if not contains any pieces
			else{
				inner = '<small>'+t.position+'</small>';
			}

			t.html = htmlSingleTile({
				index: t.position,
				class: t.class,
				inner: inner
			});

			container.innerHTML += t.html;
		}

	}else{
		console.log('no selected tiles')
	}
}

function selectPiece(e, piece){
	if(e){
		e.preventDefault();
		e.stopPropagation();
	}

	if(piece.setAttribute){
		piece.setAttribute('disabled', true);
	}

	var id;
	if(piece.dataset){
		id = piece.dataset.id;
	}else{
		id = piece.id
	}

	console.log('selected piece id: ', id);

	var sp = null;
	for (var i = 0; i < game.turn.pieces.length; i++) {
		var pp = game.player.pieces[i];
		pp.selected = false;
		pp.disabled = false;
		if(id == pp.id){
			sp = pp;
		}
	}

	if(sp){
		console.log('selected data:', sp)
		sp.select();
		renderText(selectedPiece, 'Selected piece: <small>'+sp.id+'</small>'+sp.name);
	}

	// set Avaiable Moves and render highlighted tiles
	setAvailableMoves(game.turn, function(tiles, pos){
		highlightTile(tiles, pos, function(new_tiles){

			if(!game.turn.isPlayer){
				// enemy pathfinding
				for (var i = 0; i < game.tiles.length; i++) {
					var t = game.tiles[i];
					if(t.name && t.name == "highlight") {
						selectTile(null, t);
					}
				}
			}

			renderTiles(new_tiles);			
		});
	});
}

function setAvailableMoves(target, callback){
	console.log('search selected piece...')
	var sp = target.selected_piece;
	if(sp){
		console.log('selected piece found: ', sp);
	}

	if(target.isPlayer){
		console.log('selected piece is from player')
		
		if(sp.position-target.turns>=16){
			console.log('kurang dari 16')

			// highlight tile -2 dari selected position
			callback(game.tiles, sp.position-target.turns);
		}else if(sp.position-target.turns<16){

			// ADVANCED

			console.log('must enter stage 2: ', target.turns)

			var am = target.turns;
			var cp = target.selected_piece.position;
			var limit1 = 16;
			var na1 = 8;
			var res = 0;

			console.log('AM: '+am, 'CP: '+cp)

			if(cp-am>=limit1){
				res = cp-am;
			}else if(cp-am<limit1){
				res = na1 + (am - (cp-limit1) ) - 1;
			}else if(cp>=na1){
				res = cp+am;
			}

			// var res = na + ( am-(cp-limit) ) - 1;

			callback(game.tiles, res);
		}
	}

	else{
		console.log('selected piece is from enemy')
		if(sp.position-target.turns>=0){
			
			// highlight tile -2 dari selected position
			callback(game.tiles, sp.position-target.turns);
		}else if(sp.position-target.turns<0){

			// ADVANCED

			console.log('must enter stage 2: ', target.turns)

			var am = target.turns;
			var cp = target.selected_piece.position;
			var limit = 0;
			var na = 8;

			var res = na + ( am-(cp-limit) ) - 1;
			highlightTile(game.tiles, res);

		}
	}
}

function highlightTile(tiles, n, callback){
	var target = tiles[n];

	console.log('highlight tile: ', target)

	if(target.pieces.length==0){
		console.log('tile is empty');
		target = new Tile({
			name: 'highlight',
			position: n,
			class: 'highlight',
			html: htmlSingleTile({
				index: n,
				class: 'highlight',
				inner: ''
			})
		});
	}

	tiles[n] = target;

	callback(tiles);
}

function htmlSingleTile(data){
	var html = '<div data-index="'+data.index+'" class="tile '+data.class+'" onclick="selectTile(event, this)">'+data.inner+'___</div>';
	return html;
}

function selectTile(e, tile){
	var result;
	if(tile.classList){
		var classes = tile.classList;
		result = classes.contains("highlight");
	}else if(tile.name == 'highlight'){
		result = true;
	}
	if(result) {
		var sp = game.turn.selected_piece;
		var index;
		if(tile.dataset){
			index = tile.dataset.index;
		}else{
			index = tile.position;
		}
		console.log('fill highlighted tile ('+index+')');

		console.log('moving selected piece...');
		sp.move(game.tiles[index]);

		if(tile.classList){
			// remove highlight tile
			tile.classList.remove('highlight')
		}

		game.tiles[index].name = null;
		game.tiles[index].class = null;

		// disabled all pieces first
		game.turn.disablePieces();

		// render is always last
		renderTiles(game.tiles);
		game.changeTurn();
	} else {
	   console.log( "not highlighted");
	}
}

function setListener(){
	roll_btn.addEventListener('click', game.turn.roll, true);
	pass_btn.addEventListener('click', function(){
		game.changeTurn(game.turn);
		pass_btn.style.display = 'none';
	}, true);
}