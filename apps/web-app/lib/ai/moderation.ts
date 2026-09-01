import { ApiError } from "@/lib/api/errors";

// Deterministic, dependency-free pre-filter. Catches blatant abuse before an
// LLM call is made (saving credits and latency); nuanced judgement is left to
// each feature's own system-prompt instructions.
const PROFANITY_PATTERNS: RegExp[] = [
  /\bf+u+c+k+(ing|ers?|ed)?\b/i,
  /\bs+h+i+t+(ty|ting)?\b/i,
  /\bb+i+t+c+h+(es)?\b/i,
  /\ba+s+s+h+o+l+e+s?\b/i,
  /\bc+u+n+t+s?\b/i,
  /\bd+i+c+k+(head)?s?\b/i,
  /\bb+a+s+t+a+r+d+s?\b/i,
  /\bs+l+u+t+s?\b/i,
  /\bw+h+o+r+e+s?\b/i,
  /\bn+i+g+g+(a|er)s?\b/i,
  /\bf+a+g+g+o+t+s?\b/i,
  /\br+e+t+a+r+d+(ed)?\b/i,
  /\bp+o+r+n+(ography|hub)?\b/i,
];

// Only the most unambiguous, no-legitimate-website-use-case requests.
// Kept deliberately narrow to avoid false-positiving real site/business asks
// (which is why "write code for X" or general creative asks aren't here —
// those can be entirely legitimate website work).
const OFF_TOPIC_PATTERNS: RegExp[] = [
  /\bwrite (me |us )?(a |an )?(poem|song|rap|lyrics)\b/i,
  /\btell me a joke\b/i,
  /\bdo my homework\b/i,
  /\bwrite (my|me a) (essay|resume|cover letter)\b/i,
  /\bwho (is|was) the (president|prime minister) of\b/i,
  /\bsolve (this|the following) (math|equation|calculus)\b/i,
  /\bignore (all |your )?(previous|prior|above) instructions\b/i,
  /\byou are now\b.{0,30}\b(dan|jailbreak)\b/i,
];

export function assertPromptAllowed(text: string) {
  const value = (text || "").trim();
  if (!value) return;

  if (PROFANITY_PATTERNS.some((pattern) => pattern.test(value))) {
    throw new ApiError(
      "Please rephrase your request without profanity.",
      400,
      "PROMPT_PROFANITY",
    );
  }

  if (OFF_TOPIC_PATTERNS.some((pattern) => pattern.test(value))) {
    throw new ApiError(
      "This assistant only helps with your website, marketing and business tasks. Please ask something related to that.",
      400,
      "PROMPT_OUT_OF_SCOPE",
    );
  }
}
