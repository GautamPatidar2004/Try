import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { FAQ } from "@/types/support";

interface FAQAccordionProps {
  faqs: FAQ[];
}

const FAQAccordion = ({ faqs }: FAQAccordionProps) => {
  if (faqs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No FAQ items found.</p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger className="text-left">
            <div className="flex items-center gap-2">
              <span>{faq.question}</span>
              {faq.category && (
                <Badge variant="secondary" className="text-xs">
                  {faq.category.name}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="prose prose-sm max-w-none">
              <p>{faq.answer}</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FAQAccordion;