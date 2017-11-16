// /**
//  * Created by msgis-student on 5/31/2017.
//  */
//
module.exports = function (app) {
  var loopback = require('loopback');
  const bodyParser = require('body-parser');
  const promise = require('bluebird');
//
//   var testQuery = require("/loopback-getting-started/common/javascripts/query.js");
//
  const options = {
    promiseLib: promise
  };
  const pgp = require('pg-promise')(options);

  /* PostgreSQL and PostGIS module and connection setup */
  var pg = require("pg"); // require Postgres module
  var conString = {
    host: 'localhost',
    port: 5432,
    database: 'mdep_leaflet',
    user: 'postgres',
    password: 'mdep'
  };
//"postgres://postgres:anthony@localhost:5432/mip"; // Your Database Connection
  const db = pgp(conString);

  const upsert = require("../../common/javascripts/upsertQuery.js");

  function Inserts(template, data) {
    if (!(this instanceof Inserts)) {
      return new Inserts(template, data);
    }
    this._rawDBType = true;
    this.formatDBType = function () {
      return data.map(d => '(' + pgp.as.format(template, d) + ')').join();
    };
  }

  app.use(bodyParser.json())
    .post('/restoPointFormSubmit', (req, res) => {

      const restoPointUpsert = upsert.restoPointSub;

      const restoPointIndexedDB = req.body;
      var restoPointArray = [];

      for (var o in restoPointIndexedDB) {
        var restoPointProp = [];
        for (var i in restoPointIndexedDB[o].properties) {
          restoPointProp.push(restoPointIndexedDB[o].properties[i]);
        }
        restoPointArray.push(restoPointProp)
      }


      db.none(`INSERT INTO resto_point_sub (gid, agency, region, ecosystem, gps_date, resto_code, resto_acti, comments,
      primary_ob, secondary_, project_na, sqft_resto, gps_photo, photo_azim, previously, qa_qc, geom) VALUES $1` +
        restoPointUpsert, Inserts(`$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        ST_Force2D(ST_GeomFromGeoJSON($17))`, restoPointArray))
        .then(function () {
          console.log('restoPoint forms submitted');
          console.log(restoPointIndexedDB);
          res.status(200)
        })
        .catch(function (err) {
          throw err;
        })
      //       //https://www.youtube.com/watch?v=Sb8xyCa2p7A this post and the ones below came
      //       //came from this youtube video
      //       const restoPointSub = [];
      //       for (let k in req.body) {
      //         if (req.body[k] === '' || req.body[k] === 'select') {
      //           restoPointSub.push(null);
      //         } else if (k === 'gidRPT' || k === 'agencyRPT' || k === 'photo_azimRPT') {
      //           restoPointSub.push(parseInt(req.body[k]));
      //         } else if (k === 'sqft_restoRPT') {
      //           restoPointSub.push(parseFloat(req.body[k]));
      //         } else {
      //           restoPointSub.push(req.body[k]);
      //         }
      //       }
      //       //http://mherman.org/blog/2016/03/13/designing-a-restful-api-with-node-and-postgres/#.WQKwaMZlCHt
      //       // this, along with the other insert into came from the link above as well as the API for PG-Promise
      //       db.none('INSERT INTO resto_point_sub (gid, agency, region, ecosystem, gps_date, resto_code, resto_acti,'
      // + ' comments, primary_ob, secondary_, project_na, sqft_resto, gps_photo, photo_azim, previously, qa_qc) ' +
      // 'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);', restoPointSub)
      // .then(function () { console.log('resto point form submitted'); res.status(200) .json({ status: 'success',
      // message: 'sent resto point query' }) }) .catch(function (err) { throw err; });
    })
    .post('/restoPolyFormSubmit', (req, res) => {
      const restoPolyUpsert = upsert.restoPolySub;

      const restoPolyIndexedDB = req.body;
      var restoPolyArray = [];

      for (var o in restoPolyIndexedDB) {
        var restoPolyProp = [];
        for (var i in restoPolyIndexedDB[o].properties) {
          restoPolyProp.push(restoPolyIndexedDB[o].properties[i]);
        }
        restoPolyArray.push(restoPolyProp)
      }

      db.none(`INSERT INTO resto_polygon_sub (gid, agency, region, ecosystem, resto_code, resto_acti, te_action,
      non_list_a, comments, primary_ob, secondary_, project_na, treatment_, acres_rest, kmsq_resto, gps_date, gps_photo,
      photo_azim, signed, deep_till, barrier_in, mulch, monitoring, previously, shape_star, shape_stle, shape_leng,
      shape_area, geom) VALUES $1` + restoPolyUpsert, Inserts(`$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
      $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, ST_Force2D(ST_GeomFromGeoJSON($28))`, restoPolyArray))
        .then(function () {
          console.log('restoPoly forms submitted');
          console.log(restoPolyIndexedDB);
          res.status(200)
        })
        .catch(function (err) {
          throw err;
        })
      //       //https://www.youtube.com/watch?v=Sb8xyCa2p7A this post and the ones below came
      //       //came from this youtube video
      //       const restoPolySub = [];
      //       for (let k in req.body) {
      //         if (req.body[k] === '' || req.body[k] === 'select') {
      //           restoPolySub.push(null);
      //         } else if (k === 'gidRPY' || k === 'agencyRPY' || k === 'photo_azimRPY') {
      //           restoPolySub.push(parseInt(req.body[k]));
      //         } else if (k === 'acres_restRPY' || k === 'kmsq_restoRPY' || k === 'shape_starRPY' || k ===
      // 'shape_stleRPY'
      //           || k === 'shape_lengRPY' || k === 'shape_areaRPY') {
      //           restoPolySub.push(parseFloat(req.body[k]));
      //         } else {
      //           restoPolySub.push(req.body[k]);
      //         }
      //       }
      //       db.none('INSERT INTO resto_polygon_sub (gid, agency, region, ecosystem, resto_code, resto_acti,
      // te_action,' + ' non_list_a, comments, primary_ob, secondary_, project_na, treatment_, acres_rest, kmsq_resto,'
      // + ' gps_date, gps_photo, photo_azim, signed, deep_till, barrier_in, mulch, monitoring, previously,' + '
      // shape_star, shape_stle, shape_leng, shape_area)' + ' VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
      // $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,' + ' $22, $23, $24, $25, $26, $27, $28);', restoPolySub)
      // .then(function () { console.log('resto poly form submitted'); res.status(200) .json({ status: 'success',
      // message: 'sent resto poly query' }) }) .catch(function (err) { throw err; });
    })
    .post('/restoLineFormSubmit', (req, res) => {
      const restoLineUpSert = upsert.restoLineSub;

      const restoLineIndexedDB = req.body;
      var restoLineArray = [];

      for (var o in restoLineIndexedDB) {
        var restoLineProp = [];
        for (var i in restoLineIndexedDB[o].properties) {
          restoLineProp.push(restoLineIndexedDB[o].properties[i]);
        }
        restoLineArray.push(restoLineProp)
      }

      db.none(`INSERT INTO resto_line_sub (gid, agency, region, ecosystem, gps_date, resto_code, resto_act, te_act,
      nonlists_a, comments, primary_ob, secondary_, project_na, treatment_, signed, mulch, deep_till, barrier_in,
      miles_rest, km_resto, gps_photo, photo_azim, monitoring, previously, qa_qc, shape_stle, shape_leng, geom) VALUES $1`
        + restoLineUpSert, Inserts(`$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24, $25, $26, $27, ST_Force2D(ST_GeomFromGeoJSON($28))`, restoLineArray))
        .then(function () {
          console.log('restoLine forms submitted');
          console.log(restoLineIndexedDB);
          res.status(200)
        })
        .catch(function (err) {
          throw err;
        })
      // //https://www.youtube.com/watch?v=Sb8xyCa2p7A this post and the ones below came //came from this youtube video
      // const restoLineSub = []; for (let k in req.body) { if (req.body[k] === '' || req.body[k] === 'select') {
      // restoLineSub.push(null); } else if (k === 'gidRL' || k === 'agencyRL' || k === 'photo_azimRL') {
      // restoLineSub.push(parseInt(req.body[k])); } else if (k === 'miles_restRL' || k === 'km_restoRL' || k ===
      // 'shape_stleRL' || k === 'shape_lengRL') { restoLineSub.push(parseFloat(req.body[k])); } else {
      // restoLineSub.push(req.body[k]); } } db.none('INSERT INTO resto_line_sub (gid, agency, region, ecosystem,
      // gps_date, resto_code, resto_act,' + ' te_act, nonlists_a, comments, primary_ob, secondary_, project_na,
      // treatment_, signed, mulch,' + ' deep_till, barrier_in, miles_rest, km_resto, gps_photo, photo_azim,
      // monitoring, previously, qa_qc,' + ' shape_stle, shape_leng) ' + 'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,
      // $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,' + ' $22, $23, $24, $25, $26, $27);',
      // restoLineSub) .then(function () { console.log('resto line form submitted'); res.status(200) .json({ status:
      // 'success', message: 'sent resto line query' }) }) .catch(function (err) { throw err; });
    })
    .post('/barrierFormSubmit', (req, res) => {
      const barrierUpsert = upsert.barrierSub;

      const barrierIndexedDB = req.body;
      var barrierArray = [];

      for (var o in barrierIndexedDB) {
        var barrierProperties = [];
        for (var i in barrierIndexedDB[o].properties) {
          barrierProperties.push(barrierIndexedDB[o].properties[i]);
        }
        barrierArray.push(barrierProperties)
      }

      db.none(`INSERT INTO barrier_sub (gid, agency, regions, ecosystem, gps_date, barr_code, barr_actio, barr_type,
           comments, primary_ob, secondary_, project_na, barr_miles, barr_km, previously, gps_photo, photo_azim, qa_qc,
           shape_stle, shape_leng, geom) VALUES $1` + barrierUpsert, Inserts(`$1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
           $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, ST_Force2D(ST_GeomFromGeoJSON($21))`, barrierArray))
        .then(function () {
          console.log('barrier form submitted');
          console.log(barrierIndexedDB);
          res.status(200)
        })
        .catch(function (err) {
          throw err;
        })
    })
    .post('/distPointFormSubmit', (req, res) => {
      const distPointUpSert = upsert.distPointSub;

      const distPointIndexedDB = req.body;
      var distPointArray = [];

      for (var o in distPointIndexedDB) {
        var distPointProp = [];
        for (var i in distPointIndexedDB[o].properties) {
          distPointProp.push(distPointIndexedDB[o].properties[i]);
        }
        distPointArray.push(distPointProp)
      }

      db.none(`INSERT INTO dist_point_sub (gid, agency, region, ecosystem, gps_date, dist_code, use_freq, use_recent,
      dist_pt_ty, accessibil, visibility, comments, primary_ob, secondary_, previously, project_na, estimate_s, treated,
      cultural, t_e_specie, gps_photo, soil_vulne, dist_use, photo_azim, qa_qc, old_distco, geom) VALUES $1` +
        distPointUpSert, Inserts(`$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, 21, $22, $23, $24, $25, $26, ST_Force2D(ST_GeomFromGeoJSON($27))`, distPointArray))
        .then(function () {
          console.log('distPoint form submitted');
          console.log(distPointIndexedDB);
          res.status(200)
        })
        .catch(function (err) {
          throw err;
        })
//       //https://www.youtube.com/watch?v=Sb8xyCa2p7A this post and the ones below came
//       //came from this youtube video
//       const distPointSub = [];
//       for (let k in req.body) {
//         if (req.body[k] === '' || req.body[k] === 'select') {
//           distPointSub.push(null);
//         } else if (k === 'gidDPB' || k === 'agencyDPB' || k === 'photo_azimDPB') {
//           distPointSub.push(parseInt(req.body[k]));
//         } else if (k === 'estimate_sDPB') {
//           distPointSub.push(parseFloat(req.body[k]));
//         } else {
//           distPointSub.push(req.body[k]);
//         }
//       }
//       db.none('INSERT INTO dist_point_sub (gid, agency, region, ecosystem, gps_date, dist_code, use_freq,' +
//         ' use_recent, dist_pt_ty, accessibil, visibility, comments, primary_ob, secondary_, previously,' +
//         ' project_na, estimate_s, treated, cultural, t_e_specie, gps_photo, soil_vulne, dist_use, photo_azim,' +
//         ' qa_qc, old_distco) ' +
//         'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,' +
//         ' $22, $23, $24, $25, $26);', distPointSub)
//         .then(function () {
//           console.log('dist point form submitted');
//           res.status(200)
//             .json({
//               status: 'success',
//               message: 'sent dist point query'
//             });
//         })
//         .catch(function (err) {
//           throw err;
//         });
    })
    .post('/distPolyFormSubmit', (req, res) => {
      const distPolyUpSert = upsert.distPolySub;

      const distPolyIndexedDB = req.body;
      var distPolyArrary = [];

      for (var o in distPolyIndexedDB) {
        var distPolyProp = [];
        for (var i in distPolyIndexedDB[o].properties) {
          distPolyProp.push(distPolyIndexedDB[o].properties[i]);
        }
        distPolyArrary.push(distPolyProp)
      }

      db.none(`INSERT INTO dist_polygon_sub (gid, agency, regions, ecosystem, gps_date, dist_code, dist_use, use_freq,
      use_recent, site_stabi, dist_crust, undist_cru, depth, dist_poly_, plant_dama, assessibil, visibility, comments,
      primary_ob, secondary_, acres_rest, kmsq_resto, treated, dist_sever, cultural, t_e_specie, gps_photo, site_vulne,
      photo_azim, qa_qc, old_distco, shape_star, shape_stle, shape_leng, shape_area, geom) VALUES $1` + distPolyUpSert,
        Inserts(`$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, ST_Force2D(ST_GeomFromGeoJSON($36))`,
          distPolyArrary))
        .then(function () {
          console.log('distPoly forms submitted');
          console.log(distPolyIndexedDB);
          res.status(200)
        })
        .catch(function (err) {
          throw err;
        })
//       //https://www.youtube.com/watch?v=Sb8xyCa2p7A this post and the ones below came
//       //came from this youtube video
//       const distPolySub = [];
//       for (let k in req.body) {
//         if (req.body[k] === '' || req.body[k] === 'select') {
//           distPolySub.push(null);
//         } else if (k === 'gidDBPY' || k === 'agenceyDBPY' || k === 'dist_severDBPY' || k === 'photo_azimDBPY') {
//           distPolySub.push(parseInt(req.body[k]));
//         } else if (k === 'acres_restDBPY' || k === 'kmsq_restoDBPY' || k === 'shape_starDBPY' || k ===
// 'shape_stleDBPY' || k === 'shape_lengDBPY' || k === 'shape_areaDBPY') { distPolySub.push(parseFloat(req.body[k])); }
// else { distPolySub.push(req.body[k]); } } db.none('INSERT INTO dist_polygon_sub (gid, agency, regions, ecosystem,
// gps_date, dist_code, dist_use,' + ' use_freq, use_recent, site_stabi, dist_crust, undist_cru, depth, dist_poly_,
// plant_dama, assessibil,' + ' visibility, comments, primary_ob, secondary_, acres_rest, kmsq_resto, treated,
// dist_sever, cultural,' + ' t_e_specie, gps_photo, site_vulne, photo_azim, qa_qc, old_distco, shape_star, shape_stle,
// shape_leng,' + ' shape_area) ' + 'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
// $17, $18, $19, $20, $21,' + ' $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35);', distPolySub)
// .then(function () { console.log('dist poly form submitted'); res.status(200) .json({ status: 'success', message:
// 'sent dist poly query' }); }) .catch(function (err) { throw err; });
    })
    .post('/distLineFormSubmit', (req, res) => {
      const distLineUpsert = upsert.distLineSub;

      const distLineIndexedDB = req.body;
      var distLineArrary = [];

      for (var o in distLineIndexedDB) {
        var distLineProp = [];
        for (var i in distLineIndexedDB[o].properties) {
          distLineProp.push(distLineIndexedDB[o].properties[i]);
        }
        distLineArrary.push(distLineProp)
      }

      db.none(`INSERT INTO dist_line_sub (gid, agency, region, ecosystem, gps_date, dist_code, dist_use, use_freq,
      use_recent, site_stabi, dist_crust, undist_cru, depth, width, type, plant_dama, accessibil, visibility, comments,
     primary_ob, secondary_, miles_dist, km_dist, treated, dist_sever, cultural, t_e_specie, gps_photo, soil_vulne,
     photo_azim, qa_qc, old_dist_c, shape_stle, shape_leng, geom) VALUES $1` + distLineUpsert, Inserts(`$1, $2, $3, $4,
     $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 21, $22, $23, $24, $25, $26, $27, $28,
     $29, $30, $31, $32, $33, $34, ST_Force2D(ST_GeomFromGeoJSON($35))`,
        distLineArrary))
        .then(function () {
          console.log('distLine forms submitted');
          console.log(distLineIndexedDB);
          res.status(200)
        })
        .catch(function (err) {
          throw err;
        })
// //https://www.youtube.com/watch?v=Sb8xyCa2p7A this post and the ones below came //came from this youtube video const
// distLineSub = []; for (let k in req.body) { if (req.body[k] === '' || req.body[k] === 'select') {
// distLineSub.push(null); } else if (k === 'gidDBL' || k === 'agencyDBL' || k === 'dist_severDBL' || k ===
// 'photo_azimDBL') { distLineSub.push(parseInt(req.body[k])); } else if (k === 'miles_distDBL' || k === 'km_distDBL'
// || k === 'shape_stleDBL' || k === 'shape_lengDBL') { distLineSub.push(parseFloat(req.body[k])); } else {
// distLineSub.push(req.body[k]); } } db.none('INSERT INTO dist_line_sub (gid, agency, region, ecosystem, gps_date,
// dist_code, dist_use, use_freq,' + ' use_recent, site_stabi, dist_crust, undist_cru, depth, width, type, plant_dama,
// accessibil, visibility,' + ' comments, primary_ob, secondary_, miles_dist, km_dist, treated, dist_sever, cultural,
// t_e_specie,' + ' gps_photo, soil_vulne, photo_azim, qa_qc, old_dist_c, shape_stle, shape_leng) ' + 'VALUES ($1, $2,
// $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,' + ' $22, $23, $24, $25,
// $26, $27, $28, $29, $30, $31, $32, $33, $34);', distLineSub) .then(function () { console.log('dist line form
// submitted'); res.status(200) .json({ status: 'success', message: 'sent dist line query' }); }) .catch(function (err)
// { throw err; });
    })
    
    
    
    
    
    
    
    
    
    
      ///////////////////////////////////
     // this is for updating records ///
    ///////////////////////////////////
    
    
    
    .post('/restoPointFormEdit', (req, res) => {
      //const restoPointUpsert = upsert.restoPointSub;
      const restoPointUpdate = req.body;

      db.none(`UPDATE resto_point_sub
      SET agency = $2, region = $3, ecosystem = $4, gps_date = $5, resto_code = $6, resto_acti = $7, comments = $8,
        primary_ob = $9, secondary_ = $10, project_na = $11, sqft_resto = $12, gps_photo = $13, photo_azim = $14, previously = $15, qa_qc = $16
      WHERE gid = $1 `,  restoPointUpdate)
        .then(function () {
          console.log('restoration point updated');
          console.log(restoPointUpdate);
          var response = {
              status  : 200,
              success : 'Updated Successfully'
          }
          res.end(JSON.stringify(response));
        })
        .catch(function (err) {
          throw err;
        })
        
    })
    
    .post('/restoPolyFormEdit', (req, res) => {
      const restoPolyUpdate = req.body;

      db.none(`UPDATE resto_polygon_sub
      SET agency = $2, region = $3, ecosystem = $4, resto_code = $5, resto_acti = $6, te_action = $7,
      non_list_a = $8, comments = $9, primary_ob = $10, secondary_ = $11, project_na = $12, treatment_ = $13, acres_rest = $14, kmsq_resto = $15, gps_date = $16, gps_photo = $17,
      photo_azim = $18, signed = $19, deep_till = $20, barrier_in = $21, mulch = $22, monitoring = $23, previously = $24, shape_star = $25, shape_stle = $26, shape_leng = $27,
      shape_area = $28
      WHERE gid = $1 `,  restoPolyUpdate)
        .then(function () {
          console.log('restoration polygon updated');
          console.log(restoPolyUpdate);
          var response = {
              status  : 200,
              success : 'Updated Successfully'
          }
          res.end(JSON.stringify(response));
        })
        .catch(function (err) {
          throw err;
        })
    })
    
    .post('/restoLineFormEdit', (req, res) => {
      const restoLineUpdate = req.body;

      db.none(`UPDATE resto_line_sub
      SET agency = $2, region = $3, ecosystem = $4, gps_date = $5, resto_code = $6, resto_act = $7, te_act = $8,
      nonlists_a = $9, comments = $10, primary_ob = $11, secondary_ = $12, project_na = $13, treatment_ = $14, signed = $15, mulch = $16, deep_till = $17, barrier_in = $18,
      miles_rest = $19, km_resto = $20, gps_photo = $21, photo_azim = $22, monitoring = $23, previously = $24, qa_qc = $25, shape_stle = $26, shape_leng = $27
      WHERE gid = $1 `,  restoLineUpdate)
        .then(function () {
          console.log('restoration line updated');
          console.log(restoLineUpdate);
          var response = {
              status  : 200,
              success : 'Updated Successfully'
          }
          res.end(JSON.stringify(response));
        })
        .catch(function (err) {
          throw err;
        })
    })
    
    
    
    .post('/barrierFormEdit', (req, res) => {
      const barrierUpdate = req.body;

      db.none(`UPDATE barrier_sub
      SET agency = $2, regions = $3, ecosystem = $4, gps_date = $5, barr_code = $6, barr_actio = $7, barr_type = $8,
           comments = $9, primary_ob = $10, secondary_ = $11, project_na = $12, barr_miles = $13, barr_km = $14, previously = $15, gps_photo = $16, photo_azim = $17, qa_qc = $18,
           shape_stle = $19, shape_leng = $20
      WHERE gid = $1 `,  barrierUpdate)
        .then(function () {
          console.log('barrier updated');
          console.log(barrierUpdate);
          var response = {
              status  : 200,
              success : 'Updated Successfully'
          }
          res.end(JSON.stringify(response));
        })
        .catch(function (err) {
          throw err;
        })
    })
    
    .post('/distPointFormEdit', (req, res) => {
      const distPointUpdate = req.body;

      db.none(`UPDATE dist_point_sub
      SET agency = $2, region = $3, ecosystem = $4, gps_date = $5, dist_code = $6, use_freq = $7, use_recent = $8,
        dist_pt_ty = $9, accessibil = $10, visibility = $11, comments = $12, primary_ob = $13, secondary_ = $14, previously = $15, project_na = $16, estimate_s = $17, treated = $18,
        cultural = $19, t_e_specie = $20, gps_photo = $21, soil_vulne = $22, dist_use = $23, photo_azim = $24, qa_qc = $25, old_distco = $26
      WHERE gid = $1 `,  distPointUpdate)
        .then(function () {
          console.log('dist point updated');
          console.log(distPointUpdate);
          var response = {
              status  : 200,
              success : 'Updated Successfully'
          }
          res.end(JSON.stringify(response));
        })
        .catch(function (err) {
          throw err;
        })
    })
    .post('/distPolyFormEdit', (req, res) => {
      const distPolyUpdate = req.body;

      db.none(`UPDATE dist_polygon_sub
      SET agency = $2, regions = $3, ecosystem = $4, gps_date = $5, dist_code = $6, dist_use = $7, use_freq = $8,
        use_recent = $9, site_stabi = $10, dist_crust = $11, undist_cru = $12, depth = $13, dist_poly_ = $14, plant_dama = $15, assessibil = $16, visibility = $17, comments = $18,
        primary_ob = $19, secondary_ = $20, acres_rest = $21, kmsq_resto = $22, treated = $23, dist_sever = $24, cultural = $25, t_e_specie = $26, gps_photo = $27, site_vulne = $28,
        photo_azim = $29, qa_qc = $30, old_distco = $31, shape_star = $32, shape_stle = $33, shape_leng = $34, shape_area = $35
      WHERE gid = $1 `,  distPolyUpdate)
        .then(function () {
          console.log('dist polygon updated');
          console.log(distPolyUpdate);
          var response = {
              status  : 200,
              success : 'Updated Successfully'
          }
          res.end(JSON.stringify(response));
        })
        .catch(function (err) {
          throw err;
        })
    })
    
    .post('/distLineFormEdit', (req, res) => {
      const distLineUpdate = req.body;

      db.none(`UPDATE dist_line_sub
      SET agency = $2, region = $3, ecosystem = $4, gps_date = $5, dist_code = $6, dist_use = $7, use_freq = $8,
        use_recent = $9, site_stabi = $10, dist_crust = $11, undist_cru = $12, depth = $13, width = $14, type = $15, plant_dama = $16, accessibil = $17, visibility = $18, comments = $19,
        primary_ob = $20, secondary_ = $21, miles_dist = $22, km_dist = $23, treated = $24, dist_sever = $25, cultural = $26, t_e_specie = $27, gps_photo = $28, soil_vulne = $29,
        photo_azim = $30, qa_qc = $31, old_dist_c = $32, shape_stle = $33, shape_leng = $34
      WHERE gid = $1 `,  distLineUpdate)
        .then(function () {
          console.log('dist line updated');
          console.log(distLineUpdate);
          var response = {
              status  : 200,
              success : 'Updated Successfully'
          }
          res.end(JSON.stringify(response));
        })
        .catch(function (err) {
          throw err;
        })
    });
};
