import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
    try {
        const { action, topic, difficulty, article, userSummary, answers } =
            await request.json();

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        switch (action) {
            case "generate_article": {
                const prompt = `Generate a ${difficulty} level Spanish article about "${topic}". 
                The article should be:
                - Written entirely in Spanish
                - Appropriate for ${difficulty} level learners
                - Between 300-500 words
                - Engaging and educational
                - Include some relevant vocabulary
                - Structured with a title, introduction, 2-3 body paragraphs, and conclusion
                - Use proper Spanish punctuation and accents
                
                For each main section of the article, generate a descriptive image prompt in English.
                
                Return ONLY a valid JSON object in this exact format:
                {
                  "title": "Article title in Spanish",
                  "sections": [
                    {
                      "text": "First paragraph or section text",
                      "imagePrompt": "English description for an image to illustrate this section"
                    },
                    {
                      "text": "Second paragraph or section text",
                      "imagePrompt": "English description for an image to illustrate this section"
                    }
                  ]
                }
                
                Make sure to have 3-4 sections total.`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Parse JSON from response
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error("Failed to parse article JSON");
                }
                const articleData = JSON.parse(jsonMatch[0]);

                return NextResponse.json(articleData);
            }

            case "generate_quiz": {
                const prompt = `Based on this Spanish article:

"${article}"

Generate 5 multiple choice questions in Spanish to test comprehension. 
Each question should:
- Be in Spanish
- Have 4 answer options (A, B, C, D)
- Have only one correct answer
- Test understanding of the article content

Return ONLY a valid JSON array in this exact format:
[
  {
    "question": "Question text in Spanish?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]

The correctAnswer should be the index (0-3) of the correct option.`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                let text = response.text();

                // Clean up the response to extract JSON
                text = text
                    .replace(/```json\n?/g, "")
                    .replace(/```\n?/g, "")
                    .trim();

                const quiz = JSON.parse(text);

                return NextResponse.json({ quiz });
            }

            case "evaluate_summary": {
                const prompt = `You are evaluating a student's Spanish summary of an article.

Original Article:
"${article}"

Student's Summary:
"${userSummary}"

Evaluate the summary based on:
1. Accuracy (how well it captures main ideas)
2. Grammar and spelling
3. Vocabulary usage
4. Coherence and structure

Provide:
- A score out of 100
- Brief feedback in English (2-3 sentences)
- Specific suggestions for improvement

Return ONLY valid JSON in this format:
{
  "score": 85,
  "feedback": "Your feedback here",
  "suggestions": "Your suggestions here"
}`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                let text = response.text();

                // Clean up the response to extract JSON
                text = text
                    .replace(/```json\n?/g, "")
                    .replace(/```\n?/g, "")
                    .trim();

                const evaluation = JSON.parse(text);

                return NextResponse.json({ evaluation });
            }

            case "grade_quiz": {
                const prompt = `Grade this quiz based on the article and provided answers.

Article:
"${article}"

Quiz Questions and User's Answers:
${JSON.stringify(answers, null, 2)}

Return ONLY valid JSON in this format:
{
  "score": 4,
  "total": 5,
  "percentage": 80,
  "feedback": "Brief feedback in English"
}`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                let text = response.text();

                text = text
                    .replace(/```json\n?/g, "")
                    .replace(/```\n?/g, "")
                    .trim();

                const grading = JSON.parse(text);

                return NextResponse.json({ grading });
            }

            default:
                return NextResponse.json(
                    { error: "Invalid action" },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("Gemini API error:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to process request",
            },
            { status: 500 }
        );
    }
}
