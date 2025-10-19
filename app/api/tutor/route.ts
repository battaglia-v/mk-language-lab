import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildJourneyTutorPrompt, getJourneyDefinition, isJourneyId } from '@/data/journeys';

type TutorMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const MACEDONIAN_TUTOR_SYSTEM_PROMPT = `You are an expert Macedonian language teacher with years of experience teaching both native speakers and learners. Your role is to:

1. Help students learn Macedonian through clear explanations, examples, and practice exercises
2. Explain grammar rules, vocabulary, pronunciation, and cultural context
3. Create personalized study plans based on the student's level and goals
4. Provide translations between Macedonian (mk) and English (en) when requested
5. Generate practice exercises, flashcards, and spaced-repetition materials
6. Offer constructive feedback and encouragement
7. Adapt your teaching style to the student's needs and preferences

You can communicate in both Macedonian and English, switching between them as needed. Always be patient, supportive, and thorough in your explanations.

When creating study plans, consider:
- Student's current level (beginner, intermediate, advanced)
- Learning goals (conversation, reading, writing, professional use)
- Available study time per week
- Preferred learning style (visual, auditory, kinesthetic)

Format your responses clearly with examples, and use Cyrillic script for Macedonian text.`;

export async function POST(request: NextRequest) {
  try {
    const { messages, activeJourney } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const formattedMessages: TutorMessage[] = messages.filter((message: TutorMessage) =>
      typeof message?.content === 'string' &&
      (message.role === 'user' || message.role === 'assistant')
    );

    if (formattedMessages.length === 0) {
      return NextResponse.json(
        { error: 'No valid messages provided' },
        { status: 400 }
      );
    }

    // If OpenAI is not configured, return mock response
    if (!openai) {
      return NextResponse.json({
        message: 'Mock Tutor Response: OpenAI is not configured. Please add OPENAI_API_KEY to your environment variables for AI-powered tutoring. For now, I can help with basic questions about Macedonian!',
        mock: true,
      });
    }

    let systemPrompt = MACEDONIAN_TUTOR_SYSTEM_PROMPT;

    if (isJourneyId(activeJourney)) {
      const journey = getJourneyDefinition(activeJourney);
      if (journey) {
        const context = buildJourneyTutorPrompt(journey.id);
        systemPrompt = `${systemPrompt}

Learner journey context:
${context}`;
      }
    }

    // Add system prompt
    const messagesWithSystem: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...formattedMessages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messagesWithSystem,
      temperature: 0.7,
      max_tokens: 2000,
      stream: false,
    });

    const responseMessage = completion.choices[0]?.message?.content || 'No response generated';

    return NextResponse.json({
      message: responseMessage,
      usage: completion.usage,
    });
  } catch (error) {
    console.error('Tutor API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get tutor response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
