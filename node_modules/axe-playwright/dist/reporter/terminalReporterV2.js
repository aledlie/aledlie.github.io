"use strict";
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
const assert_1 = __importDefault(require("assert"));
const picocolors_1 = __importDefault(require("picocolors"));
class TerminalReporterV2 {
    constructor(verbose) {
        this.verbose = verbose;
    }
    report(violations) {
        return __awaiter(this, void 0, void 0, function* () {
            const lineBreak = '\n\n';
            const message = violations.length === 0
                ? 'No accessibility violations detected!'
                : `Found ${violations.length} accessibility violations: \n`;
            const horizontalLine = picocolors_1.default.bold('-'.repeat(message.length));
            const reporter = (violations) => {
                if (violations.length === 0) {
                    return [];
                }
                return violations
                    .map((violation) => {
                    const errorBody = violation.nodes
                        .map((node) => {
                        const selector = node.target.join(', ');
                        const expectedText = `Expected the HTML found at $('${selector}') to have no violations:` +
                            '\n';
                        return (picocolors_1.default.bold(expectedText) +
                            picocolors_1.default.gray(node.html) +
                            lineBreak +
                            `Received:\n` +
                            picocolors_1.default.red(`${violation.help} (${violation.id})`) +
                            lineBreak +
                            picocolors_1.default.bold(picocolors_1.default.yellow(node.failureSummary)) +
                            lineBreak +
                            (violation.helpUrl
                                ? `You can find more information on this issue here: \n${picocolors_1.default.bold(picocolors_1.default.blue(violation.helpUrl))}`
                                : '') +
                            '\n' +
                            horizontalLine);
                    })
                        .join(lineBreak);
                    return errorBody;
                })
                    .join(lineBreak);
            };
            const formatedViolations = reporter(violations);
            const pass = formatedViolations.length === 0;
            if (pass) {
                this.verbose && console.log(message);
            }
            else {
                assert_1.default.fail(message + horizontalLine + '\n' + formatedViolations);
            }
        });
    }
}
exports.default = TerminalReporterV2;
