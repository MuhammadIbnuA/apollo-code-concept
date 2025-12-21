'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, CheckCircle, XCircle, Eye } from 'lucide-react';

interface HtmlPreviewProps {
    code: string;
    validationCode?: string;
    validationType?: 'html' | 'css';
    onValidationResult?: (passed: boolean, message: string) => void;
}

/**
 * HTML/CSS Preview with Validation
 * 
 * Validation Code Format:
 * - HTML: "tag:text|tag[attr]|tag" (e.g., "h1:Hello|a[href]|ul")
 * - CSS: "selector{property:value}" (e.g., "h1{color:blue}")
 */
export default function HtmlPreview({
    code,
    validationCode,
    validationType = 'html',
    onValidationResult
}: HtmlPreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [validationStatus, setValidationStatus] = useState<'pending' | 'passed' | 'failed'>('pending');
    const [validationMessage, setValidationMessage] = useState('');
    const [showPreview, setShowPreview] = useState(true);

    // Validate using DOMParser (doesn't require iframe access)
    const validateWithParser = useCallback((htmlCode: string, rules: string, type: 'html' | 'css') => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlCode, 'text/html');

        if (type === 'css') {
            return validateCss(doc, htmlCode, rules);
        } else {
            return validateHtml(doc, rules);
        }
    }, []);

    // Validate HTML elements
    const validateHtml = (doc: Document, rules: string): { passed: boolean; message: string } => {
        const checks = rules.split('|');
        const results: string[] = [];
        let allPassed = true;

        for (const check of checks) {
            // Parse: tag:text or tag[attr] or just tag
            const textMatch = check.match(/^(\w+):(.+)$/);
            const attrMatch = check.match(/^(\w+)\[(.+)\]$/);

            if (textMatch) {
                // Check tag with specific text
                const [, tag, text] = textMatch;
                const elements = doc.querySelectorAll(tag);
                const found = Array.from(elements).some(el => el.textContent?.includes(text));
                if (found) {
                    results.push(`✅ <${tag}> dengan "${text}" ditemukan`);
                } else {
                    results.push(`❌ <${tag}> dengan "${text}" tidak ditemukan`);
                    allPassed = false;
                }
            } else if (attrMatch) {
                // Check tag with attribute
                const [, tag, attr] = attrMatch;
                const attrParts = attr.split('=');
                const attrName = attrParts[0];
                const attrValue = attrParts[1]?.replace(/"/g, '');

                const elements = doc.querySelectorAll(tag);
                let found = false;

                for (const el of elements) {
                    if (attrValue) {
                        if (el.getAttribute(attrName) === attrValue) {
                            found = true;
                            break;
                        }
                    } else if (el.hasAttribute(attrName)) {
                        found = true;
                        break;
                    }
                }

                if (found) {
                    results.push(`✅ <${tag} ${attr}> ditemukan`);
                } else {
                    results.push(`❌ <${tag} ${attr}> tidak ditemukan`);
                    allPassed = false;
                }
            } else {
                // Just check if tag exists
                const elements = doc.querySelectorAll(check);
                if (elements.length > 0) {
                    results.push(`✅ <${check}> ditemukan`);
                } else {
                    results.push(`❌ <${check}> tidak ditemukan`);
                    allPassed = false;
                }
            }
        }

        return {
            passed: allPassed,
            message: results.join('\n')
        };
    };

    // Validate CSS rules by checking if they exist in the code
    const validateCss = (doc: Document, htmlCode: string, rules: string): { passed: boolean; message: string } => {
        const checks = rules.split('|');
        const results: string[] = [];
        let allPassed = true;

        // Extract CSS from style tags
        const styleMatch = htmlCode.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        const cssContent = styleMatch ? styleMatch[1] : '';

        for (const check of checks) {
            // Parse: selector{property:value;property2:value2}
            const match = check.match(/^(.+)\{(.+)\}$/);

            if (match) {
                const [, selector, propsStr] = match;
                const props = propsStr.split(';').filter(p => p.trim());

                // Check if selector exists in HTML
                const elements = doc.querySelectorAll(selector);
                if (elements.length === 0) {
                    results.push(`❌ Selector "${selector}" tidak ditemukan di HTML`);
                    allPassed = false;
                    continue;
                }

                // Check if CSS properties exist
                for (const prop of props) {
                    const [propName, propValue] = prop.split(':').map(s => s.trim());

                    if (!propName) continue;

                    // Create regex to find the property in CSS
                    const propRegex = propValue
                        ? new RegExp(`${propName}\\s*:\\s*${propValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i')
                        : new RegExp(`${propName}\\s*:`, 'i');

                    // Check in inline styles first
                    let foundInline = false;
                    for (const el of elements) {
                        const style = el.getAttribute('style') || '';
                        if (propRegex.test(style)) {
                            foundInline = true;
                            break;
                        }
                    }

                    // Check in CSS content
                    const foundInCss = propRegex.test(cssContent);

                    if (foundInline || foundInCss) {
                        results.push(`✅ ${selector} { ${propName}${propValue ? `: ${propValue}` : ''} }`);
                    } else {
                        results.push(`❌ ${selector} { ${propName}${propValue ? `: ${propValue}` : ''} } tidak ditemukan`);
                        allPassed = false;
                    }
                }
            }
        }

        return {
            passed: allPassed,
            message: results.join('\n')
        };
    };

    // Run validation
    const runValidation = () => {
        if (!validationCode) {
            setValidationStatus('pending');
            return;
        }

        const result = validateWithParser(code, validationCode, validationType);

        setValidationStatus(result.passed ? 'passed' : 'failed');
        setValidationMessage(result.message);
        onValidationResult?.(result.passed, result.message);
    };

    return (
        <div className="h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <Eye size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-300">Preview</span>
                </div>
                <div className="flex items-center gap-2">
                    {validationCode && (
                        <button
                            onClick={runValidation}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                        >
                            <Play size={14} />
                            Validasi
                        </button>
                    )}
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${showPreview ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                            }`}
                    >
                        {showPreview ? 'Hide' : 'Show'}
                    </button>
                </div>
            </div>

            {/* Preview using srcdoc */}
            {showPreview && (
                <div className="flex-1 bg-white">
                    <iframe
                        ref={iframeRef}
                        title="HTML Preview"
                        className="w-full h-full border-0"
                        srcDoc={code}
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>
            )}

            {/* Validation Result */}
            {validationStatus !== 'pending' && (
                <div className={`p-3 border-t ${validationStatus === 'passed'
                        ? 'bg-green-900/50 border-green-700'
                        : 'bg-red-900/50 border-red-700'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        {validationStatus === 'passed' ? (
                            <>
                                <CheckCircle size={18} className="text-green-400" />
                                <span className="text-green-400 font-medium">Validasi Berhasil!</span>
                            </>
                        ) : (
                            <>
                                <XCircle size={18} className="text-red-400" />
                                <span className="text-red-400 font-medium">Validasi Gagal</span>
                            </>
                        )}
                    </div>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                        {validationMessage}
                    </pre>
                </div>
            )}
        </div>
    );
}
