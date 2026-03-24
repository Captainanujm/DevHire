"use client";

import { useEffect, useRef, useCallback } from "react";
import { AlertTriangle } from "lucide-react";

export default function AntiCheat({ violations, setViolations, maxViolations = 3, onAutoSubmit }) {
    const violationsRef = useRef(violations);
    violationsRef.current = violations;

    const handleViolation = useCallback(() => {
        const newCount = violationsRef.current + 1;
        setViolations(newCount);

        if (newCount >= maxViolations) {
            onAutoSubmit();
        }
    }, [maxViolations, onAutoSubmit, setViolations]);

    useEffect(() => {
        // Request fullscreen
        const requestFS = async () => {
            try {
                if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                }
            } catch (err) {
                console.warn("Fullscreen not available:", err);
            }
        };
        requestFS();

        // Visibility change detection
        const handleVisibility = () => {
            if (document.hidden) {
                handleViolation();
            }
        };

        // Blur detection (tab switch)
        const handleBlur = () => {
            handleViolation();
        };

        // Fullscreen exit detection
        const handleFSChange = () => {
            if (!document.fullscreenElement) {
                handleViolation();
                // Try to re-enter fullscreen
                try {
                    document.documentElement.requestFullscreen();
                } catch { }
            }
        };

        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("blur", handleBlur);
        document.addEventListener("fullscreenchange", handleFSChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("blur", handleBlur);
            document.removeEventListener("fullscreenchange", handleFSChange);
            // Exit fullscreen on unmount
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
        };
    }, [handleViolation]);

    if (violations === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-right">
            <div className={`glass-strong rounded-xl p-4 flex items-center gap-3 shadow-lg border ${violations >= maxViolations - 1 ? "border-red-500/50 bg-red-500/10" : "border-amber-500/50 bg-amber-500/10"
                }`}>
                <AlertTriangle className={`h-5 w-5 ${violations >= maxViolations - 1 ? "text-red-400" : "text-amber-400"}`} />
                <div>
                    <p className="text-sm font-medium text-foreground">
                        Warning {violations}/{maxViolations}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {violations >= maxViolations - 1
                            ? "Next violation will auto-submit!"
                            : "Tab switching detected. Stay on this page."}
                    </p>
                </div>
            </div>
        </div>
    );
}
