// Determines which labels should be displayed according to choices
// "Label to display" : [["Choice label" : "Chosen value"], 
//                       ["Character name": score], ... ]
// For character score condition, gt by default, "lt" if specified at end of array
// "||" at the end of array to indicate OR condition, otherwise AND
// Nested arrays; recursion is supported.
const route_dict = {
    // Why?
    // Of course Shizune +1
    "A1a": [["choiceA1", "m1"]],
    "A1b": [["choiceA1", "m2"]],


    "A2a": [["choiceA1", "m1"]],
    "A2b": [["choiceA1", "m2"]],

    "A2d": [["choiceA1", "m2"]],
    "A2e": [["choiceA1", "m1"]],

    // Library Hanako/Lilly +1
    // Deafness 
    // Got everything Shizune +1
    "A3a": [["choiceA3", "m1"]],
    "A3b": [["choiceA3", "m2"]],
    "A3c": [["choiceA3", "m3"]],

    // Attack Shizune +1
    // Defense
    "A6a": [["choiceA6", "m1"]],
    "A6b": [["choiceA6", "m2"]],

    // Hi
    // Sorry Lilly/Hanako +1
    "A8a": [["choiceA8", "m1"]],
    "A8aa": [["choiceA8", "m1"], ["choiceA1", "m2"]],
    "A8ab": [["choiceA8", "m1"]],
    "A8b": [["choiceA8", "m2"]],
    "A8d": [["choiceA8", "m1"]],
    "A8e": [["choiceA8", "m2"]],

    // Cute Lilly/Hanako +1
    // Not cute
    "A9a": [["choiceA9", "m1"]],
    "A9b": [["choiceA9", "m2"]],

    "A10a": [["choiceA10a", "m1"], ["choiceA10b", "m2"], ["choiceA10c", "m1"], [["hanako", 1, "lt"], ["lilly", 1, "lt"], ["lilly", 1, "lt"]], "||"],
    "A10b": [["choiceA10a", "m2"], ["choiceA10c", "m2"], "||"],
    "A10c": [["choiceA10a", "m3"], ["choiceA10b", "m1"], "||"],

    "choiceA10a": [["hanako", 1], ["lilly", 1], ["shizune", 1]],
    "choiceA10b": [["shizune", 1]],
    "choiceA10c": [["hanako", 1], ["lilly", 1]],

    "A11": [["choiceA10a", "m1"], ["choiceA10a", "m3"], ["choiceA10b", "m1"], "||"],
    "A11a": [["choiceA10a", "m1"], ["choiceA10a", "m3"], ["choiceA10b", "m1"], "||"],
    "A11b": [["choiceA10a", "m1"], ["choiceA10a", "m3"], ["choiceA10b", "m1"], "||"],
    "A11c": [["choiceA10a", "m2"], ["choiceA10c", "m2"], "||"],
    "A11d": [["choiceA10a", "m2"], ["choiceA10c", "m2"], "||"],

    "A11x": [["choiceA10a", "m3"], ["choiceA10b", "m1"], "||"],
    "A11y": [["choiceA10a", "m1"], ["choiceA10b", "m2"], ["choiceA10c", "m1"], "||"],

    "A12": [["choiceA10a", "m3"], ["choiceA10b", "m1"], "||"],
    "A13": [["choiceA10a", "m2"], ["choiceA10c", "m2"], "||"],

    "A17a": [["choiceA17", "m1"]],
    "A17b": [["choiceA17", "m2"]],

    "A19a": [["training", 0]],
    "A19b": [["training", 1, "lt"]],
    "A19d": [["training", 0]],
    "A19e": [["training", 1, "lt"]],
    "A19g": [["training", 0]],
    "A19h": [["training", 1, "lt"]],

    // Done my part Shizune +1
    // Cut us some slack Lilly +1
    // To be confirmed
    "A21a": [["choiceA21", "m1"]],
    "A21b": [["choiceA21", "m2"]],

    // TBC not sure if decided by choice or affection
    "A21c": [["choiceA21", "m2"], [["choiceA10a", "m2"], ["choiceA10c", "m2"], "||"]],

    // Read book
    "A21d": [["choiceA21", "m2"], [["choiceA10a", "m1"], ["choiceA10b", "m2"], ["choiceA10c", "m1"], "||"]],

    "A22": [["choiceA21", "m1"]],

    // TBC
    "A22a": [["choiceA21", "m1"]],
    "A22b": [["choiceA21", "?"]],

    "A23": [["choiceA21", "m2"], [["choiceA10a", "m1"], ["choiceA10b", "m2"], ["choiceA10c", "m1"], "||"]],
    "A23a": [["choiceA21", "m2"], [["choiceA10a", "m1"], ["choiceA10b", "m2"], ["choiceA10c", "m1"], "||"]],


    "A24": [["choiceA21", "m2"], [["choiceA10a", "m2"], ["choiceA10c", "m2"], "||"]],

    "A24a": [["training", 0]],
    "A24b": [["training", 1, "lt"]],

    "A24c": [["choiceA21", "?"]],
    "A24d": [["choiceA21", "?"]],
    "A24e": [["choiceA21", "?"]],
};

// Specifies which routes add/reset affection scores
const affection_dict = {
    "choiceA1": { "m2": ["shizune"] },
    "choiceA3": { "m1": ["hanako", "lilly"], "m3": ["shizune"] },
    "choiceA6": { "m1": ["shizune"] },
    "choiceA8": { "m2": ["hanako", "lilly"] },
    "choiceA9": { "m1": ["hanako", "lilly"] },
    "choiceA10a": { "m2": ["hanako", "lilly"], "m3": ["shizune"] },
    "choiceA10b": { "m1": ["shizune"] },
    "choiceA10c": { "m2": ["hanako", "lilly"] },
    "choiceA17": { "m1": ["training"] },
    "choiceA21": { "m1": ["shizune"], "m2": ["hanako", "lilly"] },
};

// "Location label" : "Label to insert before location"
const insert_bef_label_dict = {
    "A11d": "A11a",
};

// Indicate which labels should be skipped (key) if another label (value) has already been shown
// Currently only (needs to) support choice labels
const incompatible_labels = {
    "choiceA10b": "choiceA10a",
    "choiceA10c": "choiceA10a",
};