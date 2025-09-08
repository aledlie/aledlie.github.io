import Reporter from '../types';
import { Result } from 'axe-core';
import { Page } from 'playwright';
export default class JUnitReporter implements Reporter {
    protected verbose: boolean | undefined;
    protected page: Page | undefined;
    protected outputFilename: string | undefined;
    constructor(verbose: boolean | undefined, page: Page | undefined, outputFilename: string | undefined);
    report(violations: Result[]): Promise<void>;
}
