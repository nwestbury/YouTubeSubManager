"use strict";

var link_list = [];
var gIndex = 0;
var listMode = true;

function displayVideoLink(){
    var htm = '<iframe class="center" width="425" height="349" src="http://www.youtube.com/embed/' + link_list[gIndex] + '?rel=0" frameborder="0" allowfullscreen ></iframe>';
    
    $('#videoPreview').html(htm);
    $('#embedLink').attr('href', 'http://www.youtube.com/embed/' + link_list[gIndex]);
    $('#regLink').attr('href', 'https://www.youtube.com/watch?v=' + link_list[gIndex]);
    $('#embedLink').show();
    $('#regLink').show();

    console.log("displaing ", link_list, gIndex);

    if(gIndex <= 0)
	$('#prevVideo').hide();
    else
	$('#prevVideo').show();

    if(gIndex >= (link_list.length - 1))
	$('#nextVideo').hide();
    else
	$('#nextVideo').show();

    chrome.storage.sync.set({'index': gIndex}, function() {
	console.log('Links saved');
    });
}

function sendData(data){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	chrome.tabs.sendMessage(tabs[0].id, data, function(response) {
	    console.log("got resp", response);
	    if(response !== undefined && response.links !== undefined){
		link_list = response.links;
		chrome.storage.sync.set({'links': link_list, 'index': 0}, function() {
		    console.log('Links saved');
		});
		if(link_list.length){
		    gIndex = 0;
		    displayVideoLink();
		}
	    }
	});
    });
}

$( document ).ready(function(){
    $('#embedLink').hide();
    $('#regLink')  .hide();
    $('#prevVideo').hide();
    $('#nextVideo').hide();
    
    var settings = {
	hidewatched: false,
	hidestreams: false,
    }

    chrome.storage.sync.get(["settings", "links", "index"], function(items){
	gIndex = items.index;
	link_list = items.links;
	settings = items.settings;

	console.log("settings ", settings);

	if(link_list.length){
	    displayVideoLink();
	}
	if(settings.hidestreams){
	    $('#hidestreams').prop('checked', true);
	}

	if(settings.hidewatched){
	    $('#hidewatched').prop('checked', true);
	}
	
    });

    $('#hidewatched').change(function(){
	settings.hidewatched = this.checked;
	sendData({settings: ["hidewatched", this.checked]});
	chrome.storage.sync.set({'settings': settings}, function() {
          console.log('Settings saved');
        });
    });

    $('#hidestreams').change(function(){
	settings.hidestreams = this.checked;
	sendData({settings: ["hidestreams", this.checked]});
	chrome.storage.sync.set({'settings': settings}, function() {
            console.log('Settings saved');
        });
    });

    $('#viewUnplayed').click(function(e){
	e.preventDefault();
	sendData({collect: true});
    });

    $('#nextVideo').click(function(e){
	gIndex++;
	displayVideoLink();
    });

    $('#prevVideo').click(function(e){
	gIndex--;
	displayVideoLink();
    });

})
