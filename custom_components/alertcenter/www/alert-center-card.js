/**
 * Alert Center Card
 */

class AlertCenterCard extends HTMLElement {
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

customElements.define('alert-center-card', AlertCenterCard);
