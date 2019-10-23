window.onload = function(){
	// console.log("options js file invoked")
	var submitButton = document.getElementById("submitSettings");
	if(submitButton!=null)submitButton.onclick = function(){updateSettings();}
	populateCurrSettings();
}

function updateSettings(){

	var site_list = document.getElementById("site_list").value.split("\n");
	// console.log(site_list);
	cleanedSiteList = [];
	site_list.forEach(function(site, idx){
		curr_site = site.trim();
		if(curr_site.length>3)cleanedSiteList.push(curr_site);
	})
	console.log(cleanedSiteList);
	var timer_mins = parseInt(document.getElementById("timer_mins").value);
	if(String(timer_mins) != document.getElementById("timer_mins").value || timer_mins<1){
		alert("Please enter a positive integer for work timer duration");
		return;
	}

	chrome.storage.sync.get(["settings"], function(result){
		settings = result.settings;
		settings.blockedsites = cleanedSiteList;
		settings.workTime = timer_mins;
		chrome.storage.sync.set({"settings": settings}, function(){
			alert("settings successfully updated");
			populateCurrSettings();
		})
	})
}

function populateCurrSettings(){
	chrome.storage.sync.get(["settings"], function(result){
		var settings = result.settings;
		var siteString = "";
		settings.blockedsites.forEach(function(site, idx){
			siteString += site + "\n";
		})
		if(document.getElementById("site_list")!=null){
			document.getElementById("site_list").value = siteString;
			document.getElementById("timer_mins").value = settings.workTime;
		}
		
	})
}