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
            var reader = new FileReader();

            reader.onload = function(e) {
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
	                    	var tags = [];
	                    	$.each(data.artist.tags.tag, function (idx, val) {
	                    		tags.push(val.name);
	                    	});
	                    	
	                    	$('input[name="artist_image"]').val(data.artist.image[4]["#text"]);
	                    	$('input[name="tags"]').val(tags.join(','));
	                    });

                    $('input#id_title').val(info.title);
                    $('input#id_artist').val(info.artist);
                }
            };

            reader.readAsArrayBuffer(data.files[0]);
        }
    );
    
    // Load existing files:
    $('#fileupload').each(function () {
        var that = this;
        $.getJSON(this.action, function (result) {
            if (result && result.length) {
                $(that).fileupload('option', 'done')
                    .call(that, null, {result: result});
            }
        });
    });
});
