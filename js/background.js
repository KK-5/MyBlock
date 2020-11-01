//-------------------- 右键菜单 ------------------------//
function openMenus () {
	console.log('openn');
chrome.contextMenus.create({
	title: "屏蔽此广告",
	contexts: ['all'],
	onclick: function(info,tab){
		console.log(info);
		console.log(tab);
		
		console.log('打开');
		try {
		sendMessageToContentScript({OpenMenus: true},function(response){
			console.log(response);
			chrome.runtime.onMessage.addListener(selectBlock);
		});
		} catch(e) {
			console.log(e);
		}
		
	}
});
}

function CheckObjectPepeat(object, value)
{
	for (let i = 0; i < object.length; i++) {
		if (object[i] == value) return true;
	}
	return false;
}

function selectBlock(request, sender, sendResponse){
	if(typeof(request.Selector) != 'undefined') {
	  console.log(request);
	  let host = request.HOST;
	  if(host.search("www.") != -1)
		 host = host.substring(4,host.length);
	  let CssSelector = request.Selector;
	  if(TheRules.hasOwnProperty(host)) {
		 console.log(TheRules[host]);
		 if (CheckObjectPepeat(TheRules[host], CssSelector)) return;
		 TheRules[host].push(CssSelector);
		 MyStorage.local.set("Rules",TheRules);
      }else {
		 TheRules[host] = new Array;
		 TheRules[host].push(CssSelector);
		 MyStorage.local.set("Rules",TheRules);
	  }
	}
}



//-------------------- 变量 ------------------------//
var RedirectUrl = Extension.getURL("BlackBlock.html");    //黑名单网站阻止页面
var AdCount = 0;                                          //广告数量，为-1则网站是白名单网站
var WhiteList;                                            //白名单
var BlackList;                                            //黑名单
var TheRules;                                             //过滤规则
var UseExtension = true;                                  //是否使用插件
var Tab_URL = new Object;                                 //tab 到 url 映射
var URL_AdCount = new Object;                             //url 到 广告数 映射
var Rules = {};                                           //初始规则为空


//-------------------- 初始化 ------------------------//

//chrome.storage.local.clear();

chrome.storage.local.getBytesInUse("Rules",function(bytesInUse){
	if(bytesInUse == 0) {
		MyStorage.local.set("Rules",Rules);
	} else {
		console.log(bytesInUse);
	}
});

if(UseExtension){
  Init();
}else {
  console.log('插件已禁用');
}

chrome.storage.onChanged.addListener(function(changes, areaName){
	console.log("----------------------------------------");
    console.log('过滤规则已更新');
	removeListener();
	if(UseExtension) {
	 Init();
	}else {
	 console.log('插件已禁用');	
	}
	
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(typeof(request.UseExtensionValue) != 'undefined') {
		if(request.UseExtensionValue == 'Change') {
			if(UseExtension == false) {
				removeListener();
				console.log('插件已禁用');
			}else {
				Init();
				console.log('插件已启用');
			}
		}
	}
	return true;
});

//-------------------- 处理函数 ------------------------//

function Init(){
  /*
  MyStorage.local.get("BlackList",function(ResultSet){
	console.log("黑名单加载完成");
	console.log(ResultSet);
	BlackList = ResultSet;
	DoBlackList();
	
  });
 */  
  MyStorage.local.get("WhiteList",function(ResultSet){	
	console.log("白名单加载完成");
	console.log(ResultSet);
	WhiteList = ResultSet;
	doWhiteList();
	
  });
  
  MyStorage.local.get("Rules",function(ResultData){	
	console.log("过滤规则加载完成");
	console.log(ResultData);
	if(ResultData) {
	   TheRules = ResultData.Rules;
	  doBlock();
	}
  });
  
  chrome.contextMenus.removeAll(function(){});
  openMenus(); 
  chrome.tabs.onActivated.addListener(ChangeTab);
}

//

function doBlock() {	
	
	getCurrentTabId(tabId => {
		if(tabId) {
			chrome.webNavigation.getAllFrames({tabId:tabId},function(details){
		        if(details.length == 1){
					var currentTab = details[0];
				} else {
					for (var i=0; i<details.length; i++){
						if(details[i].frameId  == 0) {
							var currentTab = details[i];
							console.log('currentTab');
						}
					}						
				}
			});
		}
				chrome.runtime.onMessage.addListener(doBlockListener);					        		      
	    });
	  
}

function doBlockListener (request, sender, sendResponse){
 if(request.CheckWhiteList == "yes"){
	getCurrentTabId(tabId => {
	  if(!tabId) return;
	  var host = getHost([request.URL]);
	  if(host.search("www.") != -1)
		 host = host.substring(4,host.length);
	  console.log(host);
	  if (TheRules.hasOwnProperty(host)) {
	      console.log(TheRules[host]);
	  }
	  chrome.webNavigation.getAllFrames({tabId:tabId},function(details){
		    if(details.length == 1){
				Tab_URL[tabId] = request.URL;
                if(TheRules.hasOwnProperty(host)) {
				  var BlockArr = TheRules[host];
				  sendResponse({BlockArr:BlockArr, IsTop: true});
			    }else {
				  sendResponse({BlockArr:[], IsTop: true});
			    }				
			} else {
				for (var i=0; i<details.length; i++){
				  if(details[i].frameId  == 0 && typeof(Tab_URL[tabId] == 'undefined')) {	
					Tab_URL[tabId] = details[i].url;
				  }
				  
				  if(details[i].frameId == 0 ){
					if(TheRules.hasOwnProperty(host)) {
				      var BlockArr = TheRules[host];
				      sendResponse({BlockArr:BlockArr, IsTop: true});
			        }else {
				      sendResponse({BlockArr:[], IsTop: true});
			        }	
				  } else {
					if(TheRules.hasOwnProperty(host)) {
				      var BlockArr = TheRules[host];
				      sendResponse({BlockArr:BlockArr, IsTop: false});
			        }else {
				      sendResponse({BlockArr:[], IsTop: false});
			        } 
				  }
			    }
                				
			}
		  
		});
	 		 		  	  
	});
 }
}


function DoBlackList(){
	WebRequest.onBeforeRequest.addListener(
	  DoBlackListListener,
	  {urls: ["<all_urls>"]},
      ["blocking"]
	);
}

function DoBlackListListener (details) {
	var reponse = {cancel: false};
		let URL = details.url;
	    let FrameId = details.frameId;
		let HOST = "^((http|https)?://)"+getHost(URL)+"/$";
		let ReHost=new RegExp(HOST);
		if(ReHost.test(URL)) {     //判断请求的URL是网站还是资源
		  if(BlackList.has(URL) && FrameId == 0) {
		    console.log("找到黑名单了");
		    console.log("信息"+HOST);
			reponse = {redirectUrl: RedirectUrl};
		  }
		} else {
		  if(BlackList.has(URL)) {
			console.log("找到黑名单资源了");
		    console.log("信息"+URL);
			reponse = {cancel: true}; 
		  }
		}
	  return reponse;
}

function doWhiteList(){
	chrome.runtime.onMessage.addListener(doWhiteListListener);
}

function doWhiteListListener (request, sender, sendResponse){
	if(request.Status == "Finished" && request.CheckWhiteList == "no") {
		  if(WhiteList.has(request.URL)){
			  AdCount = -1;
			  sendResponse({result: "isWhiteList"});
		  }	else {
			  sendResponse({result: "noWhiteList"});
		  }			  
	  }
}	

//移除监听
function removeListener(){
	chrome.runtime.onMessage.removeListener(doWhiteListListener);
	WebRequest.onBeforeRequest.removeListener(DoBlackListListener,
	  {urls: ["<all_urls>"]},
      ["blocking"]);
	chrome.runtime.onMessage.removeListener(doBlockListener);
	chrome.tabs.onActivated.removeListener(ChangeTab);
    chrome.contextMenus.removeAll(function(){});
}	

//标签切换更新广告数量
function ChangeTab(activeInfo){
	console.log('标签切换-------');
	let tabId = activeInfo.tabId;
	let currentURL = Tab_URL[tabId];
	if(URL_AdCount.hasOwnProperty(currentURL) && typeof(currentURL) != 'undefined') {
	  AdCount = URL_AdCount[currentURL];
	} else {
	  getCurrentTab(tab => {
		  currentURL = tab.url;
		  //console.log(currentURL);
		  /*
		  if(currentURL == '') return;
		  if(currentURL != 'chrome://extensions/') {
		    chrome.tabs.update(tabId, {url: currentURL});
		  }
		  */
	  });
	}
}

//判断url是否在Tab中
function Url_in_Tab (url) {
	for(var i in Tab_URL) {
      if(Tab_URL[i] == url) {
		  return true;
	  }
    }
   return false;
}

//获取广告数量
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	 if(typeof(request.AdCount) != 'undefined') {
	   var AdCount_tem = request.AdCount;
	   var currentURL = request.URL;
	
	   if(Url_in_Tab(currentURL)) {
	     URL_AdCount[currentURL] = AdCount_tem;
	     AdCount = AdCount_tem;
	   }		 
	 }	else{
	
	 }
});  

//发送消息到content.js
function sendMessageToContentScript(message, callback)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response)
        {
            if(callback) callback(response);
        });
    });
}


// 获取当前tab
function getCurrentTab(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0]: null);
	});
}

// 获取当前选项卡ID
function getCurrentTabId(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0].id: null);
	});
}

// 当前标签打开某个链接
function openUrlCurrentTab(url)
{
	getCurrentTabId(tabId => {
		chrome.tabs.update(tabId, {url: url});
	})
}

// 新标签打开某个链接
function openUrlNewTab(url)
{
	chrome.tabs.create({url: url});
}



function getAdCount(){
	return AdCount;
}




console.log("----------------------------------------");

