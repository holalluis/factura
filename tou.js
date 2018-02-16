/**
  * TARIFA 3.1A
  * Distribució de períodes tarifaris (P1,P2,P3) dies laborables i festius
  * P1: punta
  * P2: llano
  * P3: valle
*/
var Tou={};
Tou.laborable={};

//hora:                 00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23
Tou.laborable.hivern = [ 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 2 ];
Tou.laborable.estiu  = [ 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2 ];
Tou.festiu           = [ 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2 ];
