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

  constructor() {
    console.log('🔍 ConvertKit init: Using Vercel API endpoint');
  }

  /**
   * Add subscriber using secure API endpoint
   */
  async addSubscriber(subscriber: ConvertKitSubscriber): Promise<ConvertKitResponse | null> {
    try {
      console.log('🔍 Calling secure ConvertKit API:', subscriber.email);

      const response = await fetch(`${this.baseUrl}/convertkit-subscribe`, {
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

      console.log('✅ ConvertKit API success:', data);
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
