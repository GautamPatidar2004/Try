import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useCreatorStays, CreatorStay, StayBucket } from "@/hooks/useCreatorStays";
import { StayStatusPill } from "@/components/stays/StayStatusPill";

const SECTIONS: { key: StayBucket; title: string }[] = [
  { key: "active", title: "Active stays" },
  { key: "upcoming", title: "Upcoming stays" },
  { key: "completed", title: "Past stays" },
];

const StayCard = ({ stay }: { stay: CreatorStay }) => (
  <Card className="overflow-hidden hover:shadow-md transition-shadow">
    <Link to={`/creator/stays/${stay.id}`} className="block">
      {stay.property?.image_url ? (
        <img
          src={stay.property.image_url}
          alt={stay.property.title || "Stay"}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-muted" />
      )}
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold truncate">{stay.property?.title || "Untitled stay"}</h3>
          <StayStatusPill status={stay.bucket} />
        </div>
        {stay.property?.location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {stay.property.location}
          </p>
        )}
        {stay.start_date && stay.end_date && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(stay.start_date), "MMM d")} –{" "}
            {format(new Date(stay.end_date), "MMM d, yyyy")}
          </p>
        )}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {stay.host
              ? `Host: ${stay.host.first_name ?? ""} ${stay.host.last_name ?? ""}`
              : ""}
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Link>
  </Card>
);

const CreatorStaysList = () => {
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

  const { data: stays, isLoading } = useCreatorStays(userId);

  const grouped: Record<StayBucket, CreatorStay[]> = {
    active: [],
    upcoming: [],
    completed: [],
    other: [],
  };
  (stays || []).forEach((s) => grouped[s.bucket].push(s));

  return (
    <>
      <SEO title="My Stays" description="Manage your active and upcoming stays." noIndex />
      <Navigation />
      <div className="min-h-screen bg-muted/30 pt-20 pb-12">
        <div className="container max-w-5xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">My Stays</h1>
              <p className="text-sm text-muted-foreground">
                Check in, upload daily content, and complete each collaboration.
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/profile?tab=collaborations")}>
              All collaborations
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : !stays || stays.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                You don't have any stays yet. Apply to a property to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {SECTIONS.map((section) => {
                const items = grouped[section.key];
                if (items.length === 0) return null;
                return (
                  <section key={section.key}>
                    <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((s) => (
                        <StayCard key={s.id} stay={s} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CreatorStaysList;