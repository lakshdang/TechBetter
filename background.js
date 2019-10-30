//Main Background script
'use strict';

var sites = ['stackoverflow.com', "www.w3schools.com"];
var workTimerActive = false;

var test = [];

var settings = {
	"blockedsites": [],
	"workTime": 5,
	"youtube":{
		"Video": [],
		"Playlist":[],
		"Channel":[]
	}
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    if(request.reason == "videoParams"){
    	// console.log(sender.tab.id);
    	// console.log("Youtube Video Params: \n", request);
    	if(request==undefined)
			return;

		var whitelistedVideo = request.videoId==null || settings.youtube["Video"].indexOf(request.videoId)>-1;
		var whitelistedPlaylist = settings.youtube["Playlist"].indexOf(request.playlistId)>-1;
		var whitelistedChannel = settings.youtube["Channel"].indexOf(request.channelId)>-1;
		
		if(!(whitelistedVideo || whitelistedPlaylist || whitelistedChannel))
			chrome.tabs.update(sender.tab.id, {url: "pageBlocked.html"});
    }
});


function isBlockedHost(tab){
	var host = new URL(tab.url).host;
	for(var i=0; i<settings.blockedsites.length; i++){
		if(tab.url.indexOf(settings.blockedsites[i])>-1)return true;
	}
	return false;
}

function blockTab(tab){
	if(!workTimerActive)return;

	if(isBlockedHost(tab)){
		chrome.tabs.update(tab.id, {url: "pageBlocked.html"});
		return;
	}

	var host = new URL(tab.url).host;
	if(new String(host).valueOf() == new String ("www.youtube.com").valueOf()){
		// console.log("tab: ", tab.id, " is a youtube tab");
		chrome.tabs.sendMessage(tab.id, {reason: "getVideoParams"});
	}
}

function unBlockTab(tab){
	var blockPageUrl = "chrome-extension://" + chrome.runtime.id + "/pageBlocked.html";
	if(tab.url == blockPageUrl){
		chrome.tabs.goBack(tab.id);
	}
}

chrome.runtime.onInstalled.addListener(function(){
	// updateSiteList(sites);
	chrome.storage.sync.get(["settings"], function(result){
		if(result.settings==undefined){
			chrome.storage.sync.set({"settings":settings}, function(){
				console.log("Settings and Extension initialized");
			})
		}
		else
			console.log("Extension initialized");
		
	})
});

function updateSiteList(sites){
	// var stringify = JSON.stringify(settings);
	chrome.storage.sync.set({"settings":settings}, function(){
		console.log("Sites list saved");
		chrome.storage.sync.get(["settings"], function(result){
        	console.log(result.settings);
        });
	});
};

chrome.browserAction.onClicked.addListener(function(){
	if(workTimerActive)return;
	chrome.storage.sync.get(["settings"], function(result){
        settings = result.settings;
        chrome.alarms.create("TechBetterAlarm", {delayInMinutes: settings.workTime});
		workTimerActive = true;
        chrome.tabs.query({}, function(tabs){
			tabs.forEach(function(tab, tabIdx){
				blockTab(tab);
			});
		});
    });
});

chrome.alarms.onAlarm.addListener(function(alarm){
	if(alarm.name == "TechBetterAlarm"){
		workTimerActive = false;
		chrome.tabs.query({}, function(tabs){
			tabs.forEach(function(tab, tabIdx){
				unBlockTab(tab);
			});
		});
	}
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    if(request.reason == "toggleResource")
    	console.log(request);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	blockTab(tab);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	var hostIsYoutube = new URL(tab.url).host == "www.youtube.com";
	if(hostIsYoutube && (changeInfo.status=="complete" || changeInfo.title != undefined)){
	// if(hostIsYoutube && (changeInfo.status=="complete")){
		chrome.tabs.sendMessage(tabId, {url: tab.url, listener: "youtubeListener", settings: settings});
	}
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	var hostIsYoutube = new URL(tab.url).host == "www.youtube.com";
	if(hostIsYoutube && changeInfo.url!=undefined)
		chrome.tabs.reload(tabId);
});

function isResourceWhitelisted(resourceType, resourceId){
	if(resourceType == "Video")return settings.youtube.Video.indexOf(resourceId)>-1;
	if(resourceType == "Playlist")return settings.youtube.Playlist.indexOf(resourceId)>-1;
	if(resourceType == "Channel")return settings.youtube.Channel.indexOf(resourceId)>-1;
	return false;
}