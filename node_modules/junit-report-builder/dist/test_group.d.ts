import { TestNode } from './test_node';
import type { TestCase } from './test_case';
import type { XMLElement } from 'xmlbuilder';
import type { Factory } from './factory';
import type { TestSuite } from './test_suite';
export declare abstract class TestGroup extends TestNode {
    protected _factory: Factory;
    protected _children: (TestCase | TestSuite)[];
    /**
     * @param factory
     * @param elementName
     */
    constructor(_factory: Factory, elementName: string);
    /**
     * @param timestamp
     * @returns this
     */
    timestamp(timestamp: string | Date): this;
    /**
     * @returns the created test case
     */
    testCase(): TestCase;
    /**
     * @inheritdoc
     */
    getTestCaseCount(): number;
    /**
     * @inheritdoc
     */
    getFailureCount(): number;
    /**
     * @inheritdoc
     */
    getErrorCount(): number;
    /**
     * @inheritdoc
     */
    getSkippedCount(): number;
    /**
     * @param counterFunction - the function to count the test cases
     * @returns the sum of the counts of the test cases
     */
    protected _sumTestCaseCounts(counterFunction: (testCase: TestCase | TestSuite) => number): number;
    /**
     * @param parentElement - the parent element
     * @returns the newly created element
     */
    build(parentElement?: XMLElement): XMLElement;
    /**
     * @param element
     * @returns the built element
     */
    protected buildNode(element: XMLElement): XMLElement;
}
