import { useEffect, useState } from 'react';
import { useGiveaway } from '@/hooks/useGiveaway';
import { Users } from 'lucide-react';

export const SocialProof = () => {
  const { getEntryCount } = useGiveaway();
  const [entryCount, setEntryCount] = useState<number>(0);

  useEffect(() => {
    const fetchCount = async () => {
      const count = await getEntryCount();
      setEntryCount(count);
    };

    fetchCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 text-muted-foreground">
      <Users className="h-5 w-5" />
      <span className="text-lg font-medium">
        <span className="text-primary font-bold">{entryCount}</span> {entryCount === 1 ? 'entry' : 'entries'} so far
      </span>
    </div>
  );
};
