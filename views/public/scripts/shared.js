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
    console.log(elem)
    console.log(val)
    $("#searchBy").html(elem.innerText + " ").append($("<span>", {class: "caret"})).val(val);
    
}
function sortProp(a, b) {
    console.log(a, b)
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
        currRecords[currFilter].features.reverse();
        $(col).removeClass("asc").addClass("desc")
    }
    else {
        $(".asc").removeClass("asc");
        $(".desc").removeClass("desc");
        $(col).addClass("asc")
        currRecords[currFilter].features.sort(function(a, b) {
            switch (col.innerText) {
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
    writeTables(currRecords[currFilter])
}

function changePage(change) {
    $("#tableItems").html('')
    pageNumber += change;
    if (pageNumber > Math.ceil(currRecords.overallCount / 10) - 1)
        pageNumber = Math.ceil(currRecords.overallCount / 10) - 1;
    else if (pageNumber < 0)
        pageNumber = 0;
    writeTables(currRecords[currFilter]);
}
