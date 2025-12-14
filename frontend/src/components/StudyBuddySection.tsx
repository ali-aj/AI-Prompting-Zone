import React from 'react';
import { Brain, BookOpen, Calculator, Telescope } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const StudyBuddySection = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: <BookOpen className="w-6 h-6 text-theme-blue" />,
      title: "Literacy Assistance",
      description: "Provides interactive support for reading comprehension and engagement."
    },
    {
      icon: <Calculator className="w-6 h-6 text-theme-purple" />,
      title: "Mathematics Support",
      description: "Offers step-by-step guidance and practice to enhance mathematical understanding."
    },
    {
      icon: <Telescope className="w-6 h-6 text-theme-pink" />,
      title: "Scientific Exploration",
      description: "Facilitates understanding of science concepts through clear explanations and relevant examples."
    },
    {
      icon: <Brain className="w-6 h-6 text-theme-blue" />,
      title: "Academic Coaching",
      description: "Assists learners in developing effective study plans and preparing for assessments."
    }
  ];

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Introducing Our Academic AI Assistant</h2>
            <p className="text-lg text-gray-600 mb-8">
              A dedicated AI tutor designed to support learners across various academic subjects, fostering understanding and confidence.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 p-3 rounded-full bg-white/20 mr-4 shadow-md flex items-center justify-center">
                    {/* Ensure icon color is set by parent or use className directly */}
                    {React.cloneElement(feature.icon as React.ReactElement, { className: feature.icon.props.className })}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-gray-800">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button className="bg-theme-blue text-white hover:bg-theme-purple py-3 px-8 rounded-full text-lg font-semibold shadow-lg transition-all duration-300" onClick={() => navigate('/practice?agent=spiral')}>
              Explore Academic Support
            </Button>
          </div>

          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative">
              <div className="relative z-10">
                <img 
                  src="/spiral.svg" 
                  alt="Academic AI Assistant" 
                  className="w-80 h-80 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudyBuddySection;
