import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  ValidationError,
  ExternalServiceError,
  RateLimitError,
  createErrorResponse,
} from '@/lib/errors';
import { tutorRateLimit, checkRateLimit } from '@/lib/rate-limit';

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

## Cultural Context: Macedonian Family Dynamics

When teaching family conversations, emphasize these cultural norms:

**Family Importance**: Family is central to Macedonian culture. Extended family gatherings are frequent and multi-generational homes are common.

**Formality and Respect**:
- Use formal "Вие" (Vie) with elders, in-laws, and those you've just met
- Use informal "ти" (ti) with close family, friends, and children
- Address elders with respect: "баба" (baba - grandmother), "дедо" (dedo - grandfather), "тетка" (tetka - aunt), "вујко" (vujko - uncle)

**Warm Greetings**: Macedonians greet warmly with phrases like:
- "Како си?" (Kako si?) - How are you? (informal)
- "Како сте?" (Kako ste?) - How are you? (formal)
- "Добро дојдовте!" (Dobro dojdovte!) - Welcome! (formal)
- "Дај здравје!" (Daj zdravje!) - Good health to you!

**Common Topics**: Family conversations often include:
- Health and well-being: "Како е здравјето?" (Kako e zdravjeto?)
- Children and grandchildren: "Како се децата?" (Kako se decata?)
- Work and daily life: "Како е на работа?" (Kako e na rabota?)
- Food and meals: "Ќе јадеш нешто?" (Ḱe jadeš nešto?) - Will you eat something?

**Hospitality**: Offering food and drink is essential. Never refuse too quickly - accept graciously or decline gently after being offered multiple times.

## Common Mistakes to Watch For

1. **Verb Aspect Confusion**:
   - Imperfective: "јадам" (jadam - I eat/am eating) for ongoing actions
   - Perfective: "појадам" (pojedam - I will eat/eat once) for completed actions

2. **Gender Agreement**: Adjectives must match noun gender
   - Masculine: "добарден" (dobar den - good day)
   - Feminine: "добра вест" (dobra vest - good news)
   - Neuter: "добро утро" (dobro utro - good morning)

3. **Definite Articles**: Added as suffixes, not separate words
   - "маса" (masa - table) → "масата" (masata - the table)
   - Changes based on gender, number, and position

4. **False Friends**: Watch for words that look similar but differ in meaning
   - "живот" (život) = life (not alive)
   - "слободен" (sloboden) = free (not slobbish)

## Family Conversation Scenarios

When role-playing or coaching family conversations, focus on:

**Greeting Extended Family**:
- Formal: "Добар ден, баба. Како сте?" (Dobar den, baba. Kako ste?)
- Informal: "Здраво, тетка! Што правиш?" (Zdravo, tetka! Što praviš?)

**Asking About Family Members**:
- "Како е мама?" (Kako e mama?) - How is mom?
- "Каде се децата?" (Kade se decata?) - Where are the children?
- "Како се чувствува татко?" (Kako se čuvstvuva tatko?) - How is dad feeling?

**Expressing Concern**:
- "Дали сè е во ред?" (Dali sè e vo red?) - Is everything okay?
- "Грижам се за тебе." (Grižam se za tebe.) - I'm worried about you.
- "Ако треба нешто, јави ми." (Ako treba nešto, javi mi.) - If you need anything, let me know.

**Making Plans**:
- "Ќе дојдеш на ручек?" (Ḱe dojdeš na ruček?) - Will you come for lunch?
- "Да се видиме во недела." (Da se vidime vo nedela.) - Let's meet on Sunday.

When creating study plans, consider:
- Student's current level (beginner, intermediate, advanced)
- Learning goals (conversation, reading, writing, professional use, family communication)
- Available study time per week
- Preferred learning style (visual, auditory, kinesthetic)
- Cultural context needs (reconnecting with family, travel, heritage learning)

Format your responses clearly with examples, and always use Cyrillic script (not Latin transliteration) for Macedonian text.`;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - protect expensive OpenAI API
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1';
    const { success, limit, reset, remaining } = await checkRateLimit(tutorRateLimit, ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const { messages } = await request.json();

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

    const systemPrompt = MACEDONIAN_TUTOR_SYSTEM_PROMPT;

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
