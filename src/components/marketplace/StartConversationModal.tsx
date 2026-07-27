import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, X, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Creator {
  id: string;
  name: string;
  avatar: string;
  location: string;
  followers: number;
  rating: number;
  specialties: string[];
  recentWork: string[];
  priceRange: string;
  userId: string; // The actual user ID from profiles table
}

interface StartConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: Creator;
}

const StartConversationModal = ({ isOpen, onClose, creator }: StartConversationModalProps) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    
    if (isOpen) {
      getCurrentUser();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!currentUser) {
      toast.error("You must be logged in to send messages");
      return;
    }

    if (!creator.userId) {
      toast.error("Unable to send message - creator not found");
      return;
    }

    setIsSending(true);
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          receiver_id: creator.userId,
          content: message.trim()
        });

      if (error) throw error;
      
      toast.success(
        `Message sent to ${creator.name}!`,
        {
          action: {
            label: "View Messages",
            onClick: () => navigate("/profile"),
          },
        }
      );
      setMessage("");
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start Conversation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Creator Info */}
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="w-12 h-12">
              <AvatarImage src={creator.avatar} alt={creator.name} />
              <AvatarFallback className="bg-gradient-to-br from-brand-green to-emerald-500 text-white">
                {creator.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{creator.name}</h3>
              <p className="text-sm text-muted-foreground">{creator.location}</p>
            </div>
          </div>

          {/* Message Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Message
            </label>
            <Textarea
              placeholder={`Hi ${creator.name.split(' ')[0]}, I'm interested in collaborating with you...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {message.length}/500 characters
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={isSending || !message.trim()}
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StartConversationModal;