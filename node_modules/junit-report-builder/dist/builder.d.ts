import { TestCase } from './test_case';
import { TestSuite } from './test_suite';
import { Factory } from './factory';
export declare class JUnitReportBuilder {
    private _factory;
    private _rootTestSuites;
    /**
     * @param factory
     */
    constructor(_factory: Factory);
    /**
     * @param reportPath
     */
    writeTo(reportPath: string): void;
    /**
     * @returns a string representation of the JUnit report
     */
    build(): string;
    /**
     * @param name
     * @returns this
     */
    name(name: string): this;
    /**
     * @returns a test suite
     */
    testSuite(): TestSuite;
    /**
     * @returns a test case
     */
    testCase(): TestCase;
    /**
     * @returns a new builder
     */
    newBuilder(): JUnitReportBuilder;
}
