import { V11_VISUAL_FIXTURE_IDS } from "../../visual/visualFixture";
export const ENGINEERING_REGRESSION_FIXTURES=Object.freeze(V11_VISUAL_FIXTURE_IDS.map(fixtureId=>Object.freeze({fixtureId,classification:"engineering-regression" as const,qualityClaim:"none" as const})));
