import { Page } from 'playwright';
import { AxeResults, ElementContext, Result, RunOptions } from 'axe-core';
import DefaultTerminalReporter from './reporter/defaultTerminalReporter';
import Reporter, { ConfigOptions, AxeOptions } from './types';
import { Options } from 'axe-html-reporter';
declare global {
    interface Window {
        axe: any;
    }
}
declare module 'axe-core' {
    interface Node {
    }
}
/**
 * Injects axe executable commands in the active window
 * @param page
 */
export declare const injectAxe: (page: Page) => Promise<void>;
/**
 * Configures axe runtime options
 * @param page
 * @param configurationOptions
 */
export declare const configureAxe: (page: Page, configurationOptions?: ConfigOptions) => Promise<void>;
/**
 * Runs axe-core tools on the relevant page and returns all results
 * @param page
 * @param context
 * @param options
 */
export declare const getAxeResults: (page: Page, context?: ElementContext, options?: RunOptions) => Promise<AxeResults>;
/**
 * Runs axe-core tools on the relevant page and returns all accessibility violations detected on the page
 * @param page
 * @param context
 * @param options
 */
export declare const getViolations: (page: Page, context?: ElementContext, options?: RunOptions) => Promise<Result[]>;
/**
 * Report violations given the reporter.
 * @param violations
 * @param reporter
 */
export declare const reportViolations: (violations: Result[], reporter: Reporter) => Promise<void>;
/**
 * Performs Axe validations
 * @param page
 * @param context
 * @param axeOptions
 * @param skipFailures
 * @param reporter
 * @param options
 */
export declare const checkA11y: (page: Page, context?: ElementContext | undefined, axeOptions?: AxeOptions | undefined, skipFailures?: boolean, reporter?: Reporter | "default" | "html" | "junit" | "v2", options?: Options | undefined) => Promise<void>;
export { DefaultTerminalReporter };
