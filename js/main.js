// Set the language prefix used for label names
const LANG_PREFIX = "en_";

// Define URL path for assets
var BASE_URL = window.location.href;
if (!BASE_URL.includes("ks-web-client")) BASE_URL = "";
const ASSETS_PATH = BASE_URL + "assets/";

// Create Audio objects for BGM and SFX
const bgm_obj = new Audio();
const sfx_obj = new Audio();
bgm_obj.loop = true;

// Filenames of the common route, in order
const COMMON_ROUTE_SCRIPT_NAMES = ['script-a1-monday', 'script-a1-tuesday', 'script-a1-wednesday', 'script-a1-thursday', 'script-a1-friday', 'script-a1-saturday', 'script-a1-sunday'];

// Define the available positions for sprites
const avail_pos = ["center", "twoleft", "tworight"];

// const alpa_dict = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "f", 7: "g", 8: "h", 9: "i", 10: "j", };

const FADE_SPEED = 200;

var curr_line_no = -1;
var curr_script_name;
var curr_script_content_arr = [];

var awaiting_choice = 0;
var curr_bgm_name;

// Required because bg can be set from either scene or bgs
var current_bg_path;

// Stores every choice the user made
var choices_dict = {};

// var active_vfx_dict = {};
// var active_sprites_dict = {};
// var curr_sprite_state = {};

const route_dict = {
    "A1a": [["choiceA1", "m1"]],
    "A1b": [["choiceA1", "m2"]],

    "A2a": [["choiceA1", "m1"]],
    "A2b": [["choiceA1", "m2"]],

    "A2d": [["choiceA1", "m2"]],
    "A2e": [["choiceA1", "m1"]],

    "A3a": [["choiceA3", "m1"]],
    "A3b": [["choiceA3", "m2"]],
    "A3c": [["choiceA3", "m3"]],

    "A6a": [["choiceA6", "m1"]],
    "A6b": [["choiceA6", "m2"]],

    "A8a": [["choiceA8", "m1"]],
    "A8aa": [["choiceA8", "m1"], ["choiceA1", "m2"]],
    "A8ab": [["choiceA8", "m1"]],
    "A8b": [["choiceA8", "m2"]],
    "A8d": [["choiceA8", "m1"]],
    "A8e": [["choiceA8", "m2"]],

    "A9a": [["choiceA9", "m1"]],
    "A9b": [["choiceA9", "m2"]],

};

function set_bg_force(bg_path) {
    $('#bg').css('background-image', 'url(' + bg_path + ')');
}

function set_bg(bg_name) {
    let bg_filename = scene_mappings["bg " + bg_name];
    // If cannot find bg in scenes, try using bgs/ dir
    if (!bg_filename) {
        bg_filename = "bgs/" + bg_name + ".jpg";
        $('#bg').css('background-size', 'contain');
    } else {
        clear_sprites();
        $('#bg').css('background-size', 'contain');
    }

    bg_filename = strip_quotes(bg_filename);
    let bg_path = ASSETS_PATH + bg_filename;

    $('#bg').css('background-image', 'url(' + bg_path + ')');
    // DONT CLEAR SPRITES HERE. 
    // clear_sprites();
    console.log("BG", bg_path)
    // can clear, but race condition if fade speed >0?
    clear_vfx();
    current_bg_path = bg_path;
}

function prev_line() {
    if (awaiting_choice) {
        $("#choices-div").empty();
        curr_line_no = awaiting_choice;
        awaiting_choice = 0;
    }
    curr_line_no -= 1;
    parse_line(back = true);
}

function next_line() {
    // Prevent advancing on choices
    if (awaiting_choice) return;
    curr_line_no += 1;
    parse_line();
}


function get_scene_filename(scene_name) {
    scene_filename_full = scene_mappings[scene_name];
    if (!scene_filename_full) return;
    scene_filename_matches = scene_filename_full.match(/"((.+)\.(jpg|png))"/);
    if (!scene_filename_matches) return;
    scene_filename = scene_filename_matches[1];
    return scene_filename;
}

function set_scene(scene_name, vfx = false) {
    scene_filename = get_scene_filename(scene_name);
    let scene_path = ASSETS_PATH + scene_filename;
    // use for scene black, otherwise need to add with hands_in
    clear_sprites();
    // if (vfx) {
    //     console.log("SCENE VFX", scene_path)
    //     // dangerous?? fixes lilly room..
    //     clear_sprites();
    //     // let vfx_var = $('#vfx').css('background-image', 'url(' + scene_path + ')');
    //     let char_name = scene_name.split(" ")[0];
    //     let vfx_var = active_vfx_dict[char_name];
    //     if (!vfx_var) {
    //         vfx_var = $("<div class='vfx' id='" + char_name + "'></div>");
    //         $("#bg").append(vfx_var);
    //     }
    //     $(vfx_var).css('background-image', 'url(' + scene_path + ')');
    //     // might need to maintain this dict for saving/loading
    //     active_vfx_dict[char_name] = vfx_var;
    //     console.log(vfx_var)
    //     $('.vfx').fadeInFixed();
    // }
    // else {
    console.log("SCENE", scene_path)
    $('#bg').css('background-image', 'url(' + scene_path + ')');
    current_bg_path = scene_path;
    // }
}

function set_bgm(bgm_name = null) {
    // Pause current bgm if none speficied
    if (!bgm_name) {
        bgm_obj.pause();
        curr_bgm_name = null;
    }
    else {
        bgm_filename = bgm_mappings[bgm_name];
        bgm_obj.src = ASSETS_PATH + "bgm/" + bgm_filename + ".ogg";
        setTimeout(function () {
            bgm_obj.play();
        }, 150);
        curr_bgm_name = bgm_name;
    }
}

// sprite_pos_arr = ["sprite_fullname", "pos"]
// support more fixed pos in future, dynamic pos not supported
function set_sprite(sprite_fullname, pos, type = "sprite") {
    // Ignore unsupported sunset effect
    if (sprite_fullname.endsWith("_ss")) sprite_fullname = sprite_fullname.slice(0, -3);

    let sprite_filename;
    if (type == "vfx") sprite_filename = get_scene_filename(sprite_fullname);
    else sprite_filename = sprite_mappings[sprite_fullname];
    if (!sprite_filename) return;

    sprite_filename = strip_quotes(sprite_filename);
    console.log(sprite_fullname, pos, sprite_filename)

    let sprite_char_name = sprite_fullname.split(" ")[0];
    let suffixed_char_name = sprite_char_name.split("_")[1];
    if (suffixed_char_name) sprite_char_name = suffixed_char_name;
    // if (type == "vfx") sprite_char_name = sprite_fullname;
    // else sprite_char_name = sprite_fullname.split(" ")[0];

    let target_sprite = $("#bg").find(`.${sprite_char_name}`)[0];
    let old_pos = $(target_sprite).data("pos");

    // Use old pos if new pos is invalid or none, otherwise default to center
    if (!avail_pos.includes(pos)) {
        if (old_pos) pos = old_pos;
        else pos = "center";
    }

    if (!target_sprite)
        target_sprite = $(`<div class='${type} pos-${pos} ${sprite_char_name}' data-pos='${pos}'></div>`)
            .appendTo("#bg");

    // Adjust size for large close sprites
    if (sprite_filename.includes("/close/")) $(target_sprite).css("background-size", "cover");
    else $(target_sprite).css("background-size", "contain");

    $(target_sprite)
        .css("background-image", "url(" + ASSETS_PATH + sprite_filename + ")")
        .data("pos", pos)
        .removeClass()
        .addClass(`${type} pos-${pos} ${sprite_char_name}`);

    $(target_sprite).fadeInFixed();
    console.log("position at", pos, sprite_char_name);


    // if (!avail_pos.includes(pos)) {
    //     if (existing_sprite_pos) pos = existing_sprite_pos;
    //     else pos = "center";
    // }

    // // keep character name and store in active_sprites_dict for sprite hiding later
    // let sprite_char_name = sprite_fullname.split(" ")[0];
    // let sprite_var = active_sprites_dict[sprite_char_name];
    // let existing_sprite_pos = $(sprite_var).data("pos");


    // // character sprite already on screen, update

    // let existing_sprite_moved = !(existing_sprite_pos == pos);
    // // console.log("pos", pos)
    // // console.log("existing_sprite_moved", existing_sprite_moved)
    // // Hide old sprite position 
    // if (existing_sprite_moved) $(sprite_var).hide();
    // if (!sprite_var || existing_sprite_moved) sprite_var = $(`#sprite-${pos}`);




    // active_sprites_dict[sprite_char_name] = sprite_var;
    // $(sprite_var).css("background-image", "url(" + ASSETS_PATH + sprite_filename + ")");
    // $(sprite_var).fadeInFixed();
    // curr_sprite_state[pos] = [[sprite_fullname, pos], sprite_char_name];
}

jQuery.fn.fadeOutAndRemove = function (speed = FADE_SPEED) {
    $(this).fadeOut(speed, function () {
        $(this).remove();
    })
}

jQuery.fn.fadeInFixed = function (speed = FADE_SPEED) {
    $(this).fadeIn(speed);
}

function hide_sprite(sprite_char_name) {
    // let sprite_var = active_sprites_dict[sprite_char_name];
    // if (sprite_var) {
    //     $(sprite_var).fadeOut();
    //     // $(sprite_var).hide();
    //     for (var key in curr_sprite_state) {
    //         if (curr_sprite_state[key] && curr_sprite_state[key][1] == sprite_char_name) curr_sprite_state[key] = null;
    //     }
    // } else 
    // let vfx_var = active_vfx_dict[sprite_char_name];
    // if (vfx_var) {
    // $(vfx_var).fadeOut();
    // removal will be periodic using clear_vfx
    // $(vfx_var).remove();
    // }
    let old_sprite = $("#bg").find(`.${sprite_char_name}`);
    $(old_sprite).fadeOutAndRemove();
}

function clear_vfx() {
    console.log("CLEARING ALL VFX")
    let vfx = $("#bg").find(".vfx");
    $(vfx).each(function () {
        $(this).fadeOutAndRemove(0);
    })
    // for (var key in active_vfx_dict) {
    //     let vfx_var = active_vfx_dict[key];
    //     $(vfx_var).remove();
    // }
    // active_vfx_dict = {};
    // should use .vfx class to clear? 
    // need to clear vfx state (for save feature)
}

function clear_sprites() {
    console.log("CLEARING ALL SPRITES")
    let sprites = $("#bg").find(".sprite");
    $(sprites).each(function () {
        $(this).fadeOutAndRemove(0);
    })
    // for (var key in active_sprites_dict) {
    //     let sprite_var = active_sprites_dict[key];
    //     $(sprite_var).fadeOut();
    //     // $(sprite_var).hide();
    // }
    // curr_sprite_state = {};
}

function play_sfx(sfx_name) {
    let sfx_filename = sfx_mappings[sfx_name];
    sfx_obj.src = ASSETS_PATH + "sfx/" + sfx_filename + ".ogg";
    // Avoid the Promise Error
    setTimeout(function () {
        sfx_obj.play();
    }, 150);
}

// Load a file from the server dir
function load_file(file_path) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", file_path, false);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
        result = xmlhttp.responseText;
    }
    return result;
}

function strip_quotes(string) {
    if (string.startsWith('"')) string = string.slice(1);
    if (string.endsWith('"')) string = string.slice(0, -1);
    return string;
}

function get_curr_line(offset = 0) {
    return curr_script_content_arr[curr_line_no + offset];
}

function show_choice(choice_label) {
    console.log("CHOICE", choice_label)
    $("#choices-div").hide();
    // Store line number to jump back when going to prev line
    awaiting_choice = curr_line_no;

    // Verify that next line is menu
    curr_line_no += 1;
    if (!(get_curr_line() == "menu:")) return;
    // Verify that next line is menueffect
    curr_line_no += 1;
    if (!(get_curr_line() == "with menueffect")) return;

    // Display the dialog that comes with choice
    curr_line_no += 1;
    show_dialog(get_curr_line());

    // Retrieve choice options until it reaches the next label
    curr_line_no += 1;
    while (!get_curr_line().startsWith("label ")) {
        // Displayable text for each choice
        let choice_text = strip_quotes(rstrip_colon(get_curr_line()));
        curr_line_no += 1;
        // Return value of choice
        let choice_val = get_curr_line().split(" ")[1];
        // let choice_no = parseInt(ret_val.replace("m", ""));
        // let jump_label = LANG_PREFIX + choice_label + alpa_dict[choice_no];
        // let choice_val = alpa_dict[choice_no];
        // choice_mappings[choice_text] = jump_label;
        // if (!choices_dict[choice_label]) choices_dict[choice_label] = {};
        // choices_dict[choice_label][choice_val] = false;
        $("<div data-label='" + choice_label + "'  data-val='" + choice_val + "'>" + choice_text + "</div>")
            .addClass("choice-div")
            .css("background-image", "url(" + ASSETS_PATH + "ui/bg-choice.png)")
            .appendTo("#choices-div");
        curr_line_no += 1;
    }
    $("#choices-div").fadeInFixed();
}

function special_func(func_raw) {
    const RE_WRITTEN_NOTE = /written_note\((.?)(?<text>".+?").*?(text_args=(?<text_args>.+))?\)/gm;
    let written_note_content = RE_WRITTEN_NOTE.exec(func_raw);
    if (written_note_content) {
        text = written_note_content.groups.text;
        text_args = written_note_content.groups.text_args;
        if (text_args) {
            // format text
        }
        text = text.replace(/(\\r\\n|\\n|\\r)/gm, " ");
        play_sfx("paper");
        show_dialog(text);
        return true;
    }
}

// function parse_label(curr_line) {
//     let raw_label = curr_line.split(" ")[1];
//     if (raw_label.startsWith(LANG_PREFIX)) raw_label = raw_label.slice(LANG_PREFIX.length);
//     if (raw_label.endsWith(":")) raw_label = raw_label.slice(0, -1);
//     const RE_LABEL = /(.+?\d+)(.*)/gm;
//     let raw_label_reg = RE_LABEL.exec(raw_label);
//     let label_main = raw_label_reg[1];
//     let label_cond = raw_label_reg[2];
//     return [raw_label, label_main, label_cond];
// }

function rstrip_colon(string) {
    if (string.endsWith(":")) string = string.slice(0, -1);
    return string;
}

// Skip until 1 line before next label (which will be handled in a new parse_line cycle)
function skip_label() {
    console.log("SKIPPING LABEL");
    let found_label = false;
    while (!found_label) {
        curr_line_no += 1;
        console.log("SKIPPING", curr_line_no, get_curr_line());
        found_label = get_curr_line(1).startsWith("label ");
    }
}

// Parse the current line
function parse_line(back = false) {
    if (curr_line_no < 0) {
        curr_line_no = 0;
        parse_line();
        return;
    }
    // Go to next common route script when reaching the end
    if (curr_line_no == curr_script_content_arr.length) {
        // console.log(curr_script_name)
        // console.log(COMMON_ROUTE_SCRIPT_NAMES.indexOf(curr_script_name))
        let curr_common_route_script_no = COMMON_ROUTE_SCRIPT_NAMES.indexOf(curr_script_name) + 1;
        // console.log(curr_common_route_script_no)
        load_script(COMMON_ROUTE_SCRIPT_NAMES[curr_common_route_script_no]);
        curr_line_no = 0;
    }

    let curr_line = get_curr_line();
    console.log(curr_line_no, curr_line)
    if (curr_line.slice(-1) == '"') {
        // manual lines (dialog)
        show_dialog(curr_line)
    }
    else {
        // Perform background actions and go to next line
        if (curr_line.startsWith("window hide")) {
            // $(".vfx").hide()
            // $(".vfx").stop(true, true)
            // might change to .remove?
        } else if (curr_line.startsWith("window show")) {
            $(".vfx").fadeOutAndRemove();
            // $(".vfx").stop(true, true)
        } else if (curr_line.startsWith("with locationchange")) {
            // there might be a better place to clear sprites than here.
            // clearing sprites here wipes mutou before entering class.
            if (!get_curr_line(-1).startsWith("show ")) clear_sprites();
        } else if (curr_line.startsWith("with shorttimeskip")) {
            // cant clear here????!
            if (!get_curr_line(-1).startsWith("show ")) clear_sprites();
        } else if (curr_line.startsWith("with locationskip")) {
            // this fixes a few occurrences. dont clear if prev line was show.
            if (!get_curr_line(-1).startsWith("show ")) clear_sprites();
        }
        else if (curr_line.startsWith("with Pause(")) {
            // let pause_dur = parseFloat(curr_line.slice(-4, -1));
            // await new Promise(r => setTimeout(r, pause_dur * 1000));
        } else if (curr_line.startsWith("with charachange")) {
            // await new Promise(r => setTimeout(r, 100));
        }
        else if (curr_line.startsWith("with Dissolve")) {
            // $(".vfx").fadeOut();
            // screws up lilly room
        } else if (curr_line.startsWith("scene bg ")) {
            // clear_vfx();
            set_bg(rstrip_colon(curr_line.split(" ")[2]));
        } else if (curr_line.startsWith("show bg ")) {
            set_bg(rstrip_colon(curr_line.split(" ")[2]));
        } else if (curr_line.startsWith("label ") && !back) {
            // Handle labels
            let label_content = rstrip_colon(curr_line).split(" ")[1].slice(LANG_PREFIX.length);
            console.log("LABEL", label_content);
            // Handle choice label
            if (label_content.startsWith("choice")) {
                show_choice(label_content);
                return;
            }
            let required_choice_arr = route_dict[label_content];

            // Label with choice requirement
            if (required_choice_arr) {
                for (let arr of required_choice_arr) {
                    let [required_label, required_val] = arr;
                    let chosen_val = choices_dict[required_label]
                    if (chosen_val != required_val) {
                        // Requirement failed, skip this label
                        skip_label();
                        break;
                    }
                }
            }
            //     required_choice_arr.forEach(arr => {
            //         let [required_label, required_val] = arr;
            //         let chosen_val = choices_dict[required_label]
            //         if (!chosen_val || (chosen_val != required_val)) {
            //             // Requirement failed, skip this label
            //             skip_label();
            //         }
            //     });
            // }
            // By default, labels not specified in route_dict will be shown

            // CANNOT CLEAR HERE ALSO
            // clear_sprites();
        } else if (curr_line.startsWith("$ ")) {
            // Wait for click if special func valid
            let ret = special_func(curr_line);
            if (ret) return;
        } else if (curr_line.startsWith("stop music")) {
            set_bgm();
        } else if (curr_line.startsWith("scene ")) {
            set_scene(curr_line.slice(6));
        }
        else if (curr_line.startsWith("hide ")) {
            let sprite_char_name = rstrip_colon(curr_line.slice(5));
            hide_sprite(sprite_char_name);
        }
        else if (curr_line.startsWith("show ")) {
            let resource_name = rstrip_colon(curr_line.slice(5));

            // VFX from scene_mappings are also displayed using the show keyword
            if (resource_name in scene_mappings) {
                if (resource_name.startsWith("ev ")) $("#bg").css("background-image", "");
                set_sprite(resource_name, pos = "center", type = "vfx");
            }

            // For showing sprites
            else {
                let [sprite_fullname, pos] = resource_name.split(" at ");
                let next_line = get_curr_line(1);
                // Some positions are in the next line
                // If pos is not specified on current line and next line has valid pos, use it
                if (!pos && avail_pos.includes(next_line)) pos = next_line;
                set_sprite(rstrip_colon(sprite_fullname), pos)
            }
        }
        else if (curr_line.startsWith("play music music_")) {
            set_bgm(curr_line.split(" ")[2].slice(6));
        }
        else if (curr_line.startsWith("play sound sfx_")) {
            play_sfx(curr_line.split(" ")[2].slice(4));
        }
        if (back) curr_line_no -= 1;
        else curr_line_no += 1;

        let parse_ret = parse_line(back);
        if (!parse_ret) return;
    }
}

function show_dialog(curr_line) {
    // $("#dialog-box").show();
    let monologue;
    let line_splitted = curr_line.split(" ");
    let char_abbr = line_splitted[0];
    let mapped_name = name_mappings[char_abbr];

    let name_color = name_color_mappings[char_abbr];
    if (!name_color) name_color = "#FFFFFF";
    $("#heading-div").css("color", name_color);

    if (mapped_name !== undefined) {
        // Names using variables eg. hi
        $("#heading-div").text(mapped_name);
        line_splitted.shift();
        main_text = line_splitted.join(" ");
    } else if (char_abbr[0] == '"' && char_abbr.at(-1) == '"' && line_splitted.length > 1) {
        // hardcoded names, not a variable
        $("#heading-div").text(strip_quotes(char_abbr));
        line_splitted.shift();
        main_text = line_splitted.join(" ");
    }
    else {
        $("#heading-div").text("");
        monologue = true;
        main_text = curr_line;
    }
    // Remove NVL fullscreen text formatting newlines
    main_text = main_text.replace(/(\\r\\n|\\n|\\r)/gm, "");
    // Remove text effects (mi_shi "It's nice to meet you, too!{w=0.5} But~!")
    main_text = main_text.replace(/{(.*?)}/gm, "");
    // Remove quotes for monologues
    if (monologue) main_text = strip_quotes(main_text);
    $("#text-div").text(main_text);
}

function load_script(script_name) {
    let script_path = ASSETS_PATH + "script/" + script_name + ".rpy";
    let splitted = load_file(script_path).split(/\r?\n/);
    // Remove empty lines and strip whitespaces from all lines
    splitted = splitted.filter(n => n);
    curr_script_content_arr = splitted.map(element => {
        return element.trim();
    });
    curr_script_name = script_name;
}

function quick_save() {
    let body_content = $("#bg")[0].outerHTML;
    let save_data = {
        curr_script_name: curr_script_name,
        curr_line_no: curr_line_no,
        curr_bgm_name: curr_bgm_name,
        awaiting_choice: awaiting_choice,
        choices_dict: choices_dict,
        body_content: body_content
    }
    Cookies.set("save_data", JSON.stringify(save_data), { expires: 365 });
    console.log("SAVE", save_data);
}

function quick_load() {
    let save_data_raw = Cookies.get("save_data");
    if (!save_data_raw) {
        alert("No save data.");
        return;
    }

    $("#choices-div").empty();
    let save_data = JSON.parse(save_data_raw);

    awaiting_choice = save_data.awaiting_choice;
    curr_line_no = save_data.curr_line_no;
    choices_dict = save_data.choices_dict;

    load_script(save_data.curr_script_name);
    set_bgm(save_data.curr_bgm_name);
    $("#bg").replaceWith(save_data.body_content)

    set_choice_listener()

    // if (awaiting_choice) curr_line_no = awaiting_choice;
    // current_bg_path = save_data.current_bg_path;
    // set_bg_force(current_bg_path);
    // clear_sprites();
    // clear_vfx();
    // console.log("LOAD", curr_script_name, curr_line_no, save_data.curr_sprite_state);
    // for (var key in save_data.curr_sprite_state) {
    //     // console.log(key)
    //     // console.log(save_data.curr_sprite_state[key])
    //     if (save_data.curr_sprite_state[key]) set_sprite(save_data.curr_sprite_state[key][0]);
    // }
    // curr_sprite_state = save_data.curr_sprite_state;
    // parse_line();
}

// Choice selection click listener
function set_choice_listener() {
    $('#choices-div').on('click', '.choice-div', function (e) {
        let choice_label = $(this).data("label");
        let choice_val = $(this).data("val");
        choices_dict[choice_label] = choice_val;
        awaiting_choice = 0;
        $("#choices-div").empty();
        parse_line();
    });
}

// Hold Ctrl to skip
$(document).keydown(function (event) {
    if (event.ctrlKey && curr_line_no > -1) {
        next_line();
    } else if (event.key == "s") {
        quick_save();
    } else if (event.key == "l") {
        quick_load();
    }
});

// Click bg to go to next line
$(document).on('click', '#bg', function (e) {
    if (e.target == $(".choice-div")[0]) return;
    next_line();
});

// Scroll up/down to go back/forward
$(window).bind('mousewheel', function (event) {
    if (curr_line_no < 0) return;
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

    // Load initial script and create array
    load_script(COMMON_ROUTE_SCRIPT_NAMES[0]);

    // Cache sprites
    for (var key in sprite_mappings) {
        sprite_filename = sprite_mappings[key];
        $("#cache").css("background-image", "url(" + ASSETS_PATH + sprite_filename + ")");
        $("#cache").remove();
    }
    set_choice_listener()
    // $.get('/get_init', {}, function (data) {
    //     name_mappings = data.name_mappings;

    //     $("#back-btn").click(prev_line);
    //     $("#fwd-btn").click(next_line);
    // });
});
