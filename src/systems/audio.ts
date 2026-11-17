/**
 * Web Audio API procedural sound synthesizer for Mosquito Apocalypse.
 * 100% procedural with zero external audio assets!
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private fanNode: { noise: AudioNode; filter: BiquadFilterNode; gain: GainNode } | null = null;
  private mosquitoBuzzNodes: Map<string, { osc: OscillatorNode; gain: GainNode; panner: StereoPannerNode | null }> = new Map();
  private isMuted: boolean = false;
  private volumes = { master: 0.8, sfx: 0.9, ambient: 0.6, voice: 1.0 };
  private voiceBuffers: Map<string, AudioBuffer> = new Map();
  private activeVoiceSource: AudioBufferSourceNode | null = null;
  private activeVoiceGain: GainNode | null = null;
  private activeVoiceElement: HTMLAudioElement | null = null;

  constructor() {
    // Initialized on first user interaction
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volumes.master, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.volumes.sfx, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.volumes.ambient, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.voiceGain = this.ctx.createGain();
      this.voiceGain.gain.setValueAtTime(this.volumes.voice, this.ctx.currentTime);
      this.voiceGain.connect(this.masterGain);

      console.log('[AudioDiag] AudioContext initialized, state:', this.ctx.state);
    } catch (err) {
      console.warn('[AudioDiag] Web Audio API initialization failed:', err);
    }
  }

  public unlock() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        console.log('[AudioDiag] AudioContext resumed successfully to:', this.ctx?.state);
      }).catch((err) => {
        console.warn('[AudioDiag] AudioContext resume failed:', err);
      });
    }
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  public getVoiceGain(): GainNode | null {
    return this.voiceGain;
  }

  public getMasterGain(): GainNode | null {
    return this.masterGain;
  }

  public getVolumes() {
    return { ...this.volumes };
  }

  public setVolumes(master: number, sfx: number, ambient: number, voice: number) {
    this.volumes = { master, sfx, ambient, voice };
    if (!this.ctx) return;
    if (this.masterGain) this.masterGain.gain.setValueAtTime(master, this.ctx.currentTime);
    if (this.sfxGain) this.sfxGain.gain.setValueAtTime(sfx, this.ctx.currentTime);
    if (this.ambientGain) this.ambientGain.gain.setValueAtTime(ambient, this.ctx.currentTime);
    if (this.voiceGain) this.voiceGain.gain.setValueAtTime(voice, this.ctx.currentTime);
  }

  public resume() {
    this.unlock();
  }

  // --- SOUND EFFECTS ---

  /**
   * Electric Mosquito Racket ZAP!
   */
  public playRacketZap(isCharged: boolean = false) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // High frequency pop + spark noise
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isCharged ? 1800 : 950, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + (isCharged ? 0.35 : 0.15));

    oscGain.gain.setValueAtTime(0.8, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isCharged ? 0.35 : 0.15));

    // Electric noise crackle buffer
    const bufferSize = this.ctx.sampleRate * (isCharged ? 0.25 : 0.12);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(2500, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(isCharged ? 0.9 : 0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + (isCharged ? 0.25 : 0.12));

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.4);
    whiteNoise.start(now);
  }

  /**
   * Newspaper Slap THWACK!
   */
  public playNewspaperSlap() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Deep punchy body
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    // Snap transient
    const bufferSize = this.ctx.sampleRate * 0.08;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const snap = this.ctx.createBufferSource();
    snap.buffer = noiseBuffer;
    const snapFilter = this.ctx.createBiquadFilter();
    snapFilter.type = 'bandpass';
    snapFilter.frequency.setValueAtTime(1400, now);

    const snapGain = this.ctx.createGain();
    snapGain.gain.setValueAtTime(0.7, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    snap.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
    snap.start(now);
  }

  /**
   * Aerosol Spray Hiss
   */
  public playSprayHiss(duration: number = 0.2) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.Q.setValueAtTime(1.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  /**
   * Fan Wind Gust
   */
  public playFanBlast() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.6;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.linearRampToValueAtTime(1200, now + 0.2);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.6);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.linearRampToValueAtTime(0.8, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  /**
   * Coil Placement sizzle / smoke lit
   */
  public playCoilPlace() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Match strike + ember hiss
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Footstep sound
   */
  public playFootstep() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90 + Math.random() * 30, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Player Hit / Ouch / Mosquito Bite
   */
  public playPlayerHit() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  /**
   * Voltage fluctuation / Mains light flicker buzz before power cut
   */
  public playVoltageFlicker() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Erratic 50Hz AC mains hum
    const hum = this.ctx.createOscillator();
    const humGain = this.ctx.createGain();
    hum.type = 'sawtooth';
    hum.frequency.setValueAtTime(50, now);
    hum.frequency.linearRampToValueAtTime(45, now + 1.6);

    humGain.gain.setValueAtTime(0.15, now);
    humGain.gain.linearRampToValueAtTime(0.4, now + 0.5);
    humGain.gain.linearRampToValueAtTime(0.05, now + 1.2);
    humGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    hum.connect(humGain);
    humGain.connect(this.sfxGain);
    hum.start(now);
    hum.stop(now + 1.85);

    // Rapid intermittent sputtering spark crackles
    for (let i = 0; i < 4; i++) {
      const sparkTime = now + 0.2 + i * 0.35 + Math.random() * 0.1;
      const spark = this.ctx.createOscillator();
      const sGain = this.ctx.createGain();
      spark.type = 'square';
      spark.frequency.setValueAtTime(1200 + Math.random() * 800, sparkTime);
      spark.frequency.exponentialRampToValueAtTime(100, sparkTime + 0.08);

      sGain.gain.setValueAtTime(0.3, sparkTime);
      sGain.gain.exponentialRampToValueAtTime(0.01, sparkTime + 0.08);

      spark.connect(sGain);
      sGain.connect(this.sfxGain);
      spark.start(sparkTime);
      spark.stop(sparkTime + 0.09);
    }
  }

  /**
   * Power Outage Dramatic Event!
   * Heavy clunk, slowing hum, electrical dropout
   */
  public playPowerOutage() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Heavy relay breaker trip
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(160, now);
    thud.frequency.exponentialRampToValueAtTime(20, now + 0.4);
    thudGain.gain.setValueAtTime(0.9, now);
    thudGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    thud.connect(thudGain);
    thudGain.connect(this.sfxGain);
    thud.start(now);
    thud.stop(now + 0.45);

    // Motor spool-down whine (ceiling fan slowing to a halt)
    const whine = this.ctx.createOscillator();
    const whineGain = this.ctx.createGain();
    whine.type = 'triangle';
    whine.frequency.setValueAtTime(220, now);
    whine.frequency.exponentialRampToValueAtTime(20, now + 2.2);
    whineGain.gain.setValueAtTime(0.5, now);
    whineGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
    whine.connect(whineGain);
    whineGain.connect(this.sfxGain);
    whine.start(now);
    whine.stop(now + 2.3);
  }

  /**
   * Fuse Box Reset / Power Restored!
   */
  public playFuseReset() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Switch click
    const click = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(800, now);
    click.frequency.exponentialRampToValueAtTime(200, now + 0.08);
    clickGain.gain.setValueAtTime(0.7, now);
    clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    click.connect(clickGain);
    clickGain.connect(this.sfxGain);
    click.start(now);
    click.stop(now + 0.1);

    // Power surge / fan hum starting up
    const surge = this.ctx.createOscillator();
    const surgeGain = this.ctx.createGain();
    surge.type = 'sawtooth';
    surge.frequency.setValueAtTime(60, now + 0.1);
    surge.frequency.linearRampToValueAtTime(220, now + 1.2);
    surgeGain.gain.setValueAtTime(0.01, now + 0.1);
    surgeGain.gain.linearRampToValueAtTime(0.4, now + 0.5);
    surgeGain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
    surge.connect(surgeGain);
    surgeGain.connect(this.sfxGain);
    surge.start(now + 0.1);
    surge.stop(now + 1.6);
  }

  /**
   * Boss Roar / Sonic Buzz
   */
  public playBossRoar(pitchMod: number = 1.0) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(140 * pitchMod, now);
    osc1.frequency.exponentialRampToValueAtTime(70 * pitchMod, now + 1.2);

    osc2.frequency.setValueAtTime(210 * pitchMod, now);
    osc2.frequency.exponentialRampToValueAtTime(95 * pitchMod, now + 1.2);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.linearRampToValueAtTime(0.85, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.3);
    osc2.stop(now + 1.3);
  }

  /**
   * Item pickup sound (chime)
   */
  public playPickup() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.25, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.22);
    });
  }

  /**
   * Ambient ceiling fan drone (can be stopped during power cut)
   */
  public startCeilingFan() {
    if (!this.ctx || !this.ambientGain || this.fanNode) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.25;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);
    noise.start();

    this.fanNode = { noise, filter, gain };
  }

  public stopCeilingFan() {
    if (this.fanNode && this.ctx) {
      try {
        this.fanNode.gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);
        setTimeout(() => {
          if (this.fanNode) {
            (this.fanNode.noise as AudioScheduledSourceNode).stop();
            this.fanNode = null;
          }
        }, 1100);
      } catch {
        this.fanNode = null;
      }
    }
  }

  /**
   * Spatial 3D mosquito swarm buzzing simulation!
   * Dynamically tracks distance and bearing of nearest mosquitoes
   */
  public updateMosquitoBuzz(mosquitoCount: number, nearestDistance: number, isPowerCut: boolean) {
    if (!this.ctx || !this.sfxGain) return;
    if (mosquitoCount <= 0) {
      this.stopAllMosquitoBuzz();
      return;
    }

    // Power cuts make buzzing creepier and louder
    const targetVolume = Math.min(0.6, (0.08 + (isPowerCut ? 0.35 : 0.15)) * Math.max(0.1, 1 - nearestDistance / 20));

    if (!this.mosquitoBuzzNodes.has('main')) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(isPowerCut ? 380 : 420, this.ctx.currentTime);

      // Pitch vibrato for mosquito wing buzz
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(14, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(30, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      lfo.start();

      this.mosquitoBuzzNodes.set('main', { osc, gain, panner: null });
    }

    const node = this.mosquitoBuzzNodes.get('main');
    if (node) {
      node.gain.gain.linearRampToValueAtTime(targetVolume, this.ctx.currentTime + 0.1);
      node.osc.frequency.setValueAtTime(isPowerCut ? 320 : 440, this.ctx.currentTime);
    }
  }

  public stopAllMosquitoBuzz() {
    this.mosquitoBuzzNodes.forEach((node) => {
      if (this.ctx) {
        node.gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
        setTimeout(() => {
          try {
            node.osc.stop();
          } catch {
            // Already stopped
          }
        }, 250);
      }
    });
    this.mosquitoBuzzNodes.clear();
  }

  public getAudioContextState(): string {
    return this.ctx ? this.ctx.state : 'uninitialized';
  }

  public getVoiceVolume(): number {
    return this.volumes.voice;
  }

  /**
   * Stop any actively playing voice line with a short anti-click fade.
   */
  public stopVoiceAudio(): void {
    if (this.activeVoiceSource) {
      const source = this.activeVoiceSource;
      const gain = this.activeVoiceGain;
      this.activeVoiceSource = null;
      this.activeVoiceGain = null;

      // Detach the completion callback so an interrupted line can never clear the
      // subtitle for the line that replaces it.
      source.onended = null;
      source.addEventListener('ended', () => {
        try {
          source.disconnect();
        } catch {
          // Already disconnected
        }
        try {
          gain?.disconnect();
        } catch {
          // Already disconnected
        }
      });

      const now = this.ctx ? this.ctx.currentTime : 0;
      if (gain && this.ctx) {
        try {
          gain.gain.cancelScheduledValues(now);
          gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
          gain.gain.linearRampToValueAtTime(0.0001, now + 0.055);
        } catch {
          // Ignore automation errors on an already-disposed context
        }
      }
      try {
        source.stop(now + 0.065);
      } catch {
        try {
          source.stop();
        } catch {
          // Ignored if already finished
        }
      }
    }
    if (this.activeVoiceElement) {
      const audio = this.activeVoiceElement;
      this.activeVoiceElement = null;
      audio.onended = null;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // Ignored
      }
    }
  }

  /**
   * Play an authentic, crystal-clear Bangladeshi Bangla voice audio file.
   * Decodes MP3 data into Web Audio memory buffer, routed through dedicated voiceGain.
   * Automatically handles Chrome PC AudioContext resumption and provides HTMLAudio fallback.
   */
  public async playVoiceAudio(
    url: string,
    volume: number = 1.0,
    onEnd?: () => void
  ): Promise<{ success: boolean; error?: string }> {
    this.unlock();
    this.stopVoiceAudio();

    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        try {
          await this.ctx.resume();
          console.log('[AudioDiag] AudioContext resumed, state:', this.ctx.state);
        } catch (e) {
          console.warn('[AudioDiag] AudioContext resume failed:', e);
        }
      }

      try {
        let buffer = this.voiceBuffers.get(url);
        if (!buffer) {
          const resp = await fetch(url);
          if (!resp.ok) {
            throw new Error(`Failed to load audio (${resp.status}): ${url}`);
          }
          const arrayBuf = await resp.arrayBuffer();
          buffer = await this.ctx.decodeAudioData(arrayBuf);
          this.voiceBuffers.set(url, buffer);
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const gainNode = this.ctx.createGain();
        const targetGain = Math.max(0.1, Math.min(2.0, volume));
        const startTime = this.ctx.currentTime;
        // 20 ms fade-in prevents the speaker "pop" some Android devices produce.
        gainNode.gain.setValueAtTime(0.0001, startTime);
        gainNode.gain.linearRampToValueAtTime(targetGain, startTime + 0.02);

        source.connect(gainNode);
        if (this.voiceGain) {
          gainNode.connect(this.voiceGain);
        } else {
          gainNode.connect(this.ctx.destination);
        }

        this.activeVoiceSource = source;
        this.activeVoiceGain = gainNode;
        // Only the line that is still active may report completion. This keeps
        // subtitles, diagnostics and the speaking flag in sync when lines overlap.
        source.onended = () => {
          if (this.activeVoiceSource !== source) return;
          this.activeVoiceSource = null;
          this.activeVoiceGain = null;
          try {
            source.disconnect();
            gainNode.disconnect();
          } catch {
            // Already disconnected
          }
          onEnd?.();
        };

        source.start(startTime);
        return { success: true };
      } catch (decodeErr) {
        console.warn('[AudioDiag] WebAudio buffer decode failed, trying HTMLAudio fallback:', decodeErr);
      }
    }

    // HTMLAudioElement fallback
    try {
      const audio = new Audio(url);
      audio.volume = Math.max(0, Math.min(1.0, volume * this.volumes.voice * this.volumes.master));
      this.activeVoiceElement = audio;
      audio.onended = () => {
        if (this.activeVoiceElement !== audio) return;
        this.activeVoiceElement = null;
        onEnd?.();
      };
      await audio.play();
      return { success: true };
    } catch (htmlErr) {
      const errMsg = htmlErr instanceof Error ? htmlErr.message : String(htmlErr);
      console.warn('[AudioDiag] HTMLAudio playback error:', errMsg);
      onEnd?.();
      return { success: false, error: errMsg };
    }
  }
}

export const soundManager = new SoundSystem();
