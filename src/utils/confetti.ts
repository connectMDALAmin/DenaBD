import confetti from 'canvas-confetti';

export function triggerSettlementCelebration(): void {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0055EA', '#388E3C', '#FFB300', '#D32F2F', '#7B1FA2'],
    });
  } catch (e) {
    // Graceful fallback if canvas is unavailable
  }
}
