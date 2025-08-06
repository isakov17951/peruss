import { SearchService } from './SearchService';
import { isSuccess } from '../types/common';
import type { Translation as TranslationType } from '../types/dictionary';

export class DictionaryService {
  // Search word using existing SearchService
  static async searchWord(query: string, direction: 'ru-fa' | 'fa-ru'): Promise<TranslationType | null> {
    try {
      console.log('🎯 Starting search for:', query, 'direction:', direction);
      
      const searchResult = await SearchService.searchWithFallback(query, direction);
      
      if (!isSuccess(searchResult)) {
        console.log('❌ Search failed:', searchResult.error);
        return null;
      }

      console.log('✅ Search result:', searchResult.data);

      // searchWithFallback already returns data in Translation format
      return searchResult.data;
    } catch (error) {
      console.error('💥 Error in searchWord:', error);
      return null;
    }
  }

  // Get suggestions using existing SearchService
  static async getSuggestions(query: string, direction: 'ru-fa' | 'fa-ru'): Promise<string[]> {
    try {
      if (!query.trim()) {
        return [];
      }

      console.log('🔍 Getting suggestions for:', query, 'direction:', direction);
      
      const suggestions = await SearchService.getSuggestions(query, direction);
      
      console.log('✅ Found suggestions:', suggestions);
      return suggestions;
    } catch (error) {
      console.error('💥 Error getting suggestions:', error);
      return [];
    }
  }

  // Health check using existing SearchService
  static async healthCheck(): Promise<boolean> {
    try {
      // Try to get suggestions as a health check
      const suggestions = await SearchService.getSuggestions('test', 'ru-fa');
      return true;
    } catch (error) {
      console.error('💥 Database health check failed:', error);
      return false;
    }
  }
}