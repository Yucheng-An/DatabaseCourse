// create the indexedDB
let req = indexedDB.open("BookDB",1)
req.onsuccess = function(e){
    db = req.result;
    console.log("Success");
}

req.onupgradeneeded = function(e){}

req.ons

