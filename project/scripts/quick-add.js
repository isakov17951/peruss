#!/usr/bin/env node

/**
 * Quick add a single word pair to the dictionary
 *
 * Usage:
 *   node scripts/quick-add.js <rus_word> <pers_word> <definition> [part_of_speech]
 *
 * Example:
 *   node scripts/quick-add.js "солнце" "خورشید" "небесное светило" "существительное"
 *
 * Options:
 *   --rus-phonetic    Russian phonetic
 *   --pers-phonetic   Persian phonetic
 *   --frequency       частое/редкое/очень редкое
 *   --difficulty      начальный/средний/продвинутый
 *   --confidence      1-100
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('❌ Usage: node quick-add.js <rus_word> <pers_word> <definition> [part_of_speech]');
    console.error('\nExample:');
    console.error('  node quick-add.js "солнце" "خورشید" "небесное светило" "существительное"');
    console.error('\nOptional flags:');
    console.error('  --rus-phonetic <value>    Russian phonetic transcription');
    console.error('  --pers-phonetic <value>   Persian phonetic transcription');
    console.error('  --frequency <value>       частое/редкое/очень редкое');
    console.error('  --difficulty <value>      начальный/средний/продвинутый');
    console.error('  --confidence <value>      Translation confidence 1-100');
    process.exit(1);
  }

  const config = {
    rusWord: args[0],
    persWord: args[1],
    definition: args[2],
    partOfSpeech: args[3] || 'существительное',
    rusPhonetic: null,
    persPhonetic: null,
    frequency: 'частое',
    difficulty: 'начальный',
    confidence: 100
  };

  // Parse optional flags
  for (let i = 4; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];

    switch (flag) {
      case '--rus-phonetic':
        config.rusPhonetic = value;
        break;
      case '--pers-phonetic':
        config.persPhonetic = value;
        break;
      case '--frequency':
        config.frequency = value;
        break;
      case '--difficulty':
        config.difficulty = value;
        break;
      case '--confidence':
        config.confidence = parseInt(value);
        break;
      default:
        console.warn(`⚠️  Unknown flag: ${flag}`);
    }
  }

  return config;
}

async function quickAdd(config) {
  try {
    console.log('\n🚀 Adding word pair to dictionary...\n');
    console.log(`   Russian: ${config.rusWord}${config.rusPhonetic ? ' [' + config.rusPhonetic + ']' : ''}`);
    console.log(`   Persian: ${config.persWord}${config.persPhonetic ? ' [' + config.persPhonetic + ']' : ''}`);
    console.log(`   Definition: ${config.definition}`);
    console.log(`   Part of Speech: ${config.partOfSpeech}`);
    console.log(`   Frequency: ${config.frequency}`);
    console.log(`   Difficulty: ${config.difficulty}`);
    console.log(`   Confidence: ${config.confidence}%\n`);

    // 1. Insert Russian word
    let { data: rusWord, error: rusError } = await supabase
      .from('rus_words')
      .insert({
        word: config.rusWord,
        phonetic: config.rusPhonetic,
        part_of_speech: config.partOfSpeech,
        frequency: config.frequency,
        difficulty: config.difficulty
      })
      .select()
      .single();

    if (rusError) {
      if (rusError.code === '23505') {
        console.log(`⚠️  Russian word "${config.rusWord}" already exists, using existing entry`);
        const { data } = await supabase
          .from('rus_words')
          .select('*')
          .eq('word', config.rusWord)
          .single();
        rusWord = data;
      } else {
        throw rusError;
      }
    } else {
      console.log(`✅ Russian word added: ${config.rusWord}`);
    }

    // 2. Insert Persian word
    let { data: persWord, error: persError } = await supabase
      .from('pers_words')
      .insert({
        word: config.persWord,
        phonetic: config.persPhonetic,
        part_of_speech: config.partOfSpeech,
        frequency: config.frequency,
        difficulty: config.difficulty
      })
      .select()
      .single();

    if (persError) {
      if (persError.code === '23505') {
        console.log(`⚠️  Persian word "${config.persWord}" already exists, using existing entry`);
        const { data } = await supabase
          .from('pers_words')
          .select('*')
          .eq('word', config.persWord)
          .single();
        persWord = data;
      } else {
        throw persError;
      }
    } else {
      console.log(`✅ Persian word added: ${config.persWord}`);
    }

    // 3. Link translation
    const { error: transError } = await supabase
      .from('translations')
      .insert({
        rus_word_id: rusWord.id,
        pers_word_id: persWord.id,
        definition: config.definition,
        confidence: config.confidence
      });

    if (transError) {
      if (transError.code === '23505') {
        console.log(`⚠️  Translation link already exists`);
      } else {
        throw transError;
      }
    } else {
      console.log(`✅ Translation link created`);
    }

    console.log('\n🎉 Word pair successfully added to dictionary!\n');

    // Show summary
    console.log('Summary:');
    console.log(`  Russian word ID: ${rusWord.id}`);
    console.log(`  Persian word ID: ${persWord.id}`);
    console.log('\nYou can now search for these words in the dictionary app.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.hint) {
      console.error('   Hint:', error.hint);
    }
    if (error.details) {
      console.error('   Details:', error.details);
    }
    process.exit(1);
  }
}

// Main execution
const config = parseArgs();
quickAdd(config);
