// components/resume/forms/SkillsCard.js
import { useState, useEffect } from 'react';

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
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">4. Technical Skills</h2>
            <p className="text-sm text-gray-500 mb-4">Separate technologies/tools with commas (e.g., JavaScript, Python, C++). Be specific!</p>
            
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Programming Languages</label>
                <input type="text" name="languages" placeholder="JavaScript, Python, TypeScript, HTML/CSS"
                    value={skills.languages || ''} onChange={handleChange}
                    className="p-3 border border-slate-700 w-full rounded-lg bg-slate-700 text-gray-100 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Frameworks & Libraries</label>
                <input type="text" name="frameworks" placeholder="React, Next.js, Node.js, Express.js, Tailwind CSS"
                    value={skills.frameworks || ''} onChange={handleChange}
                    className="p-3 border border-slate-700 w-full rounded-lg bg-slate-700 text-gray-100 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Databases & Tools</label>
                <input type="text" name="databases" placeholder="MongoDB, PostgreSQL, Git, Docker, AWS (EC2, S3)"
                    value={skills.databases || ''} onChange={handleChange}
                    className="p-3 border border-slate-700 w-full rounded-lg bg-slate-700 text-gray-100 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            
            <div className="flex justify-between mt-6">
                <button type="button" onClick={onPrev} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                    Previous
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
                    Next: Choose Template
                </button>
            </div>
        </form>
    );
}