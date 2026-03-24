// components/resume/forms/BasicInfoCard.js
import { useEffect } from 'react';

const inputClass = "w-full p-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors";

export default function BasicInfoCard({ formData, updateFormData, onNext }) {
    const basicInfo = formData.basicInfo || {};

    const handleChange = (e) => {
        const { name, value } = e.target;
        updateFormData({ basicInfo: { ...basicInfo, [name]: value } });
    };

    const handleSummaryChange = (e) => {
        updateFormData({ summary: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">1. Personal Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text" name="name" placeholder="Full Name (e.g., Jane Doe)" required
                    value={basicInfo.name || ''} onChange={handleChange}
                    className={inputClass}
                />
                <input
                    type="text" name="title" placeholder="Professional Title (e.g., Software Engineer)" required
                    value={basicInfo.title || ''} onChange={handleChange}
                    className={inputClass}
                />
                <input
                    type="email" name="email" placeholder="Email Address" required
                    value={basicInfo.email || ''} onChange={handleChange}
                    className={inputClass}
                />
                <input
                    type="tel" name="phone" placeholder="Phone Number"
                    value={basicInfo.phone || ''} onChange={handleChange}
                    className={inputClass}
                />
                <input
                    type="url" name="linkedin" placeholder="LinkedIn URL"
                    value={basicInfo.linkedin || ''} onChange={handleChange}
                    className={inputClass}
                />
                <input
                    type="text" name="location" placeholder="City, Country"
                    value={basicInfo.location || ''} onChange={handleChange}
                    className={inputClass}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Professional Summary</label>
                <textarea
                    name="summary" placeholder="A brief, powerful overview of your professional background..."
                    value={formData.summary || ''}
                    onChange={handleSummaryChange}
                    rows="3"
                    className={inputClass}
                />
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium rounded-xl hover:scale-105 transition-transform shadow-lg"
                >
                    Next: Experience →
                </button>
            </div>
        </form>
    );
}