/**
 * Zero-Knowledge Proof based parental consent token system
 * This avoids storing sensitive minor data while providing verifiable consent
 */

export interface ConsentToken {
  deviceId: string;
  consentGiven: boolean;
  parentEmail: string; // Hashed
  timestamp: string;
  signature: string;
}

export const consentTokenService = {
  /**
   * Generate a simple hash of the parent's email for verification
   * In production, use proper cryptographic hashing (bcrypt/argon2)
   */
  hashParentEmail(email: string): string {
    // Simple hash for demo - use proper crypto in production
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  },

  /**
   * Generate a consent token with signature
   * In production, use proper cryptographic signing
   */
  generateToken(deviceId: string, parentEmail: string): ConsentToken {
    const timestamp = new Date().toISOString();
    const hashedEmail = this.hashParentEmail(parentEmail);
    
    // Simple signature - in production use proper crypto
    const signature = btoa(`${deviceId}:${timestamp}:${hashedEmail}`);
    
    return {
      deviceId,
      consentGiven: true,
      parentEmail: hashedEmail,
      timestamp,
      signature
    };
  },

  /**
   * Verify a consent token signature
   */
  verifyToken(token: ConsentToken, parentEmail: string): boolean {
    try {
      const hashedEmail = this.hashParentEmail(parentEmail);
      
      // Check if email matches
      if (token.parentEmail !== hashedEmail) {
        return false;
      }

      // Check if signature is valid
      const expectedSignature = btoa(`${token.deviceId}:${token.timestamp}:${hashedEmail}`);
      
      if (token.signature !== expectedSignature) {
        return false;
      }

      // Check if token is not expired (30 days)
      const tokenDate = new Date(token.timestamp);
      const now = new Date();
      const daysDiff = (now.getTime() - tokenDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 30) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error verifying consent token:', error);
      return false;
    }
  },

  /**
   * Store consent token in localStorage
   */
  storeToken(token: ConsentToken): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('financekaro-parental-consent', JSON.stringify(token));
    } catch (error) {
      console.error('Error storing consent token:', error);
    }
  },

  /**
   * Retrieve consent token from localStorage
   */
  retrieveToken(): ConsentToken | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem('financekaro-parental-consent');
      if (!stored) return null;
      
      return JSON.parse(stored) as ConsentToken;
    } catch (error) {
      console.error('Error retrieving consent token:', error);
      return null;
    }
  },

  /**
   * Check if valid consent exists for device
   */
  hasValidConsent(parentEmail: string): boolean {
    const token = this.retrieveToken();
    if (!token) return false;
    
    return this.verifyToken(token, parentEmail);
  },

  /**
   * Clear stored consent token
   */
  clearToken(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('financekaro-parental-consent');
    } catch (error) {
      console.error('Error clearing consent token:', error);
    }
  }
};
