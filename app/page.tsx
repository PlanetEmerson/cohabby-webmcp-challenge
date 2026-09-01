import { DecisionRoom } from '@/components/decision-room/decision-room';

export default function Home() {
  const sourceRevision = process.env.SOURCE_COMMIT_SHA
    ?? process.env.VERCEL_GIT_COMMIT_SHA
    ?? 'local';
  return <DecisionRoom sourceRevision={sourceRevision} />;
}
