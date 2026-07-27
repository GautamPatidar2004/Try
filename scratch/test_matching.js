import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dkahqqmcmwfaxjxmfxne.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrYWhxcW1jbXdmYXhqeG1meG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDQxMzIsImV4cCI6MjA2NTc4MDEzMn0.Zmj1n9Sw7ykm5VKgM7PtVaqjuLPSAmgjjFZYEMjhZsA";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data: subscriptionPlans, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching plans:', error);
    return;
  }

  console.log(`Fetched ${subscriptionPlans.length} active plans.`);

  const brandPlansStatic = [
    { id: "brand-entry", name: "Entry" },
    { id: "brand-growth", name: "Growth" },
    { id: "brand-scale", name: "Scale" }
  ];

  const hostPlansStatic = [
    { id: "host-check-in", name: "Check-in" },
    { id: "host-extended-stay", name: "Extended Stay" },
    { id: "host-owner", name: "Owner" }
  ];

  const getDbPlan = (staticPlanName, staticPlanId) => {
    const nameClean = staticPlanName.trim().toLowerCase();
    
    console.log(`\n[COMPARE] Static: "${staticPlanName}" (clean: "${nameClean}"), ID: "${staticPlanId}"`);
    
    // 1. Filter matching plans
    const matches = subscriptionPlans.filter(p => {
      const dbName = p.name.trim().toLowerCase();
      const isMatch = dbName === nameClean ||
        (nameClean === 'entry' && dbName === 'starter') ||
        (nameClean === 'check-in' && dbName === 'starter') ||
        (nameClean === 'extended stay' && dbName === 'growth') ||
        (nameClean === 'owner' && dbName === 'scale');
      
      console.log(`  Db: "${p.name}" (clean: "${dbName}"), ID: "${p.id}", category: "${p.user_type_category}", display_order: ${p.display_order}, isMatch: ${isMatch}`);
      return isMatch;
    });

    if (matches.length === 0) {
      console.log(`  -> No matches found for "${staticPlanName}"`);
      return undefined;
    }

    // 2. Filter matches by user_type_category matching target persona (brand/host -> demand, creator/supply -> supply)
    const expectedCategory = (staticPlanId.startsWith('brand') || staticPlanId.startsWith('host')) ? 'demand' : 'supply';
    const categoryMatches = matches.filter(p => p.user_type_category === expectedCategory);
    
    const candidates = categoryMatches.length > 0 ? categoryMatches : matches;
    console.log(`  -> Candidates count: ${candidates.length} (expected: "${expectedCategory}")`);

    // 3. Resolve exact match priority, then highest display_order, then newest created_at (latest first)
    const resolved = candidates.sort((a, b) => {
      const aExact = a.name.trim().toLowerCase() === nameClean ? 1 : 0;
      const bExact = b.name.trim().toLowerCase() === nameClean ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;

      const aOrder = a.display_order || 0;
      const bOrder = b.display_order || 0;
      if (aOrder !== bOrder) return bOrder - aOrder;

      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    })[0];

    console.log(`  -> Resolved: "${resolved?.name}", ID: "${resolved?.id}"`);
    return resolved;
  };

  console.log('--- Brand Plans ---');
  brandPlansStatic.forEach(plan => getDbPlan(plan.name, plan.id));

  console.log('\n--- Host Plans ---');
  hostPlansStatic.forEach(plan => getDbPlan(plan.name, plan.id));
}

run();
