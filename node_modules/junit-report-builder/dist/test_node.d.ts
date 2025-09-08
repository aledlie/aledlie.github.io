import xmlBuilder, { type XMLElement } from 'xmlbuilder';
export declare abstract class TestNode {
    private _elementName;
    protected _attributes: any;
    private _properties;
    /**
     * @param elementName - the name of the XML element
     */
    constructor(elementName: string);
    /**
     * @param name
     * @param value
     * @returns this
     */
    property(name: string, value: string): this;
    /**
     * @param name
     * @param value
     * @returns this
     */
    multilineProperty(name: string, value: string): this;
    /**
     * @param name
     * @returns this
     */
    name(name: string): this;
    /**
     * @param timeInSeconds
     * @returns this
     */
    time(timeInSeconds: number): this;
    /**
     * @returns the number of test cases
     */
    abstract getTestCaseCount(): number;
    /**
     * @returns the number of failed test cases
     */
    abstract getFailureCount(): number;
    /**
     * @returns the number of errored test cases
     */
    abstract getErrorCount(): number;
    /**
     * @returns the number of skipped test cases
     */
    abstract getSkippedCount(): number;
    /**
     * @param parentElement - the parent element
     */
    build(parentElement?: XMLElement): xmlBuilder.XMLElement;
    /**
     * @param parentElement - the parent element
     * @returns the created element
     */
    protected createElement(parentElement?: XMLElement): XMLElement;
    /**
     * @returns the created root element
     */
    private createRootElement;
    /**
     * @protected
     * @param date
     * @returns {string}
     */
    protected formatDate(date: Date): string;
    /**
     * @param element
     * @returns the created element
     */
    protected buildNode(element: XMLElement): XMLElement;
}
