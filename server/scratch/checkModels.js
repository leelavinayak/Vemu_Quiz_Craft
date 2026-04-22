const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // The SDK doesn't always have a direct listModels, but we can try to find the property
        console.log("Checking available models...");
        // In some versions it's genAI.listModels()
        const models = await genAI.getGenerativeModel({ model: "gemini-pro" }); 
        console.log("Model 'gemini-pro' initialized successfully.");
        
        const flash = await genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        console.log("Model 'gemini-flash-latest' initialized successfully.");
    } catch (error) {
        console.error("Error:", error.message);
    }
}

listModels();
