var mongoose		= require('mongoose');
var Schema			= mongoose.Schema;

var MeetingSchema	= new Schema({
  _id:Number,
  title:String,
  affiliation: { type: String, index: true },
  descriptors: { type: [String], index: true },
  address:String,
  zip:Number,
  day_of_week: { type: String, index: true },
  time:String,
  calctime: { type: Number, index: true },
  location: {
    latitude:Number,
    longitude:Number
  },
  loc: {
    'type': {
      type: String,
      required: true,
      enum: ['Point', 'LineString', 'Polygon'],
      default: 'Point'
    },
    coordinates: [Number]
  },
  icon:String
});
MeetingSchema.index({ loc: '2dsphere' });

module.exports = mongoose.model('Meeting', MeetingSchema);
