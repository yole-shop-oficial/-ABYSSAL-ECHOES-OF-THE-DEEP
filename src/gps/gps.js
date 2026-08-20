// Geolocation service with smoothing + anti-teleport (sections 10, 15-16, 54-55, 157-158)
export const GPS_STATE = {
  UNAVAILABLE: 'unavailable',
  REQUESTING: 'requesting',
  ACTIVE: 'active',
  STABLE: 'stable',
  UNSTABLE: 'unstable'
};

export class GpsService {
  constructor() {
    this.state = GPS_STATE.UNAVAILABLE;
    this.enabled = false;
    this.lat = null; this.lon = null;
    this.accuracy = null; this.heading = null;
    this.timestamp = 0;
    this.originLat = null; this.originLon = null;
    this.worldX = 0; this.worldZ = 0;
    this.smoothFactor = 0.3;
    this.threshold = 15; // meters, ignore smaller jumps when smoothing
    this._watchId = null;
    this.listeners = [];
  }

  onUpdate(fn) { this.listeners.push(fn); return () => { this.listeners = this.listeners.filter(l => l !== fn); }; }

  _emit() {
    const data = this.snapshot();
    this.listeners.forEach(fn => fn(data));
  }

  isAvailable() {
    return 'geolocation' in navigator;
  }

  enable() {
    if (!this.isAvailable()) { this.state = GPS_STATE.UNAVAILABLE; this._emit(); return false; }
    this.enabled = true;
    this.state = GPS_STATE.REQUESTING;
    this._emit();
    this._watchId = navigator.geolocation.watchPosition(
      (pos) => this._onPosition(pos),
      (err) => { this.state = GPS_STATE.UNAVAILABLE; this._emit(); },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
    return true;
  }

  disable() {
    this.enabled = false;
    if (this._watchId !== null) { navigator.geolocation.clearWatch(this._watchId); this._watchId = null; }
    this.state = GPS_STATE.UNAVAILABLE;
    this._emit();
  }

  _onPosition(pos) {
    const { latitude, longitude, accuracy, heading, speed } = pos.coords;
    // first fix sets origin
    if (this.originLat === null) { this.originLat = latitude; this.originLon = longitude; }
    // anti-teleport: if jump > 5km, reset origin (avoid corrupting)
    if (this.lat !== null) {
      const d = this._haversine(this.lat, this.lon, latitude, longitude);
      if (d > 5000) { this.state = GPS_STATE.UNSTABLE; this._emit(); return; }
    }
    // smoothing
    if (this.lat !== null) {
      const d = this._haversine(this.lat, this.lon, latitude, longitude);
      if (d > this.threshold) {
        this.lat = latitude; this.lon = longitude;
      }
    } else {
      this.lat = latitude; this.lon = longitude;
    }
    this.accuracy = accuracy;
    this.heading = heading;
    this.timestamp = Date.now();
    // convert to local world coords
    const dx = this._dx(latitude, longitude);
    const dz = this._dy(latitude, longitude);
    this.worldX = this.worldX * (1 - this.smoothFactor) + dx * this.smoothFactor;
    this.worldZ = this.worldZ * (1 - this.smoothFactor) + dz * this.smoothFactor;
    this.state = accuracy < 40 ? GPS_STATE.STABLE : GPS_STATE.ACTIVE;
    this._emit();
  }

  _dx(lat, lon) { return (lon - this.originLon) * 111320 * Math.cos((lat * Math.PI) / 180); }
  _dy(lat, lon) { return (lat - this.originLat) * 110540; }

  _haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000; const toRad = a => (a * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  snapshot() {
    return {
      state: this.state, enabled: this.enabled,
      lat: this.lat, lon: this.lon, accuracy: this.accuracy, heading: this.heading,
      worldX: this.worldX, worldZ: this.worldZ
    };
  }
}
