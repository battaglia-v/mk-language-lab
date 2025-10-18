// Translation provider interface for pluggable translation services

export interface TranslationProvider {
  translate(text: string, sourceLang: string, targetLang: string): Promise<string>;
  detectLanguage(text: string): Promise<string>;
}

// Google Cloud Translation API v3 Provider
export class GoogleTranslateProvider implements TranslationProvider {
  async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sourceLang, targetLang }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      return data.translation;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await fetch('/api/translate/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Language detection failed');
      }

      const data = await response.json();
      return data.language;
    } catch (error) {
      console.error('Language detection error:', error);
      throw error;
    }
  }
}

// Fallback/Mock provider for development without API keys
export class MockTranslateProvider implements TranslationProvider {
  async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    // Simple mock translation
    return `[Mock translation from ${sourceLang} to ${targetLang}]: ${text}`;
  }

  async detectLanguage(text: string): Promise<string> {
    // Simple heuristic detection
    const cyrillicPattern = /[\u0400-\u04FF]/;
    return cyrillicPattern.test(text) ? 'mk' : 'en';
  }
}

// Factory function to get the appropriate provider
export function getTranslationProvider(): TranslationProvider {
  // Check if Google API is configured
  const hasGoogleKey = process.env.NEXT_PUBLIC_HAS_GOOGLE_TRANSLATE === 'true';
  
  if (hasGoogleKey) {
    return new GoogleTranslateProvider();
  }
  
  return new MockTranslateProvider();
}
