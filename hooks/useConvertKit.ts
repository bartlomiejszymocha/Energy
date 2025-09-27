import { useCallback } from 'react';
import { convertkitService } from '../services/convertkitService';

export const useConvertKit = () => {
  const addSubscriber = useCallback(async (
    email: string, 
    firstName?: string, 
    options?: {
      useForm?: boolean;
      tags?: string[];
      fields?: Record<string, string>;
    }
  ) => {
    if (!email) {
      console.warn('Email is required for ConvertKit subscription');
      return { success: false, error: 'Email is required' };
    }

    const subscriber = {
      email,
      first_name: firstName,
      tags: options?.tags || ['Energy Playbook User'],
      fields: options?.fields || {}
    };

    try {
      let result;
      
      if (options?.useForm && process.env.CONVERTKIT_FORM_ID) {
        result = await convertkitService.addToForm(process.env.CONVERTKIT_FORM_ID, subscriber);
      } else if (process.env.CONVERTKIT_SEQUENCE_ID) {
        result = await convertkitService.addToSequence(process.env.CONVERTKIT_SEQUENCE_ID, subscriber);
      } else {
        console.warn('No ConvertKit Form ID or Sequence ID configured');
        return { success: false, error: 'ConvertKit not properly configured' };
      }

      if (result?.error) {
        console.error('ConvertKit subscription failed:', result.error);
        return { success: false, error: result.error };
      }

      console.log('Successfully added to ConvertKit:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('ConvertKit integration error:', error);
      return { success: false, error: 'Failed to add subscriber' };
    }
  }, []);

  const addTags = useCallback(async (email: string, tags: string[]) => {
    if (!email || !tags.length) {
      return { success: false, error: 'Email and tags are required' };
    }

    try {
      const result = await convertkitService.addTags(email, tags);
      
      if (result?.error) {
        console.error('ConvertKit tagging failed:', result.error);
        return { success: false, error: result.error };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('ConvertKit tagging error:', error);
      return { success: false, error: 'Failed to add tags' };
    }
  }, []);

  return {
    addSubscriber,
    addTags
  };
};
