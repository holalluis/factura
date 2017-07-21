/* 
 * Utils
*/

function qs(selector){return document.querySelector(selector);}
function qsa(selector){return document.querySelectorAll(selector);}
function log(str){console.log(str);}

//mostra errors
function err(str){
	qs('#errors').innerHTML+="<div>"+str+"</div>";
	console.error(str);
}
