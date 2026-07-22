import { indexRepositoryRecords } from "./indexer";

/**
 * Backward-compatible real estate graph export.
 *
 * @example
 * const graph = realEstateLeadGenGraph;
 */
export const realEstateLeadGenGraph = indexRepositoryRecords().data;
