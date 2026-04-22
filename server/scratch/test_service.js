const { generateQuizQuestions } = require('../services/quizGenerator');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function testGeneration() {
    console.log("Testing quiz generation service...");
    try {
        const questions = await generateQuizQuestions("JavaScript basics", 3);
        console.log("✅ Success! Generated questions:");
        console.log(JSON.stringify(questions, null, 2));
    } catch (error) {
        console.error("❌ Generation Failed:", error.message);
        if (error.stack) {
            console.error(error.stack);
        }
    }
}

testGeneration();
