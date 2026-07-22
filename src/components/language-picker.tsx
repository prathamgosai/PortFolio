"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

/**
 * A world-languages dropdown that machine-translates the whole page via Google
 * Translate. We keep Google's own widget hidden (#google_translate_element) and
 * drive it from our own styled <select>: on change we set the value of Google's
 * injected `.goog-te-combo` select and dispatch a change event, so the page
 * translates in place with no reload.
 *
 * The Google banner/iframe is suppressed via CSS in globals.css.
 */

// Google Translate language codes → display names. Trimmed to a broad,
// representative set of world languages; add/remove freely.
const LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "gu", label: "ગુજરાતી (Gujarati)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "ur", label: "اردو (Urdu)" },
  { code: "ar", label: "العربية (Arabic)" },
  { code: "zh-CN", label: "中文 (Chinese)" },
  { code: "ja", label: "日本語 (Japanese)" },
  { code: "ko", label: "한국어 (Korean)" },
  { code: "es", label: "Español (Spanish)" },
  { code: "fr", label: "Français (French)" },
  { code: "de", label: "Deutsch (German)" },
  { code: "pt", label: "Português (Portuguese)" },
  { code: "it", label: "Italiano (Italian)" },
  { code: "ru", label: "Русский (Russian)" },
  { code: "nl", label: "Nederlands (Dutch)" },
  { code: "tr", label: "Türkçe (Turkish)" },
  { code: "vi", label: "Tiếng Việt (Vietnamese)" },
  { code: "th", label: "ไทย (Thai)" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "ms", label: "Bahasa Melayu (Malay)" },
  { code: "fa", label: "فارسی (Persian)" },
  { code: "pl", label: "Polski (Polish)" },
  { code: "uk", label: "Українська (Ukrainian)" },
  { code: "he", label: "עברית (Hebrew)" },
  { code: "el", label: "Ελληνικά (Greek)" },
  { code: "sv", label: "Svenska (Swedish)" },
  { code: "ro", label: "Română (Romanian)" },
  { code: "hu", label: "Magyar (Hungarian)" },
  { code: "cs", label: "Čeština (Czech)" },
  { code: "fi", label: "Suomi (Finnish)" },
  { code: "da", label: "Dansk (Danish)" },
  { code: "no", label: "Norsk (Norwegian)" },
  { code: "sw", label: "Kiswahili (Swahili)" },
  { code: "ne", label: "नेपाली (Nepali)" },
  { code: "si", label: "සිංහල (Sinhala)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
  { code: "fil", label: "Filipino" },
];

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate: {
        TranslateElement: new (options: Record<string, unknown>, element: string) => void;
      };
    };
  }
}

const SCRIPT_ID = "google-translate-script";

function loadGoogleTranslate() {
  if (document.getElementById(SCRIPT_ID)) return;

  window.googleTranslateElementInit = () => {
    if (!window.google) return;
    new window.google.translate.TranslateElement(
      { pageLanguage: "en", autoDisplay: false },
      "google_translate_element",
    );
  };

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

/** Read the currently applied language out of the `googtrans` cookie. */
function currentLangFromCookie(): string {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
  if (!match) return "en";
  const parts = decodeURIComponent(match[1]).split("/"); // "/en/hi"
  return parts[2] || "en";
}

export function LanguagePicker() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    loadGoogleTranslate();
    // Reflect any already-applied translation (from a prior visit) in the
    // select. Deferred so it doesn't run synchronously inside the effect body.
    queueMicrotask(() => setLang(currentLangFromCookie()));
  }, []);

  const applyLanguage = (code: string) => {
    setLang(code);

    // Drive Google's hidden combo box; retry briefly in case the widget's
    // script hasn't injected it yet on the very first interaction.
    let attempts = 0;
    const tick = () => {
      const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (combo) {
        combo.value = code;
        combo.dispatchEvent(new Event("change"));
        return;
      }
      if (attempts++ < 20) setTimeout(tick, 150);
    };
    tick();
  };

  return (
    // Compact globe trigger sized to match the other pill controls. The native
    // <select> is overlaid invisibly so the whole button opens the language list
    // (keeps full keyboard + screen-reader support for all 40+ world languages).
    <div className="group relative grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-white/8 hover:text-fg focus-within:text-fg">
      {/* Hidden host that Google Translate initialises into. */}
      <div id="google_translate_element" aria-hidden className="absolute h-0 w-0 overflow-hidden" />

      <Globe className="h-4 w-4" aria-hidden />
      <label className="sr-only" htmlFor="language-picker">
        Choose language
      </label>
      <select
        id="language-picker"
        value={lang}
        onChange={(e) => applyLanguage(e.target.value)}
        aria-label="Choose language"
        className="notranslate absolute inset-0 cursor-pointer opacity-0"
        translate="no"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="bg-bg text-fg">
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
