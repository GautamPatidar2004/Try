import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export type WaitlistEntryWithStatus = {
  id: string
  name: string
  email: string
  user_type: string | null
  created_at: string
  status: 'pending' | 'invited' | 'activated' | 'declined'
  invited_at: string | null
  activated_at: string | null
  temp_password: string | null
}

export const useWaitlistConversion = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefhijkmnpqrstuvwxyz23456789'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const inviteUser = async (waitlistEntry: WaitlistEntryWithStatus) => {
    setIsLoading(true)
    
    try {
      // Generate temporary password
      const tempPassword = generateTempPassword()
      
      // Create user via edge function with admin privileges
      const { data: createUserData, error: createUserError } = await supabase.functions.invoke('create-waitlist-user', {
        body: {
          email: waitlistEntry.email,
          name: waitlistEntry.name,
          tempPassword: tempPassword,
          userType: waitlistEntry.user_type,
          waitlistId: waitlistEntry.id
        }
      })

      if (createUserError || !createUserData?.success) {
        console.error('User creation error:', createUserError || createUserData)
        toast({
          title: "Error creating user",
          description: createUserError?.message || createUserData?.error || "Failed to create user",
          variant: "destructive",
        })
        return false
      }

      // Send invitation email
      const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          email: waitlistEntry.email,
          name: waitlistEntry.name,
          tempPassword: tempPassword,
          userType: waitlistEntry.user_type
        }
      })

      if (emailError) {
        console.error('Email sending error:', emailError)
        toast({
          title: "User created but email failed",
          description: "The user account was created but the invitation email could not be sent.",
          variant: "destructive",
        })
        return true // Still consider it a success since user was created
      }

      toast({
        title: "User invited successfully",
        description: `Invitation sent to ${waitlistEntry.email}`,
      })
      
      return true
    } catch (error) {
      console.error('Error inviting user:', error)
      toast({
        title: "Error",
        description: "Something went wrong while inviting the user.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const bulkInviteUsers = async (waitlistEntries: WaitlistEntryWithStatus[]) => {
    setIsLoading(true)
    
    try {
      const results = await Promise.allSettled(
        waitlistEntries.map(entry => inviteUser(entry))
      )
      
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value === true
      ).length
      
      toast({
        title: `Bulk invitation completed`,
        description: `${successful} out of ${waitlistEntries.length} users invited successfully`,
      })
      
      return successful
    } catch (error) {
      console.error('Error in bulk invite:', error)
      toast({
        title: "Bulk invitation failed",
        description: "An error occurred during bulk invitation.",
        variant: "destructive",
      })
      return 0
    } finally {
      setIsLoading(false)
    }
  }

  const resendInvitation = async (waitlistEntry: WaitlistEntryWithStatus) => {
    if (!waitlistEntry.temp_password) {
      toast({
        title: "Cannot resend",
        description: "No temporary password found for this user.",
        variant: "destructive",
      })
      return false
    }

    setIsLoading(true)
    
    try {
      const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          email: waitlistEntry.email,
          name: waitlistEntry.name,
          tempPassword: waitlistEntry.temp_password,
          userType: waitlistEntry.user_type,
          isResend: true
        }
      })

      if (emailError) {
        console.error('Email resend error:', emailError)
        toast({
          title: "Error resending invitation",
          description: emailError.message,
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Invitation resent",
        description: `Invitation resent to ${waitlistEntry.email}`,
      })
      
      return true
    } catch (error) {
      console.error('Error resending invitation:', error)
      toast({
        title: "Error",
        description: "Something went wrong while resending the invitation.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { 
    inviteUser, 
    bulkInviteUsers, 
    resendInvitation, 
    isLoading 
  }
}