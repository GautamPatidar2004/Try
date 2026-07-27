import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ROIMetrics {
  totalLikes: number;
  totalViews: number;
  totalReach: number;
  engagementRate: number;
  costPerEngagement: number;
  costPerThousandImpressions: number;
  estimatedValue: number;
  roi: number;
}

interface CollaborationROI {
  id: string;
  propertyName: string;
  agreedRate: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: string;
  metrics: ROIMetrics | null;
  propertyImage?: string;
}

interface AggregateMetrics {
  totalReach: number;
  totalValueDelivered: number;
  averageROI: number;
  collaborationCount: number;
  totalRevenue: number;
}

export const useROIMetrics = (userId: string) => {
  const [collaborations, setCollaborations] = useState<CollaborationROI[]>([]);
  const [aggregateMetrics, setAggregateMetrics] = useState<AggregateMetrics>({
    totalReach: 0,
    totalValueDelivered: 0,
    averageROI: 0,
    collaborationCount: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchROIData();
  }, [userId]);

  const fetchROIData = async () => {
    try {
      setLoading(true);

      // Fetch all collaborations for the user
      const { data: agreements, error } = await supabase
        .from('collaboration_agreements')
        .select(`
          id,
          agreed_rate,
          currency,
          created_at,
          status,
          application_id
        `)
        .or(`host_id.eq.${userId},influencer_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const collaborationsWithROI: CollaborationROI[] = [];
      let totalReach = 0;
      let totalValue = 0;
      let totalROI = 0;
      let successfulCalculations = 0;
      let totalRevenue = 0;

      // Calculate ROI for each collaboration
      for (const agreement of agreements || []) {
        // Fetch property details via application
        let propertyName = 'Unknown Property';
        let propertyImage: string | undefined;

        if (agreement.application_id) {
          const { data: application } = await supabase
            .from('applications')
            .select(`
              property_id,
              properties!applications_property_id_fkey (
                title
              )
            `)
            .eq('id', agreement.application_id)
            .single();

          if (application?.properties) {
            propertyName = application.properties.title || propertyName;
          }

          // Fetch primary property image separately
          if (application?.property_id) {
            const { data: images } = await supabase
              .from('property_images')
              .select('image_url')
              .eq('property_id', application.property_id)
              .eq('is_primary', true)
              .limit(1);
            
            if (images && images.length > 0) {
              propertyImage = images[0].image_url;
            }
          }
        }

        const { data: roiData } = await supabase.functions.invoke('calculate-roi-metrics', {
          body: { collaborationId: agreement.id },
        });
        
        const collaboration: CollaborationROI = {
          id: agreement.id,
          propertyName,
          agreedRate: agreement.agreed_rate || 0,
          currency: agreement.currency || 'usd',
          startDate: agreement.created_at,
          endDate: agreement.created_at,
          status: agreement.status || 'pending',
          metrics: roiData || null,
          propertyImage,
        };

        collaborationsWithROI.push(collaboration);

        if (roiData) {
          totalReach += roiData.totalReach || 0;
          totalValue += roiData.estimatedValue || 0;
          totalROI += roiData.roi || 0;
          successfulCalculations++;
        }

        totalRevenue += agreement.agreed_rate || 0;
      }

      setCollaborations(collaborationsWithROI);
      setAggregateMetrics({
        totalReach,
        totalValueDelivered: totalValue,
        averageROI: successfulCalculations > 0 ? totalROI / successfulCalculations : 0,
        collaborationCount: agreements?.length || 0,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching ROI data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    collaborations,
    aggregateMetrics,
    loading,
    refetch: fetchROIData,
  };
};
