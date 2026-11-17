import * as THREE from 'three';

/**
 * Lightweight per-level atmosphere.
 *
 * All effects are batched: one Points draw call per dust field and one mesh per
 * light shaft. Nothing updates geometry on the CPU except the dust drift, which
 * is a small Float32Array (240-520 points). This keeps mid-range Android GPUs
 * comfortable while still giving each arena readable depth and air.
 */

export interface MoteSpec {
  count: number;
  color: number;
  size: number;
  center: [number, number, number];
  bounds: [number, number, number];
  opacity?: number;
  drift?: number;
  /** Vertical speed; negative motes fall like soot. */
  fall?: number;
}

export interface BeamSpec {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
  color: number;
  opacity: number;
  pulse?: number;
}

export interface FlickerSpec {
  light: THREE.Light;
  base: number;
  style?: 'fluorescent' | 'bulb' | 'emergency' | 'neon';
  /** Phase offset so neighbouring tubes never flicker in lockstep. */
  seed?: number;
  /** Ignore the global power-cut dimmer (used by emergency lighting). */
  survivesPowerCut?: boolean;
}

export interface AtmosphereSpec {
  motes?: MoteSpec[];
  beams?: BeamSpec[];
  flickers?: FlickerSpec[];
}

interface MoteField {
  points: THREE.Points;
  phases: Float32Array;
  speeds: Float32Array;
  baseY: Float32Array;
  spec: MoteSpec;
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
}

interface BeamMesh {
  mesh: THREE.Mesh;
  baseOpacity: number;
  pulse: number;
}

export interface AtmosphereHandle {
  update: (elapsed: number, delta: number) => void;
  setPowerCut: (active: boolean) => void;
  dispose: () => void;
}

let dotTexture: THREE.CanvasTexture | null = null;
let beamTexture: THREE.CanvasTexture | null = null;

function getDotTexture(): THREE.CanvasTexture {
  if (dotTexture) return dotTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.85)');
  grad.addColorStop(0.6, 'rgba(255,255,255,0.22)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  dotTexture = new THREE.CanvasTexture(canvas);
  dotTexture.colorSpace = THREE.SRGBColorSpace;
  return dotTexture;
}

function getBeamTexture(): THREE.CanvasTexture {
  if (beamTexture) return beamTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  // Soft vertical shaft: bright at the top, dissolving into the floor.
  const vertical = ctx.createLinearGradient(0, 0, 0, 256);
  vertical.addColorStop(0, 'rgba(255,255,255,0.95)');
  vertical.addColorStop(0.55, 'rgba(255,255,255,0.42)');
  vertical.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = vertical;
  ctx.fillRect(0, 0, 128, 256);

  // Feather the horizontal edges so the plane never reads as a hard card.
  const horizontal = ctx.createLinearGradient(0, 0, 128, 0);
  horizontal.addColorStop(0, 'rgba(0,0,0,1)');
  horizontal.addColorStop(0.18, 'rgba(0,0,0,0)');
  horizontal.addColorStop(0.82, 'rgba(0,0,0,0)');
  horizontal.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = horizontal;
  ctx.fillRect(0, 0, 128, 256);

  beamTexture = new THREE.CanvasTexture(canvas);
  beamTexture.colorSpace = THREE.SRGBColorSpace;
  return beamTexture;
}

/** Deterministic cheap hash used for flicker noise. */
function hash(n: number): number {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

export function createAtmosphere(spec: AtmosphereSpec | undefined, scene: THREE.Scene): AtmosphereHandle {
  const moteFields: MoteField[] = [];
  const beams: BeamMesh[] = [];
  const flickers = spec?.flickers ?? [];
  let powerCut = false;

  if (spec?.motes) {
    for (const mote of spec.motes) {
      const positions = new Float32Array(mote.count * 3);
      const phases = new Float32Array(mote.count);
      const speeds = new Float32Array(mote.count);
      const baseY = new Float32Array(mote.count);
      const [cx, cy, cz] = mote.center;
      const [bw, bh, bd] = mote.bounds;

      for (let i = 0; i < mote.count; i++) {
        positions[i * 3] = cx + (Math.random() - 0.5) * bw;
        positions[i * 3 + 1] = cy + Math.random() * bh;
        positions[i * 3 + 2] = cz + (Math.random() - 0.5) * bd;
        phases[i] = Math.random() * Math.PI * 2;
        speeds[i] = 0.25 + Math.random() * 0.9;
        baseY[i] = positions[i * 3 + 1];
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        map: getDotTexture(),
        color: mote.color,
        size: mote.size,
        sizeAttenuation: true,
        transparent: true,
        opacity: mote.opacity ?? 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        alphaTest: 0.01,
      });

      const points = new THREE.Points(geometry, material);
      points.frustumCulled = false;
      points.renderOrder = 3;
      scene.add(points);
      moteFields.push({ points, phases, speeds, baseY, spec: mote, geometry, material });
    }
  }

  if (spec?.beams) {
    for (const beam of spec.beams) {
      const material = new THREE.MeshBasicMaterial({
        map: getBeamTexture(),
        color: beam.color,
        transparent: true,
        opacity: beam.opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(beam.width, beam.height), material);
      mesh.position.set(...beam.position);
      mesh.rotation.set(...beam.rotation);
      mesh.renderOrder = 2;
      scene.add(mesh);
      beams.push({ mesh, baseOpacity: beam.opacity, pulse: beam.pulse ?? 0 });
    }
  }

  return {
    update(elapsed: number, delta: number) {
      for (const field of moteFields) {
        const attr = field.geometry.getAttribute('position') as THREE.BufferAttribute;
        const arr = attr.array as Float32Array;
        const { drift = 0.12, fall = 0, center, bounds } = field.spec;
        const halfW = bounds[0] * 0.5;
        const halfD = bounds[2] * 0.5;
        const ceiling = center[1] + bounds[1];

        for (let i = 0; i < field.phases.length; i++) {
          const p = field.phases[i];
          const s = field.speeds[i];
          arr[i * 3] += Math.sin(elapsed * 0.35 * s + p) * drift * delta;
          arr[i * 3 + 2] += Math.cos(elapsed * 0.27 * s + p * 1.7) * drift * delta;
          arr[i * 3 + 1] += fall * delta * s;

          // Wrap the cloud so the air never runs empty.
          if (arr[i * 3] > center[0] + halfW) arr[i * 3] = center[0] - halfW;
          else if (arr[i * 3] < center[0] - halfW) arr[i * 3] = center[0] + halfW;
          if (arr[i * 3 + 2] > center[2] + halfD) arr[i * 3 + 2] = center[2] - halfD;
          else if (arr[i * 3 + 2] < center[2] - halfD) arr[i * 3 + 2] = center[2] + halfD;

          if (fall !== 0) {
            if (arr[i * 3 + 1] < center[1]) arr[i * 3 + 1] = ceiling;
            else if (arr[i * 3 + 1] > ceiling) arr[i * 3 + 1] = center[1];
          } else if (arr[i * 3 + 1] < field.baseY[i] - 0.35) {
            arr[i * 3 + 1] = field.baseY[i] + 0.35;
          } else if (arr[i * 3 + 1] > field.baseY[i] + 0.35) {
            arr[i * 3 + 1] = field.baseY[i] - 0.35;
          }
        }
        attr.needsUpdate = true;
      }

      for (const b of beams) {
        const mat = b.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = powerCut
          ? b.baseOpacity * 0.35
          : b.pulse > 0
          ? b.baseOpacity * (0.82 + Math.sin(elapsed * b.pulse) * 0.18)
          : b.baseOpacity;
      }

      for (const f of flickers) {
        if (powerCut && !f.survivesPowerCut) {
          f.light.intensity = f.base * 0.02;
          continue;
        }
        const seed = f.seed ?? 0;
        if (f.style === 'fluorescent') {
          // Two detuned sines + hash dropout => buzzing tube rather than a strobe.
          const wobble = 0.82 + Math.sin(elapsed * 11.7 + seed) * 0.1 + Math.sin(elapsed * 3.1 + seed * 2) * 0.06;
          const drop = hash(Math.floor(elapsed * 13 + seed)) > 0.94 ? 0.22 : 1;
          f.light.intensity = f.base * wobble * drop;
        } else if (f.style === 'emergency') {
          f.light.intensity = f.base * (0.55 + Math.abs(Math.sin(elapsed * 3.4 + seed)) * 0.75);
        } else if (f.style === 'neon') {
          f.light.intensity = f.base * (hash(Math.floor(elapsed * 7 + seed)) > 0.9 ? 0.3 : 1);
        } else {
          f.light.intensity = f.base * (0.9 + Math.sin(elapsed * 2.1 + seed) * 0.08);
        }
      }
    },
    setPowerCut(active: boolean) {
      powerCut = active;
    },
    dispose() {
      for (const field of moteFields) {
        scene.remove(field.points);
        field.geometry.dispose();
        field.material.dispose();
      }
      for (const b of beams) {
        scene.remove(b.mesh);
        (b.mesh.geometry as THREE.BufferGeometry).dispose();
        (b.mesh.material as THREE.Material).dispose();
      }
    },
  };
}
