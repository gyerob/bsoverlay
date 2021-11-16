var valasz;
var oReq = new XMLHttpRequest();
var hrm = document.getElementById("hrm");;
var bpm;






//oReq.addEventListener("load", reqListener);
oReq.onreadystatechange = function () {
	console.log("válasz");
	//var valasz2 = JSON.parse(oReq.responseText);
	//console.log(oReq.responseText);
	
	if (oReq.readyState === XMLHttpRequest.DONE) {
    console.log(typeof oReq.responseText);
    console.log(oReq.responseText);
	
	var valasz2 = JSON.parse(oReq.responseText);
	for (const key in valasz2){
		if(valasz2.hasOwnProperty(key)){
			console.log(`${key} : ${valasz2[key]}`)
			hrm.innerText = valasz2["bpm"];
		}
}
  }
	
	
	
}
oReq.open("GET", "https://pulsoid.net/v1/api/feed/5d6ebb36-5498-458a-b74f-ea73dc61a45a", true);
oReq.setRequestHeader("Accept", "application/json");
//oReq.responseType = 'json';
oReq.send(null);



