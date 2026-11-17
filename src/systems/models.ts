import * as THREE from 'three';
import { WeaponType, EnemyType } from '../types/game';
import { ART_COLORS, ArtMaterials } from './artSystem';
import {
  createDengueKingModel,
  createInvisibleApexModel,
  createMidnightMosquitoModel,
} from './bossModels';

// Procedural Canvas Textures for Bangladeshi flavor
export function createNewspaperTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Aged newsprint paper background
  ctx.fillStyle = '#e8dec8';
  ctx.fillRect(0, 0, 512, 512);

  // Masthead banner
  ctx.fillStyle = '#111827';
  ctx.fillRect(20, 20, 472, 60);
  ctx.fillStyle = '#f3f4f6';
  ctx.font = 'bold 36px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('দৈনিক ইত্তেফাক', 256, 62);

  // Big breaking news headline
  ctx.fillStyle = '#991b1b';
  ctx.font = 'bold 26px "Hind Siliguri", sans-serif';
  ctx.fillText('ঢাকায় দানব মশার আক্রমণ! কারফিউ জারি!', 256, 120);

  // Sub-headline
  ctx.fillStyle = '#1f2937';
  ctx.font = '16px "Hind Siliguri", sans-serif';
  ctx.fillText('লোডশেডিংয়ের সুযোগে ঘরে ঘরে মশার হামলা • সাবধান থাকুন', 256, 150);

  // Columns of text lines
  ctx.fillStyle = '#4b5563';
  for (let col = 0; col < 3; col++) {
    const x = 30 + col * 155;
    for (let row = 0; row < 18; row++) {
      const y = 180 + row * 16;
      ctx.fillRect(x, y, 140 * (0.8 + Math.random() * 0.2), 6);
    }
  }

  // Cartoon mosquito mugshot photo
  ctx.strokeStyle = '#374151';
  ctx.strokeRect(30, 370, 140, 110);
  ctx.fillStyle = '#fee2e2';
  ctx.fillRect(32, 372, 136, 106);
  ctx.fillStyle = '#dc2626';
  ctx.font = '14px sans-serif';
  ctx.fillText('WANTED: DENGUE', 100, 430);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createCalendarTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 384);

  // Header image zone
  ctx.fillStyle = '#15803d';
  ctx.fillRect(10, 10, 236, 140);
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('শুভ নববর্ষ ১৪৩১', 128, 70);
  ctx.font = '14px "Hind Siliguri", sans-serif';
  ctx.fillText('স্মার্ট বাংলাদেশ • ঢাকা', 128, 105);

  // Month grid
  ctx.fillStyle = '#b91c1c';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('NOVEMBER 2026', 128, 180);

  // Days grid
  ctx.fillStyle = '#1f2937';
  ctx.font = '12px sans-serif';
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  days.forEach((d, i) => ctx.fillText(d, 35 + i * 31, 210));

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 7; c++) {
      const dayNum = r * 7 + c + 1;
      if (dayNum <= 30) {
        ctx.fillStyle = c === 5 ? '#dc2626' : '#1f2937'; // Friday holiday red
        ctx.fillText(dayNum.toString(), 35 + c * 31, 235 + r * 25);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createFloorTilesTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm grout background
  ctx.fillStyle = '#6b7280';
  ctx.fillRect(0, 0, 512, 512);

  const tileSize = 246;
  const gap = 5;

  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      const x = gap + c * (tileSize + gap);
      const y = gap + r * (tileSize + gap);

      // Warm cream/beige Dhaka ceramic tile gradient
      const grad = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
      grad.addColorStop(0, '#f1ede4');
      grad.addColorStop(0.5, '#e5ded1');
      grad.addColorStop(1, '#dbd2c2');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, tileSize, tileSize);

      // Subtle marble veining
      ctx.strokeStyle = 'rgba(148, 133, 115, 0.28)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(x + 20, y + 40);
      ctx.bezierCurveTo(x + 90, y + 70, x + 130, y + 170, x + 220, y + 210);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + 150, y + 25);
      ctx.bezierCurveTo(x + 190, y + 85, x + 180, y + 145, x + 235, y + 180);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm cream/biscuit plaster wall (authentic Dhaka residential home)
  ctx.fillStyle = '#d5c8b2';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle plaster surface texture
  for (let i = 0; i < 3500; i++) {
    const nx = Math.random() * 512;
    const ny = Math.random() * 512;
    const alpha = Math.random() * 0.06;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
    ctx.fillRect(nx, ny, 2, 2);
  }

  // Teak wood skirting board along bottom
  ctx.fillStyle = '#3e1c07';
  ctx.fillRect(0, 465, 512, 47);

  ctx.fillStyle = '#78350f';
  ctx.fillRect(0, 467, 512, 5);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createBedsheetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep indigo/maroon Bangladeshi block-printed cotton (Nakshi Kantha pattern)
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 512);

  for (let gx = 64; gx < 512; gx += 128) {
    for (let gy = 64; gy < 512; gy += 128) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(gx - 36, gy - 36, 72, 72);

      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(gx, gy, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(gx, gy, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 504, 504);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#5c2d11'; // Rich Sheesham/Teak wood
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#381604';
  ctx.lineWidth = 2;
  for (let y = 0; y < 256; y += 14) {
    ctx.beginPath();
    ctx.moveTo(0, y + (Math.random() - 0.5) * 5);
    ctx.bezierCurveTo(80, y + 6, 170, y - 6, 256, y + (Math.random() - 0.5) * 5);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createCurtainTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#831843'; // Deep wine red curtain
  ctx.fillRect(0, 0, 256, 512);

  ctx.fillStyle = '#facc15';
  for (let y = 25; y < 512; y += 40) {
    for (let x = 20; x < 256; x += 36) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createClockTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('12', 128, 36);
  ctx.fillText('3', 220, 128);
  ctx.fillText('6', 128, 220);
  ctx.fillText('9', 36, 128);

  // Time: 11:30 PM (Story time!)
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(85, 70);
  ctx.stroke();

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(128, 205);
  ctx.stroke();

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(128, 128, 7, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createPaintingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 192;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#fef08a';
  ctx.fillRect(0, 0, 256, 192);

  ctx.fillStyle = '#ea580c';
  ctx.fillRect(0, 65, 256, 65);

  ctx.fillStyle = '#0369a1';
  ctx.fillRect(0, 130, 256, 62);

  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.arc(128, 130, 45, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(70, 130, 116, 20);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createLungiTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(0, 0, 256, 256);

  ctx.lineWidth = 3;
  for (let i = 0; i < 256; i += 32) {
    ctx.strokeStyle = '#60a5fa';
    ctx.beginPath();
    ctx.moveTo(i, 0); ctx.lineTo(i, 256);
    ctx.moveTo(0, i); ctx.lineTo(256, i);
    ctx.stroke();

    ctx.strokeStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(i + 16, 0); ctx.lineTo(i + 16, 256);
    ctx.moveTo(0, i + 16); ctx.lineTo(256, i + 16);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Bengali Shop Signboard Texture
export function createBengaliShopSignTexture(
  titleBangla: string,
  subtitleBangla: string,
  theme: 'tea' | 'pharmacy' | 'store' | 'laundry' = 'tea'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d')!;

  // Theme palettes: authentic vibrant roadside Dhaka signboards
  let bgGradient: [string, string] = ['#991b1b', '#7f1d1d']; // Tea stall crimson
  let accentColor = '#facc15'; // Golden yellow
  let textColor = '#ffffff';
  let bannerColor = '#15803d';

  if (theme === 'pharmacy') {
    bgGradient = ['#15803d', '#14532d']; // Pharmacy Emerald
    accentColor = '#fef08a';
    bannerColor = '#b91c1c';
  } else if (theme === 'store') {
    bgGradient = ['#1e40af', '#1e3a8a']; // General Store Royal Blue
    accentColor = '#f59e0b';
    bannerColor = '#b45309';
  } else if (theme === 'laundry') {
    bgGradient = ['#7c2d12', '#451a03']; // Laundry Warm Maroon
    accentColor = '#38bdf8';
    bannerColor = '#0369a1';
  }

  // Background gradient with border
  const grad = ctx.createLinearGradient(0, 0, 512, 140);
  grad.addColorStop(0, bgGradient[0]);
  grad.addColorStop(1, bgGradient[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 140);

  // Outer ornate border
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 500, 128);

  // Inner thin border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(12, 12, 488, 116);

  // Top sub-banner for Bismillah or category
  ctx.fillStyle = bannerColor;
  ctx.fillRect(130, 8, 252, 22);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('বিসমিল্লাহির রাহমানির রাহিম', 256, 23);

  // Main Bengali Title
  ctx.fillStyle = textColor;
  ctx.font = 'bold 38px "Hind Siliguri", sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 3;
  ctx.fillText(titleBangla, 256, 75);

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Subtitle / offerings
  ctx.fillStyle = accentColor;
  ctx.font = '15px "Hind Siliguri", sans-serif';
  ctx.fillText(subtitleBangla, 256, 106);

  // Corner decorative flourishes
  ctx.fillStyle = accentColor;
  ctx.fillRect(14, 14, 10, 10);
  ctx.fillRect(488, 14, 10, 10);
  ctx.fillRect(14, 116, 10, 10);
  ctx.fillRect(488, 116, 10, 10);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Authentic Dhaka Rickshaw Art Tin Backplate Texture
export function createRickshawArtTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Vibrant yellow background
  ctx.fillStyle = '#fde047';
  ctx.fillRect(0, 0, 512, 256);

  // Ornate scalloped border
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 240);

  // Sky blue scenic oval
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.ellipse(256, 128, 190, 95, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Green hills & river
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.arc(180, 170, 70, 0, Math.PI, true);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(330, 170, 75, 0, Math.PI, true);
  ctx.fill();

  // Traditional wooden country boat (Nouka)
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.ellipse(256, 175, 55, 14, 0, 0, Math.PI);
  ctx.fill();

  // Boat canopy (Chhoi)
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(256, 175, 24, Math.PI, 0);
  ctx.fill();

  // Setting orange sun
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.arc(256, 95, 26, 0, Math.PI * 2);
  ctx.fill();

  // Birds in sky
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(210, 75, 8, Math.PI, 0);
  ctx.arc(226, 75, 8, Math.PI, 0);
  ctx.stroke();

  // Rickshaw plate title
  ctx.fillStyle = '#991b1b';
  ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('মায়ের দোয়া • ঢাকা মেট্রো', 256, 238);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Collage of Weathered Dhaka Wall Posters
export function createDhakaPostersTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Weathered gray plaster backing
  ctx.fillStyle = '#52525b';
  ctx.fillRect(0, 0, 512, 512);

  // Poster 1: City Election Campaign (Top Left)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(15, 15, 230, 230);
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(20, 20, 220, 40);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('আসন্ন সিটি নির্বাচন', 130, 46);

  ctx.fillStyle = '#991b1b';
  ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
  ctx.fillText('মার্কা: মশা মারার ব্যাট!', 130, 115);

  ctx.fillStyle = '#1e293b';
  ctx.font = '13px "Hind Siliguri", sans-serif';
  ctx.fillText('ভোট দিয়ে মশা দূর করুন', 130, 145);
  ctx.fillText('প্রার্থী: সাধারণ জনতা', 130, 175);

  // Marker icon (Electric racket drawing)
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.strokeRect(105, 190, 50, 45);

  // Poster 2: Blockbuster Bangla Action Movie (Top Right)
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(265, 15, 230, 230);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(270, 20, 220, 50);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
  ctx.fillText('তুফান', 380, 54);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
  ctx.fillText('দানব মশার তাণ্ডব!', 380, 105);
  ctx.fillStyle = '#b91c1c';
  ctx.font = '13px "Hind Siliguri", sans-serif';
  ctx.fillText('শুক্রবার সারা দেশের সিনেমা হলে', 380, 150);
  ctx.fillText('টিকেটের জন্য মারামারি!', 380, 185);

  // Poster 3: Coaching Centre (Bottom Left)
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(15, 265, 230, 230);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(20, 270, 220, 36);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
  ctx.fillText('ইউনিক কোচিং হোম', 130, 294);
  ctx.fillStyle = '#0369a1';
  ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
  ctx.fillText('বিসিএস ও মেডিকেল ভর্তি', 130, 345);
  ctx.fillStyle = '#334155';
  ctx.font = '12px "Hind Siliguri", sans-serif';
  ctx.fillText('• ১০০% সাফল্যের গ্যারান্টি', 130, 385);
  ctx.fillText('• ধানমন্ডি ও মিরপুর শাখা', 130, 415);
  ctx.fillText('ভর্তি চলছে! আসন সংখ্যা সীমিত', 130, 455);

  // Poster 4: Municipal Health Notice (Bottom Right)
  ctx.fillStyle = '#fef2f2';
  ctx.fillRect(265, 265, 230, 230);
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(270, 270, 220, 36);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
  ctx.fillText('জনসচেতনতায় সিটি কর্পোরেশন', 380, 294);
  ctx.fillStyle = '#b91c1c';
  ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
  ctx.fillText('ডেঙ্গু প্রতিরোধে করণীয়:', 380, 340);
  ctx.fillStyle = '#1f2937';
  ctx.font = '12px "Hind Siliguri", sans-serif';
  ctx.fillText('১. জমে থাকা পানি ফেলুন', 380, 375);
  ctx.fillText('২. দিনে ও রাতে মশারি টানান', 380, 405);
  ctx.fillText('৩. জ্বর হলে চিকিৎসকের পরামর্শ নিন', 380, 435);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Corrugated Metal Roll-Down Shop Shutter Texture
export function createCorrugatedShutterTexture(baseColor = '#334155'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 256, 256);

  // Horizontal corrugated ribs
  for (let y = 0; y < 256; y += 12) {
    // Highlight ridge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(0, y, 256, 4);

    // Deep groove shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(0, y + 4, 256, 8);
  }

  // Brass Padlock Hasp at bottom center
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(116, 220, 24, 26);
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(128, 230, 4, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Biohazard Lab Warning Decal Texture
export function createBiohazardDecalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Vibrant safety yellow
  ctx.fillStyle = '#eab308';
  ctx.fillRect(0, 0, 256, 256);

  // Black hazard border
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 246, 246);

  // Biohazard trefoil
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(128, 100, 36, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(128, 100, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(95, 125, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(161, 125, 28, 0, Math.PI * 2);
  ctx.fill();

  // Bengali warning text
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('সতর্কতা: রূপান্তর কেন্দ্র', 128, 195);
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('BIOHAZARD MUTATION ZONE', 128, 225);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Insecticide Spray Can Label Texture
export function createInsectSprayLabelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Crimson red aerosol canister background
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#ef4444');
  grad.addColorStop(0.3, '#dc2626');
  grad.addColorStop(0.8, '#991b1b');
  grad.addColorStop(1, '#7f1d1d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Top metallic gold accent band
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, 8, 512, 16);

  // Bengali product title banner
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(40, 36, 432, 42);
  ctx.fillStyle = '#991b1b';
  ctx.font = 'bold 26px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('মশা নিধনকারী স্প্রে', 256, 66);

  // Center bold brand logo: HIT / আঘাত
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 52px sans-serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 4;
  ctx.fillText('HIT', 256, 138);

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Bengali subtitle
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
  ctx.fillText('• ১ স্প্রেতে সব মশা শেষ •', 256, 172);

  // Subtext: Dengue prevention formula
  ctx.fillStyle = '#ffffff';
  ctx.font = '13px "Hind Siliguri", sans-serif';
  ctx.fillText('ডেঙ্গু ও এডিস মশা প্রতিরোধক বিশেষ ফর্মুলা', 256, 202);

  // Bottom safety hazard stripes
  for (let s = 0; s < 512; s += 24) {
    ctx.fillStyle = s % 48 === 0 ? '#facc15' : '#0f172a';
    ctx.fillRect(s, 226, 24, 22);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ==========================================
// 1. WEAPON 3D MODELS (First-Person Models)
// ==========================================

// Archimedean Spiral Curve helper for authentic continuous mosquito coil
class ArchimedeanSpiralCurve extends THREE.Curve<THREE.Vector3> {
  turns: number;
  innerRadius: number;
  outerRadius: number;
  constructor(turns = 3.2, innerRadius = 0.014, outerRadius = 0.078) {
    super();
    this.turns = turns;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
  }
  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const angle = t * this.turns * Math.PI * 2;
    const r = this.innerRadius + t * (this.outerRadius - this.innerRadius);
    return optionalTarget.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
  }
}

export function createPlayerHandModel(isSpray = false): THREE.Group {
  const armGroup = new THREE.Group();
  armGroup.name = 'playerArmHand';

  // Warm South Asian / Bengali skin and blue cotton shirt from the global art system.
  const skinMat = ArtMaterials.characterSkin();
  const sleeveMat = ArtMaterials.fabric(0x0284c7);
  const cuffMat = ArtMaterials.fabric(0x075985);
  const nailMat = new THREE.MeshStandardMaterial({
    color: 0xe9c6a4,
    roughness: 0.42,
    metalness: 0.0,
  });

  // 1. Forearm sleeve rising from the bottom-right corner of the view.
  const sleeveGeo = new THREE.CapsuleGeometry(0.043, 0.19, 6, 14);
  const sleeve = new THREE.Mesh(sleeveGeo, sleeveMat);
  sleeve.rotation.x = -0.55;
  sleeve.rotation.z = -0.14;
  sleeve.position.set(0.072, -0.30, 0.195);
  armGroup.add(sleeve);

  // Folded cuff band + stitching, so the arm reads as clothing rather than a tube.
  const cuffGeo = new THREE.TorusGeometry(0.043, 0.010, 8, 18);
  const cuff = new THREE.Mesh(cuffGeo, cuffMat);
  cuff.rotation.x = 1.04;
  cuff.position.set(0.056, -0.226, 0.132);
  armGroup.add(cuff);

  for (let fold = 0; fold < 2; fold++) {
    const crease = new THREE.Mesh(
      new THREE.TorusGeometry(0.044 - fold * 0.003, 0.0035, 6, 16),
      cuffMat
    );
    crease.rotation.x = -0.55 + Math.PI / 2;
    crease.position.set(0.078 + fold * 0.005, -0.35 + fold * 0.055, 0.235 - fold * 0.04);
    armGroup.add(crease);
  }

  // 2. Wrist and forearm skin bridging the cuff and the palm.
  const wristGeo = new THREE.CapsuleGeometry(0.027, 0.085, 5, 12);
  const wrist = new THREE.Mesh(wristGeo, skinMat);
  wrist.rotation.x = -0.55;
  wrist.rotation.z = -0.16;
  wrist.position.set(0.040, -0.166, 0.077);
  armGroup.add(wrist);

  // Fine wrist crease
  const wristCrease = new THREE.Mesh(
    new THREE.TorusGeometry(0.027, 0.0022, 5, 14),
    nailMat
  );
  wristCrease.rotation.x = -0.55 + Math.PI / 2;
  wristCrease.position.set(0.034, -0.125, 0.051);
  armGroup.add(wristCrease);

  // 3. Palm: a soft rounded form rather than a hard box.
  const palmGeo = new THREE.CapsuleGeometry(0.032, 0.040, 6, 12);
  const palm = new THREE.Mesh(palmGeo, skinMat);
  palm.scale.set(0.92, 1.0, 0.58);
  palm.rotation.x = -0.16;
  palm.rotation.z = -0.20;
  palm.position.set(0.016, -0.077, 0.028);
  armGroup.add(palm);

  // Knuckle pads on the back of the hand.
  for (let k = 0; k < 4; k++) {
    const knuckle = new THREE.Mesh(new THREE.SphereGeometry(0.008, 7, 6), skinMat);
    knuckle.scale.set(0.9, 0.8, 0.7);
    knuckle.position.set(0.032, -0.108 + k * 0.0195, 0.038);
    armGroup.add(knuckle);
  }

  // 4. Four jointed fingers curling around the vertical grip.
  for (let f = 0; f < 4; f++) {
    const y = -0.112 + f * 0.021;
    const fingerRoot = new THREE.Group();
    fingerRoot.position.set(0.033, y, 0.030);
    fingerRoot.rotation.y = 0.72 + f * 0.035;

    if (isSpray && f === 0) {
      // Index finger extended forward onto the spray actuator.
      fingerRoot.name = 'sprayTriggerFinger';
      fingerRoot.rotation.set(-0.35, 0.10, 0);
      fingerRoot.position.set(0.018, -0.052, 0.014);
    }

    const proximal = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.0078, 0.026, 4, 8),
      skinMat
    );
    proximal.rotation.x = Math.PI / 2;
    proximal.position.z = -0.014;
    fingerRoot.add(proximal);

    const distal = new THREE.Group();
    distal.position.z = -0.030;
    distal.rotation.y = isSpray && f === 0 ? 0.0 : 0.82;
    const phalanx = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.0070, 0.019, 4, 8),
      skinMat
    );
    phalanx.rotation.x = Math.PI / 2;
    phalanx.position.z = -0.011;
    distal.add(phalanx);

    // Fingernail catches the light and makes the hand feel alive at close range.
    const nail = new THREE.Mesh(new THREE.BoxGeometry(0.0095, 0.0026, 0.009), nailMat);
    nail.position.set(0, 0.0068, -0.019);
    nail.rotation.x = 0.12;
    distal.add(nail);

    fingerRoot.add(distal);
    armGroup.add(fingerRoot);
  }

  // 5. Thumb crossing the grip from the inner side.
  const thumbRoot = new THREE.Group();
  thumbRoot.position.set(-0.004, -0.085, 0.036);
  thumbRoot.rotation.set(0.15, -0.55, -0.65);
  const thumbProx = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.0085, 0.026, 4, 8),
    skinMat
  );
  thumbProx.position.z = -0.014;
  thumbProx.rotation.x = Math.PI / 2;
  thumbRoot.add(thumbProx);

  const thumbTip = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.0075, 0.020, 4, 8),
    skinMat
  );
  thumbTip.position.set(0, 0.002, -0.043);
  thumbTip.rotation.set(Math.PI / 2, 0.5, 0);
  thumbRoot.add(thumbTip);
  armGroup.add(thumbRoot);

  return armGroup;
}

/**
 * Camera-space placement for each first-person weapon. The values keep the tool
 * in the lower-right quadrant so the reticle and screen centre stay unobstructed,
 * while giving each object its own natural angle and working distance.
 */
export interface WeaponViewmodelRig {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

export const WEAPON_VIEWMODEL_RIGS: Record<WeaponType, WeaponViewmodelRig> = {
  racket: { position: [0.42, -0.26, -0.55], rotation: [0.12, -0.30, 0.12], scale: 0.48 },
  newspaper: { position: [0.38, -0.21, -0.50], rotation: [0.24, -0.52, -0.08], scale: 0.35 },
  coil: { position: [0.31, -0.20, -0.44], rotation: [0.34, -0.36, 0.02], scale: 0.36 },
  fan: { position: [0.43, -0.24, -0.58], rotation: [0.02, -0.22, 0.05], scale: 0.38 },
  spray: { position: [0.32, -0.16, -0.45], rotation: [0.18, -0.14, 0.04], scale: 0.42 },
};

export function createWeaponModel(type: WeaponType): THREE.Group {
  const weaponGroup = new THREE.Group();

  switch (type) {
    case 'racket': {
      // 1. Electric Mosquito Racket (Authentic, compact, angled head)
      // Ergonomic cylindrical handle
      const handleGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.24, 16);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35, metalness: 0.1 });
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.position.y = -0.08;
      weaponGroup.add(handle);

      // Black rubber grip ribbed bands
      for (let g = 0; g < 4; g++) {
        const gripGeo = new THREE.TorusGeometry(0.0205, 0.003, 8, 16);
        const gripMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
        const grip = new THREE.Mesh(gripGeo, gripMat);
        grip.rotation.x = Math.PI / 2;
        grip.position.y = -0.14 + g * 0.025;
        weaponGroup.add(grip);
      }

      // Yellow power activation toggle switch
      const switchGeo = new THREE.BoxGeometry(0.012, 0.03, 0.015);
      const switchMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
      const pswitch = new THREE.Mesh(switchGeo, switchMat);
      pswitch.position.set(0, -0.01, 0.022);
      weaponGroup.add(pswitch);

      // High voltage indicator LED (Green)
      const ledGeo = new THREE.SphereGeometry(0.006, 8, 8);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(0, 0.02, 0.021);
      led.name = 'racketLed';
      weaponGroup.add(led);

      // Racket neck junction
      const neckGeo = new THREE.CylinderGeometry(0.022, 0.018, 0.04, 16);
      const neck = new THREE.Mesh(neckGeo, handleMat);
      neck.position.y = 0.04;
      weaponGroup.add(neck);

      // Compact Oval frame rim (Glossy Red)
      const rimCurve = new THREE.EllipseCurve(0, 0, 0.095, 0.13, 0, 2 * Math.PI, false, 0);
      const points = rimCurve.getPoints(28);
      const rimTubeGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p.x, p.y, 0))), 28, 0.012, 8, true);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25, metalness: 0.2 });
      const rim = new THREE.Mesh(rimTubeGeo, rimMat);
      rim.position.y = 0.16;
      weaponGroup.add(rim);

      // Inner Chrome Rim border
      const innerRimGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p.x * 0.92, p.y * 0.92, 0))), 28, 0.004, 6, true);
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.12 });
      const innerRim = new THREE.Mesh(innerRimGeo, chromeMat);
      innerRim.position.y = 0.16;
      weaponGroup.add(innerRim);

      // High-voltage wire mesh: a real elliptical grid of thin lines instead of a
      // flat triangular wireframe plane.
      const gridPoints: THREE.Vector3[] = [];
      const gridHalfW = 0.082;
      const gridHalfH = 0.118;
      for (let i = -4; i <= 4; i++) {
        const gx = (i / 4) * gridHalfW;
        const halfY = gridHalfH * Math.sqrt(Math.max(0, 1 - (gx / gridHalfW) ** 2));
        gridPoints.push(new THREE.Vector3(gx, -halfY, 0), new THREE.Vector3(gx, halfY, 0));
      }
      for (let j = -5; j <= 5; j++) {
        const gy = (j / 5) * gridHalfH;
        const halfX = gridHalfW * Math.sqrt(Math.max(0, 1 - (gy / gridHalfH) ** 2));
        gridPoints.push(new THREE.Vector3(-halfX, gy, 0), new THREE.Vector3(halfX, gy, 0));
      }
      const gridGeo = new THREE.BufferGeometry().setFromPoints(gridPoints);
      const gridMat = new THREE.LineBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.9,
      });
      const meshGrid = new THREE.LineSegments(gridGeo, gridMat);
      meshGrid.position.y = 0.16;
      meshGrid.position.z = 0.002;
      weaponGroup.add(meshGrid);

      // Faint energised field behind the grid.
      const fieldGeo = new THREE.CircleGeometry(1, 28);
      fieldGeo.scale(gridHalfW, gridHalfH, 1);
      const fieldMat = new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.10,
        depthWrite: false,
      });
      const field = new THREE.Mesh(fieldGeo, fieldMat);
      field.position.y = 0.16;
      field.position.z = -0.002;
      weaponGroup.add(field);

      // Hanging wrist strap at the base of the handle.
      const strapCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.0, -0.19, 0.01),
        new THREE.Vector3(0.03, -0.23, 0.03),
        new THREE.Vector3(0.01, -0.27, 0.00),
        new THREE.Vector3(-0.02, -0.23, -0.01),
      ]);
      const strap = new THREE.Mesh(
        new THREE.TubeGeometry(strapCurve, 16, 0.0035, 5, false),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 })
      );
      weaponGroup.add(strap);

      // Cartoon Electric Spark Arc Line (Flickers in render loop)
      const arcPoints = [
        new THREE.Vector3(-0.05, 0.12, 0.005),
        new THREE.Vector3(-0.02, 0.17, 0.008),
        new THREE.Vector3(0.01, 0.14, 0.005),
        new THREE.Vector3(0.04, 0.20, 0.008),
        new THREE.Vector3(0.06, 0.15, 0.005),
      ];
      const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
      const arcMat = new THREE.LineBasicMaterial({ color: 0x67e8f9, linewidth: 2 });
      const electricArc = new THREE.Line(arcGeo, arcMat);
      electricArc.name = 'racketElectricArc';
      weaponGroup.add(electricArc);

      // Player hand holding the handle
      const racketHand = createPlayerHandModel();
      racketHand.position.set(0, -0.07, 0.015);
      weaponGroup.add(racketHand);
      break;
    }

    case 'newspaper': {
      // 2. Rolled Authentic Bengali Daily Newspaper ('দৈনিক ইত্তেফাক')
      const paperTexture = createNewspaperTexture();
      const cylinderGeo = new THREE.CylinderGeometry(0.030, 0.034, 0.38, 24);
      const paperMat = new THREE.MeshStandardMaterial({
        map: paperTexture,
        roughness: 0.88,
        metalness: 0.0,
      });
      const roll = new THREE.Mesh(cylinderGeo, paperMat);
      roll.position.y = 0.06;
      weaponGroup.add(roll);

      // Outer wrap fold flap giving genuine rolled paper look
      const wrapGeo = new THREE.CylinderGeometry(0.034, 0.038, 0.32, 16, 1, true, 0, Math.PI * 1.3);
      const outerWrap = new THREE.Mesh(wrapGeo, paperMat);
      outerWrap.position.y = 0.07;
      outerWrap.rotation.y = 0.4;
      weaponGroup.add(outerWrap);

      // Realistic amber/terracotta rubber bands
      const bandGeo = new THREE.TorusGeometry(0.035, 0.0045, 8, 20);
      const bandMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.55 });
      const band1 = new THREE.Mesh(bandGeo, bandMat);
      band1.rotation.x = Math.PI / 2;
      band1.position.y = -0.06;
      weaponGroup.add(band1);

      const band2 = new THREE.Mesh(bandGeo, bandMat);
      band2.rotation.x = Math.PI / 2;
      band2.position.y = 0.14;
      weaponGroup.add(band2);

      const paperHand = createPlayerHandModel();
      paperHand.position.set(0, -0.04, 0.015);
      weaponGroup.add(paperHand);
      break;
    }

    case 'coil': {
      // 3. Mosquito Coil on Metal Stand (Archimedean spiral coil)
      const standBaseGeo = new THREE.CylinderGeometry(0.088, 0.096, 0.010, 24);
      const standMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.82, roughness: 0.25 });
      const stand = new THREE.Mesh(standBaseGeo, standMat);
      stand.position.y = -0.05;
      weaponGroup.add(stand);

      // Stamped tin tray rim
      const rimGeo = new THREE.TorusGeometry(0.092, 0.004, 8, 24);
      const rim = new THREE.Mesh(rimGeo, standMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = -0.045;
      weaponGroup.add(rim);

      // Center upright clamp prong
      const prongGeo = new THREE.BoxGeometry(0.012, 0.05, 0.004);
      const prong = new THREE.Mesh(prongGeo, standMat);
      prong.position.y = -0.025;
      weaponGroup.add(prong);

      // Continuous Archimedean spiral green coil
      const spiralCurve = new ArchimedeanSpiralCurve(3.2, 0.014, 0.078);
      const coilTubeGeo = new THREE.TubeGeometry(spiralCurve, 72, 0.0055, 8, false);
      const coilMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.92 });
      const coil = new THREE.Mesh(coilTubeGeo, coilMat);
      coil.rotation.x = Math.PI / 2;
      coil.position.y = 0.005;
      weaponGroup.add(coil);

      // Glowing burning ember tip at the outer end of the spiral
      const emberGeo = new THREE.SphereGeometry(0.008, 8, 8);
      const emberMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
      const ember = new THREE.Mesh(emberGeo, emberMat);
      ember.position.set(0.078, 0.008, 0);
      ember.name = 'coilEmber';
      weaponGroup.add(ember);

      // Tiny point light for glowing ember illumination
      const emberLight = new THREE.PointLight(0xff6b35, 0.8, 0.5);
      emberLight.position.set(0.078, 0.015, 0);
      emberLight.name = 'coilEmberLight';
      weaponGroup.add(emberLight);

      const coilHand = createPlayerHandModel();
      // Pull the hand toward the viewer so the fingers wrap over the near rim of
      // the flat coil instead of hiding underneath it.
      coilHand.position.set(0.005, -0.045, 0.15);
      weaponGroup.add(coilHand);
      break;
    }

    case 'fan': {
      // 4. Electric Table Fan (Royal Blue & Chrome)
      const baseGeo = new THREE.CylinderGeometry(0.085, 0.095, 0.025, 20);
      const fanBodyMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.35, metalness: 0.1 });
      const base = new THREE.Mesh(baseGeo, fanBodyMat);
      base.position.y = -0.15;
      weaponGroup.add(base);

      // Speed selector buttons (1, 2, 3)
      const btnColors = [0xef4444, 0xfacc15, 0x22c55e];
      for (let b = 0; b < 3; b++) {
        const btnGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.006, 8);
        const btnMat = new THREE.MeshStandardMaterial({ color: btnColors[b], roughness: 0.3 });
        const btn = new THREE.Mesh(btnGeo, btnMat);
        btn.position.set(-0.025 + b * 0.025, -0.135, 0.065);
        weaponGroup.add(btn);
      }

      const pillarGeo = new THREE.CylinderGeometry(0.015, 0.018, 0.18, 14);
      const pillar = new THREE.Mesh(pillarGeo, fanBodyMat);
      pillar.position.y = -0.05;
      weaponGroup.add(pillar);

      const motorGeo = new THREE.CylinderGeometry(0.042, 0.048, 0.075, 16);
      motorGeo.rotateX(Math.PI / 2);
      const motor = new THREE.Mesh(motorGeo, fanBodyMat);
      motor.position.set(0, 0.07, -0.025);
      weaponGroup.add(motor);

      // Chrome Wire Safety Cage
      const cageMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.88, roughness: 0.15 });
      const cageGeo = new THREE.TorusGeometry(0.13, 0.007, 8, 24);
      const cage = new THREE.Mesh(cageGeo, cageMat);
      cage.position.set(0, 0.07, 0.015);
      weaponGroup.add(cage);

      const innerCageGeo = new THREE.TorusGeometry(0.07, 0.004, 6, 20);
      const innerCage = new THREE.Mesh(innerCageGeo, cageMat);
      innerCage.position.set(0, 0.07, 0.015);
      weaponGroup.add(innerCage);

      for (let s = 0; s < 6; s++) {
        const spokeGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.25, 6);
        const spoke = new THREE.Mesh(spokeGeo, cageMat);
        spoke.rotation.z = (s * Math.PI) / 6;
        spoke.position.set(0, 0.07, 0.015);
        weaponGroup.add(spoke);
      }

      // Chrome Center Badge
      const badgeGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.008, 16);
      badgeGeo.rotateX(Math.PI / 2);
      const badge = new THREE.Mesh(badgeGeo, cageMat);
      badge.position.set(0, 0.07, 0.02);
      weaponGroup.add(badge);

      // Fan blades: curved aerofoil shapes rather than flat boxes.
      const bladesGroup = new THREE.Group();
      bladesGroup.name = 'fanBlades';
      const bladeMat = new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.9,
        roughness: 0.22,
        metalness: 0.05,
        side: THREE.DoubleSide,
      });
      const bladeShape = new THREE.Shape();
      bladeShape.moveTo(0.012, 0.004);
      bladeShape.bezierCurveTo(0.040, 0.018, 0.058, 0.070, 0.042, 0.108);
      bladeShape.bezierCurveTo(0.022, 0.100, 0.006, 0.052, 0.012, 0.004);
      const bladeGeo = new THREE.ShapeGeometry(bladeShape, 10);
      for (let bl = 0; bl < 3; bl++) {
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.rotation.y = 0.30;
        blade.position.z = 0.006;
        const pivot = new THREE.Group();
        pivot.rotation.z = (bl * 2 * Math.PI) / 3;
        pivot.add(blade);
        bladesGroup.add(pivot);
      }
      bladesGroup.position.set(0, 0.07, 0.008);
      weaponGroup.add(bladesGroup);

      // Airflow Breeze Swirl Visual Mesh (Visible when firing/pushing)
      const swirlGeo = new THREE.ConeGeometry(0.12, 0.25, 16, 1, true);
      swirlGeo.rotateX(-Math.PI / 2);
      const swirlMat = new THREE.MeshBasicMaterial({
        color: 0xbae6fd,
        transparent: true,
        opacity: 0.0,
        wireframe: true,
        side: THREE.DoubleSide,
      });
      const airSwirl = new THREE.Mesh(swirlGeo, swirlMat);
      airSwirl.position.set(0, 0.07, 0.15);
      airSwirl.name = 'fanAirSwirl';
      weaponGroup.add(airSwirl);

      const fanHand = createPlayerHandModel();
      fanHand.position.set(0, -0.10, 0.02);
      weaponGroup.add(fanHand);
      break;
    }

    case 'spray': {
      // 5. Insecticide Spray Can ('HIT - মশা নিধনকারী স্প্রে')
      const sprayLabelTexture = createInsectSprayLabelTexture();
      const canGeo = new THREE.CylinderGeometry(0.034, 0.034, 0.22, 24);
      const canMat = new THREE.MeshStandardMaterial({
        map: sprayLabelTexture,
        roughness: 0.35,
        metalness: 0.3,
      });
      const can = new THREE.Mesh(canGeo, canMat);
      can.position.y = 0.01;
      weaponGroup.add(can);

      // Polished Gold Shoulder Dome
      const domeGeo = new THREE.SphereGeometry(0.033, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.6 });
      const dome = new THREE.Mesh(domeGeo, domeMat);
      dome.position.y = 0.12;
      weaponGroup.add(dome);

      // Rolled Bottom Seam Rim
      const rimGeo = new THREE.TorusGeometry(0.034, 0.003, 8, 24);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
      const botRim = new THREE.Mesh(rimGeo, rimMat);
      botRim.rotation.x = Math.PI / 2;
      botRim.position.y = -0.10;
      weaponGroup.add(botRim);

      // Black Ergonomic Push-Button Actuator Nozzle
      const nozzleGeo = new THREE.CylinderGeometry(0.010, 0.012, 0.024, 12);
      const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
      const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
      nozzle.position.set(0, 0.145, 0.005);
      nozzle.name = 'sprayNozzle';
      weaponGroup.add(nozzle);

      // Tiny forward spray orifice
      const orificeGeo = new THREE.CircleGeometry(0.003, 8);
      const orificeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const orifice = new THREE.Mesh(orificeGeo, orificeMat);
      orifice.position.set(0, 0.15, 0.016);
      weaponGroup.add(orifice);

      // Player hand holding the can, with index finger on the trigger!
      const sprayHand = createPlayerHandModel(true);
      sprayHand.position.set(0, 0.02, 0.015);
      weaponGroup.add(sprayHand);
      break;
    }
  }

  // Ergonomic compact viewmodel scale - keeps central screen completely clear!
  const baseScale = WEAPON_VIEWMODEL_RIGS[type].scale;
  weaponGroup.scale.set(baseScale, baseScale, baseScale);
  return weaponGroup;
}

// ==========================================
// 2. MOSQUITO ENEMY 3D MODELS
// ==========================================

export function createMosquitoModel(type: EnemyType): THREE.Group {
  // Unique, hand-modelled bosses. They expose the same named animation nodes as
  // the regular mosquito so GameCanvas can drive them without special cases.
  const enemyKind = type as string;
  if (enemyKind === 'boss_dengue') return createDengueKingModel();
  if (enemyKind === 'boss_midnight') return createMidnightMosquitoModel();
  if (enemyKind === 'boss_invisible') return createInvisibleApexModel();

  const bugGroup = new THREE.Group();

  let bodyScale = 1.0;
  let eyeColor = 0xef4444;
  let wingColor = 0xbae6fd;
  let wingOpacity = 0.6;
  let isStriped = false;

  if (type === 'giant') {
    bodyScale = 2.2;
    eyeColor = 0xf97316; // Amber eyes
  } else if (type === 'stealth') {
    bodyScale = 0.9;
    eyeColor = 0xa855f7; // Glowing violet
    wingColor = 0xddd6fe;
    wingOpacity = 0.35;
  } else if (type === 'swarm') {
    bodyScale = 0.6;
  } else if (type === 'boss_dengue') {
    bodyScale = 3.8;
    eyeColor = 0xff0000;
    isStriped = true;
  } else if (type === 'boss_midnight') {
    bodyScale = 4.2;
    eyeColor = 0xc084fc;
    wingColor = 0xa855f7;
    wingOpacity = 0.7;
  } else if (type === 'boss_invisible') {
    bodyScale = 4.0;
    eyeColor = 0x34d399;
    wingColor = 0xa7f3d0;
    wingOpacity = 0.2; // Camouflage optical shimmer
  }

  // 1. Thorax (Center Body with global stylized chitin material)
  const thoraxGeo = new THREE.SphereGeometry(0.12 * bodyScale, 12, 12);
  thoraxGeo.scale(1, 0.8, 1.4);

  let thoraxMat: THREE.Material = ArtMaterials.mosquitoChitin(type);
  let abdomenMat: THREE.Material = ArtMaterials.mosquitoChitin(type);

  if (type === 'boss_invisible') {
    // High-refraction optical camouflage material
    const camoMat = new THREE.MeshPhysicalMaterial({
      color: 0x34d399,
      transmission: 0.85,
      opacity: 0.30,
      transparent: true,
      roughness: 0.08,
      ior: 1.45,
      thickness: 0.6,
      depthWrite: false,
    });
    thoraxMat = camoMat;
    abdomenMat = camoMat;
  }

  const thorax = new THREE.Mesh(thoraxGeo, thoraxMat);
  bugGroup.add(thorax);

  // Dorsal armored ridges for Giant Mosquito
  if (type === 'giant') {
    const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.7 });
    for (let r = 0; r < 3; r++) {
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.04 * bodyScale, 0.03 * bodyScale, 0.06 * bodyScale), ridgeMat);
      ridge.position.set(0, 0.09 * bodyScale, (-0.06 + r * 0.07) * bodyScale);
      ridge.rotation.x = 0.2;
      bugGroup.add(ridge);
    }
  }

  // 2. Abdomen (Elongated rear body, pulsing with stripes)
  const abdomenGroup = new THREE.Group();
  abdomenGroup.name = 'abdomen';
  abdomenGroup.position.set(0, -0.04 * bodyScale, 0.32 * bodyScale);

  const abdomenGeo = new THREE.ConeGeometry(0.1 * bodyScale, 0.45 * bodyScale, 12);
  abdomenGeo.rotateX(Math.PI / 2);
  const abdomen = new THREE.Mesh(abdomenGeo, abdomenMat);
  abdomenGroup.add(abdomen);

  // Aedes mosquito signature alternating cream/yellowish stripes on abdomen
  if (type !== 'boss_invisible') {
    const stripeMat = new THREE.MeshStandardMaterial({
      color: isStriped ? 0xfef08a : 0xe2e8f0,
      roughness: 0.7,
    });
    for (let s = 0; s < 4; s++) {
      const zOffset = (-0.12 + s * 0.08) * bodyScale;
      const stripeRadius = (0.04 + (3 - s) * 0.015) * bodyScale;
      const stripeRing = new THREE.Mesh(new THREE.TorusGeometry(stripeRadius, 0.006 * bodyScale, 6, 12), stripeMat);
      stripeRing.position.set(0, 0, zOffset);
      abdomenGroup.add(stripeRing);
    }
  }
  bugGroup.add(abdomenGroup);

  if (type === 'boss_invisible') {
    // Bioluminescent Mutation Core inside transparent abdomen
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 1.8,
      roughness: 0.1,
    });
    const bioCore = new THREE.Mesh(new THREE.SphereGeometry(0.065 * bodyScale, 8, 8), coreMat);
    bioCore.position.set(0, -0.04 * bodyScale, 0.28 * bodyScale);
    bioCore.name = 'invisibleBioCore';
    bugGroup.add(bioCore);
  }

  // 3. Head & Cartoon Eyes
  const headGeo = new THREE.SphereGeometry(0.08 * bodyScale, 12, 12);
  const head = new THREE.Mesh(headGeo, thoraxMat);
  head.position.set(0, 0.02 * bodyScale, -0.16 * bodyScale);
  bugGroup.add(head);

  // Feathered Antennae extending from brow
  const antennaMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
  for (let side of [-1, 1]) {
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.003 * bodyScale, 0.001 * bodyScale, 0.18 * bodyScale, 6), antennaMat);
    antenna.rotation.x = -Math.PI / 3;
    antenna.rotation.z = side * 0.35;
    antenna.position.set(side * 0.03 * bodyScale, 0.09 * bodyScale, -0.22 * bodyScale);
    bugGroup.add(antenna);
  }

  // Big Cartoon Bug Eyes with Specular Corneal Highlight Dots
  const eyeGeo = new THREE.SphereGeometry(0.045 * bodyScale, 10, 10);
  const eyeMat = new THREE.MeshBasicMaterial({ color: eyeColor });
  const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  for (let side of [-1, 1]) {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(side * 0.05 * bodyScale, 0.05 * bodyScale, -0.2 * bodyScale);
    bugGroup.add(eye);

    // Expressive cartoon specular reflection highlight dot
    const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.012 * bodyScale, 6, 6), highlightMat);
    highlight.position.set(side * 0.062 * bodyScale, 0.068 * bodyScale, -0.235 * bodyScale);
    bugGroup.add(highlight);
  }

  // Angry cartoon comic brow ridges
  if (type === 'boss_dengue' || type === 'giant') {
    const browMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const browL = new THREE.Mesh(new THREE.BoxGeometry(0.06 * bodyScale, 0.015 * bodyScale, 0.02 * bodyScale), browMat);
    browL.position.set(-0.05 * bodyScale, 0.09 * bodyScale, -0.22 * bodyScale);
    browL.rotation.z = -0.32;
    bugGroup.add(browL);

    const browR = new THREE.Mesh(new THREE.BoxGeometry(0.06 * bodyScale, 0.015 * bodyScale, 0.02 * bodyScale), browMat);
    browR.position.set(0.05 * bodyScale, 0.09 * bodyScale, -0.22 * bodyScale);
    browR.rotation.z = 0.32;
    bugGroup.add(browR);
  }

  // 4. Sharp Needle Proboscis (Stinger)
  const proboscisGeo = new THREE.ConeGeometry(0.015 * bodyScale, 0.28 * bodyScale, 8);
  proboscisGeo.rotateX(-Math.PI / 2.3);
  const proboscisMat = ArtMaterials.metal('dark');
  const proboscis = new THREE.Mesh(proboscisGeo, proboscisMat);
  proboscis.position.set(0, -0.06 * bodyScale, -0.28 * bodyScale);
  bugGroup.add(proboscis);

  // Dripping toxic crimson venom drop on Dengue King stinger
  if (type === 'boss_dengue') {
    const venomMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 0.9,
      roughness: 0.1,
    });
    const venomDrop = new THREE.Mesh(new THREE.SphereGeometry(0.022 * bodyScale, 8, 8), venomMat);
    venomDrop.position.set(0, -0.19 * bodyScale, -0.42 * bodyScale);
    venomDrop.name = 'venomDrop';
    bugGroup.add(venomDrop);
  }

  // 5. Wings (Global stylized iridescent cellophane wing material)
  const wingMat = ArtMaterials.mosquitoWings();

  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.quadraticCurveTo(0.12 * bodyScale, 0.25 * bodyScale, 0.05 * bodyScale, 0.6 * bodyScale);
  wingShape.quadraticCurveTo(-0.04 * bodyScale, 0.3 * bodyScale, 0, 0);

  const wingGeo = new THREE.ShapeGeometry(wingShape);
  wingGeo.rotateX(Math.PI / 2);

  // Delicate vein network inside each wing membrane (wing-local XZ plane).
  const makeWingVeins = () => {
    const veinPoints: THREE.Vector3[] = [];
    const addVein = (x1: number, z1: number, x2: number, z2: number) => {
      veinPoints.push(
        new THREE.Vector3(x1, 0.0018, z1),
        new THREE.Vector3(x2, 0.0018, z2)
      );
    };
    const s = bodyScale;
    addVein(0.002 * s, 0.005 * s, 0.030 * s, 0.555 * s);
    addVein(0.008 * s, 0.12 * s, 0.062 * s, 0.30 * s);
    addVein(0.014 * s, 0.20 * s, 0.052 * s, 0.42 * s);
    addVein(0.019 * s, 0.28 * s, 0.040 * s, 0.52 * s);
    addVein(0.030 * s, 0.36 * s, 0.050 * s, 0.44 * s);
    addVein(0.042 * s, 0.46 * s, 0.024 * s, 0.52 * s);
    const veinGeo = new THREE.BufferGeometry().setFromPoints(veinPoints);
    const veinMat = new THREE.LineBasicMaterial({
      color: 0x475569,
      transparent: true,
      opacity: 0.5,
    });
    return new THREE.LineSegments(veinGeo, veinMat);
  };

  // Left Wing (Primary)
  const leftWingPivot = new THREE.Group();
  leftWingPivot.name = 'leftWing';
  leftWingPivot.position.set(-0.06 * bodyScale, 0.08 * bodyScale, 0);
  const leftWing = new THREE.Mesh(wingGeo, wingMat);
  leftWing.rotation.y = -Math.PI / 3;
  leftWing.add(makeWingVeins());
  leftWingPivot.add(leftWing);
  bugGroup.add(leftWingPivot);

  // Right Wing (Primary)
  const rightWingPivot = new THREE.Group();
  rightWingPivot.name = 'rightWing';
  rightWingPivot.position.set(0.06 * bodyScale, 0.08 * bodyScale, 0);
  const rightWing = new THREE.Mesh(wingGeo, wingMat);
  rightWing.rotation.y = Math.PI / 3;
  rightWing.scale.x = -1;
  rightWing.add(makeWingVeins());
  rightWingPivot.add(rightWing);
  bugGroup.add(rightWingPivot);

  // Four-winged anatomy for Dengue King and Midnight Boss
  if (type === 'boss_dengue' || type === 'boss_midnight') {
    const leftRearWingPivot = new THREE.Group();
    leftRearWingPivot.name = 'leftRearWing';
    leftRearWingPivot.position.set(-0.05 * bodyScale, 0.06 * bodyScale, 0.12 * bodyScale);
    const leftRearWing = new THREE.Mesh(wingGeo, wingMat);
    leftRearWing.scale.set(0.72, 0.72, 0.72);
    leftRearWing.rotation.y = -Math.PI / 3.4;
    leftRearWingPivot.add(leftRearWing);
    bugGroup.add(leftRearWingPivot);

    const rightRearWingPivot = new THREE.Group();
    rightRearWingPivot.name = 'rightRearWing';
    rightRearWingPivot.position.set(0.05 * bodyScale, 0.06 * bodyScale, 0.12 * bodyScale);
    const rightRearWing = new THREE.Mesh(wingGeo, wingMat);
    rightRearWing.scale.set(-0.72, 0.72, 0.72);
    rightRearWing.rotation.y = Math.PI / 3.4;
    rightRearWingPivot.add(rightRearWing);
    bugGroup.add(rightRearWingPivot);
  }

  // 6. Jointed Legs (Grouped into leftLegs and rightLegs for dangling flight kinematics)
  const legMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 });
  const leftLegs = new THREE.Group();
  leftLegs.name = 'leftLegs';
  const rightLegs = new THREE.Group();
  rightLegs.name = 'rightLegs';

  for (let l = 0; l < 3; l++) {
    for (let side of [-1, 1]) {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.08 * bodyScale, -0.04 * bodyScale, (l - 1) * 0.1 * bodyScale);

      // Thigh
      const thighGeo = new THREE.CylinderGeometry(0.008 * bodyScale, 0.006 * bodyScale, 0.22 * bodyScale, 6);
      const thigh = new THREE.Mesh(thighGeo, legMat);
      thigh.rotation.z = side * 0.7;
      thigh.rotation.x = (l - 1) * 0.3;
      thigh.position.set(side * 0.08 * bodyScale, -0.06 * bodyScale, 0);
      legGroup.add(thigh);

      // Shin
      const shinGeo = new THREE.CylinderGeometry(0.005 * bodyScale, 0.003 * bodyScale, 0.26 * bodyScale, 6);
      const shin = new THREE.Mesh(shinGeo, legMat);
      shin.position.set(side * 0.16 * bodyScale, -0.22 * bodyScale, 0);
      shin.rotation.z = side * -0.4;
      legGroup.add(shin);

      // Articulated knee and hooked tarsus give the giant real insect weight.
      if (type === 'giant') {
        const knee = new THREE.Mesh(
          new THREE.SphereGeometry(0.014 * bodyScale, 7, 6),
          legMat
        );
        knee.position.set(side * 0.15 * bodyScale, -0.17 * bodyScale, 0);
        legGroup.add(knee);

        const tarsus = new THREE.Mesh(
          new THREE.ConeGeometry(0.010 * bodyScale, 0.07 * bodyScale, 5),
          legMat
        );
        tarsus.position.set(side * 0.20 * bodyScale, -0.35 * bodyScale, 0.01 * bodyScale);
        tarsus.rotation.z = side * 0.55;
        tarsus.rotation.x = -0.35;
        legGroup.add(tarsus);
      }

      // Hooked claw for Dengue King
      if (type === 'boss_dengue' && l === 0) {
        const claw = new THREE.Mesh(new THREE.ConeGeometry(0.008 * bodyScale, 0.06 * bodyScale, 4), legMat);
        claw.position.set(side * 0.20 * bodyScale, -0.36 * bodyScale, -0.04 * bodyScale);
        claw.rotation.x = -0.5;
        legGroup.add(claw);
      }

      if (side < 0) {
        leftLegs.add(legGroup);
      } else {
        rightLegs.add(legGroup);
      }
    }
  }
  bugGroup.add(leftLegs);
  bugGroup.add(rightLegs);

  // Boss Crown & Aura Light for Dengue King
  if (type === 'boss_dengue') {
    const crownMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 });
    const gemMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.8 });

    const crownBase = new THREE.Mesh(new THREE.TorusGeometry(0.06 * bodyScale, 0.012 * bodyScale, 8, 16), crownMat);
    crownBase.rotation.x = Math.PI / 2;
    crownBase.position.set(0, 0.12 * bodyScale, -0.16 * bodyScale);
    bugGroup.add(crownBase);

    for (let c = 0; c < 5; c++) {
      const spikeGeo = new THREE.ConeGeometry(0.025 * bodyScale, 0.18 * bodyScale, 6);
      const spike = new THREE.Mesh(spikeGeo, crownMat);
      spike.position.set((-0.08 + c * 0.04) * bodyScale, 0.20 * bodyScale, -0.16 * bodyScale);
      spike.rotation.z = (-0.35 + c * 0.175);
      bugGroup.add(spike);

      const gem = new THREE.Mesh(new THREE.SphereGeometry(0.012 * bodyScale, 6, 6), gemMat);
      gem.position.set((-0.08 + c * 0.04) * bodyScale, 0.13 * bodyScale, -0.13 * bodyScale);
      bugGroup.add(gem);
    }

    // Thorax Dorsal Spines
    for (let sp = 0; sp < 3; sp++) {
      const spine = new THREE.Mesh(new THREE.ConeGeometry(0.018 * bodyScale, 0.09 * bodyScale, 5), crownMat);
      spine.position.set(0, 0.12 * bodyScale, (-0.06 + sp * 0.1) * bodyScale);
      spine.rotation.x = 0.35;
      bugGroup.add(spine);
    }

    // Red Boss Aura Point Light
    const auraLight = new THREE.PointLight(0xef4444, 1.4, 7.0);
    auraLight.position.set(0, 0, 0);
    auraLight.name = 'bossAuraLight';
    bugGroup.add(auraLight);
  }

  // Boss Features for Midnight Mosquito (Level 5 Boss)
  if (type === 'boss_midnight') {
    const shadowSpineMat = new THREE.MeshStandardMaterial({
      color: 0x581c87,
      emissive: 0x3b0764,
      roughness: 0.3,
      metalness: 0.7,
    });

    // Jagged Dorsal Shadow Crest along thorax
    for (let s = 0; s < 4; s++) {
      const spine = new THREE.Mesh(new THREE.ConeGeometry(0.02 * bodyScale, 0.12 * bodyScale, 4), shadowSpineMat);
      spine.position.set(0, 0.11 * bodyScale, (-0.08 + s * 0.09) * bodyScale);
      spine.rotation.x = 0.4;
      bugGroup.add(spine);
    }

    // Shadow Horns
    for (let side of [-1, 1]) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.015 * bodyScale, 0.15 * bodyScale, 4), shadowSpineMat);
      horn.position.set(side * 0.04 * bodyScale, 0.10 * bodyScale, -0.18 * bodyScale);
      horn.rotation.z = side * 0.35;
      horn.rotation.x = -0.4;
      bugGroup.add(horn);
    }

    // Purple Glowing Stinger Tip
    const stingerSpark = new THREE.Mesh(
      new THREE.SphereGeometry(0.018 * bodyScale, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xc084fc })
    );
    stingerSpark.position.set(0, -0.18 * bodyScale, -0.41 * bodyScale);
    bugGroup.add(stingerSpark);

    // Purple Boss Aura Point Light
    const auraLight = new THREE.PointLight(0xa855f7, 2.0, 9.0);
    auraLight.position.set(0, 0, 0);
    auraLight.name = 'bossAuraLight';
    bugGroup.add(auraLight);
  }

  // Boss Features for The Invisible Mosquito (Level 6 Apex Mutant Boss)
  if (type === 'boss_invisible') {
    // Apex Mutant Scythe Claws on front legs
    const clawMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x10b981,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    for (let side of [-1, 1]) {
      const scythe = new THREE.Mesh(new THREE.ConeGeometry(0.018 * bodyScale, 0.22 * bodyScale, 4), clawMat);
      scythe.position.set(side * 0.25 * bodyScale, -0.28 * bodyScale, -0.12 * bodyScale);
      scythe.rotation.x = -0.8;
      scythe.rotation.z = side * 0.2;
      bugGroup.add(scythe);
    }

    // Emerald Apex Aura Point Light
    const auraLight = new THREE.PointLight(0x10b981, 2.2, 10.0);
    auraLight.position.set(0, 0, 0);
    auraLight.name = 'bossAuraLight';
    bugGroup.add(auraLight);
  }

  return bugGroup;
}

// ==========================================
// 3. BANGLADESHI ENVIRONMENT PROPS
// ==========================================

/**
 * Wooden Bed with Mosquito Net (Moshari) - The quintessential Dhaka bedroom icon!
 */
export function createBedWithMoshari(): THREE.Group {
  const bedGroup = new THREE.Group();
  const woodTexture = createWoodTexture();
  const bedsheetTexture = createBedsheetTexture();

  // 1. Heavy Sheesham/Teak Bed Frame
  const woodMat = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.7,
    color: 0x854d0e,
  });
  const frameGeo = new THREE.BoxGeometry(2.3, 0.28, 3.1);
  const frame = new THREE.Mesh(frameGeo, woodMat);
  frame.position.y = 0.35;
  frame.castShadow = true;
  frame.receiveShadow = true;
  bedGroup.add(frame);

  // Carved Wooden Headboard (North side)
  const headboardGeo = new THREE.BoxGeometry(2.35, 1.1, 0.12);
  const headboard = new THREE.Mesh(headboardGeo, woodMat);
  headboard.position.set(0, 0.85, -1.55);
  headboard.castShadow = true;
  bedGroup.add(headboard);

  // Headboard decorative top crown arch
  const archGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.12, 24, 1, false, 0, Math.PI);
  archGeo.rotateZ(Math.PI / 2);
  const arch = new THREE.Mesh(archGeo, woodMat);
  arch.position.set(0, 1.4, -1.55);
  bedGroup.add(arch);

  // 4 Turned wooden bed legs
  for (let x of [-1.05, 1.05]) {
    for (let z of [-1.45, 1.45]) {
      const legGeo = new THREE.CylinderGeometry(0.07, 0.05, 0.45, 12);
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(x, 0.15, z);
      leg.castShadow = true;
      bedGroup.add(leg);
    }
  }

  // 2. Mattress with authentic Nakshi Kantha bedsheet
  const mattressGeo = new THREE.BoxGeometry(2.2, 0.24, 2.95);
  const mattressMat = new THREE.MeshStandardMaterial({
    map: bedsheetTexture,
    roughness: 0.85,
  });
  const mattress = new THREE.Mesh(mattressGeo, mattressMat);
  mattress.position.set(0, 0.54, 0.02);
  mattress.castShadow = true;
  mattress.receiveShadow = true;
  bedGroup.add(mattress);

  // Two soft pillows with printed covers
  const pillowMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 });
  for (let p of [-0.55, 0.55]) {
    const pillowGeo = new THREE.BoxGeometry(0.75, 0.14, 0.48);
    const pillow = new THREE.Mesh(pillowGeo, pillowMat);
    pillow.position.set(p, 0.72, -1.1);
    pillow.rotation.x = 0.1;
    pillow.castShadow = true;
    bedGroup.add(pillow);
  }

  // 3. Mosquito Net Frame (4 bamboo/metal corner poles with tie strings)
  const bambooMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
  for (let x of [-1.15, 1.15]) {
    for (let z of [-1.55, 1.55]) {
      const poleGeo = new THREE.CylinderGeometry(0.022, 0.024, 2.2, 10);
      const pole = new THREE.Mesh(poleGeo, bambooMat);
      pole.position.set(x, 1.25, z);
      bedGroup.add(pole);

      // Corner tie ribbon
      const tieGeo = new THREE.TorusGeometry(0.035, 0.008, 6, 12);
      const tieMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const tie = new THREE.Mesh(tieGeo, tieMat);
      tie.rotation.x = Math.PI / 2;
      tie.position.set(x, 1.9, z);
      bedGroup.add(tie);
    }
  }

  // Bamboo cross rods along top
  const rodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
  const rodNorth = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 2.3, 8), rodMat);
  rodNorth.rotation.z = Math.PI / 2;
  rodNorth.position.set(0, 2.34, -1.55);
  bedGroup.add(rodNorth);

  const rodSouth = rodNorth.clone();
  rodSouth.position.z = 1.55;
  bedGroup.add(rodSouth);

  const rodWest = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 3.1, 8), rodMat);
  rodWest.rotation.x = Math.PI / 2;
  rodWest.position.set(-1.15, 2.34, 0);
  bedGroup.add(rodWest);

  const rodEast = rodWest.clone();
  rodEast.position.x = 1.15;
  bedGroup.add(rodEast);

  // 4. Sheer Lilac/Sky Translucent Mosquito Net (Moshari)
  const netMat = new THREE.MeshStandardMaterial({
    color: 0xfbcfe8, // Subtle classic pinkish-lilac Dhaka net
    transparent: true,
    opacity: 0.28,
    roughness: 0.5,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  // Top canopy roof
  const netRoof = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 3.1), netMat);
  netRoof.rotation.x = Math.PI / 2;
  netRoof.position.set(0, 2.33, 0);
  bedGroup.add(netRoof);

  // Side drapes
  const sideGeo = new THREE.PlaneGeometry(3.1, 1.7);
  const leftSide = new THREE.Mesh(sideGeo, netMat);
  leftSide.rotation.y = Math.PI / 2;
  leftSide.position.set(-1.15, 1.48, 0);
  bedGroup.add(leftSide);

  const rightSide = leftSide.clone();
  rightSide.position.x = 1.15;
  bedGroup.add(rightSide);

  const headSide = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.7), netMat);
  headSide.position.set(0, 1.48, -1.55);
  bedGroup.add(headSide);

  // Front drape (partially lifted flap at corner)
  const frontSide = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.1), netMat);
  frontSide.position.set(0, 1.78, 1.55);
  bedGroup.add(frontSide);

  return bedGroup;
}

/**
 * Large Wooden Wardrobe / Almirah (আলমারি) with center mirror
 */
export function createAlmirah(): THREE.Group {
  const almirah = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({
    map: createWoodTexture(),
    roughness: 0.65,
    color: 0x78350f,
  });

  // Main cabinet box
  const boxGeo = new THREE.BoxGeometry(1.6, 2.2, 0.75);
  const box = new THREE.Mesh(boxGeo, woodMat);
  box.position.y = 1.1;
  box.castShadow = true;
  box.receiveShadow = true;
  almirah.add(box);

  // Top decorative cornice
  const corniceGeo = new THREE.BoxGeometry(1.72, 0.12, 0.82);
  const cornice = new THREE.Mesh(corniceGeo, woodMat);
  cornice.position.y = 2.24;
  almirah.add(cornice);

  // Center Mirror Panel on right door
  const mirrorGeo = new THREE.PlaneGeometry(0.55, 1.6);
  const mirrorMat = new THREE.MeshStandardMaterial({
    color: 0xdbeafe,
    metalness: 0.95,
    roughness: 0.05,
  });
  const mirror = new THREE.Mesh(mirrorGeo, mirrorMat);
  mirror.position.set(0.35, 1.1, 0.38);
  almirah.add(mirror);

  // Brass Door Handles
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.2 });
  const handleL = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8), brassMat);
  handleL.position.set(-0.06, 1.1, 0.4);
  almirah.add(handleL);

  const handleR = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8), brassMat);
  handleR.position.set(0.06, 1.1, 0.4);
  almirah.add(handleR);

  // Brass Keyhole
  const keyhole = new THREE.Mesh(new THREE.CircleGeometry(0.016, 8), brassMat);
  keyhole.position.set(0, 0.98, 0.385);
  almirah.add(keyhole);

  return almirah;
}

/**
 * Bedside Table with Steel Thermos Flask, Chai Cup, and Burning Mosquito Coil!
 */
export function createBedsideTable(): THREE.Group {
  const table = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({
    map: createWoodTexture(),
    roughness: 0.7,
    color: 0x92400e,
  });

  // Table top & body
  const bodyGeo = new THREE.BoxGeometry(0.7, 0.65, 0.6);
  const body = new THREE.Mesh(bodyGeo, woodMat);
  body.position.y = 0.325;
  body.castShadow = true;
  body.receiveShadow = true;
  table.add(body);

  // Brass drawer knob
  const knobGeo = new THREE.SphereGeometry(0.016, 10, 10);
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 });
  const knob = new THREE.Mesh(knobGeo, brassMat);
  knob.position.set(0, 0.42, 0.31);
  table.add(knob);

  // Stainless Steel Thermos Flask (থার্মোফ্লাস্ক)
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.15 });
  const flaskGeo = new THREE.CylinderGeometry(0.06, 0.065, 0.28, 16);
  const flask = new THREE.Mesh(flaskGeo, steelMat);
  flask.position.set(-0.16, 0.79, 0.05);
  flask.castShadow = true;
  table.add(flask);

  // Flask plastic cap (red)
  const capGeo = new THREE.CylinderGeometry(0.05, 0.058, 0.06, 16);
  const cap = new THREE.Mesh(capGeo, new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
  cap.position.set(-0.16, 0.96, 0.05);
  table.add(cap);

  // Steel Tea Glass / Water Cup
  const cupGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.09, 12);
  const cup = new THREE.Mesh(cupGeo, steelMat);
  cup.position.set(-0.02, 0.695, 0.15);
  table.add(cup);

  // Steel Dish with burning Eagle Mosquito Coil on table!
  const dishGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.01, 16);
  const dish = new THREE.Mesh(dishGeo, steelMat);
  dish.position.set(0.18, 0.655, -0.05);
  table.add(dish);

  // Green spiral coil
  const coilMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.9 });
  for (let r = 0; r < 3; r++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.02 + r * 0.018, 0.005, 6, 16), coilMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0.18, 0.665, -0.05);
    table.add(ring);
  }

  // Glowing red ember tip
  const ember = new THREE.Mesh(
    new THREE.SphereGeometry(0.006, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0xff3b00 })
  );
  ember.position.set(0.23, 0.668, -0.05);
  table.add(ember);

  // Small soft ember point light
  const emberLight = new THREE.PointLight(0xff4500, 0.4, 0.8);
  emberLight.position.set(0.23, 0.68, -0.05);
  table.add(emberLight);

  return table;
}

/**
 * Window with Balcony Night Sky View, Security Iron Bars, and Floral Curtains
 */
export function createWindowWithCurtains(): THREE.Group {
  const windowGroup = new THREE.Group();

  // Dark wooden window frame
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 });
  const frameGeo = new THREE.BoxGeometry(0.14, 2.0, 2.6);
  const frame = new THREE.Mesh(frameGeo, frameMat);
  windowGroup.add(frame);

  // Outside night sky pane (with Dhaka night city glow)
  const skyMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
  const skyPane = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.8), skyMat);
  skyPane.rotation.y = Math.PI / 2;
  skyPane.position.set(-0.06, 0, 0);
  windowGroup.add(skyPane);

  // Distant glowing Dhaka city window dots in the dark
  for (let d = 0; d < 12; d++) {
    const winDot = new THREE.Mesh(
      new THREE.PlaneGeometry(0.04, 0.06),
      new THREE.MeshBasicMaterial({ color: Math.random() > 0.4 ? 0xfef08a : 0x38bdf8 })
    );
    winDot.rotation.y = Math.PI / 2;
    winDot.position.set(-0.058, -0.5 + Math.random() * 0.7, -1.0 + Math.random() * 2.0);
    windowGroup.add(winDot);
  }

  // Vertical iron security grill bars
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
  for (let b = -1.05; b <= 1.05; b += 0.22) {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.85, 8), ironMat);
    bar.position.set(0.02, 0, b);
    windowGroup.add(bar);
  }

  // Curtain rod along top
  const rodGeo = new THREE.CylinderGeometry(0.018, 0.018, 3.0, 8);
  const rodMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7, roughness: 0.3 });
  const rod = new THREE.Mesh(rodGeo, rodMat);
  rod.rotation.x = Math.PI / 2;
  rod.position.set(0.08, 1.05, 0);
  windowGroup.add(rod);

  // Left & right floral curtains
  const curtainTexture = createCurtainTexture();
  const curtainMat = new THREE.MeshStandardMaterial({
    map: curtainTexture,
    roughness: 0.85,
    side: THREE.DoubleSide,
  });

  const curtainL = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 1.95), curtainMat);
  curtainL.rotation.y = Math.PI / 2;
  curtainL.position.set(0.07, 0, -1.05);
  windowGroup.add(curtainL);

  const curtainR = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 1.95), curtainMat);
  curtainR.rotation.y = Math.PI / 2;
  curtainR.position.set(0.07, 0, 1.05);
  windowGroup.add(curtainR);

  return windowGroup;
}

/**
 * Wall Clock showing 11:30 PM (Story timestamp)
 */
export function createWallClock(): THREE.Group {
  const clockGroup = new THREE.Group();
  const clockTexture = createClockTexture();

  const caseGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.05, 32);
  caseGeo.rotateX(Math.PI / 2);
  const caseMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 });
  const casing = new THREE.Mesh(caseGeo, caseMat);
  clockGroup.add(casing);

  const dialGeo = new THREE.CircleGeometry(0.32, 32);
  const dialMat = new THREE.MeshBasicMaterial({ map: clockTexture });
  const dial = new THREE.Mesh(dialGeo, dialMat);
  dial.position.z = 0.028;
  clockGroup.add(dial);

  return clockGroup;
}

/**
 * Framed Dhaka Art Painting
 */
export function createFramedArt(): THREE.Group {
  const artGroup = new THREE.Group();

  // Golden / teak wood picture frame
  const frameGeo = new THREE.BoxGeometry(1.1, 0.85, 0.04);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.5, metalness: 0.3 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  artGroup.add(frame);

  const paintGeo = new THREE.PlaneGeometry(0.95, 0.7);
  const paintMat = new THREE.MeshBasicMaterial({ map: createPaintingTexture() });
  const paint = new THREE.Mesh(paintGeo, paintMat);
  paint.position.z = 0.025;
  artGroup.add(paint);

  return artGroup;
}

/**
 * Pair of Rubber Bathroom/House Slippers (স্যান্ডেল)
 */
export function createSlippers(): THREE.Group {
  const slippers = new THREE.Group();
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
  const strapMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });

  for (let s of [-0.1, 0.1]) {
    // Sole
    const soleGeo = new THREE.BoxGeometry(0.12, 0.02, 0.28);
    const sole = new THREE.Mesh(soleGeo, blueMat);
    sole.position.set(s, 0.01, 0);
    sole.castShadow = true;
    slippers.add(sole);

    // V-strap
    const strapGeo = new THREE.TorusGeometry(0.05, 0.008, 6, 12, Math.PI);
    const strap = new THREE.Mesh(strapGeo, strapMat);
    strap.position.set(s, 0.03, -0.04);
    slippers.add(strap);
  }

  return slippers;
}

/**
 * Ceiling Fan (Dhaka GFC/Pak Fan) with spinning blades
 */
export function createCeilingFan(): THREE.Group {
  const fanGroup = new THREE.Group();

  // Downrod
  const rodGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 12);
  const ivoryMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3, metalness: 0.1 });
  const rod = new THREE.Mesh(rodGeo, ivoryMat);
  rod.position.y = 0.35;
  fanGroup.add(rod);

  // Canopy cup
  const cupGeo = new THREE.ConeGeometry(0.08, 0.08, 16);
  const cup = new THREE.Mesh(cupGeo, ivoryMat);
  cup.position.y = 0.66;
  fanGroup.add(cup);

  // Motor dome housing
  const motorGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.12, 24);
  const motor = new THREE.Mesh(motorGeo, ivoryMat);
  fanGroup.add(motor);

  // Chrome trim ring
  const ringGeo = new THREE.TorusGeometry(0.17, 0.015, 8, 24);
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.1 });
  const ring = new THREE.Mesh(ringGeo, chromeMat);
  ring.rotation.x = Math.PI / 2;
  fanGroup.add(ring);

  // 3 long blades
  const bladesGroup = new THREE.Group();
  bladesGroup.name = 'ceilingBlades';
  for (let b = 0; b < 3; b++) {
    const bladeGeo = new THREE.BoxGeometry(0.13, 0.01, 0.9);
    const blade = new THREE.Mesh(bladeGeo, ivoryMat);
    blade.position.z = 0.49;
    blade.rotation.x = 0.1; // aerodynamic tilt
    const pivot = new THREE.Group();
    pivot.rotation.y = (b * 2 * Math.PI) / 3;
    pivot.add(blade);
    bladesGroup.add(pivot);
  }
  fanGroup.add(bladesGroup);

  return fanGroup;
}

/**
 * Typical Bangladeshi Plastic Chair (RFL / National molded plastic)
 */
export function createPlasticChair(colorHex: number = 0xdc2626): THREE.Group {
  const chairGroup = new THREE.Group();
  const chairMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.35 });

  // Seat
  const seatGeo = new THREE.BoxGeometry(0.55, 0.04, 0.52);
  const seat = new THREE.Mesh(seatGeo, chairMat);
  seat.position.y = 0.45;
  chairGroup.add(seat);

  // 4 Slanted plastic legs
  for (let x of [-0.22, 0.22]) {
    for (let z of [-0.2, 0.2]) {
      const legGeo = new THREE.CylinderGeometry(0.02, 0.016, 0.45, 8);
      const leg = new THREE.Mesh(legGeo, chairMat);
      leg.position.set(x, 0.225, z);
      leg.rotation.z = x > 0 ? -0.1 : 0.1;
      leg.rotation.x = z > 0 ? 0.1 : -0.1;
      chairGroup.add(leg);
    }
  }

  // Curved backrest with ventilation slots
  const backGeo = new THREE.BoxGeometry(0.52, 0.55, 0.04);
  const back = new THREE.Mesh(backGeo, chairMat);
  back.position.set(0, 0.72, -0.24);
  chairGroup.add(back);

  // Left & right armrests
  for (let side of [-0.26, 0.26]) {
    const armGeo = new THREE.BoxGeometry(0.05, 0.03, 0.4);
    const arm = new THREE.Mesh(armGeo, chairMat);
    arm.position.set(side, 0.62, -0.05);
    chairGroup.add(arm);
  }

  return chairGroup;
}

/**
 * Vintage Refrigerator (Searchable food/drink container!)
 */
export function createOldFridge(): THREE.Group {
  const fridgeGroup = new THREE.Group();
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4, metalness: 0.1 });

  // Main body
  const bodyGeo = new THREE.BoxGeometry(0.85, 1.7, 0.75);
  const body = new THREE.Mesh(bodyGeo, whiteMat);
  body.position.y = 0.85;
  fridgeGroup.add(body);

  // Freezer door seam & handle
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
  const handle1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8), handleMat);
  handle1.position.set(0.38, 1.35, 0.4);
  fridgeGroup.add(handle1);

  const handle2 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.35, 8), handleMat);
  handle2.position.set(0.38, 0.75, 0.4);
  fridgeGroup.add(handle2);

  // Kelvinator badge
  const badgeMat = new THREE.MeshBasicMaterial({ color: 0x1d4ed8 });
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.01), badgeMat);
  badge.position.set(0, 1.55, 0.38);
  fridgeGroup.add(badge);

  return fridgeGroup;
}

/**
 * Fuse Box / Circuit Breaker (Key interaction for load shedding events!)
 */
export function createFuseBox(): THREE.Group {
  const boxGroup = new THREE.Group();
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 });

  // Main enclosure
  const enclGeo = new THREE.BoxGeometry(0.35, 0.45, 0.12);
  const encl = new THREE.Mesh(enclGeo, metalMat);
  boxGroup.add(encl);

  // Warning lightning bolt decal
  const warnMat = new THREE.MeshBasicMaterial({ color: 0xeab308 });
  const warn = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.01), warnMat);
  warn.position.set(0, 0.1, 0.065);
  boxGroup.add(warn);

  // Main red trip switch lever
  const switchGeo = new THREE.BoxGeometry(0.04, 0.08, 0.06);
  const switchMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
  const tripSwitch = new THREE.Mesh(switchGeo, switchMat);
  tripSwitch.position.set(0, -0.06, 0.07);
  tripSwitch.name = 'fuseSwitch';
  boxGroup.add(tripSwitch);

  // Indicator light
  const indGeo = new THREE.SphereGeometry(0.018, 8, 8);
  const indMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  const ind = new THREE.Mesh(indGeo, indMat);
  ind.position.set(0.09, 0.12, 0.065);
  ind.name = 'fuseIndicator';
  boxGroup.add(ind);

  return boxGroup;
}

/**
 * Rooftop Gazi Water Tank (Black ribbed cylindrical plastic tank)
 */
export function createWaterTank(): THREE.Group {
  const tankGroup = new THREE.Group();
  const plasticMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });

  // Tank cylinder
  const tankGeo = new THREE.CylinderGeometry(0.9, 0.9, 1.8, 20);
  const tank = new THREE.Mesh(tankGeo, plasticMat);
  tank.position.y = 0.9;
  tankGroup.add(tank);

  // Lid on top
  const lidGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.15, 16);
  const lid = new THREE.Mesh(lidGeo, plasticMat);
  lid.position.y = 1.85;
  tankGroup.add(lid);

  // Horizontal structural reinforcing ribs
  for (let r = 0; r < 4; r++) {
    const ribGeo = new THREE.TorusGeometry(0.91, 0.025, 8, 24);
    const rib = new THREE.Mesh(ribGeo, plasticMat);
    rib.rotation.x = Math.PI / 2;
    rib.position.y = 0.35 + r * 0.38;
    tankGroup.add(rib);
  }

  // PVC overflow pipe
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 });
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8), pipeMat);
  pipe.position.set(0.95, 0.8, 0);
  tankGroup.add(pipe);

  return tankGroup;
}

/**
 * Rooftop Clothesline with drying Lungi & Saree
 */
export function createClothesline(): THREE.Group {
  const lineGroup = new THREE.Group();

  // 2 Bamboo supporting T-poles
  const bambooMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
  for (let x of [-2.5, 2.5]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 2.0, 8), bambooMat);
    pole.position.set(x, 1.0, 0);
    lineGroup.add(pole);

    const cross = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.8, 8), bambooMat);
    cross.rotation.z = Math.PI / 2;
    cross.position.set(x, 1.95, 0);
    lineGroup.add(cross);
  }

  // Wire
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x4b5563 });
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 5.0, 6), wireMat);
  wire.rotation.z = Math.PI / 2;
  wire.position.y = 1.95;
  lineGroup.add(wire);

  // Hanging Lungi (Bengali check pattern)
  const lungiTexture = createLungiTexture();
  const lungiMat = new THREE.MeshStandardMaterial({ map: lungiTexture, roughness: 0.8, side: THREE.DoubleSide });
  const lungiGeo = new THREE.PlaneGeometry(1.2, 1.1);
  const lungi = new THREE.Mesh(lungiGeo, lungiMat);
  lungi.position.set(-0.8, 1.4, 0);
  lungi.rotation.x = 0.05;
  lineGroup.add(lungi);

  // Hanging Saree (Vibrant red & yellow Bengali traditional saree)
  const sareeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.8, side: THREE.DoubleSide });
  const saree = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.2), sareeMat);
  saree.position.set(1.0, 1.35, 0);
  saree.rotation.x = -0.05;
  lineGroup.add(saree);

  return lineGroup;
}

/**
 * Authentic Dhaka Cycle Rickshaw (High Fidelity Cartoon 3D)
 * Features spoked wheels, decorative hood, passenger rexine bench,
 * puller saddle, chrome bell, and famous Dhaka rickshaw painted art plate.
 */
export function createRickshaw(hoodColorHex = 0xfacc15, frameColorHex = 0x1e3a8a): THREE.Group {
  const rickshaw = new THREE.Group();
  rickshaw.name = 'dhakaRickshaw';

  // 1. Tubular Steel Frame & Chassis
  const frameMat = new THREE.MeshStandardMaterial({
    color: frameColorHex,
    roughness: 0.35,
    metalness: 0.65,
  });
  const chromeMat = ArtMaterials.metal('chrome');
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.95 });
  const spokeMat = new THREE.MeshStandardMaterial({ color: 0xe4e4e7, metalness: 0.9, roughness: 0.2 });

  // Main chassis longitudinal spine
  const mainSpine = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 8), frameMat);
  mainSpine.rotation.x = Math.PI / 2;
  mainSpine.position.set(0, 0.45, 0.2);
  rickshaw.add(mainSpine);

  // Rear differential axle tube
  const rearAxle = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 1.45, 8), frameMat);
  rearAxle.rotation.z = Math.PI / 2;
  rearAxle.position.set(0, 0.42, 0.85);
  rickshaw.add(rearAxle);

  // Front bicycle steering fork
  const forkLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.82, 8), chromeMat);
  forkLeft.position.set(-0.08, 0.65, -0.95);
  forkLeft.rotation.x = -0.3;
  rickshaw.add(forkLeft);

  const forkRight = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.82, 8), chromeMat);
  forkRight.position.set(0.08, 0.65, -0.95);
  forkRight.rotation.x = -0.3;
  rickshaw.add(forkRight);

  // 2. Wheels with Radial Spokes
  function buildSpokedWheel(radius = 0.42, width = 0.04): THREE.Group {
    const wheel = new THREE.Group();
    // Black rubber tire
    const tire = new THREE.Mesh(new THREE.TorusGeometry(radius, width, 10, 24), tireMat);
    tire.castShadow = true;
    wheel.add(tire);

    // Chrome rim
    const rim = new THREE.Mesh(new THREE.TorusGeometry(radius - width * 0.7, 0.015, 8, 24), chromeMat);
    wheel.add(rim);

    // Center Hub
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 12), chromeMat);
    hub.rotation.x = Math.PI / 2;
    wheel.add(hub);

    // 8 Radial Spokes (wire pairs)
    for (let s = 0; s < 8; s++) {
      const ang = (s * Math.PI) / 4;
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, radius * 1.85, 4), spokeMat);
      spoke.rotation.z = ang;
      wheel.add(spoke);
    }
    return wheel;
  }

  // Front 28" bicycle wheel
  const frontWheel = buildSpokedWheel(0.38, 0.035);
  frontWheel.position.set(0, 0.38, -1.18);
  rickshaw.add(frontWheel);

  // Front chrome mudguard
  const frontGuard = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.022, 6, 16, Math.PI * 0.75),
    chromeMat
  );
  frontGuard.rotation.y = Math.PI / 2;
  frontGuard.rotation.x = -Math.PI / 2.8;
  frontGuard.position.set(0, 0.38, -1.18);
  rickshaw.add(frontGuard);

  // Rear 28" Wheels
  for (let side of [-0.68, 0.68]) {
    const rearWheel = buildSpokedWheel(0.42, 0.04);
    rearWheel.position.set(side, 0.42, 0.85);
    rickshaw.add(rearWheel);

    // Rear painted tin mudguards
    const rearGuard = new THREE.Mesh(
      new THREE.TorusGeometry(0.46, 0.035, 6, 16, Math.PI * 0.8),
      frameMat
    );
    rearGuard.rotation.y = Math.PI / 2;
    rearGuard.rotation.x = -Math.PI / 2.5;
    rearGuard.position.set(side, 0.42, 0.85);
    rickshaw.add(rearGuard);
  }

  // 3. Passenger Carriage Body & Footboard
  const bodyWoodMat = ArtMaterials.wood(false, 0x451a03);
  const footboard = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.04, 0.48), bodyWoodMat);
  footboard.position.set(0, 0.44, 0.32);
  footboard.castShadow = true;
  rickshaw.add(footboard);

  // Passenger seat bench (Plush red rexine with button tufting)
  const seatMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.35,
    metalness: 0.1,
  });
  const seatBase = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.18, 0.58), seatMat);
  seatBase.position.set(0, 0.76, 0.75);
  seatBase.castShadow = true;
  rickshaw.add(seatBase);

  // Curved passenger backrest
  const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.48, 0.12), seatMat);
  backrest.position.set(0, 1.05, 1.02);
  backrest.rotation.x = -0.15;
  backrest.castShadow = true;
  rickshaw.add(backrest);

  // Curved decorative brass/yellow armrests
  const armMat = ArtMaterials.metal('brass');
  for (let a of [-0.52, 0.52]) {
    const armrest = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.42, 8), armMat);
    armrest.rotation.x = Math.PI / 2.4;
    armrest.position.set(a, 0.95, 0.78);
    rickshaw.add(armrest);
  }

  // 4. Arched Folding Hood (Canopy) with High-Contrast Canvas
  const hoodMat = new THREE.MeshStandardMaterial({
    color: hoodColorHex,
    roughness: 0.65,
    side: THREE.DoubleSide,
  });
  const hood = new THREE.Mesh(
    new THREE.CylinderGeometry(0.58, 0.62, 1.1, 16, 1, false, 0, Math.PI * 0.95),
    hoodMat
  );
  hood.rotation.z = Math.PI / 2;
  hood.rotation.y = Math.PI * 0.08;
  hood.position.set(0, 1.35, 0.92);
  hood.castShadow = true;
  rickshaw.add(hood);

  // Chrome hood frame rib bows
  for (let r = 0; r < 3; r++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.60, 0.012, 6, 16, Math.PI), chromeMat);
    rib.rotation.y = Math.PI / 2;
    rib.rotation.x = -0.2 + r * 0.35;
    rib.position.set(0, 1.34, 0.90 + (r - 1) * 0.18);
    rickshaw.add(rib);
  }

  // 5. Authentic Dhaka Rickshaw Art Painted Tin Backplate
  const plateGeo = new THREE.PlaneGeometry(0.96, 0.42);
  const plateMat = new THREE.MeshStandardMaterial({
    map: createRickshawArtTexture(),
    roughness: 0.3,
    metalness: 0.2,
    side: THREE.DoubleSide,
  });
  const artPlate = new THREE.Mesh(plateGeo, plateMat);
  artPlate.position.set(0, 0.52, 1.14);
  rickshaw.add(artPlate);

  // Decorative plastic fringe/tassels dangling beneath art plate
  const tasselMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  for (let t = -4; t <= 4; t++) {
    const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.08, 4), tasselMat);
    tassel.position.set(t * 0.1, 0.28, 1.14);
    rickshaw.add(tassel);
  }

  // 6. Rickshaw Puller Controls (Saddle, Handlebar & Bell)
  const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.28), tireMat);
  saddle.position.set(0, 0.88, -0.32);
  rickshaw.add(saddle);

  const saddlePost = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8), chromeMat);
  saddlePost.position.set(0, 0.65, -0.32);
  rickshaw.add(saddlePost);

  // Chrome handlebars with rubber grips
  const barStem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.36, 8), chromeMat);
  barStem.position.set(0, 1.02, -0.88);
  barStem.rotation.x = -0.25;
  rickshaw.add(barStem);

  const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.72, 8), chromeMat);
  handlebar.rotation.z = Math.PI / 2;
  handlebar.position.set(0, 1.18, -0.84);
  rickshaw.add(handlebar);

  // Rubber hand grips
  for (let g of [-0.34, 0.34]) {
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 8), tireMat);
    grip.rotation.z = Math.PI / 2;
    grip.position.set(g, 1.18, -0.84);
    rickshaw.add(grip);
  }

  // Classic Bangladeshi brass "Ding-Dong" bell
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), armMat);
  bell.position.set(-0.22, 1.22, -0.84);
  rickshaw.add(bell);

  // Pedals & Crankset
  const crank = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12), chromeMat);
  crank.rotation.z = Math.PI / 2;
  crank.position.set(0, 0.45, -0.32);
  rickshaw.add(crank);

  return rickshaw;
}

/**
 * Authentic Roadside "Tong" Tea Stall (Chayer Tong)
 * Features slanted corrugated tin roof, varnished wooden counter,
 * brass boiling kettle, kerosene stove, condensed milk cans,
 * glass biscuit jars, tea glasses, wooden bench, and warm glowing bulb.
 */
export function createTeaStall(): THREE.Group {
  const stall = new THREE.Group();
  stall.name = 'dhakaTongTeaStall';

  const woodMat = ArtMaterials.wood(true, 0x652b0d);
  const roughWoodMat = ArtMaterials.wood(false, 0x451a03);

  // 1. Wooden Serving Counter
  const counter = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.95, 0.9), woodMat);
  counter.position.set(0, 0.475, 0);
  counter.castShadow = true;
  counter.receiveShadow = true;
  stall.add(counter);

  // Polished glossy top plank
  const topPlank = new THREE.Mesh(
    new THREE.BoxGeometry(2.35, 0.05, 1.05),
    ArtMaterials.wood(true, 0x78350f)
  );
  topPlank.position.set(0, 0.975, 0);
  topPlank.castShadow = true;
  stall.add(topPlank);

  // 2. Corrugated Tin Roof Awning supported by bamboo/wood corner posts
  const postMat = ArtMaterials.wood(false, 0x713f12);
  for (let px of [-1.15, 1.15]) {
    for (let pz of [-0.48, 0.48]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.3, 8), postMat);
      post.position.set(px, 1.15, pz);
      post.castShadow = true;
      stall.add(post);
    }
  }

  // Slanted Corrugated Tin Canopy Roof
  const roofMat = new THREE.MeshStandardMaterial({
    map: createCorrugatedShutterTexture('#475569'),
    roughness: 0.6,
    metalness: 0.4,
    side: THREE.DoubleSide,
  });
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.4), roofMat);
  roof.rotation.x = Math.PI / 2.3;
  roof.position.set(0, 2.3, 0.1);
  roof.castShadow = true;
  stall.add(roof);

  // 3. Hanging Glowing Bengali Signboard: "চায়ের দোকান"
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 0.45),
    new THREE.MeshBasicMaterial({
      map: createBengaliShopSignTexture('ভাই ভাই টি স্টল', 'স্পেশাল মালাই চা ও টোস্ট বিস্কুট', 'tea'),
    })
  );
  signMesh.position.set(0, 2.05, 0.58);
  stall.add(signMesh);

  // 4. Large Brass/Tin Boiling Tea Kettle (Kettli)
  const brassKettleMat = ArtMaterials.metal('brass');
  const kettleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.28, 16), brassKettleMat);
  kettleBody.position.set(-0.55, 1.14, 0.08);
  kettleBody.castShadow = true;
  stall.add(kettleBody);

  // Kettle lid & handle
  const kettleLid = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), brassKettleMat);
  kettleLid.position.set(-0.55, 1.28, 0.08);
  stall.add(kettleLid);

  const kettleHandle = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.015, 6, 12, Math.PI), brassKettleMat);
  kettleHandle.position.set(-0.55, 1.34, 0.08);
  stall.add(kettleHandle);

  // Curved spout
  const spout = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.18, 8), brassKettleMat);
  spout.rotation.z = -Math.PI / 3;
  spout.position.set(-0.38, 1.22, 0.08);
  stall.add(spout);

  // Portable Kerosene Burner Stove beneath kettle
  const stoveMat = ArtMaterials.metal('dark');
  const stove = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16), stoveMat);
  stove.position.set(-0.55, 1.04, 0.08);
  stall.add(stove);

  // Blue kerosene flame glow
  const flameMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), flameMat);
  flame.position.set(-0.55, 1.10, 0.08);
  stall.add(flame);

  // 5. Stacked Condensed Milk Tin Cans ("Star Milk")
  const canMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, metalness: 0.6, roughness: 0.3 });
  for (let row = 0; row < 2; row++) {
    for (let c = 0; c < 3 - row; c++) {
      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.10, 12), canMat);
      can.position.set(-0.05 + c * 0.11 + row * 0.055, 1.05 + row * 0.105, -0.22);
      can.castShadow = true;
      stall.add(can);
    }
  }

  // 6. Glass Biscuit & Chanachur Jars with Red Plastic Lids
  const glassMat = ArtMaterials.glass(0xffffff, 0.5);
  const redLidMat = ArtMaterials.plastic(0xdc2626, true);

  for (let j = 0; j < 2; j++) {
    const jarX = 0.55 + j * 0.32;
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.32, 14), glassMat);
    jar.position.set(jarX, 1.16, -0.15);
    jar.castShadow = true;
    stall.add(jar);

    // Biscuit fill inside jar
    const fillMat = new THREE.MeshStandardMaterial({
      color: j === 0 ? 0xd97706 : 0xfacc15,
      roughness: 0.9,
    });
    const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.24, 10), fillMat);
    fill.position.set(jarX, 1.12, -0.15);
    stall.add(fill);

    // Red screw lid
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 14), redLidMat);
    lid.position.set(jarX, 1.34, -0.15);
    stall.add(lid);
  }

  // 7. Six Classic Dhaka Glass Tea Cups (কাঁচের চা গ্লাস) with Amber Tea
  const teaFillMat = new THREE.MeshBasicMaterial({ color: 0x9a3412 });
  for (let g = 0; g < 6; g++) {
    const gx = 0.2 + (g % 3) * 0.12;
    const gz = 0.16 + Math.floor(g / 3) * 0.14;

    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.026, 0.08, 12), glassMat);
    cup.position.set(gx, 1.04, gz);
    stall.add(cup);

    const tea = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.024, 0.06, 10), teaFillMat);
    tea.position.set(gx, 1.03, gz);
    stall.add(tea);
  }

  // 8. Long Roadside Wooden Bench (টংয়ের বেঞ্চ)
  const bench = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 0.38), roughWoodMat);
  bench.position.set(0, 0.44, 1.15);
  bench.castShadow = true;
  stall.add(bench);

  for (let bx of [-0.95, 0.95]) {
    const bLeg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.34), roughWoodMat);
    bLeg.position.set(bx, 0.21, 1.15);
    bLeg.castShadow = true;
    stall.add(bLeg);
  }

  // 9. Hanging 60W Bare Incandescent Filament Light Bulb in Tin Reflector
  const shadeMat = ArtMaterials.metal('dark', 0x334155);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.08, 12, 1, true), shadeMat);
  shade.position.set(0, 1.95, 0.15);
  stall.add(shade);

  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), bulbMat);
  bulb.position.set(0, 1.91, 0.15);
  stall.add(bulb);

  // Warm Golden Tea Stall Light Pool
  const stallLight = new THREE.PointLight(0xf59e0b, 1.9, 8.0);
  stallLight.position.set(0, 1.9, 0.15);
  stallLight.castShadow = true;
  stall.add(stallLight);

  return stall;
}

/**
 * Detailed Bangladeshi Wooden Study Table with books, lamp, pen stand & phone with charging cable
 */
export function createStudyTable(): THREE.Group {
  const tableGroup = new THREE.Group();
  const woodMat = ArtMaterials.wood(true);

  // Tabletop surface
  const topGeo = new THREE.BoxGeometry(1.4, 0.05, 0.75);
  const top = new THREE.Mesh(topGeo, woodMat);
  top.position.y = 0.75;
  top.castShadow = true;
  top.receiveShadow = true;
  tableGroup.add(top);

  // 4 Sturdy Square Teak Legs
  for (let x of [-0.64, 0.64]) {
    for (let z of [-0.32, 0.32]) {
      const legGeo = new THREE.BoxGeometry(0.06, 0.73, 0.06);
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(x, 0.365, z);
      leg.castShadow = true;
      tableGroup.add(leg);
    }
  }

  // Right Drawer Unit
  const drawerUnitGeo = new THREE.BoxGeometry(0.38, 0.32, 0.66);
  const drawerUnit = new THREE.Mesh(drawerUnitGeo, woodMat);
  drawerUnit.position.set(0.46, 0.56, 0);
  drawerUnit.castShadow = true;
  tableGroup.add(drawerUnit);

  // Brass Drawer Knobs
  const knobMat = ArtMaterials.metal('brass');
  for (let d of [0.63, 0.49]) {
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), knobMat);
    knob.position.set(0.46, d, 0.34);
    tableGroup.add(knob);
  }

  // Stack of 3 Books / Notebooks on the desk
  const bookColors = [0x991b1b, 0x1e3a8a, 0x166534]; // Red, Navy, Green textbooks
  for (let b = 0; b < 3; b++) {
    const bookGeo = new THREE.BoxGeometry(0.22, 0.024, 0.28);
    const bookMat = new THREE.MeshStandardMaterial({ color: bookColors[b], roughness: 0.8 });
    const book = new THREE.Mesh(bookGeo, bookMat);
    book.position.set(-0.45, 0.785 + b * 0.026, -0.15);
    book.rotation.y = (b - 1) * 0.08;
    book.castShadow = true;
    tableGroup.add(book);
  }

  // Gooseneck Study Desk Lamp
  const lampMat = ArtMaterials.metal('chrome', 0x334155);
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.07, 0.016, 16), lampMat);
  lampBase.position.set(-0.52, 0.78, 0.22);
  tableGroup.add(lampBase);

  const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.28, 8), lampMat);
  lampStem.position.set(-0.52, 0.92, 0.22);
  lampStem.rotation.x = -0.3;
  tableGroup.add(lampStem);

  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.12, 16, 1, true), lampMat);
  lampShade.position.set(-0.52, 1.05, 0.14);
  lampShade.rotation.x = 1.1;
  tableGroup.add(lampShade);

  // Warm bulb inside shade with soft point light
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), bulbMat);
  bulb.position.set(-0.52, 1.04, 0.13);
  tableGroup.add(bulb);

  // Pen Stand with pens
  const penStandMat = ArtMaterials.plastic(0x0284c7);
  const penStand = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.09, 12), penStandMat);
  penStand.position.set(-0.25, 0.82, -0.22);
  tableGroup.add(penStand);

  // Smartphone on desk with white charging cable
  const phoneMat = ArtMaterials.metal('dark', 0x1e293b);
  const phone = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.008, 0.15), phoneMat);
  phone.position.set(-0.15, 0.78, 0.1);
  phone.rotation.y = 0.25;
  tableGroup.add(phone);

  // White charging cable extending from phone
  const cableMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
  const cableGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.45, 6);
  const cable = new THREE.Mesh(cableGeo, cableMat);
  cable.position.set(-0.22, 0.78, 0.25);
  cable.rotation.z = Math.PI / 2.3;
  tableGroup.add(cable);

  return tableGroup;
}

/**
 * Wooden Study Desk Chair with carved back slats
 */
export function createDeskChair(): THREE.Group {
  const chair = new THREE.Group();
  const woodMat = ArtMaterials.wood(true);

  // Seat
  const seatGeo = new THREE.BoxGeometry(0.48, 0.035, 0.45);
  const seat = new THREE.Mesh(seatGeo, woodMat);
  seat.position.y = 0.44;
  seat.castShadow = true;
  chair.add(seat);

  // 4 Legs
  for (let x of [-0.2, 0.2]) {
    for (let z of [-0.18, 0.18]) {
      const legGeo = new THREE.CylinderGeometry(0.022, 0.018, 0.44, 10);
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(x, 0.22, z);
      leg.castShadow = true;
      chair.add(leg);
    }
  }

  // Backrest uprights and slats
  for (let x of [-0.2, 0.2]) {
    const uprightGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.48, 10);
    const upright = new THREE.Mesh(uprightGeo, woodMat);
    upright.position.set(x, 0.68, -0.2);
    chair.add(upright);
  }

  // Top curved back bar
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.06, 0.03), woodMat);
  topBar.position.set(0, 0.9, -0.2);
  chair.add(topBar);

  // 3 Vertical back slats
  for (let s of [-0.1, 0, 0.1]) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.36, 0.015), woodMat);
    slat.position.set(s, 0.68, -0.2);
    chair.add(slat);
  }

  return chair;
}

/**
 * Authentic Bangladeshi Wall Switch Gang (Switchboard with pilot light & charger plug)
 */
export function createSwitchboard(): THREE.Group {
  const board = new THREE.Group();
  board.name = 'switchboard';

  // White plastic faceplate
  const plateMat = ArtMaterials.plastic(0xf8fafc);
  const plateGeo = new THREE.BoxGeometry(0.24, 0.18, 0.02);
  const plate = new THREE.Mesh(plateGeo, plateMat);
  board.add(plate);

  // 4 Miniature Rocker Switches
  const switchMat = ArtMaterials.plastic(0xe2e8f0);
  for (let i = 0; i < 4; i++) {
    const sw = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.015), switchMat);
    sw.position.set(-0.075 + i * 0.05, 0.02, 0.015);
    board.add(sw);
  }

  // Red Neon Pilot Indicator Light (গ্লোয়িং লাল বাতি)
  const indMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const indicator = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), indMat);
  indicator.position.set(0.08, 0.05, 0.015);
  indicator.name = 'switchboardPilotLight';
  board.add(indicator);

  // 3-Pin Socket with Charger Adapter Plugged In
  const socketMat = ArtMaterials.plastic(0x334155);
  const charger = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.045, 0.06), socketMat);
  charger.position.set(0, -0.045, 0.04);
  board.add(charger);

  // Cable hanging down
  const cableMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.5, 6), cableMat);
  cable.position.set(0, -0.29, 0.04);
  board.add(cable);

  return board;
}

/**
 * Traditional Bangladeshi Plastic Water Bucket & Bodna/Mug
 */
export function createRoomBucket(): THREE.Group {
  const bucketGroup = new THREE.Group();

  // Red plastic water bucket
  const bucketMat = ArtMaterials.plastic(0xb91c1c);
  const bucketGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.35, 16);
  const bucket = new THREE.Mesh(bucketGeo, bucketMat);
  bucket.position.y = 0.175;
  bucket.castShadow = true;
  bucketGroup.add(bucket);

  // Metal swing handle
  const handleMat = ArtMaterials.metal('chrome');
  const handleGeo = new THREE.TorusGeometry(0.18, 0.008, 6, 16, Math.PI);
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.rotation.z = Math.PI;
  handle.rotation.x = 0.3;
  handle.position.set(0, 0.33, 0.05);
  bucketGroup.add(handle);

  // Blue plastic bath mug / bodna beside bucket
  const mugMat = ArtMaterials.plastic(0x0284c7);
  const mugGeo = new THREE.CylinderGeometry(0.07, 0.055, 0.12, 12);
  const mug = new THREE.Mesh(mugGeo, mugMat);
  mug.position.set(0.24, 0.06, 0.08);
  bucketGroup.add(mug);

  return bucketGroup;
}

/**
 * Wall-Mounted Clothes Rack with hanging towel/lungi
 */
export function createClothesHanger(): THREE.Group {
  const hangerGroup = new THREE.Group();
  const woodMat = ArtMaterials.wood(true);

  // Wooden back bar
  const barGeo = new THREE.BoxGeometry(0.8, 0.08, 0.02);
  const bar = new THREE.Mesh(barGeo, woodMat);
  hangerGroup.add(bar);

  // 4 Brass hooks
  const hookMat = ArtMaterials.metal('brass');
  for (let h = 0; h < 4; h++) {
    const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.05, 8), hookMat);
    hook.rotation.x = -Math.PI / 3;
    hook.position.set(-0.3 + h * 0.2, 0, 0.03);
    hangerGroup.add(hook);
  }

  // Draped Cotton Lungi on one hook
  const lungiMat = ArtMaterials.fabric(0x1e3a8a);
  const lungiGeo = new THREE.BoxGeometry(0.25, 0.65, 0.05);
  const lungi = new THREE.Mesh(lungiGeo, lungiMat);
  lungi.position.set(-0.1, -0.32, 0.04);
  lungi.castShadow = true;
  hangerGroup.add(lungi);

  return hangerGroup;
}

/**
 * Giant Mutant Mosquito Wall Shadow Projector Plane (Cinematic Power-Cut Event)
 */
export function createGiantMosquitoShadow(): THREE.Group {
  const shadowGroup = new THREE.Group();
  shadowGroup.name = 'giantMosquitoShadowGroup';

  // Canvas texture representing the menacing shadow silhouette of the giant mosquito
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 512);

  // Deep shadow silhouette
  ctx.fillStyle = 'rgba(7, 10, 16, 0.88)';

  // Main thorax & head
  ctx.beginPath();
  ctx.ellipse(256, 260, 42, 60, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(256, 175, 30, 32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Menacing long proboscis needle
  ctx.beginPath();
  ctx.moveTo(256, 175);
  ctx.lineTo(240, 70);
  ctx.lineWidth = 9;
  ctx.strokeStyle = 'rgba(7, 10, 16, 0.95)';
  ctx.stroke();

  // Elongated segmented curved abdomen
  ctx.beginPath();
  ctx.moveTo(256, 310);
  ctx.quadraticCurveTo(280, 420, 265, 480);
  ctx.quadraticCurveTo(240, 420, 256, 310);
  ctx.fill();

  // Giant menacing spread wings
  // Left Wing
  ctx.beginPath();
  ctx.moveTo(235, 230);
  ctx.bezierCurveTo(90, 120, 30, 200, 40, 290);
  ctx.bezierCurveTo(90, 310, 180, 270, 235, 250);
  ctx.fill();

  // Right Wing
  ctx.beginPath();
  ctx.moveTo(277, 230);
  ctx.bezierCurveTo(422, 120, 482, 200, 472, 290);
  ctx.bezierCurveTo(422, 310, 332, 270, 277, 250);
  ctx.fill();

  // 6 Creepy spindly bent insect legs
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  const legCoords = [
    // Left legs
    [[230, 235], [130, 200], [70, 270]],
    [[225, 260], [110, 275], [60, 370]],
    [[230, 285], [120, 350], [80, 450]],
    // Right legs
    [[282, 235], [382, 200], [442, 270]],
    [[287, 260], [402, 275], [452, 370]],
    [[282, 285], [392, 350], [432, 450]],
  ];

  legCoords.forEach((pts) => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    ctx.lineTo(pts[1][0], pts[1][1]);
    ctx.lineTo(pts[2][0], pts[2][1]);
    ctx.stroke();
  });

  const shadowTexture = new THREE.CanvasTexture(canvas);
  shadowTexture.colorSpace = THREE.SRGBColorSpace;

  const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.0, // starts invisible, fades in during power outage!
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.name = 'giantMosquitoShadowMesh';
  shadowGroup.add(shadowMesh);

  return shadowGroup;
}

// ==========================================
// 4. STAGE 3: ROOFTOP & DENGUE ARENA ASSETS
// ==========================================

/**
 * Terracotta Rooftop Flower Pots (টব) with tropical leaves & marigolds
 */
export function createRooftopPlantPots(): THREE.Group {
  const potsGroup = new THREE.Group();
  const potMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 }); // Baked terracotta
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95 });
  const leafMat = ArtMaterials.vegetation(0x15803d);

  // 1. Large Pot with Tropical Broad Leaves (Money Plant)
  const pot1 = new THREE.Group();
  const pot1Mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.20, 0.45, 12), potMat);
  pot1Mesh.position.y = 0.225;
  pot1Mesh.castShadow = true;
  pot1.add(pot1Mesh);

  const soil1 = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.05, 12), soilMat);
  soil1.position.y = 0.43;
  pot1.add(soil1);

  for (let l = 0; l < 6; l++) {
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.45), leafMat);
    leaf.rotation.x = 0.6 + (l % 2) * 0.2;
    leaf.rotation.y = (l * Math.PI) / 3;
    leaf.position.set(0, 0.46, 0);
    pot1.add(leaf);
  }
  pot1.position.set(-0.35, 0, 0);
  potsGroup.add(pot1);

  // 2. Medium Pot with Succulent Aloe Vera
  const pot2 = new THREE.Group();
  const pot2Mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.35, 12), potMat);
  pot2Mesh.position.y = 0.175;
  pot2Mesh.castShadow = true;
  pot2.add(pot2Mesh);

  const soil2 = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.04, 12), soilMat);
  soil2.position.y = 0.33;
  pot2.add(soil2);

  const aloeMat = ArtMaterials.vegetation(0x166534);
  for (let a = 0; a < 7; a++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.38, 5), aloeMat);
    spike.position.set(0, 0.36, 0);
    spike.rotation.z = (a - 3) * 0.18;
    spike.rotation.x = ((a % 3) - 1) * 0.18;
    pot2.add(spike);
  }
  pot2.position.set(0.35, 0, -0.15);
  potsGroup.add(pot2);

  // 3. Small Pot with Golden Marigold Flowers (গাঁদা ফুল)
  const pot3 = new THREE.Group();
  const pot3Mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.13, 0.28, 12), potMat);
  pot3Mesh.position.y = 0.14;
  pot3Mesh.castShadow = true;
  pot3.add(pot3Mesh);

  const marigoldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
  for (let f = 0; f < 4; f++) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.22, 6), leafMat);
    stem.position.set((f % 2 - 0.5) * 0.1, 0.30, (Math.floor(f / 2) - 0.5) * 0.1);
    pot3.add(stem);

    const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), marigoldMat);
    bloom.position.set((f % 2 - 0.5) * 0.1, 0.42, (Math.floor(f / 2) - 0.5) * 0.1);
    pot3.add(bloom);
  }
  pot3.position.set(0.1, 0, 0.35);
  potsGroup.add(pot3);

  return potsGroup;
}

/**
 * Rooftop Satellite Dish (Akash DTH / Tata Sky)
 */
export function createSatelliteDish(): THREE.Group {
  const dishGroup = new THREE.Group();
  const metalMat = ArtMaterials.metal('chrome', 0x94a3b8);
  const dishMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4, metalness: 0.1 });

  // Base mounting pole
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8), metalMat);
  mast.position.y = 0.6;
  mast.castShadow = true;
  dishGroup.add(mast);

  // Diagonal support strut
  const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 6), metalMat);
  strut.position.set(-0.25, 0.4, 0);
  strut.rotation.z = 0.5;
  dishGroup.add(strut);

  // Parabolic dish head
  const dishHead = new THREE.Group();
  dishHead.position.set(0, 1.1, 0);
  dishHead.rotation.x = -0.4;
  dishHead.rotation.y = 0.3;

  const bowlGeo = new THREE.SphereGeometry(0.42, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.5);
  const bowl = new THREE.Mesh(bowlGeo, dishMat);
  bowl.rotation.x = Math.PI;
  bowl.castShadow = true;
  dishHead.add(bowl);

  // Akash DTH Blue Stripe Decal
  const stripeGeo = new THREE.TorusGeometry(0.38, 0.018, 6, 20);
  const stripeMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.rotation.x = Math.PI / 2;
  stripe.position.z = 0.02;
  dishHead.add(stripe);

  // LNB feed support arm & horn
  const lnbArm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.45, 6), metalMat);
  lnbArm.position.set(0, -0.22, 0.2);
  lnbArm.rotation.x = 0.7;
  dishHead.add(lnbArm);

  const lnbHorn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.04, 0.08, 8),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
  );
  lnbHorn.position.set(0, -0.05, 0.35);
  dishHead.add(lnbHorn);

  dishGroup.add(dishHead);
  return dishGroup;
}

/**
 * Aluminum TV Yagi Antenna (Classic Dhaka rooftop TV aerial)
 */
export function createYagiAntenna(): THREE.Group {
  const antGroup = new THREE.Group();
  const aluMat = ArtMaterials.metal('chrome', 0xc0c4cc);

  // Tall vertical mast
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 3.4, 8), aluMat);
  mast.position.y = 1.7;
  mast.castShadow = true;
  antGroup.add(mast);

  // Horizontal boom
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.8, 6), aluMat);
  boom.rotation.x = Math.PI / 2;
  boom.position.set(0, 3.1, 0);
  antGroup.add(boom);

  // Cross director elements of descending length
  for (let i = 0; i < 6; i++) {
    const len = 0.9 - i * 0.1;
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, len, 6), aluMat);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(0, 3.1, -0.8 + i * 0.32);
    antGroup.add(rod);
  }

  // Reflector screen at the back
  const refl = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.1, 6), aluMat);
  refl.position.set(0, 3.1, -0.88);
  antGroup.add(refl);

  return antGroup;
}

/**
 * Rooftop Staircase Entrance Shed (চিলেকোঠা / Rooftop Room)
 */
export function createStaircaseShed(): THREE.Group {
  const shed = new THREE.Group();
  const brickMat = ArtMaterials.concrete(0x991b1b); // Weathered red brick
  const tinMat = ArtMaterials.metal('chrome', 0x475569); // Corrugated tin
  const doorMat = ArtMaterials.wood(true, 0x451a03);

  // Main brick bulkhead building (2.4w x 2.5h x 2.6d)
  const mainWalls = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.5, 2.6), brickMat);
  mainWalls.position.y = 1.25;
  mainWalls.castShadow = true;
  mainWalls.receiveShadow = true;
  shed.add(mainWalls);

  // Slanted tin roof overhang
  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.08, 2.9), tinMat);
  roof.position.set(0, 2.58, 0.1);
  roof.rotation.x = 0.08;
  roof.castShadow = true;
  shed.add(roof);

  // Wooden Rooftop Door
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.9, 0.06), doorMat);
  door.position.set(0, 0.95, 1.32);
  shed.add(door);

  // Iron latch and brass padlock
  const lockMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 });
  const padlock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.04), lockMat);
  padlock.position.set(0.38, 0.95, 1.37);
  shed.add(padlock);

  // Bulkhead Outdoor Light above door
  const lampFixture = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.18, 0.12),
    ArtMaterials.metal('dark', 0x334155)
  );
  lampFixture.position.set(0, 2.15, 1.34);
  shed.add(lampFixture);

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  );
  bulb.position.set(0, 2.15, 1.4);
  shed.add(bulb);

  // Warm yellow glow point light
  const porchLight = new THREE.PointLight(0xfef08a, 0.8, 6.0);
  porchLight.position.set(0, 2.1, 1.5);
  shed.add(porchLight);

  return shed;
}

/**
 * PVC Water Pipes with Brass Turn Tap (পানির কল)
 */
export function createWaterPipes(): THREE.Group {
  const pipeGroup = new THREE.Group();
  const pvcMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 }); // Blue PVC
  const brassMat = ArtMaterials.metal('brass');

  // Horizontal pipe along parapet
  const hPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 5.0, 8), pvcMat);
  hPipe.rotation.z = Math.PI / 2;
  hPipe.position.set(0, 0.25, 0);
  pipeGroup.add(hPipe);

  // Vertical pipe down to tap
  const vPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 8), pvcMat);
  vPipe.position.set(1.5, 0.6, 0);
  pipeGroup.add(vPipe);

  // Brass bibcock tap
  const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 6), brassMat);
  tap.rotation.x = Math.PI / 2;
  tap.position.set(1.5, 0.9, 0.08);
  pipeGroup.add(tap);

  // Turn handle
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.02), brassMat);
  handle.position.set(1.5, 0.96, 0.08);
  pipeGroup.add(handle);

  return pipeGroup;
}

/**
 * Canvas Texture for Dhaka Night Cityscape Windows
 */
function createSkylineWindowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark slate concrete facade
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 512);

  // Window columns
  const cols = 8;
  const rows = 24;
  const wW = 18;
  const wH = 12;
  const gapX = 14;
  const gapY = 9;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = 12 + c * (wW + gapX);
      const y = 14 + r * (wH + gapY);

      const rand = Math.random();
      if (rand < 0.45) {
        // Warm incandescent home light
        ctx.fillStyle = '#fef08a';
      } else if (rand < 0.68) {
        // Cool electric blue/white office/TV light
        ctx.fillStyle = '#38bdf8';
      } else {
        // Dark/unlit midnight window
        ctx.fillStyle = '#1e293b';
      }
      ctx.fillRect(x, y, wW, wH);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Dhaka City Skyline Backdrop (Surrounding multi-tier buildings, water tanks & antennas)
 */
export function createDhakaCitySkyline(): THREE.Group {
  const skyline = new THREE.Group();
  const winTex = createSkylineWindowTexture();
  const bldgMat = new THREE.MeshStandardMaterial({
    map: winTex,
    roughness: 0.8,
    metalness: 0.1,
  });

  const bldgConfigs = [
    { ang: 0.0, dist: 32, w: 10, h: 26, d: 10 },
    { ang: 0.45, dist: 38, w: 12, h: 32, d: 11 },
    { ang: 0.9, dist: 29, w: 9, h: 22, d: 9 },
    { ang: 1.4, dist: 35, w: 14, h: 36, d: 12 },
    { ang: 1.9, dist: 30, w: 8, h: 18, d: 8 },
    { ang: 2.4, dist: 36, w: 11, h: 28, d: 10 },
    { ang: 2.9, dist: 31, w: 13, h: 34, d: 12 },
    { ang: 3.4, dist: 37, w: 9, h: 24, d: 9 },
    { ang: 3.9, dist: 28, w: 12, h: 20, d: 11 },
    { ang: 4.4, dist: 34, w: 10, h: 30, d: 10 },
    { ang: 4.9, dist: 39, w: 14, h: 38, d: 13 },
    { ang: 5.4, dist: 30, w: 8, h: 21, d: 8 },
    { ang: 5.9, dist: 35, w: 11, h: 27, d: 10 },
  ];

  bldgConfigs.forEach((bc, idx) => {
    const x = Math.cos(bc.ang) * bc.dist;
    const z = Math.sin(bc.ang) * bc.dist;

    const bMesh = new THREE.Mesh(new THREE.BoxGeometry(bc.w, bc.h, bc.d), bldgMat);
    bMesh.position.set(x, bc.h / 2 - 8, z);
    skyline.add(bMesh);

    // Add communication mast with blinking red aviation warning light on tall buildings
    if (idx % 4 === 0) {
      const mastMat = ArtMaterials.metal('dark', 0x475569);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6.0, 6), mastMat);
      mast.position.set(x, bc.h - 5, z);
      skyline.add(mast);

      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), beaconMat);
      beacon.position.set(x, bc.h - 2, z);
      skyline.add(beacon);
    }

    // Add mini water tanks on neighboring roofs
    if (idx % 2 === 1) {
      const tankMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.4, 12), tankMat);
      tank.position.set(x + (Math.random() - 0.5) * 2, bc.h - 7.3, z + (Math.random() - 0.5) * 2);
      skyline.add(tank);
    }
  });

  // Neon rooftop billboard for tea stall / Dhaka ads
  const neonMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 1.4), neonMat);
  signMesh.position.set(0, 20, -31);
  skyline.add(signMesh);

  return skyline;
}

/**
 * Giant Organic Mosquito Queen Hive / Dengue King Nest
 */
export function createGiantMosquitoHive(): THREE.Group {
  const hive = new THREE.Group();
  const chitinMat = ArtMaterials.mosquitoChitin('giant');
  const eggMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 0.85,
    roughness: 0.2,
  });

  // 1. Organic Base Mound (Twisted mud & roots)
  const mound = new THREE.Mesh(
    new THREE.ConeGeometry(4.2, 5.2, 16),
    chitinMat
  );
  mound.position.y = 2.6;
  mound.castShadow = true;
  mound.receiveShadow = true;
  hive.add(mound);

  // 2. Hollow Cave Entrance Portal for Dengue King
  const caveGeo = new THREE.SphereGeometry(2.0, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const caveMat = new THREE.MeshBasicMaterial({ color: 0x050204 });
  const cave = new THREE.Mesh(caveGeo, caveMat);
  cave.rotation.x = Math.PI / 2;
  cave.position.set(0, 2.2, 2.0);
  hive.add(cave);

  // 3. Pulsating Glowing Crimson Egg Sac Clusters
  const eggClusterCoords = [
    [-1.6, 2.8, 1.8],
    [1.6, 2.8, 1.8],
    [0.0, 4.2, 0.8],
    [-2.2, 1.4, 1.4],
    [2.2, 1.4, 1.4],
    [-1.0, 3.6, 1.2],
    [1.0, 3.6, 1.2],
  ];

  eggClusterCoords.forEach(([ex, ey, ez]) => {
    const sac = new THREE.Mesh(new THREE.SphereGeometry(0.35 + Math.random() * 0.2, 8, 8), eggMat);
    sac.position.set(ex, ey, ez);
    sac.name = 'hiveEggSac';
    hive.add(sac);
  });

  // 4. Dripping stalactite tendrils from hive arch
  for (let t = -3; t <= 3; t++) {
    const tendril = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.8 + Math.random() * 0.6, 6),
      chitinMat
    );
    tendril.position.set(t * 0.5, 3.2 - Math.abs(t) * 0.2, 2.3);
    tendril.rotation.x = Math.PI;
    hive.add(tendril);
  }

  // 5. Red Ambient Glow Light inside Hive Nest
  const nestLight = new THREE.PointLight(0xef4444, 2.2, 14.0);
  nestLight.position.set(0, 2.8, 1.5);
  hive.add(nestLight);

  return hive;
}

/**
 * Old Dhaka Colonial Crumbling Brick Archway (Entrance to Dengue King Arena)
 */
export function createOldDhakaColonialArch(): THREE.Group {
  const archGroup = new THREE.Group();
  const brickMat = ArtMaterials.concrete(0x881337); // Ancient weathered Dhaka red brick
  const mortarMat = ArtMaterials.concrete(0x475569);

  // Left Pillar
  const p1 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 4.2, 1.0), brickMat);
  p1.position.set(-2.8, 2.1, 0);
  p1.castShadow = true;
  archGroup.add(p1);

  // Right Pillar
  const p2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 4.2, 1.0), brickMat);
  p2.position.set(2.8, 2.1, 0);
  p2.castShadow = true;
  archGroup.add(p2);

  // Top Arch Span
  const span = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.8, 1.1), brickMat);
  span.position.set(0, 4.2, 0);
  span.castShadow = true;
  archGroup.add(span);

  // Decorative Corbel Moldings
  const corbel1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 1.2), mortarMat);
  corbel1.position.set(-2.8, 3.8, 0);
  archGroup.add(corbel1);

  const corbel2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 1.2), mortarMat);
  corbel2.position.set(2.8, 3.8, 0);
  archGroup.add(corbel2);

  return archGroup;
}

/**
 * Concrete Electric Utility Pole with Transformer, Tangled Cables & Streetlight
 * Quintessential Dhaka street infrastructure!
 */
export function createElectricPoleWithTransformer(): THREE.Group {
  const poleGroup = new THREE.Group();
  poleGroup.name = 'dhakaElectricPole';

  const concreteMat = ArtMaterials.concrete(0x71717a);
  const metalMat = ArtMaterials.metal('dark');
  const chromeMat = ArtMaterials.metal('chrome');
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
  const insulatorMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f5, roughness: 0.2 });

  // 1. Octagonal Concrete Pole (8.5m tall)
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 8.5, 8), concreteMat);
  pole.position.y = 4.25;
  pole.castShadow = true;
  poleGroup.add(pole);

  // Metal climbing rungs on pole
  for (let r = 0; r < 12; r++) {
    const rungSide = r % 2 === 0 ? 1 : -1;
    const rung = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.24), metalMat);
    rung.position.set(rungSide * 0.16, 1.8 + r * 0.48, 0);
    poleGroup.add(rung);
  }

  // 2. Dual Steel Cross-Arms (Horizontal angle irons)
  for (let c = 0; c < 2; c++) {
    const armY = 7.2 + c * 0.75;
    const crossArm = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.08), metalMat);
    crossArm.position.set(0, armY, 0);
    poleGroup.add(crossArm);

    // 4 Ceramic Bell Insulators per cross-arm
    for (let i of [-1.0, -0.4, 0.4, 1.0]) {
      const insulator = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.14, 8), insulatorMat);
      insulator.position.set(i, armY + 0.11, 0);
      poleGroup.add(insulator);
    }
  }

  // 3. Cylindrical Distribution Transformer Canister
  const transMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.45, metalness: 0.6 });
  const transformer = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.1, 14), transMat);
  transformer.position.set(0.48, 5.2, 0);
  transformer.castShadow = true;
  poleGroup.add(transformer);

  // Transformer support bracket
  const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.06, 0.4), metalMat);
  bracket.position.set(0.32, 4.6, 0);
  poleGroup.add(bracket);

  // Transformer cooling fins
  for (let f = -3; f <= 3; f++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.9, 0.68), transMat);
    fin.position.set(0.48 + f * 0.08, 5.2, 0);
    poleGroup.add(fin);
  }

  // Danger High Voltage Decal on transformer
  const dangerPlate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.2),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  dangerPlate.position.set(0.81, 5.2, 0);
  dangerPlate.rotation.y = Math.PI / 2;
  poleGroup.add(dangerPlate);

  // 4. Tangled Overhead Cables / Dhaka Wire Web
  // Realistic drooping catenary cables across the street
  for (let w = 0; w < 5; w++) {
    const wireCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-1.0 + w * 0.5, 7.8, 0),
      new THREE.Vector3(-0.5 + w * 0.5, 7.1 - w * 0.1, 3.5),
      new THREE.Vector3(0, 6.5 - w * 0.15, 7.0)
    );
    const wireGeo = new THREE.TubeGeometry(wireCurve, 12, 0.012, 4, false);
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    poleGroup.add(wireMesh);
  }

  // 5. Swan-Neck Streetlight Fixture & Amber Light Pool
  const neckCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, 6.8, 0),
    new THREE.Vector3(0, 7.6, 0.8),
    new THREE.Vector3(0, 7.4, 1.6)
  );
  const neckGeo = new THREE.TubeGeometry(neckCurve, 10, 0.024, 6, false);
  const neck = new THREE.Mesh(neckGeo, metalMat);
  poleGroup.add(neck);

  // Enamel Streetlamp Shade
  const lampShade = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 0.18, 14, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.3 })
  );
  lampShade.position.set(0, 7.3, 1.6);
  poleGroup.add(lampShade);

  // Glowing 100W Streetlamp Bulb
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  );
  bulb.position.set(0, 7.22, 1.6);
  poleGroup.add(bulb);

  // Amber Streetlight Spot Pool Illuminating the Asphalt
  const streetLight = new THREE.SpotLight(0xfef08a, 2.8, 18, Math.PI / 3.2, 0.45, 1.2);
  streetLight.position.set(0, 7.2, 1.6);
  streetLight.target.position.set(0, 0, 1.6);
  streetLight.castShadow = true;
  poleGroup.add(streetLight);
  poleGroup.add(streetLight.target);

  return poleGroup;
}

/**
 * Multi-Story Dhaka Residential & Commercial Building Facade
 * Features roll-down corrugated shop shutters, illuminated Bengali signboard,
 * concrete balconies with wrought iron grills, window sunshades, and rooftop structures.
 */
export function createDhakaStreetBuilding(
  width = 8.5,
  height = 14,
  depth = 6.0,
  wallColor = 0xd5c8b2,
  signTitle = 'জননী ফার্মেসী',
  signSubtitle = '২৪ ঘণ্টা খোলা • ঔষধ ও সার্জিকাল সামগ্রী',
  signTheme: 'pharmacy' | 'tea' | 'store' | 'laundry' = 'pharmacy',
  hasBalcony = true
): THREE.Group {
  const building = new THREE.Group();
  building.name = 'dhakaStreetBuilding';

  const wallMat = ArtMaterials.paintedWall(wallColor);
  const darkMetalMat = ArtMaterials.metal('dark');
  const glassLitMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // Warm room interior

  // 1. Main Concrete Building Block
  const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
  mainBlock.position.set(0, height / 2, 0);
  mainBlock.castShadow = true;
  mainBlock.receiveShadow = true;
  building.add(mainBlock);

  // 2. Ground Floor Shopfront: 2 Corrugated Roll-Down Metal Shutters
  const shutterMat = new THREE.MeshStandardMaterial({
    map: createCorrugatedShutterTexture(signTheme === 'pharmacy' ? '#166534' : '#1e3a8a'),
    roughness: 0.55,
    metalness: 0.45,
  });

  const halfWidth = (width - 1.2) / 2;
  for (let s of [-1, 1]) {
    const shutter = new THREE.Mesh(new THREE.PlaneGeometry(halfWidth * 0.9, 3.2), shutterMat);
    shutter.position.set(s * (halfWidth / 2 + 0.3), 1.6, depth / 2 + 0.02);
    building.add(shutter);

    // Dark frame around shutter
    const frame = new THREE.Mesh(new THREE.BoxGeometry(halfWidth * 0.94, 3.3, 0.08), darkMetalMat);
    frame.position.set(s * (halfWidth / 2 + 0.3), 1.65, depth / 2 + 0.01);
    building.add(frame);
  }

  // 3. Wide Illuminated Bengali Shop Signboard above shutters
  const signMat = new THREE.MeshBasicMaterial({
    map: createBengaliShopSignTexture(signTitle, signSubtitle, signTheme),
  });
  const signboard = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.88, 1.1), signMat);
  signboard.position.set(0, 3.85, depth / 2 + 0.06);
  building.add(signboard);

  // Signboard outer frame
  const signFrame = new THREE.Mesh(new THREE.BoxGeometry(width * 0.90, 1.18, 0.08), darkMetalMat);
  signFrame.position.set(0, 3.85, depth / 2 + 0.03);
  building.add(signFrame);

  // 4. Upper Residential Floors (Windows with grills & sunshades)
  const floorHeights = [6.2, 9.4, 12.4];
  floorHeights.forEach((fy, floorIdx) => {
    if (fy + 1.5 > height) return;

    for (let wx of [-width * 0.28, width * 0.28]) {
      // Lit window glass pane
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.6), glassLitMat);
      win.position.set(wx, fy, depth / 2 + 0.02);
      building.add(win);

      // Metal Security Grill on window (Traditional Dhaka grill pattern)
      for (let g = -3; g <= 3; g++) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.6, 0.04), darkMetalMat);
        bar.position.set(wx + g * 0.2, fy, depth / 2 + 0.04);
        building.add(bar);
      }

      // Concrete Sunshade (Chhajja) over window
      const chhajja = new THREE.Mesh(
        new THREE.BoxGeometry(1.65, 0.06, 0.45),
        ArtMaterials.concrete(0x94a3b8)
      );
      chhajja.position.set(wx, fy + 0.85, depth / 2 + 0.22);
      chhajja.rotation.x = 0.15;
      building.add(chhajja);
    }

    // 5. Cantilevered Concrete Balcony on 2nd floor
    if (hasBalcony && floorIdx === 1) {
      const balFloor = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.75, 0.14, 1.2),
        ArtMaterials.concrete(0x64748b)
      );
      balFloor.position.set(0, fy - 0.85, depth / 2 + 0.6);
      balFloor.castShadow = true;
      building.add(balFloor);

      // Decorative wrought iron balcony railing
      const railTop = new THREE.Mesh(new THREE.BoxGeometry(width * 0.75, 0.04, 0.04), darkMetalMat);
      railTop.position.set(0, fy + 0.1, depth / 2 + 1.18);
      building.add(railTop);

      for (let r = 0; r < 14; r++) {
        const balSpoke = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.85, 0.02), darkMetalMat);
        balSpoke.position.set(-width * 0.35 + r * (width * 0.7 / 13), fy - 0.38, depth / 2 + 1.18);
        building.add(balSpoke);
      }

      // Hanging washed towel on balcony
      const towel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.65, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.8, side: THREE.DoubleSide })
      );
      towel.position.set(0.6, fy - 0.2, depth / 2 + 1.19);
      building.add(towel);
    }
  });

  // 6. Rooftop Parapet Wall & Overhead Water Tank
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(width, 0.85, 0.2), wallMat);
  parapet.position.set(0, height + 0.425, depth / 2 - 0.1);
  building.add(parapet);

  // Black water tank on roof
  const tank = createWaterTank();
  tank.position.set(-width * 0.25, height, 0);
  building.add(tank);

  return building;
}

/**
 * 125cc Commuter Motorcycle (Dhaka daily commuter bike parked roadside)
 */
export function createParkedMotorcycle(): THREE.Group {
  const bike = new THREE.Group();
  bike.name = 'dhakaCommuterMotorcycle';

  const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.95 });
  const chromeMat = ArtMaterials.metal('chrome');
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3, metalness: 0.4 }); // Classic red
  const metalMat = ArtMaterials.metal('dark');

  // Front & Rear Wheels
  for (let w of [-0.65, 0.65]) {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.045, 8, 20), tireMat);
    wheel.position.set(0, 0.28, w);
    wheel.castShadow = true;
    bike.add(wheel);

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 12), chromeMat);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(0, 0.28, w);
    bike.add(rim);
  }

  // Engine Crankcase Block
  const engine = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.36), metalMat);
  engine.position.set(0, 0.34, 0);
  bike.add(engine);

  // Chrome Exhaust Pipe
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.028, 0.95, 8), chromeMat);
  exhaust.rotation.x = Math.PI / 2.2;
  exhaust.position.set(0.16, 0.22, 0.25);
  bike.add(exhaust);

  // Teardrop Red Fuel Tank
  const tank = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), bodyMat);
  tank.scale.set(0.7, 0.75, 1.4);
  tank.position.set(0, 0.68, -0.15);
  tank.castShadow = true;
  bike.add(tank);

  // Two-Seater Black Padded Saddle
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.58), tireMat);
  seat.position.set(0, 0.66, 0.28);
  seat.castShadow = true;
  bike.add(seat);

  // Chrome Handlebars & Round Headlight
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.62, 8), chromeMat);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, 0.88, -0.45);
  bike.add(bar);

  const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), chromeMat);
  headlight.rotation.x = -Math.PI / 2;
  headlight.position.set(0, 0.72, -0.58);
  bike.add(headlight);

  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.075, 12), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
  lens.rotation.y = Math.PI;
  lens.position.set(0, 0.72, -0.66);
  bike.add(lens);

  // Kickstand (Leaned slightly)
  bike.rotation.z = -0.12;
  return bike;
}

/**
 * Green Dhaka City Corporation Street Dustbin
 */
export function createDhakaDustbin(): THREE.Group {
  const binGroup = new THREE.Group();
  binGroup.name = 'dhakaDustbin';

  const binMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 }); // DCC Green
  const standMat = ArtMaterials.metal('dark');

  // Cylindrical Green Waste Bin Barrel
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.75, 14), binMat);
  barrel.position.y = 0.65;
  barrel.castShadow = true;
  binGroup.add(barrel);

  // Metal Swivel Stand Legs
  for (let s of [-0.38, 0.38]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.85, 8), standMat);
    leg.position.set(s, 0.425, 0);
    binGroup.add(leg);
  }

  // Crossbase footing
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.03, 0.4), standMat);
  base.position.y = 0.015;
  binGroup.add(base);

  // Bangla stencil on bin
  const stencil = new THREE.Mesh(
    new THREE.PlaneGeometry(0.35, 0.18),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  stencil.position.set(0, 0.7, 0.33);
  binGroup.add(stencil);

  return binGroup;
}

/**
 * Roadside Storm Drainage Curb with Slotted Iron Grates
 */
export function createRoadDrainGutter(length = 30): THREE.Group {
  const gutter = new THREE.Group();
  const ironMat = ArtMaterials.metal('dark', 0x1f2937);

  for (let z = -length / 2 + 2; z < length / 2; z += 5) {
    const grate = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.04, 0.95), ironMat);
    grate.position.set(0, 0.02, z);
    gutter.add(grate);

    // Slotted grate teeth
    for (let t = -3; t <= 3; t++) {
      const slot = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.05, 0.04),
        new THREE.MeshBasicMaterial({ color: 0x030712 })
      );
      slot.position.set(0, 0.022, z + t * 0.12);
      gutter.add(slot);
    }
  }

  return gutter;
}

/**
 * Weathered Brick Wall with Layered Dhaka Street Posters
 */
export function createStreetWallPosters(): THREE.Group {
  const posterGroup = new THREE.Group();
  const posterMat = new THREE.MeshStandardMaterial({
    map: createDhakaPostersTexture(),
    roughness: 0.85,
    side: THREE.DoubleSide,
  });

  const posterMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), posterMat);
  posterMesh.position.set(0, 1.8, 0);
  posterMesh.castShadow = true;
  posterGroup.add(posterMesh);

  return posterGroup;
}

/**
 * Grand Final Mutation Hive Arena (Level 6: Ground Zero beneath Dhaka)
 * Features:
 * - Colossal 7m central queen mutation egg cluster with pulsating bio-roots.
 * - 4 cracked Dhaka Metro viaduct pillars with exposed twisted rebar.
 * - 4 industrial cryogenic incubation vats with bubbling emerald fluid & suspended mutant silhouettes.
 * - Toxic glowing bio-puddles and collapsed structural concrete slabs.
 */
export function createFinalBioHiveArena(): THREE.Group {
  const arena = new THREE.Group();
  arena.name = 'finalBioHiveArena';

  const concreteMat = ArtMaterials.concrete(0x1e293b);
  const rebarMat = ArtMaterials.metal('dark', 0x7c2d12); // Rusted steel rebar
  const chitinMat = ArtMaterials.mosquitoChitin('giant');
  const bioEggMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 0.95,
    roughness: 0.25,
  });
  const vatGlassMat = ArtMaterials.glass(0x10b981, 0.55);
  const vatSteelMat = ArtMaterials.metal('dark', 0x0f172a);

  // 1. Colossal 7-Meter Central Mutation Egg Sac (Ground Zero)
  const masterHiveMound = new THREE.Mesh(
    new THREE.ConeGeometry(5.2, 7.0, 18),
    chitinMat
  );
  masterHiveMound.position.set(0, 3.5, 0);
  masterHiveMound.castShadow = true;
  masterHiveMound.receiveShadow = true;
  arena.add(masterHiveMound);

  // Pulsating Translucent Bio-Egg Sacs embedded in the master hive
  const eggCoords = [
    [-1.8, 3.2, 2.2],
    [1.8, 3.2, 2.2],
    [0.0, 5.0, 1.6],
    [-2.6, 1.8, 1.8],
    [2.6, 1.8, 1.8],
    [0.0, 2.8, 3.4],
    [-1.4, 4.4, -1.8],
    [1.4, 4.4, -1.8],
    [0.0, 6.2, 0.0],
  ];

  eggCoords.forEach(([ex, ey, ez]) => {
    const egg = new THREE.Mesh(
      new THREE.SphereGeometry(0.55 + Math.random() * 0.35, 10, 10),
      bioEggMat
    );
    egg.position.set(ex, ey, ez);
    egg.name = 'hiveEggSac';
    arena.add(egg);
  });

  // Crawling Bio-Tendril Roots spreading across the floor
  for (let r = 0; r < 8; r++) {
    const ang = (r * Math.PI) / 4;
    const rootCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(Math.cos(ang) * 2.8, 0.2, Math.sin(ang) * 2.8),
      new THREE.Vector3(Math.cos(ang + 0.3) * 6.5, 0.15, Math.sin(ang + 0.3) * 6.5),
      new THREE.Vector3(Math.cos(ang) * 11.0, 0.05, Math.sin(ang) * 11.0)
    );
    const rootMesh = new THREE.Mesh(
      new THREE.TubeGeometry(rootCurve, 14, 0.18 - r * 0.01, 6, false),
      chitinMat
    );
    arena.add(rootMesh);
  }

  // Pulsing Emerald Heart Light inside Master Hive
  const coreHiveLight = new THREE.PointLight(0x10b981, 2.8, 22.0);
  coreHiveLight.position.set(0, 3.6, 1.2);
  coreHiveLight.castShadow = true;
  arena.add(coreHiveLight);

  // 2. 4 Cracked Dhaka Metro Rail Viaduct Pillars with Exposed Rebar
  const pillarCoords = [
    [-8, 0, -8],
    [8, 0, -8],
    [-8, 0, 8],
    [8, 0, 8],
  ];

  pillarCoords.forEach(([px, py, pz]) => {
    const pillarGroup = new THREE.Group();
    pillarGroup.position.set(px, py, pz);

    // Main octagonal concrete column
    const column = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 1.3, 7.5, 8),
      concreteMat
    );
    column.position.y = 3.75;
    column.castShadow = true;
    pillarGroup.add(column);

    // Chipped concrete chunk exposing rebar
    const chip = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 1.2), concreteMat);
    chip.position.set(0.6, 3.2, 0.6);
    pillarGroup.add(chip);

    // Exposed rusted rebar steel rods jutting out
    for (let b = 0; b < 4; b++) {
      const rebar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.4, 4), rebarMat);
      rebar.position.set(0.7 + (b % 2) * 0.15, 3.2 + Math.floor(b / 2) * 0.3, 0.7);
      rebar.rotation.z = 0.25;
      pillarGroup.add(rebar);
    }

    // Heavy flared footing
    const footing = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.5, 3.0), concreteMat);
    footing.position.y = 0.25;
    pillarGroup.add(footing);

    arena.add(pillarGroup);
  });

  // 3. 4 Cryogenic Mutation Incubator Vats with Bubbling Green Fluid
  const vatAngles = [0.4, Math.PI / 2 + 0.4, Math.PI + 0.4, (Math.PI * 3) / 2 + 0.4];
  vatAngles.forEach((ang) => {
    const vatGroup = new THREE.Group();
    const vx = Math.cos(ang) * 9.2;
    const vz = Math.sin(ang) * 9.2;
    vatGroup.position.set(vx, 0, vz);

    // Reinforced Steel Base & Top Cap
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.15, 0.55, 16), vatSteelMat);
    base.position.y = 0.275;
    vatGroup.add(base);

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.05, 0.55, 16), vatSteelMat);
    cap.position.y = 4.25;
    vatGroup.add(cap);

    // Heavy vertical support tie rods
    for (let r = 0; r < 4; r++) {
      const rodAng = (r * Math.PI) / 2;
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.6, 8), vatSteelMat);
      rod.position.set(Math.cos(rodAng) * 0.98, 2.25, Math.sin(rodAng) * 0.98);
      vatGroup.add(rod);
    }

    // Transparent Glass Cylinder containing glowing fluid
    const glassTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 3.4, 20),
      vatGlassMat
    );
    glassTube.position.y = 2.25;
    vatGroup.add(glassTube);

    // Glowing Bio-Fluid core inside vat
    const fluidMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 1.1,
      roughness: 0.15,
      transparent: true,
      opacity: 0.85,
    });
    const fluidCore = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 3.1, 16), fluidMat);
    fluidCore.position.y = 2.25;
    vatGroup.add(fluidCore);

    // Suspended Mutant Mosquito Silhouette inside the fluid
    const mutantSilMat = new THREE.MeshBasicMaterial({ color: 0x064e3b });
    const mutantSil = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), mutantSilMat);
    mutantSil.scale.set(0.8, 1.6, 0.8);
    mutantSil.position.y = 2.25;
    vatGroup.add(mutantSil);

    // Green fluid illumination light
    const vatLight = new THREE.PointLight(0x10b981, 1.6, 6.0);
    vatLight.position.y = 2.25;
    vatGroup.add(vatLight);

    // Heavy industrial conduit pipe running to central hive
    const pipeCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 4.0, 0),
      new THREE.Vector3(-vx * 0.4, 5.0, -vz * 0.4),
      new THREE.Vector3(-vx * 0.75, 4.2, -vz * 0.75)
    );
    const pipeMesh = new THREE.Mesh(
      new THREE.TubeGeometry(pipeCurve, 10, 0.08, 6, false),
      vatSteelMat
    );
    vatGroup.add(pipeMesh);

    arena.add(vatGroup);
  });

  // 4. Bioluminescent Toxic Slime Pools on the Arena Floor
  const slimeMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 0.8,
    roughness: 0.1,
    metalness: 0.3,
  });

  const puddleCoords = [
    [-4.5, 0.02, 3.5],
    [5.0, 0.02, -2.5],
    [-3.0, 0.02, -5.5],
    [4.0, 0.02, 4.0],
  ];

  puddleCoords.forEach(([px, py, pz]) => {
    const puddle = new THREE.Mesh(
      new THREE.CircleGeometry(1.6 + Math.random() * 0.6, 14),
      slimeMat
    );
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.set(px, py, pz);
    arena.add(puddle);
  });

  // 5. Collapsed Structural Concrete Slabs (Tactical Cover)
  const slab1 = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.35, 2.2), concreteMat);
  slab1.position.set(-5.5, 0.8, 5.5);
  slab1.rotation.set(0.3, 0.4, -0.2);
  slab1.castShadow = true;
  arena.add(slab1);

  const slab2 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.35, 2.0), concreteMat);
  slab2.position.set(6.0, 0.7, -5.0);
  slab2.rotation.set(-0.25, -0.35, 0.15);
  slab2.castShadow = true;
  arena.add(slab2);

  return arena;
}



