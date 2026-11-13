import * as THREE from 'three';

export interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'spray' | 'wind' | 'blood' | 'boss_energy';
}

export interface FloatingText {
  id: string;
  position: [number, number, number];
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  public scene: THREE.Scene;
  private particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  private pointsMesh: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private maxParticles = 1200;
  private positions: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);
    this.sizes = new Float32Array(this.maxParticles);

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));

    // Custom points material
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.pointsMesh = new THREE.Points(this.geometry, material);
    this.pointsMesh.frustumCulled = false;
    this.scene.add(this.pointsMesh);
  }

  public emitSparks(pos: THREE.Vector3, count = 20, isCharged = false) {
    const col = new THREE.Color(isCharged ? 0x60a5fa : 0xfef08a);
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * (isCharged ? 8 : 4),
        (Math.random() - 0.2) * (isCharged ? 8 : 4),
        (Math.random() - 0.5) * (isCharged ? 8 : 4)
      );
      this.particles.push({
        position: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2)),
        velocity: vel,
        color: col.clone(),
        size: isCharged ? 0.18 : 0.08,
        life: 0.35 + Math.random() * 0.2,
        maxLife: 0.5,
        type: 'spark',
      });
    }
  }

  public emitSlapImpact(pos: THREE.Vector3) {
    const col = new THREE.Color(0xfde68a);
    for (let i = 0; i < 15; i++) {
      if (this.particles.length >= this.maxParticles) break;
      this.particles.push({
        position: pos.clone(),
        velocity: new THREE.Vector3((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3),
        color: col,
        size: 0.12,
        life: 0.3,
        maxLife: 0.3,
        type: 'spark',
      });
    }
  }

  public emitSprayMist(origin: THREE.Vector3, direction: THREE.Vector3, count = 8) {
    const col = new THREE.Color(0xfef9c3); // light mist
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const spread = new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3);
      const vel = direction.clone().multiplyScalar(4.5 + Math.random() * 2).add(spread);
      this.particles.push({
        position: origin.clone().add(spread.multiplyScalar(0.2)),
        velocity: vel,
        color: col,
        size: 0.2 + Math.random() * 0.15,
        life: 0.7 + Math.random() * 0.3,
        maxLife: 1.0,
        type: 'spray',
      });
    }
  }

  public emitFanWind(origin: THREE.Vector3, direction: THREE.Vector3, count = 10) {
    const col = new THREE.Color(0x93c5fd);
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const spread = new THREE.Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6);
      const vel = direction.clone().multiplyScalar(7.0).add(spread);
      this.particles.push({
        position: origin.clone().add(spread.multiplyScalar(0.4)),
        velocity: vel,
        color: col,
        size: 0.15,
        life: 0.45,
        maxLife: 0.45,
        type: 'wind',
      });
    }
  }

  public emitCoilSmoke(pos: THREE.Vector3) {
    if (this.particles.length >= this.maxParticles) return;
    const col = new THREE.Color(0xdcfce7); // soft mint green smoke
    this.particles.push({
      position: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.1, 0, (Math.random() - 0.5) * 0.1)),
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.1, 0.4 + Math.random() * 0.2, (Math.random() - 0.5) * 0.1),
      color: col,
      size: 0.22,
      life: 2.0,
      maxLife: 2.0,
      type: 'smoke',
    });
  }

  public emitMosquitoDeath(pos: THREE.Vector3, isBoss = false) {
    const col = new THREE.Color(isBoss ? 0xdc2626 : 0x15803d);
    const count = isBoss ? 50 : 25;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const vel = new THREE.Vector3((Math.random() - 0.5) * (isBoss ? 6 : 3), Math.random() * (isBoss ? 5 : 2.5), (Math.random() - 0.5) * (isBoss ? 6 : 3));
      this.particles.push({
        position: pos.clone(),
        velocity: vel,
        color: col,
        size: isBoss ? 0.22 : 0.1,
        life: 0.8,
        maxLife: 0.8,
        type: 'blood',
      });
    }
  }

  public emitBossRageAura(pos: THREE.Vector3) {
    const col = new THREE.Color(0xf59e0b); // Fiery orange/crimson
    for (let i = 0; i < 4; i++) {
      if (this.particles.length >= this.maxParticles) break;
      this.particles.push({
        position: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5)),
        velocity: new THREE.Vector3((Math.random() - 0.5) * 1.2, 1.5 + Math.random() * 1.5, (Math.random() - 0.5) * 1.2),
        color: Math.random() > 0.5 ? col : new THREE.Color(0xef4444),
        size: 0.18,
        life: 0.45,
        maxLife: 0.45,
        type: 'spark',
      });
    }
  }

  public emitPoisonShockwave(pos: THREE.Vector3) {
    const count = 35;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = (i / count) * Math.PI * 2;
      const speed = 7.0 + Math.random() * 2.0;
      this.particles.push({
        position: pos.clone(),
        velocity: new THREE.Vector3(Math.cos(angle) * speed, 0.4 + Math.random() * 0.5, Math.sin(angle) * speed),
        color: new THREE.Color(0xdc2626),
        size: 0.22,
        life: 0.65,
        maxLife: 0.65,
        type: 'smoke',
      });
    }
  }

  public emitBiohazardSpore(pos: THREE.Vector3) {
    if (this.particles.length >= this.maxParticles) return;
    const isPurple = Math.random() > 0.6;
    const col = isPurple ? new THREE.Color(0xa855f7) : new THREE.Color(0x34d399);
    this.particles.push({
      position: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2.0, (Math.random() - 0.5) * 1.0, (Math.random() - 0.5) * 2.0)),
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.4, 0.25 + Math.random() * 0.35, (Math.random() - 0.5) * 0.4),
      color: col,
      size: 0.16 + Math.random() * 0.1,
      life: 2.5 + Math.random() * 1.5,
      maxLife: 4.0,
      type: 'smoke',
    });
  }

  public addFloatingText(pos: [number, number, number], text: string, color = '#22c55e') {
    this.floatingTexts.push({
      id: Math.random().toString(),
      position: [pos[0], pos[1] + 0.3, pos[2]],
      text,
      color,
      life: 1.0,
      maxLife: 1.0,
    });
  }

  public update(delta: number) {
    let pIdx = 0;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Physics integration
      p.position.addScaledVector(p.velocity, delta);
      if (p.type === 'spark' || p.type === 'blood') {
        p.velocity.y -= 9.8 * delta; // gravity
      } else if (p.type === 'smoke') {
        p.velocity.x += Math.sin(p.life * 5) * 0.05 * delta; // smoke swirl
        p.size += 0.15 * delta; // expand
      } else if (p.type === 'spray') {
        p.velocity.multiplyScalar(0.92);
        p.size += 0.2 * delta;
      }

      if (pIdx < this.maxParticles) {
        const i3 = pIdx * 3;
        this.positions[i3] = p.position.x;
        this.positions[i3 + 1] = p.position.y;
        this.positions[i3 + 2] = p.position.z;

        const alpha = p.life / p.maxLife;
        this.colors[i3] = p.color.r * alpha;
        this.colors[i3 + 1] = p.color.g * alpha;
        this.colors[i3 + 2] = p.color.b * alpha;

        this.sizes[pIdx] = p.size * (p.type === 'spark' ? alpha : 1.0);
        pIdx++;
      }
    }

    // Zero out remaining buffer points
    for (let j = pIdx; j < this.maxParticles; j++) {
      const j3 = j * 3;
      this.positions[j3] = 0;
      this.positions[j3 + 1] = -9999;
      this.positions[j3 + 2] = 0;
      this.sizes[j] = 0;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;

    // Update floating texts
    for (let k = this.floatingTexts.length - 1; k >= 0; k--) {
      const ft = this.floatingTexts[k];
      ft.life -= delta;
      ft.position[1] += 0.6 * delta; // drift upwards
      if (ft.life <= 0) {
        this.floatingTexts.splice(k, 1);
      }
    }
  }

  public dispose() {
    this.scene.remove(this.pointsMesh);
    this.geometry.dispose();
  }
}
