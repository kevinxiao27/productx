import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API Key");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateCompletion({ messages, model = "gpt-4-turbo-preview", temperature = 0.7, max_tokens = 500 }) {
  try {
    const completion = await openai.chat.completions.create({
      messages,
      model,
      temperature,
      max_tokens
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
}

// Example usage:
// const response = await generateCompletion({
//   messages: [
//     { role: "system", content: "You are a helpful assistant." },
//     { role: "user", content: "What is the capital of France?" }
//   ]
// });
