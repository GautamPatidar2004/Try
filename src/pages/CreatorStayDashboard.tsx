import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, MapPin, Calendar } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import { useStayDetail } from "@/hooks/useStayDetail";
import { CheckInCard } from "@/components/stays/CheckInCard";
import { DeliverableTimeline } from "@/components/stays/DeliverableTimeline";

const CreatorStayDashboard = () => {
  const { agreementId } = useParams<{ agreementId: string }>();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/auth");
        return;
      }
      setUserId(data.session.user.id);
    });
  }, [navigate]);

  const { data, isLoading } = useStayDetail(agreementId);

  if (isLoading || !data) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </>
    );
  }

  const { agreement, checkIn, deliverables } = data;
  const app: any = (agreement as any)?.application;
  const property = app?.property;
  const hostProfile = property?.host?.profiles;
  const start = app?.proposed_dates_start ? new Date(app.proposed_dates_start) : null;
  const end = app?.proposed_dates_end ? new Date(app.proposed_dates_end) : null;
  const images = property?.property_images || [];
  const primary = images.find((i: any) => i.is_primary) || images[0];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysToStart = start ? differenceInCalendarDays(start, today) : null;
  const isActiveWindow = start && end && today >= start && today <= end;

  return (
    <>
      <SEO title={`Stay · ${property?.title || ""}`} noIndex />
      <Navigation />
      <div className="min-h-screen bg-muted/30 pt-20 pb-12">
        <div className="container max-w-4xl px-4 space-y-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to="/creator/stays">
              <ArrowLeft className="h-4 w-4 mr-1" />
              All stays
            </Link>
          </Button>

          <Card className="overflow-hidden">
            {primary?.image_url && (
              <img
                src={primary.image_url}
                alt={property?.title || "Stay"}
                className="w-full h-48 md:h-64 object-cover"
              />
            )}
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">
                {property?.title || "Stay"}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-1">
                {property?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {property.location}
                  </span>
                )}
                {start && end && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(start, "MMM d")} – {format(end, "MMM d, yyyy")}
                  </span>
                )}
                {hostProfile && (
                  <span>
                    Host: {hostProfile.first_name} {hostProfile.last_name}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isActiveWindow ? (
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  Your stay is happening now.
                </p>
              ) : daysToStart !== null && daysToStart > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Starts in {daysToStart} day{daysToStart === 1 ? "" : "s"}.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Stay complete.</p>
              )}
            </CardContent>
          </Card>

          <CheckInCard
            agreementId={agreementId!}
            creatorId={userId}
            checkIn={checkIn}
          />

          <DeliverableTimeline
            agreementId={agreementId!}
            deliverables={deliverables}
            locked={!checkIn?.checked_in_at}
          />
        </div>
      </div>
    </>
  );
};

export default CreatorStayDashboard;