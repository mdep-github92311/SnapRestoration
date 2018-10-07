const Model = require('simple-sql-model')

class Barrier extends Model { }
class RestorationPoint extends Model { }
class RestorationPolygon extends Model { }
class RestorationLine extends Model { }
class DisturbancePoint extends Model { }
class DisturbancePolygon extends Model { }
class DisturbanceLine extends Model { }
// Setup the database connection for the model.
exports.barriers = Barrier.configure({
    db,
    table: 'barrier',
    columns: [
        "gid",
        "agency",
        "regions",
        "ecosystem",
        "gps_date",
        "barr_code",
        "barr_actio",
        "barr_type",
        "comments",
        "primary_ob",
        "secondary_",
        "project_na",
        "barr_miles",
        "barr_km",
        "previously",
        "gps_photo",
        "photo_azim",
        "qa_qc",
        "shape_leng",
        "geom",
        "audit_id"
    ]
})

exports.restorationPoints = RestorationPoint.configure({
    db,
    table: 'users',
    columns: [
        "gid",
    ]
})
exports.restorationPolygons = RestorationPolygon.configure({
    db,
    table: 'users',
    columns: [
        "gid",
    ]
})
exports.restorationLines = RestorationLine.configure({
    db,
    table: 'users',
    columns: [
        "gid",
    ]
})
exports.disturbancePoints = DisturbancePoint.configure({
    db,
    table: 'users',
    columns: [
        "gid",
    ]
})
exports.disturbancePolygons = DisturbancePolygon.configure({
    db,
    table: 'users',
    columns: [
        "gid",
    ]
})
exports.disturbanceLines = DisturbanceLine.configure({
    db,
    table: 'users',
    columns: [
        "gid",
    ]
})