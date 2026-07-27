import { NavigateFunction } from 'react-router-dom';

export interface BadgeAction {
  path: string;
  tab?: string;
  state?: any;
  message: string;
}

/**
 * Maps badge names/criteria to actionable navigation paths and states
 */
export const getBadgeAction = (badgeName: string): BadgeAction => {
  const nameLower = badgeName.toLowerCase();

  // Content & Posting badges - redirect to profile portfolio
  if (nameLower.includes('first post') || nameLower === 'first steps') {
    return {
      path: '/profile',
      tab: 'portfolio',
      message: "Add content to your portfolio!"
    };
  }

  if (nameLower.includes('content creator') || nameLower.includes('posting streak')) {
    return {
      path: '/profile',
      tab: 'portfolio',
      message: "Keep building your portfolio!"
    };
  }

  // Profile & Setup badges
  if (nameLower.includes('profile') || nameLower.includes('setup') || nameLower.includes('social connector')) {
    return {
      path: '/profile',
      tab: 'settings',
      message: "Complete your profile to unlock this badge!"
    };
  }

  // Application & Collaboration badges
  if (nameLower.includes('application') || nameLower.includes('first steps') || nameLower.includes('streak')) {
    return {
      path: '/marketplace',
      message: "Browse properties and submit applications!"
    };
  }

  if (nameLower.includes('collaboration') || nameLower.includes('partnership')) {
    return {
      path: '/discover',
      message: "Find your perfect match and start collaborating!"
    };
  }

  // Property & Listing badges (for hosts)
  if (nameLower.includes('property') || nameLower.includes('listing')) {
    return {
      path: '/profile',
      tab: 'properties',
      message: "Add properties to start hosting!"
    };
  }

  // Community & Engagement badges
  if (nameLower.includes('community') || nameLower.includes('network')) {
    return {
      path: '/discover',
      message: "Connect with the community!"
    };
  }

  // Discovery badges
  if (nameLower.includes('discover') || nameLower.includes('match')) {
    return {
      path: '/discover',
      message: "Start swiping to find matches!"
    };
  }

  // Default fallback
  return {
    path: '/profile',
    tab: 'badges',
    message: "Keep exploring to earn this badge!"
  };
};

/**
 * Executes the navigation action for a badge
 */
export const executeBadgeAction = (
  badgeName: string,
  navigate: NavigateFunction,
  toast: (options: any) => void,
  isEarned: boolean = false
) => {
  if (isEarned) {
    // For earned badges, just show celebration
    toast({
      title: "🎉 Achievement Unlocked!",
      description: `You've earned the ${badgeName} badge. Amazing work!`,
      duration: 5000,
    });
    return;
  }

  // For unearned badges, navigate to complete the task
  const action = getBadgeAction(badgeName);
  
  toast({
    title: "Let's earn this badge!",
    description: action.message,
    duration: 4000,
  });

  // Build the navigation path with query params if needed
  const targetPath = action.tab 
    ? `${action.path}?tab=${action.tab}`
    : action.path;

  navigate(targetPath, { state: action.state });
};
