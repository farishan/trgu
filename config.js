var container = document.getElementById('bc');
var roll_btn = document.getElementById('roll');
var enemy_roll_btn = document.getElementById('enemyroll');
var pass_btn = document.getElementById('pass');
var rollRes = document.getElementById('rollResult');
var enemyRollRes = document.getElementById('enemyRollResult');
var playerPieces = document.getElementById('playerPieces');
var enemyPieces = document.getElementById('enemyPieces');
var turn = document.getElementById('turn');
var playerMoves = document.getElementById('playerMoves');
var enemyMoves = document.getElementById('enemyMoves');
var selectedPiece = document.getElementById('selectedPiece');

var tiles = [
	'r', 0, 0, 0, 'es', 'ef', 0, 'r',
	0, 0, 0, 'r', 0, 0, 0, 0,
	'r', 0, 0, 0, 'ps', 'pf', 0, 'r'
];

// next: module.js