'use client';

import React, { useState, useRef } from "react";

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleGenerate() {
    if (!prompt.trim()) {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      return;
    }
    setGenerating(true);
    setImageUrl(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (!res.ok) throw new Error("Failed to generate image.");
      const data = await res.json();
      if (!data?.imageUrl) throw new Error("No image returned.");
      setImageUrl(data.imageUrl);
    } catch (err: any) {
      alert(err.message || "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="bg-neutral-900 rounded-2xl shadow-xl p-6 flex flex-col gap-6">
          <div className="relative">
            <textarea
              ref={textareaRef}
              rows={4}
              className="w-full resize-none bg-neutral-800 text-neutral-50 placeholder-neutral-500 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              placeholder="Describe your imagination..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              disabled={generating}
              spellCheck={false}
            />
            <button
              className="absolute bottom-3 right-3 px-5 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold text-base shadow-lg transition-transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
            >
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>
          {imageUrl && (
            <div className="w-full flex justify-center mt-2">
              <img
                src={imageUrl}
                alt="AI generated"
                className="rounded-2xl shadow-2xl max-w-full max-h-[500px] object-contain bg-neutral-800 border border-neutral-700"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
