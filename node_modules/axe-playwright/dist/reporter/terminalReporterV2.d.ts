import Reporter from '../types';
import { Result } from 'axe-core';
export default class TerminalReporterV2 implements Reporter {
    protected verbose: boolean | undefined;
    constructor(verbose: boolean | undefined);
    report(violations: Result[]): Promise<void>;
}
