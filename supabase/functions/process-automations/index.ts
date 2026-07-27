import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Restrict to internal/cron callers (must pass the service role key as Bearer token).
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token || token !== serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const results = { enrolled: 0, processed: 0, errors: [] as string[] };

    // Compute platform stats once per cron cycle (used for placeholders in emails/notifications)
    const platformStats = await computePlatformStats(supabase);

    // ── Phase A: Trigger Evaluation ─────────────────────────────
    const { data: activeFlows } = await supabase
      .from("automation_flows")
      .select("*")
      .eq("status", "active");

    if (activeFlows) {
      for (const flow of activeFlows) {
        try {
          const enrolled = await evaluateTrigger(supabase, flow);
          results.enrolled += enrolled;

          // Update last_processed_at
          await supabase
            .from("automation_flows")
            .update({ last_processed_at: new Date().toISOString() })
            .eq("id", flow.id);
        } catch (e) {
          results.errors.push(`Trigger error flow ${flow.id}: ${e.message}`);
        }
      }
    }

    // ── Phase B: Step Execution ─────────────────────────────────
    const { data: activeEnrollments } = await supabase
      .from("automation_enrollments")
      .select("*")
      .eq("status", "active");

    if (activeEnrollments) {
      // Process enrollments in concurrent batches instead of one-at-a-time.
      // Per-enrollment errors stay isolated (caught individually) so one bad
      // enrollment never aborts the run.
      const BATCH_SIZE = 10;
      for (let i = 0; i < activeEnrollments.length; i += BATCH_SIZE) {
        const batch = activeEnrollments.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (enrollment) => {
            try {
              const processed = await processEnrollment(supabase, enrollment, platformStats);
              if (processed) results.processed++;
            } catch (e) {
              results.errors.push(`Step error enrollment ${enrollment.id}: ${e.message}`);
            }
          }),
        );
      }
    }

    console.log("Automation run complete:", JSON.stringify(results));

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Process automations error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ── Trigger Evaluation ──────────────────────────────────────────

// Fetch the set of user_ids already enrolled in a flow in ONE query, so trigger
// evaluation can skip them without a per-user existence check (avoids N+1).
async function getEnrolledUserIds(supabase: any, flowId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from("automation_enrollments")
    .select("user_id")
    .eq("flow_id", flowId);
  return new Set((data || []).map((r: any) => r.user_id));
}

// Insert many enrollments in a single round-trip. Returns the number inserted.
async function bulkInsertEnrollments(supabase: any, rows: any[]): Promise<number> {
  if (rows.length === 0) return 0;
  const { error } = await supabase.from("automation_enrollments").insert(rows);
  if (error) throw new Error(error.message);
  return rows.length;
}

async function evaluateTrigger(supabase: any, flow: any): Promise<number> {
  const lastProcessed = flow.last_processed_at || flow.created_at;
  let enrolled = 0;

  switch (flow.trigger_type) {
    case "user_signup": {
      const userType = flow.trigger_config?.user_type;
      if (!userType) break;

      const { data: newUsers } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_type", userType)
        .gt("created_at", lastProcessed);

      if (newUsers) {
        const enrolledIds = await getEnrolledUserIds(supabase, flow.id);
        const rows = newUsers
          .filter((user: any) => !enrolledIds.has(user.id))
          .map((user: any) => ({
            flow_id: flow.id,
            user_id: user.id,
            status: "active",
            current_step_id: null,
          }));
        enrolled += await bulkInsertEnrollments(supabase, rows);
      }
      break;
    }

    case "inactive_days": {
      const days = flow.trigger_config?.days || 14;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      const { data: inactiveUsers } = await supabase
        .from("profiles")
        .select("id, updated_at")
        .lt("updated_at", cutoff.toISOString())
        .limit(100);

      if (inactiveUsers) {
        const enrolledIds = await getEnrolledUserIds(supabase, flow.id);
        const rows = inactiveUsers
          .filter((user: any) => !enrolledIds.has(user.id))
          .map((user: any) => ({
            flow_id: flow.id,
            user_id: user.id,
            status: "active",
            current_step_id: null,
          }));
        enrolled += await bulkInsertEnrollments(supabase, rows);
      }
      break;
    }

    case "property_listed": {
      // Find new properties listed since last processed
      const { data: newProperties } = await supabase
        .from("properties")
        .select("id, title")
        .eq("is_active", true)
        .gt("created_at", lastProcessed);

      if (newProperties && newProperties.length > 0) {
        // Get all creators (influencer profiles)
        const { data: creators } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_type", "influencer")
          .limit(1000);

        if (creators) {
          // One enrollment per creator per flow (metadata from the first matching
          // property), matching the prior per-(flow,user) existence semantics — but
          // with a single read + single bulk insert instead of properties×creators queries.
          const enrolledIds = await getEnrolledUserIds(supabase, flow.id);
          const rows: any[] = [];
          for (const property of newProperties) {
            for (const creator of creators) {
              if (enrolledIds.has(creator.id)) continue;
              enrolledIds.add(creator.id); // reserve so later properties don't re-add
              rows.push({
                flow_id: flow.id,
                user_id: creator.id,
                status: "active",
                current_step_id: null,
                metadata: { property_id: property.id, property_title: property.title },
              });
            }
          }
          enrolled += await bulkInsertEnrollments(supabase, rows);
        }
      }
      break;
    }

    case "campaign_listed": {
      // Find new brand campaigns listed since last processed
      const { data: newCampaigns } = await supabase
        .from("brand_campaigns")
        .select("id, campaign_title")
        .eq("status", "open")
        .gt("created_at", lastProcessed);

      if (newCampaigns && newCampaigns.length > 0) {
        const { data: creators } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_type", "influencer")
          .limit(1000);

        if (creators) {
          // One enrollment per creator per flow (metadata from the first matching
          // campaign), preserving prior semantics with a single read + bulk insert.
          const enrolledIds = await getEnrolledUserIds(supabase, flow.id);
          const rows: any[] = [];
          for (const campaign of newCampaigns) {
            for (const creator of creators) {
              if (enrolledIds.has(creator.id)) continue;
              enrolledIds.add(creator.id); // reserve so later campaigns don't re-add
              rows.push({
                flow_id: flow.id,
                user_id: creator.id,
                status: "active",
                current_step_id: null,
                metadata: { campaign_id: campaign.id, campaign_title: campaign.campaign_title },
              });
            }
          }
          enrolled += await bulkInsertEnrollments(supabase, rows);
        }
      }
      break;
    }

    case "manual":
    default:
      break;
  }

  return enrolled;
}

// ── Step Execution ──────────────────────────────────────────────

interface PlatformStats {
  newOpportunities: number;
  recentLocation: string;
  creatorsMatched: number;
  activeBrands: number;
  trendingCategory: string;
}

async function computePlatformStats(supabase: any): Promise<PlatformStats> {
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const [propsRes, campsRes, recentPropRes, matchedRes, brandsRes, trendingRes] = await Promise.all([
      supabase.from("properties").select("id", { count: "exact", head: true }).eq("is_active", true).gt("created_at", fourteenDaysAgo),
      supabase.from("brand_campaigns").select("id", { count: "exact", head: true }).eq("status", "open").gt("created_at", fourteenDaysAgo),
      supabase.from("properties").select("city, location, title").eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("collaboration_agreements").select("id", { count: "exact", head: true }).eq("status", "accepted").gt("created_at", thirtyDaysAgo),
      supabase.from("brand_campaigns").select("brand_name").eq("status", "open"),
      supabase.from("brand_campaigns").select("campaign_type").eq("status", "open").gt("created_at", thirtyDaysAgo),
    ]);

    const newOpportunities = (propsRes.count || 0) + (campsRes.count || 0);
    const loc = recentPropRes.data;
    const recentLocation = loc?.city || loc?.location || loc?.title || "a featured stay";
    const creatorsMatched = matchedRes.count || 0;
    const activeBrands = new Set((brandsRes.data || []).map((b: any) => b.brand_name)).size;

    const categoryCounts: Record<string, number> = {};
    (trendingRes.data || []).forEach((c: any) => {
      if (c.campaign_type) categoryCounts[c.campaign_type] = (categoryCounts[c.campaign_type] || 0) + 1;
    });
    const trendingCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "lifestyle";

    return { newOpportunities, recentLocation, creatorsMatched, activeBrands, trendingCategory };
  } catch (e) {
    console.error("computePlatformStats error:", e);
    return { newOpportunities: 0, recentLocation: "a featured stay", creatorsMatched: 0, activeBrands: 0, trendingCategory: "lifestyle" };
  }
}

function applyPlatformPlaceholders(text: string, stats: PlatformStats): string {
  return text
    .replace(/\{\{new_opportunities_count\}\}/g, String(stats.newOpportunities))
    .replace(/\{\{recent_collab_location\}\}/g, stats.recentLocation)
    .replace(/\{\{creators_matched_count\}\}/g, String(stats.creatorsMatched))
    .replace(/\{\{active_brands_count\}\}/g, String(stats.activeBrands))
    .replace(/\{\{trending_category\}\}/g, stats.trendingCategory);
}

async function processEnrollment(supabase: any, enrollment: any, platformStats: PlatformStats): Promise<boolean> {
  // Get all steps for this flow
  const { data: steps } = await supabase
    .from("automation_steps")
    .select("*")
    .eq("flow_id", enrollment.flow_id)
    .order("position", { ascending: true });

  if (!steps || steps.length === 0) {
    // No steps, mark completed
    await supabase
      .from("automation_enrollments")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", enrollment.id);
    return true;
  }

  // Determine current step
  let currentStep: any = null;
  let nextStep: any = null;

  if (!enrollment.current_step_id) {
    // Start at first step
    nextStep = steps[0];
  } else {
    currentStep = steps.find((s: any) => s.id === enrollment.current_step_id);
    if (currentStep) {
      const currentIdx = steps.indexOf(currentStep);
      nextStep = steps[currentIdx + 1] || null;
    }
  }

  // If we already have a current step and no next step, we need to check if current step is done
  if (enrollment.current_step_id && !nextStep) {
    // All steps done
    await supabase
      .from("automation_enrollments")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", enrollment.id);
    return true;
  }

  if (!nextStep) return false;

  // Check delay
  const referenceTime = enrollment.last_step_at || enrollment.enrolled_at;
  const elapsed = (Date.now() - new Date(referenceTime).getTime()) / (1000 * 60 * 60);
  if (elapsed < nextStep.delay_hours) {
    return false; // Not time yet
  }

  // Execute step
  const success = await executeStep(supabase, enrollment, nextStep, platformStats);

  if (success) {
    // Check if this was the last step
    const nextIdx = steps.indexOf(nextStep);
    const isLast = nextIdx === steps.length - 1;

    await supabase
      .from("automation_enrollments")
      .update({
        current_step_id: nextStep.id,
        last_step_at: new Date().toISOString(),
        ...(isLast ? { status: "completed", completed_at: new Date().toISOString() } : {}),
      })
      .eq("id", enrollment.id);
  }

  return success;
}

async function executeStep(supabase: any, enrollment: any, step: any, platformStats: PlatformStats): Promise<boolean> {
  const config = step.step_config || {};

  switch (step.step_type) {
    case "send_email":
      return await sendEmail(supabase, enrollment, config, platformStats);

    case "send_notification":
      return await sendNotification(supabase, enrollment, config, platformStats);

    case "wait":
      await logExecution(supabase, enrollment.id, step.id, "wait", { description: config.description });
      return true;

    case "condition":
      return await evaluateCondition(supabase, enrollment, step, platformStats);

    default:
      console.warn(`Unknown step type: ${step.step_type}`);
      await logExecution(supabase, enrollment.id, step.id, "unknown_step", { step_type: step.step_type });
      return true;
  }
}

// ── Email Sending ───────────────────────────────────────────────

async function sendEmail(supabase: any, enrollment: any, config: any, platformStats: PlatformStats): Promise<boolean> {
  // Get user profile for personalization
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", enrollment.user_id)
    .maybeSingle();

  // Get user email from auth — targeted lookup. (Previously listUsers() was called
  // per email, which both scanned all users every time AND silently capped at the
  // default 50-user page, so users beyond it never received automation emails.)
  const { data: authData } = await supabase.auth.admin.getUserById(enrollment.user_id);
  const email = authData?.user?.email;

  if (!email) {
    console.error(`No email for user ${enrollment.user_id}`);
    return false;
  }

  const firstName = profile?.first_name || "there";
  const metadata = enrollment.metadata || {};
  const replacePlaceholders = (text: string) =>
    applyPlatformPlaceholders(
      text
        .replace(/\{\{first_name\}\}/g, firstName)
        .replace(/\{\{property_title\}\}/g, metadata.property_title || "a new property")
        .replace(/\{\{campaign_title\}\}/g, metadata.campaign_title || "a new campaign"),
      platformStats
    );

  const subject = replacePlaceholders(config.subject || "");
  const content = replacePlaceholders(config.content || "");

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

  if (!resendApiKey || !lovableApiKey) {
    console.error("Missing email API keys");
    await logExecution(supabase, enrollment.id, null, "send_email_failed", { error: "Missing API keys" });
    return false;
  }

  try {
    const response = await fetch(`${RESEND_GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
        "X-Connection-Api-Key": resendApiKey,
      },
      body: JSON.stringify({
        from: "Hostfluencer <noreply@hostfluencer.com>",
        to: [email],
        subject,
        html: buildEmailHtml(subject, content),
      }),
    });

    const result = await response.json();

    await logExecution(supabase, enrollment.id, null, "send_email", {
      to: email,
      subject,
      success: response.ok,
      response: result,
    });

    return response.ok;
  } catch (e) {
    await logExecution(supabase, enrollment.id, null, "send_email_failed", { error: e.message });
    return false;
  }
}

function buildEmailHtml(subject: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <div style="text-align:center;margin-bottom:30px;">
            <h1 style="color:#1a1a2e;font-size:24px;margin:0;">${subject}</h1>
          </div>
          <div style="color:#374151;font-size:16px;line-height:1.6;">
            ${content.replace(/\n/g, "<br>")}
          </div>
          <div style="margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;">
            <a href="https://hostfluencer.com" style="color:#6366f1;text-decoration:none;font-size:14px;">Visit Hostfluencer</a>
          </div>
        </div>
        <div style="text-align:center;margin-top:20px;color:#9ca3af;font-size:12px;">
          © ${new Date().getFullYear()} Hostfluencer. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
}

// ── Notification Sending ────────────────────────────────────────

async function sendNotification(supabase: any, enrollment: any, config: any, platformStats: PlatformStats): Promise<boolean> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", enrollment.user_id)
    .maybeSingle();

  const firstName = profile?.first_name || "there";
  const metadata = enrollment.metadata || {};
  const replacePlaceholders = (text: string) =>
    applyPlatformPlaceholders(
      text
        .replace(/\{\{first_name\}\}/g, firstName)
        .replace(/\{\{property_title\}\}/g, metadata.property_title || "a new property")
        .replace(/\{\{campaign_title\}\}/g, metadata.campaign_title || "a new campaign"),
      platformStats
    );

  const title = replacePlaceholders(config.title || "");
  const message = replacePlaceholders(config.message || "");

  const { error } = await supabase.from("notifications").insert({
    user_id: enrollment.user_id,
    type: "automation",
    title,
    message,
    related_id: enrollment.flow_id,
  });

  await logExecution(supabase, enrollment.id, null, "send_notification", {
    title,
    success: !error,
    error: error?.message,
  });

  return !error;
}

// ── Condition Evaluation ────────────────────────────────────────

async function evaluateCondition(supabase: any, enrollment: any, step: any, platformStats: PlatformStats): Promise<boolean> {
  const config = step.step_config || {};
  const conditionField = config.condition_field || "profile_complete";

  let conditionMet = false;

  switch (conditionField) {
    case "profile_complete": {
      const { data: profile } = await supabase
        .from("profiles")
        .select("bio, avatar_url, location, first_name, last_name")
        .eq("id", enrollment.user_id)
        .maybeSingle();

      conditionMet = !!(profile?.bio && profile?.avatar_url && profile?.first_name);
      break;
    }

    case "has_social_accounts": {
      const { data: influencer } = await supabase
        .from("influencers")
        .select("instagram_url, tiktok_url, youtube_url")
        .eq("id", enrollment.user_id)
        .maybeSingle();

      conditionMet = !!(influencer?.instagram_url || influencer?.tiktok_url || influencer?.youtube_url);
      break;
    }

    case "has_applied": {
      const { data: apps } = await supabase
        .from("applications")
        .select("id")
        .eq("influencer_id", enrollment.user_id)
        .limit(1);

      conditionMet = (apps?.length || 0) > 0;
      break;
    }

    case "follower_threshold": {
      const threshold = config.follower_threshold || 1000;
      const { data: influencer } = await supabase
        .from("influencers")
        .select("total_followers")
        .eq("id", enrollment.user_id)
        .maybeSingle();

      conditionMet = (influencer?.total_followers || 0) >= threshold;
      break;
    }

    default:
      conditionMet = false;
  }

  // Execute the appropriate branch steps inline
  const branchSteps = conditionMet ? (config.yes_steps || []) : (config.no_steps || []);

  await logExecution(supabase, enrollment.id, step.id, "condition_evaluated", {
    condition: conditionField,
    result: conditionMet,
    branch: conditionMet ? "yes" : "no",
    branch_steps_count: branchSteps.length,
  });

  // Execute each branch step
  for (const branchStep of branchSteps) {
    try {
      switch (branchStep.step_type) {
        case "send_email":
          await sendEmail(supabase, enrollment, branchStep.step_config || {}, platformStats);
          break;
        case "send_notification":
          await sendNotification(supabase, enrollment, branchStep.step_config || {}, platformStats);
          break;
        default:
          console.warn(`Unknown branch step type: ${branchStep.step_type}`);
      }
    } catch (e) {
      console.error(`Branch step error: ${e.message}`);
    }
  }

  return true;
}

// ── Logging ─────────────────────────────────────────────────────

async function logExecution(
  supabase: any,
  enrollmentId: string,
  stepId: string | null,
  action: string,
  result: any
) {
  await supabase.from("automation_execution_log").insert({
    enrollment_id: enrollmentId,
    step_id: stepId,
    action,
    result,
  });
}
