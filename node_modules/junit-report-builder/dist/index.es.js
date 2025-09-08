import path from 'path';
import makeDir from 'make-dir';
import fs from 'fs';
import _ from 'lodash';
import xmlBuilder from 'xmlbuilder';

class TestNode {
    /**
     * @param elementName - the name of the XML element
     */
    constructor(elementName) {
        this._elementName = elementName;
        this._attributes = {};
        this._properties = [];
    }
    /**
     * @param name
     * @param value
     * @returns this
     */
    property(name, value) {
        this._properties.push({ name: name, value: value, isPropertyWithTextContent: false });
        return this;
    }
    /**
     * @param name
     * @param value
     * @returns this
     */
    multilineProperty(name, value) {
        this._properties.push({ name: name, value: value, isPropertyWithTextContent: true });
        return this;
    }
    /**
     * @param name
     * @returns this
     */
    name(name) {
        this._attributes.name = name;
        return this;
    }
    /**
     * @param timeInSeconds
     * @returns this
     */
    time(timeInSeconds) {
        this._attributes.time = timeInSeconds;
        return this;
    }
    /**
     * @param parentElement - the parent element
     */
    build(parentElement) {
        return this.buildNode(this.createElement(parentElement));
    }
    /**
     * @param parentElement - the parent element
     * @returns the created element
     */
    createElement(parentElement) {
        if (parentElement) {
            return parentElement.ele(this._elementName, this._attributes);
        }
        return this.createRootElement();
    }
    /**
     * @returns the created root element
     */
    createRootElement() {
        const element = xmlBuilder.create(this._elementName, { encoding: 'UTF-8', invalidCharReplacement: '' });
        Object.keys(this._attributes).forEach((key) => {
            element.att(key, this._attributes[key]);
        });
        return element;
    }
    /**
     * @protected
     * @param date
     * @returns {string}
     */
    formatDate(date) {
        const pad = (num) => (num < 10 ? '0' : '') + num;
        return (date.getFullYear() +
            '-' +
            pad(date.getMonth() + 1) +
            '-' +
            pad(date.getDate()) +
            'T' +
            pad(date.getHours()) +
            ':' +
            pad(date.getMinutes()) +
            ':' +
            pad(date.getSeconds()));
    }
    /**
     * @param element
     * @returns the created element
     */
    buildNode(element) {
        if (this._properties.length) {
            var propertiesElement = element.ele('properties');
            _.forEach(this._properties, (property) => {
                if (property.isPropertyWithTextContent) {
                    propertiesElement.ele('property', { name: property.name }, property.value);
                }
                else {
                    propertiesElement.ele('property', { name: property.name, value: property.value });
                }
            });
        }
        return element;
    }
}

class TestGroup extends TestNode {
    /**
     * @param factory
     * @param elementName
     */
    constructor(_factory, elementName) {
        super(elementName);
        this._factory = _factory;
        this._children = [];
    }
    /**
     * @param timestamp
     * @returns this
     */
    timestamp(timestamp) {
        if (_.isDate(timestamp)) {
            this._attributes.timestamp = this.formatDate(timestamp);
        }
        else {
            this._attributes.timestamp = timestamp;
        }
        return this;
    }
    /**
     * @returns the created test case
     */
    testCase() {
        var testCase = this._factory.newTestCase();
        this._children.push(testCase);
        return testCase;
    }
    /**
     * @inheritdoc
     */
    getTestCaseCount() {
        return this._sumTestCaseCounts((testCase) => {
            return testCase.getTestCaseCount();
        });
    }
    /**
     * @inheritdoc
     */
    getFailureCount() {
        return this._sumTestCaseCounts((testCase) => {
            return testCase.getFailureCount();
        });
    }
    /**
     * @inheritdoc
     */
    getErrorCount() {
        return this._sumTestCaseCounts((testCase) => {
            return testCase.getErrorCount();
        });
    }
    /**
     * @inheritdoc
     */
    getSkippedCount() {
        return this._sumTestCaseCounts((testCase) => {
            return testCase.getSkippedCount();
        });
    }
    /**
     * @param counterFunction - the function to count the test cases
     * @returns the sum of the counts of the test cases
     */
    _sumTestCaseCounts(counterFunction) {
        var counts = this._children.map(counterFunction);
        return counts.reduce((sum, count) => sum + count, 0);
    }
    /**
     * @param parentElement - the parent element
     * @returns the newly created element
     */
    build(parentElement) {
        this._attributes.tests = this.getTestCaseCount();
        this._attributes.failures = this.getFailureCount();
        this._attributes.errors = this.getErrorCount();
        this._attributes.skipped = this.getSkippedCount();
        return super.build(parentElement);
    }
    /**
     * @param element
     * @returns the built element
     */
    buildNode(element) {
        element = super.buildNode(element);
        _.forEach(this._children, (child) => {
            child.build(element);
        });
        return element;
    }
}

class TestSuites extends TestGroup {
    /**
     * @param factory
     */
    constructor(factory) {
        super(factory, 'testsuites');
    }
    /**
     * @returns a new created test suite
     */
    testSuite() {
        var suite = this._factory.newTestSuite();
        this._children.push(suite);
        return suite;
    }
}

class JUnitReportBuilder {
    /**
     * @param factory
     */
    constructor(_factory) {
        this._factory = _factory;
        this._rootTestSuites = new TestSuites(_factory);
    }
    /**
     * @param reportPath
     */
    writeTo(reportPath) {
        makeDir.sync(path.dirname(reportPath));
        fs.writeFileSync(reportPath, this.build(), 'utf8');
    }
    /**
     * @returns a string representation of the JUnit report
     */
    build() {
        var xmlTree = this._rootTestSuites.build();
        return xmlTree.end({ pretty: true });
    }
    /**
     * @param name
     * @returns this
     */
    name(name) {
        this._rootTestSuites.name(name);
        return this;
    }
    /**
     * @returns a test suite
     */
    testSuite() {
        return this._rootTestSuites.testSuite();
    }
    /**
     * @returns a test case
     */
    testCase() {
        return this._rootTestSuites.testCase();
    }
    /**
     * @returns a new builder
     */
    newBuilder() {
        return this._factory.newBuilder();
    }
}

class TestSuite extends TestGroup {
    /**
     * @param factory
     */
    constructor(factory) {
        super(factory, 'testsuite');
    }
}

class TestCase extends TestNode {
    constructor() {
        super('testcase');
        this._error = false;
        this._failure = false;
        this._skipped = false;
        this._standardOutput = undefined;
        this._standardError = undefined;
        this._stacktrace = undefined;
        this._errorAttributes = {};
        this._failureAttributes = {};
        this._errorAttachment = undefined;
        this._errorContent = undefined;
    }
    /**
     * @param className
     * @returns this
     */
    className(className) {
        this._attributes.classname = className;
        return this;
    }
    /**
     * @param {string} filepath
     * @returns {TestCase}
     */
    file(filepath) {
        this._attributes.file = filepath;
        return this;
    }
    /**
     * @param message
     * @param type
     * @returns this
     */
    failure(message, type) {
        this._failure = true;
        if (message) {
            this._failureAttributes.message = message;
        }
        if (type) {
            this._failureAttributes.type = type;
        }
        return this;
    }
    /**
     * @param message
     * @param type
     * @param content
     * @returns this
     */
    error(message, type, content) {
        this._error = true;
        if (message) {
            this._errorAttributes.message = message;
        }
        if (type) {
            this._errorAttributes.type = type;
        }
        if (content) {
            this._errorContent = content;
        }
        return this;
    }
    /**
     * @param stacktrace
     * @returns this
     */
    stacktrace(stacktrace) {
        this._failure = true;
        this._stacktrace = stacktrace;
        return this;
    }
    /**
     * @returns this
     */
    skipped() {
        this._skipped = true;
        return this;
    }
    /**
     * @param log
     * @returns this
     */
    standardOutput(log) {
        this._standardOutput = log;
        return this;
    }
    /**
     * @param log
     * @returns this
     */
    standardError(log) {
        this._standardError = log;
        return this;
    }
    /**
     * @inheritdoc
     */
    getTestCaseCount() {
        return 1;
    }
    /**
     * @inheritdoc
     */
    getFailureCount() {
        return this._failure ? 1 : 0;
    }
    /**
     * @inheritdoc
     */
    getErrorCount() {
        return this._error ? 1 : 0;
    }
    /**
     * @inheritdoc
     */
    getSkippedCount() {
        return this._skipped ? 1 : 0;
    }
    /**
     *
     * @param path
     * @returns this
     */
    errorAttachment(path) {
        this._errorAttachment = path;
        return this;
    }
    /**
     * @param parentElement - the parent element
     */
    build(parentElement) {
        const testCaseElement = this.buildNode(this.createElement(parentElement));
        if (this._failure) {
            var failureElement = testCaseElement.ele('failure', this._failureAttributes);
            if (this._stacktrace) {
                failureElement.cdata(this._stacktrace);
            }
        }
        if (this._error) {
            var errorElement = testCaseElement.ele('error', this._errorAttributes);
            if (this._errorContent) {
                errorElement.cdata(this._errorContent);
            }
        }
        if (this._skipped) {
            testCaseElement.ele('skipped');
        }
        if (this._standardOutput) {
            testCaseElement.ele('system-out').cdata(this._standardOutput);
        }
        var systemError;
        if (this._standardError) {
            systemError = testCaseElement.ele('system-err').cdata(this._standardError);
            if (this._errorAttachment) {
                systemError.txt('[[ATTACHMENT|' + this._errorAttachment + ']]');
            }
        }
        return testCaseElement;
    }
}

class Factory {
    /**
     * @returns a newly created builder
     */
    newBuilder() {
        return new JUnitReportBuilder(this);
    }
    /**
     * @returns a newly created test suite
     */
    newTestSuite() {
        return new TestSuite(this);
    }
    /**
     * @returns a newly created test case
     */
    newTestCase() {
        return new TestCase();
    }
    /**
     * @returns a newly created test suites
     */
    newTestSuites() {
        return new TestSuites(this);
    }
}

var index = new Factory().newBuilder();

export { index as default };
