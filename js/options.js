
function CheckUrl(url){
	 var regex = "((http|ftp|https)://)(([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.\
	 [0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,4})*(/[a-zA-Z0-9\&%_\./-~-]*)?";
	 var strRegex = '^((https|http|ftp|rtsp|mms)?://)'
            +'?(([0-9a-z_!~*().&=+$%-]+: )?[0-9a-z_!~*().&=+$%-]+@)?' //ftp的user@
            + '(([0-9]{1,3}.){3}[0-9]{1,3}' // IP形式的URL- 199.194.52.184
            + '|' // 允许IP和DOMAIN（域名）
            + '([0-9a-z_!~*()-]+.)*' // 域名- www.
            + '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' // 二级域名
            + '[a-z]{2,6})' // first level domain- .com or .museum
            + '(:[0-9]{1,4})?' // 端口- :80
            + '((/?)|' 
            + '(/[0-9a-z_!~*().;?:@&=+$,%#-]+)+/?)$';
	var re=new RegExp(regex);
    if (re.test(url)){
        return (true);
    }else{
        return (false);
    }
}

function addPortocol(host) {
	if((host.search("http://")==-1)&&(host.search("https://")==-1)&&(host.search("ftp://")==-1)) {
		return "http://"+host;
	}
	return host;
}

function subPortocol(host) {
	if(host.search("http://")!=-1) {
		return host.substring(7,host.length);
	} else if(host.search("https://")!=-1){
		return host.substring(8,host.length);
	}else if(host.search("ftp://")!=-1){
		return host.substring(6,host.length);
	}		
	return host;				
}

function isHTMLElement(obj){
	console.log(obj);
	var el = document.createElement(obj);
    var node = el.nodeType;
	return node == 1? true:false;	
}

function addArray (ToArr,FromArr){
	for(var i=0; i<FromArr.length; i++) {
		ToArr.push(FromArr[i]);
	}
	return ToArr;
}


function CheckElement(element){
	if((element[0] == "#")||(element[0] == ".")) {
		var regex = "^[a-zA-Z0-9_-]+$";
		var rel = new RegExp(regex);
		var subelement = element.substring(1,element.length);
		if(rel.test(subelement)) {
			return true;
		}else {
			return false;
		}
	}else {
		var regex1 = "^(p|div|body|head|html|img|a|video|ul|tr|td|th|table|audio|b|br|button|dl|dt|form|h[1-6]|iframe|frame|input|object|option)?$";
		var re2 = new RegExp(regex1);
		if(re2.test(element)) {
		    return true;
		}else {
			return false;
		}
	}
}

function CheckElementArr(elementArr) {
	var length = elementArr.length;
	for(var i=0; i<length; i++) {
	    if(!CheckElement2(elementArr[i])){
			return false;
		}
	}
	return true;
}

function CheckElement2(element){
	try{
		document.querySelectorAll(element);
		return true;
	}catch(e){
		return false;
	}
}

document.getElementById('submit').addEventListener('click',function() {
	//var WhiteList = document.getElementById('WhiteList').value;
	var BlackList = document.getElementById('BlackList').value;
	//var Rules = document.getElementById('Rules').value;
    document.getElementById('message').style.color = "green";
	/*
	if(WhiteList) {
		if(CheckUrl(WhiteList)){
			MyStorage.local.get("WhiteList",function(ResultSet){			
				ResultSet.add(WhiteList);
				MyStorage.local.set("WhiteList",ResultSet);
				document.getElementById('message').innerHTML = "储存成功";	            
			})
		} else {
			document.getElementById('message').style.color = "red";
			document.getElementById('message').innerHTML = "白名单应该是一个完整的网址";
			return;
		}			
	}
	*/
	if(BlackList) {
		if(CheckUrl(BlackList)){
			MyStorage.local.get("BlackList",function(ResultSet){			
				ResultSet.add(BlackList);
				MyStorage.local.set("BlackList",ResultSet);
				document.getElementById('message').innerHTML = "储存成功";            
			})
		} else {
			document.getElementById('message').style.color = "red";
			document.getElementById('message').innerHTML = "黑名单应该是一个完整的网址";
			return;
		}	
	}
	/*
	if(Rules) {
		var checkMessage;
		var Host = subPortocol(Rules);
		console.log(Host);
		var index = Host.indexOf(':');
		if (index == -1) {
			document.getElementById('message').style.color = "red";
			document.getElementById('message').innerHTML = "过滤规则格式错误";
			return;
		}		
		var host = Host.substring(0,index);
		if(host.search("www.") != -1)
			host = host.substring(4,index);
		if (host[host.length-1] == "/") 
			host = host.substring(0,host.length-1);
		var element = Host.substring(index+1,Host.length);
		console.log(host);
		console.log(element);
		
		var temhost = addPortocol(host);
		if (!CheckUrl(temhost)) {
		   document.getElementById('message').style.color = "red";
		   document.getElementById('message').innerHTML = "过滤规则网址错误";
		   return;
		}
		
		var elementArr = element.split(",");		
		if(!CheckElementArr(elementArr)){
		   document.getElementById('message').style.color = "red";
		   document.getElementById('message').innerHTML = "过滤规则元素错误";
		   return;
		}
		MyStorage.local.get("Rules",function(ResultData){
	      var  Rules = ResultData.Rules;
		  console.log(Rules);
		  if(Rules.hasOwnProperty(host)) {
			  Rules[host] = addArray(Rules[host],elementArr);
			  MyStorage.local.set("Rules",Rules);
		  }else {
			  Rules[host] = elementArr;
			  MyStorage.local.set("Rules",Rules);
		  }
	      document.getElementById('message').innerHTML = "规则储存成功";
        });	
	}
	*/
	
	
});

