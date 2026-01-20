---
layout: single
title: "Website Performance Baseline Report"
date: 2025-10-14
author_profile: true
categories: performance testing
tags: [performance, web-vitals, load-testing, stress-testing, scalability]
excerpt: "Comprehensive performance testing baseline for IntegrityStudio.ai, fisterra.xyz, AustinInspiredMovement.com, and SoundSightATX.com before optimization improvements."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

## Comprehensive Performance Testing - Before Improvements

**Test Date:** October 14, 2025
**Test Suite:** Comprehensive Performance Suite
**Testing Tool:** Custom Performance Suite (Puppeteer + Load Testing Framework)
**Test Duration:** ~45-65 minutes per site

---

## Executive Summary

This report presents baseline performance metrics for four websites before any optimization improvements. The tests evaluated Core Web Vitals, load handling, stress tolerance, and scalability characteristics under various conditions.

### Overall Rankings

| Rank | Website | Score | Grade | Status |
|------|---------|-------|-------|--------|
| 1 | IntegrityStudio.ai | 71/100 | B- | Acceptable |
| 2 | fisterra.xyz | 44/100 | F | Critical Issues |
| 3 | AustinInspiredMovement.com | 41/100 | F | Critical Issues |
| 4 | SoundSightATX.com | 36/100 | F | Critical Issues |

---

## 1. IntegrityStudio.ai

### Overall Assessment
- **Score:** 71/100 (B-)
- **System Assessment:** ACCEPTABLE
- **Production Readiness:** NOT_READY
- **Total Execution Time:** 1h 3m 26s

### Test Suite Results

#### Core Web Vitals (32/100) - 41s
- **Status:** POOR
- **Key Issues:**
  - First Contentful Paint needs improvement
  - Cumulative Layout Shift needs improvement
  - Overall user experience metrics below acceptable thresholds

#### Beyond Core Web Vitals (19/100) - 0s
- **Status:** POOR
- Additional metrics (TTFB, TTI, TBT, SI) require optimization

#### Load Testing (100/100) - 5m 1s ⭐
- **Status:** EXCELLENT
- **Total Requests:** 13,056
- **Errors:** 0
- **Success Rate:** 100%
- **Max Concurrent Users:** 50
- **Test Duration:** 300s
- **Performance:** Outstanding reliability under expected load

#### Stress Testing (100/100) - 21m 41s ⭐
- **Status:** EXCELLENT
- **Breaking Point:** Not detected (tested up to 200 users)
- **User Progression:** 10 → 200 (steps of 10)
- **Average Response Times:**
  - 10 users: 37ms
  - 50 users: 37ms
  - 100 users: 49ms
  - 200 users: 41ms
- **Performance:** Exceptional stability and consistency under increasing load

#### Scalability Testing (105/100) - 36m 1s ⭐
- **Status:** EXCELLENT
- **Max Effective Users:** 200
- **Test Phases:**
  - User Scalability: Passed (1, 5, 10, 25, 50, 100, 150, 200 users)
  - Data Volume Scalability: Passed (light, medium, heavy)
  - Network Conditions: Passed (fast, slow, mobile)
  - Cross-dimensional Testing: Passed (combined stress scenarios)

### Key Performance Metrics
- **Load Performance:** 100% success rate
- **Error Rate:** 0%
- **Average Response Time:** 37-49ms
- **Stress Capacity:** No breaking point up to 200 concurrent users
- **Scalability:** Excellent across all dimensions

### Recommendations

#### HIGH Priority
1. **Improve First Contentful Paint (FCP)**
   - Optimize critical rendering path
   - Implement resource prioritization
   - Consider code splitting and lazy loading

2. **Fix Cumulative Layout Shift (CLS)**
   - Add size attributes to images and videos
   - Reserve space for dynamic content
   - Avoid inserting content above existing content

#### MEDIUM Priority
3. **Enhance Core Web Vitals**
   - Target LCP < 2.5s
   - Target FID < 100ms
   - Target CLS < 0.1

#### LOW Priority
4. **Maintain Current Load Performance**
   - System performing excellently under load
   - Continue monitoring for degradation

### Strengths
- Exceptional reliability (100% success rate)
- Outstanding stress tolerance (no breaking point)
- Excellent scalability across multiple dimensions
- Consistent response times under varying load

### Areas for Improvement
- Core Web Vitals metrics need attention
- User experience metrics below acceptable thresholds
- Initial page rendering performance

---

## 2. fisterra.xyz

### Overall Assessment
- **Score:** 44/100 (F)
- **System Assessment:** CRITICAL_ISSUES
- **Production Readiness:** NOT_READY
- **Total Execution Time:** 45m 12s

### Test Suite Results

#### Core Web Vitals - FAILED (3m 7s) ❌
- **Status:** FAILED
- **Error:** Protocol error: Connection closed
- **Issue:** Page unable to be measured due to critical errors

#### Beyond Core Web Vitals (16/100) - 2s
- **Status:** POOR
- Limited metrics available due to underlying issues

#### Load Testing (60/100) - 5m 1s
- **Total Requests:** 12,591
- **Errors:** 11,456
- **Success Rate:** 9.01%
- **Error Rate:** 90.99%
- **Status:** CRITICAL - Extremely high failure rate

#### Stress Testing (30/100) - 1m 0s
- **Breaking Point:** 10 concurrent users
- **Total Requests:** 1,130
- **Error Rate:** 100%
- **Average Response Time:** 0ms (all requests failing)
- **Status:** CRITICAL - System breaks under minimal load

#### Scalability Testing (70/100) - 36m 0s
- **Max Effective Users:** 200 (theoretical)
- **Actual Effective Users:** < 10 (practical limit)
- **Status:** POOR - Scalability metrics misleading due to high error rates

### Key Performance Metrics
- **Load Performance:** 9.01% success rate
- **Error Rate:** 90.99%
- **Stress Capacity:** Breaking point at only 10 users
- **Practical User Limit:** < 10 concurrent users

### Critical Issues

#### CRITICAL Priority
1. **Extremely High Error Rate (90.99%)**
   - 11,456 failed requests out of 12,591 total
   - System fundamentally unstable
   - Requires immediate investigation and remediation

2. **Breaking Point at 10 Users**
   - System cannot handle even light concurrent load
   - Complete failure under stress
   - Server infrastructure likely undersized or misconfigured

3. **Core Web Vitals Measurement Failure**
   - Unable to complete basic performance testing
   - Protocol errors indicate serious underlying issues
   - Page stability problems

4. **Poor Cross-scenario Performance (53.33/100)**
   - Combined stress conditions cause severe degradation
   - System not resilient to real-world conditions

### Immediate Actions Required
1. **Infrastructure Audit**
   - Review server capacity and configuration
   - Check for resource bottlenecks (CPU, memory, I/O)
   - Verify database connection pooling and limits

2. **Error Analysis**
   - Collect and analyze error logs
   - Identify root causes of request failures
   - Fix critical bugs causing failures

3. **Load Testing in Controlled Environment**
   - Test with incremental load (1, 2, 5, 10 users)
   - Identify exact failure threshold
   - Monitor system resources during tests

4. **Page Stability**
   - Fix protocol errors
   - Ensure pages load consistently
   - Resolve connection issues

### Production Recommendation
**DO NOT DEPLOY TO PRODUCTION** - This site has critical issues that make it unsuitable for production use. The 90.99% error rate and 10-user breaking point indicate fundamental problems that must be resolved before launch.

---

## 3. AustinInspiredMovement.com

### Overall Assessment
- **Score:** 41/100 (F)
- **System Assessment:** CRITICAL_ISSUES
- **Production Readiness:** NOT_READY
- **Total Execution Time:** 42m 55s

### Test Suite Results

#### Core Web Vitals (32/100) - 48s
- **Status:** POOR
- Metrics collected but below acceptable thresholds

#### Beyond Core Web Vitals (16/100) - 2s
- **Status:** POOR
- Additional performance metrics need significant improvement

#### Load Testing (60/100) - 5m 0s
- **Total Requests:** 12,589
- **Errors:** 11,561
- **Success Rate:** 8.17%
- **Error Rate:** 91.83%
- **Status:** CRITICAL - Highest error rate among all sites

#### Stress Testing (30/100) - 1m 0s
- **Breaking Point:** 10 concurrent users
- **Total Requests:** 1,115
- **Error Rate:** 99.64%
- **Average Response Time:** 454ms (for the few successful requests)
- **Status:** CRITICAL - Near complete failure under minimal stress

#### Scalability Testing (65/100) - 36m 4s
- **Max Effective Users:** 150
- **Practical User Limit:** < 10 concurrent users
- **Status:** POOR - Limited scalability due to high error rates

### Key Performance Metrics
- **Load Performance:** 8.17% success rate (worst among all sites)
- **Error Rate:** 91.83% (highest error rate)
- **Stress Capacity:** Breaking point at 10 users with 99.64% error rate
- **Practical Scalability:** Severely limited (< 10 users)
- **Average Response Time:** 454ms (when requests succeed)

### Critical Issues

#### CRITICAL Priority
1. **Highest Error Rate (91.83%)**
   - 11,561 failed requests out of 12,589 total
   - Only 1,028 successful requests
   - System is fundamentally broken

2. **Breaking Point at 10 Users (99.64% error rate)**
   - Worse than fisterra.xyz under stress
   - Near-complete failure under minimal load
   - Infrastructure cannot support even light traffic

3. **Poor Combined Stress Performance (50.00/100)**
   - System fails catastrophically when multiple stressors combine
   - Not resilient to real-world usage patterns
   - High data + slow network = complete failure

4. **Core Web Vitals Below Threshold**
   - When pages do load, user experience is poor
   - Multiple metrics in "POOR" category

### Root Cause Hypotheses
1. **Hosting Infrastructure**
   - Shared hosting with insufficient resources
   - Database connection limits too low
   - Server timeout configurations too aggressive

2. **Application Issues**
   - Memory leaks under concurrent load
   - Database query optimization needed
   - Possible N+1 query problems

3. **Network/CDN Issues**
   - CDN misconfiguration or absence
   - DNS resolution problems
   - Connection timeout issues

### Immediate Actions Required
1. **Emergency Infrastructure Review**
   - Upgrade hosting plan or migrate to dedicated infrastructure
   - Increase database connection pool limits
   - Review and optimize server configuration

2. **Application Performance Audit**
   - Profile application under load
   - Identify and fix memory leaks
   - Optimize database queries
   - Implement caching strategies

3. **Implement Basic Resilience**
   - Add error handling and graceful degradation
   - Implement request queuing
   - Add health checks and monitoring

4. **Gradual Load Testing**
   - Test with 1, 2, 3, 5 users incrementally
   - Identify exact breaking point
   - Fix issues at each threshold before proceeding

### Production Recommendation
**DO NOT DEPLOY TO PRODUCTION** - This site has the worst error rate (91.83%) and is not suitable for production use. Critical infrastructure and application issues must be resolved before any public deployment.

---

## 4. SoundSightATX.com

### Overall Assessment
- **Score:** 36/100 (F) - **Lowest Score**
- **System Assessment:** CRITICAL_ISSUES
- **Production Readiness:** NOT_READY
- **Total Execution Time:** 42m 47s

### Test Suite Results

#### Core Web Vitals (54/100) - 41s
- **Status:** POOR (but better than others)
- **Relative Strength:** Best Core Web Vitals among failing sites

#### Beyond Core Web Vitals (12/100) - 2s
- **Status:** POOR - **Worst score** in this category
- **TTFB:** 425ms (NEEDS_IMPROVEMENT)

#### Load Testing (60/100) - 5m 0s
- **Total Requests:** 12,187
- **Errors:** 10,392
- **Success Rate:** 14.73%
- **Error Rate:** 85.27%
- **Status:** CRITICAL - Better than others but still unacceptable

#### Stress Testing (30/100) - 1m 0s
- **Breaking Point:** 10 concurrent users
- **Total Requests:** 1,088
- **Error Rate:** 79.04%
- **Average Response Time:** 42ms (for successful requests)
- **Status:** CRITICAL - Consistent with other failing sites

#### Scalability Testing (25/100) - 36m 2s ❌
- **Max Effective Users:** 5 users (WORST among all sites)
- **Status:** CRITICAL - Severely limited scalability
- **Practical Limit:** Cannot handle more than 5 concurrent users effectively

### Key Performance Metrics
- **Load Performance:** 14.73% success rate (better than others, still poor)
- **Error Rate:** 85.27%
- **Stress Capacity:** Breaking point at 10 users with 79.04% error rate
- **Practical Scalability:** **WORST** - Only 5 effective concurrent users
- **TTFB:** 425ms (slow server response)
- **Average Response Time:** 42ms

### Critical Issues

#### CRITICAL Priority
1. **Severe Scalability Limitation (5 users)**
   - Worst scalability among all tested sites
   - Can only handle 5 concurrent users effectively
   - Completely unsuitable for any traffic growth
   - Bottleneck likely in database or server processing

2. **High Error Rate (85.27%)**
   - 10,392 failed requests out of 12,187 total
   - While better than others, still critically high
   - 1,795 successful requests is insufficient

3. **Breaking Point at 10 Users (79.04% errors)**
   - System begins failing catastrophically at 10 users
   - Cannot scale beyond minimal traffic

#### HIGH Priority
4. **Poor Time to First Byte (425ms)**
   - Server processing is slow
   - Indicates backend performance issues
   - Should be < 200ms for good performance
   - Suggests database query optimization needed

5. **Beyond Core Web Vitals Worst Score (12/100)**
   - Multiple performance metrics in poor state
   - TTI (Time to Interactive) likely very high
   - TBT (Total Blocking Time) blocking user interaction

### Unique Characteristics
- **Best:** Core Web Vitals score among failing sites (54/100)
- **Worst:** Scalability (only 5 effective users)
- **Worst:** Beyond Core Web Vitals score (12/100)
- **Mixed:** Error rate lower than others but still critical (85.27%)

### Root Cause Analysis

#### Primary Bottleneck: Scalability
The 5-user scalability limit suggests:
1. **Database Connection Pool Too Small**
   - Likely limited to 5-10 connections
   - Cannot handle concurrent queries
   - Need to increase pool size and optimize queries

2. **Synchronous Processing Blocking Requests**
   - Application may be processing requests synchronously
   - Blocking operations preventing concurrent handling
   - Need async processing and job queues

3. **Resource Constraints**
   - Memory limits being reached quickly
   - CPU bottleneck from inefficient processing
   - I/O bottleneck from disk or network operations

#### Secondary Issue: Slow Server Response (425ms TTFB)
Indicates:
1. **Unoptimized Database Queries**
   - Missing indexes
   - N+1 query problems
   - Slow joins or aggregations

2. **Backend Processing Inefficiency**
   - Heavy computation on each request
   - No caching layer
   - Slow API calls or external dependencies

### Immediate Actions Required

1. **Database Optimization (CRITICAL)**
   - Increase connection pool size
   - Add missing database indexes
   - Optimize slow queries (use EXPLAIN ANALYZE)
   - Implement query caching (Redis/Memcached)

2. **Implement Caching Strategy (CRITICAL)**
   - Add page-level caching
   - Implement object caching
   - Use CDN for static assets
   - Cache database query results

3. **Async Processing (CRITICAL)**
   - Move heavy operations to background jobs
   - Implement request queuing
   - Use non-blocking I/O operations

4. **Infrastructure Upgrade (HIGH)**
   - Increase server resources (CPU, memory)
   - Consider database server scaling
   - Implement load balancing if not present

5. **Reduce TTFB to < 200ms (HIGH)**
   - Profile and optimize backend code
   - Reduce external API dependency latency
   - Implement server-side caching

6. **Load Testing at 1, 2, 3, 5 Users (HIGH)**
   - Identify exact point where system degrades
   - Monitor resource usage at each level
   - Fix bottlenecks incrementally

### Production Recommendation
**DO NOT DEPLOY TO PRODUCTION** - This site has the worst scalability limitation (5 users) and cannot support even minimal traffic. While it has better Core Web Vitals than others, the severe scalability constraint makes it completely unsuitable for production. The 5-user limit would be exceeded immediately by any real-world traffic.

---

## Comparative Analysis

### Performance Matrix

| Metric | IntegrityStudio.ai | fisterra.xyz | AustinInspired | SoundSightATX |
|--------|-------------------|--------------|----------------|---------------|
| **Overall Score** | 71 (B-) | 44 (F) | 41 (F) | 36 (F) |
| **Core Web Vitals** | 32 | FAILED | 32 | 54 |
| **Beyond Core Vitals** | 19 | 16 | 16 | 12 |
| **Load Testing** | 100 ⭐ | 60 | 60 | 60 |
| **Stress Testing** | 100 ⭐ | 30 | 30 | 30 |
| **Scalability** | 105 ⭐ | 70 | 65 | 25 |
| **Success Rate** | 100% | 9.01% | 8.17% | 14.73% |
| **Error Rate** | 0% | 90.99% | 91.83% | 85.27% |
| **Breaking Point** | >200 users | 10 users | 10 users | 10 users |
| **Max Effective Users** | 200 | <10 | <10 | 5 |
| **Avg Response Time** | 37-49ms | 0ms | 454ms | 42ms |

### Key Insights

#### IntegrityStudio.ai - The Clear Winner
- **Only site with acceptable performance**
- Exceptional reliability and scalability
- Needs work on user experience metrics only
- Production-ready infrastructure (not production-ready overall due to UX)

#### The "Critical Three" - Similar Failure Patterns
All three failing sites (fisterra.xyz, AustinInspiredMovement.com, SoundSightATX.com) share:
- Breaking point at 10 concurrent users
- Error rates > 85%
- Poor scalability scores
- Critical infrastructure issues

#### Unique Issues by Site

**fisterra.xyz:**
- Highest overall error rate (90.99%)
- Core Web Vitals completely unmeasurable
- Protocol/connection errors

**AustinInspiredMovement.com:**
- Worst error rate (91.83%)
- Slowest response time when working (454ms)
- Near-complete failure (99.64% errors) under stress

**SoundSightATX.com:**
- Worst scalability (5 users max)
- Slowest server response (425ms TTFB)
- Best Core Web Vitals among failing sites

### Common Root Causes for Failing Sites

1. **Infrastructure Undersizing**
   - Shared hosting or minimal server resources
   - Database connection pool limits
   - Insufficient memory/CPU allocation

2. **Lack of Optimization**
   - Unoptimized database queries
   - No caching layer
   - Synchronous processing blocking requests

3. **No Resilience Patterns**
   - No circuit breakers
   - No request queuing
   - No graceful degradation

4. **Missing Performance Best Practices**
   - No CDN usage
   - No asset optimization
   - No lazy loading

---

## Recommendations by Priority

### IntegrityStudio.ai

#### Must Fix Before Production
1. Improve First Contentful Paint
2. Fix Cumulative Layout Shift
3. Optimize Core Web Vitals to pass thresholds

#### Nice to Have
1. Further improve Beyond Core Web Vitals
2. Implement monitoring and alerting
3. Continue load testing as traffic grows

### fisterra.xyz, AustinInspiredMovement.com, SoundSightATX.com

#### Emergency - Must Fix Immediately
1. **Infrastructure Audit & Upgrade**
   - Review hosting configuration
   - Increase database connection pools
   - Allocate more server resources
   - Consider dedicated infrastructure

2. **Fix Critical Errors**
   - Analyze error logs
   - Fix application bugs causing failures
   - Resolve database connection issues
   - Fix timeout configurations

3. **Implement Basic Caching**
   - Page caching
   - Database query caching
   - CDN for static assets

4. **Optimize Database**
   - Add missing indexes
   - Optimize slow queries
   - Fix N+1 query problems

#### Before Considering Production
5. Achieve < 10% error rate under load
6. Handle 50+ concurrent users without errors
7. TTFB < 200ms
8. Core Web Vitals in "Good" range

#### Production-Ready Criteria
9. 95%+ success rate under load
10. Breaking point > 100 users
11. All Core Web Vitals passing
12. Monitoring and alerting in place

---

## Testing Methodology

### Test Suite Components

#### 1. Core Web Vitals Testing
- **Metrics:** LCP, FID, CLS
- **Method:** Puppeteer-based measurement
- **Iterations:** 5 per site
- **Duration:** ~5 minutes

#### 2. Beyond Core Web Vitals
- **Metrics:** TTFB, FCP, TTI, TBT, SI
- **Method:** Lighthouse-style measurements
- **Iterations:** 5 per site
- **Duration:** ~5 minutes

#### 3. Load Testing
- **Max Concurrent Users:** 50
- **Ramp-up Duration:** 60 seconds
- **Test Duration:** 300 seconds (5 minutes)
- **Total Duration:** ~10 minutes

#### 4. Stress Testing
- **User Progression:** 10 → 200 (steps of 10)
- **Step Duration:** 60 seconds per level
- **Cooldown:** Between steps
- **Total Duration:** ~15-20 minutes
- **Objective:** Find breaking point

#### 5. Scalability Testing
- **User Scenarios:** 1, 5, 10, 25, 50, 100, 150, 200 users
- **Data Scenarios:** light, medium, heavy
- **Network Scenarios:** fast, slow, mobile
- **Cross-dimensional:** Combined stress tests
- **Total Duration:** ~20-35 minutes

### Tools Used
- **Puppeteer:** Browser automation and Core Web Vitals
- **Custom Load Testing Framework:** Concurrent user simulation
- **Node.js:** Test orchestration
- **JSON:** Results reporting

---

## Conclusions

### Summary

1. **IntegrityStudio.ai** is the only site with acceptable performance (71/100, B-). It has excellent reliability and scalability but needs user experience improvements before production.

2. **The other three sites have critical issues** that make them unsuitable for production:
   - fisterra.xyz: 90.99% error rate
   - AustinInspiredMovement.com: 91.83% error rate (worst)
   - SoundSightATX.com: 5 user scalability limit (worst)

3. **Common pattern:** All three failing sites break at 10 concurrent users with 80-100% error rates, indicating fundamental infrastructure and optimization problems.

4. **Immediate action required:** The three failing sites need emergency infrastructure audits, database optimization, and caching implementation before any production deployment.

### Next Steps

#### For IntegrityStudio.ai
1. Focus on Core Web Vitals optimization
2. Implement performance monitoring
3. Conduct user experience testing
4. Plan for production deployment after UX fixes

#### For fisterra.xyz, AustinInspiredMovement.com, SoundSightATX.com
1. **DO NOT DEPLOY TO PRODUCTION**
2. Conduct emergency infrastructure audit
3. Fix critical errors causing > 85% failure rates
4. Optimize database and implement caching
5. Re-test with incremental load (1, 2, 5, 10 users)
6. Only proceed when achieving < 10% error rate
7. Conduct full test suite again before reconsidering production

---

## Appendix

### Test Environment
- **Test Date:** October 14, 2025
- **Test Location:** Local development environment
- **Network:** Standard broadband connection
- **Test Machine:** Standard development laptop
- **Browser:** Chrome (via Puppeteer)

### Glossary

**Core Web Vitals:**
- **LCP (Largest Contentful Paint):** Time to render largest content element
- **FID (First Input Delay):** Time from user interaction to browser response
- **CLS (Cumulative Layout Shift):** Visual stability metric

**Beyond Core Web Vitals:**
- **TTFB (Time to First Byte):** Server response time
- **FCP (First Contentful Paint):** Time to first content render
- **TTI (Time to Interactive):** Time until page is fully interactive
- **TBT (Total Blocking Time):** Sum of blocking time
- **SI (Speed Index):** How quickly content is visually displayed

**Performance Metrics:**
- **Breaking Point:** User load at which errors exceed 50%
- **Success Rate:** Percentage of successful requests
- **Error Rate:** Percentage of failed requests
- **Max Effective Users:** Maximum concurrent users with acceptable performance

---

**Report Generated:** October 14, 2025
**Testing Framework:** schema-org-mcp Performance Suite v2
**Report Version:** 1.0
