import React from 'react';
import { 
  Video, Lightbulb, Bot, Code, Award, 
  Zap, Book, Users, Settings, TrendingUp
} from 'lucide-react';

interface ActivityCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ActivityCard = ({ title, description, icon }: ActivityCardProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md card-hover border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
      <div className="flex flex-col items-center text-center">
        <div className="flex justify-center mb-4 p-3 rounded-full bg-white/20 shadow-md text-theme-blue">
          {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6 text-theme-blue' })}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

const KidsActivitiesSection = () => {
  const activities = [
    {
      title: "Creative Development",
      description: "Facilitate the design of interactive projects, narratives, multimedia content, and digital art portfolios.",
      icon: <Video className="w-6 h-6" />
    },
    {
      title: "Knowledge Exploration",
      description: "Explore core concepts across science, technology, engineering, and mathematics with engaging content.",
      icon: <Lightbulb className="w-6 h-6" />
    },
    {
      title: "Applied Innovation",
      description: "Encourage problem-solving skills through creative application of technology to real-world challenges.",
      icon: <Bot className="w-6 h-6" />
    },
    {
      title: "Programming Proficiency",
      description: "Build foundational coding skills and learn to develop simple programs and applications.",
      icon: <Code className="w-6 h-6" />
    },
    {
      title: "Skill Progression",
      description: "Track learning achievements, earn recognition for milestones, and monitor skill development over time.",
      icon: <Award className="w-6 h-6" />
    }
  ];

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-4">Key Learning Areas</h2>
        <p className="text-lg text-gray-600 text-center mb-12">Our platform focuses on essential skills for future success.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 max-w-6xl mx-auto">
          {activities.map((activity, index) => (
            <ActivityCard key={index} {...activity} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default KidsActivitiesSection;
