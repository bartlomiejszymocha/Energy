interface ConvertKitSubscriber {
  email: string;
  first_name?: string;
  fields?: Record<string, string>;
  tags?: string[];
  subscribeToNewsletter?: boolean;
}

interface ConvertKitResponse {
  subscription?: {
    id: number;
    state: string;
    created_at: string;
    subscriber: {
      id: number;
      email_address: string;
    };
  };
  error?: string;
  message?: string;
}

class ConvertKitService {
  private baseUrl = '/api';
  private useMock: boolean;

  constructor() {
    // Użyj mock API w development (localhost)
    this.useMock = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
      localStorage.getItem('convertkit_use_real_api') !== 'true';
    
    console.log('🔍 ConvertKit init:', this.useMock ? '🎭 MOCK MODE (localhost)' : '🌐 REAL API');
  }

  /**
   * Add subscriber using secure API endpoint
   */
  async addSubscriber(subscriber: ConvertKitSubscriber): Promise<ConvertKitResponse | null> {
    try {
      const endpoint = this.useMock ? 'convertkit-subscribe-mock' : 'convertkit-subscribe';
      console.log(`🔍 Calling ConvertKit API (${this.useMock ? 'MOCK' : 'REAL'}):`, subscriber.email);

      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: subscriber.email,
          firstName: subscriber.first_name,
          tags: subscriber.tags,
          fields: subscriber.fields,
          subscribeToNewsletter: subscriber.subscribeToNewsletter || false,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('ConvertKit API error:', data);
        return { error: data.error || 'Failed to add subscriber' };
      }

      if (this.useMock) {
        console.log('✅ ConvertKit MOCK success:', data);
      } else {
        console.log('✅ ConvertKit API success:', data);
      }
      return data;
    } catch (error) {
      console.error('ConvertKit request failed:', error);
      return { error: 'Network error' };
    }
  }

  // Legacy methods (unused but kept for compatibility)
  async addToForm(formId: string, subscriber: ConvertKitSubscriber): Promise<ConvertKitResponse | null> {
    return this.addSubscriber(subscriber);
  }

  async addToSequence(sequenceId: string, subscriber: ConvertKitSubscriber): Promise<ConvertKitResponse | null> {
    return this.addSubscriber(subscriber);
  }

  /**
   * Add tags to existing subscriber
   */
  async addTags(email: string, tags: string[]): Promise<ConvertKitResponse | null> {
    if (!tags.length) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          tags,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('ConvertKit tags error:', data);
        return { error: data.message || 'Failed to add tags' };
      }

      return data;
    } catch (error) {
      console.error('ConvertKit tags request failed:', error);
      return { error: 'Network error' };
    }
  }
}

export const convertkitService = new ConvertKitService();
