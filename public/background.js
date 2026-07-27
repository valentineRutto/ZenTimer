const RUNTIME_KEY = 'zentimer_runtime';
const COMPLETION_ALARM = 'zentimer_countdown_complete';

function computeRuntime(runtime, now = Date.now()) {
  if (!runtime || !runtime.isActive) {
    return runtime || null;
  }

  const elapsedSeconds = Math.max(0, Math.floor((now - runtime.startedAt) / 1000));
  const currentSeconds =
    runtime.mode === 'up'
      ? runtime.baseSeconds + elapsedSeconds
      : Math.max(0, runtime.baseSeconds - elapsedSeconds);

  return {
    ...runtime,
    currentSeconds,
    elapsedSeconds,
    isActive: runtime.mode === 'up' || currentSeconds > 0,
  };
}

async function getStoredRuntime() {
  const data = await chrome.storage.local.get(RUNTIME_KEY);
  return data[RUNTIME_KEY] || null;
}

async function saveRuntime(runtime) {
  await chrome.storage.local.set({[RUNTIME_KEY]: runtime});
}

async function clearCompletionAlarm() {
  await chrome.alarms.clear(COMPLETION_ALARM);
}

async function scheduleCompletionAlarm(seconds) {
  await clearCompletionAlarm();
  if (seconds > 0) {
    await chrome.alarms.create(COMPLETION_ALARM, {
      when: Date.now() + seconds * 1000,
    });
  }
}

async function resumeTimer(payload) {
  const runtime = {
    isActive: true,
    mode: payload.mode,
    baseSeconds: Math.max(0, payload.timeLeft),
    durationSeconds: Math.max(0, payload.durationSeconds),
    startedAt: Date.now(),
    activeGoalId: payload.activeGoalId || null,
  };

  await saveRuntime(runtime);

  if (runtime.mode !== 'up') {
    await scheduleCompletionAlarm(runtime.baseSeconds);
  } else {
    await clearCompletionAlarm();
  }

  return computeRuntime(runtime);
}

async function pauseTimer() {
  const runtime = await getStoredRuntime();
  const computed = computeRuntime(runtime);

  if (!computed) {
    return null;
  }

  const stoppedRuntime = {
    ...computed,
    isActive: false,
    baseSeconds: computed.currentSeconds,
    startedAt: Date.now(),
  };

  await clearCompletionAlarm();
  await saveRuntime(stoppedRuntime);
  return computeRuntime(stoppedRuntime);
}

async function resetTimer() {
  const runtime = {
    isActive: false,
    mode: 'down',
    baseSeconds: 0,
    durationSeconds: 0,
    startedAt: Date.now(),
    activeGoalId: null,
    currentSeconds: 0,
    elapsedSeconds: 0,
  };

  await clearCompletionAlarm();
  await saveRuntime(runtime);
  return runtime;
}

async function getTimer() {
  const runtime = await getStoredRuntime();
  const computed = computeRuntime(runtime);

  if (computed && !computed.isActive) {
    await clearCompletionAlarm();
    await saveRuntime({
      ...computed,
      baseSeconds: computed.currentSeconds,
      startedAt: Date.now(),
    });
  }

  return computed;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(RUNTIME_KEY).then((data) => {
    if (!data[RUNTIME_KEY]) {
      resetTimer();
    }
  });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== COMPLETION_ALARM) {
    return;
  }

  const runtime = await getStoredRuntime();
  const computed = computeRuntime(runtime);

  if (!computed || computed.mode === 'up') {
    return;
  }

  await saveRuntime({
    ...computed,
    isActive: false,
    baseSeconds: 0,
    currentSeconds: 0,
    startedAt: Date.now(),
  });

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon-128.png',
    title: computed.mode === 'break' ? 'Break complete' : 'Zen Timer complete',
    message: computed.mode === 'break'
      ? 'Your break is over. Ready to focus?'
      : 'Your focus session has ended.',
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const respond = async () => {
    switch (message?.type) {
      case 'zentimer:get':
        return getTimer();
      case 'zentimer:resume':
        return resumeTimer(message.payload);
      case 'zentimer:pause':
        return pauseTimer();
      case 'zentimer:reset':
        return resetTimer();
      default:
        return null;
    }
  };

  respond()
    .then((timer) => sendResponse({ok: true, timer}))
    .catch((error) => sendResponse({ok: false, error: error?.message || String(error)}));

  return true;
});
