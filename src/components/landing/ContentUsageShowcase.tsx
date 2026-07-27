import { motion } from "framer-motion";
import { ExternalLink, Image, Video, FileText, Mail } from "lucide-react";

const usageChannels = [
  {
    icon: Image,
    title: "Listing Platforms",
    description: "Transform your Airbnb, VRBO, and Booking.com listings with professional visuals",
    examples: ["Hero images", "Room photos", "Amenity highlights", "Lifestyle shots"],
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Video,
    title: "Social Media Ads",
    description: "Run high-converting Instagram and Facebook ad campaigns",
    examples: ["Video ads", "Carousel posts", "Story content", "Reels"],
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: ExternalLink,
    title: "Your Website",
    description: "Upgrade your direct booking site with stunning hero sections",
    examples: ["Homepage banner", "Gallery page", "About section", "Blog posts"],
    color: "from-brand-green to-emerald-500",
  },
  {
    icon: Mail,
    title: "Email Marketing",
    description: "Increase open rates with eye-catching visual content",
    examples: ["Newsletter headers", "Promo emails", "Welcome sequences", "Seasonal campaigns"],
    color: "from-purple-500 to-violet-500",
  },
];

export const ContentUsageShowcase = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Where Hosts <span className="text-brand-green">Use This Content</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            One collaboration, endless marketing possibilities. Own it forever, use it everywhere.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {usageChannels.map((channel, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="bg-gray-50 rounded-2xl md:rounded-3xl p-6 md:p-8 h-full border border-gray-100 transition-all duration-300 group-hover:shadow-xl group-hover:border-brand-green/30">
                <div className="flex items-start gap-4 md:gap-5">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${channel.color} flex items-center justify-center flex-shrink-0`}>
                    <channel.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold mb-2">{channel.title}</h3>
                    <p className="text-sm md:text-base text-muted-foreground mb-4">
                      {channel.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {channel.examples.map((example, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-white rounded-full text-xs md:text-sm text-gray-600 border border-gray-200"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 md:mt-16 text-center"
        >
          <div className="inline-block p-6 md:p-8 bg-gradient-to-r from-brand-green/10 to-emerald-500/10 rounded-2xl border border-brand-green/20">
            <p className="text-lg md:text-xl font-semibold text-brand-dark mb-2">
              "Trade empty nights for a year's worth of marketing content you own forever."
            </p>
            <p className="text-sm md:text-base text-muted-foreground">
              Full ownership • Commercial rights • No recurring fees
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
