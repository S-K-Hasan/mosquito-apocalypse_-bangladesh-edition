const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const OUTPUT_DIR = path.resolve(__dirname, '../public/audio/voices');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Full database of voice lines to generate
const VOICE_LINES = [
  // 1. Signature player dialogue
  { id: 'p_sig_1', category: 'player', banglaText: 'ধুর শালার বেটা মশা, তোরে আমি খাইসি!' },
  
  // 2. Signature mosquito dialogue (CRITICAL TEST)
  { id: 'm_sig_2', category: 'mosquito', banglaText: 'মামুর বেটা পারলে আজকে ঘুমা!' },
  { id: 'm_taunt_sig', category: 'mosquito', banglaText: 'মামুর বেটা পারলে আজকে ঘুমা!' },

  // Player attack & miss lines
  { id: 'p_atk_sig', category: 'player', banglaText: 'ধুর শালার বেটা মশা, তোরে আমি খাইসি!' },
  { id: 'p_atk_1', category: 'player', banglaText: 'এই ব্যাটা, দাঁড়া! আজকে তোর খবর আছে!' },
  { id: 'p_atk_2', category: 'player', banglaText: 'ধুর! আবার কামড় দিল!' },
  { id: 'p_atk_3', category: 'player', banglaText: 'আয় শালা, সামনে আয়!' },
  { id: 'p_atk_4', category: 'player', banglaText: 'একটা মশাও বাঁচতে পারবি না!' },
  { id: 'p_atk_5', category: 'player', banglaText: 'আমার ঘুমটা শেষ কইরা দিলি!' },
  { id: 'p_atk_6', category: 'player', banglaText: 'তোরে আজকে ছাড়তেছি না!' },
  { id: 'p_atk_7', category: 'player', banglaText: 'র‍্যাকেটের বাড়ি খাইয়া এবার বুঝবি!' },

  { id: 'p_miss_1', category: 'player', banglaText: 'আরে ধুর! লাগল না কেন?' },
  { id: 'p_miss_2', category: 'player', banglaText: 'এইটা আবার কই গেল?' },
  { id: 'p_miss_3', category: 'player', banglaText: 'চোখের সামনে আছিল, হাওয়ায় মিলায় গেল!' },
  { id: 'p_miss_4', category: 'player', banglaText: 'শালা, দাঁড়া! এবার দেখাচ্ছি!' },

  // Player damage
  { id: 'p_dmg_1', category: 'player', banglaText: 'ওই! কামড় দিলি কই?' },
  { id: 'p_dmg_2', category: 'player', banglaText: 'আহ! এই ব্যাটা তো আসলেই বিপদ!' },
  { id: 'p_dmg_3', category: 'player', banglaText: 'আরেকটু হইলেই শেষ আছিলাম!' },
  { id: 'p_dmg_4', category: 'player', banglaText: 'আল্লাহ, এত মশা! ভাই আর কামড়াইস না!' },

  // Player low health
  { id: 'p_low_1', category: 'player', banglaText: 'ওরে বাবা! আরেকটু হইলেই শেষ!' },
  { id: 'p_low_2', category: 'player', banglaText: 'এইভাবে চললে তো আমিই মশার খাবার হমু!' },
  { id: 'p_low_3', category: 'player', banglaText: 'কেউ নাই? বাঁচাও ভাই!' },

  // Player items found
  { id: 'p_item_1', category: 'player', banglaText: 'আহা! এইবার কিছু একটা কাজে লাগবে!' },
  { id: 'p_item_2', category: 'player', banglaText: 'যাক বাবা, অবশেষে কিছু একটা পাইলাম!' },
  { id: 'p_item_3', category: 'player', banglaText: 'এইটাই তো দরকার আছিল!' },

  // Player boss defeat
  { id: 'p_bdef_1', category: 'player', banglaText: 'কী রে? এতক্ষণ এত ভাব দেখাচ্ছিলি!' },
  { id: 'p_bdef_2', category: 'player', banglaText: 'যা, এবার আর কারও রক্ত খাইতে পারবি না!' },
  { id: 'p_bdef_3', category: 'player', banglaText: 'শেষ! তোর রাজত্ব শেষ!' },

  // Player kill
  { id: 'p_k_sig', category: 'player', banglaText: 'ধুর শালার বেটা মশা, তোরে আমি খাইসি!' },
  { id: 'p_k_1', category: 'player', banglaText: 'হ্যাঁ! এবার বুঝলি?!' },
  { id: 'p_k_2', category: 'player', banglaText: 'এই মশার বাচ্চা!' },
  { id: 'p_k_3', category: 'player', banglaText: 'আজকে তোকে শেষ করেই ছাড়ব!' },

  // Player special encounters
  { id: 'p_giant', category: 'player', banglaText: 'ও মাগো! এইটা আবার কী?! এত বড় মশা জীবনে দেখি নাই!' },
  { id: 'p_w_racket', category: 'player', banglaText: 'এইবার ইলেকট্রিক শক খা!' },
  { id: 'p_w_paper', category: 'player', banglaText: 'এই নে খবরের কাগজ! দৈনিক ইত্তেফাকের বাড়ি খা!' },
  { id: 'p_w_coil', category: 'player', banglaText: 'এবার ঈগল কয়েলের ধোঁয়ায় মর!' },
  { id: 'p_w_fan', category: 'player', banglaText: 'যা! বাতাস খা!' },
  { id: 'p_w_spray', category: 'player', banglaText: 'এইবার হিট স্প্রে খা!' },
  { id: 'p_empty', category: 'player', banglaText: 'ধুর! স্প্রে আর কয়েল সব শেষ!' },
  { id: 'p_pcut_1', category: 'player', banglaText: 'আবার কারেন্ট গেল?! মশার কয়েল কোথায়?!' },
  { id: 'p_pcut_2', category: 'player', banglaText: 'এখনই কারেন্ট যেতে হলো?! ভাই কেউ একজন লাইট জ্বালাও!' },
  { id: 'p_vic', category: 'player', banglaText: 'যাক! শেষ পর্যন্ত বেঁচে গেলাম!' },

  // FINAL LEVEL 6 CLIMACTIC VICTORY LINES
  { id: 'p_vic_final', category: 'player', banglaText: 'এত কষ্ট করার পর এখন যদি একটা মশাও কামড় দেয়, আমি কিন্তু দেশ ছাইড়া চলে যামু!' },
  { id: 'm_vic_joke', category: 'mosquito', banglaText: 'মামা... একটু রক্ত দিয়া যান না!' },
  { id: 'p_death', category: 'player', banglaText: 'সব রক্ত চুষে নিয়ে গেল রে...' },

  // Normal mosquitoes
  { id: 'm_norm_1', category: 'mosquito', banglaText: 'কী হইল মামা? ধরতে পারলি না?' },
  { id: 'm_norm_2', category: 'mosquito', banglaText: 'তোর র‍্যাকেট দেইখা ভয় পাইছি নাকি?' },
  { id: 'm_norm_3', category: 'mosquito', banglaText: 'আজকে তোর ঘুম হারাম!' },
  { id: 'm_norm_4', category: 'mosquito', banglaText: 'আয় আয়, আরেকটু কাছে আয়!' },
  { id: 'm_norm_5', category: 'mosquito', banglaText: 'হাহাহা! মিস করছস আবার!' },
  { id: 'm_norm_6', category: 'mosquito', banglaText: 'এই বাসায় আজকে আমরাই মালিক!' },
  { id: 'm_norm_7', category: 'mosquito', banglaText: 'তোর রক্ত কিন্তু অনেক মিষ্টি!' },
  { id: 'm_norm_8', category: 'mosquito', banglaText: 'ধরতে পারবি না রে! ইহিহিহি!' },

  // Giant mosquito
  { id: 'm_giant_1', category: 'giant', banglaText: 'মানুষ! তোর শেষ সময় ঘনাইয়া আসছে!' },
  { id: 'm_giant_2', category: 'giant', banglaText: 'এই ঘর এখন আমার রাজত্ব!' },
  { id: 'm_giant_3', category: 'giant', banglaText: 'তোর ওই ছোট্ট র‍্যাকেট দিয়া আমার কী করবি?' },
  { id: 'm_giant_4', category: 'giant', banglaText: 'আজকে তোর ঘুমের বারোটা বাজামু!' },
  { id: 'm_giant_5', category: 'giant', banglaText: 'এইবার পালানোর রাস্তা বন্ধ!' },

  // Stealth & Swarm
  { id: 'm_stealth_1', category: 'stealth', banglaText: 'পিছনে তাকাও...' },
  { id: 'm_stealth_2', category: 'stealth', banglaText: 'খুঁজে দেখ... যদি পারিস!' },
  { id: 'm_swarm_1', category: 'mosquito', banglaText: 'আমরা অনেক! ঘিরে ফেল!' },
  { id: 'm_swarm_2', category: 'mosquito', banglaText: 'রক্ত দে! ব্লাড দে!' },

  // Boss Dengue King
  { id: 'b_dengue_intro', category: 'boss_dengue', banglaText: 'হাহাহা! আমার রাজ্যে স্বাগতম, মানুষ!' },
  { id: 'b_dengue_atk_1', category: 'boss_dengue', banglaText: 'তোর রক্ত দিয়াই আমার সাম্রাজ্য চলবে!' },
  { id: 'b_dengue_atk_2', category: 'boss_dengue', banglaText: 'আমার সৈন্যদের পার হইয়া আমার কাছে আইছস? সাহস তো কম না!' },
  { id: 'b_dengue_atk_3', category: 'boss_dengue', banglaText: 'তুই ভাবছিস আমাকে হারানো এত সহজ?' },
  { id: 'b_dengue_rage', category: 'boss_dengue', banglaText: 'আমার ক্রোধের সামনে কেউ বাঁচবে না!' },
  { id: 'b_dengue_def', category: 'boss_dengue', banglaText: 'না! আমার রাজ্য ধ্বংস হয়ে গেল...' },

  // Boss Midnight Mosquito
  { id: 'b_mid_intro', category: 'boss_mid', banglaText: 'অন্ধকারে কাউরে বিশ্বাস করা যায় না, মানুষ...' },
  { id: 'b_mid_atk_1', category: 'boss_mid', banglaText: 'শুনতে পাচ্ছিস? আমি তোর একদম কাছেই আছি!' },
  { id: 'b_mid_atk_2', category: 'boss_mid', banglaText: 'খুঁজে দেখ... যদি পারিস!' },
  { id: 'b_mid_atk_3', category: 'boss_mid', banglaText: 'আলো নিভলেই আমার খেলা শুরু!' },
  { id: 'b_mid_def', category: 'boss_mid', banglaText: 'অন্ধকারের আলোতে আমি বিলীন হলাম...' },

  // Boss Invisible Apex
  { id: 'b_invis_intro', category: 'boss_invis', banglaText: 'আমি আছি... কিন্তু তুই দেখতে পারবি না!' },
  { id: 'b_invis_atk_1', category: 'boss_invis', banglaText: 'এতক্ষণ কাকে মারতেছিলি, মানুষ?' },
  { id: 'b_invis_atk_2', category: 'boss_invis', banglaText: 'হাহাহা! তোর ভয়টাই আমার শক্তি!' },
  { id: 'b_invis_atk_3', category: 'boss_invis', banglaText: 'আমাকে খুঁজতে খুঁজতেই তোর শেষ!' },
  { id: 'b_invis_def', category: 'boss_invis', banglaText: 'রূপান্তরের রহস্য জেনেও তোরা টিকবি না...' },

  // Whisper & Environment
  { id: 'whisper_sig', category: 'whisper', banglaText: 'ঘুমাইতে আইছস? আজকে ঘুমাইতে দিমু না!' },
  { id: 'env_neighbor_1', category: 'environment', banglaText: 'কারেন্ট কবে আসবে?! গরমের মধ্যে মশা খেয়ে ফেলল!' },
  { id: 'env_neighbor_2', category: 'environment', banglaText: 'জানালা বন্ধ কর! মশার কয়েল আছে কারো কাছে?!' },
];

function downloadRawTts(text, tempFile) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(text);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=bn&client=tw-ob`;
    const file = fs.createWriteStream(tempFile);
    
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(tempFile);
        return reject(new Error(`HTTP ${res.statusCode} for "${text}"`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      reject(err);
    });
  });
}

function processWithFfmpeg(tempFile, targetFile, category) {
  let filter = 'volume=1.2';

  if (category === 'player') {
    // Young Bangladeshi male: crisp, clear presence, punchy conversational dynamics
    filter = 'volume=1.3,equalizer=f=3000:t=q:w=1.5:g=2.5,compand=0.02:0.05:-60/-60|-24/-24|0/-6:6:0:-60:0.02';
  } else if (category === 'mosquito') {
    // Comic high pitch, preserving exact speed and natural Bangla syllable separation
    filter = 'rubberband=pitch=1.22,equalizer=f=4000:t=q:w=1.2:g=2.0,volume=1.15';
  } else if (category === 'giant') {
    // Deep, intimidating, booming giant mosquito
    filter = 'rubberband=pitch=0.82,equalizer=f=140:t=q:w=1.2:g=5.0,volume=1.4';
  } else if (category === 'stealth') {
    // Airy, quiet, flanking mosquito
    filter = 'rubberband=pitch=1.10,highpass=f=250,volume=1.2';
  } else if (category === 'boss_dengue') {
    // Dengue King: regal, sinister monarch with subtle hall reverb
    filter = 'rubberband=pitch=0.86,aecho=0.8:0.7:25:0.3,volume=1.35';
  } else if (category === 'boss_mid') {
    // Midnight Dracula: dark shadow teleporter with subtle supernatural flanger
    filter = 'rubberband=pitch=0.92,flanger=delay=1.5:depth=2:regen=20:width=71:speed=0.5,volume=1.3';
  } else if (category === 'boss_invis') {
    // Invisible Apex: eerie alien mutant resonance
    filter = 'rubberband=pitch=0.84,aecho=0.8:0.6:40:0.35,volume=1.35';
  } else if (category === 'whisper') {
    // Eerie horror whisper
    filter = 'highpass=f=350,lowpass=f=4200,volume=1.3';
  } else if (category === 'environment') {
    filter = 'lowpass=f=3400,volume=0.95';
  }

  const cmd = `ffmpeg -y -i "${tempFile}" -af "${filter}" "${targetFile}" 2>&1`;
  execSync(cmd);
}

async function run() {
  console.log(`Starting generation of ${VOICE_LINES.length} authentic Bangla voice assets...`);
  const tempDir = path.resolve(__dirname, '../temp_voices');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  let successCount = 0;
  for (let i = 0; i < VOICE_LINES.length; i++) {
    const item = VOICE_LINES[i];
    const tempFile = path.join(tempDir, `raw_${item.id}.mp3`);
    const targetFile = path.join(OUTPUT_DIR, `${item.id}.mp3`);

    try {
      await downloadRawTts(item.banglaText, tempFile);
      processWithFfmpeg(tempFile, targetFile, item.category);
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      console.log(`[${i + 1}/${VOICE_LINES.length}] OK: ${item.id} -> "${item.banglaText}"`);
      successCount++;
    } catch (err) {
      console.error(`FAILED: ${item.id} (${item.banglaText})`, err.message);
    }

    // Small delay to be polite to the endpoint
    await new Promise((r) => setTimeout(r, 120));
  }

  if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
  console.log(`\nCOMPLETED! Generated ${successCount}/${VOICE_LINES.length} clear Bangla voice files in ${OUTPUT_DIR}`);
}

run();
