import { motion } from "framer-motion";
import { Home, Briefcase, Camera, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const PersonaCards = () => {
  const navigate = useNavigate();

  const personas = [
    {
      id: 'hosts',
      icon: Home,
      title: "Property Owners & Hosts",
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      benefits: [
        "50+ reusable content assets",
        "Full ownership & usage rights",
        "One empty night = $4,500 in content",
        "12-24 month content lifespan"
      ],
      cta: "List Your Property",
      link: "/for-hosts"
    },
    {
      id: 'brands',
      icon: Briefcase,
      title: "Brands & Restaurants",
      gradient: "from-purple-500 via-purple-600 to-pink-600",
      benefits: [
        "Professional UGC content",
        "Authentic content at scale",
        "Full commercial rights",
        "Flexible campaign types"
      ],
      cta: "Launch Campaign",
      link: "/for-brands"
    },
    {
      id: 'creators',
      icon: Camera,
      title: "Content Creators",
      gradient: "from-brand-green via-emerald-500 to-teal-500",
      benefits: [
        "Free stays & experiences",
        "Build your portfolio",
        "Earn from partnerships",
        "Create amazing content"
      ],
      cta: "Apply as Creator",
      link: "/for-creators"
    }
  ];

  return (
    <section className="py-12 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            Who Is This For?
          </h2>
          <p className="text-base md:text-xl text-muted-foreground px-2">
            Property owners get content. Creators get experiences. Everyone wins.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {personas.map((persona, index) => (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${persona.gradient} rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`} />
              
              <div className="relative p-5 md:p-8 rounded-2xl md:rounded-3xl bg-white border-2 border-gray-200 group-hover:border-transparent shadow-lg group-hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${persona.gradient} flex items-center justify-center mb-4 md:mb-6`}>
                  <persona.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">{persona.title}</h3>
                
                <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 flex-grow">
                  {persona.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start text-sm md:text-base text-muted-foreground">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${persona.gradient} mt-1.5 md:mt-2 mr-2 md:mr-3 flex-shrink-0`} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => navigate(persona.link)}
                  className={`w-full h-11 md:h-12 font-semibold bg-gradient-to-r ${persona.gradient} text-white hover:opacity-90 transition-opacity group`}
                >
                  {persona.cta}
                  <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
