/*
// Set up your database query to display GeoJSON
exports.barrier_query =
    `SELECT 
      Row_to_json(fc)
    FROM (SELECT
      'FeatureCollection' AS type,
      Array_to_json(Array_agg(f)) AS features
    FROM (SELECT
      'Feature' AS type,
      ST_AsGeoJSON(geom) ::json AS geometry,
      Row_to_json((SELECT
        l
    FROM (SELECT
      gid, agency) AS l) ) AS properties
    FROM barrier AS lg) AS f) AS fc;`;

exports.dist_line_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features
    FROM (SELECT 
      'Feature' As type, 
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency) As l)) 
      As properties
    FROM dist_line As lg) As f) As fc`;

exports.dist_point_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type, 
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency) As l)) As properties
    FROM dist_point As lg) As f) As fc`;

exports.dist_poly_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type, 
      ST_AsGeoJSON(geom)::json As geometry,
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency) 
      As l)) As properties
    FROM dist_polygon As lg) As f) As fc`;

exports.dist_poly_centroid_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
       array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type, 
      ST_AsGeoJSON(geom)::json As geometry,
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency) As l)) As properties
    FROM dist_poly_centroid As lg) As f) As fc`;

exports.restoPoint_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry,
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency) As l)) As properties 
    FROM resto_point As lg) As f) As fc`;

exports.resto_line_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
        array_to_json(array_agg(f)) As features
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry,
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency) As l)) As properties
    FROM resto_line As lg) As f) As fc`;

exports.resto_poly_query =
    `SELECT 
      row_to_json(fc) 
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency) As l)) As properties
    FROM resto_polygon As lg) As f) As fc`;

exports.resto_poly_centroid_query =
    `SELECT 
      row_to_json(fc) 
    FROM (SELECT 
      'FeatureCollection' As type, 
       array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency) As l)) As properties
    FROM rest_poly_centroid As lg) As f) As fc`;

exports.blm_regions_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid) As l)) As properties
    FROM blm_regions As lg) As f) As fc`;

exports.fs_regions_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
       array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid)  As l)) As properties
    FROM fs_regions As lg) As f) As fc`;

exports.mdep_boundary_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
       array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid) As l)) As properties
    FROM mdep_boundary As lg) As f) As fc`;

exports.mdi_boundary_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid) As l)) As properties
    FROM mdi_boundary As lg) As f) As fc`;

exports.nv_counties_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid) As l)) As properties
    FROM nv_counties As lg) As f) As fc`;

exports.roads_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid) 
      As l)) As properties
    FROM roads As lg) As f) As fc`;

exports.snap_extent_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid) As l)) As properties
    FROM snap_extent As lg) As f) As fc`;

exports.soil_vulnerability_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid) As l)) As properties
    FROM soil_vulnerability As lg) As f) As fc`;
    
exports.barrier_sub_query =
    `SELECT 
      Row_to_json(fc)
    FROM (SELECT
      'FeatureCollection' AS type,
      Array_to_json(Array_agg(f)) AS features
    FROM (SELECT
      'Feature' AS type,
      ST_AsGeoJSON(geom) ::json AS geometry,
      Row_to_json((SELECT
        l
    FROM (SELECT
      gid, agency, regions, ecosystem, gps_date, barr_code, barr_actio, barr_type, comments, primary_ob, secondary_,
      project_na, barr_miles, barr_km, previously, gps_photo, photo_azim, qa_qc) AS l) ) AS properties
    FROM barrier_sub AS lg) AS f) AS fc;`;

exports.dist_line_sub_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features
    FROM (SELECT 
      'Feature' As type, 
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, region, ecosystem, gps_date, dist_code, dist_use, use_freq, use_recent, site_stabi, dist_crust, 
      undist_cru, depth, width, type, plant_dama, accessibil, visibility, comments, primary_ob, secondary_, miles_dist, 
      km_dist, treated, dist_sever, cultural, t_e_specie, gps_photo, soil_vulne, photo_azim, qa_qc, old_dist_c) As l)) 
      As properties
    FROM dist_line_sub As lg) As f) As fc`;

exports.dist_point_sub_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type, 
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, region, ecosystem, gps_date, dist_code, dist_use, use_freq, use_recent, dist_pt_ty, accessibil, 
      visibility, comments, primary_ob, secondary_, previously, project_na, estimate_s, treated, cultural, t_e_specie, 
      gps_photo, soil_vulne, photo_azim, qa_qc, old_distco) As l)) As properties
    FROM dist_point_sub As lg) As f) As fc`;

exports.dist_poly_sub_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type, 
      ST_AsGeoJSON(geom)::json As geometry,
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, regions, ecosystem, gps_date, dist_code, dist_use, use_freq, use_recent, site_stabi, dist_crust, 
      undist_cru, depth, dist_poly_, plant_dama, assessibil, visibility, comments, primary_ob, secondary_, acres_rest, 
      kmsq_resto, treated, dist_sever, cultural, t_e_specie, gps_photo, site_vulne, photo_azim, qa_qc, old_distco) 
      As l)) As properties
    FROM dist_polygon_sub As lg) As f) As fc`;

exports.dist_poly_centroid_sub_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
       array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type, 
      ST_AsGeoJSON(geom)::json As geometry,
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, regions, ecosystem, gps_date, dist_code, dist_use, use_freq, use_recent, site_stabi, dist_crust, 
      undist_cru, depth, dist_poly_, plant_dama, assessibil, visibility, comments, primary_ob, secondary_, acres_rest, 
      kmsq_resto, treated, dist_sever, cultural, t_e_specie, gps_photo, site_vulne, photo_azim, qa_qc, old_distco, 
      orig_fid) As l)) As properties
    FROM dist_poly_centroid_sub As lg) As f) As fc`;
    
exports.restoPointSub_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry,
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, region, ecosystem, gps_date, resto_code, resto_acti, comments, primary_ob, secondary_, project_na, 
      sqft_resto, gps_photo, photo_azim, previously, qa_qc) As l)) As properties 
    FROM resto_point_sub As lg) As f) As fc`;

exports.resto_line_sub_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
        array_to_json(array_agg(f)) As features
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry,
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, region, ecosystem, gps_date, resto_code, resto_act, te_act, nonlists_a, comments, primary_ob, 
      secondary_, project_na, treatment_, signed, mulch, deep_till, barrier_in, miles_rest, km_resto, gps_photo, 
      photo_azim, monitoring, previously, qa_qc, shape_leng) As l)) As properties
    FROM resto_line_sub As lg) As f) As fc`;

exports.resto_poly_sub_query =
    `SELECT 
      row_to_json(fc) 
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, region, ecosystem, resto_code, resto_acti, te_action, non_list_a, comments, primary_ob, secondary_, 
       project_na, treatment_, acres_rest, kmsq_resto, gps_date, gps_photo, photo_azim, signed, deep_till, barrier_in, 
       mulch, monitoring, previously) As l)) As properties
    FROM resto_polygon_sub As lg) As f) As fc`;

exports.resto_poly_centroid_sub_query =
    `SELECT 
      row_to_json(fc) 
    FROM (SELECT 
      'FeatureCollection' As type, 
       array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, region, ecosystem, resto_code, resto_acti, te_action, non_list_a, comments, primary_ob, secondary_, 
      project_na, treatment_, acres_rest, kmsq_resto, gps_date, gps_photo, photo_azim, signed, deep_till, barrier_in, 
      mulch, monitoring, previously, orig_fid) As l)) As properties
    FROM rest_poly_centroid_sub As lg) As f) As fc`;
    
*/

// Set up your database query to display GeoJSON
exports.barrier_query =
    `SELECT 
      Row_to_json(fc)
    FROM (SELECT
      'FeatureCollection' AS type,
      Array_to_json(Array_agg(f)) AS features
    FROM (SELECT
      'Feature' AS type,
      ST_AsGeoJSON(geom) ::json AS geometry,
      Row_to_json((SELECT
        l
    FROM (SELECT
      gid, agency, regions, ecosystem, gps_date, barr_code, barr_actio, barr_type, comments, primary_ob, secondary_,
      project_na, barr_miles, barr_km, previously, gps_photo, photo_azim, qa_qc, shape_leng) AS l) ) AS properties
    FROM barrier AS lg where agency = 2) AS f) AS fc;`;

exports.dist_line_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features
    FROM (SELECT 
      'Feature' As type, 
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, region, ecosystem, gps_date, dist_code, dist_use, use_freq, use_recent, site_stabi, dist_crust, 
      undist_cru, depth, width, type, plant_dama, accessibil, visibility, comments, primary_ob, secondary_, miles_dist, 
      km_dist, treated, dist_sever, cultural, t_e_specie, gps_photo, soil_vulne, photo_azim, qa_qc, old_dist_c, shape_leng) As l)) 
      As properties
    FROM dist_line As lg where agency = 2) As f) As fc`;

exports.dist_point_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type, 
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, region, ecosystem, gps_date, dist_code, dist_use, use_freq, use_recent, dist_pt_ty, accessibil, 
      visibility, comments, primary_ob, secondary_, previously, project_na, estimate_s, treated, cultural, t_e_specie, 
      gps_photo, soil_vulne, photo_azim, qa_qc, old_distco) As l)) As properties
    FROM dist_point As lg where agency = 2) As f) As fc`;

exports.dist_poly_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type, 
      ST_AsGeoJSON(geom)::json As geometry,
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, regions, ecosystem, gps_date, dist_code, dist_use, use_freq, use_recent, site_stabi, dist_crust, 
      undist_cru, depth, dist_poly_, plant_dama, assessibil, visibility, comments, primary_ob, secondary_, acres_rest, 
      kmsq_resto, treated, dist_sever, cultural, t_e_specie, gps_photo, site_vulne, photo_azim, qa_qc, old_distco,
      shape_leng, shape_area) 
      As l)) As properties
    FROM dist_polygon As lg where agency = 2) As f) As fc`;

exports.dist_poly_centroid_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
       array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type, 
      ST_AsGeoJSON(geom)::json As geometry,
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, regions, ecosystem, gps_date, dist_code, dist_use, use_freq, use_recent, site_stabi, dist_crust, 
      undist_cru, depth, dist_poly_, plant_dama, assessibil, visibility, comments, primary_ob, secondary_, acres_rest, 
      kmsq_resto, treated, dist_sever, cultural, t_e_specie, gps_photo, site_vulne, photo_azim, qa_qc, old_distco, 
      orig_fid) As l)) As properties
    FROM dist_poly_centroid As lg where agency = 2) As f) As fc`;

exports.restoPoint_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry,
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, region, ecosystem, gps_date, resto_code, resto_acti, comments, primary_ob, secondary_, project_na, 
      sqft_resto, gps_photo, photo_azim, previously, qa_qc) As l)) As properties 
    FROM resto_point As lg where agency = 2) As f) As fc`;

exports.resto_line_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
        array_to_json(array_agg(f)) As features
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry,
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, region, ecosystem, gps_date, resto_code, resto_act, te_act, nonlists_a, comments, primary_ob, 
      secondary_, project_na, treatment_, signed, mulch, deep_till, barrier_in, miles_rest, km_resto, gps_photo, 
      photo_azim, monitoring, previously, qa_qc, shape_leng) As l)) As properties
    FROM resto_line As lg where agency = 2) As f) As fc`;

exports.resto_poly_query =
    `SELECT 
      row_to_json(fc) 
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, region, ecosystem, resto_code, resto_acti, te_action, non_list_a, comments, primary_ob, secondary_, 
       project_na, treatment_, acres_rest, kmsq_resto, gps_date, gps_photo, photo_azim, signed, deep_till, barrier_in, 
       mulch, monitoring, previously, shape_leng, shape_area) As l)) As properties
    FROM resto_polygon As lg where agency = 2) As f) As fc`;

exports.resto_poly_centroid_query =
    `SELECT 
      row_to_json(fc) 
    FROM (SELECT 
      'FeatureCollection' As type, 
       array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, region, ecosystem, resto_code, resto_acti, te_action, non_list_a, comments, primary_ob, secondary_, 
      project_na, treatment_, acres_rest, kmsq_resto, gps_date, gps_photo, photo_azim, signed, deep_till, barrier_in, 
      mulch, monitoring, previously, orig_fid) As l)) As properties
    FROM rest_poly_centroid As lg where agency = 2) As f) As fc`;

exports.blm_regions_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, objectid, area_, perimeter, ha750_2003, ha750_2004, hyd_area, hyd_area_n, subarea_na, hyd_region, hyd_regi_1, 
      pltsym, desig, des_reas, scale, desig_orde, shape_leng, ird, ird_name) As l)) As properties
    FROM blm_regions As lg) As f) As fc`;

exports.fs_regions_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
       array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, objectid, region, area_acres, code)  As l)) As properties
    FROM fs_regions As lg) As f) As fc`;

exports.mdep_boundary_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
       array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, sde_sde_bo, perimeter, bndpmoj_, bndpmoj_id, inside) As l)) As properties
    FROM mdep_boundary As lg) As f) As fc`;

exports.mdi_boundary_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, id, shape_leng, shape_area) As l)) As properties
    FROM mdi_boundary As lg) As f) As fc`;

exports.nv_counties_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, objectid, restoratio, perimeter, nv_county_, nv_count_1, name, state_name, state_fips, cnty_fips, fips, 
      pop1990, pop1999, pop90_sqmi, households, males, females, white, black, ameri_es, asian_pi, other, hispanic, 
      age_under5, age_5_17, age_18_29, age_30_49, age_50_64, age_65_up, nevermarry, married, separated, widowed, 
      divorced, hsehld_1_m, hsehld_1_f, marhh_chd, marhh_no_c, mhh_child, fhh_child, hse_units, vacant, owner_occ, 
      renter_occ, median_val, medianrent, units_1det, units_1att, units2, units3_9, units10_49, units50_up, mobilehome, 
      no_farms87, avg_size87, crop_acr87, avg_sale87) As l)) As properties
    FROM nv_counties As lg) As f) As fc`;

exports.roads_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, route_type, dominantsu, route_widt, name, comment, sourcethm, status, rd_number, rs2477_id, rd_status, 
      indicator_, length_mi, no, gtlf_id, admin_st, gtlf_plan_, famslink, gtlf_own, gtlf_nu, gtlf_nm, gtlf_nu2, gtlf_nm2, 
      gtlf_surfa, gtlf_carto, noshow_rsn, use_restri, fun_class, spec_dsgtn, esmtrow, use_class, coord_src_, coord_src2, 
      date_, miles, condition, use_level, created_us, created_da, last_edite, last_edi_1, objectid_1, road_statu) 
      As l)) As properties
    FROM roads As lg) As f) As fc`;

exports.snap_extent_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, id, shape_leng, shape_area) As l)) As properties
    FROM snap_extent As lg) As f) As fc`;

exports.soil_vulnerability_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, objectid, fid_nevada, fid_neva_1, restoratio, perimeter, fmatn, l_name, geologicfm, statemap, county, bioagemax, 
      bioagemin, modpoly, notes, refs, reviewed, shape_leng, vulfmatn, vulgeologi, fid_nvcoun, fid_nvco_1, area_1, 
      perimete_1, county_nam, area__sq_m, comment, acres, fid_swland, area_12, perimete_2, ca_landow_, ca_landow1, 
      region, owner, source, macode, status, matype, owner_name, new_owner, name, state, fid_surfac, fid_surf_1, 
      areasymbol, spatialver, musym, mukey, mukey_1, surftext, stmergevul, fid_nvco_2, fid_nvco_3, area_12_13, 
      perimete_3, county_n_1, area__sq_1, comment_1, acres_1, fid_swla_1, area_12_14, perimete_4, ca_lando_1, ca_lando_2, 
      region_1, owner_1, source_1, macode_1, status_1, matype_1, owner_na_1, new_owne_1, name_1, state_1) As l)) As properties
    FROM soil_vulnerability As lg) As f) As fc`;
    
exports.barrier_sub_query =
    `SELECT 
      Row_to_json(fc)
    FROM (SELECT
      'FeatureCollection' AS type,
      Array_to_json(Array_agg(f)) AS features
    FROM (SELECT
      'Feature' AS type,
      ST_AsGeoJSON(geom) ::json AS geometry,
      Row_to_json((SELECT
        l
    FROM (SELECT
      gid, agency, regions, ecosystem, gps_date, barr_code, barr_actio, barr_type, comments, primary_ob, secondary_,
      project_na, barr_miles, barr_km, previously, gps_photo, photo_azim, qa_qc, shape_stle, shape_leng) AS l) ) AS properties
    FROM barrier_sub AS lg) AS f) AS fc;`;

exports.dist_line_sub_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features
    FROM (SELECT 
      'Feature' As type, 
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, region, ecosystem, gps_date, dist_code, dist_use, use_freq, use_recent, site_stabi, dist_crust, 
      undist_cru, depth, width, type, plant_dama, accessibil, visibility, comments, primary_ob, secondary_, miles_dist, 
      km_dist, treated, dist_sever, cultural, t_e_specie, gps_photo, soil_vulne, photo_azim, qa_qc, old_dist_c, shape_stle, shape_leng) As l)) 
      As properties
    FROM dist_line_sub As lg) As f) As fc`;

exports.dist_point_sub_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type, 
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, region, ecosystem, gps_date, dist_code, dist_use, use_freq, use_recent, dist_pt_ty, accessibil, 
      visibility, comments, primary_ob, secondary_, previously, project_na, estimate_s, treated, cultural, t_e_specie, 
      gps_photo, soil_vulne, photo_azim, qa_qc, old_distco) As l)) As properties
    FROM dist_point_sub As lg) As f) As fc`;

exports.dist_poly_sub_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type, 
      ST_AsGeoJSON(geom)::json As geometry,
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, regions, ecosystem, gps_date, dist_code, dist_use, use_freq, use_recent, site_stabi, dist_crust, 
      undist_cru, depth, dist_poly_, plant_dama, assessibil, visibility, comments, primary_ob, secondary_, acres_rest, 
      kmsq_resto, treated, dist_sever, cultural, t_e_specie, gps_photo, site_vulne, photo_azim, qa_qc, old_distco, shape_star, shape_stle, shape_leng, shape_area) 
      As l)) As properties
    FROM dist_polygon_sub As lg) As f) As fc`;

exports.dist_poly_centroid_sub_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
       array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type, 
      ST_AsGeoJSON(geom)::json As geometry,
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, regions, ecosystem, gps_date, dist_code, dist_use, use_freq, use_recent, site_stabi, dist_crust, 
      undist_cru, depth, dist_poly_, plant_dama, assessibil, visibility, comments, primary_ob, secondary_, acres_rest, 
      kmsq_resto, treated, dist_sever, cultural, t_e_specie, gps_photo, site_vulne, photo_azim, qa_qc, old_distco, 
      orig_fid) As l)) As properties
    FROM dist_poly_centroid_sub As lg) As f) As fc`;
    
exports.restoPointSub_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry,
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, region, ecosystem, gps_date, resto_code, resto_acti, comments, primary_ob, secondary_, project_na, 
      sqft_resto, gps_photo, photo_azim, previously, qa_qc) As l)) As properties 
    FROM resto_point_sub As lg) As f) As fc`;

exports.resto_line_sub_query =
    `SELECT 
      row_to_json(fc)
    FROM (SELECT 
      'FeatureCollection' As type, 
        array_to_json(array_agg(f)) As features
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry,
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, region, ecosystem, gps_date, resto_code, resto_act, te_act, nonlists_a, comments, primary_ob, 
      secondary_, project_na, treatment_, signed, mulch, deep_till, barrier_in, miles_rest, km_resto, gps_photo, 
      photo_azim, monitoring, previously, qa_qc, shape_stle, shape_leng) As l)) As properties
    FROM resto_line_sub As lg) As f) As fc`;

exports.resto_poly_sub_query =
    `SELECT 
      row_to_json(fc) 
    FROM (SELECT 
      'FeatureCollection' As type, 
      array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, region, ecosystem, resto_code, resto_acti, te_action, non_list_a, comments, primary_ob, secondary_, 
       project_na, treatment_, acres_rest, kmsq_resto, gps_date, gps_photo, photo_azim, signed, deep_till, barrier_in, 
       mulch, monitoring, previously, shape_star, shape_stle, shape_leng, shape_area) As l)) As properties
    FROM resto_polygon_sub As lg) As f) As fc`;

exports.resto_poly_centroid_sub_query =
    `SELECT 
      row_to_json(fc) 
    FROM (SELECT 
      'FeatureCollection' As type, 
       array_to_json(array_agg(f)) As features 
    FROM (SELECT 
      'Feature' As type,
      ST_AsGeoJSON(geom)::json As geometry, 
      row_to_json((SELECT 
        l 
    FROM (SELECT 
      gid, agency, region, ecosystem, resto_code, resto_acti, te_action, non_list_a, comments, primary_ob, secondary_, 
      project_na, treatment_, acres_rest, kmsq_resto, gps_date, gps_photo, photo_azim, signed, deep_till, barrier_in, 
      mulch, monitoring, previously, orig_fid) As l)) As properties
    FROM rest_poly_centroid_sub As lg) As f) As fc`;
    