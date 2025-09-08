import { TestGroup } from './test_group';
import type { Factory } from './factory';
export declare class TestSuites extends TestGroup {
    /**
     * @param factory
     */
    constructor(factory: Factory);
    /**
     * @returns a new created test suite
     */
    testSuite(): import("./test_suite").TestSuite;
}
