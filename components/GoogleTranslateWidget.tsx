'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (options: unknown, elementId: string) => unknown;
        InlineLayout: {
          SIMPLE: unknown;
        };
      };
    };
  }
}

type GoogleTranslateWidgetProps = {
  loadingLabel?: string;
  errorLabel?: string;
};

export default function GoogleTranslateWidget({ loadingLabel, errorLabel }: GoogleTranslateWidgetProps) {
  const elementId = 'google_translate_element';
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const initializeWidget = () => {
      try {
        if (!window.google || !window.google.translate) {
          return;
        }

        const translateAny = window.google.translate as Record<string, unknown>;
        const TranslateElementConstructor = translateAny.TranslateElement as
          | (new (options: unknown, elementId: string) => unknown)
          | undefined;
        const inlineLayout = (translateAny.TranslateElement as { InlineLayout?: { SIMPLE?: unknown } } | undefined)?.InlineLayout;

        if (
          !TranslateElementConstructor ||
          typeof TranslateElementConstructor !== 'function' ||
          !inlineLayout?.SIMPLE
        ) {
          return;
        }

        new TranslateElementConstructor(
          {
            pageLanguage: 'mk',
            includedLanguages: 'mk,en',
            layout: inlineLayout.SIMPLE,
            autoDisplay: false,
          },
          elementId
        );
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialise Google Translate widget:', error);
        setHasError(true);
      }
    };

    window.googleTranslateElementInit = initializeWidget;

    const existingScript = document.getElementById('google-translate-script');

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onerror = () => {
        setHasError(true);
      };
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      initializeWidget();
    }

    return () => {
      delete window.googleTranslateElementInit;
    };
  }, [elementId]);

  return (
    <div className="space-y-3">
      <div
        id={elementId}
        className="min-h-[52px] rounded-md border border-dashed border-primary/30 bg-card/40 p-4"
      />
      {!isReady && !hasError && loadingLabel ? (
        <p className="text-sm text-muted-foreground">{loadingLabel}</p>
      ) : null}
      {hasError && errorLabel ? (
        <p className="text-sm text-destructive">{errorLabel}</p>
      ) : null}
    </div>
  );
}
