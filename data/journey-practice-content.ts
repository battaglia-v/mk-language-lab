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
  },
  travel: {
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
  },
};
