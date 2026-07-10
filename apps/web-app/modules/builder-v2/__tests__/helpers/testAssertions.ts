export type RegressionAssertion = {
  name: string;
  passed: boolean;
  message?: string;
};

export function assertCondition(
  name: string,
  condition: boolean,
  message?: string
): RegressionAssertion {
  return {
    name,
    passed: condition,
    message: condition ? undefined : message,
  };
}

export function assertEqual<T>(
  name: string,
  actual: T,
  expected: T
): RegressionAssertion {
  return assertCondition(
    name,
    Object.is(actual, expected),
    `Expected ${String(expected)} but received ${String(actual)}.`
  );
}

export function assertAllPassed(assertions: RegressionAssertion[]): boolean {
  return assertions.every((assertion) => assertion.passed);
}

export type RegressionSpec = {
  id: string;
  title: string;
  bugIds: string[];
  level: "L1" | "L2" | "L3" | "L4" | "L5";
  status: "compile-safe" | "pending-runner" | "expected-failing";
  assertions: RegressionAssertion[];
  runnerRequirement?: string;
};

export function createRegressionSpec(spec: RegressionSpec): RegressionSpec {
  return spec;
}
