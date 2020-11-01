
var Bg = chrome.extension.getBackgroundPage();    //背景页
var AdCount = Bg.getAdCount();                    //广告数

//-------------初始化---------------------//
getCurrentTab(tab =>{
	if(Bg.WhiteList.has(tab.url)){
		$('#addThisPagetoWhiteList').css("display","none");
	    $('#removeThisPagefromWhiteList').css("display","block");
		$('#pageinWhiteList').css("display","block");
	    $('#blockMessage').css("display","none");
	}	
});		
	
if(Bg.UseExtension) {
  if(AdCount == -1){
	  $('#pageinWhiteList').css("display","block");
	  $('#blockMessage').css("display","none");
  }else {
	  $('#pageinWhiteList').css("display","none");
	  $('#blockMessage').css("display","block");
	  document.getElementById("AdCount").innerHTML = AdCount;	
  }
} else {
  $('#pageinWhiteList').css("display","none");
  $('#blockMessage').css("display","none");
  $('#notUseExtension').css("display","block");
  $('#stopExtension').css("display","none");
  $('#startExtension').css("display","block");
  $('#addThisPagetoWhiteList').css("display","none");
  $('#removeThisPagefromWhiteList').css("display","none");
}
//
$('#option').mouseover(ele => {
	 $("#option").css("height","23px");
	 $("#option").css("width","23px");
});

$('#option').mouseout(ele => {
	 $("#option").css("height","20px");
	 $("#option").css("width","20px");
});

$('#option').click(ele => {
	Bg.openUrlNewTab("option.html");
});	


$('#addThisPagetoWhiteList').mouseover(ele => {
	$('#addThisPagetoWhiteList').css("background-color","#E9E9E4");
});

$('#addThisPagetoWhiteList').mouseout(ele => {
	$('#addThisPagetoWhiteList').css("background-color","#FFFFFF");
});

//-------------添加到白名单---------------------//
$('#addThisPagetoWhiteList').click(ele => {
	$('#addThisPagetoWhiteList').css("display","none");
	$('#removeThisPagefromWhiteList').css("display","block");	
    getCurrentTab(tab =>{
		//document.getElementById("test").innerHTML = AdCount;
			Bg.WhiteList.add(tab.url);
			MyStorage.local.set('WhiteList',Bg.WhiteList);
			chrome.tabs.update(tab.id, {url: tab.url});
			$('#blockMessage').css("display","none");
			$('#pageinWhiteList').css("display","block");
	});						
});

//-------------停止插件---------------------//
$('#stopExtension').mouseover(ele => {
	$('#stopExtension').css("background-color","#E9E9E4");
});

$('#stopExtension').mouseout(ele => {
	$('#stopExtension').css("background-color","#FFFFFF");
});

$('#stopExtension').click(ele => {	
	$('#stopExtension').css("display","none");
	$('#startExtension').css("display","block");
	$('#addThisPagetoWhiteList').css("display","none");
	$('#removeThisPagefromWhiteList').css("display","none");
	getCurrentTab(tab =>{
		Bg.UseExtension = false;
		try {
		 chrome.runtime.sendMessage({'UseExtensionValue':'Change'},function(reponse){});
		}catch(e) {
		
		}
		chrome.tabs.update(tab.id, {url: tab.url});
		$('#blockMessage').css("display","none");
	    $('#pageinWhiteList').css("display","none");
	    $('#notUseExtension').css("display","block");	
	});	
});

//-------------移除白名单---------------------//
$('#removeThisPagefromWhiteList').mouseover(ele => {
	$('#removeThisPagefromWhiteList').css("background-color","#E9E9E4");
});

$('#removeThisPagefromWhiteList').mouseout(ele => {
	$('#removeThisPagefromWhiteList').css("background-color","#FFFFFF");
});

$('#removeThisPagefromWhiteList').click(ele => {
	$('#addThisPagetoWhiteList').css("display","block");
	$('#removeThisPagefromWhiteList').css("display","none");
	getCurrentTab(tab =>{
			Bg.WhiteList.delete(tab.url);
			MyStorage.local.set('WhiteList',Bg.WhiteList);
			chrome.tabs.update(tab.id, {url: tab.url});
			window.close();
	});					
});

//-------------启用插件---------------------//
$('#startExtension').mouseover(ele => {
	$('#startExtension').css("background-color","#E9E9E4");
});

$('#startExtension').mouseout(ele => {
	$('#startExtension').css("background-color","#FFFFFF");
});

$('#startExtension').click(ele => {
	$('#addThisPagetoWhiteList').css("display","block");
	$('#removeThisPagefromWhiteList').css("display","none");
	$('#stopExtension').css("display","block");
	$('#startExtension').css("display","none");
	getCurrentTab(tab =>{
		Bg.UseExtension = true;
		chrome.runtime.sendMessage({'UseExtensionValue':'Change'},function(reponse){});
		chrome.tabs.update(tab.id, {url: tab.url});
		window.close();
	});
});



// 获取当前标签ID
$('#get_current_tab_id').click(() => {
	getCurrentTabId(tabId => {
		alert('当前标签ID：' + tabId);
	});
});

// 高亮tab
$('#highlight_tab').click(() => {
	chrome.tabs.highlight({tabs: 0});
});

// popup主动发消息给content-script
$('#send_message_to_content_script').click(() => {
	sendMessageToContentScript('你好，我是popup！', (response) => {
		if(response) alert('收到来自content-script的回复：'+response);
	});
});



// 获取当前选项卡ID
function getCurrentTabId(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0].id: null);
	});
}

//获取当前标签信息
function getCurrentTab(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0]: null);
	});
}
// 获取当前选项卡id
function getCurrentTabId2()
{
	chrome.windows.getCurrent(function(currentWindow)
	{
		chrome.tabs.query({active: true, windowId: currentWindow.id}, function(tabs)
		{
			if(callback) callback(tabs.length ? tabs[0].id: null);
		});
	});
}

// 向content-script主动发送消息
function sendMessageToContentScript(message, callback)
{
	getCurrentTabId((tabId) =>
	{
		chrome.tabs.sendMessage(tabId, message, function(response)
		{
			if(callback) callback(response);
		});
	});
}

// 向content-script注入JS片段
function executeScriptToCurrentTab(code)
{
	getCurrentTabId((tabId) =>
	{
		chrome.tabs.executeScript(tabId, {code: code});
	});
}



