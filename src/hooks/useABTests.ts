import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: Array<{ name: string; allocation: number }>;
  status: 'draft' | 'running' | 'paused' | 'completed';
  start_date: string | null;
  end_date: string | null;
  target_segment: any;
  winner_variant: string | null;
  metrics: any;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useABTests = () => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('ab_tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data as ABTest[] || []);
    } catch (error: any) {
      toast({
        title: "Error fetching A/B tests",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserVariant = (testName: string, userId: string) => {
    const test = tests.find(t => t.name === testName && t.status === 'running');
    if (!test) return null;

    const hash = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const percentage = hash % 100;
    
    let cumulative = 0;
    for (const variant of test.variants) {
      cumulative += variant.allocation;
      if (percentage < cumulative) {
        return variant.name;
      }
    }
    
    return test.variants[0]?.name || null;
  };

  const updateTestStatus = async (id: string, status: ABTest['status']) => {
    try {
      const { error } = await supabase
        .from('ab_tests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Test status updated",
        description: `Test is now ${status}`,
      });

      fetchTests();
    } catch (error: any) {
      toast({
        title: "Error updating test",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createTest = async (test: Omit<ABTest, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('ab_tests')
        .insert({ ...test, created_by: user?.id });

      if (error) throw error;

      toast({
        title: "A/B test created",
        description: "The test has been created successfully.",
      });

      fetchTests();
    } catch (error: any) {
      toast({
        title: "Error creating test",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTests();

    const channel = supabase
      .channel('ab_tests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ab_tests'
        },
        () => fetchTests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    tests,
    loading,
    getUserVariant,
    updateTestStatus,
    createTest,
    refetch: fetchTests
  };
};
