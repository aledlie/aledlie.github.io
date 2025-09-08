import Reporter from '../types';
import { Result } from 'axe-core';
export default class DefaultTerminalReporter implements Reporter {
    protected detailedReport: boolean | undefined;
    protected includeHtml: boolean | undefined;
    protected verbose: boolean | undefined;
    constructor(detailedReport: boolean | undefined, includeHtml: boolean | undefined, verbose: boolean | undefined);
    report(violations: Result[]): Promise<void>;
}
