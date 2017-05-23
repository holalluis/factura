/*
	DIES FESTIUS
	format: { mes<int>, dia<int>, activat<bool>, nom<string> }
	nota: el camp 'activat' pot ser modificat per l'usuari
	nota: el divendres sant s'ha de calcular depenent de l'any perquè és variable
*/

var Festius = [
	{ mes:01, dia:01, activat:1, nom:"Any nou" },
	{ mes:01, dia:06, activat:1, nom:"Reis" },
	{ mes:03, dia:19, activat:1, nom:"Sant Josep" },
	{ mes:04, dia:14, activat:1, nom:"Divendres Sant" }, //variable
	{ mes:05, dia:01, activat:1, nom:"Dia del Treball" },
	{ mes:08, dia:15, activat:1, nom:"Assumpció de la Verge" },
	{ mes:10, dia:12, activat:1, nom:"Festa Nacional Espanya" },
	{ mes:11, dia:01, activat:1, nom:"Tots Sants" },
	{ mes:12, dia:06, activat:1, nom:"Consitució" },
	{ mes:12, dia:08, activat:1, nom:"Immaculada Concepció" },
	{ mes:12, dia:25, activat:1, nom:"Nadal" },
]

/*Funcions per modificar els dies festius*/

//activa un dia festiu pel nom
function activaFestiu(nom,nouValor) {
	nouValor=parseInt(nouValor) ? 1 : 0;
	for(var i in Festius) {
		var festiu=Festius[i];
		if(nom==festiu.nom) { festiu.activat=nouValor; break; }
	}
	log("Modificat dia festiu '"+nom+"' (activat: "+nouValor+")");
}

//detecta el divendres sant en funció de l'any
function detectaDivendresSant(any) {
	//https://es.wikipedia.org/wiki/Computus
	//nota: el divendres sant és la pasqua - 2 dies
	/*
		Definamos 5 variables, a, b, c, d, y e. 
		Además de dos constantes M y N, que para los años comprendidos entre 1900 y 2100 tomarán los valores 24 y 5 respectivamente. 
		Llamaremos A al año del que queremos calcular la Pascua.
	*/
	if(any>2100){
		err("[ERROR] No és possible detectar el divendres sant més enllà del 2100 (busca Computus a la wikipedia per més detalls)");
		return;
	}
	var pasqua={dia:0,mes:0};
	var A=any;
	var M=24, N=5;
	var a,b,c,d,e;
	//càlculs
	a = A % 19;
	b = A % 4;
	c = A % 7;
	d = (19*a + M) % 30;
	e = (2*b + 4*c + 6*d +N) % 7;
	//Si d + e < 10, entonces la Pascua caerá en el día (d + e + 22) de marzo. En caso contrario (d + e > 9), caerá en el día (d + e − 9) de abril.
	if( (d+e)<10 ){
		pasqua.dia=d+e+22;
		pasqua.mes=3;
	}
	else if( (d+e)>9 ) {
		pasqua.dia=d+e-9;
		pasqua.mes=4;
	}
	/*
		Existen dos excepciones a tener en cuenta:
		Si la fecha obtenida es el 26 de abril, entonces la Pascua caerá en el 19 de abril.
		Si la fecha obtenida es el 25 de abril, con d = 28, e = 6 y a > 10, entonces la Pascua caerá en el 18 de abril.
	*/
	if(pasqua.dia==26 && pasqua.mes==4){
		pasqua.dia=19;
	}
	if(pasqua.dia==25 && pasqua.mes==4 && d==28 && e==6 && a > 10) {
		pasqua.dia=18;
	}
	var divendresSant = new Date(Date.UTC(any,pasqua.mes-1,pasqua.dia-2));
	log("[OK] Detectat divendres sant: "+divendresSant.toUTCString())

	//modifica el dia i mes a l'array de festius
	for(var i in Festius) {
		var festiu=Festius[i];
		if(festiu.nom=="Divendres Sant") {
			festiu.dia=divendresSant.getUTCDate();
			festiu.mes=divendresSant.getUTCMonth()+1;
			break;
		}
	}
	//log(festiu);
}
