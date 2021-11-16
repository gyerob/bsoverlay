var valasz;
var req = new XMLHttpRequest();
var hrm = document.getElementById("hrm");;
var bpm;
var timer;

req.onreadystatechange = function () {
	//console.log("válasz");
	
	if (req.readyState === XMLHttpRequest.DONE) {
    //console.log(typeof req.responseText);
    //console.log(req.responseText);
	
		valasz = JSON.parse(req.responseText);
		for (const key in valasz){
			if(valasz.hasOwnProperty(key)){
				console.log(`${key} : ${valasz[key]}`)
				hrm.innerText = valasz["bpm"];
			}
		}
	}
}

function startpulse(){
	timer = setInterval(getpulsoid,500);
	console.log("start timer");
}

function getpulsoid(){
	req.open("GET", "https://pulsoid.net/v1/api/feed/5d6ebb36-5498-458a-b74f-ea73dc61a45a", true);
	req.setRequestHeader("Accept", "application/json");
	//req.responseType = 'json';
	req.send(null);
}				

startpulse();