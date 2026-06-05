/**
 * Alert Center Card
 */

class AlertCenterCard extends HTMLElement {
  constructor() {
    super();
    this.content = null;
  }

  setConfig(config) {
    this.config = config || {};
  }

  set hass(hass) {
    if (!hass) return;
    
    this.hass = hass;
    if (!this.content) {
      this._createCard();
    }
  }

  _createCard() {
    const card = document.createElement('ha-card');
    card.header = 'Alert Center';
    
    this.content = document.createElement('div');
    this.content.style.padding = '16px';
    
    const message = document.createElement('p');
    message.textContent = 'Alert Center Card';
    
    this.content.appendChild(message);
    card.appendChild(this.content);
    
    // Clear previous content
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }
    
    this.appendChild(card);
  }

  getCardSize() {
    return 2;
  }

  static getStubConfig() {
    return { title: 'Alert Center' };
  }
}

// Register the custom element
customElements.define('alert-center-card', AlertCenterCard);

// Register with HA's custom cards list
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'alert-center-card',
  name: 'Alert Center Card',
  description: 'A simple Alert Center card',
  preview: false,
  documentationURL: 'https://github.com/Fiveol/alertcenter'
});

