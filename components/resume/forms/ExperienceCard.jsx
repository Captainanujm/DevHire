// components/resume/forms/ExperienceCard.js
import { useState, useEffect } from 'react';
import { Plus, X, Briefcase } from 'lucide-react';

const inputClass = "w-full p-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors";
const emptyJob = { title: '', company: '', startDate: '', endDate: '', description: [''] };

export default function ExperienceCard({ formData, updateFormData, onNext, onPrev }) {
    const [jobs, setJobs] = useState(formData.experience?.filter(j => j.title) || [emptyJob]);

    useEffect(() => {
        updateFormData({ experience: jobs.filter(job => job.title) });
    }, [jobs]);

    const handleJobChange = (index, field, value) => {
        const newJobs = [...jobs];
        if (field === 'description') {
            newJobs[index].description[value.index] = value.text;
        } else {
            newJobs[index][field] = value;
        }
        setJobs(newJobs);
    };

    const handleAddJob = () => setJobs([...jobs, { ...emptyJob, description: [''] }]);
    const handleRemoveJob = (index) => setJobs(jobs.filter((_, i) => i !== index));
    const handleAddBullet = (jobIndex) => {
        const newJobs = [...jobs];
        newJobs[jobIndex].description = [...newJobs[jobIndex].description, ''];
        setJobs(newJobs);
    };
    const handleRemoveBullet = (jobIndex, bulletIndex) => {
        const newJobs = [...jobs];
        newJobs[jobIndex].description = newJobs[jobIndex].description.filter((_, i) => i !== bulletIndex);
        setJobs(newJobs);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">2. Professional Experience</h2>
                <p className="text-sm text-muted-foreground mt-1">For freshers: fill in internships or relevant projects.</p>
            </div>

            {jobs.map((job, index) => (
                <div key={index} className="p-5 rounded-xl border border-border bg-background/50 space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-500" />
                            <h3 className="font-semibold text-foreground">Job #{index + 1}</h3>
                        </div>
                        {jobs.length > 1 && (
                            <button
                                type="button" onClick={() => handleRemoveJob(index)}
                                className="text-red-500 hover:text-red-400 text-sm flex items-center gap-1"
                            >
                                <X className="w-3.5 h-3.5" /> Remove
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input type="text" placeholder="Job Title" required={index === 0}
                            value={job.title} onChange={(e) => handleJobChange(index, 'title', e.target.value)}
                            className={inputClass}
                        />
                        <input type="text" placeholder="Company Name" required={index === 0}
                            value={job.company} onChange={(e) => handleJobChange(index, 'company', e.target.value)}
                            className={inputClass}
                        />
                        <input type="month" placeholder="Start Date" required={index === 0}
                            value={job.startDate} onChange={(e) => handleJobChange(index, 'startDate', e.target.value)}
                            className={inputClass}
                        />
                        <input type="month" placeholder="End Date"
                            value={job.endDate} onChange={(e) => handleJobChange(index, 'endDate', e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Key Achievements</label>
                        <div className="space-y-2">
                            {job.description.map((bullet, bulletIndex) => (
                                <div key={bulletIndex} className="flex items-center gap-2">
                                    <input
                                        type="text" placeholder={`Achievement ${bulletIndex + 1}`}
                                        value={bullet}
                                        onChange={(e) => handleJobChange(index, 'description', { index: bulletIndex, text: e.target.value })}
                                        className={inputClass}
                                    />
                                    {job.description.length > 1 && (
                                        <button
                                            type="button" onClick={() => handleRemoveBullet(index, bulletIndex)}
                                            className="text-red-400 hover:text-red-300 p-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button" onClick={() => handleAddBullet(index)}
                                className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Bullet Point
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button" onClick={handleAddJob}
                className="w-full py-3 border-2 border-dashed border-border text-muted-foreground rounded-xl hover:border-blue-500/50 hover:text-blue-500 transition-colors"
            >
                + Add Another Job
            </button>

            <div className="flex justify-between">
                <button type="button" onClick={onPrev} className="px-5 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    ← Previous
                </button>
                <button type="button" onClick={onNext} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium rounded-xl hover:scale-105 transition-transform shadow-lg">
                    Next: Education →
                </button>
            </div>
        </div>
    );
}