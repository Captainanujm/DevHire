// components/ui/CardStepper.js
import React from 'react';

const CardStepper = ({ currentStep, steps }) => {
    return (
        // 🛑 UPDATED: Dark background, thinner shadow
        <div className="max-w-3xl mx-auto flex justify-between items-center mb-8 p-4 bg-slate-900 rounded-lg">
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div className="flex-1 text-center">
                        {/* 🛑 UPDATED: Colors matched to theme: Green (completed), Purple (active), Gray (inactive) */}
                        <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-slate-900 mx-auto mb-1 transition-colors duration-300 font-bold 
                            ${currentStep > step.id ? 'bg-green-500' : currentStep === step.id ? 'bg-indigo-500' : 'bg-gray-600'}`}
                        >
                            {step.id}
                        </div>
                        {/* 🛑 UPDATED: Lighter text for labels */}
                        <p className={`text-xs sm:text-sm font-medium ${currentStep === step.id ? 'text-indigo-400' : 'text-gray-400'}`}>
                            {step.name}
                        </p>
                    </div>
                    {index < steps.length - 1 && (
                        // 🛑 FIX: Removed the troublesome comment block that caused the parsing error.
                        <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};
export default CardStepper;