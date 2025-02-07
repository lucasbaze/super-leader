'use client';

import * as React from 'react';

import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: any) => void;
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  return (
    <Picker
      data={data}
      onEmojiSelect={onEmojiSelect}
      theme='light'
      set='native'
      perLine={9}
      previewPosition='none'
      showPreview={false}
      showSkinTones={false}
      emojiSize={22}
      emojiButtonSize={28}
      maxFrequentRows={0}
      navPosition='bottom'
    />
  );
}
