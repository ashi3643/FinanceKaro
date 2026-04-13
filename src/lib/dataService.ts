// Data Service with SEBI Compliance (30-day lag) and DPDP Act Compliance

const DATA_LAG_DAYS = 30; // SEBI requirement for non-advisory apps

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface DataRequest {
  symbol: string;
  userId: string;
  consentGiven: boolean;
  dataType: 'market' | 'portfolio' | 'analytics';
}

class DataService {
  // Apply 30-day lag to market data for SEBI compliance
  applyDataLag<T extends { timestamp: string }>(data: T[]): T[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DATA_LAG_DAYS);

    return data.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate <= cutoffDate;
    });
  }

  // Add compliance notice to data
  addComplianceNotice(data: any): any {
    return {
      ...data,
      compliance: {
        dataLag: `${DATA_LAG_DAYS} days`,
        purpose: 'educational',
        disclaimer: 'Not financial advice. Data is historical.',
        lastUpdated: new Date().toISOString()
      }
    };
  }

  // Check if user has given consent for data processing (DPDP Act)
  async checkConsent(userId: string): Promise<boolean> {
    // In production, this would check Supabase or a consent management system
    // For now, we use localStorage as a fallback
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem(`consent-${userId}`);
      return consent === 'true';
    }
    return false;
  }

  // Store user consent (DPDP Act compliance)
  async storeConsent(userId: string, consent: boolean): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`consent-${userId}`, consent.toString());
      localStorage.setItem(`consent-timestamp-${userId}`, new Date().toISOString());
    }
    
    // In production, this would also store in Supabase
    // with proper audit trails
  }

  // Get data with consent check
  async getDataWithConsent(request: DataRequest): Promise<{ data: any; hasConsent: boolean }> {
    const hasConsent = await this.checkConsent(request.userId);
    
    if (!hasConsent && request.dataType !== 'market') {
      // Market data is public and doesn't require consent
      // Portfolio/analytics data requires consent
      return {
        data: null,
        hasConsent: false
      };
    }

    // Fetch data based on type
    let data: any;
    
    switch (request.dataType) {
      case 'market':
        data = await this.getMarketData(request.symbol);
        break;
      case 'portfolio':
        data = await this.getPortfolioData(request.userId);
        break;
      case 'analytics':
        data = await this.getAnalyticsData(request.userId);
        break;
    }

    return {
      data: this.addComplianceNotice(data),
      hasConsent
    };
  }

  // Get market data with 30-day lag
  private async getMarketData(symbol: string): Promise<MarketData> {
    // In production, this would fetch from a market data API
    // For now, return mock data with proper timestamp
    const laggedDate = new Date();
    laggedDate.setDate(laggedDate.getDate() - DATA_LAG_DAYS);

    return {
      symbol,
      price: 1500 + Math.random() * 100,
      change: (Math.random() - 0.5) * 50,
      changePercent: (Math.random() - 0.5) * 5,
      timestamp: laggedDate.toISOString()
    };
  }

  // Get portfolio data (requires consent)
  private async getPortfolioData(userId: string): Promise<any> {
    // In production, this would fetch from Account Aggregator or user's connected accounts
    // For now, return mock data
    return {
      holdings: [],
      totalValue: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  // Get analytics data (requires consent)
  private async getAnalyticsData(userId: string): Promise<any> {
    // In production, this would analyze user's financial patterns
    // For now, return mock data
    return {
      spendingPatterns: [],
      savingsRate: 0,
      riskProfile: 'moderate',
      lastUpdated: new Date().toISOString()
    };
  }

  // Delete user data (DPDP Act right to erasure)
  async deleteUserData(userId: string): Promise<boolean> {
    try {
      // In production, this would:
      // 1. Delete all user data from Supabase
      // 2. Remove from any third-party integrations
      // 3. Keep only audit logs required by law
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`consent-${userId}`);
        localStorage.removeItem(`consent-timestamp-${userId}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting user data:', error);
      return false;
    }
  }

  // Export user data (DPDP Act right to data portability)
  async exportUserData(userId: string): Promise<any> {
    // In production, this would compile all user data into a portable format
    return {
      userId,
      exportDate: new Date().toISOString(),
      data: {}
    };
  }
}

// Singleton instance
let dataServiceInstance: DataService | null = null;

export function getDataService(): DataService {
  if (!dataServiceInstance) {
    dataServiceInstance = new DataService();
  }
  return dataServiceInstance;
}

export { DATA_LAG_DAYS };
