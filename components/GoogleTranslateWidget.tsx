'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const STYLE_TAG_ID = 'google-translate-custom-style';

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

    let initialised = false;

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
        initialised = true;
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

    const failTimer = window.setTimeout(() => {
      if (!initialised) {
        setHasError(true);
      }
    }, 8000);

    return () => {
      delete window.googleTranslateElementInit;
      window.clearTimeout(failTimer);
    };
  }, [elementId]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    let styleTag = document.getElementById(STYLE_TAG_ID);

    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = STYLE_TAG_ID;
      styleTag.textContent = `
        #${elementId} .goog-te-gadget {
          font-size: 0;
        }

        #${elementId} .goog-te-gadget-simple {
          border: none !important;
          background: transparent !important;
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          padding: 0 !important;
          min-width: 210px;
        }

        #${elementId} .goog-te-gadget-simple > span:nth-of-type(1) {
          display: none !important;
        }

        #${elementId} .goog-te-gadget-simple > span:nth-of-type(2) {
          display: flex !important;
          width: 100%;
        }

        #${elementId} .goog-te-combo {
          border-radius: 12px;
          padding: 10px 14px;
          border: 1px solid rgba(148, 163, 184, 0.28);
          background: rgba(15, 18, 30, 0.04);
          color: inherit;
          font-size: 14px;
          line-height: 1.1;
          outline: none;
          width: 100%;
          max-width: 260px;
          transition: border 0.2s ease, box-shadow 0.2s ease;
        }

        #${elementId} .goog-te-combo:focus {
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.35);
        }

        .goog-te-banner-frame.skiptranslate,
        body > .skiptranslate {
          display: none !important;
        }

        body {
          top: 0 !important;
        }
      `;
      document.head.appendChild(styleTag);
    }

    return () => {
      const node = document.getElementById(STYLE_TAG_ID);
      if (node) {
        node.remove();
      }
    };
  }, [elementId]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const select = document.querySelector<HTMLSelectElement>(
      `#${elementId} select.goog-te-combo`
    );

    if (!select) {
      return;
    }

    select.setAttribute('aria-label', 'Select translation language direction');
    select.setAttribute('title', 'Select translation language direction');

    if (!select.options[0]?.value) {
      select.options[0].text = 'Select language / Избери јазик';
    }
  }, [elementId, isReady]);

  return (
    <div className="rounded-2xl border border-border/40 bg-card/80 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            G
          </span>
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">Google Translate</p>
            <p className="text-xs text-muted-foreground">Instant Macedonian ↔ English</p>
          </div>
        </div>
        <span className="rounded-full bg-muted px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
          {isReady ? 'Ready' : hasError ? 'Offline' : 'Loading'}
        </span>
      </div>

      <div className="relative mt-5 min-h-[60px]">
        <div
          id={elementId}
          className={`transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}
        />

        {!isReady && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-dashed border-primary/30 bg-muted/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{loadingLabel}</span>
            </div>
          </div>
        )}
      </div>

      {hasError && errorLabel ? (
        <p className="mt-4 text-sm text-destructive">{errorLabel}</p>
      ) : null}
    </div>
  );
}
