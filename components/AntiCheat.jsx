"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { AlertTriangle, Maximize } from "lucide-react";

export default function AntiCheat({ violations, setViolations, maxViolations = 3, onAutoSubmit }) {
    const violationsRef = useRef(violations);
    violationsRef.current = violations;

    const onAutoSubmitRef = useRef(onAutoSubmit);
    useEffect(() => {
        onAutoSubmitRef.current = onAutoSubmit;
    }, [onAutoSubmit]);

    const [isFullscreen, setIsFullscreen] = useState(true);

    const handleViolation = useCallback(() => {
        const newCount = violationsRef.current + 1;
        setViolations(newCount);

        if (newCount >= maxViolations) {
            if (onAutoSubmitRef.current) {
                onAutoSubmitRef.current();
            }
        }
    }, [maxViolations, setViolations]);

    useEffect(() => {
        // Initial check
        setIsFullscreen(!!document.fullscreenElement);

        const handleFSChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false);
                handleViolation();
            } else {
                setIsFullscreen(true);
            }
        };

        const handleVisibilityChange = () => {
             // Record a violation if they switch tabs.
             // If they switch tabs, it usually pulls them out of fullscreen too, hitting handleFSChange,
             // but if it doesn't, we still record a violation here.
            if (document.hidden) {
                handleViolation();
            }
        };

        document.addEventListener("fullscreenchange", handleFSChange);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFSChange);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
        };
    }, [handleViolation]);

    const requestFullscreen = async () => {
        try {
            await document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } catch (err) {
            console.error("Could not request full screen", err);
        }
    };

    return (
        <>
            {/* Blocking Overlay if not fullscreen */}
            {!isFullscreen && violations < maxViolations && (
                <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    <div className="glass-card max-w-lg w-full p-8 rounded-3xl border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.15)] flex flex-col items-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center animate-pulse">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-foreground">Return to Fullscreen</h2>
                            <p className="text-muted-foreground">
                                This interview strictly requires fullscreen mode. Exiting fullscreen or swapping tabs has been recorded as a violation.
                            </p>
                        </div>
                        
                        <div className="w-full glass rounded-xl p-4 bg-red-500/5 border border-red-500/20">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-red-400">Current Violations</span>
                                <span className="text-sm font-bold text-red-500">{violations} / {maxViolations}</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-2">
                                <div 
                                    className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                                    style={{ width: `${(Math.min(violations, maxViolations) / maxViolations) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <button 
                            onClick={requestFullscreen}
                            className="w-full py-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl font-semibold flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/25"
                        >
                            <Maximize className="w-5 h-5" />
                            Return to Fullscreen
                        </button>
                    </div>
                </div>
            )}

            {/* Standard warning toast */}
            {violations > 0 && isFullscreen && (
                <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-right">
                    <div className={`glass-strong rounded-xl p-4 flex items-center gap-3 shadow-lg border ${violations >= maxViolations - 1 ? "border-red-500/50 bg-red-500/10" : "border-amber-500/50 bg-amber-500/10"}`}>
                        <AlertTriangle className={`h-5 w-5 ${violations >= maxViolations - 1 ? "text-red-400" : "text-amber-400"}`} />
                        <div>
                            <p className="text-sm font-medium text-foreground">Warning {violations}/{maxViolations}</p>
                            <p className="text-xs text-muted-foreground">
                                {violations >= maxViolations - 1 ? "Next violation will auto-submit interview!" : "Avoid tab-switching. Stay focused."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
