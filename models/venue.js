/**
 * Created by Raydius on 1/19/16.
 */

var mongoose		 = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var Schema			 = mongoose.Schema;

var VenueSchema	= new Schema({
  _id:Number,
  name:String,
  address:String,
  latitude:Number,
  longitude:Number
});

VenueSchema.plugin(findOrCreate);

module.exports = mongoose.model('Venue', VenueSchema);

