"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const ANSWERS = [
  {
    question: "What is Build Ezy?",
    answer:
      "Build Ezy is an AI-powered website operating system for designing, publishing, selling, and understanding performance from one connected workspace.",
  },
  {
    question: "Who is Build Ezy for?",
    answer:
      "It is built for founders, freelancers, agencies, and growing businesses that want a professional website without maintaining a patchwork of separate tools.",
  },
  {
    question: "What can I manage in Build Ezy?",
    answer:
      "You can manage responsive pages, brand systems, domains, publishing, products, payments, customer relationships, analytics, and AI-assisted workflows.",
  },
  {
    question: "Do I need to know how to code?",
    answer:
      "No. You can start from a prompt or a visual foundation, edit directly on the page, preview responsive layouts, and publish without writing code.",
  },
  {
    question: "Can I connect my own domain?",
    answer:
      "Yes. Add a custom domain from your dashboard and Build Ezy handles verification and SSL automatically — your site goes live on your own address.",
  },
  {
    question: "What happens if I need help?",
    answer:
      "Every plan includes support from our team for setup, domains, billing, and general questions, alongside in-app guidance as you build.",
  },
] as const;

export function SearchReadySummary() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="answer-section" aria-labelledby="answer-section-title">
      <div className="answer-heading reveal">
        <span className="section-no">BUILD EZY, CLEARLY EXPLAINED</span>
        <h2 id="answer-section-title">
          One platform.
          <br />
          <em>Clear answers.</em>
        </h2>
      </div>
      <dl className="answer-grid">
        {ANSWERS.map(({ question, answer }, index) => {
          const open = openIndex === index;
          return (
            <div className={`answer-item reveal${open ? " is-open" : ""}`} key={question}>
              <dt>
                <button
                  type="button"
                  className="answer-toggle"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? null : index)}
                >
                  <span>{question}</span>
                  <Plus size={16} className="answer-toggle-icon" aria-hidden="true" />
                </button>
              </dt>
              <dd>
                <div className="answer-panel-inner">{answer}</div>
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
