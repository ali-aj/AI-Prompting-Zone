// import type React from "react"
// import { Brain, Zap, Award } from "lucide-react"
// import { useNavigate } from "react-router-dom"

// const steps = [
//   {
//     icon: <Brain className="w-14 h-14 text-blue-500 mb-4" />,
//     title: "Learn from Your Agent",
//     description: "Get tips, answers, and training from a smart AI guide.",
//     number: 1,
//     bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100",
//     borderColor: "border-blue-200",
//     iconBg: "bg-blue-100",
//   },
//   {
//     icon: <Zap className="w-14 h-14 text-purple-500 mb-4" />,
//     title: "Unlock and Use a Real App",
//     description: "Create a project or skill using apps like Canva, Padlet, or AI video makers.",
//     number: 2,
//     bgColor: "bg-gradient-to-br from-purple-50 to-pink-100",
//     borderColor: "border-purple-200",
//     iconBg: "bg-purple-100",
//   },
//   {
//     icon: <Award className="w-14 h-14 text-green-500 mb-4" />,
//     title: "Get Certified + Share Results",
//     description: "Earn badges and certificates you can show off or share.",
//     number: 3,
//     bgColor: "bg-gradient-to-br from-green-50 to-emerald-100",
//     borderColor: "border-green-200",
//     iconBg: "bg-green-100",
//   },
// ]

// const HowItWorksSection: React.FC = () => {
//   const navigate = useNavigate()

//   const handleGetStarted = () => {
//     navigate('/practice')
//   }

//   return (
//     <section className="relative overflow-hidden py-20 bg-transparent">
//       <div className="max-w-6xl mx-auto px-4 relative z-10">
//         {/* Section Header */}
//         <div className="text-center mb-16">
//           <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//             How it Works
//           </h2>
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//             Our simple 3-step process gets you from learning to creating in no time
//           </p>
//         </div>

//         {/* Steps Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pt-6">
//           {steps.map((step, idx) => (
//             <div key={idx} className="relative group">
//               {/* Step Card */}
//               <div
//                 className={`${step.bgColor} ${step.borderColor} border-2 rounded-3xl shadow-lg hover:shadow-xl px-8 py-12 text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 relative overflow-hidden`}
//               >
//                 {/* Large Number Background */}
//                 <div className="absolute top-4 right-4 text-6xl font-black opacity-10 text-gray-600">
//                   {step.number}
//                 </div>

//                 {/* Step Number Badge */}
//                 <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
//                   <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200">
//                     <span className="text-sm font-bold text-gray-700">{step.number}</span>
//                   </div>
//                 </div>

//                 {/* Icon Container */}
//                 <div className={`${step.iconBg} w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-inner`}>
//                   {step.icon}
//                 </div>

//                 {/* Content */}
//                 <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
//                   {step.title}
//                 </h3>
//                 <p className="text-gray-700 text-lg leading-relaxed">
//                   {step.description}
//                 </p>

//                 {/* Decorative Element */}
//                 <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full"></div>
//               </div>

//               {/* Arrow Connector (except for last item) */}
//               {idx < steps.length - 1 && (
//                 <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-12 transform -translate-y-1/2 z-20">
//                   <div className="w-8 lg:w-16 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400"></div>
//                   <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-400 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Call to Action */}
//         <div className="text-center mt-16">
//           <button
//             onClick={handleGetStarted}
//             className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
//           >
//             <span>Ready to Start Learning?</span>
//             <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
//               <span className="text-sm">→</span>
//             </div>
//           </button>
//         </div>
//       </div>
//     </section>
//   )
// }

// export default HowItWorksSection
