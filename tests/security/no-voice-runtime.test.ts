import { readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

const roots = ['app', 'components', 'lib'];
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.mjs']);

function sourceFiles(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const target = join(path, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return sourceExtensions.has(extname(entry.name)) ? [target] : [];
  });
}

describe('challenge voice boundary', () => {
  it('keeps microphone, WebRTC, speech recognition, and OpenAI runtime code out of the public app', () => {
    const source = [
      ...roots.flatMap(sourceFiles),
      'package.json',
      'next.config.ts',
    ].map((path) => readFileSync(path, 'utf8')).join('\n');

    expect(source).not.toMatch(/navigator\.mediaDevices|getUserMedia\(|SpeechRecognition|webkitSpeechRecognition|RTCPeerConnection|api\.openai\.com|from ['"]openai['"]/u);
  });
});
