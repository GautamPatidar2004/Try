interface MarketplaceTabsProps {
  activeTab: 'discovery' | 'properties' | 'brand-deals';
  onTabChange: (tab: 'discovery' | 'properties' | 'brand-deals') => void;
  showAdminBadge?: boolean;
}

const MarketplaceTabs = ({ activeTab, onTabChange, showAdminBadge }: MarketplaceTabsProps) => {
  return (
    <div className="bg-card border-b border-border sticky top-16 z-[60]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8">
          <button 
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'discovery' 
                ? 'border-brand-green text-brand-green' 
                : 'border-transparent text-muted-foreground hover:text-foreground/80 hover:border-border'
            }`}
            onClick={() => onTabChange('discovery')}
          >
            Creators
          </button>
          <button 
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'properties' 
                ? 'border-brand-green text-brand-green' 
                : 'border-transparent text-muted-foreground hover:text-foreground/80 hover:border-border'
            }`}
            onClick={() => onTabChange('properties')}
          >
            Stays
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'brand-deals' 
                ? 'border-brand-green text-brand-green' 
                : 'border-transparent text-muted-foreground hover:text-foreground/80 hover:border-border'
            }`}
            onClick={() => onTabChange('brand-deals')}
          >
            Brand Deals
          </button>
        </div>
        {showAdminBadge && (
           <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-2 py-1 cursor-default m-2">
         <span className="w-1.5 h-1.5 rounded-full bg-green-600 shrink-0" />
         <span className="text-xs text-green-700 font-medium tracking-wide">Admin</span>
         <span className="w-px h-3 bg-green-200 mx-0.5" />
         <a
           href="/admin"
           className="text-[11px] text-blue-700 font-medium hover:text-blue-600 transition-colors whitespace-nowrap"
         >
           Switch ↗
         </a>
       </div>
     
        )}
      </div>
    </div>
  );
};

export default MarketplaceTabs;