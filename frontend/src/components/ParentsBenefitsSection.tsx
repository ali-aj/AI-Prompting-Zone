import React from 'react';
import { 
  Brain, ShieldCheck, Medal, LineChart,
  Clock, Users, BookOpen, Zap
} from 'lucide-react';

const ParentsBenefitsSection = () => {
  const skillsDeveloped = [
    {
      icon: <Brain className="w-6 h-6 text-theme-blue" />,
      title: "Critical Thinking",
      description: "Foster problem-solving abilities and encourage insightful inquiry."
    },
    {
      icon: <Zap className="w-6 h-6 text-theme-purple" />,
      title: "Creativity and Innovation",
      description: "Cultivate imagination through interactive prompting and creative project generation."
    },
    {
      icon: <Users className="w-6 h-6 text-theme-pink" />,
      title: "Collaborative Learning",
      description: "Promote teamwork and peer-to-peer learning experiences."
    },
    {
      icon: <BookOpen className="w-6 h-6 text-theme-blue" />,
      title: "Digital Literacy",
      description: "Equip learners with essential skills for the evolving digital landscape."
    }
  ];

  const parentalBenefits = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-theme-blue" />,
      title: "Prioritizing Safety",
      description: "Our carefully monitored environment and appropriate content ensure a secure experience."
    },
    {
      icon: <Medal className="w-6 h-6 text-theme-purple" />,
      title: "Measurable Progress",
      description: "Track your child's development and celebrate achievements through integrated progress indicators."
    },
    {
      icon: <LineChart className="w-6 h-6 text-theme-pink" />,
      title: "Academic Reinforcement",
      description: "Supplement classroom education with engaging and supportive AI-powered learning activities."
    },
    {
      icon: <Clock className="w-6 h-6 text-theme-blue" />,
      title: "Future Readiness",
      description: "Prepare children for future academic and professional opportunities by building foundational AI and STEM skills."
    }
  ];

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-4">Benefits for Your Child</h2>
        <p className="text-lg text-gray-600 text-center mb-12">
          Empowering young minds for a future driven by innovation and technology.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Brain className="mr-3 w-7 h-7 text-theme-blue" />
              Skills Developed
            </h3>
            
            <div className="space-y-6">
              {skillsDeveloped.map((skill, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 mr-4 p-2 rounded-full bg-gray-200 flex items-center justify-center">
                    {React.cloneElement(skill.icon as React.ReactElement, { className: skill.icon.props.className })}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800">{skill.title}</h4>
                    <p className="text-gray-600 text-sm">{skill.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <ShieldCheck className="mr-3 w-7 h-7 text-theme-blue" />
              Confidence for Parents
            </h3>
            
            <div className="space-y-6">
              {parentalBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 mr-4 p-2 rounded-full bg-gray-200 flex items-center justify-center">
                    {React.cloneElement(benefit.icon as React.ReactElement, { className: benefit.icon.props.className })}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800">{benefit.title}</h4>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParentsBenefitsSection;
