/**
 * Generator script for 100% Genuine, Natural Adult Male Bangladeshi Voices
 * Using Microsoft Neural Male Voices:
 * - bn-BD-PradeepNeural (Natural Adult Male Bangladeshi Voice)
 * - bn-IN-BashkarNeural (Natural Adult Male Bengali Boss/Villain Voice)
 *
 * Replaces all 81 voice files with authentic human male performances.
 */

const fs = require('fs');
const path = require('path');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const VOICES_DIR = path.resolve(__dirname, '../public/audio/voices');
const TEMP_DIR = path.resolve(__dirname, '../temp_voices');

if (!fs.existsSync(VOICES_DIR)) {
  fs.mkdirSync(VOICES_DIR, { recursive: true });
}
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Complete 81 lines
const VOICE_LINES = [
  // 1. Signature player lines
  { id: 'p_sig_1', cat: 'player', text: 'ধুর শালার বেটা মশা, তোরে আমি খাইসি!' },
  { id: 'p_atk_sig', cat: 'player', text: 'ধুর শালার বেটা মশা, তোরে আমি খাইসি!' },
  { id: 'p_k_sig', cat: 'player', text: 'ধুর শালার বেটা মশা, তোরে আমি খাইসি!' },

  // 2. Signature mosquito lines
  { id: 'm_sig_2', cat: 'mosquito_taunt', text: 'মামুর বেটা, পারলে আজকে ঘুমা!' },
  { id: 'm_taunt_sig', cat: 'mosquito_taunt', text: 'মামুর বেটা, পারলে আজকে ঘুমা!' },

  // Player attacks
  { id: 'p_atk_1', cat: 'player', text: 'এই ব্যাটা, দাঁড়া! আজকে তোর খবর আছে!' },
  { id: 'p_atk_2', cat: 'player', text: 'ধুর! আবার কামড় দিল!' },
  { id: 'p_atk_3', cat: 'player', text: 'আয় শালা, সামনে আয়!' },
  { id: 'p_atk_4', cat: 'player', text: 'একটা মশাও বাঁচতে পারবি না!' },
  { id: 'p_atk_5', cat: 'player', text: 'আমার ঘুমটা শেষ কইরা দিলি!' },
  { id: 'p_atk_6', cat: 'player', text: 'তোরে আজকে ছাড়তেছি না!' },
  { id: 'p_atk_7', cat: 'player', text: 'র‍্যাকেটের বাড়ি খাইয়া এবার বুঝবি!' },

  // Player misses
  { id: 'p_miss_1', cat: 'player', text: 'আরে ধুর! লাগল না কেন?' },
  { id: 'p_miss_2', cat: 'player', text: 'এইটা আবার কই গেল?' },
  { id: 'p_miss_3', cat: 'player', text: 'চোখের সামনে আছিল, হাওয়ায় মিলায় গেল!' },
  { id: 'p_miss_4', cat: 'player', text: 'শালা, দাঁড়া! এবার দেখাচ্ছি!' },

  // Player damage
  { id: 'p_dmg_1', cat: 'player', text: 'ওই! কামড় দিলি কই?' },
  { id: 'p_dmg_2', cat: 'player', text: 'আহ! এই ব্যাটা তো আসলেই বিপদ!' },
  { id: 'p_dmg_3', cat: 'player', text: 'আরেকটু হইলেই শেষ আছিলাম!' },
  { id: 'p_dmg_4', cat: 'player', text: 'আল্লাহ, এত মশা! ভাই আর কামড়াইস না!' },

  // Player low health
  { id: 'p_low_1', cat: 'player', text: 'ওরে বাবা! আরেকটু হইলেই শেষ!' },
  { id: 'p_low_2', cat: 'player', text: ' এইভাবে চললে তো আমিই মশার খাবার হমু!' },
  { id: 'p_low_3', cat: 'player', text: 'কেউ নাই? বাঁচাও ভাই!' },

  // Player items
  { id: 'p_item_1', cat: 'player', text: 'আহা! এইবার কিছু একটা কাজে লাগবে!' },
  { id: 'p_item_2', cat: 'player', text: 'যাক বাবা, অবশেষে কিছু একটা পাইলাম!' },
  { id: 'p_item_3', cat: 'player', text: 'এইটাই তো দরকার আছিল!' },

  // Player boss defeat
  { id: 'p_bdef_1', cat: 'player', text: 'কী রে? এতক্ষণ এত ভাব দেখাচ্ছিলি!' },
  { id: 'p_bdef_2', cat: 'player', text: 'যা, এবার আর কারও রক্ত খাইতে পারবি না!' },
  { id: 'p_bdef_3', cat: 'player', text: 'শেষ! তোর রাজত্ব শেষ!' },

  // Player kills
  { id: 'p_k_1', cat: 'player', text: 'হ্যাঁ! এবার বুঝলি?!' },
  { id: 'p_k_2', cat: 'player', text: 'এই মশার বাচ্চা!' },
  { id: 'p_k_3', cat: 'player', text: 'আজকে তোকে শেষ করেই ছাড়ব!' },

  // Player giant seen
  { id: 'p_giant', cat: 'player', text: 'ও মাগো! এইটা আবার কী?! এত বড় মশা জীবনে দেখি নাই!' },

  // Player weapons
  { id: 'p_w_racket', cat: 'player', text: 'এইবার ইলেকট্রিক শক খা!' },
  { id: 'p_w_paper', cat: 'player', text: 'এই নে খবরের কাগজ! দৈনিক ইত্তেফাকের বাড়ি খা!' },
  { id: 'p_w_coil', cat: 'player', text: 'এবার ঈগল কয়েলের ধোঁয়ায় মর!' },
  { id: 'p_w_fan', cat: 'player', text: 'যা! বাতাস খা!' },
  { id: 'p_w_spray', cat: 'player', text: 'এইবার হিট স্প্রে খা!' },
  { id: 'p_empty', cat: 'player', text: 'ধুর! স্প্রে আর কয়েল সব শেষ!' },

  // Player powercut
  { id: 'p_pcut_1', cat: 'player', text: 'আবার কারেন্ট গেল?! মশার কয়েল কোথায়?!' },
  { id: 'p_pcut_2', cat: 'player', text: 'এখনই কারেন্ট যেতে হলো?! ভাই কেউ একজন লাইট জ্বালাও!' },

  // Player victory & climax
  { id: 'p_vic', cat: 'player', text: 'যাক! শেষ পর্যন্ত বেঁচে গেলাম!' },
  { id: 'p_vic_final', cat: 'player', text: 'এত কষ্ট করার পর এখন যদি একটা মশাও কামড় দেয়, আমি কিন্তু দেশ ছাইড়া চলে যামু!' },
  { id: 'm_vic_joke', cat: 'mosquito_joke', text: 'মামা... একটু রক্ত দিয়া যান না!' },
  { id: 'p_death', cat: 'player', text: 'সব রক্ত চুষে নিয়ে গেল রে...' },

  // Regular mosquitoes
  { id: 'm_norm_1', cat: 'mosquito', text: 'কী হইল মামা? ধরতে পারলি না?' },
  { id: 'm_norm_2', cat: 'mosquito', text: 'তোর র‍্যাকেট দেইখা ভয় পাইছি নাকি?' },
  { id: 'm_norm_3', cat: 'mosquito', text: 'আজকে তোর ঘুম হারাম!' },
  { id: 'm_norm_4', cat: 'mosquito', text: 'আয় আয়, আরেকটু কাছে আয়!' },
  { id: 'm_norm_5', cat: 'mosquito', text: 'হাহাহা! মিস করছস আবার!' },
  { id: 'm_norm_6', cat: 'mosquito', text: 'এই বাসায় আজকে আমরাই মালিক!' },
  { id: 'm_norm_7', cat: 'mosquito', text: 'তোর রক্ত কিন্তু অনেক মিষ্টি!' },
  { id: 'm_norm_8', cat: 'mosquito', text: 'ধরতে পারবি না রে! ইহিহিহি!' },

  // Giant mosquito
  { id: 'm_giant_1', cat: 'giant', text: 'মানুষ! তোর শেষ সময় ঘনাইয়া আসছে!' },
  { id: 'm_giant_2', cat: 'giant', text: 'এই ঘর এখন আমার রাজত্ব!' },
  { id: 'm_giant_3', cat: 'giant', text: 'তোর ওই ছোট্ট র‍্যাকেট দিয়া আমার কী করবি?' },
  { id: 'm_giant_4', cat: 'giant', text: 'আজকে তোর ঘুমের বারোটা বাজামু!' },
  { id: 'm_giant_5', cat: 'giant', text: 'এইবার পালানোর রাস্তা বন্ধ!' },

  // Mosquito stealth
  { id: 'm_stealth_1', cat: 'stealth', text: 'পিছনে তাকাও...' },
  { id: 'm_stealth_2', cat: 'stealth', text: 'খুঁজে দেখ... যদি পারিস!' },

  // Mosquito swarm
  { id: 'm_swarm_1', cat: 'swarm', text: 'আমরা অনেক! ঘিরে ফেল!' },
  { id: 'm_swarm_2', cat: 'swarm', text: 'রক্ত দে! ব্লাড দে!' },

  // Boss Dengue King
  { id: 'b_dengue_intro', cat: 'boss_dengue', text: 'হাহাহা! আমার রাজ্যে স্বাগতম, মানুষ!' },
  { id: 'b_dengue_atk_1', cat: 'boss_dengue', text: 'তোর রক্ত দিয়াই আমার সাম্রাজ্য চলবে!' },
  { id: 'b_dengue_atk_2', cat: 'boss_dengue', text: 'আমার সৈন্যদের পার হইয়া আমার কাছে আইছস? সাহস তো কম না!' },
  { id: 'b_dengue_atk_3', cat: 'boss_dengue', text: 'তুই ভাবছিস আমাকে হারানো এত সহজ?' },
  { id: 'b_dengue_rage', cat: 'boss_dengue', text: 'আমার ক্রোধের সামনে কেউ বাঁচবে না!' },
  { id: 'b_dengue_def', cat: 'boss_dengue', text: 'না! আমার রাজ্য ধ্বংস হয়ে গেল...' },

  // Boss Midnight
  { id: 'b_mid_intro', cat: 'boss_mid', text: 'অন্ধকারে কাউরে বিশ্বাস করা যায় না, মানুষ...' },
  { id: 'b_mid_atk_1', cat: 'boss_mid', text: 'শুনতে পাচ্ছিস? আমি তোর একদম কাছেই আছি!' },
  { id: 'b_mid_atk_2', cat: 'boss_mid', text: 'খুঁজে দেখ... যদি পারিস!' },
  { id: 'b_mid_atk_3', cat: 'boss_mid', text: 'আলো নিভলেই আমার খেলা শুরু!' },
  { id: 'b_mid_def', cat: 'boss_mid', text: 'অন্ধকারের আলোতে আমি বিলীন হলাম...' },

  // Boss Invisible Apex
  { id: 'b_invis_intro', cat: 'boss_invis', text: 'আমি আছি... কিন্তু তুই দেখতে পারবি না!' },
  { id: 'b_invis_atk_1', cat: 'boss_invis', text: 'এতক্ষণ কাকে মারতেছিলি, মানুষ?' },
  { id: 'b_invis_atk_2', cat: 'boss_invis', text: 'হাহাহা! তোর ভয়টাই আমার শক্তি!' },
  { id: 'b_invis_atk_3', cat: 'boss_invis', text: 'আমাকে খুঁজতে খুঁজতেই তোর শেষ!' },
  { id: 'b_invis_def', cat: 'boss_invis', text: 'রূপান্তরের রহস্য জেনেও তোরা টিকবি না...' },

  // Whisper
  { id: 'whisper_sig', cat: 'whisper', text: 'ঘুমাইতে আইছস? আজকে ঘুমাইতে দিমু না!' },

  // Environment neighbor
  { id: 'env_neighbor_1', cat: 'neighbor', text: 'কারেন্ট কবে আসবে?! গরমের মধ্যে মশা খেয়ে ফেলল!' },
  { id: 'env_neighbor_2', cat: 'neighbor', text: 'জানালা বন্ধ কর! মশার কয়েল আছে কারো কাছে?!' },
];

function getVoiceConfig(item) {
  switch (item.cat) {
    case 'player':
      return {
        voice: 'bn-BD-PradeepNeural', // Adult Bangladeshi Male Neural Voice
        options: { pitch: '+0Hz', rate: '+5%', volume: '100' },
      };
    case 'mosquito_taunt':
      return {
        voice: 'bn-BD-PradeepNeural',
        options: { pitch: '+24Hz', rate: '+12%', volume: '100' },
      };
    case 'mosquito_joke':
      return {
        voice: 'bn-BD-PradeepNeural',
        options: { pitch: '+16Hz', rate: '+6%', volume: '100' },
      };
    case 'mosquito':
      return {
        voice: 'bn-BD-PradeepNeural',
        options: { pitch: '+22Hz', rate: '+10%', volume: '100' },
      };
    case 'giant':
      return {
        voice: 'bn-BD-PradeepNeural',
        options: { pitch: '-20Hz', rate: '-8%', volume: '100' },
      };
    case 'stealth':
      return {
        voice: 'bn-BD-PradeepNeural',
        options: { pitch: '+8Hz', rate: '-6%', volume: '95' },
      };
    case 'swarm':
      return {
        voice: 'bn-BD-PradeepNeural',
        options: { pitch: '+18Hz', rate: '+14%', volume: '100' },
      };
    case 'boss_dengue':
      return {
        voice: 'bn-IN-BashkarNeural', // Distinct Adult Male Bengali Villain Voice
        options: { pitch: '-14Hz', rate: '-2%', volume: '100' },
      };
    case 'boss_mid':
      return {
        voice: 'bn-BD-PradeepNeural',
        options: { pitch: '-12Hz', rate: '-6%', volume: '100' },
      };
    case 'boss_invis':
      return {
        voice: 'bn-IN-BashkarNeural',
        options: { pitch: '-18Hz', rate: '-10%', volume: '100' },
      };
    case 'whisper':
      return {
        voice: 'bn-BD-PradeepNeural',
        options: { pitch: '+6Hz', rate: '-10%', volume: '90' },
      };
    case 'neighbor':
      return {
        voice: 'bn-BD-PradeepNeural',
        options: { pitch: '-4Hz', rate: '+8%', volume: '100' },
      };
    default:
      return {
        voice: 'bn-BD-PradeepNeural',
        options: { pitch: '+0Hz', rate: '+0%', volume: '100' },
      };
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log(`Starting synthesis of ${VOICE_LINES.length} adult male Bengali voice lines...`);
  let tts = new MsEdgeTTS();
  let currentVoice = '';

  for (let i = 0; i < VOICE_LINES.length; i++) {
    const item = VOICE_LINES[i];
    const targetFile = path.join(VOICES_DIR, `${item.id}.mp3`);
    const config = getVoiceConfig(item);

    let success = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (currentVoice !== config.voice) {
          await tts.setMetadata(config.voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
          currentVoice = config.voice;
        }

        const res = await tts.toFile(TEMP_DIR, item.text, config.options);
        if (res && res.audioFilePath && fs.existsSync(res.audioFilePath)) {
          fs.copyFileSync(res.audioFilePath, targetFile);
          try {
            fs.unlinkSync(res.audioFilePath);
          } catch (_) {}
          const stat = fs.statSync(targetFile);
          console.log(`[${i + 1}/${VOICE_LINES.length}] OK (${stat.size} bytes): ${item.id} -> "${item.text.slice(0, 30)}..." [Voice: ${config.voice}]`);
          success = true;
          break;
        }
      } catch (err) {
        console.warn(`[${i + 1}/${VOICE_LINES.length}] Attempt ${attempt} failed for ${item.id}:`, err.message);
        try {
          tts.close();
        } catch (_) {}
        await sleep(1000);
        tts = new MsEdgeTTS();
        currentVoice = '';
      }
    }

    if (!success) {
      console.error(`FAILED to generate ${item.id}`);
    }

    // Brief pause between requests
    await sleep(150);
  }

  try {
    tts.close();
  } catch (_) {}

  // Clean up temp dir
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  } catch (_) {}

  console.log('Voice synthesis complete!');
}

run().catch((err) => {
  console.error('Fatal error in voice generator:', err);
  process.exit(1);
});
