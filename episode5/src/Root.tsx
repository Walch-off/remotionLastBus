import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, staticFile, useCurrentFrame, delayRender, continueRender} from 'remotion';
import {SHOTS, TOTAL_FRAMES, FPS, W, H, XFADE} from './story';
import {SHOT_COMPONENTS} from './scenes/Shots';
import {Subtitles} from './components/Subtitles';
import {InteractiveFinal, TitleBadge} from './components/Overlays';
import {SHOTS2, TOTAL2} from './ep2/story2';
import {SHOTS2_COMPONENTS} from './ep2/Shots2';
import {Subtitles2} from './ep2/Subtitles2';
import {TitleBadge2, VoteResult, InteractiveFinal2} from './ep2/Overlays2';
import {SHOTS3, TOTAL3} from './ep3/story3';
import {SHOTS3_COMPONENTS} from './ep3/Shots3';
import {Subtitles3} from './ep3/Subtitles3';
import {TitleBadge3, VoteResult3, InteractiveFinal3} from './ep3/Overlays3';
import {LastBus4, LastBus4Test} from './ep4/Episode4';
import {LastBus5, LastBus5Test} from './ep5/Episode5';
import {TOTAL5} from './ep5/story5';
import {TOTAL4} from './ep4/story4';

const Fade: React.FC<{children: React.ReactNode; fade: boolean}> = ({children, fade}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: fade ? Math.min(1, (f + 1) / XFADE) : 1}}>{children}</AbsoluteFill>;
};

const Preload: React.FC = () => {
  const [h] = React.useState(() => delayRender('sprites'));
  React.useEffect(() => {
    const names = ['head', 'torso', 'armL', 'armR', 'legs'];
    Promise.all(names.map((n) => new Promise<void>((res) => { const i = new Image(); i.onload = () => res(); i.onerror = () => res(); i.src = staticFile(`parts/${n}.png`); })))
      .then(() => continueRender(h));
  }, [h]);
  return null;
};

const LastBus: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0a1024', fontFamily: 'Inter'}}>
    {SHOTS.map((s, i) => {
      const C = SHOT_COMPONENTS[s.id];
      const off = i === 0 ? 0 : XFADE;
      const from = Math.round(s.a * FPS) - off;
      const end = i === SHOTS.length - 1 ? TOTAL_FRAMES : Math.round(SHOTS[i + 1].a * FPS);
      return (
        <Sequence key={s.id} from={from} durationInFrames={end - from + (i === SHOTS.length - 1 ? 0 : 0)} name={s.id}>
          <Fade fade={i > 0}><C t0={from / FPS} /></Fade>
        </Sequence>
      );
    })}
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <TitleBadge />
        <InteractiveFinal />
        <Subtitles />
      </svg>
    </AbsoluteFill>
    {/* звук: голос — основной слой; музыка, атмосфера и эффекты — отдельные дорожки, тише голоса */}
    <Audio src={staticFile('audio/voice_final.wav')} volume={1} />
    <Audio src={staticFile('audio/ambience.wav')} volume={0.1} />
    <Audio src={staticFile('audio/music.wav')} volume={0.1} />
    <Audio src={staticFile('audio/sfx.wav')} volume={0.4} />
  </AbsoluteFill>
);

const LastBus2: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0a1024', fontFamily: 'Inter'}}>
    {SHOTS2.map((s, i) => {
      const C = SHOTS2_COMPONENTS[s.id];
      const off = i === 0 ? 0 : XFADE;
      const from = Math.round(s.a * FPS) - off;
      const end = i === SHOTS2.length - 1 ? TOTAL2 : Math.round(SHOTS2[i + 1].a * FPS);
      return (
        <Sequence key={s.id} from={from} durationInFrames={end - from} name={s.id}>
          <Fade fade={i > 0}><C t0={from / FPS} /></Fade>
        </Sequence>
      );
    })}
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <TitleBadge2 />
        <VoteResult />
        <InteractiveFinal2 />
        <Subtitles2 />
      </svg>
    </AbsoluteFill>
    <Audio src={staticFile('audio2/voice_final.wav')} volume={1} />
    <Audio src={staticFile('audio2/ambience.wav')} volume={0.1} />
    <Audio src={staticFile('audio2/music.wav')} volume={0.1} />
    <Audio src={staticFile('audio2/sfx.wav')} volume={0.4} />
  </AbsoluteFill>
);

const LastBus3: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0a1024', fontFamily: 'Inter'}}>
    {SHOTS3.map((s, i) => {
      const C = SHOTS3_COMPONENTS[s.id];
      const off = i === 0 ? 0 : XFADE;
      const from = Math.round(s.a * FPS) - off;
      const end = i === SHOTS3.length - 1 ? TOTAL3 : Math.round(SHOTS3[i + 1].a * FPS);
      return (
        <Sequence key={s.id} from={from} durationInFrames={end - from} name={s.id}>
          <Fade fade={i > 0}><C t0={from / FPS} /></Fade>
        </Sequence>
      );
    })}
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <TitleBadge3 />
        <VoteResult3 />
        <InteractiveFinal3 />
        <Subtitles3 />
      </svg>
    </AbsoluteFill>
    <Audio src={staticFile('audio3/voice_final.wav')} volume={1} />
    <Audio src={staticFile('audio3/ambience.wav')} volume={0.1} />
    <Audio src={staticFile('audio3/music.wav')} volume={0.1} />
    <Audio src={staticFile('audio3/sfx.wav')} volume={0.4} />
  </AbsoluteFill>
);

export const Root: React.FC = () => (
  <>
  <Composition id="LastBusPart5" component={LastBus5} durationInFrames={TOTAL5} fps={FPS} width={W} height={H} />
  <Composition id="LastBusPart5Test" component={LastBus5Test} durationInFrames={360} fps={FPS} width={W} height={H} />
  <Composition id="LastBusPart4" component={LastBus4} durationInFrames={TOTAL4} fps={FPS} width={W} height={H} />
  <Composition id="LastBusPart4Test" component={LastBus4Test} durationInFrames={300} fps={FPS} width={W} height={H} />
  <Composition id="LastBusPart3" component={LastBus3} durationInFrames={TOTAL3} fps={FPS} width={W} height={H} />
  <Composition id="LastBusPart2" component={LastBus2} durationInFrames={TOTAL2} fps={FPS} width={W} height={H} />
  <Composition id="LastBusPart1" component={LastBus} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
  </>
);
