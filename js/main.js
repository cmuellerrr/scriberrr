$(document).ready(function() {
    var playButton = $('#play-pause'),
        playTime = $('#time'),
        controller = audioController({
            oncanplay: function(event) {
                playButton.removeClass('disabled');
                playTime.removeClass('disabled');
            },

            onplaying: function(event) {
                playButton.addClass('fa-pause').removeClass('fa-play');
            },
                    
            onpause: function(event) {
                playButton.addClass('fa-play').removeClass('fa-pause');
            },

            ontimeupdate: function(event) {
                playTime.text(formatSeconds(this.currentTime));
                $('#progress').width(((this.currentTime / this.duration) * 100) + "%");
            }
        });

    $('#seek').on("mousedown", function(event) {
        var offX  = (event.offsetX || event.pageX - $(event.target).offset().left);
        controller.jumpToPercentage(offX / $(this).width());
    });

    playButton.on("click", function(event) {
        controller.togglePlay();
    });

    //init chooser
    $('#audioChooserBtn').click(function(event) {
        $('#audioChooser').click();
        return false;
    });
    //handle the loading of source material
    $('#audioChooser').change(function(event) {
        var URL = window.webkitURL || window.URL,
            url = URL.createObjectURL(this.files[0]);

        if (url) {
            controller.loadAudio(url);
            $('.tTitle').focus();
        }
        else {
            alert("Error loading audio file");
        }
    });

    //add handlers for controlling the audio
    $(window).on('keydown', function(event) {
        var key = event.keyCode || event.which;
        var keychar = String.fromCharCode(key);

        //not sure why keychar is always uppercase
        if (event.ctrlKey) {
            if (keychar == 'H') {
                controller.slowdown();
                return false;
            }
            else if (keychar == 'J') {
                controller.rewind();
                return false;
            }
            else if (keychar == 'K') {
                controller.forward();
                return false;
            }
            else if (keychar == 'L') {
                controller.speedup();
                return false;
            }
        }
        else if (key == 27) { //escape
            controller.togglePlay();
            return false;
        }
    });

    //add handlers for adding timestamps
    $('#text').on('keypress', function(event) {
        var body = this;

        //on enter
        if (event.keyCode == 13) {
            //if the section is empty, add ellipsis and set its timestamp to 0
            if (body.value.length === 0) {
                addTimestampAtCursor(0);
                body.value += '...';
            }

            addTimestampAtCursor(controller.getTimestamp());
            return false;
        }
        else if (event.charCode && body.value.length === 0) {
            addTimestampAtCursor(controller.getTimestamp());
        }
        else if (event.charCode) {
            resizeBody();
        }
    });

    
    var srcPosition = $('#source').position().top;

    $(window).scroll(function(event) {
        if($(window).scrollTop() >= srcPosition) {
            $('#source').addClass("fixed");
        } else {
            $('#source').removeClass("fixed");
        }
    });
    
});

/* Utilitiy Functions */

//pre = text before start
//post = text after end
//body = pre + stamp + post
var addTimestampAtCursor = function(time) {
    var node = $('#text')[0],
        text = node.value,
        startPos = node.selectionStart,
        endPos = node.selectionEnd,
        stamp = formatSecondsAsTimestamp(time) + ' ';

    if (text.length > 0) {
        stamp = '\n\n' + stamp;
    }

    if (node.selectionDirection === "backwards") {
        startPos = endPos;
        endPos = node.selectionStart;
    }

    node.value = text.substring(0, startPos) +
                 stamp +
                 text.substring(endPos, text.length);
    node.selectionStart = startPos + stamp.length;
    node.selectionEnd = startPos + stamp.length;

    resizeBody();
    window.scrollBy(0, 50);
};

//resize the body textarea based off of the content within it
//copy over the text to a hidden div so we can get its size
//then set the text area to that size
var resizeBody = function() {
    var body = $('#text'),
        hiddenBody = $('#hiddenText');

    hiddenBody.html(body.val().replace(/\n/g, '<br>'));
    body.css('height', hiddenBody.height());
};

//Format the given number as a timestamp [hh:mm:ss]
var formatSecondsAsTimestamp = function(secs) {
    return '[' + formatSeconds(secs) + ']';
};

// Format the given number of seconds as hh:mm:ss
var formatSeconds = function(secs) {
    var hr  = Math.floor(secs / 3600),
        min = Math.floor((secs - (hr * 3600))/60),
        sec = Math.floor(secs - (hr * 3600) -  (min * 60));

    if (hr < 10) {
        hr = "0" + hr;
    }
    if (min < 10) {
      min = "0" + min;
    }
    if (sec < 10) {
      sec  = "0" + sec;
    }

    return hr + ':' + min + ':' + sec;
};