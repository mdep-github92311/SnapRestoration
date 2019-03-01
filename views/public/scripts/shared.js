function getAgency(agency) {
    switch (agency) {
        case 0:
            return "BLM";
            break;
        case 1:
            return "NPS";
            break;
        case 2:
            return "FS";
            break;
        case 3:
            return "FWS";
            break;
        default:
            return "null";
            break;
    }
}
function searchBy(elem, val){
    $("#searchBy").html(elem.innerText + " ").append($("<span>", {class: "caret"})).val(val);
    switch (val) {
        case 'gid':
            $("#searchSelect").hide();
            $("#searchID").show();
            break;
        default:
            getSearchOptions(val)
            $("#searchID").hide();
            $("#searchSelect").show();
    }
}
function getSearchOptions(type){
    $("#searchSelect").empty();
    $("#searchSelect").append($("<option>", {text: "", value: ""}));
    switch (type){
        case 'region': {
            const blmRegions = ['Amargosa Desert E','Amargosa Desert W','Black Mt Area','California Wash','Colorado Valley','Coyote Springs Valley','Crater Flat','Eldorado Valley','Forty-mile Canyon','Frenchman Flat','Garnet Valley','Gold Butte Area','Greasewood Basin','Hidden Valley N','Hidden Valley S','Indian Springs Valley N','Indian Springs Valley S','Ivanpah N','Ivanpah S','Jean Lake Valley','Las Vegas Valley','Meadow Valley Wash Lower','Meadow Valley Wash Upper','Mercury Valley','Mesquite Valley','Moapa Valley','Muddy River Springs Area','Pahrump Valley','Piute Valley','Rock Valley','Three Lakes Valley N','Three Lakes Valley S','Tikapoo Valley','Virgin River Valley'];
            const fsRegions = ['Cold Creek','Kyle Canyon','Lee Canyon','Lovell','Potosi','Stirling','Wheeler','Clark/Wallace Canyon','Trout/Carpenter Canyon'];
            const npsRegions = ['Boulder City','Callville Bay','Cottonwood Cove','Echo Bay','Gold Butte','Government Wash','Katherine','Lakeshore','Overton Beach','Parashant','Pearce Ferry','Temple Bar','Willow Beach'];
            const fwsRegions = ['Ash Meadows','Desert Clark','Desert Lincoln','Pahranagat'];
            const allRegions = blmRegions.concat(npsRegions).concat(fsRegions).concat(fwsRegions).sort();
            for (let reg in allRegions)
                $("#searchSelect").append($("<option>", {text: allRegions[reg], value: allRegions[reg]}));
            break;
        }
        case 'ecosystem': {
            const ecosystems = ["Alpine", "Blackbrush/ Shadscale", "Bristlecone/ Limber Pine", "Dune", "Mixed Conifer", "Mojave Desert Scrub", "Open Water", "Pinon-Juniper", "Riparian", "Spring", "Spring Channel", "Wetland"];
            for (let eco in ecosystems)
                $("#searchSelect").append($("<option>", {text: ecosystems[eco], value: ecosystems[eco]}));
            break;
        }
        case 'agency': {
            $("#searchSelect").append($("<option>", {text: "BLM", value: "BLM"})).append($("<option>", {text: "NPS", value: "NPS"})).append($("<option>", {text: "FS", value: "FS"})).append($("<option>", {text: "FWS", value: "FWS"}))
            break;
        }
  }
}
function sortProp(a, b) {
    if (a === null) {
        return 1;
    }
    else if (b === null) {
        return -1;
    }
    else if (a > b) {
        return 1;
    }
    else if (a < b) {
        return -1;
    }
    else {
        return a - b;
    }
}

function sortHeader(col) {
    if ($(col).hasClass("asc")) {
        shownRecords.features.reverse();
        $(col).removeClass("asc").addClass("desc")
    }
    else {
        $(".asc").removeClass("asc");
        $(".desc").removeClass("desc");
        $(col).addClass("asc")
        shownRecords.features.sort(function(a, b) {
            switch (col.innerText.trim()) {
                case 'GID':
                    return sortProp(a.properties.gid, b.properties.gid);
                case 'Agency':
                    return sortProp(getAgency(a.properties.agency), getAgency(b.properties.agency))
                case 'Region':
                    return sortProp(a.properties.region, b.properties.region)
                case 'Ecosystem':
                    return sortProp(a.properties.ecosystem, b.properties.ecosystem)
            }
        })
    }
    pageNumber = 0;
    writeTables(shownRecords)
}

function changePage(change) {
    $("#tableItems").html('')
    pageNumber += change;
    if (pageNumber > Math.ceil(shownRecords.length / 10) - 1)
        pageNumber = Math.ceil(shownRecords.length / 10) - 1;
    else if (pageNumber < 0)
        pageNumber = 0;
    writeTables(shownRecords);
}
