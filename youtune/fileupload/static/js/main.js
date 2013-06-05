/*
 * jQuery File Upload Plugin JS Example 6.7
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global $, window, document */

$(function () {
    'use strict';

    // Initialize the jQuery File Upload widget:
    $('#fileupload').fileupload();

    // Enable iframe cross-domain access via redirect option:
    $('#fileupload').fileupload(
        'option',
        'redirect',
        window.location.href.replace(
            /\/[^\/]*$/,
            '/cors/result.html?%s'
        )
    );

    $('#fileupload')
        .bind('fileuploadadd', function(e, data) {
            var mp3test = /.+\.mp3$/i;
            if (mp3test.test(data.files[0].name))
            {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var scope = angular.element('#id_artist').scope();
                    var dv = new jDataView(this.result);
    
                    // "TAG" starts at byte -128 from EOF.
                    // See http://en.wikipedia.org/wiki/ID3
                    if (dv.getString(3, dv.byteLength - 128) === 'TAG') {
                        var info = {
                            title : dv.getString(30, dv.tell()).trim(),
                            artist : dv.getString(30, dv.tell()).trim(),
                            album : dv.getString(30, dv.tell()).trim(),
                            year : dv.getString(4, dv.tell()).trim()
                        };
    
                        $.ajax({
                            url : 'http://ws.audioscrobbler.com/2.0/',
                            data : {
                                method : 'artist.getinfo',
                                artist : info.artist,
                                api_key : '75b81d7dcc20ff4a64bfbd86300f14e2',
                                autocorrect : '1',
                                format : 'json'
                            }
                        })
    	                    .done(function(data) {
    	                        if (!data.error)
    	                        {
        	                    	var tags = [];
        	                    	$.each(data.artist.tags.tag, function (idx, val) {
        	                    		tags.push(val.name);
        	                    	});
        	                    	
        	                    	if (data.artist.image)
        	                    	    $('input#id_artist_img').val(data.artist.image[2]["#text"]);
        	                    	$('input#id_tags').val(tags.join(', '));
        	                    }
    	                    });
    	                    
                        $.ajax({
                            url : 'http://ws.audioscrobbler.com/2.0/',
                            data : {
                                method : 'track.getinfo',
                                track : info.title,
                                artist : info.artist,
                                api_key : '75b81d7dcc20ff4a64bfbd86300f14e2',
                                autocorrect : '1',
                                format : 'json'
                            }
                        })
    	                    .done(function(data) {
                                if (!data.error)
                                {
                                    if (data.track.name)
        	                    	   scope.title = data.track.name;
        	                    	if (data.track.artist)
        	                    	   scope.artist = data.track.artist.name;
        	                    	if (data.track.album)
        	                    	    $('input#id_album').val(data.track.album.title);
        	                    	if (data.track.wiki)
        	                    	    $('input#id_description').val(data.track.wiki.summary);
        	                    	scope.$apply();
        	                    }
    	                    });
                        scope.title = info.title;
                        scope.artist = info.artist;
                        $('input#id_album').val(info.album);
                        $('input#id_year').val(info.year);
                        scope.$apply();
                    }
                };
    
                reader.readAsArrayBuffer(data.files[0]);
            }
        }
    );
    
    // Load existing files:
    /*
    $('#fileupload').each(function () {
        var that = this;
        $.getJSON(this.action, function (result) {
            if (result && result.length) {
                $(that).fileupload('option', 'done')
                    .call(that, null, {result: result});
            }
        });
    });
    */
});
