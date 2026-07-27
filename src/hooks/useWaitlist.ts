import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export type WaitlistEntry = {
  id?: string
  name: string
  email: string
  user_type?: 'host' | 'creator' | 'both'
  created_at?: string
}

export const useWaitlist = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const addToWaitlist = async (entry: Omit<WaitlistEntry, 'id' | 'created_at'>) => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([entry])
        .select()

      if (error) {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Welcome to the waitlist!",
        description: "We'll send you exclusive updates and early access.",
      })
      
      return true
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const checkEmailExists = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('email')
        .eq('email', email.toLowerCase())
        .single()

      if (error && error.code !== 'PGRST116') {
        return false
      }

      return !!data
    } catch (error) {
      return false
    }
  }

  return { addToWaitlist, checkEmailExists, isLoading }
}
