//TIME OF USE (TOU) TARIFA 3.1A
var Tou = { };

Tou.laborable = {};

Tou.laborable.hivern = [
	3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 2 //tipus 0 hivern
];

Tou.laborable.estiu = [
	3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2 //tipus 1 estiu
];

Tou.festiu = [
	3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2 //tipus 2 (weekmod)
];

// 2. tipus: variable global (funcions.js). Ã‰s un array d'objectes de la classe Tipus (classes.js)
/*
*/
