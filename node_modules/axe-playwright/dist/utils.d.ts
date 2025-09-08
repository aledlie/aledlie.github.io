import { NodeViolation } from './types';
import { ImpactValue, Result } from 'axe-core';
export declare const getImpactedViolations: (violations: Result[], includedImpacts?: ImpactValue[]) => Result[];
export declare const testResultDependsOnViolations: (violations: Result[], skipFailures: boolean) => void;
export declare const describeViolations: (violations: Result[]) => NodeViolation[];
