"use client";

interface ControlPanelProps {
  onEnd: () => void;
  onInterrupt: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  isSpeaking: boolean;
}

export default function ControlPanel({
  onEnd,
  onInterrupt,
  onToggleMute,
  isMuted,
  isSpeaking,
}: ControlPanelProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 backdrop-blur-md rounded-full px-5 py-3 shadow-2xl border border-white/10">
      {/* Mute / Unmute mic */}
      <button
        onClick={onToggleMute}
        title={isMuted ? "Unmute microphone" : "Mute microphone"}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
          isMuted
            ? "bg-red-600 hover:bg-red-500"
            : "bg-gray-700 hover:bg-gray-600"
        }`}
      >
        {isMuted ? (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      {/* Interrupt avatar */}
      <button
        onClick={onInterrupt}
        disabled={!isSpeaking}
        title="Interrupt avatar"
        className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
      >
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
        </svg>
      </button>

      {/* End session */}
      <button
        onClick={onEnd}
        title="End session"
        className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
      >
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
        </svg>
      </button>
    </div>
  );
}
