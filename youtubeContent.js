console.log("Content Script Started");
// addButton();
var urlParams = new URLSearchParams(window.location.search);
// console.log(urlParams.has("v"));
// console.log(urlParams.has("list"))
// console.log(window.location.pathname);
// var canonical = "";


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    // console.log(sender.tab ?
    //             "from a content script:" + sender.tab.url :
    //             "from the extension");
    addVideoButton(request);
    addPlaylistButton(request);
    addChannelButton(request);
 });

// chrome.runtime.sendMessage({message: "Message from youtubeContent script"});

function addButton(request){
	var extensionBtn = document.getElementById("Extension-Video-Id");
	var menu = document.getElementById("info");
	if(menu == null)
		return;
	var btn = document.createElement("BUTTON");
	btn.setAttribute("id", "Extension-Video-Id");
	btn.innerHTML = request.url;
	btn.onclick = function(){
		chrome.runtime.sendMessage({message: "Message from youtubeContent script"});
	}
	if(extensionBtn != null){
		extensionBtn.parentNode.removeChild(extensionBtn);
	}
	menu.append(btn);
}

function addVideoButton(request){
	var urlParams = new URLSearchParams(window.location.search);
	if(urlParams.has("v")){
		var extensionBtn = document.getElementById("Extension-Video-Id");
		var menu = document.getElementById("info");
		if(menu == null)
			return;
		var btn = document.createElement("BUTTON");
		btn.setAttribute("id", "Extension-Video-Id");
		btn.innerHTML = "Toggle Video";
		btn.onclick = function(){
			chrome.runtime.sendMessage({message: "Message from youtubeContent script"});
		}
		if(extensionBtn != null){
			extensionBtn.parentNode.removeChild(extensionBtn);
		}
		menu.append(btn);
	}
}

function addPlaylistButton(request){
	var isPlaylistVideo = (new URLSearchParams(window.location.search)).has("list");
	var isPlaylistPage = (window.location.pathname.indexOf("/playlist") == 0);
	if(isPlaylistVideo || isPlaylistPage)console.log("On playlist page");
	if(isPlaylistPage){
		var menu = document.getElementsByTagName("ytd-playlist-sidebar-primary-info-renderer")[0].getElementsByTagName("h1")[0];
		console.log(menu);
	}
	if(isPlaylistVideo){
		var menu = document.getElementsByTagName("ytd-playlist-panel-renderer")[0].getElementsByTagName("ytd-menu-renderer")[0];
		console.log(menu);
	}
	

}

function addChannelButton(request){
	var isChannelPage = window.location.pathname.indexOf("/channel") == 0;
	var isUserPage = window.location.pathname.indexOf("/user") == 0
	if(isChannelPage || isUserPage)console.log(getCanonical());

}

function getCanonical(){
	var canonical = "";
	var links = document.getElementsByTagName("link");
	for (var i = 0; i < links.length; i ++) {
	    if (links[i].getAttribute("rel") === "canonical") {
	        canonical = links[i].getAttribute("href");
	        break;
	    }
	}
	return canonical;
}