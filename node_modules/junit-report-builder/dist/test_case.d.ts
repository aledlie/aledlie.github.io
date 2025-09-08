import { TestNode } from './test_node';
import type { XMLElement } from 'xmlbuilder';
export declare class TestCase extends TestNode {
    private _error;
    private _failure;
    private _skipped;
    private _standardOutput;
    private _standardError;
    private _stacktrace;
    private _errorAttributes;
    private _failureAttributes;
    private _errorAttachment;
    private _errorContent;
    constructor();
    /**
     * @param className
     * @returns this
     */
    className(className: string): this;
    /**
     * @param {string} filepath
     * @returns {TestCase}
     */
    file(filepath: string): this;
    /**
     * @param message
     * @param type
     * @returns this
     */
    failure(message?: string, type?: string): this;
    /**
     * @param message
     * @param type
     * @param content
     * @returns this
     */
    error(message?: string, type?: string, content?: string): this;
    /**
     * @param stacktrace
     * @returns this
     */
    stacktrace(stacktrace?: string): this;
    /**
     * @returns this
     */
    skipped(): this;
    /**
     * @param log
     * @returns this
     */
    standardOutput(log?: string): this;
    /**
     * @param log
     * @returns this
     */
    standardError(log?: string): this;
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
    getSkippedCount(): 1 | 0;
    /**
     *
     * @param path
     * @returns this
     */
    errorAttachment(path: string): this;
    /**
     * @param parentElement - the parent element
     */
    build(parentElement: XMLElement): XMLElement;
}
