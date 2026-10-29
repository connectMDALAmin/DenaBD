/**
 * Windows XP Sound Effects Service
 * Manages authentic audio effects:
 * - Logon Sound (xp_logon.wav)
 * - Logoff Sound (xp_logoff.wav)
 * - Navigation / Button Click Sound (xp_click.wav + Web Audio API synthesizer)
 */

class SoundService {
  private enabled: boolean = true;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private audioCtx: AudioContext | null = null;
  private isInitialized: boolean = false;
  private lastClickTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('denapawna_sound_enabled');
      this.enabled = stored !== null ? stored === 'true' : true;

      // Preload audio files
      this.preloadSound('logon', '/sounds/xp_logon.wav');
      this.preloadSound('logoff', '/sounds/xp_logoff.wav');
      this.preloadSound('click', '/sounds/xp_click.wav');

      // Initialize audio context on first user interaction to satisfy browser autoplay policies
      const unlockAudio = () => {
        this.initAudioContext();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };
      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
    }
  }

  private initAudioContext() {
    if (this.isInitialized) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        this.isInitialized = true;
      }
    } catch (e) {
      console.warn('Web Audio Context initialization warning:', e);
    }
  }

  private preloadSound(name: string, url: string) {
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = url;
      this.audioCache.set(name, audio);
    } catch {
      // Audio not supported in this environment
    }
  }

  public isSoundEnabled(): boolean {
    return this.enabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.enabled = enabled;
    try {
      localStorage.setItem('denapawna_sound_enabled', enabled ? 'true' : 'false');
    } catch {
      // ignore
    }
  }

  public toggleSound(): boolean {
    const next = !this.enabled;
    this.setSoundEnabled(next);
    return next;
  }

  /**
   * Play Windows XP Logon Sound
   */
  public async playLogon(): Promise<void> {
    if (!this.enabled) return;
    this.initAudioContext();
    try {
      let audio = this.audioCache.get('logon');
      if (!audio) {
        audio = new Audio('/sounds/xp_logon.wav');
        this.audioCache.set('logon', audio);
      }
      audio.currentTime = 0;
      audio.volume = 0.85;
      await audio.play();
    } catch (err) {
      console.warn('Could not play XP logon sound (autoplay restrictions may apply):', err);
    }
  }

  /**
   * Play Windows XP Logoff Sound
   */
  public async playLogoff(): Promise<void> {
    if (!this.enabled) return;
    this.initAudioContext();
    try {
      let audio = this.audioCache.get('logoff');
      if (!audio) {
        audio = new Audio('/sounds/xp_logoff.wav');
        this.audioCache.set('logoff', audio);
      }
      audio.currentTime = 0;
      audio.volume = 0.85;
      await audio.play();
    } catch (err) {
      console.warn('Could not play XP logoff sound:', err);
    }
  }

  /**
   * Play Windows XP Navigation / Click Sound
   * Emits a crisp, authentic mechanical tick with zero latency.
   */
  public playClick(): void {
    if (!this.enabled) return;

    // Debounce rapid repeat clicks (< 60ms)
    const now = Date.now();
    if (now - this.lastClickTime < 60) {
      return;
    }
    this.lastClickTime = now;

    // First try Web Audio API synthesized click for immediate low-latency response
    if (this.playWebAudioClick()) {
      return;
    }

    // Fallback to audio element
    try {
      const audio = this.audioCache.get('click');
      if (audio) {
        audio.currentTime = 0;
        audio.volume = 0.6;
        audio.play().catch(() => {});
      } else {
        const fallback = new Audio('/sounds/xp_click.wav');
        fallback.volume = 0.6;
        fallback.play().catch(() => {});
      }
    } catch {
      // Audio playback ignored
    }
  }

  /**
   * Synthesize crisp Windows XP Navigation Click via Web Audio API
   */
  private playWebAudioClick(): boolean {
    try {
      if (!this.audioCtx) {
        this.initAudioContext();
      }
      if (!this.audioCtx || this.audioCtx.state === 'suspended') {
        if (this.audioCtx) this.audioCtx.resume().catch(() => {});
        return false;
      }

      const ctx = this.audioCtx;
      const t = ctx.currentTime;

      // Bandpass filtered short resonant pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, t);
      filter.Q.setValueAtTime(2.5, t);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.035);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.036);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Attach global click listener to automatically play click sound
   * on interactive elements across the application without boilerplate.
   */
  public attachGlobalClickListener(): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if target or any ancestor is an interactive element
      const interactive = target.closest(
        'button, a, input[type="button"], input[type="submit"], input[type="checkbox"], input[type="radio"], [role="button"], [role="tab"], [role="menuitem"], .xp-button, .xp-desktop-icon, .xp-start-btn, select'
      );

      if (interactive) {
        this.playClick();
      }
    };

    window.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('click', handleClick, true);
    };
  }
}

export const soundService = new SoundService();
