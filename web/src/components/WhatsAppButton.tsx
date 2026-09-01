"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!dismissed) setShowTooltip(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-20 right-0 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-2xl">
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-2 top-2 rounded-full p-1 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="pr-6 text-sm font-medium text-slate-900">
            Chat with us on WhatsApp!
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Ask about courses, tournaments, or book a free trial lesson.
          </p>
          <a
            href="https://wa.me/2348081635986?text=Hi%20Prochess!%20I%27m%20interested%20in%20your%20chess%20courses."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#20BD5A]"
          >
            <MessageCircle className="h-4 w-4" />
            Start Chat
          </a>
        </div>
      )}

      {/* Button */}
      <a
        href="https://wa.me/2348081635986?text=Hi%20Prochess!%20I%27m%20interested%20in%20your%20chess%20courses."
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-btn flex items-center justify-center"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg
          viewBox="0 0 24 24"
          width="30"
          height="30"
          fill="white"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </div>
  );
}
