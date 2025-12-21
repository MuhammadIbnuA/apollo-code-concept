/**
 * Course Engine Functional Test Script
 * Tests all language/framework course engines:
 * - HTML validation
 * - CSS validation
 * - Tailwind CSS validation
 * - JavaScript (Judge0)
 * - Python (Judge0)
 * - React validation
 * 
 * Usage: k6 run tests/k6/course_engine_test.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const JUDGE0_TIMEOUT = 10; // seconds

export const options = {
    vus: 1,
    iterations: 1,
    thresholds: {
        'checks': ['rate>=0.8'], // At least 80% of checks should pass
    },
};

// ============================================================
// TEST DATA - Correct solutions for each course
// ============================================================

const TEST_CASES = {
    // HTML Test - Should find h1 with "Hello World"
    html: {
        name: 'HTML Validation',
        code: `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
    <h1>Hello World</h1>
</body>
</html>`,
        validationCode: 'h1:Hello World',
        validationType: 'html',
        expectedPass: true
    },

    // CSS Test - Should find h1 with color:blue
    css: {
        name: 'CSS Validation',
        code: `<!DOCTYPE html>
<html>
<head>
    <style>
        h1 { color: blue; }
    </style>
</head>
<body>
    <h1>Blue Heading</h1>
</body>
</html>`,
        validationCode: 'h1{color:blue}',
        validationType: 'css',
        expectedPass: true
    },

    // Tailwind Test - Should find div with class attribute
    tailwind: {
        name: 'Tailwind CSS Validation',
        code: `<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="p-8">
    <div class="bg-blue-500 text-white p-4 rounded">Tailwind Card</div>
</body>
</html>`,
        validationCode: 'div[class]',
        validationType: 'html',
        expectedPass: true
    },

    // React Test - Should find h1 with greeting
    react: {
        name: 'React Validation',
        code: `<!DOCTYPE html>
<html>
<head>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        function App() {
            return <h1>Hello React!</h1>;
        }
        ReactDOM.createRoot(document.getElementById('root')).render(<App />);
    </script>
</body>
</html>`,
        validationCode: 'h1:Hello React',
        validationType: 'html',
        expectedPass: true
    },

    // JavaScript Test - Via Judge0
    javascript: {
        name: 'JavaScript (Judge0)',
        code: `console.log("Hello JavaScript!");`,
        expectedOutput: 'Hello JavaScript!',
        languageId: 63, // Node.js
        useJudge0: true
    },

    // Python Test - Via Judge0
    python: {
        name: 'Python (Judge0)',
        code: `print("Hello Python!")`,
        expectedOutput: 'Hello Python!',
        languageId: 71, // Python 3
        useJudge0: true
    }
};

// ============================================================
// HTML/CSS VALIDATION (client-side simulation)
// ============================================================

function validateHtml(code, rules) {
    // Simulate DOMParser validation
    const checks = rules.split('|');
    let allPassed = true;
    const results = [];

    for (const check of checks) {
        // Parse: tag:text or tag[attr] or just tag
        const textMatch = check.match(/^(\w+):(.+)$/);
        const attrMatch = check.match(/^(\w+)\[(.+)\]$/);

        if (textMatch) {
            const [, tag, text] = textMatch;
            const tagRegex = new RegExp(`<${tag}[^>]*>[^<]*${text}[^<]*</${tag}>`, 'i');
            const found = tagRegex.test(code);
            results.push({ rule: check, passed: found });
            if (!found) allPassed = false;
        } else if (attrMatch) {
            const [, tag, attr] = attrMatch;
            const attrRegex = new RegExp(`<${tag}[^>]*${attr}[^>]*>`, 'i');
            const found = attrRegex.test(code);
            results.push({ rule: check, passed: found });
            if (!found) allPassed = false;
        } else {
            // Just check if tag exists
            const tagRegex = new RegExp(`<${check}[^>]*>`, 'i');
            const found = tagRegex.test(code);
            results.push({ rule: check, passed: found });
            if (!found) allPassed = false;
        }
    }

    return { passed: allPassed, results };
}

function validateCss(code, rules) {
    const checks = rules.split('|');
    let allPassed = true;
    const results = [];

    for (const ccheck of checks) {
        const match = ccheck.match(/^(.+)\{(.+)\}$/);
        if (match) {
            const [, selector, propsStr] = match;
            const props = propsStr.split(';').filter(p => p.trim());

            // Check if selector exists in code
            const selectorFound = code.includes(selector) || code.toLowerCase().includes(selector.toLowerCase());

            for (const prop of props) {
                const [propName, propValue] = prop.split(':').map(s => s.trim());
                // Check if property is in style block or inline
                const propRegex = propValue
                    ? new RegExp(`${propName}\\s*:\\s*${propValue}`, 'i')
                    : new RegExp(`${propName}\\s*:`, 'i');
                const found = propRegex.test(code);
                results.push({ rule: `${selector}{${propName}:${propValue || '*'}}`, passed: found });
                if (!found) allPassed = false;
            }
        }
    }

    return { passed: allPassed, results };
}

// ============================================================
// JUDGE0 TESTS (Python/JS)
// ============================================================

function testJudge0(testCase) {
    const payload = JSON.stringify({
        source_code: testCase.code,
        language_id: testCase.languageId,
        stdin: ''
    });

    const res = http.post(`${BASE_URL}/api/judge0/submissions`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: `${JUDGE0_TIMEOUT}s`
    });

    let passed = false;
    let output = '';
    let error = '';

    if (res.status === 200) {
        try {
            const data = JSON.parse(res.body);
            output = data.stdout || '';
            error = data.stderr || data.compile_output || '';

            if (output.trim().includes(testCase.expectedOutput)) {
                passed = true;
            }
        } catch (e) {
            error = `JSON parse error: ${e.message}`;
        }
    } else {
        error = `HTTP ${res.status}: ${res.body}`;
    }

    return {
        passed,
        output: output.trim(),
        error,
        statusCode: res.status,
        responseTime: res.timings.duration
    };
}

// ============================================================
// MAIN TEST EXECUTION
// ============================================================

export default function () {
    console.log('='.repeat(60));
    console.log('COURSE ENGINE FUNCTIONAL TEST');
    console.log('='.repeat(60));

    // Test HTML Validation
    group('HTML Engine', function () {
        const testCase = TEST_CASES.html;
        const result = validateHtml(testCase.code, testCase.validationCode);

        console.log(`\n[${testCase.name}]`);
        console.log(`  Validation: ${testCase.validationCode}`);
        console.log(`  Result: ${result.passed ? '✅ PASS' : '❌ FAIL'}`);

        check(result, {
            'HTML validation works': (r) => r.passed === testCase.expectedPass,
        });
    });

    // Test CSS Validation
    group('CSS Engine', function () {
        const testCase = TEST_CASES.css;
        const result = validateCss(testCase.code, testCase.validationCode);

        console.log(`\n[${testCase.name}]`);
        console.log(`  Validation: ${testCase.validationCode}`);
        console.log(`  Result: ${result.passed ? '✅ PASS' : '❌ FAIL'}`);

        check(result, {
            'CSS validation works': (r) => r.passed === testCase.expectedPass,
        });
    });

    // Test Tailwind Validation
    group('Tailwind Engine', function () {
        const testCase = TEST_CASES.tailwind;
        const result = validateHtml(testCase.code, testCase.validationCode);

        console.log(`\n[${testCase.name}]`);
        console.log(`  Validation: ${testCase.validationCode}`);
        console.log(`  Result: ${result.passed ? '✅ PASS' : '❌ FAIL'}`);

        check(result, {
            'Tailwind validation works': (r) => r.passed === testCase.expectedPass,
        });
    });

    // Test React Validation
    group('React Engine', function () {
        const testCase = TEST_CASES.react;
        const result = validateHtml(testCase.code, testCase.validationCode);

        console.log(`\n[${testCase.name}]`);
        console.log(`  Validation: ${testCase.validationCode}`);
        console.log(`  Result: ${result.passed ? '✅ PASS' : '❌ FAIL'}`);

        check(result, {
            'React validation works': (r) => r.passed === testCase.expectedPass,
        });
    });

    // Test JavaScript via Judge0
    group('JavaScript Engine (Judge0)', function () {
        const testCase = TEST_CASES.javascript;
        const result = testJudge0(testCase);

        console.log(`\n[${testCase.name}]`);
        console.log(`  Code: ${testCase.code}`);
        console.log(`  Expected: "${testCase.expectedOutput}"`);
        console.log(`  Actual: "${result.output}"`);
        console.log(`  Response Time: ${result.responseTime}ms`);
        console.log(`  Result: ${result.passed ? '✅ PASS' : '❌ FAIL'}`);
        if (result.error) console.log(`  Error: ${result.error}`);

        check(result, {
            'JavaScript Judge0 returns 200': (r) => r.statusCode === 200,
            'JavaScript output matches': (r) => r.passed,
        });
    });

    sleep(1); // Rate limit between Judge0 calls

    // Test Python via Judge0
    group('Python Engine (Judge0)', function () {
        const testCase = TEST_CASES.python;
        const result = testJudge0(testCase);

        console.log(`\n[${testCase.name}]`);
        console.log(`  Code: ${testCase.code}`);
        console.log(`  Expected: "${testCase.expectedOutput}"`);
        console.log(`  Actual: "${result.output}"`);
        console.log(`  Response Time: ${result.responseTime}ms`);
        console.log(`  Result: ${result.passed ? '✅ PASS' : '❌ FAIL'}`);
        if (result.error) console.log(`  Error: ${result.error}`);

        check(result, {
            'Python Judge0 returns 200': (r) => r.statusCode === 200,
            'Python output matches': (r) => r.passed,
        });
    });

    console.log('\n' + '='.repeat(60));
    console.log('TEST COMPLETE');
    console.log('='.repeat(60));
}

// ============================================================
// SUMMARY HANDLER
// ============================================================

export function handleSummary(data) {
    const passed = data.metrics.checks ? data.metrics.checks.values.passes : 0;
    const failed = data.metrics.checks ? data.metrics.checks.values.fails : 0;
    const total = passed + failed;

    const summary = `
╔══════════════════════════════════════════════════════════╗
║           COURSE ENGINE TEST SUMMARY                     ║
╠══════════════════════════════════════════════════════════╣
║  Checks Passed: ${String(passed).padEnd(5)} / ${total}                            ║
║  Checks Failed: ${String(failed).padEnd(5)}                                    ║
║  Success Rate:  ${String(Math.round((passed / total) * 100)).padEnd(3)}%                                    ║
╠══════════════════════════════════════════════════════════╣
║  Engines Tested:                                         ║
║    ✓ HTML Validation                                     ║
║    ✓ CSS Validation                                      ║
║    ✓ Tailwind CSS Validation                             ║
║    ✓ React Validation                                    ║
║    ✓ JavaScript (Judge0)                                 ║
║    ✓ Python (Judge0)                                     ║
╚══════════════════════════════════════════════════════════╝
`;

    console.log(summary);

    return {
        stdout: summary,
        'tests/k6/results/course_engine_results.json': JSON.stringify(data, null, 2)
    };
}
