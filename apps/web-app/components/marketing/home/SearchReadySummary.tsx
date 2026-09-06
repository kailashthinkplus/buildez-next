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
] as const;

export function SearchReadySummary() {
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
        {ANSWERS.map(({ question, answer }) => (
          <div className="answer-item reveal" key={question}>
            <dt>{question}</dt>
            <dd>{answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
