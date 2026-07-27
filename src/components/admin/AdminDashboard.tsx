import { useState } from "react";
import { AdminShell } from "./layout/AdminShell";
import { PlatformAnalyticsDashboard } from "./analytics/PlatformAnalyticsDashboard";
import { PopupAnalytics } from "./analytics/PopupAnalytics";
import DashboardOverview from "./DashboardOverview";
import { EnhancedUsersManagement } from "./users/EnhancedUsersManagement";
import PropertiesManagementDashboard from "./properties/PropertiesManagementDashboard";
import PostsManagementDashboard from "./posts/PostsManagementDashboard";
import ApplicationsManagement from "./ApplicationsManagement";
import AdminActivityLog from "./AdminActivityLog";
import { CollaborationManagerView } from "./agreements/CollaborationManagerView";
import { SocialAccountsManagement } from "./social-accounts/SocialAccountsManagement";
import WaitlistAdmin from "../WaitlistAdmin";
import SupportManagement from "./SupportManagement";
import FinancialDashboard from "./financial/FinancialDashboard";
import { ReviewsManagement } from "./reviews/ReviewsManagement";
import { ReferralProgramDashboard } from "./referrals/ReferralProgramDashboard";
import { CommunicationCenter } from "./communications/CommunicationCenter";
import { PlatformSettings } from "./settings/PlatformSettings";
import { BulkMatchCalculator } from "./BulkMatchCalculator";
import BrandsManagement from "./brands/BrandsManagement";
import RestaurantsManagement from "./restaurants/RestaurantsManagement";
import { AmbassadorManagement } from "./ambassadors/AmbassadorManagement";
import { PlatformDealsManagement } from "./platform-deals/PlatformDealsManagement";
import { AffiliateManagementDashboard } from "./affiliates/AffiliateManagementDashboard";
import { BlogManagementDashboard } from "./blog/BlogManagementDashboard";
import { AdminBrandCampaignsManagement } from "./brand-campaigns/AdminBrandCampaignsManagement";
import { CRMPipeline } from "./crm/CRMPipeline";
import { CRMActivityFeed } from "./crm/CRMActivityFeed";
import { CRMTasks } from "./crm/CRMTasks";
import { CRMReports } from "./crm/CRMReports";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <BulkMatchCalculator />
            <DashboardOverview />
          </div>
        );
      case "analytics":
        return <PlatformAnalyticsDashboard />;
      case "popup-analytics":
        return <PopupAnalytics />;
      case "activity":
        return <AdminActivityLog />;
      case "crm-pipeline":
        return <CRMPipeline />;
      case "crm-activity":
        return <CRMActivityFeed />;
      case "crm-tasks":
        return <CRMTasks />;
      case "crm-reports":
        return <CRMReports />;
      case "users":
        return <EnhancedUsersManagement />;
      case "waitlist":
        return <WaitlistAdmin />;
      case "properties":
        return <PropertiesManagementDashboard />;
      case "brands":
        return <BrandsManagement />;
      case "restaurants":
        return <RestaurantsManagement />;
      case "brand-campaigns":
        return <AdminBrandCampaignsManagement />;
      case "posts":
        return <PostsManagementDashboard />;
      case "applications":
        return <ApplicationsManagement />;
      case "agreements":
        return <CollaborationManagerView />;
      case "social-accounts":
        return <SocialAccountsManagement />;
      case "financial":
        return <FinancialDashboard />;
      case "referrals":
        return <ReferralProgramDashboard />;
      case "ambassadors":
        return <AmbassadorManagement />;
      case "platform-deals":
        return <PlatformDealsManagement />;
      case "affiliates":
        return <AffiliateManagementDashboard />;
       case "blog":
         return <BlogManagementDashboard />;
      case "support":
        return <SupportManagement />;
      case "reviews":
        return <ReviewsManagement />;
      case "communications":
        return <CommunicationCenter />;
      case "settings":
        return <PlatformSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <AdminShell 
      activeSection={activeSection} 
      onSectionChange={setActiveSection}
    >
      {renderContent()}
    </AdminShell>
  );
};

export default AdminDashboard;
