'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Plus, BookOpen, MessageSquare, Repeat, Eye } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function TutorPage() {
  const t = useTranslations('tutor');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message || 'Sorry, I encountered an error.',
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Tutor error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: t('error'),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: t('planBuilder'), icon: BookOpen, prompt: 'Create a personalized study plan for learning Macedonian.' },
    { label: t('grammarHelp'), icon: MessageSquare, prompt: 'Explain Macedonian grammar basics.' },
    { label: t('drills'), icon: Repeat, prompt: 'Give me practice exercises for Macedonian vocabulary.' },
    { label: t('reviewSessions'), icon: Eye, prompt: 'Review my progress and suggest areas to focus on.' },
  ];

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* Chat Container */}
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col bg-card/50 backdrop-blur border-border/50 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-2xl font-semibold mb-6">How can I help you learn Macedonian?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={action.label}
                          variant="outline"
                          className="h-auto py-4 px-6 flex flex-col items-start gap-2 text-left"
                          onClick={() => handleQuickAction(action.prompt)}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-primary" />
                            <span className="font-semibold">{action.label}</span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <Avatar className="h-8 w-8 bg-gradient-to-br from-primary to-secondary">
                          <AvatarFallback className="text-white font-semibold">AI</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === 'user' && (
                        <Avatar className="h-8 w-8 bg-gradient-to-br from-cyan-500 to-blue-500">
                          <AvatarFallback className="text-white font-semibold">ME</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 bg-gradient-to-br from-primary to-secondary">
                        <AvatarFallback className="text-white font-semibold">AI</AvatarFallback>
                      </Avatar>
                      <div className="rounded-2xl px-4 py-3 bg-muted">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border/50 p-4 bg-background/50">
              <div className="flex gap-2">
                {messages.length > 0 && (
                  <Button variant="outline" size="icon" onClick={handleNewChat}>
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={t('typePlaceholder')}
                  className="min-h-[60px] max-h-[200px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="h-[60px] w-[60px]"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
          <p>Креирано од <span className="font-semibold text-foreground">Винсент Баталија</span></p>
        </div>
      </footer>
    </div>
  );
}
