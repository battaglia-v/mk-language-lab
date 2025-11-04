import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  buildJourneyTutorPrompt,
  getJourneyDefinition,
  isJourneyId,
  type JourneyProgressContext,
} from '@/data/journeys';
import {
  ValidationError,
  ExternalServiceError,
  RateLimitError,
  createErrorResponse,
} from '@/lib/errors';

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
    const { messages, activeJourney, journeyProgress } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      throw new ValidationError('Messages array is required');
    }

    const formattedMessages: TutorMessage[] = messages.filter((message: TutorMessage) =>
      typeof message?.content === 'string' &&
      (message.role === 'user' || message.role === 'assistant')
    );

    if (formattedMessages.length === 0) {
      throw new ValidationError('No valid messages provided');
    }

    // If OpenAI is not configured, return mock response
    if (!openai) {
      return NextResponse.json({
        message: 'Mock Tutor Response: OpenAI is not configured. Please add OPENAI_API_KEY to your environment variables for AI-powered tutoring. For now, I can help with basic questions about Macedonian!',
        mock: true,
      });
    }

    let systemPrompt = MACEDONIAN_TUTOR_SYSTEM_PROMPT;

    let progressContext: JourneyProgressContext | undefined;

    if (journeyProgress && typeof journeyProgress === 'object') {
      const stepsThisWeek = Number((journeyProgress as JourneyProgressContext).stepsThisWeek);
      const totalSessions = Number((journeyProgress as JourneyProgressContext).totalSessions);
      const lastSessionRaw = (journeyProgress as JourneyProgressContext).lastSessionIso;

      if (!Number.isNaN(stepsThisWeek) && !Number.isNaN(totalSessions)) {
        progressContext = {
          stepsThisWeek: Math.max(0, Math.trunc(stepsThisWeek)),
          totalSessions: Math.max(0, Math.trunc(totalSessions)),
          lastSessionIso: typeof lastSessionRaw === 'string' ? lastSessionRaw : null,
        };
      }
    }

    if (isJourneyId(activeJourney)) {
      const journey = getJourneyDefinition(activeJourney);
      if (journey) {
        const context = buildJourneyTutorPrompt(journey.id, progressContext);
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

    // Call OpenAI API with timeout
    try {
      const completionPromise = openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      });

      // Add 30 second timeout for OpenAI API call (can be slow for longer responses)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new ExternalServiceError('OpenAI request timeout', 504)), 30000);
      });

      const completion = await Promise.race([completionPromise, timeoutPromise]);

      const responseMessage = completion.choices[0]?.message?.content || 'No response generated';

      return NextResponse.json({
        message: responseMessage,
        usage: completion.usage,
      });
    } catch (error) {
      // Handle OpenAI-specific errors
      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          throw new RateLimitError('OpenAI rate limit exceeded. Please try again in a few moments.');
        }
        if (error.status === 401) {
          throw new ExternalServiceError('OpenAI authentication failed', 401);
        }
        if (error.status && error.status >= 500) {
          throw new ExternalServiceError('OpenAI service error', error.status);
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Tutor API error:', error);
    const { response, status } = createErrorResponse(error, 'Failed to get tutor response');
    return NextResponse.json(response, { status });
  }
}
