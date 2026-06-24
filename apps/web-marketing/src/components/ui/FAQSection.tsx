'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'What is BuildEZ?',
      answer:
        'BuildEZ is an AI-powered website builder that helps you create premium, professional websites — including design, content, assets, and SEO — in minutes, without writing any code.'
    },
    {
      question: 'Who should use BuildEZ?',
      answer:
        'BuildEZ is ideal for founders, startups, businesses, creators, agencies, and teams who want a fast, modern website without relying on developers or complex tools.'
    },
    {
      question: 'How fast can I build a website with BuildEZ?',
      answer:
        'Most websites can be created in just a few minutes. You answer a few simple questions, and BuildEZ’s AI generates a complete, ready-to-publish website instantly.'
    },
    {
      question: 'Do I need coding or technical skills to launch a website?',
      answer:
        'No. You don’t need any coding or technical knowledge. BuildEZ’s AI hand-holds you through every step and takes care of everything required to launch a premium website.'
    },
    {
      question: 'How does BuildEZ ensure a premium finish?',
      answer:
        'BuildEZ’s AI guides layout, content structure, visuals, and design consistency, helping you publish a polished, professional website that looks thoughtfully crafted.'
    },
    {
      question: 'Does BuildEZ support themes and plugins?',
      answer:
        'Yes. BuildEZ includes a built-in theme system and a plugin marketplace, allowing you to extend functionality and customize your website as your needs grow.'
    },
    {
      question: 'What is the BuildEZ theme marketplace?',
      answer:
        'The theme marketplace offers professionally designed themes that are optimized for performance and conversions, and can be customized visually or enhanced using AI.'
    },
    {
      question: 'Can AI generate themes and design assets for my website?',
      answer:
        'Yes. BuildEZ’s AI can generate themes, layouts, images, and visual assets that align with your brand and industry automatically.'
    },
    {
      question: 'Can I edit my website after it is generated?',
      answer:
        'Yes. You can easily edit content, sections, layouts, and visuals at any time using the visual editor, without breaking design or performance.'
    },
    {
      question: 'Is hosting and maintenance included?',
      answer:
        'Yes. BuildEZ is fully managed. Hosting, performance optimization, security, and ongoing updates are all included.'
    },
    {
      question: 'Will my website be fast and SEO-friendly?',
      answer:
        'Absolutely. BuildEZ websites are optimized for speed and SEO by default, helping your site load quickly and perform better in search engines.'
    },
    {
      question: 'What makes BuildEZ different from other website builders?',
      answer:
        'BuildEZ combines AI-generated websites, a theme marketplace, built-in plugins, and AI-powered asset creation into one unified platform — removing the complexity of traditional website building.'
    },
    {
      question: 'Is BuildEZ suitable for agencies or multiple projects?',
      answer:
        'Yes. Agencies and professionals can use BuildEZ to create and manage multiple high-quality websites quickly and consistently.'
    },
    {
      question: 'Can my website grow as my business grows?',
      answer:
        'Yes. You can expand and evolve your website over time using themes, plugins, and AI-generated assets — without rebuilding from scratch.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="relative z-10 max-w-5xl mx-auto px-6 py-24"
    >
      <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12">
        Frequently Asked Questions
      </h2>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        {faqs.map((faq, index) => {
          const isOpen = activeIndex === index;

          return (
            <div
              key={index}
              className="border-b border-white/10 last:border-none"
            >
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors hover:bg-white/5"
              >
                <span className="text-base md:text-lg font-medium">
                  {faq.question}
                </span>

                <span
                  className={`ml-4 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                >
                  ▾
                </span>
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden px-6 pb-5 text-sm md:text-base text-white/80">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQSection;
