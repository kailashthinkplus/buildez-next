"use client";

import { useState } from "react";
import { logMarketingCtaClick } from "@/modules/legal/MarketingAnalytics";

const SUGGESTIONS = ["Business Website", "Product Landing Page", "Portfolio", "Startup Launch"];

export function BuildWithAI() {
  const [sitePrompt, setSitePrompt] = useState("");

  return (
    <section className="prompt-builder" aria-labelledby="prompt-builder-title">
      <div className="prompt-heading reveal">
        <span className="section-no">BUILD WITH AI</span>
        <h2 id="prompt-builder-title">
          Describe the idea.
          <br />
          <em>Watch it become a website.</em>
        </h2>
        <p>Tell Build Ezy what you want to launch. Start with a sentence, then shape every detail visually.</p>
      </div>
      <form
        className="prompt-shell reveal"
        onSubmit={(event) => {
          event.preventDefault();
          const value = sitePrompt.trim();
          if (!value) return;
          logMarketingCtaClick("prompt_builder_submit");
          window.location.href = `/app/signup?prompt=${encodeURIComponent(value)}`;
        }}
      >
        <div className="prompt-glow" aria-hidden="true" />
        <span className="prompt-mode">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="10" cy="10" r="7" />
            <path d="M3 10h14M10 3c2.4 2.1 3.5 4.4 3.5 7S12.4 14.9 10 17M10 3C7.6 5.1 6.5 7.4 6.5 10S7.6 14.9 10 17" />
          </svg>{" "}
          Website
        </span>
        <textarea
          aria-label="Describe the website you want to build"
          value={sitePrompt}
          onChange={(event) => setSitePrompt(event.target.value)}
          placeholder="A modern company website with clear services, strong proof, and a premium visual identity…"
          rows={2}
        />
        <button className="prompt-submit" type="submit" aria-label="Start building from this description" disabled={!sitePrompt.trim()}>
          <svg className="cta-arrow" aria-hidden="true" viewBox="0 0 20 20">
            <path d="M3 10h13M11 5l5 5-5 5" />
          </svg>
        </button>
      </form>
      <div className="prompt-suggestions reveal" aria-label="Prompt suggestions">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() =>
              setSitePrompt(`Create a premium ${suggestion.toLowerCase()} with a clear story, responsive layout, and strong calls to action.`)
            }
          >
            {suggestion}
          </button>
        ))}
      </div>
    </section>
  );
}
