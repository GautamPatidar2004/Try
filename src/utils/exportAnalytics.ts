interface ExportData {
  [key: string]: any;
}

export const exportToCSV = (data: ExportData[], filename: string) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        const escaped = ('' + value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportPlatformAnalytics = (analytics: any, dateRange: string) => {
  const exportData = [
    {
      metric: 'Monthly Recurring Revenue',
      value: analytics.revenue?.mrr || 0,
      dateRange,
    },
    {
      metric: 'Annual Recurring Revenue',
      value: analytics.revenue?.arr || 0,
      dateRange,
    },
    {
      metric: 'Total Users',
      value: analytics.users?.total || 0,
      dateRange,
    },
    {
      metric: 'Active Users',
      value: analytics.users?.active || 0,
      dateRange,
    },
    {
      metric: 'New Signups',
      value: analytics.users?.newSignups || 0,
      dateRange,
    },
    {
      metric: 'Day 1 Retention',
      value: `${analytics.retention?.day1 || 0}%`,
      dateRange,
    },
    {
      metric: 'Day 7 Retention',
      value: `${analytics.retention?.day7 || 0}%`,
      dateRange,
    },
    {
      metric: 'Day 30 Retention',
      value: `${analytics.retention?.day30 || 0}%`,
      dateRange,
    },
    {
      metric: 'Application Success Rate',
      value: `${analytics.health?.applicationSuccessRate || 0}%`,
      dateRange,
    },
  ];

  const timestamp = new Date().toISOString().split('T')[0];
  exportToCSV(exportData, `platform-analytics-${dateRange}-${timestamp}.csv`);
};

export const exportCreatorAnalytics = (analytics: any, dateRange: number) => {
  const exportData = [
    {
      metric: 'Total Reach',
      value: analytics.overview?.totalReach || 0,
      period: `Last ${dateRange} days`,
    },
    {
      metric: 'Average Engagement Rate',
      value: `${analytics.overview?.avgEngagementRate?.toFixed(2) || 0}%`,
      period: `Last ${dateRange} days`,
    },
    {
      metric: 'Total Posts',
      value: analytics.overview?.totalPosts || 0,
      period: `Last ${dateRange} days`,
    },
    {
      metric: 'Collaboration Success Rate',
      value: `${analytics.overview?.collaborationSuccessRate?.toFixed(2) || 0}%`,
      period: `Last ${dateRange} days`,
    },
    {
      metric: 'Total Collaborations',
      value: analytics.collaborationImpact?.totalCollaborations || 0,
      period: `Last ${dateRange} days`,
    },
  ];

  const timestamp = new Date().toISOString().split('T')[0];
  exportToCSV(exportData, `creator-analytics-${dateRange}d-${timestamp}.csv`);
};
