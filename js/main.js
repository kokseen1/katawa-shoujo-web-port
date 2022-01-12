var images_arr = ['city_alley.jpg', 'city_clubint.jpg', 'city_clubpool.jpg', 'city_graveyard.jpg', 'city_karaokeext.jpg', 'city_karaokeint.jpg', 'city_othello.jpg', 'city_restaurant.jpg', 'city_station.jpg', 'city_street1.jpg', 'city_street1_blurred.jpg', 'city_street2.jpg', 'city_street2_ni.jpg', 'city_street3.jpg', 'city_street3_ni.jpg', 'city_street4.jpg', 'city_street4_ni.jpg', 'emi_dining.jpg', 'emi_houseext.jpg', 'emi_kitchen.jpg', 'gallery_atelier.jpg', 'gallery_exhibition.jpg', 'gallery_ext.jpg', 'gallery_int.jpg', 'gallery_staircase.jpg', 'hok_bath.jpg', 'hok_houseext.jpg', 'hok_kitchen.jpg', 'hok_lounge.jpg', 'hok_lounge_ni.jpg', 'hok_road.jpg', 'hok_wheat.jpg', 'hosp_ceiling.jpg', 'hosp_ext.jpg', 'hosp_room.jpg', 'hosp_room2.jpg', 'lilly_hilltop.jpg', 'misc_ceiling.jpg', 'misc_ceiling_blur.jpg', 'misc_sky.jpg', 'misc_sky_ni.jpg', 'misc_sky_rays.jpg', 'misc_sky_rn.jpg', 'misc_sky_ss.jpg', 'op_snowywoods.jpg', 'school_backexit.jpg', 'school_cafeteria.jpg', 'school_classroomart.jpg', 'school_council.jpg', 'school_council_ni.jpg', 'school_council_ss.jpg',
    'school_courtyard.jpg', 'school_courtyard_ni.jpg', 'school_courtyard_ss.jpg', 'school_dormbathroom.jpg', 'school_dormemi.jpg', 'school_dormext.jpg', 'school_dormext_full.jpg', 'school_dormext_full_ni.jpg', 'school_dormext_full_ss.jpg', 'school_dormext_half.jpg', 'school_dormext_half_ni.jpg', 'school_dormext_half_ss.jpg', 'school_dormext_start.jpg', 'school_dormext_start_ni.jpg', 'school_dormext_start_ss.jpg', 'school_dormhallground.jpg', 'school_dormhallway.jpg', 'school_dormhanako.jpg', 'school_dormhisao.jpg', 'school_dormhisao_blurred.jpg', 'school_dormhisao_blurred_ni.jpg', 'school_dormhisao_blurred_ss.jpg', 'school_dormhisao_ni.jpg', 'school_dormhisao_ss.jpg', 'school_dormlilly.jpg', 'school_dormrin.jpg', 'school_forest1.jpg', 'school_forest2.jpg', 'school_forestclearing.jpg', 'school_gardens.jpg', 'school_gardens2.jpg', 'school_gardens2_ni.jpg', 'school_gardens_ni.jpg', 'school_gate.jpg', 'school_gate_ni.jpg', 'school_gate_ss.jpg', 'school_girlsdormhall.jpg', 'school_hallway2.jpg', 'school_hallway3.jpg', 'school_hallway3_blurred.jpg', 'school_hilltop_border.jpg', 'school_hilltop_border_summer.jpg', 'school_hilltop_spring.jpg', 'school_hilltop_summer.jpg', 'school_library.jpg', 'school_library_ss.jpg', 'school_lobby.jpg', 'school_miyagi.jpg', 'school_miyagi_blurred.jpg', 'school_miyagi_ss.jpg', 'school_nomiya.jpg', 'school_nursehall.jpg', 'school_nurseoffice.jpg', 'school_parkinglot.jpg',
    'school_road.jpg', 'school_road_ni.jpg', 'school_road_ss.jpg', 'school_roof.jpg', 'school_roof_blurred.jpg', 'school_roof_ni.jpg', 'school_room32.jpg', 'school_room34.jpg', 'school_room34_ni.jpg', 'school_scienceroom.jpg', 'school_sportsstoreext.jpg', 'school_sportsstoreroom.jpg', 'school_staircase1.jpg', 'school_staircase2.jpg', 'school_stalls1.jpg',
    'school_stalls1_ni.jpg', 'school_stalls1_ss.jpg', 'school_stalls2.jpg', 'school_stalls2_ni.jpg', 'school_stalls2_ss.jpg', 'school_track.jpg', 'school_track_ni.jpg', 'school_track_on.jpg', 'school_track_on_ni.jpg', 'school_track_running.jpg', 'school_track_running_ni.jpg', 'shizu_fishing.jpg', 'shizu_fishing_ss.jpg', 'shizu_garden.jpg', 'shizu_guesthisao.jpg', 'shizu_houseext.jpg', 'shizu_houseext_lights.jpg', 'shizu_houseext_ni.jpg', 'shizu_living.jpg', 'shizu_park.jpg', 'suburb_konbiniext.jpg', 'suburb_konbiniext_ni.jpg', 'suburb_konbiniext_ss.jpg', 'suburb_konbiniint.jpg', 'suburb_park.jpg', 'suburb_park_ss.jpg', 'suburb_roadcenter.jpg', 'suburb_roadcenter_ni.jpg', 'suburb_roadcenter_ss.jpg', 'suburb_shanghaiext.jpg', 'suburb_shanghaiext_ni.jpg', 'suburb_shanghaiint.jpg', 'suburb_tanabata.jpg', 'suburb_tanabata_ni.jpg'];
var img_id = 0;
const IMG_PATH = "img/bgs/";

function set_bg() {
    let bg_path = IMG_PATH + images_arr[img_id];
    $('body').css('background-image', 'url(' + bg_path + ')');
}

document.onkeydown = function (e) {
    switch (e.which) {
        case 37: // left
            img_id -= 1;
            set_bg();

        case 38: // up
            break;

        case 39: // right
            img_id += 1;
            set_bg();


        case 40: // down
            break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
};