'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

import { MessageSquare, Mic, MicOff, Send } from 'lucide-react';

import { MarkdownMessage } from '@/components/chat/messages/markdown-message';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface OnboardingChatProps {
  messages: Array<{
    id: string;
    role: string;
    content: string;
  }>;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  showShareValueAsk?: boolean;
  shareValueAsk?: string;
  // isRecording?: boolean;
  // toggleVoiceRecognition?: () => void;
}

export function OnboardingChat({
  messages,
  isLoading,
  onSendMessage,
  showShareValueAsk = false,
  shareValueAsk
  // isRecording = false,
  // toggleVoiceRecognition
}: OnboardingChatProps) {
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  return (
    <div className='flex h-[calc(100vh-80px)] flex-col pt-20'>
      <ScrollArea ref={scrollAreaRef} className='flex-1 overflow-y-auto p-4'>
        <div className='mx-auto max-w-3xl space-y-4 pb-10'>
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[80%] rounded-lg p-3',
                  message.role === 'user' && 'bg-primary text-primary-foreground'
                )}>
                <MarkdownMessage content={message.content} />
              </div>
            </div>
          ))}

          {isLoading && (
            <div className='flex justify-start'>
              <div className='max-w-[80%] rounded-lg bg-muted p-3'>
                <div className='flex space-x-2'>
                  <div className='bg-foreground/20 size-3 animate-bounce rounded-full' />
                  <div className='bg-foreground/20 size-3 animate-bounce rounded-full delay-100' />
                  <div className='bg-foreground/20 size-3 animate-bounce rounded-full delay-200' />
                </div>
              </div>
            </div>
          )}

          {showShareValueAsk && shareValueAsk && (
            <Card className='bg-primary/5 mx-auto mt-6 max-w-3xl border-primary p-4'>
              <h3 className='mb-2 text-lg font-medium'>Your Share Value Ask</h3>
              <p className='text-sm'>{shareValueAsk}</p>
            </Card>
          )}

          {/* Show a Claude-like input in message bubble if not loading */}
          {!isLoading && (
            <div className='mt-8 flex justify-end'>
              <div className='border-primary/20 max-w-[80%] rounded-lg border bg-primary p-3 text-primary-foreground'>
                <form onSubmit={handleSubmit} className='flex items-center gap-2'>
                  <Input
                    placeholder='Type your message...'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    className='flex-1 border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                  />
                  <Button
                    type='submit'
                    disabled={!input.trim() || isLoading}
                    size='sm'
                    variant='ghost'
                    className='size-8 p-0'>
                    <Send className='size-4' />
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* <div className='sticky bottom-0 border-t bg-background p-4'>
        <form onSubmit={handleSubmit} className='mx-auto flex max-w-3xl items-center gap-2'>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleVoiceRecognition}
            className={cn(isRecording && 'bg-red-100 text-red-600')}
            title={isRecording ? "Stop voice input" : "Start voice input"}
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Input
            placeholder={'Type your message...'}
            // placeholder={isRecording ? "Listening..." : "Type your message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className='flex-1'
          />

          <Button type='submit' disabled={!input.trim() || isLoading} size='icon'>
            <Send className='h-5 w-5' />
          </Button>
        </form>

        {isRecording && (
          <div className="text-center text-sm text-muted-foreground mt-2">
            <span className="inline-block animate-pulse">● </span>
            Speak now. Click the microphone button again to stop recording.
          </div>
        )}
      </div> */}
    </div>
  );
}
