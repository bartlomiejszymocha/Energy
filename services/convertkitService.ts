interface ConvertKitSubscriber {
  email: string;
  first_name?: string;
  fields?: Record<string, string>;
  tags?: string[];
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
  private apiKey: string;
  private baseUrl = 'https://api.convertkit.com/v3';

  constructor() {
    this.apiKey = process.env.CONVERTKIT_API_KEY || '';
    if (!this.apiKey) {
      console.warn('ConvertKit API key not found. Email automation will be disabled.');
    }
  }

  /**
   * Add subscriber to a form
   */
  async addToForm(formId: string, subscriber: ConvertKitSubscriber): Promise<ConvertKitResponse | null> {
    if (!this.apiKey) {
      console.warn('ConvertKit API key missing');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/forms/${formId}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          email: subscriber.email,
          first_name: subscriber.first_name,
          fields: subscriber.fields,
          tags: subscriber.tags,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('ConvertKit API error:', data);
        return { error: data.message || 'Failed to add subscriber' };
      }

      return data;
    } catch (error) {
      console.error('ConvertKit request failed:', error);
      return { error: 'Network error' };
    }
  }

  /**
   * Add subscriber to a sequence
   */
  async addToSequence(sequenceId: string, subscriber: ConvertKitSubscriber): Promise<ConvertKitResponse | null> {
    if (!this.apiKey) {
      console.warn('ConvertKit API key missing');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/sequences/${sequenceId}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          email: subscriber.email,
          first_name: subscriber.first_name,
          fields: subscriber.fields,
          tags: subscriber.tags,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('ConvertKit API error:', data);
        return { error: data.message || 'Failed to add subscriber' };
      }

      return data;
    } catch (error) {
      console.error('ConvertKit request failed:', error);
      return { error: 'Network error' };
    }
  }

  /**
   * Add tags to existing subscriber
   */
  async addTags(email: string, tags: string[]): Promise<ConvertKitResponse | null> {
    if (!this.apiKey || !tags.length) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
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
