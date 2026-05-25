import type {TimerMode} from './constants';

export type ExtensionTimerSnapshot = {
  isActive: boolean;
  mode: TimerMode;
  baseSeconds: number;
  durationSeconds: number;
  startedAt: number;
  activeGoalId: string | null;
  currentSeconds: number;
  elapsedSeconds: number;
};

type ChromeRuntime = {
  runtime?: {
    id?: string;
    lastError?: {message?: string};
    sendMessage?: (
      message: unknown,
      callback: (response?: {ok: boolean; timer?: ExtensionTimerSnapshot; error?: string}) => void,
    ) => void;
  };
};

type TimerStartPayload = {
  mode: TimerMode;
  timeLeft: number;
  durationSeconds: number;
  activeGoalId: string | null;
};

const getChromeRuntime = () => {
  const chromeLike = globalThis as typeof globalThis & {chrome?: ChromeRuntime};
  const runtime = chromeLike.chrome?.runtime;
  return runtime?.id && runtime.sendMessage ? runtime : null;
};

const sendTimerMessage = (message: unknown) =>
  new Promise<ExtensionTimerSnapshot | null>((resolve) => {
    const runtime = getChromeRuntime();

    if (!runtime?.sendMessage) {
      resolve(null);
      return;
    }

    runtime.sendMessage(message, (response) => {
      if (runtime.lastError || !response?.ok) {
        resolve(null);
        return;
      }

      resolve(response.timer || null);
    });
  });

export const getExtensionTimer = () => sendTimerMessage({type: 'zentimer:get'});

export const startExtensionTimer = (payload: TimerStartPayload) =>
  sendTimerMessage({type: 'zentimer:start', payload});

export const stopExtensionTimer = () => sendTimerMessage({type: 'zentimer:stop'});

export const resetExtensionTimer = () => sendTimerMessage({type: 'zentimer:reset'});
