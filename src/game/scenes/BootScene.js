/**
 * BootScene — Inicialización limpia sin carga de assets
 * No carga NADA aquí para evitar bloqueos
 */
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  create() {
    this.cameras.main.setBackgroundColor('#040812');

    const caps = {
      gps: 'geolocation' in navigator,
      camera: 'mediaDevices' in navigator,
      vibration: 'vibrate' in navigator,
      webrtc: 'RTCPeerConnection' in window,
      indexedDB: 'indexedDB' in window,
      serviceWorker: 'serviceWorker' in navigator,
      notifications: 'Notification' in window,
      nfc: 'NDEFReader' in window
    };

    const deviceScore = this._scoreDevice();
    const quality = deviceScore >= 80 ? 'HIGH' : deviceScore >= 50 ? 'MEDIUM' : 'LOW';

    this.registry.set('deviceCaps', caps);
    this.registry.set('renderQuality', quality);
    this.registry.set('deviceScore', deviceScore);

    // Ir directo a LoadingScene sin cargar nada aquí
    this.scene.start('LoadingScene');
  }

  _scoreDevice() {
    let score = 50;
    if (navigator.deviceMemory) {
      if (navigator.deviceMemory >= 8) score += 30;
      else if (navigator.deviceMemory >= 4) score += 15;
    }
    if (navigator.hardwareConcurrency) {
      if (navigator.hardwareConcurrency >= 8) score += 20;
      else if (navigator.hardwareConcurrency >= 4) score += 10;
    }
    return Math.min(100, score);
  }
}
