/**
 * Alert Center Card
 */

class AlertCenterCard extends window.HTMLElement {
  setConfig(config) {
    this.config = config;
  }

  set hass(hass) {
    this.hass = hass;
    if (!this.content) {
      const card = document.createElement('ha-card');
      card.header = 'Alert Center';
      this.content = document.createElement('div');
      this.content.style.padding = '16px';
      card.appendChild(this.content);
      this.appendChild(card);
    }
    this.content.innerHTML = '<p>Alert Center Card</p>';
  }

  getCardSize() {
    return 2;
  }

  static getStubConfig() {
    return {};
  }
}

const registry = window.customElements;
if (!registry.get('alert-center-card')) {
  registry.define('alert-center-card', AlertCenterCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === 'alert-center-card')) {
  window.customCards.push({
    type: 'alert-center-card',
    name: 'Alert Center Card',
    description: 'A simple Alert Center card',
  });
}
