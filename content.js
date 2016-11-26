var settings = {
    hidewatched: false,
    hidestreams: false,
}


// Read a page's GET URL variables and return them as an associative array.
function getUrlVars(link)
{
    var vars = [], hash;
    var hashes = link.slice(link.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function getItems(ele, gm){
    if(gm){
	return ele.closest('.yt-shelf-grid-item');
    }else{
	return ele.closest('.item-section');
    }
}

function eval_once(eval_list){

    var grid_mode = $('.yt-shelf-grid-item').length;
    var eval_all = eval_list === undefined;
    var eval_name = eval_list && eval_list[0];
    
    if(eval_all || eval_name == "hidewatched"){
	var watched = $('.yt-lockup-thumbnail.contains-percent-duration-watched');
	var select = getItems(watched, grid_mode);
	if(settings.hidewatched)
	    select.hide();
	else
	    select.show();
    }

    if(eval_all || eval_name == "hidestreams"){
	var unwatched = $('.yt-lockup-thumbnail:not(.contains-percent-duration-watched)');
	var select = getItems(unwatched, grid_mode).filter( function (index) {
	    var test = $(this).find('.yt-lockup-meta-info li:nth-child(2)').html();
	    return test !== undefined && test.length && test[0] == 'S';
	});

	if(settings.hidestreams)
	    select.hide();
	else
	    select.show();
    }
}

function get_unwatched(){
    var unwatched = $('.yt-lockup-thumbnail:not(.contains-percent-duration-watched)');
    var grid_mode = $('.yt-shelf-grid-item').length;
    var select = getItems(unwatched, grid_mode).filter( function (index) {
	var test = $(this).find('.yt-lockup-meta-info li:nth-child(2)').html();
	return test === undefined || !test.length || test[0] != 'S';
    });
    
    var links = [];
    $.each(select.find('.yt-uix-sessionlink.yt-ui-ellipsis'), function(){
	links.push(getUrlVars(this.href)['v']);
    });

    return links;
}


$( document ).ready(function() {
    
    chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
	    
	    if(request.settings !== undefined){
		var key = request.settings[0];
		var data = request.settings[1];
		settings[key] = data;

		eval_once([key]);
	    }else if(request.collect !== undefined){
		var links = get_unwatched();
		sendResponse({links: links});
	    }
	    
	});

    chrome.storage.sync.get("settings", function(items){
	settings = items.settings;
	eval_once();
    });
    
});
