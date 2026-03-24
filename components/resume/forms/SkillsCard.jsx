// components/resume/forms/SkillsCard.js
import { useState, useEffect } from 'react';
import { Wrench } from 'lucide-react';

const inputClass = "w-full p-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors";

export default function SkillsCard({ formData, updateFormData, onNext, onPrev }) {
    const skills = formData.skills || {};

    const handleChange = (e) => {
        const { name, value } = e.target;
        updateFormData({ skills: { ...skills, [name]: value } });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">4. Technical Skills</h2>
                <p className="text-sm text-muted-foreground mt-1">Separate with commas (e.g., JavaScript, Python, C++).</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <Wrench className="w-3.5 h-3.5" />
                        Programming Languages
                    </label>
                    <input type="text" name="languages" placeholder="JavaScript, Python, TypeScript, HTML/CSS"
                        value={skills.languages || ''} onChange={handleChange}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <Wrench className="w-3.5 h-3.5" />
                        Frameworks & Libraries
                    </label>
                    <input type="text" name="frameworks" placeholder="React, Next.js, Node.js, Express.js, Tailwind CSS"
                        value={skills.frameworks || ''} onChange={handleChange}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <Wrench className="w-3.5 h-3.5" />
                        Databases & Tools
                    </label>
                    <input type="text" name="databases" placeholder="MongoDB, PostgreSQL, Git, Docker, AWS"
                        value={skills.databases || ''} onChange={handleChange}
                        className={inputClass}
                    />
                </div>
            </div>

            <div className="flex justify-between">
                <button type="button" onClick={onPrev} className="px-5 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    ← Previous
                </button>
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium rounded-xl hover:scale-105 transition-transform shadow-lg">
                    Next: Choose Template →
                </button>
            </div>
        </form>
    );
}