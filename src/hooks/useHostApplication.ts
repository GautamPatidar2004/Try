
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useHostApplication = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const submitHostApplication = async () => {
    try {
      setIsSubmitting(true);

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Get user profile information
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Create host application
      const { error: applicationError } = await supabase
        .from('host_applications')
        .insert({
          user_id: session.user.id,
        });

      if (applicationError) {
        console.error('Error creating host application:', applicationError);
        toast({
          title: "Error",
          description: "Failed to submit your application. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Create admin notification
      const notificationData = {
        user_id: session.user.id,
        user_email: session.user.email,
        profile: profile,
        applied_at: new Date().toISOString(),
      };

      const { error: notificationError } = await supabase
        .from('admin_notifications')
        .insert({
          type: 'host_application',
          title: 'New Host Application',
          message: `${profile?.first_name || 'A user'} ${profile?.last_name || ''} has applied to become a host.`,
          data: notificationData,
        });

      if (notificationError) {
        console.error('Error creating admin notification:', notificationError);
        // Continue anyway - the application was created successfully
      }

      // Navigate to confirmation page
      navigate('/host-application-submitted');
      
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest in becoming a host. We'll be in touch soon!",
      });

    } catch (error) {
      console.error('Error submitting host application:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitHostApplication,
    isSubmitting,
  };
};
