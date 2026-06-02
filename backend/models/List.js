const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  notes: {
    type: String,
    default: '',
    trim: true,
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('List', listSchema);
