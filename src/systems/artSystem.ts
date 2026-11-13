import * as THREE from 'three';
import { EnemyType } from '../types/game';

// ============================================================================
// 1. GLOBAL COLOR SYSTEM (Defined in Master Prompt)
// ============================================================================
export const ART_COLORS = {
  // Primary Palette
  DEEP_NAVY: '#171D2C',
  DEEP_NAVY_HEX: 0x171D2C,

  MOSQUITO_RED: '#F04452',
  MOSQUITO_RED_HEX: 0xF04452,

  WARM_YELLOW: '#FFC45B',
  WARM_YELLOW_HEX: 0xFFC45B,

  STATUS_GREEN: '#42C98B',
  STATUS_GREEN_HEX: 0x42C98B,

  ELECTRIC_BLUE: '#65B8ED',
  ELECTRIC_BLUE_HEX: 0x65B8ED,

  WARM_CREAM: '#E9E4D8',
  WARM_CREAM_HEX: 0xE9E4D8,

  // Secondary Stylized Palette for authentic Dhaka setting
  TEAK_WOOD: '#4A2A18',
  TEAK_WOOD_HEX: 0x4A2A18,
  TEAK_HIGHLIGHT: '#6B3D22',
  TEAK_HIGHLIGHT_HEX: 0x6B3D22,

  CONCRETE_GRAY: '#7D828E',
  CONCRETE_GRAY_HEX: 0x7D828E,

  ASPHALT_DARK: '#222630',
  ASPHALT_DARK_HEX: 0x222630,

  BANGLA_SKIN: '#C68642',
  BANGLA_SKIN_HEX: 0xC68642,
  BANGLA_SKIN_SHADOW: '#A6682E',
  BANGLA_SKIN_SHADOW_HEX: 0xA6682E,

  CHROME_METAL: '#D8DFE8',
  CHROME_METAL_HEX: 0xD8DFE8,

  DARK_STEEL: '#2D3748',
  DARK_STEEL_HEX: 0x2D3748,

  BRASS_ACCENT: '#D4AF37',
  BRASS_ACCENT_HEX: 0xD4AF37,

  PLASTIC_RED: '#DC2626',
  PLASTIC_RED_HEX: 0xDC2626,

  BANGLA_LUNGI_BLUE: '#1E3A8A',
  BANGLA_LUNGI_BLUE_HEX: 0x1E3A8A,

  CHITIN_DARK: '#121620',
  CHITIN_DARK_HEX: 0x121620,

  MOSQUITO_EYE_GLOW: '#FF2238',
  MOSQUITO_EYE_GLOW_HEX: 0xFF2238,
} as const;

// ============================================================================
// 2. PROCEDURAL TEXTURE SYSTEM (Cached Canvas Textures)
// ============================================================================
const textureCache = new Map<string, THREE.CanvasTexture>();

function getOrCreateTexture(key: string, generator: () => HTMLCanvasElement): THREE.CanvasTexture {
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }
  const canvas = generator();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

// 1. Painted Wall Texture (Warm cream plaster with subtle stippling)
export function getWallTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('wall_plaster', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Warm cream base
    ctx.fillStyle = ART_COLORS.WARM_CREAM;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle plaster variations
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 2 + Math.random() * 8;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(180, 160, 140, 0.08)';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Teak wooden skirting board at the bottom
    ctx.fillStyle = ART_COLORS.TEAK_WOOD;
    ctx.fillRect(0, 484, 512, 28);
    ctx.fillStyle = ART_COLORS.TEAK_HIGHLIGHT;
    ctx.fillRect(0, 484, 512, 3);

    return canvas;
  });
}

// 2. Concrete Texture (Stylized cartoon concrete with bevel lines)
export function getConcreteTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('concrete_stylized', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = ART_COLORS.CONCRETE_GRAY;
    ctx.fillRect(0, 0, 512, 512);

    // Light concrete speckles
    for (let i = 0; i < 600; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(20, 25, 35, 0.15)';
      ctx.fillRect(x, y, 2, 2);
    }

    // Subtle edge expansion joints
    ctx.strokeStyle = 'rgba(23, 29, 44, 0.3)';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 504, 504);

    return canvas;
  });
}

// 3. Wood Texture (Polished rich teak grain)
export function getWoodTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('wood_teak', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Teak base gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, '#3e2213');
    grad.addColorStop(0.3, ART_COLORS.TEAK_WOOD);
    grad.addColorStop(0.7, ART_COLORS.TEAK_HIGHLIGHT);
    grad.addColorStop(1, '#3e2213');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Grain lines
    ctx.strokeStyle = 'rgba(255, 196, 91, 0.12)';
    ctx.lineWidth = 3;
    for (let y = 10; y < 512; y += 14) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(170, y - 6, 340, y + 8, 512, y);
      ctx.stroke();
    }

    return canvas;
  });
}

// 4. Metal Texture (Brushed chrome/steel with highlights)
export function getMetalTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('metal_brushed', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = ART_COLORS.CHROME_METAL;
    ctx.fillRect(0, 0, 256, 256);

    // Brushed streaks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 256; y += 3) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    // Shadow streaks
    ctx.strokeStyle = 'rgba(23, 29, 44, 0.15)';
    for (let y = 2; y < 256; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    return canvas;
  });
}

// 5. Plastic Texture (Smooth cartoon specular)
export function getPlasticTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('plastic_smooth', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);

    // Soft radial shine
    const radial = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
    radial.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    radial.addColorStop(1, 'rgba(200, 200, 200, 0.05)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 256, 256);

    return canvas;
  });
}

// 6. Fabric Texture (Dhaka cotton & woven kantha crosshatch)
export function getFabricTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('fabric_cotton', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = ART_COLORS.WARM_CREAM;
    ctx.fillRect(0, 0, 256, 256);

    // Fine woven threads
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 256; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }

    return canvas;
  });
}

// 7. Vegetation Texture (Stylized Dhaka monsoon foliage)
export function getVegetationTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('vegetation_monsoon', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = ART_COLORS.STATUS_GREEN;
    ctx.fillRect(0, 0, 256, 256);

    // Branching cartoon veins
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(128, 256);
    ctx.lineTo(128, 0);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    for (let y = 40; y < 240; y += 30) {
      ctx.beginPath();
      ctx.moveTo(128, y);
      ctx.lineTo(40, y - 25);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(128, y);
      ctx.lineTo(216, y - 25);
      ctx.stroke();
    }

    return canvas;
  });
}

// 8. Asphalt Texture (Urban Dhaka street road)
export function getAsphaltTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('asphalt_dhaka', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = ART_COLORS.ASPHALT_DARK;
    ctx.fillRect(0, 0, 512, 512);

    // Micro road gravel
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(x, y, 2, 2);
    }

    return canvas;
  });
}

// 9. Character Skin Texture (Warm Bengali skin with soft gradient)
export function getSkinTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('skin_bangla', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Base Bengali complexion
    ctx.fillStyle = ART_COLORS.BANGLA_SKIN;
    ctx.fillRect(0, 0, 256, 256);

    // Subtle warm peach highlight
    const radial = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
    radial.addColorStop(0, 'rgba(255, 215, 175, 0.22)');
    radial.addColorStop(1, 'rgba(166, 104, 46, 0.15)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 256, 256);

    return canvas;
  });
}

// 10. Mosquito Body Chitin Texture (Striped chitin with Mosquito Red accents)
export function getMosquitoChitinTexture(type: EnemyType = 'normal'): THREE.CanvasTexture {
  const cacheKey = `chitin_${type}`;
  return getOrCreateTexture(cacheKey, () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Chitin base
    ctx.fillStyle = type === 'stealth' ? '#090d14' : ART_COLORS.CHITIN_DARK;
    ctx.fillRect(0, 0, 256, 256);

    // Characteristic mosquito abdominal stripes (Aedes / Dengue stripes)
    const stripeColor =
      type === 'boss_dengue' || type === 'normal'
        ? ART_COLORS.MOSQUITO_RED
        : type === 'stealth'
        ? '#1e293b'
        : ART_COLORS.WARM_YELLOW;

    ctx.fillStyle = stripeColor;
    for (let y = 16; y < 256; y += 32) {
      ctx.fillRect(0, y, 256, 8);
    }

    // High contrast micro white ticks
    ctx.fillStyle = '#ffffff';
    for (let y = 16; y < 256; y += 32) {
      ctx.fillRect(20, y + 2, 10, 4);
      ctx.fillRect(120, y + 2, 10, 4);
      ctx.fillRect(220, y + 2, 10, 4);
    }

    return canvas;
  });
}

// 11. Mosquito Wing Texture (Delicate cellophane with electric blue sheen)
export function getMosquitoWingTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('mosquito_wing', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Clear background
    ctx.clearRect(0, 0, 256, 512);

    // Subtle blueish iridescent cellophane body
    const grad = ctx.createLinearGradient(0, 0, 256, 512);
    grad.addColorStop(0, 'rgba(101, 184, 237, 0.45)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
    grad.addColorStop(1, 'rgba(101, 184, 237, 0.25)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);

    // Wing edge vein
    ctx.strokeStyle = 'rgba(23, 29, 44, 0.65)';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 248, 504);

    // Wing micro veins
    ctx.strokeStyle = 'rgba(23, 29, 44, 0.4)';
    ctx.lineWidth = 2;
    for (let y = 30; y < 512; y += 40) {
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(246, y + 25);
      ctx.stroke();
    }

    return canvas;
  });
}

// ============================================================================
// 3. REUSABLE MATERIALS SYSTEM (ArtMaterials)
// ============================================================================
export const ArtMaterials = {
  // 1. Painted Wall Material
  paintedWall(color: THREE.ColorRepresentation = ART_COLORS.WARM_CREAM_HEX): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      map: getWallTexture(),
      roughness: 0.75,
      metalness: 0.02,
    });
  },

  // 2. Concrete Material
  concrete(color: THREE.ColorRepresentation = ART_COLORS.CONCRETE_GRAY_HEX): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      map: getConcreteTexture(),
      roughness: 0.85,
      metalness: 0.04,
    });
  },

  // 3. Teak Wood Material (Varnished lustrous Sheesham/Teak finish)
  wood(varnished = true, color: THREE.ColorRepresentation = ART_COLORS.TEAK_WOOD_HEX): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color,
      map: getWoodTexture(),
      roughness: varnished ? 0.30 : 0.60,
      metalness: 0.04,
      clearcoat: varnished ? 0.38 : 0.05,
      clearcoatRoughness: 0.2,
    });
  },

  // 4. Metal Material (Chrome, dark steel, or brass with cartoon specular pop)
  metal(
    finish: 'chrome' | 'dark' | 'brass' = 'chrome',
    customColor?: THREE.ColorRepresentation
  ): THREE.MeshPhysicalMaterial {
    let color: THREE.ColorRepresentation = ART_COLORS.CHROME_METAL_HEX;
    let roughness = 0.18;
    let metalness = 0.94;
    let clearcoat = 0.7;

    if (finish === 'dark') {
      color = ART_COLORS.DARK_STEEL_HEX;
      roughness = 0.35;
      metalness = 0.78;
      clearcoat = 0.3;
    } else if (finish === 'brass') {
      color = ART_COLORS.BRASS_ACCENT_HEX;
      roughness = 0.22;
      metalness = 0.90;
      clearcoat = 0.6;
    }

    if (customColor) color = customColor;

    return new THREE.MeshPhysicalMaterial({
      color,
      map: getMetalTexture(),
      roughness,
      metalness,
      clearcoat,
      clearcoatRoughness: 0.15,
    });
  },

  // 5. Plastic Material (Glossy injection-molded cartoon plastic)
  plastic(
    color: THREE.ColorRepresentation = ART_COLORS.PLASTIC_RED_HEX,
    glossy = true
  ): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color,
      map: getPlasticTexture(),
      roughness: glossy ? 0.22 : 0.50,
      metalness: 0.02,
      clearcoat: glossy ? 0.65 : 0.1,
      clearcoatRoughness: 0.18,
    });
  },

  // 6. Glass Material (Physical glass with transmission & rich specular reflections)
  glass(
    tint: THREE.ColorRepresentation = ART_COLORS.ELECTRIC_BLUE_HEX,
    opacity = 0.35
  ): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: tint,
      transmission: 0.82,
      opacity,
      transparent: true,
      roughness: 0.06,
      ior: 1.54,
      thickness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      depthWrite: false,
    });
  },

  // 7. Fabric Material
  fabric(color: THREE.ColorRepresentation = ART_COLORS.WARM_CREAM_HEX): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      map: getFabricTexture(),
      roughness: 0.88,
      metalness: 0.02,
    });
  },

  // 8. Vegetation Material
  vegetation(color: THREE.ColorRepresentation = ART_COLORS.STATUS_GREEN_HEX): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      map: getVegetationTexture(),
      roughness: 0.55,
      metalness: 0.04,
      side: THREE.DoubleSide,
    });
  },

  // 9. Asphalt Material
  asphalt(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: ART_COLORS.ASPHALT_DARK_HEX,
      map: getAsphaltTexture(),
      roughness: 0.88,
      metalness: 0.06,
    });
  },

  // 10. Character Skin Material (Warm South Asian skin with soft peach glow)
  characterSkin(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: ART_COLORS.BANGLA_SKIN_HEX,
      map: getSkinTexture(),
      roughness: 0.58,
      metalness: 0.02,
    });
  },

  // 11. Mosquito Body Chitin Material (Realistic Cartoon Cuticle Sheen & Clearcoat)
  mosquitoChitin(type: EnemyType = 'normal'): THREE.MeshPhysicalMaterial {
    const isBoss = type.startsWith('boss');
    return new THREE.MeshPhysicalMaterial({
      map: getMosquitoChitinTexture(type),
      roughness: isBoss ? 0.20 : 0.26,
      metalness: isBoss ? 0.35 : 0.22,
      clearcoat: 0.88,
      clearcoatRoughness: 0.12,
      sheen: 0.45,
      sheenRoughness: 0.22,
      sheenColor: new THREE.Color(isBoss ? 0xff4444 : 0xffffff),
    });
  },

  // 12. Mosquito Wing Material (Cellophane with Iridescent Sheen & Translucency)
  mosquitoWings(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      map: getMosquitoWingTexture(),
      transparent: true,
      opacity: 0.72,
      roughness: 0.08,
      metalness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      transmission: 0.55,
      ior: 1.48,
      thickness: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  },
};
