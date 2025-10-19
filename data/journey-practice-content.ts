import type { JourneyId } from '@/data/journeys';

export type JourneyPhrase = {
  id: string;
  situation: string;
  macedonian: string;
  english: string;
  tip?: string;
};

export type JourneyTranslationSnippet = {
  id: string;
  title: string;
  sourceLang: 'mk' | 'en';
  text: string;
  prompt: string;
};

export type JourneyPronunciationDrill = {
  id: string;
  title: string;
  instructions: string;
  lines: string[];
};

export type JourneyTaskPreset = {
  note: string;
  columns: Record<'todo' | 'in-progress' | 'done', Array<{ title: string; description: string }>>;
};

export type JourneyPracticeContent = {
  phrases?: JourneyPhrase[];
  translatorSnippets?: JourneyTranslationSnippet[];
  pronunciationDrills?: JourneyPronunciationDrill[];
  taskPreset?: JourneyTaskPreset;
};

export const JOURNEY_PRACTICE_CONTENT: Record<JourneyId, JourneyPracticeContent> = {
  family: {
    phrases: [
      {
        id: 'family-warm-check-in',
        situation: 'Warm check-in',
        macedonian: 'Здраво тето Марија! Многу ми недостигате. Како сте? Како се сите дома?',
        english: 'Hi Aunt Marija! I miss you so much. How are you? How is everyone at home?',
        tip: 'Follow up with a specific family member so the conversation keeps flowing.',
      },
      {
        id: 'family-story-share',
        situation: 'Sharing a quick story',
        macedonian:
          'Оваа недела конечно почнав да готвам сарма. Првиот обид беше смешен, ама мирисот ме врати во куќата на баба.',
        english:
          "This week I finally tried cooking sarma. The first attempt was funny, but the smell brought me right back to grandma's house.",
        tip: 'Invite them to share their version: „Како вие ја правите?“',
      },
      {
        id: 'family-tone-switch',
        situation: 'Switching register',
        macedonian: 'Толку ми значи што си тука. Кажи ми ако направив нешто несоодветно — сакам да звучам природно.',
        english:
          'It means so much that you are here. Please tell me if I said anything awkward—I want to sound natural.',
        tip: 'Use this line to signal that you welcome feedback on tone and word choice.',
      },
      {
        id: 'family-celebration-plan',
        situation: 'Planning a visit',
        macedonian: 'Планирам да дојдам наесен. Што мислиш, кој викенд би бил најдобар за да се собереме сите?',
        english: 'I am planning to visit in the fall. Which weekend do you think would be best for all of us to gather?',
        tip: 'Note the future tense and keep an ear out for how relatives answer with suggestions.',
      },
    ],
    translatorSnippets: [
      {
        id: 'family-voice-note',
        title: 'Family voice note',
        sourceLang: 'mk',
        text:
          'Здраво куќо! Вчера го слушнав тато како свири на тапан и ми се наполни срцето. Викендов ќе ви испратам видео од концертот тука за да споделите со баба.',
        prompt:
          'Translate the note into English and jot down two affectionate phrases you want to reuse the next time you call home.',
      },
      {
        id: 'family-recap-email',
        title: 'Catch-up email draft',
        sourceLang: 'en',
        text:
          'I promised my cousins that I would write more often, so here is a short update about life abroad and the Macedonian traditions I am trying to keep alive.',
        prompt:
          'Translate the message into Macedonian, keeping the tone warm and informal. Highlight any words you want the tutor to double-check.',
      },
    ],
    pronunciationDrills: [
      {
        id: 'family-intro-drill',
        title: 'Greeting cadence',
        instructions: 'Read each sentence twice, once with a gentle rising tone and once with a warm settled finish.',
        lines: [
          'Како сте, драги мои? Толку ми недостигате!',
          'Едвај чекам да седнеме заедно на неделниот ручек.',
          'Кажете ми што се случува со најмалите во семејството.',
        ],
      },
    ],
    taskPreset: {
      note: 'Use the cards to map out family catch-ups and keep sensitive stories top of mind before your next call.',
      columns: {
        todo: [
          {
            title: 'Conversation outline',
            description:
              'List three topics you want to mention in your next family call (news from you, questions for them, shared memories).',
          },
          {
            title: 'Vocabulary refresh',
            description:
              'Collect five affectionate expressions in Macedonian. Add the English meaning and note when you might use each one.',
          },
          {
            title: 'Tone check',
            description:
              'Draft two sentences in both informal and respectful forms so you can switch registers smoothly mid-conversation.',
          },
        ],
        'in-progress': [
          {
            title: 'Story practice',
            description:
              'Write a short anecdote you want to share and record yourself telling it. Mark any spots where you need pronunciation support.',
          },
        ],
        done: [
          {
            title: 'Reflection log',
            description:
              'After each family call, note what went well, what felt awkward, and the phrases you want to look up before the next chat.',
          },
        ],
      },
    },
  },
  travel: {
    phrases: [
      {
        id: 'travel-ticket-desk',
        situation: 'Buying a ticket',
        macedonian: 'Може ли една повратна карта за Охрид за утре наутро? Која платформа треба да ја фатам?',
        english: 'Can I have one return ticket to Ohrid for tomorrow morning? Which platform do I need to catch?',
        tip: 'Listen for the platform number and repeat it back to confirm you heard correctly.',
      },
      {
        id: 'travel-check-in',
        situation: 'Guesthouse check-in',
        macedonian: 'Имам резервација на име Ана Петровска. Дали појадокот е вклучен и во колку часот се служи?',
        english: 'I have a reservation under Ana Petrovska. Is breakfast included and what time is it served?',
        tip: 'Notice how the definite article on „поjадокот“ signals a specific meal.',
      },
      {
        id: 'travel-market',
        situation: 'Ordering at the market',
        macedonian: 'Ве молам измерете ми половина килограм домати и додадете свеж магдонос ако имате.',
        english: 'Please weigh half a kilo of tomatoes for me and add fresh parsley if you have it.',
        tip: 'Pair polite requests with „ве молам“ to soften your shopping language.',
      },
    ],
    translatorSnippets: [
      {
        id: 'travel-itinerary',
        title: 'Weekend itinerary note',
        sourceLang: 'mk',
        text:
          'Во сабота сакаме да го посетиме Капан ан, па ни требаат насоки од плоштадот. После ручек планираме прошетка по Вардар и дегустација на локални вина.',
        prompt:
          'Translate the plan into English, then list the travel verbs you might reuse when asking locals for help.',
      },
      {
        id: 'travel-troubleshooting',
        title: 'Troubleshooting email',
        sourceLang: 'en',
        text:
          'Our rental apartment confirmed late check-out, but we need to double-check the key handoff and parking instructions before we arrive in Skopje.',
        prompt:
          'Translate the email into Macedonian and highlight the logistical phrases you want to memorise.',
      },
    ],
    pronunciationDrills: [
      {
        id: 'travel-service-tone',
        title: 'Service interactions',
        instructions: 'Practice crisp consonant clusters and polite intonation for service encounters.',
        lines: [
          'Извинете, кога тргнува автобусот за Битола?',
          'Ќе може ли сметката, ве молам, и дали примате картички?',
          'Би сакал препорака за локално јадење што мора да се проба.',
        ],
      },
    ],
    taskPreset: {
      note: 'Move the cards as you practise each travel scenario so you can see momentum during the week.',
      columns: {
        todo: [
          {
            title: 'Transport phrase sprint',
            description:
              "Translate eight questions you might ask at the Skopje bus station. Include 'карта', 'време на поаѓање', and 'перон'.",
          },
          {
            title: 'Hotel check-in dialogue',
            description:
              'Write a three-turn Macedonian dialogue for arriving at a guesthouse. Add one question about breakfast options.',
          },
          {
            title: 'Restaurant ready list',
            description:
              'Create a mini menu of dishes you want to try. Add the polite phrases you will use to order and to ask for the bill.',
          },
        ],
        'in-progress': [
          {
            title: 'Saved vocabulary deck',
            description:
              'Collect new travel words in your translator history. Copy them into flashcards and mark which ones still feel shaky.',
          },
        ],
        done: [
          {
            title: 'Reflection prompt',
            description:
              'Record a short voice note retelling your ideal travel day in Macedonian. Listen back and mark where you hesitated.',
          },
        ],
      },
    },
  },
  culture: {
    phrases: [
      {
        id: 'culture-gallery-chat',
        situation: 'Discussing an exhibit',
        macedonian: 'Многу ми се допаѓа како фотографијата ја спојува старината со модерни бои. Како ти ја доживуваш оваа серија?',
        english: 'I really like how the photograph blends tradition with modern colours. How do you experience this series?',
        tip: 'Use open questions to invite deeper cultural reflections.',
      },
      {
        id: 'culture-book-club',
        situation: 'Book club reflection',
        macedonian: 'Во второто поглавје авторката користи дијалект. Дали забележа како тоа влијае на темпото на приказната?',
        english: 'In the second chapter the author uses dialect. Did you notice how that changes the pacing of the story?',
        tip: 'Pointing out style choices helps you collect new vocabulary in context.',
      },
      {
        id: 'culture-invite',
        situation: 'Inviting a friend to an event',
        macedonian: 'Имам две карти за концерт со традиционални инструменти вечерва. Би сакал да ми се придружиш и после да попиеме чај.',
        english: 'I have two tickets for a traditional instruments concert tonight. I would love for you to join me and grab tea afterwards.',
        tip: 'Notice the polite invitation structure with „би сакал“ + да + глагол.',
      },
    ],
    translatorSnippets: [
      {
        id: 'culture-gallery-opening',
        title: 'Weekend cultural bulletin',
        sourceLang: 'mk',
        text:
          'Во сабота Кратово ја отвора новата галерија „Камен мост" со изложба на млади сликари кои истражуваат рурални мотиви. Организаторите најавуваат и работилници за деца и џез концерт на плоштадот.',
        prompt:
          'Summarise the announcement in English, then list three vocabulary items you want to reuse when you speak with the tutor.',
      },
      {
        id: 'culture-community-project',
        title: 'Community heritage project',
        sourceLang: 'en',
        text:
          'Local artists are organising a travelling exhibit that pairs archival photos with new oral-history recordings from villagers. The team hopes to collect sayings, lullabies, and recipes before the end of the year.',
        prompt:
          'Translate this summary into Macedonian and highlight two idioms you would like a native speaker to validate.',
      },
    ],
    pronunciationDrills: [
      {
        id: 'culture-rhythm-drill',
        title: 'Rhythm practice: cultural reportage',
        instructions:
          'Shadow each sentence, clapping lightly on the stressed syllables. Aim for smooth pitch drops at the end of statements.',
        lines: [
          'Новата изложба ги спојува старите фотографии со современи стихови.',
          'Секој посетител може да остави кратко аудио со своја семејна приказна.',
          'Организаторите ветуваат дека ќе објават дигитална архива до декември.',
        ],
      },
      {
        id: 'culture-intonation-drill',
        title: 'Intonation practice: cultural invitations',
        instructions:
          'Read the invitations aloud twice—првпат поинакво нагласување за ентузијазам, вторпат за смирен, формален тон.',
        lines: [
          'Дојдете во сабота навечер, ќе имаме проекција на документарци на отворено.',
          'Би сакале да ни се придружите на работилницата за полифонично пеење.',
          'Ако имате стари фотографии, донесете ги за да ги дигитализираме заедно.',
        ],
      },
    ],
    taskPreset: {
      note: 'Track the cultural materials you sample each week so you can discuss them with the tutor or in your journal.',
      columns: {
        todo: [
          {
            title: 'Article summary',
            description:
              'Choose a Macedonian article, summarise it in English, and note two grammar patterns you want to analyse.',
          },
          {
            title: 'Listening lab',
            description:
              'Shadow a podcast segment for three minutes. Record yourself and mark timestamps that need pronunciation work.',
          },
        ],
        'in-progress': [
          {
            title: 'Reflection draft',
            description:
              'Write a short journal entry in Macedonian responding to the media you explored. Highlight new vocabulary.',
          },
        ],
        done: [
          {
            title: 'Share-out prompt',
            description:
              'Prepare two discussion questions you can ask a tutor or study partner about the cultural theme.',
          },
        ],
      },
    },
  },
};
