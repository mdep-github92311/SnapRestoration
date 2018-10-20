"use strict";

function formBuilder(formName, parts) {
    var form = "<form id='" + formName + "' method=\"POST\" style=\"display: none;\"> ";
    for (var index in parts)
      form += formParts(parts[index]);
    return form += "<br><br>\n         <input class=\"btn btn-primary\" type=\"submit\" value=\"Submit\">\n </form>";
}

function formParts(part) {
    switch (part) {
        case 'agency':
            return "<label for=\"agency\">\n            Agency: <br>\n            <select class=\"form-control\" name=\"agency\">\n               <option value=\"0\">BLM</option>\n               <option value=\"1\">NPS</option>\n               <option value=\"2\">FS</option>\n               <option value=\"3\">FWS</option>\n               <option selected=\"selected\" value=\"select\"></option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'accessibil':
            return "<label for=\"accessibil\">\n              Accessibility: <br>\n              <select class=\"form-control\" name=\"accessibil\">\n                  <option selected=\"selected\" value=\"select\"></option>\n                  <option value=\"High\">High</option>\n                  <option value=\"Medium\">Medium</option>\n                  <option value=\"Low\">Low</option>\n              </select>\n              <br>\n          </label>";
            break;
        case 'assessibil':
            return "<label for=\"assessibil\">\n              Accessibility: <br>\n              <select class=\"form-control\" name=\"assessibil\">\n                  <option value=\"select\"></option>\n                  <option value=\"High\">High</option>\n                  <option value=\"Medium\">Medium</option>\n                  <option value=\"Low\">Low</option>\n              </select>\n              <br>\n          </label>";
            break;
        case 'acres_rest':
            return "<label for=\"acres_rest\">Acres Restored: <br>\n            <input class=\"form-control\" type=\"text\" name=\"acres_rest\"><br>\n         </label>";
            break;
        case 'barr_actio':
            return "<label for=\"barr_actio\">\n            Barrier Action: <br>\n            <select class=\"form-control\" name=\"barr_actio\">\n               <option value=\"select\"></option>\n               <option value=\"Repaired\">Repaired</option>\n               <option value=\"Removed\">Removed</option>\n               <option value=\"Existing\">Existing</option>\n               <option value=\"Proposed\">Proposed</option>\n               <option value=\"Installed\">Installed</option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'barr_code':
            return "<label for=\"barr_code\">barr_code: <br>\n            <input class=\"form-control\" type=\"text\" name=\"barr_code\"><br>\n         </label>";
            break;
        case 'barr_km':
            return "<label for=\"barr_km\">barr_km: <br>\n            <input class=\"form-control\" type=\"text\" name=\"barr_km\"><br>\n         </label>";
            break;
        case 'barr_miles':
            return "<label for=\"barr_miles\">barr_miles: <br>\n            <input class=\"form-control\" type=\"text\" name=\"barr_miles\"><br>\n         </label>";
            break;
        case 'barr_type':
            return "<label for=\"barr_type\">\n            Barrier Type: <br>\n            <select class=\"form-control\" name=\"barr_type\">\n               <option value=\"select\"></option>\n               <option value=\"Boulders\">Boulders</option>\n               <option value=\"Gate\">Gate</option>\n               <option value=\"Metal Post\">Metal Post</option>\n               <option value=\"Metal Post &amp; Cable\">Metal Post &amp; Cable</option>\n               <option value=\"Tank Traps\">Tank Traps</option>\n               <option value=\"Telephone Posts\">Telephone Posts</option>\n               <option value=\"Telephone Posts &amp; Cable\">Telephone Posts &amp; Cable</option>\n               <option value=\"T-Post\">T-Post</option>\n               <option value=\"T-Post Fence\">T-Post Fence</option>\n               <option value=\"*Other - See Notes*\">*Other - See Notes*</option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'barrier_in':
            return "<label for=\"barrier_in\">\n            Barrier Installed: <br>\n            <select class=\"form-control\" name=\"barrier_in\">\n               <option value=\"select\"></option>\n               <option value=\"Yes\">Yes</option>\n               <option value=\"No\">No</option>\n               <option value=\"N/A\">N/A</option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'comments':
            return "<label for=\"comments\">Comments: <br>\n            <input class=\"form-control\" type=\"text\" name=\"comments\"><br>\n         </label>";
            break;
        case 'cultural':
            return "<label for=\"cultural\">\n              Are cultural resources impacted? <br>\n              <select class=\"form-control\" name=\"cultural\">\n                  <option selected=\"selected\" value=\"select\"></option>\n                  <option value=\"Yes\">Yes</option>\n                  <option value=\"No\">No</option>\n              </select>\n              <br>\n          </label>";
            break;
        case 'deep_till':
            return "<label for=\"deep_till\">\n            Deep Tillage: <br>\n            <select class=\"form-control\" name=\"deep_till\">\n               <option value=\"select\"></option>\n               <option value=\"Yes\">Yes</option>\n               <option value=\"No\">No</option>\n               <option value=\"N/A\">N/A</option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'depth':
            return "<label for=\"depth\">\n              Depth: <br>\n              <select class=\"form-control\" id=\"depthDPoly\" name=\"depth\">\n                  <option value=\"select\"></option>\n                  <option value=\"1 - Broken < 2\" '' =\"\">1 - Broken &lt; 2''</option>\n                  <option value=\"2 - Rut 2\" '=\"\" -=\"\" 4' '' =\"\">2 - Rut 2'' - 4''</option>\n                  <option value=\"3 - Rut 4\" '=\"\" -=\"\" 8' '' =\"\">3 - Rut 4'' - 8''</option>\n                  <option value=\"4 - Rut > 8\" '' =\"\">4 - Rut &gt; 8''</option>\n              </select>\n              <br>\n          </label>";
            break;
        case 'dist_code':
            return "<label for=\"dist_code\">\n              Disturbance Code: <br>\n              <input class=\"form-control\" type=\"text\" name=\"dist_code\"><br>\n          </label>";
            break;
        case 'dist_crust':
            return "<label for=\"dist_crust\">\n              Disturbed Soil Crust: <br>\n              <select class=\"form-control\" name=\"dist_crust\">\n                  <option value=\"select\"></option>\n                  <option value=\"0 - No Crust\">0 - No Crust</option>\n                  <option value=\"1 - Alkali\">1 - Alkali</option>\n                  <option value=\"2 - Cyano-patchy\">2 - Cyano-patchy</option>\n                  <option value=\"3 - Cyano-continuous\">3 - Cyano-continuous</option>\n                  <option value=\"4 - Lichen-patchy\">4 - Lichen-patchy</option>\n                  <option value=\"5 - Lichen-continuous\">5 - Lichen-continuous</option>\n              </select>\n              <br>\n          </label>";
            break;
        case 'dist_poly_':
            return "<label for=\"dist_poly_\">\n              Disturbance Polygon: <br>\n              <select class=\"form-control\" name=\"dist_poly_\">\n                  <option value=\"select\"></option>\n                  <option value=\"Donuts/ Random Tracks\">Donuts/ Random Tracks</option>\n                  <option value=\"Pullouts\">Pullouts</option>\n                  <option value=\"Denuded Area\">Denuded Area</option>\n                  <option value=\"Scrape\">Scrape</option>\n                  <option value=\"Burn\">Burn</option>\n                  <option value=\"*Other - See Comments\">*Other - See Comments</option>\n              </select>\n              <br>\n          </label>";
            break;
        case 'dist_pt_ty':
            return "<label for=\"dist_pt_ty\">\n              Disturbance Type: <br>\n              <select class=\"form-control\" name=\"dist_pt_ty\">\n                  <option selected=\"selected\" value=\"select\"></option>\n                  <option value=\"Dumpsite\">Dumpsite</option>\n                  <option value=\"Fire Ring\">Fire Ring</option>\n                  <option value=\"Graffiti\">Graffiti</option>\n                  <option value=\"Plant Collection\">Plant Collection</option>\n                  <option value=\"Mine Shaft\">Mine Shaft</option>\n                  <option value=\"Shooting Range\">Shooting Range</option>\n                  <option value=\"Bike Trail\">Location along Bike Trail</option>\n                  <option value=\"Campsite\">Campsite</option>\n                  <option value=\"Incursion\">Incursion</option>\n                  <option value=\"Hillclimb\">Hillclimb</option>\n                  <option value=\"*Other - See Notes*\">*Other - See Notes*</option>\n              </select>\n              <br>\n          </label>";
            break;
        case 'dist_sever':
            return "<label for=\"dist_sever\">\n              Disturbance Severity: <br>\n              <input class=\"form-control\" type=\"text\" name=\"dist_sever\"><br>\n          </label>";
            break;
        case 'dist_use':
            return "<label for=\"dist_use\">\n              Disturbance Use: <br>\n              <select class=\"form-control\" name=\"dist_use\">\n                  <option selected=\"selected\" value=\"select\"></option>\n                  <option value=\"Social\">Social</option>\n                  <option value=\"Mine\">Mine</option>\n                  <option value=\"Old utility\">Old utility</option>\n                  <option value=\"Random / Blazed\">Random / Blazed</option>\n                  <option value=\"Gov_Operation\">Gov_Operation</option>\n                  <option value=\"*Other - See Commnets\">*Other - See Commnets</option>\n              </select>\n              <br>\n          </label>";
            break;
        case 'ecosystem':
            return "<label for=\"ecosystem\">\n            Ecosystem: <br>\n            <select class=\"form-control\" name=\"ecosystem\">\n               <option value=\"select\"></option>\n               <option value=\"Alpine\">Alpine</option>\n               <option value=\"Bristlecone/ Limber Pine\">Bristlecone/ Limber Pine</option>\n               <option value=\"Mixed Conifer\">Mixed Conifer</option>\n               <option value=\"Pinon-Juniper\">Pinon-Juniper</option>\n               <option value=\"Blackbrush/ Shadscale\">Blackbrush/ Shadscale</option>\n               <option value=\"Riparian\">Riparian</option>\n               <option value=\"Wetland\">Wetland</option>\n               <option value=\"Open Water\">Open Water</option>\n               <option value=\"Spring\">Spring</option>\n               <option value=\"Spring Channel\">Spring Channel</option>\n               <option value=\"Dune\">Dune</option>\n               <option value=\"Mojave Desert Scrub\">Mojave Desert Scrub</option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'estimate_s':
            return "<label for=\"estimate_s\">\n              Estimated Size: <br>\n              <input class=\"form-control\" type=\"text\" name=\"estimate_s\"><br>\n          </label>";
            break;
        case 'gid':
            return "<label for=\"gid\">GID: <br>\n            <input class=\"form-control\" type=\"text\" name=\"gid\">\n            <br>\n         </label>";
            break;
        case 'gps_date':
            return "<label for=\"gps_date\">Date collected: <br>\n            <input class=\"form-control\" type=\"date\" name=\"gps_date\"><br>\n         </label>";
            break;
        case 'gps_photo':
            return "<label for=\"gps_photo\">\n            Is there a GPS tagged photo? <br>\n            <select class=\"form-control\" name=\"gps_photo\">\n               <option value=\"select\"></option>\n               <option value=\"Yes\">Yes</option>\n               <option value=\"No\">No</option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'km_dist':
            return "<label for=\"km_dist\">\n              Km Disturbed: <br>\n              <input class=\"form-control\" type=\"text\" name=\"km_dist\"><br>\n          </label>";
            break;
        case 'km_resto':
            return "<label for=\"km_resto\">Km Restored: <br>\n            <input class=\"form-control\" type=\"text\" name=\"km_resto\"><br>\n         </label>";
            break;
        case 'kmsq_resto':
            return "<label for=\"kmsq_resto\">Km^2 Restored: <br>\n            <input class=\"form-control\" type=\"text\" name=\"kmsq_resto\"><br>\n         </label>";
            break;
        case 'kmqs_resto':
            return "<label for=\"kmqs_resto\">Km^2 Restored: <br>\n            <input class=\"form-control\" type=\"text\" name=\"kmqs_resto\"><br>\n         </label>";
            break;
        case 'miles_dist':
            return "<label for=\"miles_dist\">\n              Miles Disturbed: <br>\n              <input class=\"form-control\" type=\"text\" name=\"miles_dist\"><br>\n          </label>";
            break;
        case 'miles_rest':
            return "<label for=\"miles_rest\">Miles Restored: <br>\n            <input class=\"form-control\" type=\"text\" name=\"miles_rest\"><br>\n         </label>";
            break;
        case 'monitoring':
            return "<label for=\"monitoring\">\n            Monitoring: <br>\n            <select class=\"form-control\" name=\"monitoring\">\n               <option value=\"select\"></option>\n               <option value=\"Yes\">Yes</option>\n               <option value=\"No\">No</option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'mulch':
            return "<label for=\"mulch\">\n            Mulch: <br>\n            <select class=\"form-control\" name=\"mulch\">\n               <option value=\"select\"></option>\n               <option value=\"None\">None</option>\n               <option value=\"Verticle\">Verticle</option>\n               <option value=\"Horizontal\">Horizontal</option>\n               <option value=\"N/A\">N/A</option>\n               <option value=\"Both\">Both</option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'non_list_a':
            return "<label for=\"non_list_a\">\n            Non-listed Species: <br>\n            <select class=\"form-control\" name=\"non_list_a\">\n               <option value=\"select\"></option>\n               <option value=\"Yes\">Yes</option>\n               <option value=\"No\">No</option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'nonlists_a':
            return "<label for=\"nonlists_a\">\n            Non-listed Species: <br>\n            <select class=\"form-control\" id=\"nonlists_a\" name=\"nonlists_a\">\n               <option value=\"select\"></option>\n               <option value=\"Yes\">Yes</option>\n               <option value=\"No\">No</option>\n               <option value=\"N/A\">N/A*</option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'old_dist_c':
            return "<label for=\"old_distco\">\n              Old Disturbance Code: <br>\n              <input class=\"form-control\" type=\"text\" name=\"old_distco\"><br>\n          </label>";
            break;
        case 'old_distco':
            return "<label for=\"old_distco\">\n              Old Disturbance Code: <br>\n              <input class=\"form-control\" type=\"text\" name=\"old_distco\"><br>\n          </label>";
            break;
        case 'photo_azim':
            return "<label for=\"photo_azim\">Which way is photo facing (degrees)? <br>\n            <input class=\"form-control\" type=\"number\" name=\"photo_azim\" min=\"1\" max=\"360\"><br>\n         </label>";
            break;
        case 'plant_dama':
            return "<label for=\"plant_dama\">\n              Plant Canopy Damage: <br>\n              <select class=\"form-control\" name=\"plant_dama\">\n                  <option value=\"select\"></option>\n                  <option value=\"0 - Intact\">0 - Intact</option>\n                  <option value=\"1 - Most symmetrical\">1 - Most symmetrical</option>\n                  <option value=\"2 - Many irregular, few dissected\">2 - Many irregular, few dissected</option>\n                  <option value=\"3 - Many dissected, few highly dissected\">3 - Many dissected, few highly dissected</option>\n                  <option value=\"4 - Many highly dissected, roots exposed\">4 - Many highly dissected, roots exposed</option>\n                  <option value=\"5 - Many with roots exposed or detached\">5 - Many with roots exposed or detached</option>\n                  <option value=\"6 - Denuded\">6 - Denuded</option>\n              </select>\n              <br>\n          </label>";
            break;
        case 'previously':
            return "<label for=\"previously\">\n            Previously Restored: <br>\n            <select class=\"form-control\" name=\"previously\">\n               <option value=\"select\"></option>\n               <option value=\"Yes\">Yes</option>\n               <option value=\"No\">No</option>\n               <option value=\"Unknown\">Unknown</option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'primary_ob':
            return "<label for=\"primary_ob\">Who collected the data? <br>\n            <input class=\"form-control\" type=\"text\" name=\"primary_ob\"><br>\n         </label>";
            break;
        case 'project_na':
            return "<label for=\"project_na\">Project Name: <br>\n            <input class=\"form-control\" type=\"text\" name=\"project_na\"><br>\n         </label>";
            break;
        case 'qa_qc':
            return "<label for=\"qa_qc\">QA/QC: <br>\n            <input class=\"form-control\" type=\"text\" name=\"qa_qc\"><br>\n         </label>";
            break;
        case 'region':
            return "<label for=\"region\">\n            Region: <br>\n            <select class=\"form-control\" name=\"region\">\n               <option value=\"select\"></option>\n               <option value=\"Amargosa Desert E\">Amargosa Desert E</option>\n               <option value=\"Amargosa Desert W\">Amargosa Desert W</option>\n               <option value=\"Black Mt Area\">Black Mt Area</option>\n               <option value=\"California Wash\">California Wash</option>\n               <option value=\"Colorado Valley\">Colorado Valley</option>\n               <option value=\"Coyote Springs Valley\">Coyote Springs Valley</option>\n               <option value=\"Crater Flat\">Crater Flat</option>\n               <option value=\"Eldorado Valley\">Eldorado Valley</option>\n               <option value=\"Forty-mile Canyon\">Forty-mile Canyon</option>\n               <option value=\"Frenchman Flat\">Frenchman Flat</option>\n               <option value=\"Garnet Valley\">Garnet Valley</option>\n               <option value=\"Gold Butte Area\">Gold Butte Area</option>\n               <option value=\"Greasewood Basin\">Greasewood Basin</option>\n               <option value=\"Hidden Valley N\">Hidden Valley N</option>\n               <option value=\"Hidden Valley S\">Hidden Valley S</option>\n               <option value=\"Indian Springs Valley N\">Indian Springs Valley N</option>\n               <option value=\"Indian Springs Valley S\">Indian Springs Valley S</option>\n               <option value=\"Ivanpah N\">Ivanpah N</option>\n               <option value=\"Ivanpah S\">Ivanpah S</option>\n               <option value=\"Jean Lake Valley\">Jean Lake Valley</option>\n               <option value=\"Las Vegas Valley\">Las Vegas Valley</option>\n               <option value=\"Meadow Valley Wash Upper\">Meadow Valley Wash Upper</option>\n               <option value=\"Meadow Valley Wash Lower\">Meadow Valley Wash Lower</option>\n               <option value=\"Mercury Valley\">Mercury Valley</option>\n               <option value=\"Mesquite Valley\">Mesquite Valley</option>\n               <option value=\"Moapa Valley\">Moapa Valley</option>\n               <option value=\"Muddy River Springs Area\">Muddy River Springs Area</option>\n               <option value=\"Pahrump Valley\">Pahrump Valley</option>\n               <option value=\"Piute Valley\">Piute Valley</option>\n               <option value=\"Rock Valley\">Rock Valley</option>\n               <option value=\"Three Lakes Valley N\">Three Lakes Valley N</option>\n               <option value=\"Three Lakes Valley S\">Three Lakes Valley S</option>\n               <option value=\"Tikapoo Valley\">Tikapoo Valley</option>\n               <option value=\"Virgin River Valley\">Virgin River Valley</option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'regions':
            return "<label for=\"regions\">\n            Regions: <br>\n            <select class=\"form-control\" name=\"regions\">\n               <option value=\"select\"></option>\n               <option value=\"Amargosa Desert E\">Amargosa Desert E</option>\n               <option value=\"Amargosa Desert W\">Amargosa Desert W</option>\n               <option value=\"Black Mt Area\">Black Mt Area</option>\n               <option value=\"California Wash\">California Wash</option>\n               <option value=\"Colorado Valley\">Colorado Valley</option>\n               <option value=\"Coyote Springs Valley\">Coyote Springs Valley</option>\n               <option value=\"Crater Flat\">Crater Flat</option>\n               <option value=\"Eldorado Valley\">Eldorado Valley</option>\n               <option value=\"Forty-mile Canyon\">Forty-mile Canyon</option>\n               <option value=\"Frenchman Flat\">Frenchman Flat</option>\n               <option value=\"Garnet Valley\">Garnet Valley</option>\n               <option value=\"Gold Butte Area\">Gold Butte Area</option>\n               <option value=\"Greasewood Basin\">Greasewood Basin</option>\n               <option value=\"Hidden Valley N\">Hidden Valley N</option>\n               <option value=\"Hidden Valley S\">Hidden Valley S</option>\n               <option value=\"Indian Springs Valley N\">Indian Springs Valley N</option>\n               <option value=\"Indian Springs Valley S\">Indian Springs Valley S</option>\n               <option value=\"Ivanpah N\">Ivanpah N</option>\n               <option value=\"Ivanpah S\">Ivanpah S</option>\n               <option value=\"Jean Lake Valley\">Jean Lake Valley</option>\n               <option value=\"Las Vegas Valley\">Las Vegas Valley</option>\n               <option value=\"Meadow Valley Wash Upper\">Meadow Valley Wash Upper</option>\n               <option value=\"Meadow Valley Wash Lower\">Meadow Valley Wash Lower</option>\n               <option value=\"Mercury Valley\">Mercury Valley</option>\n               <option value=\"Mesquite Valley\">Mesquite Valley</option>\n               <option value=\"Moapa Valley\">Moapa Valley</option>\n               <option value=\"Muddy River Springs Area\">Muddy River Springs Area</option>\n               <option value=\"Pahrump Valley\">Pahrump Valley</option>\n               <option value=\"Piute Valley\">Piute Valley</option>\n               <option value=\"Rock Valley\">Rock Valley</option>\n               <option value=\"Three Lakes Valley N\">Three Lakes Valley N</option>\n               <option value=\"Three Lakes Valley S\">Three Lakes Valley S</option>\n               <option value=\"Tikapoo Valley\">Tikapoo Valley</option>\n               <option value=\"Virgin River Valley\">Virgin River Valley</option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'resto_act':
            return "<label for=\"resto_act\">\n            Restoration Activity: <br>\n            <select class=\"form-control\" name=\"resto_act\">\n               <option value=\"select\"></option>\n               <option value=\"Fire Ring Removal\">Fire Ring Removal</option>\n               <option value=\"Graffiti Removal\">Graffiti Removal</option>\n               <option value=\"Garbage Removal\">Garbage Removal</option>\n               <option value=\"Outplanting\">Outplanting</option>\n               <option value=\"Transplanting\">Transplanting</option>\n               <option value=\"*Other - See Comments\">*Other - See Comments</option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'resto_acti':
            return "<label for=\"resto_acti\">\n            Restoration Activity: <br>\n            <select class=\"form-control\" name=\"resto_acti\">\n               <option value=\"select\"></option>\n               <option value=\"Fire Ring Removal\">Fire Ring Removal</option>\n               <option value=\"Graffiti Removal\">Graffiti Removal</option>\n               <option value=\"Garbage Removal\">Garbage Removal</option>\n               <option value=\"Outplanting\">Outplanting</option>\n               <option value=\"Transplanting\">Transplanting</option>\n               <option value=\"*Other - See Comments\">*Other - See Comments</option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'resto_code':
            return "<label for=\"resto_code\">Restoration Code: <br>\n            <input class=\"form-control\" type=\"text\" name=\"resto_code\"><br>\n         </label>";
            break;
        case 'secondary_':
            return "<label for=\"secondary_\">Who was with you? <br>\n            <input class=\"form-control\" type=\"text\" name=\"secondary_\"><br>\n         </label>";
            break;
        case 'shape_area':
            return "<label for=\"shape_area\">Shape Area: <br>\n            <input class=\"form-control\" type=\"text\" name=\"shape_area\"><br>\n         </label>";
            break;
        case 'shape_star':
            return "<label for=\"shape_star\">Shape Star: <br>\n            <input class=\"form-control\" type=\"text\" name=\"shape_star\"><br>\n         </label>";
            break;
        case 'signed':
            return "<label for=\"signed\">\n            Signed: <br>\n            <select class=\"form-control\" name=\"signed\">\n               <option value=\"select\"></option>\n               <option value=\"Yes\">Yes</option>\n               <option value=\"No\">No</option>\n               <option value=\"N/A\">N/A</option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'site_stabi':
            return "<label for=\"site_stabi\">\n              Site Stability: <br>\n              <select class=\"form-control\" name=\"site_stabi\">\n                  <option value=\"select\"></option>\n                  <option value=\"Unstable\">Unstable</option>\n                  <option value=\"Poor\">Poor</option>\n                  <option value=\"Moderate\">Moderate</option>\n                  <option value=\"Good\">Good</option>\n                  <option value=\"Stable\">Stable</option>\n              </select>\n              <br>\n          </label>";
            break;
        case 'site_vulne':
            return "<label for=\"site_vulne\">\n              Site Vulnerability <br>\n              <select class=\"form-control\" name=\"site_vulne\">\n                  <option value=\"select\"></option>\n                  <option value=\"Low\">Low</option>\n                  <option value=\"Low/ Medium\">Low/ Medium</option>\n                  <option value=\"Medium\">Medium</option>\n                  <option value=\"Medium/ High\">Medium/ High</option>\n                  <option value=\"High\">High</option>\n                  <option value=\"Not Characterized\">Not Characterized</option>\n              </select>\n              <br>\n          </label>";
            break;
        case 'sqft_resto':
            return "<label for=\"sqft_resto\">Ft^2 Restored: <br>\n            <input class=\"form-control\" type=\"text\" name=\"sqft_resto\"><br>\n         </label>";
            break;
        case 'soil_vulne':
            return "<label for=\"soil_vulne\">\n              Soil Vunerability: <br>\n              <select class=\"form-control\" name=\"soil_vulne\">\n                  <option selected=\"selected\" value=\"select\"></option>\n                  <option value=\"Low\">Low</option>\n                  <option value=\"Low/ Medium\">Low/ Medium</option>\n                  <option value=\"Medium\">Medium</option>\n                  <option value=\"Medium/ High\">Medium/ High</option>\n                  <option value=\"High\">High</option>\n                  <option value=\"Not Characterized\">Not Characterized</option>\n              </select>\n              <br>\n          </label>";
            break;
        case 't_e_specie':
            return "<label for=\"t_e_specie\">\n              Are Threatened or Endangered Species impacted? (If \"Yes\" include species names in comments) <br>\n              <select class=\"form-control\" name=\"t_e_specie\">\n                  <option selected=\"selected\" value=\"select\"></option>\n                  <option value=\"Yes\">Yes</option>\n                  <option value=\"No\">No</option>\n              </select>\n              <br>\n          </label>";
            break;
        case 'te_act':
            return "<label for=\"te_act\">\n            Threatened or Endangered Species Activity: <br>\n            <select class=\"form-control\" name=\"te_act\">\n               <option value=\"select\"></option>\n               <option value=\"Yes\">Yes</option>\n               <option value=\"No\">No</option>\n               <option value=\"N/A\">N/A*</option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'te_action':
            return "<label for=\"te_action\">\n            T&E Species: <br>\n            <select class=\"form-control\" name=\"te_action\">\n               <option value=\"select\"></option>\n               <option value=\"Yes\">Yes</option>\n               <option value=\"No\">No</option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'treated':
            return "<label for=\"treated\">\n              Was the disturbance treated? <br>\n              <select class=\"form-control\" name=\"treated\">\n                  <option selected=\"selected\" value=\"select\"></option>\n                  <option value=\"Yes\">Yes</option>\n                  <option value=\"No\">No*</option>\n              </select>\n              <br>\n          </label>";
            break;
        case 'treatment_':
            return "<label for=\"treatment_\">\n            Treatment Type: <br>\n            <select class=\"form-control\" name=\"treatment_\">\n               <option value=\"select\"></option>\n               <option value=\"Active\">Active</option>\n               <option value=\"Passive\">Passive</option>\n            </select>\n            <br>\n         </label>";
            break;
        case 'type':
            return "<label for=\"type\">\n              Type: <br>\n              <select class=\"form-control\" name=\"type\">\n                  <option value=\"select\"></option>\n                  <option value=\"One-track\">One-track</option>\n                  <option value=\"Two-track\">Two-track</option>\n                  <option value=\"Random\">Random</option>\n                  <option value=\"Road\">Road</option>\n                  <option value=\"*Other - See Comments\">*Other - See Comments</option>\n              </select>\n              <br>\n          </label>";
            break;
        case 'undist_cru':
            return "<label for=\"undist_cru\">\n              Undisturbed Crust: <br>\n              <select class=\"form-control\" name=\"undist_cru\">\n                  <option value=\"select\"></option>\n                  <option value=\"0 - No Crust\">0 - No Crust</option>\n                  <option value=\"1 - Alkali\">1 - Alkali</option>\n                  <option value=\"2 - Cyano-patchy\">2 - Cyano-patchy</option>\n                  <option value=\"3 - Cyano-continuous\">3 - Cyano-continuous</option>\n                  <option value=\"4 - Lichen-patchy\">4 - Lichen-patchy</option>\n                  <option value=\"5 - Lichen-continuous\">5 - Lichen-continuous</option>\n              </select>\n              <br>\n          </label>";
            break;
        case 'use_freq':
            return "<label for=\"use_freq\">\n              Frequent Use: <br>\n              <select class=\"form-control\" name=\"use_freq\">\n                  <option selected=\"selected\" value=\"select\"></option>\n                  <option value=\"Yes\">Yes</option>\n                  <option value=\"No\">No</option>\n              </select>\n              <br>\n          </label>";
            break;
        case 'use_recent':
            return "<label for=\"use_recent\">\n              Recent Use: <br>\n              <select class=\"form-control\" name=\"use_recent\">\n                  <option selected=\"selected\" value=\"select\"></option>\n                  <option value=\"Yes\">Yes</option>\n                  <option value=\"No\">No</option>\n              </select>\n              <br>\n          </label>";
            break;
        case 'visibility':
            return "<label for=\"visibility\">\n              Visibility: <br>\n              <select class=\"form-control\" name=\"visibility\">\n                  <option selected=\"selected\" value=\"select\"></option>\n                  <option value=\"High\">High</option>\n                  <option value=\"Medium\">Medium</option>\n                  <option value=\"Low\">Low</option>\n              </select>\n              <br>\n          </label>";
            break;
        case 'width':
            return "<label for=\"width\">\n              Width: <br>\n              <select class=\"form-control\" name=\"width\">\n                  <option value=\"select\"></option>\n                  <option value=\"1 - 2 ft - Dirt Bike\">1 - 2 ft - Dirt Bike</option>\n                  <option value=\"2 - 4 ft - ATV\">2 - 4 ft - ATV</option>\n                  <option value=\"3 - 6 ft - Vehicle\">3 - 6 ft - Vehicle</option>\n                  <option value=\"4 - > 6ft\">4 - &gt; 6ft</option>\n                  <option value=\"*Other - See Notes*\">*Other - See Notes*</option>\n              </select>\n              <br>\n          </label>";
            break;
        default:
            console.log(part);
    }
}