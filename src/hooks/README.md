# Hooks Inventory

This document provides an overview of all custom React hooks in the application, organized by their primary use case.

## User-Facing Hooks

These hooks are used in user-facing features and components:

### Analytics & Performance
- **useCreatorAnalytics** - Creator analytics dashboard with platform stats, engagement metrics, and content performance
- **useContentIntelligence** - AI-powered content recommendations and insights

### Messaging & Communication
- **useMessages** - Real-time messaging system with conversations and notifications
- **useNotifications** - User notifications and alerts

### Social Features
- **useFollows** - Social following functionality
- **useBadges** - Gamification badges system
- **useAchievements** - User achievements tracking
- **useReviews** - Review system for properties and collaborations

### Creator Tools
- **useMediaKit** - Creator media kit management
- **useCreatorGoals** - Goal tracking and progress monitoring
- **useSocialAccounts** - Social media account integration
- **useContentPosts** - Content post management

### Marketplace & Properties
- **useMarketplace** - Property marketplace filtering and search
- **usePropertySearch** - Advanced property search with filters
- **useProperties** - Property management and listings

### Applications & Collaborations
- **useApplications** - Application submission and management
- **useCollaborations** - Collaboration agreement tracking
- **useCollaborationAgreements** - Collaboration contract management

### User Profile
- **useProfile** - User profile data and management
- **useOnboarding** - Onboarding flow state management

### Payments & Transactions
- **useStripeCheckout** - Stripe payment processing
- **useSubscription** - Subscription management

## Admin-Only Hooks

These hooks are restricted to admin users and management features:

### Analytics & Metrics
- **usePlatformAnalytics** - Platform-wide analytics dashboard
- **useConversionFunnels** - Conversion tracking and funnel analysis
- **useUserMetrics** - User growth and engagement metrics
- **useRevenueMetrics** - Revenue and financial analytics
- **useEngagementMetrics** - Platform engagement tracking

### Management
- **useReviews** - Review moderation and management (admin view)
- **useTransactions** - Transaction management and monitoring
- **usePayouts** - Payout processing and management
- **useEarnings** - Earnings calculations and reports
- **useReferralManagement** - Referral program management
- **useAgreementsManagement** - Collaboration agreement oversight
- **usePropertiesManagement** - Property approval and moderation
- **useUserManagement** - User account management

## Utility Hooks

General-purpose hooks used throughout the application:

- **use-toast** - Toast notification system (shadcn)
- **use-mobile** - Mobile device detection
- **useWaitlist** - Waitlist management
- **useLanguage** - Internationalization and language management

## Performance Considerations

### Optimized Hooks
- **useCreatorAnalytics** - Uses parallel queries and memoization
- **useConversionFunnels** - Parallelized database queries for 60-70% faster load
- **useMessages** - Optimized useEffect to prevent unnecessary re-renders
- **usePlatformAnalytics** - Reduced refetch frequency to minimize API calls

### Best Practices
1. All data-fetching hooks use React Query for caching and background updates
2. Real-time hooks use Supabase subscriptions with proper cleanup
3. Complex calculations are memoized to prevent unnecessary recomputations
4. Database queries are parallelized where possible using `Promise.all()`

## Type Safety

All hooks have explicit return types defined for better TypeScript support and developer experience.
