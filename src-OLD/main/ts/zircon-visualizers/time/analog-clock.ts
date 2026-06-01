import { v4 as uuid } from 'uuid';
import { AbstractClock, ClockState } from './clock';
import './analog-clock.css';

export interface AnalogClockState extends ClockState {
  type: typeof AnalogClock.ANALOG_CLOCK_VISUALIZER_TYPE;
}

export class AnalogClock extends AbstractClock {
  public static readonly ANALOG_CLOCK_VISUALIZER_TYPE =
    'ANALOG_CLOCK_VISUALIZER_TYPE';

  private __mainDiv: HTMLDivElement | null = null;
  private __canvas: HTMLCanvasElement | null = null;
  private __ctx: CanvasRenderingContext2D | null = null;
  private __animationFrameId: number | null = null;

  // Stockage de la dernière date reçue pour pouvoir redessiner si le canvas change de taille
  private __lastDate: Date = new Date();

  constructor(state?: AnalogClockState) {
    super(state);
  }

  // =========================================================
  // CONTAINER
  // =========================================================

  public getContainer(): HTMLDivElement {
    if (this.__mainDiv) return this.__mainDiv;

    this.__mainDiv = document.createElement('div');
    this.__mainDiv.id = uuid();
    this.__mainDiv.classList.add('analog-clock-container');

    this.__canvas = document.createElement('canvas');
    this.__canvas.classList.add('clock-canvas');

    this.__mainDiv.appendChild(this.__canvas);

    // Initialisation du contexte de rendu 2D
    this.__ctx = this.__canvas.getContext('2d');

    // Observation des changements de taille du conteneur pour redimensionner le canvas
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => this.__resizeCanvas());
      resizeObserver.observe(this.__mainDiv);
    }

    return this.__mainDiv;
  }

  // =========================================================
  // RESIZE MANAGEMENT
  // =========================================================

  private __resizeCanvas(): void {
    if (!this.__canvas || !this.__mainDiv) return;

    // On récupère la taille du conteneur parent
    const rect = this.__mainDiv.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height) || 300; // 300px par défaut si masqué au départ

    // Ajustement de la résolution interne du canvas (multiplié par l'appareil pour un rendu Retina/HD net)
    const dpr = window.devicePixelRatio || 1;
    this.__canvas.width = size * dpr;
    this.__canvas.height = size * dpr;

    // On force la taille d'affichage CSS pour bloquer le ratio 1:1
    this.__canvas.style.width = `${size}px`;
    this.__canvas.style.height = `${size}px`;

    if (this.__ctx) {
      this.__ctx.scale(dpr, dpr);
    }

    // On redessine immédiatement après le changement de taille
    this.displayTime(this.__lastDate);
  }

  // =========================================================
  // DISPLAY TIME (CANVAS RENDERING)
  // =========================================================

  protected displayTime(day: Date): void {
    this.__lastDate = day;

    if (!this.__canvas || !this.__ctx) return;

    const ctx = this.__ctx;
    const size = this.__canvas.width / (window.devicePixelRatio || 1);
    const radius = size / 2;

    // Nettoyage complet du canvas
    ctx.clearRect(0, 0, size, size);

    // On déplace le repère (0,0) au centre du cadran
    ctx.save();
    ctx.translate(radius, radius);

    // --- 1. DESSIN DU CADRAN ---
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.95, 0, 2 * Math.PI);
    ctx.fillStyle = '#f8fafc'; // Blanc bleuté moderne
    ctx.fill();
    ctx.lineWidth = radius * 0.03;
    ctx.strokeStyle = '#1e293b'; // Slate 800
    ctx.stroke();

    // --- 2. DESSIN DES TICKS & CHIFFRES ---
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = `bold ${radius * 0.13}px 'Segoe UI', Roboto, sans-serif`;

    for (let i = 0; i < 60; i++) {
      const angle = (i * Math.PI) / 30;

      ctx.save();
      ctx.rotate(angle);

      if (i % 5 === 0) {
        // C'est une heure : on dessine un tick épais
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.9);
        ctx.lineTo(0, -radius * 0.82);
        ctx.lineWidth = radius * 0.025;
        ctx.strokeStyle = '#0f172a';
        ctx.stroke();

        // Ajout du chiffre correspondant
        ctx.save();
        // On se déplace à l'emplacement du texte
        ctx.translate(0, -radius * 0.7);
        // On redresse le texte pour qu'il soit droit
        ctx.rotate(-angle);
        ctx.fillStyle = '#1e293b';
        const hourNumber = i === 0 ? 12 : i / 5;
        ctx.fillText(hourNumber.toString(), 0, 0);
        ctx.restore();
      } else {
        // C'est une minute : tick plus fin
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.9);
        ctx.lineTo(0, -radius * 0.86);
        ctx.lineWidth = radius * 0.01;
        ctx.strokeStyle = '#94a3b8'; // Slate 400
        ctx.stroke();
      }

      ctx.restore();
    }

    // --- 3. CALCUL DES ANGLES DES AIGUILLES ---
    const seconds = day.getSeconds();
    const minutes = day.getMinutes();
    const hours = day.getHours() % 12;

    const secondRad = (seconds * Math.PI) / 30;
    const minuteRad = (minutes * Math.PI) / 30 + (seconds * Math.PI) / 1800;
    const hourRad =
      (hours * Math.PI) / 6 +
      (minutes * Math.PI) / 360 +
      (seconds * Math.PI) / 21600;

    // --- 4. AIGUILLE DES HEURES (Courte et large) ---
    ctx.save();
    ctx.rotate(hourRad);
    ctx.beginPath();
    ctx.moveTo(0, radius * 0.1); // Déborde légèrement à l'arrière du pivot
    ctx.lineTo(0, -radius * 0.5);
    ctx.lineWidth = radius * 0.04;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();
    ctx.restore();

    // --- 5. AIGUILLE DES MINUTES (Longue et moyenne) ---
    ctx.save();
    ctx.rotate(minuteRad);
    ctx.beginPath();
    ctx.moveTo(0, radius * 0.1);
    ctx.lineTo(0, -radius * 0.75);
    ctx.lineWidth = radius * 0.025;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#334155';
    ctx.stroke();
    ctx.restore();

    // --- 6. AIGUILLE DES SECONDES (Fine, rouge avec un contrepoids) ---
    ctx.save();
    ctx.rotate(secondRad);
    ctx.beginPath();
    ctx.moveTo(0, radius * 0.2); // Contrepoids plus long vers le bas
    ctx.lineTo(0, -radius * 0.82);
    ctx.lineWidth = radius * 0.012;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ef4444'; // Rouge moderne
    ctx.stroke();
    ctx.restore();

    // --- 7. PIVOT CENTRAL ---
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.04, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Petit point de lumière au centre du pivot
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.015, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Restauration du contexte original
    ctx.restore();
  }

  // =========================================================
  // STATE
  // =========================================================

  public override generateCurrentState(): AnalogClockState {
    return {
      ...super.generateCurrentState(),
      type: AnalogClock.ANALOG_CLOCK_VISUALIZER_TYPE,
    };
  }
}
