'use client';

import { useEffect, useRef, useState } from 'react';

import { useVoiceVisualizer, VoiceVisualizer } from 'react-voice-visualizer';

import { Mic, SendHorizontal } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
}

export function ChatInput({ input, handleInputChange, handleSubmit, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const recorderControls = useVoiceVisualizer();
  const { startRecording, stopRecording, recordedBlob, error } = recorderControls;

  // Toggle recording state
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
    setIsRecording(!isRecording);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    if (error) {
      console.error('Recording error:', error);
    }
  }, [error]);

  return (
    <form onSubmit={handleSubmit} className='flex items-end space-x-2 p-4'>
      {isRecording ? (
        <div className='h-10 w-full rounded-sm border'>
          <VoiceVisualizer
            controls={recorderControls}
            backgroundColor='transparent'
            mainBarColor='black'
            barWidth={3}
            gap={2}
            isControlPanelShown={false}
            height={40}
          />
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          placeholder='Send a message...'
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as any);
            }
          }}
          rows={1}
          className='min-h-[40px] w-full'
        />
      )}

      {/* <Button type='button' size='icon' onClick={toggleRecording} disabled={isProcessing}>
        <Mic className={isRecording ? 'text-red-500' : 'text-white'} />
      </Button> */}

      {/* Waveform Visualization */}

      <Button type='submit' size='icon' className='size-10' disabled={isLoading || !input.trim()}>
        <SendHorizontal className='size-4' />
        <span className='sr-only'>Send message</span>
      </Button>
    </form>
  );
}
