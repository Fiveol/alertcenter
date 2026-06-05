"""Sensor platform for Alert Center integration."""

import logging

from homeassistant.components.sensor import SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfInformation
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, NAME

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up sensor platform."""
    _LOGGER.debug("Setting up sensor platform for Alert Center")

    async_add_entities(
        [
            AlertCenterAlertsSensor(
                hass=hass,
                config_entry=config_entry,
            ),
        ]
    )


class AlertCenterAlertsSensor(SensorEntity):
    """Representation of an Alert Center Alerts sensor."""

    _attr_name = "Alerts"
    _attr_unique_id = f"{DOMAIN}_alerts"
    _attr_native_value = 0
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        """Initialize the sensor."""
        self.hass = hass
        self.config_entry = config_entry
        self._attr_device_info = {
            "identifiers": {(DOMAIN, config_entry.entry_id)},
            "name": NAME,
            "manufacturer": "Alert Center",
            "model": "Alert Center",
        }

    @property
    def native_value(self) -> int:
        """Return the state of the sensor."""
        return 0
