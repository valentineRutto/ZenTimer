export type Theme = {
  id: string;
  name: string;
  background: string;
  accent: string;
  text: string;
};

export const THEMES: Theme[] = [
  {
    id: 'aether',
    name: 'Aether',
    background: 'bg-[#0A0A0A]',
    accent: '#D4AF37',
    text: 'text-[#EAEAEA]',
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    background: 'bg-[#0A0A1A]',
    accent: '#4A90E2',
    text: 'text-[#E0E0FF]',
  },
  {
    id: 'deep-emerald',
    name: 'Deep Emerald',
    background: 'bg-[#0A1A0A]',
    accent: '#50C878',
    text: 'text-[#E0FFE0]',
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    background: 'bg-[#1A0A1A]',
    accent: '#9B59B6',
    text: 'text-[#FFE0FF]',
  }
];

export type Sound = {
  id: string;
  name: string;
  url: string;
  category: 'Ambient' | 'Sleep';
};

export const SOUNDS: Sound[] = [
  {
    id: 'rain',
    name: 'Soft Rain',
    url: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
    category: 'Ambient',
  },
  {
    id: 'forest',
    name: 'Forest Birds',
    url: 'https://assets.mixkit.co/active_storage/sfx/2437/2437-preview.mp3',
    category: 'Ambient',
  },
  {
    id: 'waves',
    name: 'Ocean Waves',
    url: 'https://assets.mixkit.co/active_storage/sfx/1188/1188-preview.mp3',
    category: 'Sleep',
  },
  {
    id: 'white-noise',
    name: 'White Noise',
    url: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
    category: 'Sleep',
  },
  {
    id: 'rainforest',
    name: 'Rainforest',
    url: 'https://assets.mixkit.co/active_storage/sfx/2438/2438-preview.mp3',
    category: 'Sleep',
  },
  {
    id: 'cosmic-hum',
    name: 'Cosmic Hum',
    url: 'https://assets.mixkit.co/active_storage/sfx/167/167-preview.mp3',
    category: 'Sleep',
  },
  {
    id: 'chill-pop',
    name: 'Chill Pop',
    url: 'https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3', // Placeholder for chill pop
    category: 'Sleep',
  }
];

export type TimerMode = 'down' | 'up';

export type Goal = {
  id: string;
  title: string;
  secondsSpent: number;
};
