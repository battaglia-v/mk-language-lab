'use client';

import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTTS } from '@/hooks/use-tts';
import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef } from 'react';

type ButtonProps = ComponentPropsWithoutRef<typeof Button>;

interface TTSButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  /** Text to speak when clicked */
  text: string;
  /** Language: 'mk' for Macedonian, 'en' for English */
  lang?: 'mk' | 'en';
  /** Show icon only (no label) */
  iconOnly?: boolean;
  /** Custom label for accessibility */
  label?: string;
}

/**
 * TTSButton - Text-to-Speech button for playing audio of text
 *
 * Uses Web Speech API with Serbian as fallback for Macedonian
 * Shows loading/speaking states with appropriate icons
 *
 * @example
 * <TTSButton text="Здраво" lang="mk" iconOnly />
 * <TTSButton text="Hello" lang="en" label="Listen" />
 */
export function TTSButton({
  text,
  lang = 'mk',
  iconOnly = true,
  label = 'Listen',
  className,
  variant = 'ghost',
  size = 'sm',
  disabled,
  ...props
}: TTSButtonProps) {
  const { speak, stop, isSpeaking, isLoading, isSupported } = useTTS({ lang });

  const handleClick = async () => {
    if (isSpeaking) {
      stop();
    } else {
      await speak(text);
    }
  };

  if (!isSupported) {
    return null; // Don't render if TTS not supported
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        iconOnly && 'h-10 w-10 rounded-full p-0',
        isSpeaking && 'text-primary',
        className
      )}
      aria-label={isSpeaking ? 'Stop audio' : label}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      ) : isSpeaking ? (
        <VolumeX className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Volume2 className="h-5 w-5" aria-hidden="true" />
      )}
      {!iconOnly && <span className="ml-2">{label}</span>}
    </Button>
  );
}

export default TTSButton;
