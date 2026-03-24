'use client';

import { useState } from 'react';
import CardStepper from '@/components/ui/CardStepper';
import TemplatePreview from '@/components/resume/TemplatePreview';
import BasicInfoCard from '@/components/resume/forms/BasicInfoCard';
import ExperienceCard from '@/components/resume/forms/ExperienceCard';
import EducationCard from '@/components/resume/forms/EducationCard';
import SkillsCard from '@/components/resume/forms/SkillsCard';
import { FileText, Download, ChevronLeft } from 'lucide-react';

const steps = [
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
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <FileText className="w-6 h-6 text-blue-500" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Resume Builder</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
            Build Your ATS-Friendly Resume
          </h1>
          <p className="text-muted-foreground mt-2">
            Step {step} of {steps.length + 1} — {step <= steps.length ? steps[step - 1]?.name : 'Generate PDF'}
          </p>
        </div>

        <CardStepper currentStep={step} steps={steps} />

        {/* Card */}
        <div className="glass-card rounded-2xl p-6 md:p-8 mt-8">
          {CurrentStepComponent && (
            <CurrentStepComponent
              formData={formData}
              updateFormData={updateFormData}
              onTemplateSelect={handleTemplateSelect}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          )}

          {/* Final Generation Step */}
          {step > steps.length && (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center mx-auto">
                <Download className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Your Resume is Ready!</h2>
                <p className="text-muted-foreground mt-2">Click below to generate and download your ATS-friendly PDF resume.</p>
              </div>

              <button
                onClick={handleGenerateResume}
                disabled={isGenerating}
                className={`px-8 py-3 font-semibold rounded-xl shadow-lg transition-all ${isGenerating
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:scale-105 hover:shadow-blue-500/30'
                  }`}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating PDF…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Generate & Download PDF
                  </span>
                )}
              </button>

              <button
                onClick={() => setStep(steps.length)}
                className="flex items-center gap-1 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Change Template
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}