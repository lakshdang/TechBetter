//Main Background script

'use strict';

var sites = ['stackoverflow.com', "www.w3schools.com"];
// sites.append()
var workTimerActive = false;
console.log(chrome.runtime.id);

function blockUrl(url){
	var host = new URL(url).host;
	if(sites.indexOf(host)>-1)
		return true;
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
	chrome.storage.sync.set({'sites':sites}, function(){
		console.log("Sites list saved");
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
    console.log(request.message);
 });

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	blockTab(tab);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	if(changeInfo.url != undefined || changeInfo.status=="complete" || changeInfo.title != undefined){
		// console.log(changeInfo);
		// console.log("Sending add button message")
		chrome.tabs.sendMessage(tabId, {url: tab.url, Listener: "youtubeListener"});
	}
});