  console.log("submissions")
  const db = new Dexie('SubmissionForms');

  db.version(1).stores({
    barrierSub: '++id, type, geometry',
    distLineSub: '++id, type, geometry',
    distPointSub: '++id, type, geometry',
    distPolySub: '++id, type, geometry',
    restoLineSub: '++id, type, geometry',
    restoPointSub: '++id, type, geometry',
    restoPolySub: '++id, type, geometry'
  });
  db.open().then(function (db) {
    console.log('Opened Submission Forms DB');
    //console.log(db);
  }).catch(function (err) {
    console.log(err)
  });
  

$(document).ready(function () {
  "use strict";
  
  $(createForms(null, [$('<br>'),$("<input>", {type:"submit", class:"btn btn-primary", value: "Submit"})])).appendTo('#sidebar2');
  var changeForm = createForms("Edit",[$('<br>'),$("<input>", {type:"submit", class:"btn btn-primary", value: "Submit"})]);
  
  $( "select[name='agency']" ).change(function(e) {
    var agencyID = null;
    if (e.currentTarget.value == 0)
      agencyID = 'BLM';
    else if (e.currentTarget.value == 1)
      agencyID = 'NPS';
    else if (e.currentTarget.value == 2)
      agencyID = 'FS';
    else if (e.currentTarget.value == 3)
      agencyID = 'FWS';
    else
      agencyID = null;
    var newDate = new Date();
    var newDay = ("0" + newDate.getDate()).slice(-2);
    var newMonth = ("0" + (newDate.getMonth() + 1)).slice(-2);
    var currDate = newDate.getFullYear()+(newMonth)+(newDay);
    $( "input[name='dist_code']" ).val(agencyID+"-"+currDate+"-"+newDate.getHours()+newDate.getMinutes()+("0"+newDate.getSeconds()).slice(-2));
    $( "input[name='resto_code']" ).val(agencyID+"-"+currDate+"-"+newDate.getHours()+newDate.getMinutes()+("0"+newDate.getSeconds()).slice(-2));
  });

  function getDB(){
    return db;
  }
  
  function collectData(form) {
    const obj = {};
    $(form).serializeArray().reduce(function(i, item) {
       if (item.value === '' || item.value === 'select') {
          obj[item.name.replace('_Edit','')] = null;
       } else if (item.name === 'gid_Edit' || item.name === 'agency_Edit' || item.name === 'dist_sever_Edit' || item.name === 'photo_azim_Edit') {
          obj[item.name.replace('_Edit','')] = parseInt(item.value);
       } else if (item.name === 'acres_rest_Edit' || item.name === 'kmsq_resto_Edit' || item.name === 'shape_star_Edit' || item.name === 'estimate_s_Edit') {
          obj[item.name.replace('_Edit','')] = parseFloat(item.value);
       } else if (item.name === 'barr_miles_Edit' || item.name === 'bar_km_Edit' || item.name === 'miles_dist_Edit' || item.name === 'km_dist_Edit') {
          obj[item.name.replace('_Edit','')] = parseFloat(item.value);
       } else if (item.name === 'miles_rest_Edit' || item.name === 'km_resto_Edit' || item.name === 'shape_stle_Edit' || item.name === 'shape_leng_Edit') {
          obj[item.name.replace('_Edit','')] = parseFloat(item.value);
       } else if (item.name === 'geom') {
          // do nothing
       } else {
          obj[item.name.replace('_Edit','')] = item.value;
       }
    }, {});
    return obj;
    
  }
  function editForm(data, dataType, index){
    //console.log(data);
    $("#editSaved").css("display", "block");
    $("#editSaved").html(changeForm);
    //console.log(data);
      // Waits for form to be loaded before populating Data
      setTimeout(function(){ 
        var formName = null;
        switch (dataType) {
          case 'restoPoints':
            createLayerEdit(data, 'Restoration Points')
            formName = "restoPointFormEdit";
            break;
          case 'restoPolys':
            createLayerEdit(data, 'Restoration Polygon')
            formName = "restoPolyFormEdit";
            break;
          case 'restoLines':
            createLayerEdit(data, 'Restoration Lines')
            formName = "restoLineFormEdit";
            break;
          case 'barriers':
            createLayerEdit(data, 'Barrier')
            formName = "barrierFormEdit";
            break;
          case 'distPoints':
            createLayerEdit(data, 'Disturbance Points')
            formName = "distPointFormEdit";
            break;
          case 'distPolys':
            createLayerEdit(data, 'Disturbance Polygon')
            formName = "distPolyFormEdit";
            break;
          case 'distLines':
            createLayerEdit(data, 'Disturbance Lines')
            formName = "distLineFormEdit";
            break;
          
        }
        
        $.each(data.properties, function(name, val){
          var $el = $('#' +formName + ' [name="'+name+'"]'), type = $el.attr('type');
          switch(type){
            case 'checkbox':
              $el.attr('checked', 'checked');
            break;
            case 'radio':
              $el.filter('[value="'+val+'"]').attr('checked', 'checked');
              break;
            default:
              if (val != null && val != '')
                $el.val(val);
            }
        }); 
        $('#restoPointFormEdit').toggle(
          dataType === 'restoPoints'
        );
        $('#restoPolyFormEdit').toggle(
          dataType === 'restoPolys'
        );
        $('#restoLineFormEdit').toggle(
          dataType === 'restoLines'
        );
        $('#barrierFormEdit').toggle(
          dataType === 'barriers'
        );
        $('#distPointFormEdit').toggle(
          dataType === 'distPoints'
        );
        $('#distPolyFormEdit').toggle(
          dataType === 'distPolys'
        );
        $('#distLineFormEdit').toggle(
          dataType === 'distLines'
        );
        
        function saveEditedForm(db, formData) {
          db.toArray(function (records) {
            const id = records[index].id;
            const newRecord = records[index];
            newRecord.properties = formData;
            //newRecord.properties.geom = records[index].properties.geom
            //console.log(newRecord);
            if (newShapeGeom == null) {
              newRecord.properties.geom = records[index].properties.geom
              newRecord.geometry = records[index].properties.geom
            }
            else {
              newRecord.properties.geom = newShapeGeom;
              newRecord.geometry = newShapeGeom;
            }
            db.delete(id);
            db.add(newRecord)
            .then(function (data) {
              console.log('Form updated: ' + data);
              loadSubs();
            })
            .catch(Dexie.BulkError, function (err) {
              console.warn(err);
            });
          });
          $("#editSaved").css("display", "none");
          $("#savedContent").css("display", "block");
          loadSubs();
        }
        
        $("#restoPointFormEdit").on("submit", function(event) {
          event.preventDefault();
          saveEditedForm(db.restoPointSub, collectData('#restoPointFormEdit'));
          //console.log(currLayer)
          currLayer.editing.disable();
          map.removeLayer(currLayer);
        });
        $("#restoPolyFormEdit").on("submit", function(event) {
          event.preventDefault();
          saveEditedForm(db.restoPolySub, collectData('#restoPolyFormEdit'));
          currLayer.editing.disable();
          map.removeLayer(currLayer);
        });
        $("#restoLineFormEdit").on("submit", function(event) {
          event.preventDefault();
          saveEditedForm(db.restoLineSub, collectData('#restoLineFormEdit'));
          currLayer.editing.disable();
          map.removeLayer(currLayer);
        });
        $("#barrierFormEdit").on("submit", function(event) {
          event.preventDefault();
          saveEditedForm(db.barrierSub, collectData('#barrierFormEdit'));
          currLayer.editing.disable();
          map.removeLayer(currLayer);
        });
        $("#distPointFormEdit").on("submit", function(event) {
          event.preventDefault();
          saveEditedForm(db.distPointSub, collectData('#distPointFormEdit'));
          currLayer.editing.disable();
          map.removeLayer(currLayer);
        });
        $("#distPolyFormEdit").on("submit", function(event) {
          event.preventDefault();
          saveEditedForm(db.distPolySub, collectData('#distPolyFormEdit'));
          currLayer.editing.disable();
          map.removeLayer(currLayer);
        });
        $("#distLineFormEdit").on("submit", function(event) {
          event.preventDefault();
          saveEditedForm(db.distLineSub, collectData('#distLineFormEdit'));
          currLayer.editing.disable();
          map.removeLayer(currLayer);
        });
    }, 400);
  }
  function getTypeName(name){
    switch (name){
      case 'barrierSub':
        return 'Barrier'
      case 'distLineSub':
        return 'Disturbance Line'
      case 'distPointSub':
        return 'Disturbance Point'
      case 'distPolySub':
        return 'Disturbance Polygon'
      case 'restoLineSub':
        return 'Restoration Line'
      case 'restoPointSub':
        return 'Restoration Point'
      case 'restoPolySub':
        return 'Restoration Polygon'
    }
  }
  function appendSubTable(tableName, data, index){
    var row = $("<tr>").append(
                          "<td>"+getTypeName(tableName)+"</td>" +
                          "<td>"+data.properties.region+"</td>" +
                          "<td>"+data.properties.gps_date+"</td>")
                       .click(function(){
                          $("#savedContent").css("display", "none");
                          editForm(data,tableName.replace("Sub", "s"), index);
                       });
    $("#saved").append(row)
  }
  function loadSubs() {
    $("#saved").html("");
    db["barrierSub"].toArray(function(array){
      array.forEach(function(data, index){
        appendSubTable("barrierSub", data, index);
      })
    })
    db["distLineSub"].toArray(function(array){
      array.forEach(function(data, index){
        appendSubTable("distLineSub", data, index);
      })
    })
    db["distPointSub"].toArray(function(array){
      array.forEach(function(data, index){
        appendSubTable("distPointSub", data, index);
      })
    })
    db["distPolySub"].toArray(function(array){
      array.forEach(function(data, index){
        appendSubTable("distPolySub", data, index);
      })
    })
    db["restoLineSub"].toArray(function(array){
      array.forEach(function(data, index){
        appendSubTable("restoLineSub", data, index);
      })
    })
    db["restoPointSub"].toArray(function(array){
      array.forEach(function(data, index){
        appendSubTable("restoPointSub", data, index);
      })
    })
    db["restoPolySub"].toArray(function(array){
      array.forEach(function(data, index){
        appendSubTable("restoPolySub", data, index);
      })
    })
    
  }
  loadSubs();
  
  $(document).on('click', "#sync", function () {
    if(!loggedIn){
      console.log('Not logged in')
      popupMessage('Please login to submit');
      return;
    }
    console.log('Synchronizing...');
    db.barrierSub.count(function (count) {
      if (count > 0) {
        db.barrierSub.toArray(function (data) {
          // temporary fix for bug not saving crs when saving submission
          for (var i = 0; i < data.length; i++) {
            if (data[i].geometry.crs == null){
              data[i]['geometry']["crs"] = {"type": "name", "properties": {"name": "EPSG:4326"}};
              data[i]["properties"]["geom"] = data[i]['geometry'];
            }
          }
          $.ajax({
            type: "POST",
            url: '/barrierFormSubmit',
            contentType: 'application/json',
            data: JSON.stringify(data),
            dataType: "json",
            success: function (data) {
              db.barrierSub.clear();
              loadSubs();
              
              console.log(data);
            }
          })
        })
          .then(function () {
            console.log('submitted barrier indexedDB')
          })
          .catch(function (err) {
            console.log(err)
          })
      }
    });
    db.distLineSub.count(function (count) {
      if (count > 0) {
        db.distLineSub.toArray(function (data) {
          // temporary fix for bug not saving crs when saving submission
          for (var i = 0; i < data.length; i++) {
            if (data[i].geometry.crs == null){
              data[i]['geometry']["crs"] = {"type": "name", "properties": {"name": "EPSG:4326"}};
              data[i]["properties"]["geom"] = data[i]['geometry'];
            }
          }
          $.ajax({
            type: "POST",
            url: "/distLineFormSubmit",
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (data) {
              db.distLineSub.clear();
              loadSubs();
              console.log(data)
            }
          })
        })
          .then(function () {
            console.log('submitted distLine indexedDB')
          })
          .catch(function (err) {
            console.log(err)
          })
      }
    });
    db.distPointSub.count(function (count) {
      if (count > 0) {
        db.distPointSub.toArray(function (data) {
          // temporary fix for bug not saving crs when saving submission
          for (var i = 0; i < data.length; i++) {
            if (data[i].geometry.crs == null){
              data[i]['geometry']["crs"] = {"type": "name", "properties": {"name": "EPSG:4326"}};
              data[i]["properties"]["geom"] = data[i]['geometry'];
            }
          }
          $.ajax({
            type: "POST",
            url: "/distPointFormSubmit",
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (data) {
              db.distPointSub.clear();
              loadSubs();
              console.log(data)
            }
          })
        })
          .then(function () {
            console.log('submitted distPoint indexedDB')
          })
          .catch(function (err) {
            console.log(err)
          })
      }
    });
    db.distPolySub.count(function (count) {
      if (count > 0) {
        db.distPolySub.toArray(function (data) {
          // temporary fix for bug not saving crs when saving submission
          for (var i = 0; i < data.length; i++) {
            if (data[i].geometry.crs == null){
              data[i]['geometry']["crs"] = {"type": "name", "properties": {"name": "EPSG:4326"}};
              data[i]["properties"]["geom"] = data[i]['geometry'];
            }
          }
          $.ajax({
            type: "POST",
            url: "/distPolyFormSubmit",
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (data) {
              db.distPolySub.clear();
              loadSubs();
              console.log(data)
            }
          })
        })
          .then(function () {
            console.log('submitted distPoly indexedDB')
          })
          .catch(function (err) {
            console.log(err)
          })
      }
    });
    db.restoLineSub.count(function (count) {
      if (count > 0) {
        db.restoLineSub.toArray(function (data) {
          // temporary fix for bug not saving crs when saving submission
          for (var i = 0; i < data.length; i++) {
            if (data[i].geometry.crs == null){
              data[i]['geometry']["crs"] = {"type": "name", "properties": {"name": "EPSG:4326"}};
              data[i]["properties"]["geom"] = data[i]['geometry'];
            }
          }
          $.ajax({
            type: "POST",
            url: "/restoLineFormSubmit",
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (data) {
              db.restoLineSub.clear();
              loadSubs();
              console.log(data)
            }
          })
        })
          .then(function () {
            console.log('submitted restoLine indexedDB')
          })
          .catch(function (err) {
            console.log(err)
          })
      }
    });
    db.restoPointSub.count(function (count) {
      if (count > 0) {
        db.restoPointSub.toArray(function (data) {
          // temporary fix for bug not saving crs when saving submission
          for (var i = 0; i < data.length; i++) {
            if (data[i].geometry.crs == null){
              data[i]['geometry']["crs"] = {"type": "name", "properties": {"name": "EPSG:4326"}};
              data[i]["properties"]["geom"] = data[i]['geometry'];
            }
          }
          $.ajax({
            type: "POST",
            url: "/restoPointFormSubmit",
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (data) {
              db.restoPointSub.clear();
              loadSubs();
              console.log(data)
            }
          })
        })
          .then(function () {
            console.log('submitted restoPoint indexedDB')
          })
          .catch(function (err) {
            console.log(err)
          })
      }
    });
    db.restoPolySub.count(function (count) {
      if (count > 0) {
        db.restoPolySub.toArray(function (data) {
          // temporary fix for bug not saving crs when saving submission
          for (var i = 0; i < data.length; i++) {
            if (data[i].geometry.crs == null){
              data[i]['geometry']["crs"] = {"type": "name", "properties": {"name": "EPSG:4326"}};
              data[i]["properties"]["geom"] = data[i]['geometry'];
            }
          }
          $.ajax({
            type: "POST",
            url: "/restoPolyFormSubmit",
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (data) {
              db.restoPolySub.clear();
              loadSubs();
              console.log(data)
            }
          })
        })
          .then(function () {
            console.log('submitted restoPoly indexedDB')
          })
          .catch(function (err) {
            console.log(err)
          })
      }
    })
  });


  $("form").on("submit", function (event) {
    const $this = $(this); // this is the current form that is selected
    event.preventDefault();

    //https://stackoverflow.com/questions/9685177/get-the-id-of-a-form
    //this is grabbing the current form ID on submission
    const thisForm = $this.closest("form").attr("id");
    const form = $this.serializeArray();

    const barrierObj = {},
      barrierArray = [],
      distLineObj = {},
      distLineArray = [],
      distPointObj = {},
      distPointArray = [],
      distPolyObj = {},
      distPolyArray = [],
      restoLineObj = {},
      restoLineArray = [],
      restoPointObj = {},
      restoPointArray = [],
      restoPolyObj = {},
      restoPolyArray = [];

    //idea came from here
    //http://stackoverflow.com/questions/10502093/how-to-reset-a-select-element-with-jquery
    $('#featureType').prop('selectedIndex', 0);
    $('#featureStyle').prop('selectedIndex', 0);
    // idea came from here
    //http://stackoverflow.com/questions/6653556/jquery-javascripts-function-to-clear-all-the-fields-of-a-form
    $this.trigger('reset');
    // idea come from here
    // http://stackoverflow.com/questions/27846286/how-to-set-style-displaynone-using-jquerys-attr-method
    $this.hide();

   
    $(form).each(function (i, field) {
      const fieldValue = field.value;
      const fieldName = field.name;

      if (thisForm === "barrierForm") {
        //https://www.youtube.com/watch?v=Sb8xyCa2p7A this post and the ones below came
        //came from this youtube video
        if (fieldValue === '' || fieldValue === 'select') {
          barrierObj[fieldName] = null;
        } else if (fieldName === 'gid' || fieldName === 'agency' || fieldName === 'photo_azim') {
          barrierObj[fieldName] = parseInt(fieldValue);
        } else if (fieldName === 'barr_miles' || fieldName === 'bar_km' || fieldName === 'shape_stle' ||
          fieldName === 'shape_leng') {
          barrierObj[fieldName] = parseFloat(fieldValue);
        } else {
          barrierObj[fieldName] = fieldValue;
        }
      } else if (thisForm === 'distLineForm') {
        if (fieldValue === '' || fieldValue === 'select') {
          distLineObj[fieldName] = null;
        } else if (fieldName === 'gid' || fieldName === 'agency' || fieldName === 'dist_sever' || fieldName === 'photo_azim') {
          distLineObj[fieldName] = parseInt(fieldValue);
        } else if (fieldName === 'miles_dist' || fieldName === 'km_dist' || fieldName === 'shape_stle' || fieldName === 'shape_leng') {
          distLineObj[fieldName] = parseFloat(fieldValue);
        } else {
          distLineObj[fieldName] = fieldValue;
        }
      } else if (thisForm === 'distPointForm') {
        if (fieldValue === '' || fieldValue === 'select') {
          distPointObj[fieldName] = null;
        } else if (fieldName === 'gid' || fieldName === 'agency' || fieldName === 'photo_azim') {
          distPointObj[fieldName] = parseInt(fieldValue);
        } else if (fieldName === 'estimate_s') {
          distPointObj[fieldName] = parseFloat(fieldValue);
        } else {
          distPointObj[fieldName] = fieldValue;
        }
      } else if (thisForm === 'distPolyForm') {
        if (fieldValue === '' || fieldValue === 'select') {
          distPolyObj[fieldName] = null;
        } else if (fieldName === 'gid' || fieldName === 'agency' || fieldName === 'dist_sever' || fieldName === 'photo_azim') {
          distPolyObj[fieldName] = parseInt(fieldValue);
        } else if (fieldName === 'acres_rest' || fieldName === 'kmsq_resto' || fieldName === 'shape_star' || fieldName === 'shape_stle'
          || fieldName === 'shape_leng' || fieldName === 'shape_area') {
          distPolyObj[fieldName] = parseFloat(fieldValue);
        } else {
          distPolyObj[fieldName] = fieldValue;
        }
      } else if (thisForm === 'restoLineForm') {
        if (fieldValue === '' || fieldValue === 'select') {
          restoLineObj[fieldName] = null;
        } else if (fieldName === 'gid' || fieldName === 'agency' || fieldName === 'photo_azim') {
          restoLineObj[fieldName] = parseInt(fieldValue);
        } else if (fieldName === 'miles_rest' || fieldName === 'km_resto' || fieldName === 'shape_stle' || fieldName === 'shape_leng') {
          restoLineObj[fieldName] = parseFloat(fieldValue);
        } else {
          restoLineObj[fieldName] = fieldValue;
        }
      } else if (thisForm === 'restoPointForm') {
        if (fieldValue === '' || fieldValue === 'select') {
          restoPointObj[fieldName] = null;
        } else if (fieldName === 'gid' || fieldName === 'agency' || fieldName === 'photo_azim') {
          restoPointObj[fieldName] = parseInt(fieldValue);
        } else if (fieldName === 'miles_rest' || fieldName === 'km_resto' || fieldName === 'shape_stle' || fieldName === 'shape_leng') {
          restoPointObj[fieldName] = parseFloat(fieldValue);
        } else {
          restoPointObj[fieldName] = fieldValue;
        }
      } else if (thisForm === 'restoPolyForm') {
        if (fieldValue === '' || fieldValue === 'select') {
          restoPolyObj[fieldName] = null;
        } else if (fieldName === 'gid' || fieldName === 'agency' || fieldName === 'photo_azim') {
          restoPolyObj[fieldName] = parseInt(fieldValue);
        } else if (fieldName === 'acres_rest' || fieldName === 'kmsq_resto' || fieldName === 'shape_star' || fieldName === 'shape_stle'
          || fieldName === 'shape_leng' || fieldName === 'shape_area') {
          restoPolyObj[fieldName] = parseFloat(fieldValue);
        } else {
          restoPolyObj[fieldName] = fieldValue;
        }
      }
    });

    if (Object.keys(barrierObj).length > 0) {
      thisLayerJSON["properties"] = barrierObj;
      //thisLayerJSON['geometry']['type'] = 'MultiLineString';
      thisLayerJSON['geometry']["crs"] = {"type": "name", "properties": {"name": "EPSG:4326"}};
      thisLayerJSON["properties"]["geom"] = thisLayerJSON['geometry'];

      barrierArray.push(thisLayerJSON);

      db.barrierSub.bulkPut(barrierArray)
        .then(function (data) {
          console.log('Barrier form submitted: ' + data);
        })
        .catch(Dexie.BulkError, function (err) {
          console.warn(err);
        })
    } else if (Object.keys(distLineObj).length > 0) {
      thisLayerJSON["properties"] = distLineObj;
      //thisLayerJSON['geometry']['type'] = 'MultiLineString';
      thisLayerJSON['geometry']["crs"] = {"type": "name", "properties": {"name": "EPSG:4326"}};
      thisLayerJSON["properties"]["geom"] = thisLayerJSON['geometry'];

      distLineArray.push(thisLayerJSON);

      db.distLineSub.bulkPut(distLineArray)
        .then(function (data) {
          console.log('Disturbance Line form submitted: ' + data);
        })
        .catch(Dexie.BulkError, function (err) {
          console.warn(err);
        });
    } else if (Object.keys(distPointObj).length > 0) {

      thisLayerJSON["properties"] = distPointObj;
      //thisLayerJSON['geometry']['type'] = 'MultiLineString';
      thisLayerJSON['geometry']["crs"] = {"type": "name", "properties": {"name": "EPSG:4326"}};
      thisLayerJSON["properties"]["geom"] = thisLayerJSON['geometry'];

      distPointArray.push(thisLayerJSON);
      db.distPointSub.bulkPut(distPointArray)
        .then(function (data) {
          console.log('Disturbance Point form submitted: ' + data);
        })
        .catch(Dexie.BulkError, function (err) {
          console.warn(err);
        });
    } else if (Object.keys(distPolyObj).length > 0) {
      thisLayerJSON["properties"] = distPolyObj;
      //thisLayerJSON['geometry']['type'] = 'MultiPolygon';
      thisLayerJSON['geometry']["crs"] = {"type": "name", "properties": {"name": "EPSG:4326"}};
      thisLayerJSON["properties"]["geom"] = thisLayerJSON['geometry'];

      distPolyArray.push(thisLayerJSON);

      db.distPolySub.bulkPut(distPolyArray)
        .then(function (data) {
          console.log('Disturbance Polygon form submitted: ' + data);
        })
        .catch(Dexie.BulkError, function (err) {
          console.warn(err);
        });
    } else if (Object.keys(restoLineObj).length > 0) {
      thisLayerJSON["properties"] = restoLineObj;
      //thisLayerJSON['geometry']['type'] = 'MultiLineString';
      thisLayerJSON['geometry']["crs"] = {"type": "name", "properties": {"name": "EPSG:4326"}};
      thisLayerJSON["properties"]["geom"] = thisLayerJSON['geometry'];

      restoLineArray.push(thisLayerJSON);

      db.restoLineSub.bulkPut(restoLineArray)
        .then(function (data) {
          console.log('Restoration Line form submitted: ' + data);
        })
        .catch(Dexie.BulkError, function (err) {
          console.warn(err);
        });
    } else if (Object.keys(restoPointObj).length > 0) {
      thisLayerJSON["properties"] = restoPointObj;
      //thisLayerJSON['geometry']['type'] = 'MultiLineString';
      thisLayerJSON['geometry']["crs"] = {"type": "name", "properties": {"name": "EPSG:4326"}};
      thisLayerJSON["properties"]["geom"] = thisLayerJSON['geometry'];

      restoPointArray.push(thisLayerJSON);
      console.log(restoPointArray);
      db.restoPointSub.bulkPut(restoPointArray)
        .then(function (data) {
          console.log('Restoration Point form submitted: ' + data);
        })
        .catch(Dexie.BulkError, function (err) {
          console.warn(err);
        });
    } else if (Object.keys(restoPolyObj).length > 0) {
      thisLayerJSON["properties"] = restoPolyObj;
      //thisLayerJSON['geometry']['type'] = 'Polygon';
      thisLayerJSON['geometry']["crs"] = {"type": "name", "properties": {"name": "EPSG:4326"}};
      //thisLayerJSON['geometry']['coordinates'][0] = thisLayerJSON['geometry']['coordinates'];
      thisLayerJSON["properties"]["geom"] = thisLayerJSON['geometry'];

      restoPolyArray.push(thisLayerJSON);

      db.restoPolySub.bulkPut(restoPolyArray)
        .then(function (data) {
          console.log('Restoration Polygon form submitted: ' + data);
        })
        .catch(Dexie.BulkError, function (err) {
          console.warn(err);
        });
    }
    sidebar.open('savedSubs');
    map.removeLayer(thisLayer);
    document.getElementById('step1').style.display = 'block';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'none';
    loadSubs();
  });
});