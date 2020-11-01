const Extension = chrome.extension;
const Storage = chrome.storage;
const WebRequest = chrome.webRequest;
const ANCHOR = document.createElement('a');
var MyStorage = MyStorage || {};

function getHost(url) {
  ANCHOR.href = url;
  return ANCHOR.host;
}


MyStorage.local = {
	set:function(type, Data) {
        if (type == "WhiteList") {
			var Arr = Array.from(Data);
		   chrome.storage.local.set({"WhiteList": Arr}, function() {
		    console.log(Arr);
          });
		} else if(type == "BlackList") {
			var Arr = Array.from(Data);
			chrome.storage.local.set({"BlackList": Arr}, function() {
		    console.log(Arr);
          });
		} else {
			chrome.storage.local.set({"Rules": Data}, function() {
		    console.log(Data);
          });
			
		}
	},
	
	get: function(type, callback) {	
          var ResultData ;	
          chrome.storage.local.get(type, function(result) {
		    if(type == "WhiteList") {
	          ResultData = new Set(result.WhiteList);   
		    } else if(type == "BlackList"){
	          ResultData = new Set(result.BlackList);
		    } else {
			  ResultData = result;
			}
			callback(ResultData);
          });
		  
	}
}
