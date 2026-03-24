// components/resume/TemplatePreview.js
import React from 'react';
import { FileText, CheckCircle, Lock } from 'lucide-react';

const templates = [
    { id: 'Template1', name: 'Professional Modern', description: 'Clean ATS-friendly layout with professional typography and clear hierarchy. Perfect for tech roles.', color: 'from-blue-500 to-violet-500' },
    { id: 'Template2', name: 'Classic Minimal', description: 'One-column, text-heavy, traditional look. Great for content-heavy resumes.', color: 'from-slate-500 to-slate-600', disabled: true },
];

const TemplatePreview = ({ onTemplateSelect, onPrev }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Template</h2>
            <p className="text-muted-foreground mb-6">Select a layout that best presents your experience.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className={`glass-card rounded-2xl p-5 transition-all cursor-pointer ${template.disabled
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:shadow-lg hover:scale-[1.02]'
                            }`}
                        onClick={() => !template.disabled && onTemplateSelect(template.id)}
                    >
                        {/* Template preview mockup */}
                        <div className={`h-40 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-4`}>
                            {template.disabled ? (
                                <Lock className="w-8 h-8 text-white/60" />
                            ) : (
                                <FileText className="w-8 h-8 text-white/80" />
                            )}
                        </div>

                        <h3 className="text-lg font-semibold text-foreground mb-1">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                        <button
                            disabled={template.disabled}
                            className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${template.disabled
                                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:shadow-lg'
                                }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                !template.disabled && onTemplateSelect(template.id);
                            }}
                        >
                            {template.disabled ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Lock className="w-3.5 h-3.5" />
                                    Coming Soon
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Select Template
                                </span>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex justify-start mt-6">
                <button
                    type="button"
                    onClick={onPrev}
                    className="px-5 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                    ← Previous
                </button>
            </div>
        </div>
    );
};
export default TemplatePreview;