"use strict";

function createForms(formNameAddition) {
    if (!formNameAddition)
        formNameAddition = '';
    var forms = $("<div>").append(formBuilder("restoPointForm" + formNameAddition, ['agency', 'ecosystem', 'gps_date', 'resto_code', 'resto_acti', 'comments', 'primary_ob', 'secondary_', 'project_na', 'sqft_resto','gps_photo', 'photo_azim', 'previously', 'qa_qc' ]) )
                          .append(formBuilder("restoPolyForm" + formNameAddition, ['agency', 'ecosystem', 'resto_code', 'resto_acti', 'te_action', 'non_list_a', 'comments', 'primary_ob', 'secondary_', 'project_na', 'treatment_', 'acres_rest', 'kmqs_resto', 'gps_date', 'gps_photo', 'photo_azim', 'signed', 'deep_till', 'barrier_in', 'mulch', 'monitoring', 'previously', 'shape_area']) )
                          .append(formBuilder("restoLineForm" + formNameAddition, ['agency', 'ecosystem', 'gps_date', 'resto_code', 'resto_acti', 'te_act', 'non_list_a', 'comments', 'primary_ob', 'secondary_', 'project_na', 'treatment_', 'signed', 'mulch', 'deep_till', 'barrier_in', 'miles_rest', 'km_resto', 'gps_photo', 'photo_azim', 'monitoring', 'previously', 'qa_qc']) )
                          .append(formBuilder("barrierForm" + formNameAddition, ['agency', 'ecosystem', 'gps_date', 'barr_code', 'barr_actio', 'barr_type', 'comments', 'primary_ob', 'secondary_', 'project_na', 'barr_miles', 'barr_km', 'previously', 'gps_photo', 'photo_azim', 'qa_qc']) )
                          .append(formBuilder("distPointForm" + formNameAddition, ['agency', 'ecosystem', 'gps_date', 'dist_code', 'use_freq', 'use_recent', 'dist_pt_ty', 'accessibil', 'visibility', 'comments', 'primary_ob', 'secondary_', 'previously', 'project_na', 'estimate_s', 'treated', 'cultural', 't_e_specie', 'soil_vulne', 'dist_use', 'gps_photo', 'photo_azim', 'qa_qc', 'old_dist_c']) )
                          .append(formBuilder("distPolyForm" + formNameAddition, ['agency', 'ecosystem', 'gps_date', 'dist_code', 'dist_use', 'use_freq', 'use_recent', 'site_stabi', 'dist_crust', 'undist_cru', 'depth', 'dist_poly_', 'plant_dama', 'accessibil', 'visibility', 'comments', 'primary_ob', 'secondary_', 'acres_rest', 'kmsq_resto', 'treated', 'dist_sever', 'cultural', 't_e_specie', 'site_vulne', 'gps_photo', 'photo_azim', 'qa_qc', 'old_dist_c', 'shape_area']) )
                          .append(formBuilder("distLineForm" + formNameAddition, ['agency', 'ecosystem', 'gps_date', 'dist_code', 'dist_use', 'use_freq', 'use_recent', 'site_stabi', 'dist_crust', 'undist_cru', 'depth', 'width', 'type', 'plant_dama', 'accessibil', 'visibility', 'comments', 'primary_ob', 'secondary_', 'miles_dist', 'km_dist', 'treated', 'dist_sever', 'cultural', 't_e_specie', 'soil_vulne', 'gps_photo', 'photo_azim', 'qa_qc', 'old_dist_c']))
    return forms;
}
function formBuilder(formName, parts) {
    var form = $("<form>", {id: formName, method:"POST", style:"display: none;"})
    for (var index in parts)
      form.append(formParts(parts[index]));
    form.append($("<input>", {type:"submit", class:"btn btn-primary", value: "Submit"}))
    return form;
}
function getRegions(val){
    const blmRegions = ['','Amargosa Desert E','Amargosa Desert W','Black Mt Area','California Wash','Colorado Valley','Coyote Springs Valley','Crater Flat','Eldorado Valley','Forty-mile Canyon','Frenchman Flat','Garnet Valley','Gold Butte Area','Greasewood Basin','Hidden Valley N','Hidden Valley S','Indian Springs Valley N','Indian Springs Valley S','Ivanpah N','Ivanpah S','Jean Lake Valley','Las Vegas Valley','Meadow Valley Wash Lower','Meadow Valley Wash Upper','Mercury Valley','Mesquite Valley','Moapa Valley','Muddy River Springs Area','Pahrump Valley','Piute Valley','Rock Valley','Three Lakes Valley N','Three Lakes Valley S','Tikapoo Valley','Virgin River Valley'];
    const fsRegions = ['','Cold Creek','Kyle Canyon','Lee Canyon','Lovell','Potosi','Stirling','Wheeler','Clark/Wallace Canyon','Trout/Carpenter Canyon'];
    const npsRegions = ['','Boulder City','Callville Bay','Cottonwood Cove','Echo Bay','Gold Butte','Government Wash','Katherine','Lakeshore','Overton Beach','Parashant','Pearce Ferry','Temple Bar','Willow Beach'];
    const fwsRegions = ['','Ash Meadows','Desert Clark','Desert Lincoln','Moapa Valley','Pahranagat'];
    var selected = null;
    switch (val){
        case '0': 
            selected = blmRegions;
            break;
        case '1':
            selected = npsRegions;
            break;
        case '2':
            selected = fsRegions;
            break;
        case '3':
            selected = fwsRegions;
            break;
        default:
            selected = blmRegions.concat(npsRegions).concat(fsRegions).concat(fwsRegions).sort();
            selected = selected.filter(function(item, pos) {
                return selected.indexOf(item) == pos;
            })
    }
    return selected;
}
function formParts(part) {
    switch (part) {
        case 'agency':
            var span = $("<span>");
            var regions = $("<select>", {class: "form-control", name: "region"}).data({changeRegions: function(val){
                    regions.html("");
                    $.each(getRegions(val), function(ind, val){
                        regions.append($("<option>", {value: val}).text(val));
                    });
                }
            });
            $.each(getRegions(null), function(ind, val){
                regions.append($("<option>", {value: val}).text(val));
            });
            var agency = $("<select>", {class: 'form-control', name: 'agency', required: 'required'}).append($("<option>", {value:-1}).text(""))
                                                                               .append($("<option>", {value:0}).text("BLM"))
                                                                               .append($("<option>", {value:1}).text("NPS"))
                                                                               .append($("<option>", {value:2}).text("FS"))
                                                                               .append($("<option>", {value:3}).text("FWS"))
                                                                               .change(function(elem){
                                                                                   regions.data("changeRegions")(elem.target.value);
                                                                               })
            
            return span.append($("<label>", {for: 'agency'}).text("Agency: ").append(agency)).append($("<label>", {for: 'region'}).text("Region: ").append(regions))
            break;
        case 'accessibil':
            return $("<label>", {for:"accessibil"}).text("Accessibility: ").append($("<select>", {class:"form-control", name:"accessibil"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "High"}).text("High")).append($("<option>", {value: "Medium"}).text("Medium")).append($("<option>", {value: "Low"}).text("Low")))
            break;
        // case 'assessibil':
        //     return $("<label>", {for:"assessibil"}).text("Accessibility: ").append($("<select>", {class:"form-control", name:"assessibil"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "High"}).text("High")).append($("<option>", {value: "Medium"}).text("Medium")).append($("<option>", {value: "Low"}).text("Low")))
        //     break;
        case 'acres_rest':
            return $("<label>", {for: "acres_rest"}).text("Acres Restored: ").append($("<input>", {class: "form-control", name:"acres_rest", type:"text"}))
            break;
        case 'barr_actio':
            return $("<label>", {for:"barr_actio"}).text("Barrier Action: ").append($("<select>", {class:"form-control", name:"barr_actio"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Repaired"}).text("Repaired")).append($("<option>", {value: "Removed"}).text("Removed")).append($("<option>", {value: "Existing"}).text("Existing")).append($("<option>", {value: "Proposed"}).text("Proposed")).append($("<option>", {value: "Installed"}).text("Installed")))
            break;
        case 'barr_code':
            return $("<label>", {for: "barr_code"}).text("Barrier Code: ").append($("<input>", {class: "form-control", name:"barr_code", type:"text"}))
            break;
        case 'barr_km':
            return $("<label>", {for: "barr_km"}).text("Barrier Km: ").append($("<input>", {class: "form-control", name:"barr_km", type:"text"}))
            break;
        case 'barr_miles':
            return $("<label>", {for: "barr_miles"}).text("Barrier Miles: ").append($("<input>", {class: "form-control", name:"barr_miles", type:"text"}))
            break;
        case 'barr_type':
            return $("<label>", {for:"barr_type"}).text("Barrier Type: ").append($("<select>", {class:"form-control", name:"barr_type"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Boulders"}).text("Boulders")).append($("<option>", {value: "Gate"}).text("Gate")).append($("<option>", {value: "Metal Post"}).text("Metal Post")).append($("<option>", {value: "Metal Post & Cable"}).text("Metal Post & Cable")).append($("<option>", {value: "Tank Traps"}).text("Tank Traps")).append($("<option>", {value: "Telephone Post"}).text("Telephone Post")).append($("<option>", {value: "Telephone Post & Cable"}).text("Telephone Post & Cable")).append($("<option>", {value: "T-Post"}).text("T-Post")).append($("<option>", {value: "T-Post Fence"}).text("T-Post Fence")).append($("<option>", {value: "*Other - See Notes*"}).text("*Other - See Notes*")))
            break;
        case 'barrier_in':
            return $("<label>", {for:"barrier_in"}).text("Barrier Installed: ").append($("<select>", {class:"form-control", name:"barrier_in"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Yes"}).text("Yes")).append($("<option>", {value: "No"}).text("No")).append($("<option>", {value: "N/A"}).text("N/A")))
            break;
        case 'comments':
            return $("<label>", {for: "comments"}).text("Comments: ").append($("<input>", {class: "form-control", name:"comments", type:"text"}))
            break;
        case 'cultural':
            return $("<label>", {for:"cultural"}).text("Are cultural resources impacted?: ").append($("<select>", {class:"form-control", name:"cultural", required: 'required'}).append($("<option>", {value: "Yes", selected: "selected"}).text("Yes")).append($("<option>", {value: "No"}).text("No")))
            break;
        case 'deep_till':
            return $("<label>", {for:"deep_till"}).text("Deep Tillage: ").append($("<select>", {class:"form-control", name:"deep_till"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Yes"}).text("Yes")).append($("<option>", {value: "No"}).text("No")).append($("<option>", {value: "N/A"}).text("N/A")))
            break;
        case 'depth':
            return $("<label>", {for:"depth"}).text("Depth: ").append($("<select>", {class:"form-control", name:"depth"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: '1 - Broken < 2"'}).text('1 - Broken < 2"')).append($("<option>", {value: '2 - Rut 2" - 4"'}).text('2 - Rut 2" - 4"')).append($("<option>", {value: '3 - Rut 4" - 8"'}).text('3 - Rut 4" - 8"')).append($("<option>", {value: '4 - Rut > 8"'}).text('4 - Rut > 8"')))
            break;
        case 'dist_code':
            return $("<label>", {for: "dist_code"}).text("Disturbance Code: ").append($("<input>", {class: "form-control", name:"dist_code", type:"text", required: 'required'}))
            break;
        case 'dist_crust':
            return $("<label>", {for:"dist_crust"}).text("Disturbed Soil Crust: ").append($("<select>", {class:"form-control", name:"dist_crust"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "0 - No Crust"}).text("0 - No Crust")).append($("<option>", {value: "1 - Alkali"}).text("1 - Alkali")).append($("<option>", {value: "2 - Cyano-patchy"}).text("2 - Cyano-patchy")).append($("<option>", {value: "3 - Cyano-continuous"}).text("3 - Cyano-continuous")).append($("<option>", {value: "4 - Lichen-patchy"}).text("4 - Lichen-patchy")).append($("<option>", {value: "5 - Lichen-continuous"}).text("5 - Lichen-continuous")))
            break;
        case 'dist_poly_':
            return $("<label>", {for:"dist_poly_"}).text("Disturbance Polygon: ").append($("<select>", {class:"form-control", name:"dist_poly_"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Donuts/ Random Tracks"}).text("Donuts/ Random Tracks")).append($("<option>", {value: "Pullouts"}).text("Pullouts")).append($("<option>", {value: "Denuded Area"}).text("Denuded Area")).append($("<option>", {value: "Scrape"}).text("Scrape")).append($("<option>", {value: "Burn"}).text("Burn")).append($("<option>", {value: "*Other - See Comments"}).text("*Other - See Comments")))
            break;
        case 'dist_pt_ty':
            return $("<label>", {for:"dist_pt_ty"}).text("Disturbance Type: ").append($("<select>", {class:"form-control", name:"dist_pt_ty"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Dumpsite"}).text("Dumpsite")).append($("<option>", {value: "Fire Ring"}).text("Fire Ring")).append($("<option>", {value: "Graffiti"}).text("Graffiti")).append($("<option>", {value: "Plant Collection"}).text("Plant Collection")).append($("<option>", {value: "Mine Shaft"}).text("Mine Shaft")).append($("<option>", {value: "Shooting Range"}).text("Shooting Range")).append($("<option>", {value: "Bike Trail"}).text("Location along Bike Trail")).append($("<option>", {value: "Campsite"}).text("Campsite")).append($("<option>", {value: "Incursion"}).text("Incursion")).append($("<option>", {value: "Hillclimb"}).text("Hillclimb")).append($("<option>", {value: "*Other - See Notes*"}).text("*Other - See Notes*")))
            break;
        case 'dist_sever':
            return $("<label>", {for: "dist_sever"}).text("Disturbance Severity: ").append($("<input>", {class: "form-control", name:"dist_sever", type:"text"}))
            break;
        case 'dist_use':
            return $("<label>", {for:"dist_use"}).text("Disturbance Use: ").append($("<select>", {class:"form-control", name:"dist_use"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Social"}).text("Social")).append($("<option>", {value: "Mine"}).text("Mine")).append($("<option>", {value: "Old utility"}).text("Old utility")).append($("<option>", {value: "Random / Blazed"}).text("Random / Blazed")).append($("<option>", {value: "Gov_Operation"}).text("Gov_Operation")).append($("<option>", {value: "*Other - See Commnets"}).text("*Other - See Commnets")))
            break;
        case 'ecosystem':
            return $("<label>", {for:"ecosystem"}).text("Ecosystem: ").append($("<select>", {class:"form-control", name:"ecosystem"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Alpine"}).text("Alpine")).append($("<option>", {value: "Bristlecone/ Limber Pine"}).text("Bristlecone/ Limber Pine")).append($("<option>", {value: "Mixed Conifer"}).text("Mixed Conifer")).append($("<option>", {value: "Pinon-Juniper"}).text("Pinon-Juniper")).append($("<option>", {value: "Blackbrush/ Shadscale"}).text("Blackbrush/ Shadscale")).append($("<option>", {value: "Riparian"}).text("Riparian")).append($("<option>", {value: "Wetland"}).text("Wetland")).append($("<option>", {value: "Open Water"}).text("Open Water")).append($("<option>", {value: "Spring"}).text("Spring")).append($("<option>", {value: "Spring Channel"}).text("Spring Channel")).append($("<option>", {value: "Dune"}).text("Dune")).append($("<option>", {value: "Mojave Desert Scrub"}).text("Mojave Desert Scrub")))
            break;
        case 'estimate_s':
            return $("<label>", {for: "estimate_s"}).text("Estimated Size: ").append($("<input>", {class: "form-control", name:"estimate_s", type:"text"}))
            break;
        // case 'gid':
        //     return "<label for=\"gid\">GID: <br>\n            <input class=\"form-control\" type=\"text\" name=\"gid\">\n            <br>\n         </label>";
        //     break;
        case 'gps_date':
            var now = new Date();
            var day = ("0" + now.getDate()).slice(-2);
            var month = ("0" + (now.getMonth() + 1)).slice(-2);
            var today = now.getFullYear()+"-"+(month)+"-"+(day);
            return $("<label>", {for: "gps_date"}).text("Date Collected: ").append($("<input>", {class: "form-control", name:"gps_date", type:"date", value: today, required: 'required'}))
            break;
        case 'gps_photo':
            return $("<label>", {for:"gps_photo"}).text("Is there a GPS tagged photo? ").append($("<select>", {class:"form-control", name:"gps_photo"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Yes"}).text("Yes")).append($("<option>", {value: "No"}).text("No")))
            break;
        case 'km_dist':
            return $("<label>", {for: "km_dist"}).text("Km Disturbed: ").append($("<input>", {class: "form-control", name:"km_dist", type:"text"}))
            break;
        case 'km_resto':
            return $("<label>", {for: "km_resto"}).text("Km Restored: ").append($("<input>", {class: "form-control", name:"km_resto", type:"text"}))
            break;
        case 'kmsq_resto':
            return $("<label>", {for: "kmsq_resto"}).text("Km^2 Restored: ").append($("<input>", {class: "form-control", name:"kmsq_resto", type:"text"}))
            break;
        case 'kmqs_resto':
            return $("<label>", {for: "kmqs_resto"}).text("Km^2 Restored: ").append($("<input>", {class: "form-control", name:"kmqs_resto", type:"text"}))
            break;
        case 'miles_dist':
            return $("<label>", {for: "miles_dist"}).text("Miles Disturbed: ").append($("<input>", {class: "form-control", name:"miles_dist", type:"text"}))
            break;
        case 'miles_rest':
            return $("<label>", {for: "miles_rest"}).text("Miles Restored: ").append($("<input>", {class: "form-control", name:"miles_rest", type:"text"}))
            break;
        case 'monitoring':
            return $("<label>", {for:"monitoring"}).text("Monitoring: ").append($("<select>", {class:"form-control", name:"monitoring"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Yes"}).text("Yes")).append($("<option>", {value: "No"}).text("No")))
            break;
        case 'mulch':
            return $("<label>", {for:"mulch"}).text("Mulch: ").append($("<select>", {class:"form-control", name:"mulch"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "None"}).text("None")).append($("<option>", {value: "Verticle"}).text("Verticle")).append($("<option>", {value: "Horizontal"}).text("Horizontal")).append($("<option>", {value: "N/A"}).text("N/A")).append($("<option>", {value: "Both"}).text("Both")))
            break;
        case 'non_list_a':
            return $("<label>", {for:"non_list_a"}).text("Non-listed Species: ").append($("<select>", {class:"form-control", name:"non_list_a"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Yes"}).text("Yes")).append($("<option>", {value: "No"}).text("No")).append($("<option>", {value: "N/A"}).text("N/A*")))
            break;
        // case 'nonlists_a':
        //     return $("<label>", {for:"nonlists_a"}).text("Non-listed Species: ").append($("<select>", {class:"form-control", name:"nonlists_a"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Yes"}).text("Yes")).append($("<option>", {value: "No"}).text("No")).append($("<option>", {value: "N/A"}).text("N/A*")))
        //     break;
        case 'old_dist_c':
            return $("<label>", {for: "old_dist_c"}).text("Old Disturbance Code: ").append($("<input>", {class: "form-control", name:"old_dist_c", type:"text"}))
            break;
        // case 'old_distco':
        //     return $("<label>", {for: "old_distco"}).text("Old Disturbance Code: ").append($("<input>", {class: "form-control", name:"old_distco", type:"text"}))
        //     break;
        case 'photo_azim':
            return $("<label>", {for: "photo_azim"}).text("Which way is photo facing (degrees)? ").append($("<input>", {class: "form-control", name:"photo_azim", type:"number", min:1, max:360}))
            break;
        case 'plant_dama':
            return $("<label>", {for:"plant_dama"}).text("Plant Canopy Damage: ").append($("<select>", {class:"form-control", name:"plant_dama"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "0 - Intact"}).text("0 - Intact")).append($("<option>", {value: "1 - Most symmetrical"}).text("1 - Most symmetrical")).append($("<option>", {value: "2 - Many irregular, few dissected"}).text("2 - Many irregular, few dissected")).append($("<option>", {value: "3 - Many dissected, few highly dissected"}).text("3 - Many dissected, few highly dissected")).append($("<option>", {value: "4 - Many highly dissected, roots exposed"}).text("4 - Many highly dissected, roots exposed")).append($("<option>", {value: "5 - Many with roots exposed or detached"}).text("5 - Many with roots exposed or detached")).append($("<option>", {value: "6 - Denuded"}).text("6 - Denuded")))
            break;
        case 'previously':
            return $("<label>", {for:"previously"}).text("Previously Restored: ").append($("<select>", {class:"form-control", name:"previously"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Yes"}).text("Yes")).append($("<option>", {value: "No"}).text("No")).append($("<option>", {value: "Unknown"}).text("Unknown")))
            break;
        case 'primary_ob':
            return $("<label>", {for: "primary_ob"}).text("Who collected the data? ").append($("<input>", {class: "form-control", name:"primary_ob", type:"text", required: 'required'}))
            break;
        case 'project_na':
            return $("<label>", {for: "project_na"}).text("Project Name: ").append($("<input>", {class: "form-control", name:"project_na", type:"text"}))
            break;
        case 'qa_qc':
            return $("<label>", {for: "qa_qc"}).text("QA/QC: ").append($("<input>", {class: "form-control", name:"qa_qc", type:"text"}))
            break;
        // case 'region':
        //     return $("<label>", {for:"barrier_in"}).text("Barrier Installed: ").append($("<select>", {class:"form-control", name:"barrier_in"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Yes"}).text("Yes")).append($("<option>", {value: "No"}).text("No")).append($("<option>", {value: "N/A"}).text("N/A")))
        //     return "<label for=\"region\">\n            Region: <br>\n            <select class=\"form-control\" name=\"region\">\n               <option value=\"select\"></option>\n               <option value=\"Amargosa Desert E\">Amargosa Desert E</option>\n               <option value=\"Amargosa Desert W\">Amargosa Desert W</option>\n               <option value=\"Black Mt Area\">Black Mt Area</option>\n               <option value=\"California Wash\">California Wash</option>\n               <option value=\"Colorado Valley\">Colorado Valley</option>\n               <option value=\"Coyote Springs Valley\">Coyote Springs Valley</option>\n               <option value=\"Crater Flat\">Crater Flat</option>\n               <option value=\"Eldorado Valley\">Eldorado Valley</option>\n               <option value=\"Forty-mile Canyon\">Forty-mile Canyon</option>\n               <option value=\"Frenchman Flat\">Frenchman Flat</option>\n               <option value=\"Garnet Valley\">Garnet Valley</option>\n               <option value=\"Gold Butte Area\">Gold Butte Area</option>\n               <option value=\"Greasewood Basin\">Greasewood Basin</option>\n               <option value=\"Hidden Valley N\">Hidden Valley N</option>\n               <option value=\"Hidden Valley S\">Hidden Valley S</option>\n               <option value=\"Indian Springs Valley N\">Indian Springs Valley N</option>\n               <option value=\"Indian Springs Valley S\">Indian Springs Valley S</option>\n               <option value=\"Ivanpah N\">Ivanpah N</option>\n               <option value=\"Ivanpah S\">Ivanpah S</option>\n               <option value=\"Jean Lake Valley\">Jean Lake Valley</option>\n               <option value=\"Las Vegas Valley\">Las Vegas Valley</option>\n               <option value=\"Meadow Valley Wash Upper\">Meadow Valley Wash Upper</option>\n               <option value=\"Meadow Valley Wash Lower\">Meadow Valley Wash Lower</option>\n               <option value=\"Mercury Valley\">Mercury Valley</option>\n               <option value=\"Mesquite Valley\">Mesquite Valley</option>\n               <option value=\"Moapa Valley\">Moapa Valley</option>\n               <option value=\"Muddy River Springs Area\">Muddy River Springs Area</option>\n               <option value=\"Pahrump Valley\">Pahrump Valley</option>\n               <option value=\"Piute Valley\">Piute Valley</option>\n               <option value=\"Rock Valley\">Rock Valley</option>\n               <option value=\"Three Lakes Valley N\">Three Lakes Valley N</option>\n               <option value=\"Three Lakes Valley S\">Three Lakes Valley S</option>\n               <option value=\"Tikapoo Valley\">Tikapoo Valley</option>\n               <option value=\"Virgin River Valley\">Virgin River Valley</option>\n            </select>\n            <br>\n         </label>";
        //     break;
        // case 'regions':
        //     return $("<label>", {for:"barrier_in"}).text("Barrier Installed: ").append($("<select>", {class:"form-control", name:"barrier_in"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Yes"}).text("Yes")).append($("<option>", {value: "No"}).text("No")).append($("<option>", {value: "N/A"}).text("N/A")))
        //     return "<label for=\"regions\">\n            Regions: <br>\n            <select class=\"form-control\" name=\"regions\">\n               <option value=\"select\"></option>\n               <option value=\"Amargosa Desert E\">Amargosa Desert E</option>\n               <option value=\"Amargosa Desert W\">Amargosa Desert W</option>\n               <option value=\"Black Mt Area\">Black Mt Area</option>\n               <option value=\"California Wash\">California Wash</option>\n               <option value=\"Colorado Valley\">Colorado Valley</option>\n               <option value=\"Coyote Springs Valley\">Coyote Springs Valley</option>\n               <option value=\"Crater Flat\">Crater Flat</option>\n               <option value=\"Eldorado Valley\">Eldorado Valley</option>\n               <option value=\"Forty-mile Canyon\">Forty-mile Canyon</option>\n               <option value=\"Frenchman Flat\">Frenchman Flat</option>\n               <option value=\"Garnet Valley\">Garnet Valley</option>\n               <option value=\"Gold Butte Area\">Gold Butte Area</option>\n               <option value=\"Greasewood Basin\">Greasewood Basin</option>\n               <option value=\"Hidden Valley N\">Hidden Valley N</option>\n               <option value=\"Hidden Valley S\">Hidden Valley S</option>\n               <option value=\"Indian Springs Valley N\">Indian Springs Valley N</option>\n               <option value=\"Indian Springs Valley S\">Indian Springs Valley S</option>\n               <option value=\"Ivanpah N\">Ivanpah N</option>\n               <option value=\"Ivanpah S\">Ivanpah S</option>\n               <option value=\"Jean Lake Valley\">Jean Lake Valley</option>\n               <option value=\"Las Vegas Valley\">Las Vegas Valley</option>\n               <option value=\"Meadow Valley Wash Upper\">Meadow Valley Wash Upper</option>\n               <option value=\"Meadow Valley Wash Lower\">Meadow Valley Wash Lower</option>\n               <option value=\"Mercury Valley\">Mercury Valley</option>\n               <option value=\"Mesquite Valley\">Mesquite Valley</option>\n               <option value=\"Moapa Valley\">Moapa Valley</option>\n               <option value=\"Muddy River Springs Area\">Muddy River Springs Area</option>\n               <option value=\"Pahrump Valley\">Pahrump Valley</option>\n               <option value=\"Piute Valley\">Piute Valley</option>\n               <option value=\"Rock Valley\">Rock Valley</option>\n               <option value=\"Three Lakes Valley N\">Three Lakes Valley N</option>\n               <option value=\"Three Lakes Valley S\">Three Lakes Valley S</option>\n               <option value=\"Tikapoo Valley\">Tikapoo Valley</option>\n               <option value=\"Virgin River Valley\">Virgin River Valley</option>\n            </select>\n            <br>\n         </label>";
        //     break;
        // case 'resto_act':
        //     return $("<label>", {for:"resto_act"}).text("Restoration Activity: ").append($("<select>", {class:"form-control", name:"resto_act"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Fire Ring Removal"}).text("Fire Ring Removal")).append($("<option>", {value: "Graffiti Removal"}).text("Graffiti Removal")).append($("<option>", {value: "Garbage Removal"}).text("Garbage Removal")).append($("<option>", {value: "Outplanting"}).text("Outplanting")).append($("<option>", {value: "Transplanting"}).text("Transplanting")).append($("<option>", {value: "*Other - See Comments"}).text("*Other - See Comments")))
        //     break;
        case 'resto_acti':
            return $("<label>", {for:"resto_acti"}).text("Restoration Activity: ").append($("<select>", {class:"form-control", name:"resto_acti"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Fire Ring Removal"}).text("Fire Ring Removal")).append($("<option>", {value: "Graffiti Removal"}).text("Graffiti Removal")).append($("<option>", {value: "Garbage Removal"}).text("Garbage Removal")).append($("<option>", {value: "Outplanting"}).text("Outplanting")).append($("<option>", {value: "Transplanting"}).text("Transplanting")).append($("<option>", {value: "*Other - See Comments"}).text("*Other - See Comments")))
            break;
        case 'resto_code':
            return $("<label>", {for: "resto_code"}).text("Restoration Code: ").append($("<input>", {class: "form-control", name:"resto_code", type:"text", required: 'required'}))
            break;
        case 'secondary_':
            return $("<label>", {for: "secondary_"}).text("Who was with you? ").append($("<input>", {class: "form-control", name:"secondary_", type:"text"}))
            break;
        case 'shape_area':
            return $("<label>", {for: "shape_area"}).text("Shape Area: ").append($("<input>", {class: "form-control", name:"shape_area", type:"text"}))
            break;
        case 'shape_star':
            return $("<label>", {for: "shape_star"}).text("Shape Star: ").append($("<input>", {class: "form-control", name:"shape_star", type:"text"}))
            break;
        case 'signed':
            return $("<label>", {for:"signed"}).text("Signed: ").append($("<select>", {class:"form-control", name:"signed"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Yes"}).text("Yes")).append($("<option>", {value: "No"}).text("No")).append($("<option>", {value: "N/A"}).text("N/A")))
            break;
        case 'site_stabi':
            return $("<label>", {for:"site_stabi"}).text("Site Stability: ").append($("<select>", {class:"form-control", name:"site_stabi"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Unstable"}).text("Unstable")).append($("<option>", {value: "Poor"}).text("Poor")).append($("<option>", {value: "Moderate"}).text("Moderate")).append($("<option>", {value: "Good"}).text("Good")).append($("<option>", {value: "Stable"}).text("Stable")))
            break;
        case 'site_vulne':
            return $("<label>", {for:"site_vulne"}).text("Site Vulnerability: ").append($("<select>", {class:"form-control", name:"site_vulne"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Low"}).text("Low")).append($("<option>", {value: "Low/ Medium"}).text("Low/ Medium")).append($("<option>", {value: "Medium"}).text("Medium")).append($("<option>", {value: "Medium/ High"}).text("Medium/ High")).append($("<option>", {value: "High"}).text("High")).append($("<option>", {value: "Not Characterized"}).text("Not Characterized")))
            break;
        case 'sqft_resto':
            return $("<label>", {for: "sqft_resto"}).text("Ft^2 Restored: ").append($("<input>", {class: "form-control", name:"sqft_resto", type:"text"}))
            break;
        case 'soil_vulne':
            return $("<label>", {for:"soil_vulne"}).text("Soil Vulnerability: ").append($("<select>", {class:"form-control", name:"soil_vulne"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Low"}).text("Low")).append($("<option>", {value: "Low/ Medium"}).text("Low/ Medium")).append($("<option>", {value: "Medium"}).text("Medium")).append($("<option>", {value: "Medium/ High"}).text("Medium/ High")).append($("<option>", {value: "High"}).text("High")).append($("<option>", {value: "Not Characterized"}).text("Not Characterized")))
            break;
        case 't_e_specie':
            return $("<label>", {for:"t_e_specie"}).text('Are Threatened or Endangered Species impacted? (If "Yes" include species names in comments)').append($("<select>", {class:"form-control", name:"t_e_specie", required: 'required'}).append($("<option>", {value: "Yes", selected: "selected"}).text("Yes")).append($("<option>", {value: "No"}).text("No")))
            break;
        case 'te_act':
            return $("<label>", {for:"te_act"}).text("Threatened or Endangered Species Activity: ").append($("<select>", {class:"form-control", name:"te_act"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Yes"}).text("Yes")).append($("<option>", {value: "No"}).text("No")).append($("<option>", {value: "N/A"}).text("N/A*")))
            break;
        case 'te_action':
            return $("<label>", {for:"te_action"}).text("T&E Species: ").append($("<select>", {class:"form-control", name:"te_action"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Yes"}).text("Yes")).append($("<option>", {value: "No"}).text("No")))
            break;
        case 'treated':
            return $("<label>", {for:"treated"}).text("Was the disturbance treated? ").append($("<select>", {class:"form-control", name:"treated"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Yes"}).text("Yes")).append($("<option>", {value: "No"}).text("No*")))
            break;
        case 'treatment_':
            return $("<label>", {for:"treatment_"}).text("Treatment Type: ").append($("<select>", {class:"form-control", name:"treatment_"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Active"}).text("Active")).append($("<option>", {value: "Passive"}).text("Passive")))
            break;
        case 'type':
            return $("<label>", {for:"type"}).text("Type: ").append($("<select>", {class:"form-control", name:"type"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "One-track"}).text("One-track")).append($("<option>", {value: "Two-track"}).text("Two-track")).append($("<option>", {value: "Random"}).text("Random")).append($("<option>", {value: "Road"}).text("Road")).append($("<option>", {value: "*Other - See Comments"}).text("*Other - See Comments")))
            break;
        case 'undist_cru':
            return $("<label>", {for:"undist_cru"}).text("Undisturbed Crust: ").append($("<select>", {class:"form-control", name:"undist_cru"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "0 - No Crust"}).text("0 - No Crust")).append($("<option>", {value: "1 - Alkali"}).text("1 - Alkali")).append($("<option>", {value: "2 - Cyano-patchy"}).text("2 - Cyano-patchy")).append($("<option>", {value: "3 - Cyano-continuous"}).text("3 - Cyano-continuous")).append($("<option>", {value: "4 - Lichen-patchy"}).text("4 - Lichen-patchy")).append($("<option>", {value: "5 - Lichen-continuous"}).text("5 - Lichen-continuous")))
            break;
        case 'use_freq':
            return $("<label>", {for:"use_freq"}).text("Frequent Use: ").append($("<select>", {class:"form-control", name:"use_freq"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Yes"}).text("Yes")).append($("<option>", {value: "No"}).text("No")))
            break;
        case 'use_recent':
            return $("<label>", {for:"use_recent"}).text("Recent Use: ").append($("<select>", {class:"form-control", name:"use_recent"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "Yes"}).text("Yes")).append($("<option>", {value: "No"}).text("No")))
            break;
        case 'visibility':
            return $("<label>", {for:"visibility"}).text("Visibility: ").append($("<select>", {class:"form-control", name:"visibility"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "High"}).text("High")).append($("<option>", {value: "Medium"}).text("Medium")).append($("<option>", {value: "Low"}).text("Low")))
            break;
        case 'width':
            return $("<label>", {for:"width"}).text("Width: ").append($("<select>", {class:"form-control", name:"width"}).append($("<option>", {selected: "selected"})).append($("<option>", {value: "1 - 2 ft - Dirt Bike"}).text("1 - 2 ft - Dirt Bike")).append($("<option>", {value: "2 - 4 ft - ATV"}).text("2 - 4 ft - ATV")).append($("<option>", {value: "3 - 6 ft - Vehicle"}).text("3 - 6 ft - Vehicle")).append($("<option>", {value: "4 - > 6ft"}).text("4 - > 6ft")).append($("<option>", {value: "*Other - See Notes"}).text("*Other - See Notes")))
            break;
        default:
            console.log(part);
    }
}