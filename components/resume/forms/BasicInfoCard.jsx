// components/resume/forms/BasicInfoCard.js
import { useEffect } from 'react';

export default function BasicInfoCard({ formData, updateFormData, onNext }) {
    const basicInfo = formData.basicInfo || {};

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Update the nested basicInfo object
        updateFormData({ basicInfo: { ...basicInfo, [name]: value } });
    };
    
    // Handler for the top-level summary field
    const handleSummaryChange = (e) => {
        updateFormData({ summary: e.target.value });
    };

    // FIX: The required function definition for the form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        onNext();
    };

    return (
        // Ensure handleSubmit is defined (it is above)
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 🛑 UPDATED: Title color to indigo-400 for contrast */}
            <h2 className="text-2xl font-bold text-indigo-400 mb-4">1. Personal Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 🛑 UPDATED: Darker input fields (bg-slate-700), light text, slate border */}
                <input 
                    type="text" name="name" placeholder="Full Name (e.g., Jane Doe)" required
                    value={basicInfo.name || ''} onChange={handleChange}
                    className="p-3 border border-slate-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-slate-700 text-gray-100 placeholder-gray-400"
                />
                <input 
                    type="text" name="title" placeholder="Professional Title (e.g., Software Engineer)" required
                    value={basicInfo.title || ''} onChange={handleChange}
                    className="p-3 border border-slate-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-slate-700 text-gray-100 placeholder-gray-400"
                />
                <input 
                    type="email" name="email" placeholder="Email Address" required
                    value={basicInfo.email || ''} onChange={handleChange}
                    className="p-3 border border-slate-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-slate-700 text-gray-100 placeholder-gray-400"
                />
                <input 
                    type="tel" name="phone" placeholder="Phone Number"
                    value={basicInfo.phone || ''} onChange={handleChange}
                    className="p-3 border border-slate-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-slate-700 text-gray-100 placeholder-gray-400"
                />
                <input 
                    type="url" name="linkedin" placeholder="LinkedIn URL"
                    value={basicInfo.linkedin || ''} onChange={handleChange}
                    className="p-3 border border-slate-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-slate-700 text-gray-100 placeholder-gray-400"
                />
                <input 
                    type="text" name="location" placeholder="City, Country"
                    value={basicInfo.location || ''} onChange={handleChange}
                    className="p-3 border border-slate-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-slate-700 text-gray-100 placeholder-gray-400"
                />
            </div>

            <div>
                {/* 🛑 UPDATED: Label text color */}
                <label className="block text-sm font-medium text-gray-300 mb-1">Professional Summary (Crucial for a "good" resume)</label>
                <textarea
                    name="summary" placeholder="A brief, powerful overview..."
                    value={formData.summary || ''} 
                    onChange={handleSummaryChange}
                    rows="3"
                    className="w-full p-3 border border-slate-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-slate-700 text-gray-100 placeholder-gray-400"
                />
            </div>
            
            <div className="flex justify-end">
                {/* 🛑 UPDATED: Primary button style */}
                <button 
                    type="submit" 
                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition"
                >
                    Next: Experience
                </button>
            </div>
        </form>
    );
}