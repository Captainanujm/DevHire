// components/resume/forms/ExperienceCard.js
import { useState, useEffect } from 'react';

const emptyJob = { title: '', company: '', startDate: '', endDate: '', description: [''] };

export default function ExperienceCard({ formData, updateFormData, onNext, onPrev }) {
    // Filter out potential empty job entries when initializing state
    const [jobs, setJobs] = useState(formData.experience?.filter(j => j.title) || [emptyJob]);

    // Update parent state when local job list changes
    useEffect(() => {
        updateFormData({ experience: jobs.filter(job => job.title) });
    }, [jobs]);

    const handleJobChange = (index, field, value) => {
        const newJobs = [...jobs];
        
        if (field === 'description') {
             // Handle array of bullet points
             newJobs[index].description[value.index] = value.text;
        } else {
             // Handle simple string fields
             newJobs[index][field] = value;
        }
        setJobs(newJobs);
    };

    const handleAddJob = () => setJobs([...jobs, emptyJob]);
    const handleRemoveJob = (index) => setJobs(jobs.filter((_, i) => i !== index));
    const handleAddBullet = (jobIndex) => {
        const newJobs = [...jobs];
        newJobs[jobIndex].description.push('');
        setJobs(newJobs);
    };
    const handleRemoveBullet = (jobIndex, bulletIndex) => {
        const newJobs = [...jobs];
        newJobs[jobIndex].description = newJobs[jobIndex].description.filter((_, i) => i !== bulletIndex);
        setJobs(newJobs);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-indigo-700 mb-6">2. Professional Experience</h2>
            <p className="text-sm text-gray-500 mb-4">**For Freshers:** Fill in internships or focus on the Projects section (if you add one to your data model).</p>

            {jobs.map((job, index) => (
                <div key={index} className="p-4 border border-slate-700 rounded-lg mb-6 bg-slate-800">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-gray-100">Job #{index + 1}</h3>
                        {jobs.length > 1 && (
                            <button 
                                type="button" onClick={() => handleRemoveJob(index)}
                                className="text-red-500 hover:text-red-700 text-sm"
                            >
                                Remove Job
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <input type="text" placeholder="Job Title" required={index === 0}
                            value={job.title} onChange={(e) => handleJobChange(index, 'title', e.target.value)}
                            className="p-2 border border-slate-700 rounded-lg bg-slate-700 text-gray-100 placeholder-gray-400"
                        />
                        <input type="text" placeholder="Company Name" required={index === 0}
                            value={job.company} onChange={(e) => handleJobChange(index, 'company', e.target.value)}
                            className="p-2 border border-slate-700 rounded-lg bg-slate-700 text-gray-100 placeholder-gray-400"
                        />
                        <input type="month" placeholder="Start Date" required={index === 0}
                            value={job.startDate} onChange={(e) => handleJobChange(index, 'startDate', e.target.value)}
                            className="p-2 border border-slate-700 rounded-lg bg-slate-700 text-gray-100 placeholder-gray-400"
                        />
                        <input type="month" placeholder="End Date (or 'Present')" required={index === 0}
                            value={job.endDate} onChange={(e) => handleJobChange(index, 'endDate', e.target.value)}
                            className="p-2 border border-slate-700 rounded-lg bg-slate-700 text-gray-100 placeholder-gray-400"
                        />
                    </div>
                    
                    <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Key Achievements (Action-Verb, Result, Metric!)</label>
                    <div className="space-y-2">
                        {job.description.map((bullet, bulletIndex) => (
                            <div key={bulletIndex} className="flex items-center space-x-2">
                                <input 
                                    type="text" placeholder={`Bullet Point ${bulletIndex + 1}`}
                                    value={bullet}
                                    onChange={(e) => handleJobChange(index, 'description', { index: bulletIndex, text: e.target.value })}
                                    className="flex-grow p-2 border border-slate-700 rounded-lg bg-slate-700 text-gray-100 placeholder-gray-400"
                                />
                                {job.description.length > 1 && (
                                    <button 
                                        type="button" onClick={() => handleRemoveBullet(index, bulletIndex)}
                                        className="text-red-400 hover:text-red-600"
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                        ))}
                        <button 
                            type="button" onClick={() => handleAddBullet(index)}
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                        >
                            + Add Bullet Point
                        </button>
                    </div>
                </div>
            ))}
            
            <button 
                type="button" onClick={handleAddJob}
                className="w-full py-2 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition mb-6"
            >
                + Add Another Job
            </button>
            
            <div className="flex justify-between mt-6">
                <button type="button" onClick={onPrev} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                    Previous
                </button>
                <button type="button" onClick={onNext} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
                    Next: Education
                </button>
            </div>
        </div>
    );
}