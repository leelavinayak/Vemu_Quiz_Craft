require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    console.log('Testing Gemini API...');
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    console.log('API Key starts with:', apiKey.substring(0, 10));
    
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = "Hello! Send me a JSON array of 5 fruits. [{name: 'apple'}]";
        const result = await model.generateContent(prompt);
        console.log('Response Received:');
        console.log(result.response.text());
    } catch (e) {
        console.error('API Error:', e.message);
    }
}

test();
