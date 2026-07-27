
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";

// Eager: first-paint / catch-all routes load instantly (no Suspense flash).
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy: everything else is code-split into its own chunk, loaded on demand.
const Admin = lazy(() => import("./pages/Admin"));
const Success = lazy(() => import("./pages/Success"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Profile = lazy(() => import("./pages/Profile"));
const MyMatches = lazy(() => import("./pages/MyMatches"));
const Discover = lazy(() => import("./pages/Discover"));
const HostApplicationSubmitted = lazy(() => import("./pages/HostApplicationSubmitted"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const ContentGuidelines = lazy(() => import("./pages/ContentGuidelines"));
const Help = lazy(() => import("./pages/Help"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Subscription = lazy(() => import("./pages/Subscription"));
const AmbassadorProgram = lazy(() => import("./pages/AmbassadorProgram"));
const SubscriptionSuccess = lazy(() => import("./pages/SubscriptionSuccess"));
const ForCreators = lazy(() => import("./pages/ForCreators"));
const ForHosts = lazy(() => import("./pages/ForHosts"));
const ForBrands = lazy(() => import("./pages/ForBrands"));

const InfluencerOnboardingPage = lazy(() => import("./pages/InfluencerOnboarding"));
const OnboardingStartPage = lazy(() => import("./pages/OnboardingStart"));
const HostOnboardingPage = lazy(() => import("./pages/HostOnboarding"));
const RestaurantOwnerOnboardingPage = lazy(() => import("./pages/RestaurantOwnerOnboarding"));
const BrandOnboardingPage = lazy(() => import("./pages/BrandOnboarding"));
const Giveaway = lazy(() => import("./pages/Giveaway"));
const RaffleRules = lazy(() => import("./pages/RaffleRules"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const CreatorResources = lazy(() => import("./pages/CreatorResources"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const MarketingAssets = lazy(() => import("./pages/MarketingAssets"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const UGCForAirbnbHosts = lazy(() => import("./pages/UGCForAirbnbHosts"));
const UGCForVacationRentals = lazy(() => import("./pages/UGCForVacationRentals"));
const InfluencerStaysForHosts = lazy(() => import("./pages/InfluencerStaysForHosts"));
const BrandSEOPage = lazy(() => import("./pages/BrandSEOPage"));
const CampaignCreate = lazy(() => import("./pages/CampaignCreate"));
const CampaignConfirmation = lazy(() => import("./pages/CampaignConfirmation"));
const BrandCampaignsDashboard = lazy(() => import("./pages/BrandCampaignsDashboard"));
const AffiliateRedirect = lazy(() => import("./pages/AffiliateRedirect"));
const CreatorStaysList = lazy(() => import("./pages/CreatorStaysList"));
const CreatorStayDashboard = lazy(() => import("./pages/CreatorStayDashboard"));
const CreatorStayDeliverableUpload = lazy(() => import("./pages/CreatorStayDeliverableUpload"));

const RouteLoader = () => (
  <div className="container mx-auto p-6 space-y-4">
    <Skeleton className="h-10 w-1/3" />
    <Skeleton className="h-64 w-full" />
    <Skeleton className="h-64 w-full" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 min: avoid refetch storms on navigation
      gcTime: 5 * 60_000, // keep unmounted query cache for 5 min
      refetchOnWindowFocus: false, // stop refetching on every tab switch
      retry: 1, // fail fast on real errors instead of retrying 3x
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Suspense fallback={<RouteLoader />}>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/success" element={<Success />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/creator/:creatorId" element={<Marketplace />} />
          <Route path="/stays/:propertyId" element={<Marketplace />} />
          <Route path="/brand-deals/:campaignId" element={<Marketplace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-matches" element={<MyMatches />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/host-application-submitted" element={<HostApplicationSubmitted />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/content-guidelines" element={<ContentGuidelines />} />
          <Route path="/help" element={<Help />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/ambassador-program" element={<AmbassadorProgram />} />
          <Route path="/marketing-assets" element={<MarketingAssets />} />
          <Route path="/subscription-success" element={<SubscriptionSuccess />} />
          <Route path="/for-creators" element={<ForCreators />} />
          <Route path="/for-hosts" element={<ForHosts />} />
          <Route path="/for-brands" element={<ForBrands />} />
          
          <Route path="/onboarding/start" element={<OnboardingStartPage />} />
          <Route path="/onboarding/host" element={<HostOnboardingPage />} />
          <Route path="/onboarding/influencer" element={<InfluencerOnboardingPage />} />
          <Route path="/onboarding/restaurant-owner" element={<RestaurantOwnerOnboardingPage />} />
          <Route path="/onboarding/brand" element={<BrandOnboardingPage />} />
          <Route path="/creator-resources" element={<CreatorResources />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/giveaway" element={<Giveaway />} />
          <Route path="/raffle" element={<Giveaway />} />
          <Route path="/raffle-rules" element={<RaffleRules />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/ugc-for-airbnb-hosts" element={<UGCForAirbnbHosts />} />
          <Route path="/ugc-for-vacation-rentals" element={<UGCForVacationRentals />} />
          <Route path="/influencer-stays-for-hosts" element={<InfluencerStaysForHosts />} />
          {/* Dynamic Brand SEO Pages */}
          <Route path="/brands/:industry" element={<BrandSEOPage />} />
          <Route path="/brands/:industry/:segment2" element={<BrandSEOPage />} />
          <Route path="/brands/:industry/:platform/:location" element={<BrandSEOPage />} />
           {/* Campaign Pages */}
           <Route path="/campaigns/create" element={<CampaignCreate />} />
           <Route path="/campaigns/confirmation" element={<CampaignConfirmation />} />
           <Route path="/dashboard/campaigns" element={<BrandCampaignsDashboard />} />
           {/* Public affiliate tracking redirect */}
           <Route path="/r/:slug" element={<AffiliateRedirect />} />
           {/* Creator Stays */}
           <Route path="/creator/stays" element={<CreatorStaysList />} />
           <Route path="/creator/stays/:agreementId" element={<CreatorStayDashboard />} />
           <Route
             path="/creator/stays/:agreementId/deliverables/:dayNumber"
             element={<CreatorStayDeliverableUpload />}
           />
           {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
           <Route path="*" element={<NotFound />} />
           </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
