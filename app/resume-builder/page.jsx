'use client'; 

import { useState } from 'react';
import CardStepper from '@/components/ui/CardStepper';
import TemplatePreview from '@/components/resume/TemplatePreview';
import BasicInfoCard from '@/components/resume/forms/BasicInfoCard';
import ExperienceCard from '@/components/resume/forms/ExperienceCard';
import EducationCard from '@/components/resume/forms/EducationCard';
import SkillsCard from '@/components/resume/forms/SkillsCard';

const steps = [
  // ... (Steps array remains the same)
  { id: 1, name: 'Basic Info', Component: BasicInfoCard },
  { id: 2, name: 'Experience', Component: ExperienceCard },
  { id: 3, name: 'Education', Component: EducationCard },
  { id: 4, name: 'Skills', Component: SkillsCard },
  { id: 5, name: 'Choose Template', Component: TemplatePreview },
];

export default function ResumeBuilderPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  // ... (handler functions remain the same)
  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleNext = () => {
    if (step <= steps.length) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };
  
  const handleTemplateSelect = (templateName) => {
    updateFormData({ template: templateName }); 
    handleNext(); 
  };


  const handleGenerateResume = async () => {
    setIsGenerating(true);
    try {
      // Ensure template is selected
      const payload = { ...formData };
      if (!payload.template) payload.template = 'Template1';

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Generate failed', errText);
        alert('Failed to generate resume. Please try again.');
        return;
      }

      const blob = await response.blob();
      // Attempt to extract filename from header
      const disp = response.headers.get('Content-Disposition') || '';
      let filename = `${payload.basicInfo?.name || 'DevHire'}_Resume.pdf`;
      const match = disp.match(/filename="?([^";]+)"?/);
      if (match && match[1]) filename = match[1];

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating resume:', error);
      alert('An error occurred while generating the resume.');
    } finally {
      setIsGenerating(false);
    }
  };

  const CurrentStepComponent = steps.find(s => s.id === step)?.Component;

  return (
    // 🛑 UPDATED: Dark background
    <div className="min-h-screen bg-slate-900 text-gray-50 p-8"> 
      <h1 className="text-4xl font-bold text-center text-indigo-400 mb-8">
        Build Your Tech Future
      </h1>

      <CardStepper currentStep={step} steps={steps} /> 

      {/* 🛑 UPDATED: Darker card background, subtle border, lighter shadow */}
      <div className="max-w-3xl mx-auto bg-slate-800 border border-slate-700 shadow-xl rounded-lg p-8 mt-8">
        
        {CurrentStepComponent && (
          <CurrentStepComponent
            formData={formData}
            updateFormData={updateFormData}
            onTemplateSelect={handleTemplateSelect} 
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}
        
        {/* Final Generation Step (Step 6) */}
        {step > steps.length && (
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4 text-indigo-400">Ready Your Tech Resume</h2>
                <p className="mb-6 text-gray-300">Finalize your resume for DevHire.</p>
                
                <button
                    onClick={handleGenerateResume}
                    disabled={isGenerating}
                    // 🛑 UPDATED: Accent color for primary action (Green/Indigo mix from theme)
                    className={`mt-6 px-8 py-3 font-semibold rounded-lg shadow-md transition duration-300 ${
                        isGenerating ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-green-500 text-slate-900 hover:bg-green-400'
                    }`}
                >
                    {isGenerating ? 
                        (<>Generating... Please Wait</>) : 
                        (<>Generate & Download PDF</>)
                    }
                </button>
                <button
                    onClick={() => setStep(steps.length)} 
                    // 🛑 UPDATED: Secondary color from theme
                    className="mt-4 block mx-auto text-indigo-400 hover:text-indigo-300"
                >
                    Change Template
                </button>
            </div>
        )}
      </div>
    </div>
  );
}