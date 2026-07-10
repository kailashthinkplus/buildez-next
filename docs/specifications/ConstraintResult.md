# ConstraintResult

## TypeScript Interfaces

```ts
export interface ConstraintResult {
  passed: boolean;
  evaluatedRuleIds: string[];
  violations: ConstraintViolation[];
  warnings: ConstraintViolation[];
  confidence: number;
}

export interface ConstraintViolation {
  ruleId: string;
  severity: 'blocker' | 'major' | 'minor' | 'info';
  scope: string;
  targetId?: string;
  message: string;
  repairHint?: ConstraintRepairHint;
}

export interface ConstraintRepairHint {
  action: string;
  target?: string;
  message: string;
}
```

## Field Descriptions

`passed` is false when blockers exist. Violations identify the rule, target, and repair path. Confidence indicates how complete the rule evaluation was.

## Example Object

```ts
const result: ConstraintResult = {
  passed: false,
  evaluatedRuleIds: ['restaurant.no_invented_menu_prices'],
  violations: [{
    ruleId: 'restaurant.no_invented_menu_prices',
    severity: 'blocker',
    scope: 'industry',
    targetId: 'menu',
    message: 'Menu prices are required but were not provided.',
    repairHint: { action: 'remove_or_request_fact', target: 'menu.price', message: 'Omit prices or ask for menu pricing.' }
  }],
  warnings: [],
  confidence: 1
};
```

## Validation Rules

Blockers must set `passed` to false. Every violation should include actionable text and rule ID.

## Versioning Notes

Results are tied to constraint rule versions and engine version.

## Multi-Industry Example

The same result shape records violations for property availability, medical credentials, menu prices, vehicle authorization, or education outcomes.
