import OpenAI from "openai";
import { ApiError } from "@/lib/api/errors";

// Deterministic, dependency-free pre-filter. Catches blatant abuse before an
// LLM call is made (saving credits and latency); nuanced judgement is left to
// each feature's own system-prompt instructions and to the moderation API
// second pass below.
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

// Requests to build/clone something whose sole purpose is credential theft or
// brand impersonation. Kept to unambiguous "build a fake/spoofed X" phrasing
// so a legitimate business asking for their OWN login page isn't caught.
const PHISHING_PATTERNS: RegExp[] = [
  /\b(fake|spoof(ed)?|cloned?|replica|look-?alike) (login|sign-?in|bank|paypal|checkout|payment) (page|site|website|form|portal)\b/i,
  /\bphish(ing)?\b/i,
  /\bharvest(ing)? (passwords?|credit ?cards?|credentials?|logins?)\b/i,
  /\bsteal (passwords?|credit ?card|credentials?|bank details|logins?|identit(y|ies))\b/i,
  /\bimpersonat(e|ing) (a |the )?(bank|paypal|apple|microsoft|government|irs|amazon|a company)\b/i,
  /\b(fake|counterfeit) (invoice|payment|checkout|wire transfer) (page|site|form)\b/i,
  /\b(secretly |covertly )?(collect|capture|log) (visitors'?|users'?|customers'?) (card|payment|banking) details? without (their )?(consent|knowledge)\b/i,
  /\bclone (of |)(paypal|a bank|a bank's website|someone's website) (to|for)\b/i,
];

// Only the most unambiguous, no-legitimate-website-use-case requests for
// illegal activity. Kept narrow — e.g. a real gun store, pharmacy, or
// cannabis dispensary website is entirely legitimate business work.
const ILLEGAL_CONTENT_PATTERNS: RegExp[] = [
  /\bhow to (make|synthesize|cook|manufacture|build) (meth(amphetamine)?|heroin|cocaine|fentanyl|a bomb|an explosive|a weapon|a gun|ransomware|malware)\b/i,
  /\bsell(ing)? (drugs|firearms|weapons|counterfeit (goods|money|currency)|stolen (goods|cards|data)) (online|on this (site|website))\b/i,
  /\b(child|minor)s? (porn(ography)?|sexual(ly)?|explicit) (content|material|images?|videos?)\b/i,
  /\bhuman trafficking\b/i,
  /\b(buy|sell|make) (fake|forged|counterfeit) (passports?|ids?|documents?|currency|money)\b/i,
  /\bmoney laundering (site|website|scheme|operation)\b/i,
  /\bcarding\b/i,
  /\bhack(ing)? into (someone'?s?|a|the) (account|website|system|server)\b/i,
  /\bddos (attack|tool|service)\b/i,
  /\billegal (weapons?|firearms?|drugs?) (marketplace|store|shop)\b/i,
  /\bdark ?web (marketplace|drug|weapon)\b/i,
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

const MODERATION_CATEGORY_MESSAGES: Record<string, string> = {
  sexual: "This request describes sexual content, which BuildEZ does not allow.",
  "sexual/minors": "This request describes sexual content involving minors, which BuildEZ does not allow.",
  hate: "This request describes hateful content, which BuildEZ does not allow.",
  "hate/threatening": "This request describes hateful, threatening content, which BuildEZ does not allow.",
  harassment: "This request describes harassing content, which BuildEZ does not allow.",
  "harassment/threatening": "This request describes threatening, harassing content, which BuildEZ does not allow.",
  "self-harm": "This request describes self-harm, which BuildEZ does not allow.",
  "self-harm/intent": "This request describes self-harm, which BuildEZ does not allow.",
  "self-harm/instructions": "This request describes self-harm, which BuildEZ does not allow.",
  violence: "This request describes violent content, which BuildEZ does not allow.",
  "violence/graphic": "This request describes graphic violence, which BuildEZ does not allow.",
  illicit: "This request describes illegal activity, which BuildEZ does not allow.",
  "illicit/violent": "This request describes illegal, violent activity, which BuildEZ does not allow.",
};

function messageForCategories(categories: string[]) {
  for (const category of categories) {
    const message = MODERATION_CATEGORY_MESSAGES[category];
    if (message) return message;
  }
  return "This request was flagged by our content policy. Please rephrase it.";
}

function codeForCategories(categories: string[]) {
  return categories.some((category) => category.startsWith("illicit"))
    ? "PROMPT_ILLEGAL_CONTENT"
    : "PROMPT_MODERATION_FLAGGED";
}

/**
 * Real-classifier second pass via OpenAI's free `omni-moderation-latest`
 * model, covering hate/harassment/violence/self-harm/sexual content and
 * (via its `illicit`/`illicit/violent` categories) general illegal-activity
 * requests that the local regex lists above don't anticipate.
 *
 * Fails open: if the API key isn't configured, or the moderation call itself
 * errors (timeout, outage), the request proceeds rather than being blocked
 * by a provider hiccup unrelated to the user's actual prompt.
 */
async function assertPassesModerationApi(value: string) {
  if (!process.env.OPENAI_API_KEY) return;

  let response;
  try {
    // Short timeout + no extra SDK retries: this check should fail open
    // fast rather than make the user wait on a hanging/retrying provider
    // call before falling through to "not flagged".
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 8_000, maxRetries: 0 });
    response = await client.moderations.create({
      model: "omni-moderation-latest",
      input: value,
    });
  } catch (error) {
    console.error("[moderation] omni-moderation-latest check failed", error);
    return;
  }

  const result = response.results?.[0];
  if (!result?.flagged) return;

  const flaggedCategories = Object.entries(result.categories || {})
    .filter(([, isFlagged]) => isFlagged)
    .map(([category]) => category);

  throw new ApiError(
    messageForCategories(flaggedCategories),
    400,
    codeForCategories(flaggedCategories),
  );
}

export async function assertPromptAllowed(text: string) {
  const value = (text || "").trim();
  if (!value) return;

  if (PROFANITY_PATTERNS.some((pattern) => pattern.test(value))) {
    throw new ApiError(
      "Please rephrase your request without profanity.",
      400,
      "PROMPT_PROFANITY",
    );
  }

  if (PHISHING_PATTERNS.some((pattern) => pattern.test(value))) {
    throw new ApiError(
      "This request describes phishing or credential-harvesting content, which BuildEZ does not allow.",
      400,
      "PROMPT_PHISHING",
    );
  }

  if (ILLEGAL_CONTENT_PATTERNS.some((pattern) => pattern.test(value))) {
    throw new ApiError(
      "This request describes illegal activity, which BuildEZ does not allow.",
      400,
      "PROMPT_ILLEGAL_CONTENT",
    );
  }

  if (OFF_TOPIC_PATTERNS.some((pattern) => pattern.test(value))) {
    throw new ApiError(
      "This assistant only helps with your website, marketing and business tasks. Please ask something related to that.",
      400,
      "PROMPT_OUT_OF_SCOPE",
    );
  }

  await assertPassesModerationApi(value);
}
