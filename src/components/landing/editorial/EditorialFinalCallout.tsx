import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const EditorialFinalCallout = () => {
  const navigate = useNavigate();
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="font-serif text-5xl md:text-7xl text-foreground tracking-tight leading-[1.05] mb-6">
          New collabs drop daily.
          <br />
          <em className="text-brand-green not-italic italic">Be first.</em>
        </h2>
        <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
          Join 700+ creators already booking stays through Hostfluencer.
        </p>
        <Button
          size="lg"
          onClick={() => navigate("/auth")}
          className="rounded-full bg-brand-green hover:bg-brand-green/90 text-white h-13 px-8 py-6 text-base font-medium group"
        >
          Get started free
          <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </section>
  );
};
