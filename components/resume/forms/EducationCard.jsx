// components/resume/forms/EducationCard.js
import { useState, useEffect } from 'react';

const emptySchool = { degree: '', institution: '', city: '', startDate: '', endDate: '', gpa: '' };

export default function EducationCard({ formData, updateFormData, onNext, onPrev }) {
    const [schools, setSchools] = useState(formData.education?.filter(s => s.degree || s.institution) || [emptySchool]);

    useEffect(() => {
        updateFormData({ education: schools.filter(school => school.degree || school.institution) });
    }, [schools]);

    const handleChange = (index, field, value) => {
        const newSchools = [...schools];
        newSchools[index][field] = value;
        setSchools(newSchools);
    };

    const handleAddSchool = () => setSchools([...schools, emptySchool]);
    const handleRemoveSchool = (index) => setSchools(schools.filter((_, i) => i !== index));

    const handleSubmit = (e) => {
        e.preventDefault();
        onNext();
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-indigo-700 mb-6">3. Education History</h2>
            <p className="text-sm text-gray-500 mb-4">List your degrees, certifications, and relevant coursework.</p>

            {schools.map((school, index) => (
                <div key={index} className="p-4 border border-slate-700 rounded-lg mb-6 bg-slate-800">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-gray-100">School / Degree #{index + 1}</h3>
                        {schools.length > 1 && (
                            <button 
                                type="button" onClick={() => handleRemoveSchool(index)}
                                className="text-red-500 hover:text-red-700 text-sm"
                            >
                                Remove Entry
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Degree (e.g., B.Tech CS)" required={index === 0}
                            value={school.degree} onChange={(e) => handleChange(index, 'degree', e.target.value)}
                            className="p-2 border border-slate-700 rounded-lg bg-slate-700 text-gray-100 placeholder-gray-400"
                        />
                        <input type="text" placeholder="Institution Name" required={index === 0}
                            value={school.institution} onChange={(e) => handleChange(index, 'institution', e.target.value)}
                            className="p-2 border border-slate-700 rounded-lg bg-slate-700 text-gray-100 placeholder-gray-400"
                        />
                        <input type="text" placeholder="City, Country"
                            value={school.city} onChange={(e) => handleChange(index, 'city', e.target.value)}
                            className="p-2 border border-slate-700 rounded-lg bg-slate-700 text-gray-100 placeholder-gray-400"
                        />
                        <input type="text" placeholder="GPA/Percentage (e.g., 9.5/10)"
                            value={school.gpa} onChange={(e) => handleChange(index, 'gpa', e.target.value)}
                            className="p-2 border border-slate-700 rounded-lg bg-slate-700 text-gray-100 placeholder-gray-400"
                        />
                        <label className="text-sm text-gray-200 flex items-center">
                            Start Date: 
                            <input type="month" required={index === 0}
                                value={school.startDate} onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                                className="p-2 border border-slate-700 rounded-lg bg-slate-700 text-gray-100 placeholder-gray-400 ml-2"
                            />
                        </label>
                        <label className="text-sm text-gray-200 flex items-center">
                            End Date: 
                            <input type="month" required={index === 0}
                                value={school.endDate} onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                                className="p-2 border border-slate-700 rounded-lg bg-slate-700 text-gray-100 placeholder-gray-400 ml-2"
                            />
                        </label>
                    </div>
                </div>
            ))}
            
            <button 
                type="button" onClick={handleAddSchool}
                className="w-full py-2 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition mb-6"
            >
                + Add Another Institution
            </button>
            
            <div className="flex justify-between mt-6">
                <button type="button" onClick={onPrev} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                    Previous
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
                    Next: Skills
                </button>
            </div>
        </form>
    );
}