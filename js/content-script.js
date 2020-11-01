var HOST;                    //域名
var AdCount = 0;             //广告数量

//获取CSS选择器
function getCssSelector(el) {
        if (!(el instanceof Element)) 
            return;
        var path = [];
        while (el.nodeType === Node.ELEMENT_NODE) {
            var selector = el.nodeName.toLowerCase();
            if (el.id) {
                selector += '#' + el.id;
                path.unshift(selector);
                break;
            } else {
                var sib = el, nth = 1;
                while (sib = sib.previousElementSibling) {
                    if (sib.nodeName.toLowerCase() == selector)
                       nth++;
                }
                if (nth != 1)
                    selector += ":nth-of-type("+nth+")";
            }
            path.unshift(selector);
            el = el.parentNode;
        }
        return path.join(" > ");
}

//获取鼠标所在元素
function GetDomByPosition(x,y) {
    var dom = document.elementFromPoint(x,y);
    if(dom == null) {
        return null;
    }
   
    var $dom =$(dom);
    var DomName = $dom[0].tagName.toLowerCase();
    if(DomName == 'html' || DomName == 'body') {
        return null;
    }

    while(DomName == 'iframe' || DomName == 'frame') {
        var FLeft = Math.ceil($dom.offset().left);
        var FTop  = Math.ceil($dom.offset().top);
        x = x - FLeft;
        y = y - FTop;
        var $dom=$($dom[0].contentWindow.document.elementFromPoint(x,y));

        if($dom[0]== null) {
            return null;
        }
        DomName = $dom[0].tagName.toLowerCase();
        if(DomName == 'html' || DomName == 'body') {
            return null;
        }
    }

    return $dom;
}

document.addEventListener('DOMContentLoaded', function (){
	console.log('DOM完全加载并解析了');
	HOST = location.hostname;
	
	var body = document.getElementsByTagName('body');
	if(typeof(body) != 'undefined'){
		
		body[0].onmousedown = function(event){
			if (event.button != 2) return;
			var e = event || window.event;
            var x = e.clientX ;
            var y = e.clientY ;
	        console.log(x+','+y);
			var css = '';
            var elem = GetDomByPosition(x,y);
			console.log(elem);
			chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
				if(request.OpenMenus) {
					if(elem == null) return;
					var temStyle = elem[0].style;

					elem[0].style = 'background: #6666FF; border-style:outset; border-width:1px';
					Swal.fire({
						title:'选择屏蔽',
						text:'屏蔽此广告吗？',
						showCancelButton:true,
						confirmButtonText:'确定',
						cancelButtonText:'取消',
						confirmButtonClass:'block',	
					}).then((isConfirm) => {
						try{
							if(isConfirm.value) {
								css = getCssSelector(elem[0]);
								if (css == null) return;
								var blockElement = document.querySelectorAll(css);
								console.log(blockElement);
								blockElement[0].style.display = 'none'; 
								console.log("send" + css);
						        chrome.runtime.sendMessage({HOST: HOST, Selector: css},function(response){});
							} else {
								elem[0].style = temStyle;
								elem = null;
							}
						}catch(e) {
							console.log(e);
						}
					});
					
				}

				sendResponse({block: true});
			});
		};
			
	}
	
chrome.runtime.sendMessage({Status: "Finished", CheckWhiteList: "no",URL: location.href}, function(response) {		
        if(typeof(response) == 'undefined') return;	
        if(response.result == "isWhiteList") {
			console.log("白名单");
		} else {
			chrome.runtime.sendMessage({CheckWhiteList: "yes",URL: location.href},function(response){
				if(typeof(response) == 'undefined') return;
				console.log("get Rules:");
				console.log(response.BlockArr);
				console.log(response.BlockArr.length);
				var BlockArr = response.BlockArr;
				if (BlockArr.length) {
					var notCatch = FirstBlock(BlockArr);
					/*
					console.log('noCatch:');
					console.log(notCatch);
					if(notCatch.length) {
						var notCatch2 = SecondBlock(notCatch);
						console.log('notCatch2:');
					    console.log(notCatch2);
						if(notCatch2.length) {	
						  ThirdBlock(notCatch2);
						}
					}
					*/	
				}
			    
				
				chrome.runtime.sendMessage({AdCount: AdCount,URL: location.href}, function(response){});
			   
			});	
		}
    });
});


function ThirdBlock(BlockArr) {
	var flag = false;
	window.onload = function() {
		console.log('thirdbegin');
		for( var i =0; i<BlockArr.length; i++) {
		  try {
		  var blockElement = document.querySelectorAll(BlockArr[i]);
		  }catch(e) {
			  console.log(e);
		  }
		  if(blockElement.length) {
			  for(var k = 0;k<blockElement.length; k++) {
				  AdCount++;
				  blockElement[k].style.display = "none";
				  flag = true;
				  console.log('屏蔽了');
				  console.log(blockElement[k]);
			  }
		  }else {
			  
		  }
		}
		if(flag) {
		  console.log("三次发送"+AdCount);
		  chrome.runtime.sendMessage({AdCount: AdCount}, function(response){});
		}
	}
}

function FirstBlock(BlockArr) 
{
	var canNotCatch = new Array();
	for( var i = 0; i < BlockArr.length; i++) {
		console.log(BlockArr[i]);
		try {
		    var blockElement = document.querySelectorAll(BlockArr[i]);
		}catch(e) {
	        console.log(e);
			return new Array();
		}
		if(blockElement.length) {
			for(var k = 0; k < blockElement.length; k++) {
				AdCount++;
				blockElement[k].style.display = "none";
				console.log('屏蔽了');
				console.log(blockElement[k]);
			}
		} else{
			canNotCatch.push(BlockArr[i]);
		}	
	}
	return canNotCatch;
}

function SecondBlock(BlockArr) 
{
	var insertedNodes = [];
	var canNotCatch = new Array();
	var flag = false;
	
    var observer = new MutationObserver(function(mutations) {
		console.log('second begin');
	    for( var i =0; i<BlockArr.length; i++) {
		  if(typeof(BlockArr[i]) == 'undefined') continue;
		  try {
		    var blockElement = document.querySelectorAll(BlockArr[i]);
		  }catch(e) {
			  console.log(e);
		  }
		  if(blockElement.length) {
			  for(var k = 0;k<blockElement.length; k++) {
				  AdCount++;
				  blockElement[k].style.display = "none";
				  delete BlockArr[i];
				  flag = true;
				  console.log('屏蔽了');
				  console.log(blockElement[k]);
			  }
		  }else {
			 if(!ArrHasPara(canNotCatch,BlockArr[i])) {
			   canNotCatch.push(BlockArr[i]); 
			 }
		  }
		}
        if (flag ) {
			try {
		        console.log("二次发送"+AdCount);
		        chrome.runtime.sendMessage({AdCount: AdCount}, function(response){});
			} catch(e) {
				console.log(e);
			}
	    }		
    });
    observer.observe(document, { childList: true, subtree: true });
	
	return canNotCatch;
}

function getHost(src) {
	var url = document.createElement('a');
	url.href = src;
	return url.host;	
}
function ArrHasPara(arr,para) 
{
	for(let i = 0; i < arr.length; i++) {
		if(arr[i] == para) {
			return true;
		}
	}
	return false;
}





