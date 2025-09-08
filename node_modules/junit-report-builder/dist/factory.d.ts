import { JUnitReportBuilder } from './builder';
import { TestSuites } from './test_suites';
import { TestSuite } from './test_suite';
import { TestCase } from './test_case';
export declare class Factory {
    /**
     * @returns a newly created builder
     */
    newBuilder(): JUnitReportBuilder;
    /**
     * @returns a newly created test suite
     */
    newTestSuite(): TestSuite;
    /**
     * @returns a newly created test case
     */
    newTestCase(): TestCase;
    /**
     * @returns a newly created test suites
     */
    newTestSuites(): TestSuites;
}
