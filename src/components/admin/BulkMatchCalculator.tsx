import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BulkOperation {
  id: string;
  status: string;
  total_combinations: number;
  processed_count: number;
  success_count: number;
  failed_count: number;
  skipped_count: number;
  started_at: string;
  completed_at: string | null;
  error_log: any;
}

export function BulkMatchCalculator() {
  const [operation, setOperation] = useState<BulkOperation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const fetchLatestOperation = async () => {
    const { data } = await supabase
      .from('bulk_match_operations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setOperation(data);
      if (data.status === 'processing') {
        setIsCalculating(true);
      }
    }
  };

  useEffect(() => {
    fetchLatestOperation();

    // Poll for updates every 2 seconds when processing
    const interval = setInterval(() => {
      if (isCalculating) {
        fetchLatestOperation();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isCalculating]);

  const startBulkCalculation = async () => {
    try {
      setIsCalculating(true);
      
      const { data, error } = await supabase.functions.invoke('bulk-calculate-ai-matches', {
        body: { batchSize: 10, forceRecalculate: false },
      });

      if (error) throw error;

      toast({
        title: 'Calculation Started',
        description: `Processing ${data.totalCombinations} AI match calculations...`,
      });

      // Start polling for updates
      fetchLatestOperation();
    } catch (error: any) {
      console.error('Error starting bulk calculation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start bulk calculation',
        variant: 'destructive',
      });
      setIsCalculating(false);
    }
  };

  const progressPercentage = operation
    ? Math.round((operation.processed_count / operation.total_combinations) * 100)
    : 0;

  const isCompleted = operation?.status === 'completed';
  const isFailed = operation?.status === 'failed';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Bulk AI Match Calculator
        </CardTitle>
        <CardDescription>
          Calculate AI match scores for all property-influencer combinations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!operation && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No calculations have been run yet
            </p>
            <Button onClick={startBulkCalculation} disabled={isCalculating}>
              {isCalculating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start Bulk Calculation
                </>
              )}
            </Button>
          </div>
        )}

        {operation && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Status: {operation.status.charAt(0).toUpperCase() + operation.status.slice(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {progressPercentage}% complete
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {operation.processed_count} / {operation.total_combinations} combinations processed
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="font-medium">{operation.success_count}</p>
                  <p className="text-xs text-muted-foreground">Successful</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <XCircle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="font-medium">{operation.failed_count}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="font-medium">{operation.skipped_count}</p>
                  <p className="text-xs text-muted-foreground">Skipped</p>
                </div>
              </div>
            </div>

            {operation.error_log && Array.isArray(operation.error_log) && operation.error_log.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Recent Errors:</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {operation.error_log.slice(-5).map((err: any, idx: number) => (
                    <p key={idx} className="text-xs text-red-500 bg-red-50 p-2 rounded">
                      {err.error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {!isCompleted && !isFailed && (
                <Button onClick={startBulkCalculation} disabled={isCalculating} className="flex-1">
                  {isCalculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Restart Calculation
                    </>
                  )}
                </Button>
              )}
              {isCompleted && (
                <Button onClick={startBulkCalculation} variant="outline" className="flex-1">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Run Again
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
