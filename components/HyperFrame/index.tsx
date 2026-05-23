"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from "@heygen/streaming-avatar";
import { fetchHeyGenToken, DEFAULT_AVATAR_ID, DEFAULT_VOICE_ID } from "@/lib/heygen";
import ControlPanel from "./ControlPanel";

type SessionState = "idle" | "connecting" | "connected" | "error";

export default function HyperFrame() {
  const avatarRef = useRef<StreamingAvatar | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [error, setError] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "avatar"; text: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const addMessage = (role: "user" | "avatar", text: string) => {
    setMessages((prev) => [...prev, { role, text }]);
  };

  const startSession = useCallback(async () => {
    setSessionState("connecting");
    setError("");
    try {
      const token = await fetchHeyGenToken();
      const avatar = new StreamingAvatar({ token });
      avatarRef.current = avatar;

      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        if (videoRef.current && event.detail) {
          videoRef.current.srcObject = event.detail;
          videoRef.current.play().catch(() => {});
        }
        setSessionState("connected");
      });

      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        setSessionState("idle");
        setIsSpeaking(false);
        setIsListening(false);
        if (videoRef.current) videoRef.current.srcObject = null;
      });

      avatar.on(StreamingEvents.AVATAR_START_TALKING, () => setIsSpeaking(true));
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => setIsSpeaking(false));

      avatar.on(StreamingEvents.USER_START, () => setIsListening(true));
      avatar.on(StreamingEvents.USER_STOP, () => setIsListening(false));

      await avatar.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: DEFAULT_AVATAR_ID,
        voice: {
          voiceId: DEFAULT_VOICE_ID || undefined,
          emotion: VoiceEmotion.FRIENDLY,
        },
        language: "en",
        disableIdleTimeout: false,
      });

      await avatar.startVoiceChat({ isInputAudioMuted: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session");
      setSessionState("error");
    }
  }, []);

  const endSession = useCallback(async () => {
    if (avatarRef.current) {
      await avatarRef.current.stopAvatar();
      avatarRef.current = null;
    }
    setSessionState("idle");
    setIsSpeaking(false);
    setIsListening(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const sendText = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !avatarRef.current || sessionState !== "connected") return;
    setInputText("");
    addMessage("user", text);
    try {
      await avatarRef.current.speak({
        text,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC,
      });
      addMessage("avatar", text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  }, [inputText, sessionState]);

  const toggleMute = useCallback(() => {
    if (!avatarRef.current) return;
    if (isMuted) {
      avatarRef.current.startListening();
    } else {
      avatarRef.current.stopListening();
    }
    setIsMuted((prev) => !prev);
  }, [isMuted]);

  const interrupt = useCallback(async () => {
    if (avatarRef.current) {
      await avatarRef.current.interrupt();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (avatarRef.current) {
        avatarRef.current.stopAvatar();
      }
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-950 text-white overflow-hidden">
      {/* Video Panel */}
      <div className="relative flex-1 flex items-center justify-center bg-black">
        {sessionState === "idle" || sessionState === "error" ? (
          <div className="flex flex-col items-center gap-6 p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                HeyGen HyperFrame
              </h1>
              <p className="mt-2 text-gray-400 text-sm">Interactive AI Avatar Experience</p>
            </div>
            {error && (
              <p className="text-red-400 text-sm bg-red-900/30 border border-red-800 rounded-lg px-4 py-2 max-w-sm">
                {error}
              </p>
            )}
            <button
              onClick={startSession}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Start Session
            </button>
          </div>
        ) : sessionState === "connecting" ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-300 text-sm">Connecting to HyperFrame…</p>
          </div>
        ) : null}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ${
            sessionState === "connected" ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Status indicators */}
        {sessionState === "connected" && (
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="flex items-center gap-1.5 text-xs bg-black/60 backdrop-blur px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
            {isSpeaking && (
              <span className="flex items-center gap-1.5 text-xs bg-black/60 backdrop-blur px-2.5 py-1 rounded-full text-violet-300">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                Speaking
              </span>
            )}
            {isListening && (
              <span className="flex items-center gap-1.5 text-xs bg-black/60 backdrop-blur px-2.5 py-1 rounded-full text-blue-300">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Listening
              </span>
            )}
          </div>
        )}

        {sessionState === "connected" && (
          <ControlPanel
            onEnd={endSession}
            onInterrupt={interrupt}
            onToggleMute={toggleMute}
            isMuted={isMuted}
            isSpeaking={isSpeaking}
          />
        )}
      </div>

      {/* Chat Panel */}
      {sessionState === "connected" && (
        <div className="w-full lg:w-96 flex flex-col border-l border-gray-800 bg-gray-950">
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-gray-300">Conversation</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.length === 0 && (
              <p className="text-center text-gray-600 text-xs pt-8">
                Start talking or type a message below
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-violet-600 text-white rounded-br-sm"
                      : "bg-gray-800 text-gray-200 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-800 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendText()}
              placeholder="Type a message…"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
            <button
              onClick={sendText}
              disabled={!inputText.trim()}
              className="w-9 h-9 flex-shrink-0 rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
