/*
 *
 *	Funcions principals de l'app
 *
 */

//body onload="init()"
function init() {
	/*
		SETEJA VALORS DE COOKIES:
			potencia contractada
			preu potencia
			preu energia
			lloguer
			impost electric
			IVA
	*/
	(function actualitzaValorsGuardats() {
		[
			'potCon_P1',        'potCon_P2',         'potCon_P3',
			'preus_potencia_P1','preus_potencia_P2', 'preus_potencia_P3',
			'preus_energia_P1', 'preus_energia_P2',  'preus_energia_P3',
			'tax_alq',          'tax_im2',           'tax_iva'
		].forEach(function(id){
			var valor=getCookie(id);
			if(valor){qs('#'+id).value=valor}
		});
	})();

	//per debug: processa corba a init -> processa_corba();
}

function updateCookies(elem) {
	setCookie(elem.id,elem.value);//"cookies.js"
}

//funció principal per calcular la factura
function processa_corba() {
  //clear errors
  qs('#errors').innerHTML="";

	//text escrit al textarea
	var valors = qs('#corba').value;

	//separa la corba per line breaks i filtra (elimina) linies buides
	var linies=valors.split('\n').filter(function(n){return (n!="" && n!=" " && n!="	")});

	//log mostra numero de línies de la corba horaria
	log("Processant "+linies.length+" línies al camp de text...");

	//comprova que no estigui buit
	if(linies.length==0) { err("[ERROR] camp de text buit");return;}

	/*DETECTA DATA INICIAL, TIME INTERVAL I NOMBRE DE TIMESTEPS*/
	//format linia ['01/01/2017', '00:00', '50', 'kW']
	var linia_inici=linies[0].split(' ');
	var dia_inici=linia_inici[0];
	var hor_inici=linia_inici[1];
	//retalla string per convertir dia inicial a objecte Date
	var d={};//data
	d.any=parseInt(dia_inici.split('/')[2]);
	d.mes=parseInt(dia_inici.split('/')[1])-1; //gener=0,febrer=1,etc.
	d.dia=parseInt(dia_inici.split('/')[0]);
	d.hor=parseInt(hor_inici.split(':')[0]);
	d.min=parseInt(hor_inici.split(':')[1]);
	//agafa data inici i suma 1 mes per trobar la data final
	var data_inici=new Date(Date.UTC(d.any,d.mes,d.dia,d.hor,d.min,0));
	var data_final=new Date(Date.UTC(d.any,d.mes+1,d.dia,d.hor,d.min,0));
	log("Detectada data inici: "+data_inici.toUTCString().replace("00: GMT",''));
	log("Detectada data final: "+data_final.toUTCString().replace("00: GMT",''));

	//mostra a la pantalla el titol de la factura
	(function(){
		var ini=data_inici.toUTCString().substring(5,16)
		var fin=data_final.toUTCString().substring(5,16)
		var titol=qs('#titol');
		var innerHTML="&mdash; Període: <b>"+ini+"</b> a <b>"+fin+"</b> &mdash;";
		titol.innerHTML=innerHTML;
	})();

	//canvia el <title></title>
	(function(){
		var innerHTML=data_inici.toUTCString().substring(8,16)
		document.title=innerHTML;
	})();

	//activa el menu pel canvi d'hora si és març o octubre
	(function(){
		var activat=[2,9].indexOf(d.mes)+1;
		var display = activat ? '' : 'none';
		var trs=qsa('tr.canvi_horari');
		for(var i=0;i<trs.length;i++)
		{
			trs[i].style.display=display;
		}
	})();

	/*
		Calcula nombre de timesteps (hores)
		- 28 dies = 672 hores (febrer)
		- 29 dies = 696 hores (febrer de traspàs) (any%4==0)
		- 31 dies = 744 hores (gener,abril,maig,juliol,agost,desembre)
		- 30 dies = 720 hores (abril,juny,setembre,novembre)
		- canvis d'hora (març    -1 hora) = 743 hores
		- canvis d'hora (octubre +1 hora) = 745 hores
	*/

	var hores=(data_final-data_inici)/36e5; //passar de milisegons a hores
	//corregeix per març i octubre
	if(d.mes==2) hores--;
	if(d.mes==9) hores++;

	//comprova si el nombre de dades coincideix
	if([672,696,744,720,743,745].indexOf(hores)==-1) { err("[ERROR] Nombre d'hores incorrecte ("+hores+")"); return; }
	else { log("[OK] Nombre d'hores possible ("+hores+")"); }

	//warning si no coincideixen
	if(hores!=linies.length)
	{
		err("[ERROR]: Hi hauria d'haver "+hores+" hores (="+hores/24+" dies)");
		err("Hi ha "+linies.length+" hores");
		return;
	}
	else { log("[OK] Les hores coincideixen amb el nombre de línies ("+hores+")"); }

	//genera un objecte Date per cada línia introduïda
	var Dates=[]; //array objects Date
	for(var i=0;i<linies.length;i++) {
		var d={};
		var elements=linies[i].split(' ');
		var dia=elements[0];
		var hor=elements[1];
		var pot=elements[2];
		d.any=parseInt(dia.split('/')[2]);
		d.mes=parseInt(dia.split('/')[1])-1; //gener=0,febrer=1,etc.
		d.dia=parseInt(dia.split('/')[0]);
		d.hor=parseInt(hor.split(':')[0]);
		d.min=parseInt(hor.split(':')[1]);
		var data=new Date(Date.UTC(d.any,d.mes,d.dia,d.hor,d.min,0));
		//log(data.toUTCString().replace(':00 GMT',''))

		//afegeix la potencia a l'objecte dates
		data.potKW=pot;
		Dates.push(data);
	}
	log("[OK] S'ha creat l'array 'Dates' amb la propietat 'potKW' ("+Dates.length+")");

	//ara que sabem l'any podem calcular els dies festius variables
	detectaDivendresSant(d.any);

	//posa a la web els canvis d'hora detectats a partir de l'any
	view_canvi_hora(d.any);

	//comprova que les dates entrades son correctes -> aqui tenir en compte canvi horari
	var canvis_hora = detecta_canvi_hora(d.any);
	var canvi_hora_Mar=new Date(Date.UTC(d.any,2,canvis_hora.mar,2));
	var canvi_hora_Oct=new Date(Date.UTC(d.any,9,canvis_hora.oct,2));

	for(var i=0;i<Dates.length;i++)
	{
		var data=new Date(data_inici); //genera una data

		data.setUTCHours(data.getUTCHours()+i); //suma hores

		//si es horari d'estiu suma una hora més
		if(data_inici.getUTCMonth()==2 && data >= canvi_hora_Mar)
		{
			data.setUTCHours(data.getUTCHours()+1);
			//log(data.toUTCString()+" ESTIU");
		}
		else if(data_inici.getUTCMonth()==9 && data > canvi_hora_Oct)
		{
			data.setUTCHours(data.getUTCHours()-1);
			//log(data.toUTCString()+" HIVERN");
		}
		else{
			//log(data.toUTCString());
		}

		if(data.toUTCString()!=Dates[i].toUTCString())
		{
			err('[ERROR] Data incorrecta (linia '+i+')');
			err("Data escrita: "+Dates[i].toUTCString());
			err("Data correcta: "+data.toUTCString());
			return
		}
	}
	log("[OK] Les dates entrades ("+Dates.length+") son correctes i seguides");

	//continuar aqui: assignar períodes a cada instant, fa falta info de TOU
	//afegir propietat "periode" a cada objecte Date
	for(var i=0;i<Dates.length;i++)
	{
		var data = Dates[i]; //objecte Date
		data.periode=0; //valor inicial periode (donarà error si es zero)

		//si es cap de setmana, assigna TOU festiu
		var esCapDeSetmana=[0,6].indexOf(data.getUTCDay())+1;
		var hora=data.getUTCHours(); //index de l'array de periodes
		if(esCapDeSetmana) {
			data.periode=Tou.festiu[hora];
		}
		//dies laborables
		else {
			//comprova si el laborable es festiu
			Festius.forEach(function(festiu){ //festiu{dia,mes,nom}
				if(festiu.activat) {
					if(data.getUTCDate()==festiu.dia) {
						if(data.getUTCMonth()==(festiu.mes-1)) {
							data.periode=Tou.festiu[hora];
							//log("Festiu detectat "+data.toUTCString()+" periode: "+data.periode);
						}
					}
				}
			});

			if(data.periode>0){continue;}

			//laborable normal: comprova si es estiu o hivern
			var estiu = (function() {
				//La estación de verano a efectos del calendario eléctrico es el plazo comprendido entre el cambio de hora del último domingo de marzo y el cambio de hora del último domingo de octubre, siendo la de invierno la contraria.
				if(data >= canvi_hora_Mar && data <= canvi_hora_Oct) {
					//l'hora repetida d'octubre ha de comptar com a hivern
					if(i>0 && data.getUTCMonth()==9 && data.getTime()==Dates[i-1].getTime()){
						//log(data.toUTCString()+' hivern')
						return false;
					}
					else {
						//log(data.toUTCString()+' estiu')
						return true;
					}
				}
				else {
					//log(data.toUTCString()+' hivern')
					return false;
				}
			})();

			//assigna el bloc pel dia laborable
			if(estiu){data.periode=Tou.laborable.estiu[hora];}
			else{     data.periode=Tou.laborable.hivern[hora];}
		}
	}
	log("[OK] S'han assignat els períodes tarifaris a cada hora del mes ("+Dates.map(function(d){return d.periode}).filter(function(p){return p!=0}).length+")");

	//llegeix inputs usuari
	var potCon=[
		parseFloat(qs('#potCon_P1').value),
		parseFloat(qs('#potCon_P2').value),
		parseFloat(qs('#potCon_P3').value),
	];
	var preus_potencia=[
		parseFloat(qs('#preus_potencia_P1').value),
		parseFloat(qs('#preus_potencia_P2').value),
		parseFloat(qs('#preus_potencia_P3').value),
	];
	var preus_energia=[
		parseFloat(qs('#preus_energia_P1').value),
		parseFloat(qs('#preus_energia_P2').value),
		parseFloat(qs('#preus_energia_P3').value),
	];
	var impostos=[
		0,
		parseFloat(qs('#tax_im2').value),
		parseFloat(qs('#tax_alq').value),
		parseFloat(qs('#tax_iva').value),
	];

	//tarifa3
	var resultat=tarifa3(Dates,potCon,preus_potencia,preus_energia,impostos);

	//VIEW
	//mostra container
	qs('#contracte').style.display='block'

	//posa al view
	qs('#resultat #total_iva').innerHTML=resultat.total.toFixed(2)

	//Desglossa resultat al detall i posa al view
	var detall=qs('#detall');
  detall.innerHTML="";
	var ul=document.createElement('ul');
	detall.appendChild(ul);
	for(var camp in resultat) {
		var li=document.createElement('li');
		ul.appendChild(li);
		li.innerHTML=camp+": "+resultat[camp];
	}

	//dies festius
	var tr_dies_festius=qs('#dies_festius');
	//elimina els que hi ha
	var trs_dies_festius=qsa('#taula tr.dia_festiu');
	for(var i=0;i<trs_dies_festius.length;i++)
	{
		trs_dies_festius[i].style.display='none'//amaga
	}

	var detectats=detecta_dies_festius(Dates);
	if(detectats.dies_festius.length==0)
	{
		//nova fila
		var tr=document.createElement('tr');
		tr.classList.add('dia_festiu');
		tr_dies_festius.parentNode.insertBefore(tr,tr_dies_festius.nextSibling);
		tr.innerHTML="<td colspan=4 style=color:#aaa>~No hi ha dies festius ("+Dates[0].toUTCString().substring(8,16)+")"
	}
	detectats.dies_festius.reverse().forEach(function(festiu){
		//nova fila
		var tr=document.createElement('tr');
		tr.classList.add('dia_festiu');
		tr.setAttribute('mes',festiu.mes);
		tr.setAttribute('dia',festiu.dia);
		tr_dies_festius.parentNode.insertBefore(tr,tr_dies_festius.nextSibling);

		//detecta el dia de la setmana que és el festiu
		var dies=["Diumenge","Dilluns","Dimarts","Dimecres","Dijous","Divendres","Dissabte"];
		var diaSetmana=(new Date(Date.UTC(detectats.any,festiu.mes-1,festiu.dia))).getUTCDay();
		tr.innerHTML="<td>"+festiu.nom+"<td>"+dies[diaSetmana]+"<td>"+festiu.dia+"/"+festiu.mes;

		var td=document.createElement('td');
		tr.appendChild(td);
		td.colSpan=2;

		var select=document.createElement('select');
		select.setAttribute('nom',festiu.nom)
		select.onchange=function(){activaFestiu(this.getAttribute('nom'),this.value)}
		td.appendChild(select);
		var option=document.createElement('option');
		select.appendChild(option);
		option.value=0;
		option.innerHTML="No"
		var option=document.createElement('option');
		select.appendChild(option);
		option.value=1;
		option.innerHTML="Sí"
		if(festiu.activat) option.selected=1
	})
}

//detecta els dies festius a partir d'array d'objectes 'Date'
function detecta_dies_festius(Dates) {
	//Dates: array objectes Date
	dies_festius=[];//array objectes de retorn
	for(var i=0;i<Dates.length;i+=24)
	{
		var data=Dates[i];
		Festius.forEach(function(festiu){ //festiu{dia,mes,nom}
			if(data.getUTCDate()==festiu.dia)
			{
				if(data.getUTCMonth()==(festiu.mes-1))
				{
					dies_festius.push(festiu);
				}
			}
		});
	}
	return {
		dies_festius:dies_festius,
		any:Dates[0].getUTCFullYear()
	};
}

//troba les dates de l'últim diumenge de març i l'últim diumenge d'octubre
function detecta_canvi_hora(any) {
	any=any||(new Date()).getFullYear();
	//return
	var dia_inici=0;
	var dia_final=0;
	//març (mes==2)
	var dia=31;
	while(true){
		var diaSetmana=(new Date(Date.UTC(any,2,dia))).getUTCDay();
		if(diaSetmana==0) { dia_inici=dia; break; }
		dia--;
	}
	//octubre (mes==9)
	var dia=31;
	while(true){
		var diaSetmana=(new Date(Date.UTC(any,9,dia))).getUTCDay();
		if(diaSetmana==0) { dia_final=dia; break; }
		dia--;
	}
	return {
		"mar":dia_inici,
		"oct":dia_final,
		"any":any,
	}
}

//posa al html el canvi d'hora detectat
function view_canvi_hora(any) {
	var dies = detecta_canvi_hora(any);
	qs('tr.canvi_horari #dia_inici').innerHTML=dies.mar+" de març de "+any+" 02:00 AM";
	qs('tr.canvi_horari #dia_final').innerHTML=dies.oct+" d'octubre de "+any+" 02:00 AM";
}

//btn carrega exemple
function carregaExemple(){
	var f='corbes_exemple/corba_01_gen_2017.txt';
	var xhr=new XMLHttpRequest();
	xhr.open("GET",f,true);
	xhr.onreadystatechange=function(){
		if(xhr.readyState===XMLHttpRequest.DONE && xhr.status===200) {
			qs('#corba').value=xhr.responseText;
			//processa_corba();
		}
	}
	xhr.send();
}

//btn Clear
function clearCorba() {
	qs('#corba').value="";
	qs('#titol').innerHTML="Carrega una corba horària i prem 'Calcula factura'";
	qs('#total_iva').innerHTML="0";
	qs('#detall').innerHTML="";
	qs('#detall_container').style.display='none';
	qs('#errors').innerHTML='';
	document.title='Tarifa 3.1A';
	//amaga dies festius
	var trs_dies_festius=qsa('#taula tr.dia_festiu');
	for(var i=0;i<trs_dies_festius.length;i++)
	{
		trs_dies_festius[i].style.display='none'
	}
}

//btn [...] al resultat
function veureDetall(){
	var d=qs('#detall_container');
	d.style.display=d.style.display==''?'none':'';
}

//drag and drop arxiu de text
function handleFileSelect(evt)
{
	evt.stopPropagation();
	evt.preventDefault();
	var files = evt.dataTransfer.files; // FileList object.
	//files is a FileList of File objects. List some properties.
	for(var i=0,f;f=files[i];i++) {
		var reader=new FileReader();
		//closure to capture the file information.
		reader.onload=(function(arxiu){
			return function(e){
				var contingut=e.target.result;
				document.getElementById('corba').value=contingut;
				processa_corba()
			};
		})(f);
		//read the file as text
		reader.readAsText(f);
	}
}

//pinta de groc la textarea id=corba mentre fas drag and drop
function pinta(evt,elem,color) { elem.style.background=color; }
