'use client';

export default function AnimatedCTA() {
  const handleWaitlistOpen = () => {
    window.open('https://getwaitlist.com/buildez', '_blank');
  };

  return (
    <button
      onClick={handleWaitlistOpen}
      className="cta-glow-border group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-bold text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
    >
      Join Waitlist →
    </button>
  );
}
