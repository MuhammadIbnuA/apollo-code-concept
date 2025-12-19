"use client";

import React from "react";
import Editor, { OnMount } from "@monaco-editor/react";

interface CodeEditorProps {
    initialValue: string;
    onChange: (value: string | undefined) => void;
    language?: string;
    theme?: "vs-dark" | "light";
}

export default function CodeEditor({
    initialValue,
    onChange,
    language = "python",
    theme = "vs-dark",
}: CodeEditorProps) {
    const handleEditorDidMount: OnMount = (editor, monaco) => {
        // We can configure themes here if we want a custom one
        monaco.editor.defineTheme("premium-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
                "editor.background": "#1e1e2e", // Catppuccin Mocha-ish or similar premium dark
            },
        });
        monaco.editor.setTheme("premium-dark");
    };

    return (
        <div className="h-full w-full overflow-hidden rounded-md border border-gray-700 shadow-xl">
            <Editor
                height="100%"
                defaultLanguage={language}
                defaultValue={initialValue}
                theme={theme}
                onChange={onChange}
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16 },
                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                }}
            />
        </div>
    );
}
