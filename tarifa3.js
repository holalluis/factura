function tarifa3(Dates,potCon,preus_potencia,preus_energia,impostos)
{
	//potencia contractada i preus i valors inicials
	potCon = potCon                 || [500,500,500];
	preus_potencia = preus_potencia || [5,5,5];
	preus_energia = preus_energia   || [0.5,0.5,0.5];
	impostos = impostos             || [0,0.5,50,0.21];
	var potConP1=potCon[0];
	var potConP2=potCon[1];
	var potConP3=potCon[2];
	var eurKWP1 =preus_potencia[0];
	var eurKWP2 =preus_potencia[1];
	var eurKWP3 =preus_potencia[2];
	var eurKWhP1=preus_energia[0];
	var eurKWhP2=preus_energia[1];
	var eurKWhP3=preus_energia[2];
	var tax_im1 =impostos[0];
	var tax_im2 =impostos[1];
	var tax_alq =impostos[2];
	var tax_iva =impostos[3];

	//desempaqueta la variable Dates en "temps", "blocs" i "potencia"
	var temps=Dates;
	var blocs=Dates.map(function(d){return parseFloat(d.periode);});
	var poten=Dates.map(function(d){return parseFloat(d.potKW);});

	/*CALCULAREM 3 GRANS COSES: "TERM_POTENCIA (eur)" + "TERM_ENERGIA (eur)" + "COMPL_REACTIVA (eur)"*/

	//1.TERM POTENCIA
	//potConP{1,2,3} potencia contractada kW
	var potCon=new Array();potCon[1]=potConP1;potCon[2]=potConP2;potCon[3]=potConP3;
	//arrays buits per calcular maxims per cada periode
	var maxim=new Array();maxim[1]=new Array();maxim[2]=new Array();maxim[3]=new Array();
	//emplena els arrays de zeros per començar
	for(var i=0;i<temps.length;i++){
		maxim[1][i]=0;
		maxim[2][i]=0;
		maxim[3][i]=0;
	}

	//calcula maxims
	for(var i=0;i<temps.length;i++) {
		//primer abans de res posa el valor anterior maxim trobat
		maxim[1][i]=Math.max.apply(null,maxim[1]);
		maxim[2][i]=Math.max.apply(null,maxim[2]);
		maxim[3][i]=Math.max.apply(null,maxim[3]);
		//actualitza el valor del maxim si la potencia actual es mes gran 
		var b=blocs[i];
		//sobreescriu el maxim pel bloc actual
		if(poten[i]>maxim[b][i]) maxim[b][i]=poten[i];
	}

	//preus potencia eurkW
	var preus=new Array();preus[1]=eurKWP1;preus[2]=eurKWP2;preus[3]=eurKWP3;

	//calculem el cost (eur de la potencia en cada instant)
	var term_poten=new Array();
	for(var i=0; i<temps.length; i++) {
		//inicialitza a 0
		term_poten[i] = 0;
		//recorre tots els blocs tarifaris
		for(var j=1; j<4; j++) {
			//si la potencia demandada es mes petita al 85% de la contractada
			//cobra el 85% de la contractada 
			if(maxim[j][i] <= 0.85*potCon[j]) {
				term_poten[i] += 0.85*potCon[j]*preus[j]; 
			}
			else {
				//si la potencia demandada es mes petita al 105% de la contractada...
				//cobra la pot max demandada
				if(maxim[j][i] <= 1.05*potCon[j]) {
					term_poten[i] += maxim[j][i]*preus[j];
				}
				else {
					//si la potencia demandada es mes gran al 105% de la potencia contractada,
					//cobra la maxima registrada + dues vegades la diferencia amb el 105% de la contractada
					var dif = maxim[j][i]-1.05*potCon[j];	// diferencia
					var pr = parseFloat(maxim[j][i])+parseFloat(2)*dif;	// potencia registrada
					term_poten[i] += parseFloat(preus[j])*parseFloat(pr);
				}
			}
		}
	}

	//2. TERM ENERGIA
	//calculem energia (kWh) consumida a partir de potencia (kW)

	//energia consumida a cada bloc (1,2,3)
	var energia=new Array();energia[1]=new Array();energia[2]=new Array();energia[3]=new Array();

	//omplim de zeros
	for(var i=0;i<temps.length;i++) {
		energia[1][i]=0;
		energia[2][i]=0;
		energia[3][i]=0;
	}

	//valor inicial (energia consumida la primera hora
	energia[blocs[0]][0] = 0 + poten[0]*1;

	//recorrem el temps i anem acumulant l'energia consumida multiplicant la potÃ¨ncia pel timestep en hores (~integral)
	for(var i=1;i<temps.length;i++) {
		//primer posa l'energia i igual a l'anterior
		energia[1][i]=energia[1][i-1];
		energia[2][i]=energia[2][i-1];
		energia[3][i]=energia[3][i-1];

		//actualitza nomes pel bloc actual
		var b=blocs[i];
		//integral. 1 és una hora explicitament escrit
		energia[b][i]=energia[b][i-1]+poten[i]*1;
	}

	//Ara calculem el cost (eur de l'energia consumida)
	var preus = new Array(); //per p1,p2 i p3
	preus[1]=eurKWhP1; preus[2]=eurKWhP2; preus[3]=eurKWhP3;

	//ara anem sumant dia a dia el que costa l'energia activa (eur)
	var term_energ = new Array();
	term_energ[0]=0+energia[blocs[0]][0]*preus[blocs[0]];     //valor inicial
	//recorrem el temps
	for(i=1;i<temps.length;i++) {
		term_energ[i]=term_energ[i-1];
		term_energ[i]+=(energia[1][i] - energia[1][i-1]) * preus[1];
		term_energ[i]+=(energia[2][i] - energia[2][i-1]) * preus[2];
		term_energ[i]+=(energia[3][i] - energia[3][i-1]) * preus[3];
	}

	//3. COMPLEMENT REACTIVA TODO
	//energia reactiva (kVArh)
	var energia_reactiva = new Array(); //array no entrat

	//energia reactiva per cada bloc (1,2) (el 3 no es cobra)
	energia_reactiva[1] = new Array();
	energia_reactiva[2] = new Array();

	//incialitza tot a zero: esperar tenir dades
	for (var i=0; i<temps.length; i++) {
		energia_reactiva[1][i] = 0;
		energia_reactiva[2][i] = 0;
	}

	//euros d'energia reactiva
	var compl_reactiva = new Array();

	//Variables necessÃ ries per calcular l'energia reactiva
	var exces  = new Array(); exces[1]  = new Array(); exces[2]  = new Array();
	var cosPhi = new Array(); cosPhi[1] = new Array(); cosPhi[2] = new Array();
	var preu   = new Array(); preu[1]   = new Array(); preu[2]   = new Array();

	for(var i=0; i<temps.length; i++)
	{
		for(var b=1; b<3; b++)
		{
			//calcula exces
			if (energia_reactiva[b][i] > 0.33 * energia[b][i] )
				exces[b][i] = energia_reactiva[b][i] - 0.33*energia[b][i];		
			else
				exces[b][i] = 0;

			//calcula el cosinus de phi
			cosPhi[b][i]=Math.cos(Math.atan(energia_reactiva[b][i]/energia[b][i]));

			//calcula el preu de l'energia reactiva en funcio de cosinus de phi
			if(cosPhi[b][i] >= 0.95)
				preu[b][i] = 0;
			else if(cosPhi[b][i] >= 0.80)
				preu[b][i] = 0.041554;
			else
				preu[b][i] = 0.062332;
		}
	}

	//calcula el cost de l'energia reactiva
	compl_reactiva[0] = exces[1][0] * preu[1][0] + exces[2][0] * preu[2][0]; //valor inicial
	for(var i=1; i<temps.length; i++)
	{
		compl_reactiva[i] = compl_reactiva[i-1];
		compl_reactiva[i] += exces[1][i] * preu[1][i];
		compl_reactiva[i] += exces[2][i] * preu[2][i];
	}

	//coste interrumpibilidad
	var coste_interr=new Array();
	for (var i=0; i<temps.length; i++)
	{
		coste_interr[i]=0;
		coste_interr[i] += energia[1][i]*0.002235;
		coste_interr[i] += energia[2][i]*0.002239;
		coste_interr[i] += energia[3][i]*0.002229;
	}

	//5. COSTOS TOTALS
	//suma dels costos (eur energia + potencia + energia reactiva)
	var suma_termes = new Array();
	for (var i=0; i<temps.length; i++)
	{
		suma_termes[i] = term_energ[i] + term_poten[i] + compl_reactiva[i] + coste_interr[i];
	}

	//aplica impostos
	var total_amb_iva = new Array();
	var total_sense_iva = new Array();
	for (var i=0; i<temps.length; i++)
	{
		total_sense_iva[i] = suma_termes[i]*(1 + tax_im1 + tax_im2) + tax_alq; //Base imposable
		total_amb_iva[i] = total_sense_iva[i] * (parseFloat(1)+parseFloat(tax_iva));
	}

	//ja hem acabat
	var fi = temps.length-1; //index final

	//data
	var mes = temps[0].toUTCString().substring(8,16);
	//RESUM
	log("[+] RESUM - "+mes);
	log("  Potència contractada   [kW]: "+potCon[1]+" "+potCon[2]+" "+potCon[3]);
	log("  Màxims potència        [kW]: "+maxim[1][fi]+" "+maxim[2][fi]+" "+maxim[3][fi]);
	log("  Terme potència (fix)  [eur]: "+term_poten[fi]);
	log("  Energia consum. (Pn)  [kWh]: "+energia[1][fi]+" "+energia[2][fi]+" "+energia[3][fi]);
	log("  Energia consum. total [kWh]: "+energia[1][fi]+" "+energia[2][fi]+" "+energia[3][fi]);
	log("  Terme energia  (var)  [eur]: "+term_energ[fi]);
	log("  Complement reactiva   [eur]: "+compl_reactiva[fi]);
	log("  Cost interrompib.     [eur]: "+coste_interr[fi]);
	log("  Impost elèctric       [eur]: "+suma_termes[fi]*tax_im2);
	log("  Total sense IVA       [eur]: "+total_sense_iva[fi]);
	log("  IVA                   [eur]: "+total_sense_iva[fi]*tax_iva);
	log("  TOTAL + IVA           [eur]: "+total_amb_iva[fi]);

	//empaquetar info d'interès en un objecte return
	return {
		"Mes":mes,
		"Max P1 (kW)":maxim[1][fi],
		"Max P2 (kW)":maxim[2][fi],
		"Max P3 (kW)":maxim[3][fi],
		"Terme potencia (eur)":term_poten[fi],
		"Energia P1 (kWh)":energia[1][fi],
		"Energia P2 (kWh)":energia[2][fi],
		"Energia P3 (kWh)":energia[3][fi],
		"Energia total (kWh)":(energia[1][fi]+energia[2][fi]+energia[3][fi]),
		"Terme energia (eur)":term_energ[fi],
		"Complement energia reactiva (eur)":compl_reactiva[fi],
		"Cost interrompibilitat (eur)":coste_interr[fi],
		"IVA (eur)":total_sense_iva[fi]*tax_iva,
		total:total_amb_iva[fi],
	}
}
