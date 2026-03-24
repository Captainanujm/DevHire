import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { code, language } = await req.json();

        if (!code) {
            return NextResponse.json({ error: "No code provided" }, { status: 400 });
        }

        // Simple JavaScript execution in server
        if (language === "javascript" || language === "typescript") {
            try {
                let output = "";
                const originalLog = console.log;
                const logs = [];

                // Override console.log to capture output
                const captureLog = (...args) => {
                    logs.push(args.map(a => {
                        if (typeof a === "object") return JSON.stringify(a, null, 2);
                        return String(a);
                    }).join(" "));
                };

                // Create a sandboxed execution
                const fn = new Function("console", code);
                fn({ log: captureLog, error: captureLog, warn: captureLog });

                output = logs.join("\n") || "Code executed successfully (no output)";

                return NextResponse.json({ output });
            } catch (err) {
                return NextResponse.json({ output: `Error: ${err.message}` });
            }
        }

        // For Python and other languages, return a message
        return NextResponse.json({
            output: `Language '${language}' execution is not supported in the browser.\nPlease use JavaScript for now.\n\nYour code:\n${code}`,
        });
    } catch (error) {
        return NextResponse.json({ error: "Execution failed" }, { status: 500 });
    }
}
