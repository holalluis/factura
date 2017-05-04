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
	{ mes:04, dia:14, activat:1, nom:"Divendres Sant (variable)" },
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
	log("Modificat dia festiu '"+nom+"' ("+nouValor+")");
}

function detectaDivendresSant(any)
{
	//El domingo de Pascua nunca puede caer ni antes del 22 de marzo ni después del 25 de abril.
	//trobar el dia i el mes, i modificar Festius
}
