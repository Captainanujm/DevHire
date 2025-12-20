// components/resume/TemplatePreview.js
import React from 'react';

const templates = [
    { id: 'Template1', name: 'Professional Modern', description: 'Clean layout, two columns for clear hierarchy.', color: 'border-indigo-600' },
    { id: 'Template2', name: 'Classic Minimal', description: 'One-column, text-heavy, traditional look (coming soon).', color: 'border-gray-400', disabled: true },
];

const TemplatePreview = ({ onTemplateSelect, onPrev }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-indigo-700 mb-6">5. Choose Your Resume Template</h2>
            <p className="text-gray-600 mb-8">Select a layout that best presents your experience (especially important for freshers!).</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                    <div 
                        key={template.id} 
                        className={`p-4 border-2 rounded-lg transition duration-300 ${
                            template.disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'hover:shadow-xl cursor-pointer bg-white'
                        }`}
                        onClick={() => !template.disabled && onTemplateSelect(template.id)}
                    >
                        <h3 className={`text-xl font-semibold mb-2 text-gray-800 border-b-2 pb-1 ${template.color}`}>{template.name}</h3>
                        <p className="text-sm mb-4">{template.description}</p>
                        
                        {/* Mock-up Preview */}
                        <div className="h-40 bg-white border border-dashed flex items-center justify-center text-xs text-gray-400">
                            {template.disabled ? 'PREVIEW UNAVAILABLE' : 'Template Mock-up'}
                        </div>
                        
                        <button
                            disabled={template.disabled}
                            className={`mt-4 w-full py-2 text-white rounded ${
                                template.disabled ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                            onClick={() => !template.disabled && onTemplateSelect(template.id)}
                        >
                            {template.disabled ? 'Coming Soon' : 'Select This Template'}
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex justify-start mt-8">
                <button type="button" onClick={onPrev} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                    Previous
                </button>
            </div>
        </div>
    );
};
export default TemplatePreview;