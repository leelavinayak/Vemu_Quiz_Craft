const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    language: { type: String, required: true },
    questions: [
        {
            question: { type: String, required: true },
            options: { type: [String], required: true },
            correctAnswer: { type: String, required: true }
        }
    ],
    duration: { type: Number, required: true }, // in minutes
    scheduledAt: { type: Date, default: null }, // Act as Start Time
    endTime: { type: Date, default: null },
    isLive: { type: Boolean, default: true },
    passingScore: { type: Number, required: true }, // percentage threshold
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
