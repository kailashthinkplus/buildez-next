export function requestsFullPageGeneration(prompt: string) {
  return /\b(?:build|create|design|generate|regenerate|make|redesign|rebuild|recreate|replace|revamp)\b[\s\S]{0,100}\b(?:website|site|landing page|homepage|home page|page)\b/i
    .test(prompt);
}
