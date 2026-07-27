-- Create discovery conversations table for saving chat history
CREATE TABLE IF NOT EXISTS discovery_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create discovery messages table
CREATE TABLE IF NOT EXISTS discovery_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES discovery_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  creators JSONB,
  properties JSONB,
  brands JSONB,
  tool_calls JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_discovery_conversations_user_id ON discovery_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_discovery_conversations_updated_at ON discovery_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_discovery_messages_conversation_id ON discovery_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_discovery_messages_created_at ON discovery_messages(created_at);

-- Enable RLS
ALTER TABLE discovery_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON discovery_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON discovery_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON discovery_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON discovery_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON discovery_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM discovery_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON discovery_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM discovery_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages in their conversations"
  ON discovery_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM discovery_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );