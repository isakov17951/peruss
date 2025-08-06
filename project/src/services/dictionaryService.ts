import { supabase } from '../lib/supabase';
import type { Translation as TranslationType } from '../types/dictionary';

export class DictionaryService {
  // Search for Russian word and get Persian translation
  static async searchRussianWord(word: string): Promise<TranslationType | null> {
    try {
      console.log('🔍 Searching Russian word:', word);
      
      // Find Russian word with case-insensitive search
      const { data: rusWord, error: rusError } = await supabase
        .from('rus_words')
        .select('*')
        .ilike('word', word.trim())
        .maybeSingle();

      if (rusError) {
        console.log('❌ Russian word not found:', rusError.message);
        return null;
      }

      if (!rusWord) {
        console.log('❌ No Russian word found for:', word);
        return null;
      }

      console.log('✅ Found Russian word:', rusWord);

      // Get examples for Russian word
      const { data: rusExamples, error: examplesError } = await supabase
        .from('rus_examples')
        .select('*')
        .eq('word_id', rusWord.id)
        .limit(5);

      if (examplesError) {
        console.warn('⚠️ Error fetching Russian examples:', examplesError.message);
      }

      console.log('📝 Russian examples:', rusExamples);

      // Get translations with Persian words
      const { data: translations, error: translationsError } = await supabase
        .from('translations')
        .select(`
          *,
          pers_words (
            id,
            word,
            phonetic,
            part_of_speech
          )
        `)
        .eq('rus_word_id', rusWord.id);

      if (translationsError) {
        console.error('❌ Error fetching translations:', translationsError.message);
        return null;
      }

      if (!translations || translations.length === 0) {
        console.log('❌ No translations found for Russian word:', word);
      }

      console.log('🔄 Found translations:', translations);

      // Always return a result if we found the Russian word, even without translations
      let meanings = [];
      let allExamples: string[] = [];

      if (translations && translations.length > 0) {
        // Get Persian examples for all related Persian words
        const persWordIds = translations
          .map(t => t.pers_words?.id)
          .filter(Boolean);

        let persExamples: any[] = [];
        if (persWordIds.length > 0) {
          const { data: persExamplesData, error: persExamplesError } = await supabase
            .from('pers_examples')
            .select('*')
            .in('word_id', persWordIds)
            .limit(5);

          if (persExamplesError) {
            console.warn('⚠️ Error fetching Persian examples:', persExamplesError.message);
          } else {
            persExamples = persExamplesData || [];
          }
        }

        console.log('📝 Persian examples:', persExamples);

        // Format response with all examples
        allExamples = [
          ...(rusExamples?.map(ex => ex.example_text) || []),
          ...(persExamples?.map(ex => ex.example_text) || [])
        ];

        meanings = [{
          partOfSpeech: rusWord.part_of_speech,
          definitions: rusWord.translation ? [rusWord.translation] : translations.map(t => t.definition),
          examples: allExamples.slice(0, 5) // Limit to 5 examples total
        }];
      } else {
        // No translations found, but we still have the word and examples
        console.log('⚠️ No translations found, but returning word with examples');
        allExamples = rusExamples?.map(ex => ex.example_text) || [];
        
        meanings = [{
          partOfSpeech: rusWord.part_of_speech,
          definitions: rusWord.translation ? [rusWord.translation] : ['Перевод не найден в базе данных'],
          examples: allExamples.slice(0, 5)
        }];
      }

      const result: TranslationType = {
        word: rusWord.word,
        phonetic: rusWord.phonetic || undefined,
        meanings
      };

      console.log('✅ Final result:', result);
      return result;

    } catch (error) {
      console.error('💥 Error searching Russian word:', error);
      return null;
    }
  }

  // Search for Persian word and get Russian translation
  static async searchPersianWord(word: string): Promise<TranslationType | null> {
    try {
      console.log('🔍 Searching Persian word:', word);
      
      // Find Persian word with case-insensitive search
      const { data: persWord, error: persError } = await supabase
        .from('pers_words')
        .select('*')
        .ilike('word', word.trim())
        .maybeSingle();

      if (persError) {
        console.log('❌ Persian word not found:', persError.message);
        return null;
      }

      if (!persWord) {
        console.log('❌ No Persian word found for:', word);
        return null;
      }

      console.log('✅ Found Persian word:', persWord);

      // Get examples for Persian word
      const { data: persExamples, error: examplesError } = await supabase
        .from('pers_examples')
        .select('*')
        .eq('word_id', persWord.id)
        .limit(5);

      if (examplesError) {
        console.warn('⚠️ Error fetching Persian examples:', examplesError.message);
      }

      console.log('📝 Persian examples:', persExamples);

      // Get translations with Russian words
      const { data: translations, error: translationsError } = await supabase
        .from('translations')
        .select(`
          *,
          rus_words (
            id,
            word,
            phonetic,
            part_of_speech
          )
        `)
        .eq('pers_word_id', persWord.id);

      if (translationsError) {
        console.error('❌ Error fetching translations:', translationsError.message);
        return null;
      }

      if (!translations || translations.length === 0) {
        console.log('❌ No translations found for Persian word:', word);
      }

      console.log('🔄 Found translations:', translations);

      // Always return a result if we found the Persian word, even without translations
      let meanings = [];
      let allExamples: string[] = [];

      if (translations && translations.length > 0) {
        // Get Russian examples for all related Russian words
        const rusWordIds = translations
          .map(t => t.rus_words?.id)
          .filter(Boolean);

        let rusExamples: any[] = [];
        if (rusWordIds.length > 0) {
          const { data: rusExamplesData, error: rusExamplesError } = await supabase
            .from('rus_examples')
            .select('*')
            .in('word_id', rusWordIds)
            .limit(5);

          if (rusExamplesError) {
            console.warn('⚠️ Error fetching Russian examples:', rusExamplesError.message);
          } else {
            rusExamples = rusExamplesData || [];
          }
        }

        console.log('📝 Russian examples:', rusExamples);

        // Format response with all examples
        allExamples = [
          ...(persExamples?.map(ex => ex.example_text) || []),
          ...(rusExamples?.map(ex => ex.example_text) || [])
        ];

        meanings = [{
          partOfSpeech: persWord.part_of_speech,
          definitions: persWord.translation ? [persWord.translation] : translations.map(t => t.definition),
          examples: allExamples.slice(0, 5) // Limit to 5 examples total
        }];
      } else {
        // No translations found, but we still have the word and examples
        console.log('⚠️ No translations found, but returning word with examples');
        allExamples = persExamples?.map(ex => ex.example_text) || [];
        
        meanings = [{
          partOfSpeech: persWord.part_of_speech,
          definitions: persWord.translation ? [persWord.translation] : ['ترجمه در پایگاه داده یافت نشد'],
          examples: allExamples.slice(0, 5)
        }];
      }

      const result: TranslationType = {
        word: persWord.word,
        phonetic: persWord.phonetic || undefined,
        meanings
      };

      console.log('✅ Final result:', result);
      return result;

    } catch (error) {
      console.error('💥 Error searching Persian word:', error);
      return null;
    }
  }

  // Get suggestions for autocomplete with improved search
  static async getSuggestions(query: string, direction: 'ru-fa' | 'fa-ru'): Promise<string[]> {
    try {
      if (!query.trim()) {
        return [];
      }

      console.log('🔍 Getting suggestions for:', query, 'direction:', direction);
      
      const tableName = direction === 'ru-fa' ? 'rus_words' : 'pers_words';
      console.log('📊 Searching in table:', tableName);
      
      // Enhanced search with multiple strategies
      const searchQuery = query.trim().toLowerCase();
      
      // Try exact prefix match first (most relevant)
      const { data: prefixData, error: prefixError } = await supabase
        .from(tableName)
        .select('word')
        .ilike('word', `${searchQuery}%`)
        .limit(5);
      
      if (prefixError) {
        console.error('❌ Error in prefix search:', prefixError);
      }
      
      // Try contains match for remaining slots
      const { data: containsData, error: containsError } = await supabase
        .from(tableName)
        .select('word')
        .ilike('word', `%${searchQuery}%`)
        .not('word', 'ilike', `${searchQuery}%`) // Exclude already found prefix matches
        .limit(5);
      
      if (containsError) {
        console.error('❌ Error in contains search:', containsError);
      }
      
      // Combine results, prioritizing prefix matches
      const prefixResults = prefixData?.map(item => item.word) || [];
      const containsResults = containsData?.map(item => item.word) || [];
      const allResults = [...prefixResults, ...containsResults];
      
      // Remove duplicates and limit to 10
      const uniqueResults = [...new Set(allResults)].slice(0, 10);

      console.log('✅ Found suggestions:', uniqueResults);
      console.log('📊 Table:', tableName, 'Prefix matches:', prefixResults.length, 'Contains matches:', containsResults.length);
      
      return uniqueResults;
    } catch (error) {
      console.error('💥 Error getting suggestions:', error);
      return [];
    }
  }

  // Search word in both directions with automatic detection
  static async searchWord(query: string, direction: 'ru-fa' | 'fa-ru'): Promise<TranslationType | null> {
    try {
      console.log('🎯 Starting search for:', query, 'direction:', direction);
      
      // Try the specified direction first
      let result = null;
      if (direction === 'ru-fa') {
        result = await this.searchRussianWord(query);
      } else {
        result = await this.searchPersianWord(query);
      }

      // If no result found, try the opposite direction as fallback
      if (!result) {
        console.log('🔄 Trying opposite direction as fallback...');
        if (direction === 'ru-fa') {
          result = await this.searchPersianWord(query);
        } else {
          result = await this.searchRussianWord(query);
        }
      }

      return result;
    } catch (error) {
      console.error('💥 Error in searchWord:', error);
      return null;
    }
  }

  // Health check method to verify database connection
  static async healthCheck(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('rus_words')
        .select('count')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.error('💥 Database health check failed:', error);
      return false;
    }
  }
}