// components/resume/forms/EducationCard.js
import { useState, useEffect } from 'react';
import { GraduationCap, X } from 'lucide-react';

const inputClass = "w-full p-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors";
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

    const handleAddSchool = () => setSchools([...schools, { ...emptySchool }]);
    const handleRemoveSchool = (index) => setSchools(schools.filter((_, i) => i !== index));

    const handleSubmit = (e) => {
        e.preventDefault();
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">3. Education</h2>
                <p className="text-sm text-muted-foreground mt-1">List your degrees, certifications, and relevant coursework.</p>
            </div>

            {schools.map((school, index) => (
                <div key={index} className="p-5 rounded-xl border border-border bg-background/50 space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-violet-500" />
                            <h3 className="font-semibold text-foreground">Education #{index + 1}</h3>
                        </div>
                        {schools.length > 1 && (
                            <button
                                type="button" onClick={() => handleRemoveSchool(index)}
                                className="text-red-500 hover:text-red-400 text-sm flex items-center gap-1"
                            >
                                <X className="w-3.5 h-3.5" /> Remove
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input type="text" placeholder="Degree (e.g., B.Tech CS)" required={index === 0}
                            value={school.degree} onChange={(e) => handleChange(index, 'degree', e.target.value)}
                            className={inputClass}
                        />
                        <input type="text" placeholder="Institution Name" required={index === 0}
                            value={school.institution} onChange={(e) => handleChange(index, 'institution', e.target.value)}
                            className={inputClass}
                        />
                        <input type="text" placeholder="City, Country"
                            value={school.city} onChange={(e) => handleChange(index, 'city', e.target.value)}
                            className={inputClass}
                        />
                        <input type="text" placeholder="GPA/Percentage"
                            value={school.gpa} onChange={(e) => handleChange(index, 'gpa', e.target.value)}
                            className={inputClass}
                        />
                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">Start Date</label>
                            <input type="month" required={index === 0}
                                value={school.startDate} onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">End Date</label>
                            <input type="month" required={index === 0}
                                value={school.endDate} onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button" onClick={handleAddSchool}
                className="w-full py-3 border-2 border-dashed border-border text-muted-foreground rounded-xl hover:border-violet-500/50 hover:text-violet-500 transition-colors"
            >
                + Add Another Institution
            </button>

            <div className="flex justify-between">
                <button type="button" onClick={onPrev} className="px-5 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    ← Previous
                </button>
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium rounded-xl hover:scale-105 transition-transform shadow-lg">
                    Next: Skills →
                </button>
            </div>
        </form>
    );
}