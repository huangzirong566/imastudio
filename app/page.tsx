"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setImageUrl(""); // 清空上一张图

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      // -------------------------------------------------------
      // 👇 关键修改在这里：我们要把响应当成 Blob (二进制大对象) 处理
      // -------------------------------------------------------
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);

    } catch (error) {
      console.error(error);
      alert("生成失败: " + (error instanceof Error ? error.message : "未知错误"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
        ImaStudio AI
      </h1>

      <div className="w-full max-w-2xl space-y-6">
        <textarea
          className="w-full h-32 p-4 rounded-xl bg-gray-900 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none text-lg"
          placeholder="Describe your imagination... (e.g. A cyberpunk cat in neon city)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            loading || !prompt
              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 active:scale-95"
          }`}
        >
          {loading ? "Generating Magic..." : "Generate Image"}
        </button>

        {/* 图片展示区域 */}
        {imageUrl && (
          <div className="mt-8 rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
            <img 
              src={imageUrl} 
              alt="Generated AI Art" 
              className="w-full h-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
}
