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
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
class DefaultTerminalReporter {
    constructor(detailedReport, includeHtml, verbose) {
        this.detailedReport = detailedReport;
        this.includeHtml = includeHtml;
        this.verbose = verbose;
    }
    report(violations) {
        return __awaiter(this, void 0, void 0, function* () {
            const violationData = violations.map(({ id, impact, description, nodes }) => {
                return {
                    id,
                    impact,
                    description,
                    nodes: nodes.length,
                };
            });
            if (violationData.length > 0) {
                // summary
                console.table(violationData);
                if (this.detailedReport) {
                    const nodeViolations = (0, utils_1.describeViolations)(violations).map(({ target, html, violations }) => {
                        if (!this.includeHtml) {
                            return {
                                target,
                                violations,
                            };
                        }
                        return { target, html, violations };
                    });
                    // per node
                    console.table(nodeViolations);
                }
            }
            else {
                this.verbose && console.log(`No accessibility violations detected!`);
            }
        });
    }
}
exports.default = DefaultTerminalReporter;
