'use client';
import { useState } from 'react';
import s from './style.module.css';
// import Tooltip from '@/components/base/tooltip';
import { Tooltip } from 'antd';
import { Loading } from '@/components/icon/communication';
import { AudioPlayerManager } from '@/components/base/audio-btn/audio.player.manager';

interface AudioBtnProps {
  id?: string
  voice?: string
  value?: string
  className?: string
  isAudition?: boolean
  noCache?: boolean
}

type AudioState = 'initial' | 'loading' | 'playing' | 'paused' | 'ended'

const AudioBtn = ({
  id,
  voice,
  value,
  className,
  isAudition
}: AudioBtnProps) => {
  const [audioState, setAudioState] = useState<AudioState>('initial');

  const audio_finished_call = (event: string): any => {
    switch (event) {
      case 'ended':
        setAudioState('ended');
        break;
      case 'paused':
        setAudioState('ended');
        break;
      case 'loaded':
        setAudioState('loading');
        break;
      case 'play':
        setAudioState('playing');
        break;
      case 'error':
        setAudioState('ended');
        break;
    }
  };

  const handleToggle = async () => {
    if(audioState === 'playing' || audioState === 'loading') {
      setTimeout(() => setAudioState('paused'), 1);
      AudioPlayerManager.getInstance().getAudioPlayer('text-to-audio', true, id, value, voice, audio_finished_call).pauseAudio();
    } else {
      setTimeout(() => setAudioState('loading'), 1);
      AudioPlayerManager.getInstance().getAudioPlayer('text-to-audio', true, id, value, voice, audio_finished_call).playAudio();
    }
  };

  const tooltipContent = {
    initial: '播放',
    ended: '播放',
    paused: '暂停',
    playing: '播放中',
    loading: '加载中'
  }[audioState];

  return (
    <div className={`inline-flex items-center justify-center ${(audioState === 'loading' || audioState === 'playing') ? 'mr-1' : className}`}>
      <Tooltip title={tooltipContent}>
        <button
          disabled={audioState === 'loading'}
          className={`box-border w-6 h-6 flex items-center justify-center cursor-pointer ${isAudition ? 'p-0.5' : 'p-0 rounded-md bg-white'}`}
          onClick={handleToggle}
        >
          {audioState === 'loading'
            ? (
              <div className="w-full h-full rounded-md flex items-center justify-center">
                <Loading />
              </div>
            )
            : (
              <div className={`w-full h-full rounded-md flex items-center justify-center ${!isAudition ? 'hover:bg-gray-50' : 'hover:bg-gray-50'}`}>
                <div className={`w-4 h-4 ${(audioState === 'playing') ? s.pauseIcon : s.playIcon}`} />
              </div>
            )}
        </button>
      </Tooltip>
    </div>
  );
};

export default AudioBtn;
