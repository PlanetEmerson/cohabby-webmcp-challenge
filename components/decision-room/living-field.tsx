'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import type { LivingMatchboardStage } from '@/lib/decision-room/visual-stage';
import { cn } from '@/lib/utils/cn';

const MeshGradient = dynamic(
  () => import('@paper-design/shaders-react').then((module) => module.MeshGradient),
  { ssr: false },
);

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

function canAnimateShader(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  if ((navigator as NavigatorWithConnection).connection?.saveData) return false;
  return 'WebGLRenderingContext' in window;
}

const stageOpacity: Record<LivingMatchboardStage, string> = {
  ready: 'opacity-35',
  brief: 'opacity-40',
  rooms: 'opacity-55',
  synergy: 'opacity-80',
  comparison: 'opacity-50',
  introduction: 'opacity-45',
  confirmed: 'opacity-60',
};

export function LivingField({ stage }: { stage: LivingMatchboardStage }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(canAnimateShader());
  }, []);

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] transition-opacity duration-500',
        stageOpacity[stage],
      )}
      aria-hidden="true"
      data-living-field={animated ? 'shader' : 'static'}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_5%,rgba(255,107,74,0.52),transparent_34%),radial-gradient(circle_at_90%_20%,rgba(0,166,153,0.42),transparent_38%),radial-gradient(circle_at_52%_105%,rgba(244,201,93,0.36),transparent_40%)]" />
      {animated ? (
        <MeshGradient
          className="absolute inset-0 h-full w-full"
          width="100%"
          height="100%"
          colors={['#FF896E', '#FFEFE9', '#F4C95D', '#E3F4F1', '#33B8AD']}
          distortion={stage === 'synergy' ? 0.72 : 0.44}
          swirl={stage === 'synergy' ? 0.52 : 0.28}
          grainMixer={0.12}
          grainOverlay={0.035}
          speed={0.045}
          frame={0}
          minPixelRatio={0.75}
          maxPixelCount={750_000}
        />
      ) : null}
      <div className="absolute inset-0 bg-white/46" />
    </div>
  );
}
