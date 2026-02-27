class ServerTime {
  constructor() {
    this.serverTime = null;
    this.offset = 0;
    this.isSynced = false;
  }

  async sync() {
    try {
      const start = Date.now();
      const response = await fetch('/api/server-time');
      const data = await response.json();
      const end = Date.now();
      const latency = end - start;
      
      this.serverTime = new Date(data.serverTime).getTime() + Math.floor(latency / 2);
      this.isSynced = true;
      
      // تحديث كل دقيقة
      setInterval(() => this.sync(), 60000);
      
      return this.serverTime;
    } catch (error) {
      console.error('Failed to sync server time:', error);
      return Date.now(); // استخدام وقت الجهاز كبديل
    }
  }

  getNow() {
    if (!this.isSynced) return new Date();
    return new Date(this.serverTime + (Date.now() - this.serverTime));
  }

  getTime() {
    return this.getNow().getTime();
  }

  format(date) {
    return date.toLocaleString('ar-EG', {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  }

  isExpired(expiresAt) {
    return this.getTime() > new Date(expiresAt).getTime();
  }

  getRemainingTime(expiresAt) {
    const remaining = new Date(expiresAt).getTime() - this.getTime();
    return Math.max(0, remaining);
  }
}

export default new ServerTime();