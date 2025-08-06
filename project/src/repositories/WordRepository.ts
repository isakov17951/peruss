import { supabase } from '../lib/supabase';
import type { 
  WordWithTranslations, 
  DatabaseExample, 
  DatabaseTranslation,
  SupabaseResponse,
  SupabaseListResponse 
} from '../types/database';
import type { Direction } from '../types/dictionary';

export class WordRepository {
  /**
   * Поиск слова с переводами и примерами
   */
  static async findWordWithTranslations(
    word: string, 
    isRussian: boolean
  ): Promise<SupabaseResponse<WordWithTranslations>> {
    try {
      console.log('🔍 Repository: Searching word:', word, 'isRussian:', isRussian);
      
      const tableName = isRussian ? 'rus_words' : 'pers_words';
      const exampleTable = isRussian ? 'rus_examples' : 'pers_examples';
      const relatedTable = isRussian ? 'pers_words' : 'rus_words';

      // Шаг 1: Найти основное слово
      const { data: wordData, error: wordError } = await supabase
        .from(tableName)
        .select('*')
        .ilike('word', word.trim())
        .maybeSingle();

      if (wordError) {
        console.error('❌ Repository word error:', wordError);
        return { data: null, error: wordError };
      }

      if (!wordData) {
        console.log('❌ Repository: Word not found');
        return { data: null, error: null };
      }

      // Шаг 2: Получить примеры для этого слова
      const { data: examples, error: examplesError }: SupabaseListResponse<DatabaseExample> = await supabase
        .from(exampleTable)
        .select('example_text, translation')
        .eq('word_id', wordData.id);

      if (examplesError) {
        console.error('❌ Repository examples error:', examplesError);
      }

      // Шаг 3: Используем существующее поле translation из слова
      const formattedTranslations = wordData.translation ? [{
        definition: wordData.translation,
        confidence: 100
      }] : [];

      // Шаг 4: Форматируем финальные данные
      const formattedData: WordWithTranslations = {
        ...wordData,
        examples: examples || [],
        translations: formattedTranslations
      };

      console.log('✅ Repository: Found word with data:', formattedData);
      return { data: formattedData, error: null };

    } catch (error) {
      console.error('❌ Repository: Unexpected error:', error);
      return { data: null, error };
    }
  }

  /**
   * Получение подсказок для автодополнения
   */
  static async findSuggestions(
    query: string, 
    direction: Direction, 
    limit: number = 10
  ): Promise<SupabaseResponse<string[]>> {
    try {
      console.log('🔍 Repository: Getting suggestions for:', query, 'direction:', direction);
      
      const isRussian = direction === 'ru-fa';
      const tableName = isRussian ? 'rus_words' : 'pers_words';

      const { data: words, error } = await supabase
        .from(tableName)
        .select('word')
        .ilike('word', `${query.trim()}%`)
        .limit(limit);

      if (error) {
        console.error('❌ Repository suggestions error:', error);
        return { data: null, error };
      }

      const suggestions = words?.map(w => w.word) || [];
      console.log('✅ Repository: Got suggestions:', suggestions.length);
      return { data: suggestions, error: null };
    } catch (error) {
      console.error('❌ Repository: Suggestions unexpected error:', error);
      return { data: null, error };
    }
  }

  /**
   * Проверка здоровья сервиса
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rus_words')
        .select('id')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.error('❌ Repository: Health check failed:', error);
      return false;
    }
  }
}