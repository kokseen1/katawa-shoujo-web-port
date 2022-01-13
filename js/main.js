var BASE_URL = window.location.href;
if (!BASE_URL.includes("ks-web-client")) BASE_URL = "";
const ASSETS_PATH = BASE_URL + "assets/";

var curr_line_no = -1;
var curr_script_name = ASSETS_PATH + "script/script-a1-monday.rpy";
var script_content;
var name_mappings;

const bgm_obj = new Audio();
bgm_obj.loop = true;
const sfx_obj = new Audio();
var sprite_dict = {};

function set_bg(bg_name) {
    let bg_path = ASSETS_PATH + "bgs/" + bg_name;
    $('body').css('background-image', 'url(' + bg_path + ')');
}

function prev_line() {
    if (curr_line_no < 0) return;
    curr_line_no -= 1;
    parse_line(back = true);
}

function next_line() {
    curr_line_no += 1;
    parse_line();
}

function set_bgm(bgm_name = null) {
    if (!bgm_name) {
        bgm_obj.pause();
    } else {
        bgm_obj.src = `/bgm/${bgm_name}`;
        bgm_obj.play();
    }
}

function set_sprite(sprite_arr) {
    // support more fixed pos in future, dynamic pos not supported
    const avail_pos = ["conter", "twoleft", "tworight"]
    let short = sprite_arr[0];
    if (short.endsWith(":")) short = short.slice(0, -1);
    let sprite_name = short.split(" ")[0];
    let pos = "center";
    if (sprite_arr.length > 1 && avail_pos.includes(sprite_arr[1])) {
        // position specified
        pos = sprite_arr[1];
    } else {
        let sprite_var = sprite_dict[sprite_name];
        // sprite already on screen, update
        if (sprite_var) {
            $(sprite_var).css("background-image", `url("/sprites/${short}")`);
            $(sprite_var).show();
            return;
        }
    }
    let sprite_var = $(`#sprite-${pos}`).css("background-image", `url("/sprites/${short}")`);
    $(sprite_var).show();
    sprite_dict[sprite_name] = sprite_var;
}

function hide_sprite(sprite_name) {
    let sprite_var = sprite_dict[sprite_name];
    $(sprite_var).hide();
}

function clear_sprites() {
    let sprite_vars = $.map(sprite_dict, function (value, key) { return value });
    sprite_vars.forEach(sprite_var => {
        $(sprite_var).hide();
    });
}


function play_sfx(sfx_name) {
    sfx_obj.src = ASSETS_PATH + "sfx/" + sfx_name;
    sfx_obj.play();
}

function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
        result = xmlhttp.responseText;
    }
    return result;
}

// Parse the current line
function parse_line(back = false) {
    console.log(loadFile(curr_script_name));
    play_sfx("alarm.ogg");
    let curr_line = curr_script[curr_line_no];
    console.log(curr_line)
    if (curr_line.slice(-1) == '"') {
        // manual lines (dialog)
        show_dialog(curr_line)
    }
    else {
        // auto next line (sounds, bg etc)
        if (curr_line.startsWith("scene bg ")) {
            set_bg(curr_line.split(" ")[2]);
        } else if (curr_line.startsWith("label ")) {
            // new label
            clear_sprites();
        } else if (curr_line.startsWith("stop music")) {
            set_bgm();
        } else if (curr_line.startsWith("scene ")) {
            set_img(curr_line.slice(6));
        }
        else if (curr_line.startsWith("hide ")) {
            hide_sprite(curr_line.slice(5));
        }
        else if (curr_line.startsWith("show ")) {
            set_sprite(curr_line.slice(5).split(" at "));
        }
        else if (curr_line.startsWith("play music music_")) {
            set_bgm(curr_line.split(" ")[2].slice(6));
        }
        else if (curr_line.startsWith("play sound sfx_")) {
            play_sfx(curr_line.split(" ")[2].slice(4));
        }
        if (back) curr_line_no -= 1;
        else curr_line_no += 1;
        parse_line(back);
    }
}

function show_dialog(curr_line) {
    let line_splitted = curr_line.split(" ");
    let short = line_splitted[0];
    let mapped_name = name_mappings[short];
    if (mapped_name !== undefined) {
        $("#heading-div").text(mapped_name);
        line_splitted.shift();
        main_text = line_splitted.join(" ");
    } else if (short[0] == '"' && short.at(-1) == '"' && line_splitted.length > 1) {
        $("#heading-div").text(short.slice(1, -1));
        line_splitted.shift();
        main_text = line_splitted.join(" ");
    }
    else {
        $("#heading-div").text("");
        main_text = curr_line;
    }
    main_text = main_text.replace(/(\\r\\n|\\n|\\r)/gm, "");
    main_text = main_text.replace(/{(.*?)}/gm, "");
    $("#text-div").text(main_text.slice(1, -1));
}

// Hold Ctrl to skip
$(document).keydown(function (event) {
    if (!event.ctrlKey) return;
    event.preventDefault();
    next_line();
});

// Click to go to next line
$(document).click(function (e) {
    if ($(e.target).closest(".btn").length > 0) {
        return false;
    }
    next_line();
});

// Scroll up/down to go back/forward
$(window).bind('mousewheel', function (event) {
    if (event.originalEvent.wheelDelta >= 0) {
        prev_line();
    } else {
        next_line();
    }
});

$(document).ready(function () {
    // Initialize assets with dynamic URL that cannot be statically set in CSS.
    $('#dialog-box').css('background-image', 'url(' + ASSETS_PATH + 'ui/bg-say.png' + ')');
    $('#bg').css('background-image', 'url(' + ASSETS_PATH + 'ui/main/bg-main.png' + ')');

    // $.get('/get_script', {}, function (data) {
    //     curr_script = data;
    // });

    // $.get('/get_init', {}, function (data) {
    //     name_mappings = data.name_mappings;

    //     $("#back-btn").click(prev_line);
    //     $("#fwd-btn").click(next_line);
    // });

});