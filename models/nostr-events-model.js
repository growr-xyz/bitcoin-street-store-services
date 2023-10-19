const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true
  },
  kind: {
    type: Number,
    required: true,
    // enum: [30017, 30018, 30019, 0]
  },
  rawJson: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

module.exports = {
  EventSchema: EventSchema,
  EventModel: mongoose.model('Event', EventSchema)
}