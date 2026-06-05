import { LitElement, html, css } from "https://cdn.jsdelivr.net/npm/lit@3/+esm";

class AlertCenterPanel extends LitElement {
  static properties = {
    hass: { type: Object },
    narrow: { type: Boolean },
    route: { type: Object },
    _activeTab: { state: true },
    _devices: { state: true },
    _selectedDevices: { state: true },
    _notificationTitle: { state: true },
    _notificationMessage: { state: true },
    _loading: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }
    .container {
      padding: 16px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      border-bottom: 2px solid var(--divider-color);
    }
    .tab {
      padding: 8px 16px;
      cursor: pointer;
      background: none;
      border: none;
      color: var(--secondary-text-color);
      font-size: 14px;
      transition: color 0.2s;
    }
    .tab.active {
      color: var(--primary-color);
      border-bottom: 3px solid var(--primary-color);
      margin-bottom: -2px;
    }
    .tab:hover {
      color: var(--primary-text-color);
    }
    .tab-content {
      flex: 1;
      overflow-y: auto;
    }
    .devices-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .device-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
    }
    .device-item input[type="checkbox"] {
      cursor: pointer;
      width: 18px;
      height: 18px;
    }
    .device-name {
      flex: 1;
      font-weight: 500;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }
    .form-group label {
      font-weight: 500;
      font-size: 14px;
    }
    .form-group input,
    .form-group textarea {
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-family: inherit;
      font-size: 14px;
    }
    .form-group textarea {
      resize: vertical;
      min-height: 80px;
    }
    .button-group {
      display: flex;
      gap: 8px;
    }
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
    }
    .btn-primary {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .btn-primary:hover {
      background: var(--primary-color-dark, var(--primary-color));
      opacity: 0.9;
    }
    .btn-secondary {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      border: 1px solid var(--divider-color);
    }
    .btn-secondary:hover {
      background: var(--divider-color);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .no-devices {
      padding: 24px;
      text-align: center;
      color: var(--secondary-text-color);
    }
    .status {
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    .status.success {
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
      border: 1px solid #4caf50;
    }
    .status.error {
      background: rgba(244, 67, 54, 0.1);
      color: #f44336;
      border: 1px solid #f44336;
    }
  `;

  constructor() {
    super();
    this._activeTab = "send";
    this._devices = [];
    this._selectedDevices = [];
    this._notificationTitle = "Alert Center";
    this._notificationMessage = "";
    this._loading = true;
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadDevices();
  }

  async _loadDevices() {
    this._loading = true;
    try {
      const devices = await this.hass.callWS({
        type: "alertcenter/get_devices",
      });
      this._devices = devices || [];
    } catch (error) {
      console.error("Failed to load devices:", error);
    }
    this._loading = false;
  }


  _toggleDevice(deviceId) {
    const index = this._selectedDevices.indexOf(deviceId);
    if (index >= 0) {
      this._selectedDevices.splice(index, 1);
    } else {
      this._selectedDevices.push(deviceId);
    }
    this.requestUpdate();
  }

  async _sendNotification() {
    if (!this._notificationMessage.trim()) {
      alert("Please enter a message");
      return;
    }
    if (this._selectedDevices.length === 0) {
      alert("Please select at least one device");
      return;
    }

    try {
      await this.hass.callWS({
        type: "alertcenter/notify",
        devices: this._selectedDevices,
        message: this._notificationMessage,
        title: this._notificationTitle,
      });
      this._notificationMessage = "";
      this._selectedDevices = [];
      this.requestUpdate();
    } catch (error) {
      alert("Failed to send notification: " + error.message);
    }
  }

  render() {
    return html`
      <div class="container">
        <div class="tabs">
          <button
            class="tab ${this._activeTab === "send" ? "active" : ""}"
            @click="${() => (this._activeTab = "send")}"
          >
            Send Alert
          </button>
          <button
            class="tab ${this._activeTab === "devices" ? "active" : ""}"
            @click="${() => (this._activeTab = "devices")}"
          >
            Devices (${this._devices.length})
          </button>
        </div>

        <div class="tab-content">
          ${this._activeTab === "send"
            ? this._renderSendTab()
            : this._renderDevicesTab()}
        </div>
      </div>
    `;
  }

  _renderSendTab() {
    return html`
      <div class="form-group">
        <label>Title</label>
        <input
          type="text"
          .value="${this._notificationTitle}"
          @input="${(e) => (this._notificationTitle = e.target.value)}"
          placeholder="Alert Center"
        />
      </div>

      <div class="form-group">
        <label>Message</label>
        <textarea
          .value="${this._notificationMessage}"
          @input="${(e) => (this._notificationMessage = e.target.value)}"
          placeholder="Enter your alert message here..."
        ></textarea>
      </div>

      <div class="form-group">
        <label>Select Devices</label>
        ${this._devices.length === 0
          ? html`<div class="no-devices">No notify devices available</div>`
          : html`
              <div class="devices-list">
                ${this._devices.map(
                  (device) => html`
                    <div class="device-item">
                      <input
                        type="checkbox"
                        .checked="${this._selectedDevices.includes(device)}"
                        @change="${() => this._toggleDevice(device)}"
                      />
                      <span class="device-name">${device}</span>
                    </div>
                  `,
                )}
              </div>
            `}
      </div>

      <div class="button-group">
        <button
          class="btn-primary"
          @click="${this._sendNotification}"
          ?disabled="${this._selectedDevices.length === 0 ||
          !this._notificationMessage.trim()}"
        >
          Send to ${this._selectedDevices.length} Device(s)
        </button>
      </div>
    `;
  }

  _renderDevicesTab() {
    return html`
      ${this._devices.length === 0
        ? html`<div class="no-devices">
            No notify devices found in your Home Assistant instance
          </div>`
        : html`
            <div class="devices-list">
              ${this._devices.map(
                (device) => html`
                  <div class="device-item">
                    <span class="device-name">${device}</span>
                  </div>
                `,
              )}
            </div>
          `}
    `;
  }
}

customElements.define("alert-center-panel", AlertCenterPanel);

// Export for Home Assistant
window.customPanelJS = window.customPanelJS || {};
window.customPanelJS["alert-center"] = AlertCenterPanel;
