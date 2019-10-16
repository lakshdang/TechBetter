//Main Background script
'use strict';

var sites = ['stackoverflow.com', "www.w3schools.com"];
var workTimerActive = false;
console.log(chrome.runtime.id);

var test = [];

var settings = {
	"blockedsites": sites,
	"youtube":{
		"Video": ["1L0TKZQcUtA"],
		"Playlist":["PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"],
		"Channel":[]
	}
}

function blockYoutubeUrl(url){
	var params = new URLSearchParams(url);
	// console.log(params);
}

function blockUrl(url){
	var host = new URL(url).host;
	if(sites.indexOf(host)>-1)
		return true;
	// if(host.indexOf("youtube.com")>-1)
		// return blockYoutubeUrl(url);
	blockYoutubeUrl(url);
	return false;
}

function blockTab(tab){
	var blockCurrUrl = blockUrl(tab.url);
	if(workTimerActive && blockCurrUrl){
		chrome.tabs.update(tab.id, {url: "pageBlocked.html"});
	}
}

function unBlockTab(tab){
	var blockPageUrl = "chrome-extension://" + chrome.runtime.id + "/pageBlocked.html";
	if(tab.url == blockPageUrl){
		chrome.tabs.goBack(tab.id);
	}
}

chrome.runtime.onInstalled.addListener(function(){
	updateSiteList(sites);
	console.log("Extension initialized");
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
	chrome.alarms.create("TechBetterAlarm", {delayInMinutes: 1});
	workTimerActive = true;
	chrome.tabs.query({}, function(tabs){
		tabs.forEach(function(tab, tabIdx){
			blockTab(tab);
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
	if(hostIsYoutube && (changeInfo.url != undefined || changeInfo.status=="complete" || changeInfo.title != undefined)){
	// if(hostIsYoutube && changeInfo.status=="complete"){
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