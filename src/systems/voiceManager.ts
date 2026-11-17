/**
 * Complete Voice Acting & Dialogue System for Mosquito Apocalypse: Bangladesh Edition 🇧🇩
 * 100% PURE BANGLA DIALOGUE & SPEECH SYNTHESIS ONLY (NO ENGLISH SPOKEN VOICES).
 * Includes authentic Dhaka street slang, funny comedic insults, horror whispers, and boss threats.
 */

import { soundManager } from './audio';

export interface VoiceLine {
  id: string;
  category: 'player' | 'mosquito' | 'boss' | 'whisper' | 'environment';
  speaker: string;
  speakerBangla: string;
  banglaText: string;
  englishText?: string;
  pitch: number;
  rate: number;
  volume: number;
  priority: number; // 5 = Signature Whisper, 4 = Boss, 3 = Player, 2 = Mosquito, 1 = Environment
  cooldown?: number;
}

export type VoiceEventTrigger =
  | 'player_attack_signature'
  | 'player_attack'
  | 'player_attack_miss'
  | 'player_damage'
  | 'player_kill'
  | 'player_giant_seen'
  | 'player_weapon_racket'
  | 'player_weapon_newspaper'
  | 'player_weapon_coil'
  | 'player_weapon_fan'
  | 'player_weapon_spray'
  | 'player_ammo_empty'
  | 'player_powercut'
  | 'player_low_health'
  | 'player_item_found'
  | 'player_boss_defeat'
  | 'player_victory'
  | 'player_victory_final'
  | 'player_death'
  | 'mosquito_taunt_signature'
  | 'mosquito_normal'
  | 'mosquito_giant'
  | 'mosquito_stealth'
  | 'mosquito_swarm'
  | 'boss_dengue_intro'
  | 'boss_dengue_attack'
  | 'boss_dengue_rage'
  | 'boss_dengue_defeat'
  | 'boss_midnight_intro'
  | 'boss_midnight_attack'
  | 'boss_midnight_defeat'
  | 'boss_invisible_intro'
  | 'boss_invisible_attack'
  | 'boss_invisible_defeat'
  | 'signature_powercut_whisper'
  | 'mosquito_victory_joke'
  | 'env_neighbor_powercut'
  | 'env_neighbor_infestation';

const VOICE_DATABASE: Record<VoiceEventTrigger, VoiceLine[]> = {
  // 1. SIGNATURE PLAYER DIALOGUE 1 (CRITICAL USER MANDATE)
  player_attack_signature: [
    {
      id: 'p_sig_1',
      category: 'player',
      speaker: 'You (খাটের ওপর)',
      speakerBangla: 'আপনি',
      banglaText: 'ধুর শালার বেটা মশা, তোরে আমি খাইসি!',
      pitch: 1.05,
      rate: 1.18,
      volume: 1.0,
      priority: 3,
      cooldown: 5,
    },
  ],

  // 2. SIGNATURE MOSQUITO DIALOGUE 2 (CRITICAL USER MANDATE)
  mosquito_taunt_signature: [
    {
      id: 'm_sig_2',
      category: 'mosquito',
      speaker: 'Taunting Mosquito (খোঁচামারা মশা)',
      speakerBangla: 'মশা',
      banglaText: 'মামুর বেটা, পারলে আজকে ঘুমা!',
      pitch: 1.65,
      rate: 1.25,
      volume: 0.9,
      priority: 2,
      cooldown: 6,
    },
  ],

  player_attack: [
    {
      id: 'p_atk_sig',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'ধুর শালার বেটা মশা, তোরে আমি খাইসি!',
      pitch: 1.05,
      rate: 1.18,
      volume: 1.0,
      priority: 3,
      cooldown: 6,
    },
    {
      id: 'p_atk_1',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'এই ব্যাটা, দাঁড়া! আজকে তোর খবর আছে!',
      pitch: 1.0,
      rate: 1.15,
      volume: 0.95,
      priority: 3,
      cooldown: 5,
    },
    {
      id: 'p_atk_2',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'ধুর! আবার কামড় দিল!',
      pitch: 1.05,
      rate: 1.2,
      volume: 0.95,
      priority: 3,
      cooldown: 5,
    },
    {
      id: 'p_atk_3',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'আয় শালা, সামনে আয়!',
      pitch: 0.95,
      rate: 1.1,
      volume: 0.95,
      priority: 3,
      cooldown: 5,
    },
    {
      id: 'p_atk_4',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'একটা মশাও বাঁচতে পারবি না!',
      pitch: 1.0,
      rate: 1.15,
      volume: 0.95,
      priority: 3,
      cooldown: 5,
    },
    {
      id: 'p_atk_5',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'আমার ঘুমটা শেষ কইরা দিলি!',
      pitch: 1.05,
      rate: 1.2,
      volume: 0.95,
      priority: 3,
      cooldown: 5,
    },
    {
      id: 'p_atk_6',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'তোরে আজকে ছাড়তেছি না!',
      pitch: 1.0,
      rate: 1.15,
      volume: 0.95,
      priority: 3,
      cooldown: 5,
    },
    {
      id: 'p_atk_7',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'র‍্যাকেটের বাড়ি খাইয়া এবার বুঝবি!',
      pitch: 1.0,
      rate: 1.15,
      volume: 0.95,
      priority: 3,
      cooldown: 5,
    },
  ],

  player_attack_miss: [
    {
      id: 'p_miss_1',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'আরে ধুর! লাগল না কেন?',
      pitch: 1.05,
      rate: 1.2,
      volume: 0.9,
      priority: 3,
      cooldown: 5,
    },
    {
      id: 'p_miss_2',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'এইটা আবার কই গেল?',
      pitch: 1.0,
      rate: 1.15,
      volume: 0.9,
      priority: 3,
      cooldown: 5,
    },
    {
      id: 'p_miss_3',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'চোখের সামনে আছিল, হাওয়ায় মিলায় গেল!',
      pitch: 1.05,
      rate: 1.2,
      volume: 0.9,
      priority: 3,
      cooldown: 5,
    },
    {
      id: 'p_miss_4',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'শালা, দাঁড়া! এবার দেখাচ্ছি!',
      pitch: 0.95,
      rate: 1.15,
      volume: 0.9,
      priority: 3,
      cooldown: 5,
    },
  ],

  player_damage: [
    {
      id: 'p_dmg_1',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'ওই! কামড় দিলি কই?',
      pitch: 1.05,
      rate: 1.2,
      volume: 1.0,
      priority: 3,
      cooldown: 4,
    },
    {
      id: 'p_dmg_2',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'আহ! এই ব্যাটা তো আসলেই বিপদ!',
      pitch: 1.0,
      rate: 1.15,
      volume: 1.0,
      priority: 3,
      cooldown: 4,
    },
    {
      id: 'p_dmg_3',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'আরেকটু হইলেই শেষ আছিলাম!',
      pitch: 1.05,
      rate: 1.2,
      volume: 1.0,
      priority: 3,
      cooldown: 4,
    },
    {
      id: 'p_dmg_4',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'আল্লাহ, এত মশা! ভাই আর কামড়াইস না!',
      pitch: 1.1,
      rate: 1.2,
      volume: 1.0,
      priority: 3,
      cooldown: 4,
    },
  ],

  player_low_health: [
    {
      id: 'p_low_1',
      category: 'player',
      speaker: 'You (মুমূর্ষু)',
      speakerBangla: 'আপনি (মুমূর্ষু)',
      banglaText: 'ওরে বাবা! আরেকটু হইলেই শেষ!',
      pitch: 1.0,
      rate: 1.15,
      volume: 1.0,
      priority: 4,
      cooldown: 8,
    },
    {
      id: 'p_low_2',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'এইভাবে চললে তো আমিই মশার খাবার হমু!',
      pitch: 0.95,
      rate: 1.1,
      volume: 1.0,
      priority: 4,
      cooldown: 8,
    },
    {
      id: 'p_low_3',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'কেউ নাই? বাঁচাও ভাই!',
      pitch: 1.1,
      rate: 1.2,
      volume: 1.0,
      priority: 4,
      cooldown: 8,
    },
  ],

  player_item_found: [
    {
      id: 'p_item_1',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'আহা! এইবার কিছু একটা কাজে লাগবে!',
      pitch: 1.05,
      rate: 1.15,
      volume: 0.95,
      priority: 3,
      cooldown: 4,
    },
    {
      id: 'p_item_2',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'যাক বাবা, অবশেষে কিছু একটা পাইলাম!',
      pitch: 1.0,
      rate: 1.1,
      volume: 0.95,
      priority: 3,
      cooldown: 4,
    },
    {
      id: 'p_item_3',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'এইটাই তো দরকার আছিল!',
      pitch: 1.05,
      rate: 1.15,
      volume: 0.95,
      priority: 3,
      cooldown: 4,
    },
  ],

  player_boss_defeat: [
    {
      id: 'p_bdef_1',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'কী রে? এতক্ষণ এত ভাব দেখাচ্ছিলি!',
      pitch: 1.05,
      rate: 1.15,
      volume: 1.0,
      priority: 4,
      cooldown: 6,
    },
    {
      id: 'p_bdef_2',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'যা, এবার আর কারও রক্ত খাইতে পারবি না!',
      pitch: 1.0,
      rate: 1.1,
      volume: 1.0,
      priority: 4,
      cooldown: 6,
    },
    {
      id: 'p_bdef_3',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'শেষ! তোর রাজত্ব শেষ!',
      pitch: 1.05,
      rate: 1.15,
      volume: 1.0,
      priority: 4,
      cooldown: 6,
    },
  ],

  player_kill: [
    {
      id: 'p_k_sig',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'ধুর শালার বেটা মশা, তোরে আমি খাইসি!',
      pitch: 1.05,
      rate: 1.18,
      volume: 1.0,
      priority: 3,
      cooldown: 4,
    },
    {
      id: 'p_k_1',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'হ্যাঁ! এবার বুঝলি?!',
      pitch: 1.0,
      rate: 1.2,
      volume: 0.9,
      priority: 3,
      cooldown: 3.5,
    },
    {
      id: 'p_k_2',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'এই মশার বাচ্চা!',
      pitch: 1.05,
      rate: 1.25,
      volume: 0.9,
      priority: 3,
      cooldown: 3.5,
    },
    {
      id: 'p_k_3',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'আজকে তোকে শেষ করেই ছাড়ব!',
      pitch: 0.95,
      rate: 1.15,
      volume: 0.9,
      priority: 3,
      cooldown: 3.5,
    },
  ],

  player_giant_seen: [
    {
      id: 'p_giant',
      category: 'player',
      speaker: 'You (আতঙ্কে)',
      speakerBangla: 'আপনি (আতঙ্কে)',
      banglaText: 'ও মাগো! এইটা আবার কী?! এত বড় মশা জীবনে দেখি নাই!',
      pitch: 1.15,
      rate: 1.2,
      volume: 1.0,
      priority: 4,
      cooldown: 12,
    },
  ],

  player_weapon_racket: [
    {
      id: 'p_w_racket',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'এইবার ইলেকট্রিক শক খা!',
      pitch: 1.0,
      rate: 1.2,
      volume: 0.85,
      priority: 3,
      cooldown: 8,
    },
  ],

  player_weapon_newspaper: [
    {
      id: 'p_w_paper',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'এই নে খবরের কাগজ! দৈনিক ইত্তেফাকের বাড়ি খা!',
      pitch: 1.0,
      rate: 1.15,
      volume: 0.85,
      priority: 3,
      cooldown: 8,
    },
  ],

  player_weapon_coil: [
    {
      id: 'p_w_coil',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'এবার ঈগল কয়েলের ধোঁয়ায় মর!',
      pitch: 1.0,
      rate: 1.15,
      volume: 0.85,
      priority: 3,
      cooldown: 8,
    },
  ],

  player_weapon_fan: [
    {
      id: 'p_w_fan',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'যা! বাতাস খা!',
      pitch: 1.05,
      rate: 1.2,
      volume: 0.85,
      priority: 3,
      cooldown: 8,
    },
  ],

  player_weapon_spray: [
    {
      id: 'p_w_spray',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'এইবার হিট স্প্রে খা!',
      pitch: 1.0,
      rate: 1.2,
      volume: 0.85,
      priority: 3,
      cooldown: 8,
    },
  ],

  player_ammo_empty: [
    {
      id: 'p_empty',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'ধুর! স্প্রে আর কয়েল সব শেষ!',
      pitch: 0.95,
      rate: 1.15,
      volume: 0.9,
      priority: 3,
      cooldown: 6,
    },
  ],

  player_powercut: [
    {
      id: 'p_pcut_1',
      category: 'player',
      speaker: 'You (লোডশেডিংয়ে)',
      speakerBangla: 'আপনি (লোডশেডিংয়ে)',
      banglaText: 'আবার কারেন্ট গেল?! মশার কয়েল কোথায়?!',
      pitch: 1.05,
      rate: 1.15,
      volume: 1.0,
      priority: 4,
      cooldown: 10,
    },
    {
      id: 'p_pcut_2',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'এখনই কারেন্ট যেতে হলো?! ভাই কেউ একজন লাইট জ্বালাও!',
      pitch: 1.1,
      rate: 1.18,
      volume: 1.0,
      priority: 4,
      cooldown: 10,
    },
  ],

  player_victory: [
    {
      id: 'p_vic',
      category: 'player',
      speaker: 'You (বিজয়ী)',
      speakerBangla: 'আপনি (বিজয়ী)',
      banglaText: 'যাক! শেষ পর্যন্ত বেঁচে গেলাম!',
      pitch: 1.05,
      rate: 1.1,
      volume: 1.0,
      priority: 4,
    },
  ],

  // FINAL LEVEL 6 CLIMACTIC VICTORY DIALOGUE (CRITICAL USER MANDATE)
  player_victory_final: [
    {
      id: 'p_vic_final',
      category: 'player',
      speaker: 'You (চূড়ান্ত বিজয়ী)',
      speakerBangla: 'আপনি (পরম শান্তিতে)',
      banglaText: 'এত কষ্ট করার পর এখন যদি একটা মশাও কামড় দেয়, আমি কিন্তু দেশ ছাইড়া চলে যামু!',
      pitch: 1.0,
      rate: 1.05,
      volume: 1.0,
      priority: 5,
    },
  ],

  mosquito_victory_joke: [
    {
      id: 'm_vic_joke',
      category: 'mosquito',
      speaker: 'Surviving Mosquito (শেষ মশা)',
      speakerBangla: 'শেষ মশা',
      banglaText: 'মামা... একটু রক্ত দিয়া যান না!',
      pitch: 1.7,
      rate: 1.25,
      volume: 0.95,
      priority: 5,
    },
  ],

  player_death: [
    {
      id: 'p_death',
      category: 'player',
      speaker: 'You',
      speakerBangla: 'আপনি',
      banglaText: 'সব রক্ত চুষে নিয়ে গেল রে...',
      pitch: 0.8,
      rate: 0.85,
      volume: 1.0,
      priority: 4,
    },
  ],

  mosquito_normal: [
    {
      id: 'm_taunt_sig',
      category: 'mosquito',
      speaker: 'Mutant Mosquito',
      speakerBangla: 'রক্তচোষা মশা',
      banglaText: 'মামুর বেটা, পারলে আজকে ঘুমা!',
      pitch: 1.65,
      rate: 1.25,
      volume: 0.85,
      priority: 2,
      cooldown: 6,
    },
    {
      id: 'm_norm_1',
      category: 'mosquito',
      speaker: 'Mutant Mosquito',
      speakerBangla: 'রক্তচোষা মশা',
      banglaText: 'কী হইল মামা? ধরতে পারলি না?',
      pitch: 1.6,
      rate: 1.3,
      volume: 0.8,
      priority: 2,
      cooldown: 6,
    },
    {
      id: 'm_norm_2',
      category: 'mosquito',
      speaker: 'Mutant Mosquito',
      speakerBangla: 'রক্তচোষা মশা',
      banglaText: 'তোর র‍্যাকেট দেইখা ভয় পাইছি নাকি?',
      pitch: 1.7,
      rate: 1.25,
      volume: 0.8,
      priority: 2,
      cooldown: 6,
    },
    {
      id: 'm_norm_3',
      category: 'mosquito',
      speaker: 'Mutant Mosquito',
      speakerBangla: 'রক্তচোষা মশা',
      banglaText: 'আজকে তোর ঘুম হারাম!',
      pitch: 1.65,
      rate: 1.25,
      volume: 0.8,
      priority: 2,
      cooldown: 6,
    },
    {
      id: 'm_norm_4',
      category: 'mosquito',
      speaker: 'Mutant Mosquito',
      speakerBangla: 'রক্তচোষা মশা',
      banglaText: 'আয় আয়, আরেকটু কাছে আয়!',
      pitch: 1.7,
      rate: 1.35,
      volume: 0.8,
      priority: 2,
      cooldown: 6,
    },
    {
      id: 'm_norm_5',
      category: 'mosquito',
      speaker: 'Mutant Mosquito',
      speakerBangla: 'রক্তচোষা মশা',
      banglaText: 'হাহাহা! মিস করছস আবার!',
      pitch: 1.6,
      rate: 1.3,
      volume: 0.8,
      priority: 2,
      cooldown: 6,
    },
    {
      id: 'm_norm_6',
      category: 'mosquito',
      speaker: 'Mutant Mosquito',
      speakerBangla: 'রক্তচোষা মশা',
      banglaText: 'এই বাসায় আজকে আমরাই মালিক!',
      pitch: 1.55,
      rate: 1.25,
      volume: 0.8,
      priority: 2,
      cooldown: 6,
    },
    {
      id: 'm_norm_7',
      category: 'mosquito',
      speaker: 'Mutant Mosquito',
      speakerBangla: 'রক্তচোষা মশা',
      banglaText: 'তোর রক্ত কিন্তু অনেক মিষ্টি!',
      pitch: 1.65,
      rate: 1.25,
      volume: 0.8,
      priority: 2,
      cooldown: 6,
    },
    {
      id: 'm_norm_8',
      category: 'mosquito',
      speaker: 'Mutant Mosquito',
      speakerBangla: 'রক্তচোষা মশা',
      banglaText: 'ধরতে পারবি না রে! ইহিহিহি!',
      pitch: 1.75,
      rate: 1.35,
      volume: 0.8,
      priority: 2,
      cooldown: 6,
    },
  ],

  mosquito_giant: [
    {
      id: 'm_giant_1',
      category: 'mosquito',
      speaker: 'Giant Mosquito (দানবীয় বড় মশা)',
      speakerBangla: 'দানবীয় বড় মশা',
      banglaText: 'মানুষ! তোর শেষ সময় ঘনাইয়া আসছে!',
      pitch: 0.65,
      rate: 0.85,
      volume: 0.9,
      priority: 3,
      cooldown: 8,
    },
    {
      id: 'm_giant_2',
      category: 'mosquito',
      speaker: 'Giant Mosquito',
      speakerBangla: 'দানবীয় বড় মশা',
      banglaText: 'এই ঘর এখন আমার রাজত্ব!',
      pitch: 0.6,
      rate: 0.85,
      volume: 0.9,
      priority: 3,
      cooldown: 8,
    },
    {
      id: 'm_giant_3',
      category: 'mosquito',
      speaker: 'Giant Mosquito',
      speakerBangla: 'দানবীয় বড় মশা',
      banglaText: 'তোর ওই ছোট্ট র‍্যাকেট দিয়া আমার কী করবি?',
      pitch: 0.65,
      rate: 0.85,
      volume: 0.9,
      priority: 3,
      cooldown: 8,
    },
    {
      id: 'm_giant_4',
      category: 'mosquito',
      speaker: 'Giant Mosquito',
      speakerBangla: 'দানবীয় বড় মশা',
      banglaText: 'আজকে তোর ঘুমের বারোটা বাজামু!',
      pitch: 0.7,
      rate: 0.9,
      volume: 0.9,
      priority: 3,
      cooldown: 8,
    },
    {
      id: 'm_giant_5',
      category: 'mosquito',
      speaker: 'Giant Mosquito',
      speakerBangla: 'দানবীয় বড় মশা',
      banglaText: 'এইবার পালানোর রাস্তা বন্ধ!',
      pitch: 0.65,
      rate: 0.85,
      volume: 0.9,
      priority: 3,
      cooldown: 8,
    },
  ],

  mosquito_stealth: [
    {
      id: 'm_stealth_1',
      category: 'mosquito',
      speaker: 'Stealth Mosquito',
      speakerBangla: 'স্টেলথ মশা',
      banglaText: 'পিছনে তাকাও...',
      pitch: 1.35,
      rate: 0.8,
      volume: 0.85,
      priority: 2,
      cooldown: 8,
    },
    {
      id: 'm_stealth_2',
      category: 'mosquito',
      speaker: 'Stealth Mosquito',
      speakerBangla: 'স্টেলথ মশা',
      banglaText: 'খুঁজে দেখ... যদি পারিস!',
      pitch: 1.4,
      rate: 0.85,
      volume: 0.85,
      priority: 2,
      cooldown: 8,
    },
  ],

  mosquito_swarm: [
    {
      id: 'm_swarm_1',
      category: 'mosquito',
      speaker: 'Mosquito Swarm',
      speakerBangla: 'ঝাঁক বাঁধা মশা',
      banglaText: 'আমরা অনেক! ঘিরে ফেল!',
      pitch: 1.7,
      rate: 1.4,
      volume: 0.8,
      priority: 2,
      cooldown: 7,
    },
    {
      id: 'm_swarm_2',
      category: 'mosquito',
      speaker: 'Mosquito Swarm',
      speakerBangla: 'ঝাঁক বাঁধা মশা',
      banglaText: 'রক্ত দে! ব্লাড দে!',
      pitch: 1.65,
      rate: 1.35,
      volume: 0.8,
      priority: 2,
      cooldown: 7,
    },
  ],

  boss_dengue_intro: [
    {
      id: 'b_dengue_intro',
      category: 'boss',
      speaker: 'Dengue King (ডেঙ্গু রাজা)',
      speakerBangla: 'ডেঙ্গু রাজা',
      banglaText: 'হাহাহা! আমার রাজ্যে স্বাগতম, মানুষ!',
      pitch: 0.55,
      rate: 0.82,
      volume: 1.0,
      priority: 4,
    },
  ],

  boss_dengue_attack: [
    {
      id: 'b_dengue_atk_1',
      category: 'boss',
      speaker: 'Dengue King',
      speakerBangla: 'ডেঙ্গু রাজা',
      banglaText: 'তোর রক্ত দিয়াই আমার সাম্রাজ্য চলবে!',
      pitch: 0.55,
      rate: 0.85,
      volume: 1.0,
      priority: 4,
      cooldown: 8,
    },
    {
      id: 'b_dengue_atk_2',
      category: 'boss',
      speaker: 'Dengue King',
      speakerBangla: 'ডেঙ্গু রাজা',
      banglaText: 'আমার সৈন্যদের পার হইয়া আমার কাছে আইছস? সাহস তো কম না!',
      pitch: 0.5,
      rate: 0.85,
      volume: 1.0,
      priority: 4,
      cooldown: 8,
    },
    {
      id: 'b_dengue_atk_3',
      category: 'boss',
      speaker: 'Dengue King',
      speakerBangla: 'ডেঙ্গু রাজা',
      banglaText: 'তুই ভাবছিস আমাকে হারানো এত সহজ?',
      pitch: 0.55,
      rate: 0.85,
      volume: 1.0,
      priority: 4,
      cooldown: 8,
    },
  ],

  boss_dengue_rage: [
    {
      id: 'b_dengue_rage',
      category: 'boss',
      speaker: 'Dengue King',
      speakerBangla: 'ডেঙ্গু রাজা',
      banglaText: 'আমার ক্রোধের সামনে কেউ বাঁচবে না!',
      pitch: 0.5,
      rate: 0.8,
      volume: 1.0,
      priority: 4,
      cooldown: 10,
    },
  ],

  boss_dengue_defeat: [
    {
      id: 'b_dengue_def',
      category: 'boss',
      speaker: 'Dengue King',
      speakerBangla: 'ডেঙ্গু রাজা',
      banglaText: 'না! আমার রাজ্য ধ্বংস হয়ে গেল...',
      pitch: 0.5,
      rate: 0.75,
      volume: 1.0,
      priority: 4,
    },
  ],

  boss_midnight_intro: [
    {
      id: 'b_mid_intro',
      category: 'boss',
      speaker: 'Midnight Mosquito (মধ্যরাতের মশা)',
      speakerBangla: 'মধ্যরাতের মশা',
      banglaText: 'অন্ধকারে কাউরে বিশ্বাস করা যায় না, মানুষ...',
      pitch: 0.65,
      rate: 0.78,
      volume: 1.0,
      priority: 4,
    },
  ],

  boss_midnight_attack: [
    {
      id: 'b_mid_atk_1',
      category: 'boss',
      speaker: 'Midnight Mosquito',
      speakerBangla: 'মধ্যরাতের মশা',
      banglaText: 'শুনতে পাচ্ছিস? আমি তোর একদম কাছেই আছি!',
      pitch: 0.65,
      rate: 0.82,
      volume: 1.0,
      priority: 4,
      cooldown: 8,
    },
    {
      id: 'b_mid_atk_2',
      category: 'boss',
      speaker: 'Midnight Mosquito',
      speakerBangla: 'মধ্যরাতের মশা',
      banglaText: 'খুঁজে দেখ... যদি পারিস!',
      pitch: 0.65,
      rate: 0.8,
      volume: 1.0,
      priority: 4,
      cooldown: 8,
    },
    {
      id: 'b_mid_atk_3',
      category: 'boss',
      speaker: 'Midnight Mosquito',
      speakerBangla: 'মধ্যরাতের মশা',
      banglaText: 'আলো নিভলেই আমার খেলা শুরু!',
      pitch: 0.65,
      rate: 0.82,
      volume: 1.0,
      priority: 4,
      cooldown: 8,
    },
  ],

  boss_midnight_defeat: [
    {
      id: 'b_mid_def',
      category: 'boss',
      speaker: 'Midnight Mosquito',
      speakerBangla: 'মধ্যরাতের মশা',
      banglaText: 'অন্ধকারের আলোতে আমি বিলীন হলাম...',
      pitch: 0.6,
      rate: 0.75,
      volume: 1.0,
      priority: 4,
    },
  ],

  boss_invisible_intro: [
    {
      id: 'b_invis_intro',
      category: 'boss',
      speaker: 'The Invisible Mosquito (মায়াবী অদৃশ্য মশা)',
      speakerBangla: 'মায়াবী অদৃশ্য মশা',
      banglaText: 'আমি আছি... কিন্তু তুই দেখতে পারবি না!',
      pitch: 0.7,
      rate: 0.75,
      volume: 1.0,
      priority: 4,
    },
  ],

  boss_invisible_attack: [
    {
      id: 'b_invis_atk_1',
      category: 'boss',
      speaker: 'The Invisible Mosquito',
      speakerBangla: 'মায়াবী অদৃশ্য মশা',
      banglaText: 'এতক্ষণ কাকে মারতেছিলি, মানুষ?',
      pitch: 0.75,
      rate: 0.82,
      volume: 1.0,
      priority: 4,
      cooldown: 8,
    },
    {
      id: 'b_invis_atk_2',
      category: 'boss',
      speaker: 'The Invisible Mosquito',
      speakerBangla: 'মায়াবী অদৃশ্য মশা',
      banglaText: 'হাহাহা! তোর ভয়টাই আমার শক্তি!',
      pitch: 0.75,
      rate: 0.85,
      volume: 1.0,
      priority: 4,
      cooldown: 8,
    },
    {
      id: 'b_invis_atk_3',
      category: 'boss',
      speaker: 'The Invisible Mosquito',
      speakerBangla: 'মায়াবী অদৃশ্য মশা',
      banglaText: 'আমাকে খুঁজতে খুঁজতেই তোর শেষ!',
      pitch: 0.75,
      rate: 0.85,
      volume: 1.0,
      priority: 4,
      cooldown: 8,
    },
  ],

  boss_invisible_defeat: [
    {
      id: 'b_invis_def',
      category: 'boss',
      speaker: 'The Invisible Mosquito',
      speakerBangla: 'মায়াবী অদৃশ্য মশা',
      banglaText: 'রূপান্তরের রহস্য জেনেও তোরা টিকবি না...',
      pitch: 0.65,
      rate: 0.75,
      volume: 1.0,
      priority: 4,
    },
  ],

  signature_powercut_whisper: [
    {
      id: 'whisper_sig',
      category: 'whisper',
      speaker: 'The Mosquito Whisper (ভয়ানক মশার ফিসফিস)',
      speakerBangla: 'ভয়ানক মশার ফিসফিস',
      banglaText: 'ঘুমাইতে আইছস? আজকে ঘুমাইতে দিমু না!',
      pitch: 0.75,
      rate: 0.72,
      volume: 1.0,
      priority: 5,
      cooldown: 15,
    },
  ],

  env_neighbor_powercut: [
    {
      id: 'env_neighbor_1',
      category: 'environment',
      speaker: 'Distant Neighbor (প্রতিবেশী)',
      speakerBangla: 'প্রতিবেশী',
      banglaText: 'কারেন্ট কবে আসবে?! গরমের মধ্যে মশা খেয়ে ফেলল!',
      pitch: 1.0,
      rate: 1.1,
      volume: 0.7,
      priority: 1,
      cooldown: 25,
    },
  ],

  env_neighbor_infestation: [
    {
      id: 'env_neighbor_2',
      category: 'environment',
      speaker: 'Distant Person (রাস্তা থেকে)',
      speakerBangla: 'রাস্তা থেকে',
      banglaText: 'জানালা বন্ধ কর! মশার কয়েল আছে কারো কাছে?!',
      pitch: 0.95,
      rate: 1.15,
      volume: 0.7,
      priority: 1,
      cooldown: 25,
    },
  ],
};

export interface AudioDiagnosticState {
  playerDialogueTriggerStatus: string;
  selectedAudioFilename: string | null;
  audioLoadingStatus: 'idle' | 'loading' | 'loaded' | 'error';
  playbackStatus: 'idle' | 'playing' | 'ended' | 'error';
  audioContextState: string;
  playerVoiceVolume: number;
  playbackError: string | null;
  voicesCount: number;
  hasBengaliVoice: boolean;
  bengaliVoiceName: string | null;
  dialogueVolume: number;
  lastEvent: string | null;
  lastSpeaker: string | null;
  lastTextSpoken: string | null;
  lastEngineUsed: string;
  lastError: string | null;
  history: Array<{ time: string; event: string; speaker: string; file?: string; status: string }>;
}

declare global {
  interface Window {
    __AUDIO_DIAGNOSTICS__?: AudioDiagnosticState;
  }
}

class VoiceManager {
  private currentPriority: number = 0;
  private isSpeaking: boolean = false;
  private cooldowns: Map<string, number> = new Map();
  private subtitleCallback: ((line: VoiceLine | null) => void) | null = null;
  private volume: number = 1.0;
  private bengaliVoice: SpeechSynthesisVoice | null = null;
  private voicesLoaded: boolean = false;
  private voicesInitStarted: boolean = false;
  private subtitleClearTimeoutId: number | null = null;
  /** Guards against a stopped line's onended clearing the next line's subtitle. */
  private playbackGeneration: number = 0;
  /** Speech-synthesis fallback warm-up only needs to run once per session. */
  private speechWarmupDone: boolean = false;

  public diagnostics: AudioDiagnosticState = {
    playerDialogueTriggerStatus: 'idle',
    selectedAudioFilename: null,
    audioLoadingStatus: 'idle',
    playbackStatus: 'idle',
    audioContextState: 'uninitialized',
    playerVoiceVolume: 1.0,
    playbackError: null,
    voicesCount: 0,
    hasBengaliVoice: false,
    bengaliVoiceName: null,
    dialogueVolume: 1.0,
    lastEvent: null,
    lastSpeaker: null,
    lastTextSpoken: null,
    lastEngineUsed: 'native_bangla_audio_assets',
    lastError: null,
    history: [],
  };

  constructor() {
    this.initDiagnostics();
    this.initVoices();
  }

  private initDiagnostics() {
    if (typeof window !== 'undefined') {
      window.__AUDIO_DIAGNOSTICS__ = this.diagnostics;
    }
  }

  private updateDiagnostics(patch: Partial<AudioDiagnosticState>) {
    Object.assign(this.diagnostics, patch);
    if (typeof window !== 'undefined') {
      const ctx = soundManager.getContext();
      if (ctx) {
        this.diagnostics.audioContextState = ctx.state;
      }
      window.__AUDIO_DIAGNOSTICS__ = this.diagnostics;
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.voicesInitStarted) return;
    this.voicesInitStarted = true;

    const loadVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          this.voicesLoaded = true;

          // Search strictly for authentic native Bengali voices
          const bnVoice =
            voices.find((v) => v.lang === 'bn-BD' || v.lang.startsWith('bn_BD')) ||
            voices.find((v) => v.lang === 'bn-IN' || v.lang.startsWith('bn_IN')) ||
            voices.find((v) => v.lang.startsWith('bn')) ||
            voices.find((v) => v.name.toLowerCase().includes('bangla') || v.name.toLowerCase().includes('bengali'));

          if (bnVoice) {
            this.bengaliVoice = bnVoice;
          }

          this.updateDiagnostics({
            voicesCount: voices.length,
            hasBengaliVoice: !!this.bengaliVoice,
            bengaliVoiceName: this.bengaliVoice?.name || null,
          });

          console.log(
            `[AudioDiag] Bangla voices loaded: ${voices.length} detected. Bengali Voice: ${
              this.bengaliVoice?.name || 'Formant Bengali Engine Active'
            }`
          );
        }
      } catch (err) {
        console.warn('[AudioDiag] Error querying voices:', err);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    setTimeout(loadVoices, 300);
    setTimeout(loadVoices, 1000);
    setTimeout(loadVoices, 2500);
  }

  /**
   * Unlock speech and audio systems on legitimate user interaction
   */
  public unlock() {
    soundManager.unlock();

    if (!this.voicesLoaded) {
      this.initVoices();
    }

    if (
      !this.speechWarmupDone &&
      typeof window !== 'undefined' &&
      'speechSynthesis' in window
    ) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        // Micro-utterance warm-up. Kept silent and run once; the real dialogue is
        // always the recorded Bangla MP3, never this fallback engine.
        const warmup = new SpeechSynthesisUtterance('');
        warmup.volume = 0;
        window.speechSynthesis.speak(warmup);
        this.speechWarmupDone = true;
      } catch {
        // Ignored
      }
    }

    this.updateDiagnostics({
      dialogueVolume: this.volume,
    });
  }

  public setSubtitleCallback(cb: (line: VoiceLine | null) => void) {
    this.subtitleCallback = cb;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.updateDiagnostics({ dialogueVolume: this.volume });
  }

  public getDiagnostics(): AudioDiagnosticState {
    return {
      ...this.diagnostics,
      audioContextState: soundManager.getAudioContextState(),
      playerVoiceVolume: this.volume * soundManager.getVoiceVolume(),
    };
  }

  /**
   * Trigger a voice event with priority resolution and cooldown prevention
   */
  public triggerEvent(trigger: VoiceEventTrigger, force: boolean = false): boolean {
    const list = VOICE_DATABASE[trigger];
    if (!list || list.length === 0) return false;

    // Pick random variation
    const line = list[Math.floor(Math.random() * list.length)];

    // Check cooldown
    const now = Date.now();
    const lastPlayed = this.cooldowns.get(line.id) || 0;
    const cd = (line.cooldown || 2) * 1000;
    if (!force && now - lastPlayed < cd) {
      return false;
    }

    // Check priority: Higher priority can interrupt lower priority
    if (this.isSpeaking && !force) {
      if (line.priority < this.currentPriority) {
        return false;
      }
    }

    this.cooldowns.set(line.id, now);
    this.speakLine(line);
    return true;
  }

  /**
   * Directly speak a VoiceLine using authentic Bangla audio assets and synchronize subtitles
   */
  public speakLine(line: VoiceLine) {
    if (typeof window === 'undefined') return;

    this.unlock();
    this.playbackGeneration += 1;
    const generation = this.playbackGeneration;

    // 1. Immediately notify subtitle component with authentic Bangla text
    if (this.subtitleClearTimeoutId) {
      clearTimeout(this.subtitleClearTimeoutId);
      this.subtitleClearTimeoutId = null;
    }
    if (this.subtitleCallback) {
      this.subtitleCallback(line);
    }

    this.isSpeaking = true;
    this.currentPriority = line.priority;

    const audioUrl = `/audio/voices/${line.id}.mp3`;

    this.updateDiagnostics({
      playerDialogueTriggerStatus: `Triggered (${line.id})`,
      selectedAudioFilename: audioUrl,
      audioLoadingStatus: 'loading',
      playbackStatus: 'playing',
      audioContextState: soundManager.getAudioContextState(),
      playerVoiceVolume: this.volume * soundManager.getVoiceVolume(),
      lastEvent: line.id,
      lastSpeaker: line.speakerBangla,
      lastTextSpoken: line.banglaText,
      lastEngineUsed: 'native_bangla_audio_assets',
      lastError: null,
      history: [
        {
          time: new Date().toLocaleTimeString(),
          event: line.id,
          speaker: line.speakerBangla,
          file: audioUrl,
          status: 'playing',
        },
        ...this.diagnostics.history.slice(0, 19),
      ],
    });

    console.log(`[AudioDiag] Playing Bangla voice [${line.speakerBangla}]: "${line.banglaText}" (${audioUrl})`);

    // 2. Play the native, pristine Bangla audio file through Web Audio / HTML5 Audio
    soundManager.playVoiceAudio(audioUrl, line.volume * this.volume, () => {
      // Ignore stale callbacks from a line that was interrupted.
      if (generation !== this.playbackGeneration) return;

      this.isSpeaking = false;
      this.currentPriority = 0;
      this.updateDiagnostics({
        playbackStatus: 'ended',
      });

      this.subtitleClearTimeoutId = window.setTimeout(() => {
        if (generation === this.playbackGeneration && !this.isSpeaking && this.subtitleCallback) {
          this.subtitleCallback(null);
        }
      }, 700);
    }).then((res) => {
      if (!res.success && res.error) {
        this.updateDiagnostics({
          audioLoadingStatus: 'error',
          playbackStatus: 'error',
          playbackError: res.error,
          lastError: res.error,
        });
      } else {
        this.updateDiagnostics({
          audioLoadingStatus: 'loaded',
        });
      }
    });
  }

  public stop() {
    this.playbackGeneration += 1;
    if (this.subtitleClearTimeoutId) {
      clearTimeout(this.subtitleClearTimeoutId);
      this.subtitleClearTimeoutId = null;
    }
    soundManager.stopVoiceAudio();
    this.isSpeaking = false;
    this.currentPriority = 0;
    this.updateDiagnostics({
      playbackStatus: 'idle',
    });
    if (this.subtitleCallback) {
      this.subtitleCallback(null);
    }
  }
}

export const voiceManager = new VoiceManager();
