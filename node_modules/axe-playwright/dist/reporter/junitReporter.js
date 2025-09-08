"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const junit_report_builder_1 = __importDefault(require("junit-report-builder"));
const assert_1 = __importDefault(require("assert"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class JUnitReporter {
    constructor(verbose, page, outputFilename) {
        this.verbose = verbose;
        this.page = page;
        this.outputFilename = outputFilename;
    }
    report(violations) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let lineBreak = '\n';
            let pageUrl = ((_a = this.page) === null || _a === void 0 ? void 0 : _a.url()) || 'Page';
            let suite = junit_report_builder_1.default.testSuite().name(pageUrl);
            const message = violations.length === 0
                ? 'No accessibility violations detected!'
                : `Found ${violations.length} accessibility violations`;
            violations.map((violation) => {
                const errorBody = violation.nodes
                    .map((node) => {
                    const selector = node.target.join(', ');
                    const expectedText = `Expected the HTML found at $('${selector}') to have no violations:` +
                        '\n';
                    return (expectedText +
                        node.html +
                        lineBreak +
                        `Received:\n` +
                        `${violation.help} (${violation.id})` +
                        lineBreak +
                        node.failureSummary +
                        lineBreak +
                        (violation.helpUrl
                            ? `You can find more information on this issue here: \n${violation.helpUrl}`
                            : '') +
                        '\n');
                })
                    .join(lineBreak);
                suite
                    .testCase()
                    .className(violation.id)
                    .name(violation.description)
                    .failure(errorBody);
            });
            const pass = violations.length === 0;
            if (pass) {
                junit_report_builder_1.default.testCase().name('Accesibility testing - A11Y');
                this.verbose && console.log(`No accessibility violations detected!`);
            }
            let location = this.outputFilename || 'a11y-tests.xml';
            const dir = path.dirname(location);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            // Check if the file exists, if not create it
            if (!fs.existsSync(location)) {
                fs.writeFileSync(location, ''); // Create an empty file
            }
            junit_report_builder_1.default.writeTo(location);
            if (!pass) {
                assert_1.default.fail(message);
            }
        });
    }
}
exports.default = JUnitReporter;
