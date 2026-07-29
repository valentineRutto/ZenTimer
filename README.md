# Zen Timer Focus

-An ambient focus timer with goals, themes, relaxing sounds, and a deep focus lock.

Zen Timer provides a persistent focus timer through Chrome’s New Tab page and side panel, with countdown, count-up, break, goal, and ambient-sound features.

[zen-timer-focus.vercel.app/
](https://zen-timer-focus.vercel.app/)

## Chrome extension

[Get the Chrome extension from chrome webstore](https://chromewebstore.google.com/detail/ldghdeggjpjicoofpenephbhimggmkld?utm_source=item-share-cb)

### Local development

Build the extension files:

```sh
npm run build:extension
```

Then load the generated `dist` folder in Chrome:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select this project's `dist` folder.

The extension opens Zen Timer Focus as Chrome's New Tab page and as the toolbar popup. A background service worker keeps timer state in Chrome storage, so active sessions continue after the popup closes.

## Gallery

<table>
  <tr>
    <td colspan="2" align="center">
      <img src="docs/images/zen-timer-marquee-promo-1400x560.jpg" alt="Zen Timer promotional marquee showing the active focus timer" />
      <br />
      <sub><b>Focus deeply. Work beautifully.</b></sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="docs/images/01-own-your-next-25-minutes.jpg" alt="Zen Timer countdown timer and focus goals" />
      <br />
      <sub><b>Own your next 25 minutes</b></sub>
    </td>
    <td width="50%" align="center">
      <img src="docs/images/05-stay-in-the-flow.jpg" alt="Zen Timer active session with sound controls and goals" />
      <br />
      <sub><b>Stay in the flow</b></sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="docs/images/07-lock-in-tune-out.jpg" alt="Zen Timer distraction-free Deep Focus Lock mode" />
      <br />
      <sub><b>Lock in. Tune everything out.</b></sub>
    </td>
    <td width="50%" align="center">
      <img src="docs/images/08-focus-without-leaving-your-tab.jpg" alt="Zen Timer Chrome extension side panel" />
      <br />
      <sub><b>Focus without leaving your tab</b></sub>
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img width="128" src="docs/images/store-icon-128.png" alt="Zen Timer extension icon" />
      <br />
      <sub><b>Extension icon</b></sub>
    </td>
  </tr>
</table>
