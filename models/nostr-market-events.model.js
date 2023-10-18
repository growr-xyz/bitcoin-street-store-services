const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  kind: {
    type: Number,
    required: true,
    enum: [30017, 30018, 30019]
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