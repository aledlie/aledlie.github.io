"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.describeViolations = exports.testResultDependsOnViolations = exports.getImpactedViolations = void 0;
const assert_1 = __importDefault(require("assert"));
const getImpactedViolations = (violations, includedImpacts = []) => {
    return Array.isArray(includedImpacts) && includedImpacts.length
        ? violations.filter((v) => v.impact && includedImpacts.includes(v.impact))
        : violations;
};
exports.getImpactedViolations = getImpactedViolations;
const testResultDependsOnViolations = (violations, skipFailures) => {
    if (!skipFailures) {
        assert_1.default.strictEqual(violations.length, 0, `${violations.length} accessibility violation${violations.length === 1 ? '' : 's'} ${violations.length === 1 ? 'was' : 'were'} detected`);
    }
    else {
        if (violations.length) {
            console.warn({
                name: 'a11y violation summary',
                message: `${violations.length} accessibility violation${violations.length === 1 ? '' : 's'} ${violations.length === 1 ? 'was' : 'were'} detected`,
            });
        }
    }
};
exports.testResultDependsOnViolations = testResultDependsOnViolations;
const describeViolations = (violations) => {
    const aggregate = {};
    violations.map(({ nodes }, index) => {
        nodes.forEach(({ target, html }) => {
            const key = JSON.stringify(target) + html;
            if (aggregate[key]) {
                aggregate[key].violations.push(index);
            }
            else {
                aggregate[key] = {
                    target: JSON.stringify(target),
                    html,
                    violations: [index],
                };
            }
        });
    });
    return Object.values(aggregate).map(({ target, html, violations }) => {
        return { target, html, violations: JSON.stringify(violations) };
    });
};
exports.describeViolations = describeViolations;
