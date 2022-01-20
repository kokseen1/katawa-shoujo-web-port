// Set the language prefix used for label names
const LANG_PREFIX = "en_";

// Detect path for assets based on URL
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
const avail_pos = ["center", "left", "right", "twoleft", "tworight"];

// For jQuery fadeIn and fadeOut functions. Might cause race conditions
const FADE_SPEED = 0;

// Variables for parsing script
var curr_line_no = -1;
var curr_script_name;
var curr_script_content_arr = [];

// Prevents skipping beyond unmade choices
var awaiting_choice = 0;

// Stores every choice the user made
var choices_dict = {};

// Variable to store the line no. to return to after a jump
var ret_loc = 0;

// Stores affection scores/flags triggered by choices
var affection_scores = {};

// Stacks for log and saving/loading
var bg_stack = [];
var sprites_stack = [];
var bgm_stack = [];


function calc_score() {
    // Set all scores to 0
    affection_scores = {
        "shizune": 0,
        "hanako": 0,
        "lilly": 0,
        "rin": 0,
        "emi": 0,
        "training": 0,
    };

    for (var choice_name in choices_dict) {
        let choice = choices_dict[choice_name];
        if (affection_dict[choice_name] && affection_dict[choice_name][choice]) {
            affection_dict[choice_name][choice].forEach(e => {
                affection_scores[e] += 1;
            });
        }
    }
    $("#dbg").text(JSON.stringify(affection_scores));
}

function set_bg_force(bg_path) {
    console.log("BG", bg_path);
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
    console.log("BG", bg_path);
    $('#bg').css('background-image', 'url(' + bg_path + ')');

    // Save to stack
    bg_stack.push(bg_path);

    // DONT CLEAR SPRITES HERE. 

    // can clear, but race condition if fade speed >0?
    clear_vfx();
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
    console.log("SCENE", scene_path);
    // use for scene black, otherwise need to add with hands_in
    clear_sprites();

    $('#bg').css('background-image', 'url(' + scene_path + ')');
    bg_stack.push(scene_path);
}

function set_bgm(bgm_name = null, restore = false) {
    // Pause current bgm if none speficied
    if (!bgm_name) bgm_obj.pause();
    else {
        bgm_filename = bgm_mappings[bgm_name];
        bgm_obj.src = ASSETS_PATH + "bgm/" + bgm_filename + ".ogg";
        setTimeout(function () {
            bgm_obj.play();
        }, 150);
    }
    // Do not add to stack when restoring or loading a save
    if (!restore) bgm_stack.push(bgm_name);
}

function save_sprites() {
    let sprites_content = $("#sprites")[0].outerHTML;
    sprites_stack.push(sprites_content);
}

// sprite_pos_arr = ["sprite_fullname", "pos"]
// support more fixed pos in future, dynamic pos not supported
function set_sprite(sprite_fullname, pos, type = "sprite") {
    if (pos) pos = pos.split(" ")[0];
    // Ignore unsupported sunset effect
    if (sprite_fullname.endsWith("_ss")) sprite_fullname = sprite_fullname.slice(0, -3);

    let sprite_filename;
    if (type == "vfx") sprite_filename = get_scene_filename(sprite_fullname);
    else sprite_filename = sprite_mappings[sprite_fullname];
    if (!sprite_filename) return;

    sprite_filename = strip_quotes(sprite_filename);

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
            .appendTo("#sprites");

    // Adjust size for large close sprites
    if (sprite_filename.includes("/close/")) $(target_sprite).css("background-size", "cover");
    else $(target_sprite).css("background-size", "contain");

    $(target_sprite)
        .css("background-image", "url(" + ASSETS_PATH + sprite_filename + ")")
        .data("pos", pos)
        .removeClass()
        .addClass(`${type} pos-${pos} ${sprite_char_name}`);
    $(target_sprite).fadeInFixed();
    console.log("POSITION", pos, sprite_char_name, sprite_filename, sprite_fullname);
}

jQuery.fn.fadeOutAndRemove = function (speed = FADE_SPEED) {
    $(this).fadeOut(speed, function () {
        $(this).remove();
    })
}

jQuery.fn.fadeInFixed = function (speed = FADE_SPEED) {
    $(this).fadeIn(speed);
}

function hide_sprite(sprite_char_name_full) {
    sprite_char_name = sprite_char_name_full.split(" ")[0];
    let old_sprite = $("#bg").find(`.${sprite_char_name}`);
    console.log("REMOVE", sprite_char_name, sprite_char_name_full);
    $(old_sprite).fadeOutAndRemove();
}

function clear_vfx() {
    console.log("CLEARING ALL VFX");
    let vfx = $("#bg").find(".vfx");
    $(vfx).each(function () {
        $(this).fadeOutAndRemove(0);
    });
}

function clear_sprites() {
    console.log("CLEARING ALL SPRITES");
    let sprites = $("#bg").find(".sprite");
    $(sprites).each(function () {
        $(this).fadeOutAndRemove();
    });
}

function play_sfx(sfx_name) {
    let sfx_filename = sfx_mappings[sfx_name];
    sfx_obj.src = ASSETS_PATH + "sfx/" + sfx_filename + ".ogg";
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
    if (xmlhttp.status == 200) result = xmlhttp.responseText;
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
    console.log("CHOICE", choice_label);
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
        $("<div data-label='" + choice_label + "'  data-val='" + choice_val + "'>" + choice_text + "</div>")
            .addClass("choice-div")
            .css("background-image", "url(" + ASSETS_PATH + "ui/bg-choice.png)")
            .appendTo("#choices-div");
        curr_line_no += 1;
    }
    $("#choices-div").fadeInFixed();
}

// Handle lines with $ sign
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


function rstrip_colon(string) {
    if (string.endsWith(":")) string = string.slice(0, -1);
    return string;
}

function restore_sprites() {
    console.log("RESTORING SPRITES")
    sprites_stack.pop();
    let sprites_content = sprites_stack.at(-1);
    if (sprites_content) {
        $("#sprites").replaceWith(sprites_content);
        $("#sprites").children().css({ 'opacity': 1 });
    }
}

// Skip until 1 line before next label (which will be handled in a new parse_line cycle)
function skip_label() {
    let found_label = false;
    while (!found_label) {
        curr_line_no += 1;
        console.log("SKIPPING", curr_line_no, get_curr_line());
        found_label = get_curr_line(1).startsWith("label ");
    }
}

const isTrue = (element) => element;

function restore_bg() {
    bg_stack.pop();
    set_bg_force(bg_stack.at(-1));
}

function restore_bgm() {
    bgm_stack.pop();
    set_bgm(bgm_stack.at(-1), restore = true);
}

function clear_sprites_safe() {
    if (!get_curr_line(-1).startsWith("show ")) clear_sprites();
}

function eval_choices(arr) {
    let bool_arr = [];
    let OR_mode;
    console.log("REQUIREMENTS", arr);
    // OR only if specified, otherwise AND
    if (arr.at(-1) == "||") {
        OR_mode = true;
        arr = arr.slice(0, -1);
    }
    arr.forEach(e => {
        // Recursively evaluate for nested arrays
        let match;
        if (Array.isArray(e[0])) match = eval_choices(e);
        else {
            let chara_score = affection_scores[e[0]];
            if (chara_score != undefined) {
                // Check for lt only if specified, otherwise gt
                if (e.at(-1) == "lt") {
                    match = chara_score < e[1];
                    console.log(`${e[0]} < ${e[1]}`, match)
                }
                else match = chara_score > e[1];
            }
            else match = choices_dict[e[0]] == e[1];
        }
        bool_arr.push(match);
    });
    // Evaluate depending on AND or OR
    if (OR_mode) return bool_arr.some(isTrue);
    else return bool_arr.every(isTrue);
}

// Parse the current line
function parse_line(back = false) {

    // Prevent going before line 0
    if (curr_line_no < 0) {
        curr_line_no = 0;
        parse_line();
        return;
    }

    // Go to next common route script when reaching the end
    if (curr_line_no == curr_script_content_arr.length) {
        let curr_common_route_script_no = COMMON_ROUTE_SCRIPT_NAMES.indexOf(curr_script_name) + 1;
        // Need to implement branching routes
        if (curr_common_route_script_no > COMMON_ROUTE_SCRIPT_NAMES.length - 1) return;
        load_script(COMMON_ROUTE_SCRIPT_NAMES[curr_common_route_script_no]);
        curr_line_no = 0;
    }

    let curr_line = get_curr_line();
    console.log(curr_line_no, curr_line);

    // Display lines with dialog
    if (curr_line.endsWith('"')) {
        show_dialog(curr_line);
        return;
    }

    // Play SFX
    if (curr_line.startsWith("play sound sfx_")) play_sfx(curr_line.split(" ")[2].slice(4));

    // Play bgm and save in stack
    if (curr_line.startsWith("play music music_")) {
        if (back) restore_bgm();
        else set_bgm(curr_line.split(" ")[2].slice(6));
    }

    // Stop bgm and save in stack
    if (curr_line.startsWith("stop music")) {
        if (back) restore_bgm();
        else set_bgm();
    }

    // Handle special lines starting with $
    if (curr_line.startsWith("$ ")) {
        // Wait for click if special func valid
        let ret = special_func(curr_line);
        if (ret) return;
    }

    // Clear VFX
    if (curr_line.startsWith("window show")) $(".vfx").fadeOutAndRemove();

    // Safe to clear sprites if previous line is now show
    if (curr_line.startsWith("with locationchange")) clear_sprites_safe();
    if (curr_line.startsWith("with shorttimeskip")) clear_sprites_safe();
    if (curr_line.startsWith("with locationskip")) clear_sprites_safe();

    // Unused pause function
    if (curr_line.startsWith("with Pause(")) {
        // let pause_dur = parseFloat(curr_line.slice(-4, -1));
        // await new Promise(r => setTimeout(r, pause_dur * 1000));
    }

    // Dont clear VFX here
    if (curr_line.startsWith("scene bg ")) {
        if (back) restore_bg();
        else set_bg(rstrip_colon(curr_line.split(" ")[2]));
    }
    else if (curr_line.startsWith("scene ")) {
        if (back) restore_bg();
        else set_scene(curr_line.slice(6));
    }

    if (curr_line.startsWith("show bg ")) {
        if (back) restore_bg();
        else set_bg(rstrip_colon(curr_line.split(" ")[2]));
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
            set_sprite(rstrip_colon(sprite_fullname), pos);
        }
    }

    if (curr_line.startsWith("hide ")) {
        let sprite_char_name = rstrip_colon(curr_line.slice(5));
        hide_sprite(sprite_char_name);
    }

    // Handle labels
    if (curr_line.startsWith("label ") && !back) {

        let returned_from_jump = false;
        let passed = true;

        // If currently in a jump and encountering a new label, exit from jump and return to original location
        if (ret_loc) {
            curr_line_no = ret_loc;
            curr_line = get_curr_line();
            ret_loc = 0;
            returned_from_jump = true;
            console.log("RETURNED FROM JUMP");
            console.log(curr_line_no, curr_line);
        }

        // Retrieve label name from line
        let label_content = rstrip_colon(curr_line).split(" ")[1].slice(LANG_PREFIX.length);

        // Skip incompatible labels
        while (incompatible_labels[label_content] in choices_dict) {
            skip_label();
            label_content = rstrip_colon(get_curr_line()).split(" ")[1].slice(LANG_PREFIX.length);
        }

        // Calculate score every label because score implementation can be broken
        calc_score();
        console.log("LABEL", label_content, affection_scores);
        let dbg_text = $("#dbg").text();
        $("#dbg").html(`${label_content}<br>${dbg_text}`);

        // Label with choice/affection requirements
        let requirements = route_dict[label_content];
        if (requirements) {
            passed = eval_choices(requirements);
            console.log("PASSED", passed);
            if (!passed) skip_label();
        }

        // Check if jump required before label
        // Will jump into the line right after the target label to avoid skipping it (the target label was probably skipped previously)
        let jump_label = insert_bef_label_dict[label_content];
        if (passed && !returned_from_jump && jump_label) {
            ret_loc = curr_line_no;
            let jump_loc = curr_script_content_arr.indexOf(`label ${LANG_PREFIX}${jump_label}:`);
            curr_line_no = jump_loc;
        }

        // Display choice if this label is valid
        if (passed && label_content.startsWith("choice")) {
            show_choice(label_content);
            return;
        }

        // CANNOT CLEAR HERE ALSO
        // clear_sprites();
    }

    // Keep parsing lines recursively until reaching next dialog (or any line that requires user click)
    if (back) curr_line_no -= 1;
    else curr_line_no += 1;

    parse_line(back);
}

function show_dialog(curr_line) {
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
        bgm_stack: bgm_stack,
        bg_stack: bg_stack,
        awaiting_choice: awaiting_choice,
        choices_dict: choices_dict,
        body_content: body_content
    };

    // Save the data into a cookie
    // Cookies.set("save_data", JSON.stringify(save_data), { expires: 365 });
    localStorage.setItem("save_data", JSON.stringify(save_data));
    console.log("SAVED", save_data);
}

function quick_load() {
    // let save_data_raw = Cookies.get("save_data");
    let save_data_raw = localStorage.getItem("save_data");
    if (!save_data_raw) {
        alert("No save data.");
        return;
    }

    let save_data = JSON.parse(save_data_raw);
    $("#choices-div").empty();

    awaiting_choice = save_data.awaiting_choice;
    curr_line_no = save_data.curr_line_no;
    choices_dict = save_data.choices_dict;
    bgm_stack = save_data.bgm_stack;
    bg_stack = save_data.bg_stack;

    // Restore game data
    load_script(save_data.curr_script_name);
    set_bgm(bgm_stack.at(-1), restore = true);
    set_bg_force(bgm_stack.at(-1));
    $("#bg").replaceWith(save_data.body_content)

    // Reset click listener
    set_choice_listener();
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
    if (event.ctrlKey && curr_line_no > -1) next_line();
    else if (event.key == "s") quick_save();
    else if (event.key == "l") quick_load();
});

// Click bg to go to next line
$(document).on('click', '#bg', function (e) {
    if (e.target == $(".choice-div")[0]) return;
    next_line();
});

// Scroll up/down to go back/forward
$(window).bind('mousewheel', function (event) {
    if (curr_line_no < 0) return;
    if (event.originalEvent.wheelDelta >= 0) prev_line();
    else next_line();
});



$(document).ready(function () {
    // Initialize assets with dynamic URL that cannot be statically set in CSS
    $('#dialog-box').css('background-image', 'url(' + ASSETS_PATH + 'ui/bg-say.png' + ')');
    $('#bg').css('background-image', 'url(' + ASSETS_PATH + 'ui/main/bg-main.png' + ')');

    // Load initial script and create array
    load_script(COMMON_ROUTE_SCRIPT_NAMES[0]);

    // Load sprites in cache
    for (var key in sprite_mappings) {
        sprite_filename = sprite_mappings[key];
        $("#cache").css("background-image", "url(" + ASSETS_PATH + sprite_filename + ")");
        $("#cache").remove();
    }

    set_choice_listener();
});
