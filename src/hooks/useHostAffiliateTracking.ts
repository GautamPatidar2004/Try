import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import type { CreatorAffiliateCode } from "./useCreatorAffiliateCodes";

interface LogConversionParams {
  code: string;
  orderAmount: number;
  conversionType: "booking" | "product_sale" | "restaurant_reservation" | "experience" | "other";
  externalReference?: string;
  customerEmailHash?: string;
  metadata?: Record<string, unknown>;
}

export const useHostAffiliateTracking = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Fetch all affiliate codes for the host's properties
  const {
    data: affiliateCodes,
    isLoading: isLoadingCodes,
    refetch: refetchCodes,
  } = useQuery({
    queryKey: ["host-affiliate-codes", userId],
    enabled: !!userId,
    queryFn: async (): Promise<CreatorAffiliateCode[]> => {
      const { data, error } = await supabase
        .from("creator_affiliate_codes")
        .select(`
          *,
          property:properties(title, location),
          collaboration:collaboration_agreements(status)
        `)
        .eq("host_id", userId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as CreatorAffiliateCode[];
    },
  });

  // Validate an affiliate code
  const validateCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase
        .from("creator_affiliate_codes")
        .select(`
          *,
          property:properties(title)
        `)
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        throw new Error("Invalid or inactive affiliate code");
      }

      // Check if code is within valid date range
      const now = new Date();
      const validFrom = new Date(data.valid_from);
      const validUntil = data.valid_until ? new Date(data.valid_until) : null;

      if (now < validFrom) {
        throw new Error("This code is not yet active");
      }

      if (validUntil && now > validUntil) {
        throw new Error("This code has expired");
      }

      // Check usage limit
      if (data.usage_limit && data.current_uses >= data.usage_limit) {
        throw new Error("This code has reached its usage limit");
      }

      return data as unknown as CreatorAffiliateCode;
    },
  });

  // Log a new conversion
  const logConversionMutation = useMutation({
    mutationFn: async (params: LogConversionParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First validate the code
      const { data: codeData, error: codeError } = await supabase
        .from("creator_affiliate_codes")
        .select("*")
        .eq("code", params.code.toUpperCase())
        .eq("host_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (codeError) throw codeError;
      if (!codeData) throw new Error("Invalid affiliate code or code not associated with your properties");

      // Calculate commission
      let commissionAmount: number;
      if (codeData.commission_type === "percentage") {
        commissionAmount = Math.round(params.orderAmount * Number(codeData.commission_rate));
      } else {
        commissionAmount = codeData.flat_fee_amount || 0;
      }

      // Create the conversion - using type assertion for new table
      const conversionData = {
        affiliate_code_id: codeData.id,
        creator_id: codeData.creator_id,
        host_id: user.id,
        conversion_type: params.conversionType,
        order_amount: params.orderAmount,
        commission_amount: commissionAmount,
        currency: "usd",
        status: "pending",
        external_reference: params.externalReference || null,
        customer_email_hash: params.customerEmailHash || null,
        metadata: params.metadata || {},
        converted_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("affiliate_conversions" as any)
        .insert(conversionData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-conversions"] });
      queryClient.invalidateQueries({ queryKey: ["host-affiliate-codes"] });
      toast({
        title: "Conversion Logged",
        description: "The conversion has been recorded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Logging Conversion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get creator performance stats
  const {
    data: creatorPerformance,
    isLoading: isLoadingPerformance,
  } = useQuery({
    queryKey: ["host-creator-performance", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_conversions")
        .select(`
          creator_id,
          order_amount,
          commission_amount,
          status,
          affiliate_code:creator_affiliate_codes(
            code,
            creator_id
          )
        `)
        .eq("host_id", userId!);

      if (error) throw error;

      // Group by creator
      const performanceMap = new Map<string, {
        creatorId: string;
        totalConversions: number;
        totalOrderAmount: number;
        totalCommission: number;
        codes: Set<string>;
      }>();

      (data || []).forEach((conversion: any) => {
        const creatorId = conversion.creator_id;
        const existing = performanceMap.get(creatorId) || {
          creatorId,
          totalConversions: 0,
          totalOrderAmount: 0,
          totalCommission: 0,
          codes: new Set<string>(),
        };

        if (conversion.status !== "cancelled") {
          existing.totalConversions += 1;
          existing.totalOrderAmount += conversion.order_amount;
          existing.totalCommission += conversion.commission_amount;
        }

        if (conversion.affiliate_code?.code) {
          existing.codes.add(conversion.affiliate_code.code);
        }

        performanceMap.set(creatorId, existing);
      });

      return Array.from(performanceMap.values()).map((p) => ({
        ...p,
        codes: Array.from(p.codes),
      }));
    },
  });

  return {
    affiliateCodes: affiliateCodes || [],
    creatorPerformance: creatorPerformance || [],
    isLoading: isLoadingCodes || isLoadingPerformance,
    validateCode: validateCodeMutation.mutateAsync,
    isValidatingCode: validateCodeMutation.isPending,
    validatedCode: validateCodeMutation.data,
    validationError: validateCodeMutation.error,
    logConversion: logConversionMutation.mutate,
    isLoggingConversion: logConversionMutation.isPending,
    refetch: refetchCodes,
  };
};
