console.log("Youtube Content Script Started");

var buttonInsertDivs = ["ytd-playlist-sidebar-primary-info-renderer", "ytd-playlist-panel-renderer", "app-header-layout"]

// var observer = new MutationObserver(function(mutations){
// 	mutations.forEach(function(mutation) {
//     	if(mutation.addedNodes.length==0)return;
//     	for(var i = 0; i < mutation.addedNodes.length; i++){
//     		if(mutation.addedNodes[i] instanceof HTMLElement){
//     			for(var j=0; j<buttonInsertDivs.length; j++){
//     				if(mutation.addedNodes[i].getElementsByTagName(buttonInsertDivs[j]).length>0){
//     					// console.log(mutation.addedNodes[i].getElementsByTagName(buttonInsertDivs[j])[0]);
//     					getSettings(addButtons);
//     				}
//     			}
//     		}
//   		}
// 	});
// });

// observer.observe(document.body, {
//     childList: true
//   , subtree: true
//   , attributes: false
//   , characterData: false
// })

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
  	if(request.listener == "youtubeListener"){
  		addVideoButton(request);
    	addPlaylistButton(request);
    	addChannelButton(request);
  	}
 });

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
  	if(request.reason == "getVideoParams"){
  		console.log("inside getVideoParams message listener");
  		var params = new URLSearchParams(window.location.search);
  		var playlistId = null;
  		var videoId = null;
  		var channelId = null;
  		if(params.has("list"))playlistId = params.get("list");
  		if(params.has("v")){
	  		videoId = params.get("v");
	  		channelId = getVideoChannelId();
  		}
  		chrome.runtime.sendMessage({reason:"videoParams", videoId: videoId, playlistId:playlistId, channelId:channelId});
  	}
 });

function addButtons(request){
	addVideoButton(request);
	addPlaylistButton(request);
	addChannelButton(request);
}

function addVideoButton(request){
	var urlParams = new URLSearchParams(window.location.search);
	if(urlParams.has("v")){
		var menu = document.getElementById("info");
		insertButton("Video", menu, request);
		// getVideoChannelId();
	}
}

function addPlaylistButton(request){
	var isPlaylistVideo = (new URLSearchParams(window.location.search)).has("list") && (new URLSearchParams(window.location.search)).has("v");
	var isPlaylistPage = (window.location.pathname.indexOf("/playlist") == 0);

	if(isPlaylistVideo){
		var menu = document.getElementsByTagName("ytd-playlist-panel-renderer")[0];
		insertButton("Playlist", menu, request);
	}
	if(isPlaylistPage){
		var menu = document.getElementsByTagName("ytd-playlist-sidebar-primary-info-renderer")[0];
		insertButton("Playlist", menu, request);
	}

	// console.log(document.getElementById("TechBetterButton-Playlist"));
}

function addChannelButton(request){
	var isChannelPage = window.location.pathname.indexOf("/channel") == 0;
	var isUserPage = window.location.pathname.indexOf("/user") == 0
	if(!(isChannelPage || isUserPage))return;
	// console.log(getCanonical());
	var menu = document.getElementById("inner-header-container");
	insertButton("Channel", menu, request);
}

function getVideoChannelId(){
	var channelElement = document.getElementsByTagName("ytd-video-owner-renderer")[0].getElementsByTagName("ytd-channel-name")[0].getElementsByTagName('a')[0];
	var arr = channelElement.getAttribute("href").split("/");
	return arr[arr.length-1];
}

function getCanonical(){
	var canonical = "";
	var links = document.getElementsByTagName("link");
	for (var i = 0; i < links.length; i ++) {
	    if (links[i].getAttribute("rel") === "canonical") {
	        canonical = links[i].getAttribute("href");
	        return canonical;
	    }
	}
	return window.location.href;	
}

function extractChannelId(){
	// console.log(canonical);
	var arr = getCanonical().split("/");
	return arr[arr.length-1];
}

function insertButton(resourceType, menu, request){
	var buttonId = "TechBetterButton-"+resourceType
	// var extensionBtn = document.getElementById(buttonId);
	// console.log(extensionBtn);
	if(menu == undefined || menu == null)
		return;
	var btn = document.createElement("BUTTON");
	btn.setAttribute("id", buttonId);
	getInitialToggleState(request, resourceType, function(initialToggleState){
		btn.setAttribute("toggleState", initialToggleState);
		btn.innerHTML = btn.getAttribute("toggleState") + " " + resourceType;
		btn.onclick = function(){
			toggleBtnHTML(btn, resourceType);
		}
		var extensionBtn = document.getElementById(buttonId);
		if(extensionBtn != null)
			extensionBtn.parentNode.removeChild(extensionBtn);
		menu.append(btn);
	})
}

function updateButtonState(request, resourceType, state){
	getToggleState(request, resourceType);
	document.getElementById("TechBetterButton-"+resourceType).innerHTML = state + " " + resourceType;
}

function getInitialToggleState(request, resourceType, callback){
	var params = new URLSearchParams(window.location.search)
	var resourceId = getResourceId(resourceType);
	getYoutubeSettings(function(settings){
		var whitelist = settings.youtube[resourceType];
		if(whitelist.indexOf(resourceId)>-1)callback("Blacklist");
		else callback("Whitelist");
	});
}

function toggleBtnHTML(btn, resourceType){
	var currState = btn.getAttribute("toggleState");
	resourceId = getResourceId(resourceType);
	
	getYoutubeSettings(function(settings){
		youtubeSettings = settings.youtube;
		removeItemFromArray(youtubeSettings[resourceType], resourceId);
		if(currState=="Whitelist")
			youtubeSettings[resourceType].push(resourceId);
		
		updateYoutubeSettings(settings, function(){			
			if(currState=="Whitelist")
				btn.setAttribute("toggleState", "Blacklist");
			else 
				btn.setAttribute("toggleState", "Whitelist");

			btn.innerHTML = btn.getAttribute("toggleState") + " " + resourceType;
			getYoutubeSettings(function(result){
				// console.log(settings.youtube);
			})
		});
	})
}

function getResourceId(resourceType){
	var params = new URLSearchParams(window.location.search)

	if(resourceType=='Video')
		return params.get("v");
	if(resourceType=='Playlist')
		return params.get("list");
	if(resourceType=='Channel')
		return extractChannelId();
	return null;
}

function getYoutubeSettings(callback){
	chrome.storage.sync.get(["settings"], function(result){
		callback(result.settings)
	});
}

function updateYoutubeSettings(settings, callback){
	chrome.storage.sync.set({"settings": settings},function(){
		callback();
	});
}

function removeItemFromArray(resourceWhiteList, resourceId){
	var index = resourceWhiteList.indexOf(resourceId);
	if (index > -1) 
		resourceWhiteList.splice(index, 1);
}