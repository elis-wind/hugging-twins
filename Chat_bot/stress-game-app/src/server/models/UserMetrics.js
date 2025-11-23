const mongoose = require('mongoose');

const UserMetricsSchema = new mongoose.Schema({
	userId: {
		type: String,
		required: true,
		index: true
	},
	date: {
		type: Date,
		default: Date.now
	},
	sleep: {
		hours: { type: Number, required: true },
		quality: { type: String, enum: ['Poor', 'Fair', 'Good', 'Excellent'], default: 'Good' }
	},
	steps: {
		type: Number,
		default: 0
	},
	stressScore: {
		type: Number,
		min: 0,
		max: 100
	},
	journalEntry: {
		type: String
	}
}, { timestamps: true });

module.exports = mongoose.model('UserMetrics', UserMetricsSchema);
