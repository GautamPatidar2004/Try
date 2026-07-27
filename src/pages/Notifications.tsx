import Navigation from "@/components/Navigation";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { SEO } from "@/components/SEO";

const Notifications = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Notifications" 
        description="View your notifications and updates."
        noIndex={true}
      />
      <Navigation />
      <div className="pt-20">
        <NotificationCenter />
      </div>
    </div>
  );
};

export default Notifications;
