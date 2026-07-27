import { useState } from "react";
import { Search, MessageSquare, FileText, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupport } from "@/hooks/useSupport";
import FAQAccordion from "@/components/support/FAQAccordion";
import HelpSupportModal from "@/components/support/HelpSupportModal";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { SEO, generateFAQSchema } from "@/components/SEO";

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { categories, faqs, searchFAQs, fetchFAQs } = useSupport();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      await searchFAQs(searchTerm);
    } else {
      await fetchFAQs();
    }
  };

  const handleCategoryFilter = async (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    await fetchFAQs(categoryId || undefined);
  };

  const popularFAQs = faqs.slice(0, 6);

  const faqSchema = faqs.length > 0
    ? generateFAQSchema(
        faqs.slice(0, 20).map((f: { question: string; answer: string }) => ({
          question: f.question,
          answer: f.answer,
        }))
      )
    : undefined;

  return (
    <>
      <SEO
        title="Help Center - Hostfluencer Support"
        description="Get answers to your questions about Hostfluencer. Browse our FAQ, create support tickets, or contact our team for personalized assistance."
        canonical="/help"
        keywords="hostfluencer help, support, FAQ, contact us, customer service"
        schema={faqSchema}
      />
      <Navigation />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-brand-green text-white py-16 pt-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-lg mb-8 opacity-90">
            Find answers to common questions or get in touch with our support team
          </p>
          
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg bg-background text-foreground"
              />
            </div>
            <Button type="submit" size="lg" variant="secondary">
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setIsModalOpen(true)}>
            <CardHeader className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Create Support Ticket</CardTitle>
              <CardDescription>
                Get personalized help from our support team
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Browse FAQ</CardTitle>
              <CardDescription>
                Find quick answers to frequently asked questions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Mail className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Email Support</CardTitle>
              <CardDescription>
                Send us an email at hello@hostfluencer.com
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => handleCategoryFilter(null)}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => handleCategoryFilter(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {selectedCategory 
              ? `${categories.find(c => c.id === selectedCategory)?.name} Questions`
              : searchTerm 
                ? `Search Results for "${searchTerm}"`
                : "Frequently Asked Questions"
            }
          </h2>
          
          <div className="max-w-4xl">
            <FAQAccordion faqs={faqs} />
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => setIsModalOpen(true)}>
              Create Support Ticket
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:hello@hostfluencer.com">
                Email Us
              </a>
            </Button>
          </div>
        </div>
      </div>

      <Footer />

        <HelpSupportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </>
  );
};

export default Help;