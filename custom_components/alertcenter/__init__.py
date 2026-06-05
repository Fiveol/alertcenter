"""Alert Center integration for Home Assistant."""

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN, NAME
from .websocket_api import async_register_websocket_commands

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

_LOGGER = logging.getLogger(__name__)

PLATFORMS = [Platform.SENSOR]


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up Alert Center integration once per HA instance."""
    # Register websocket commands for the sidebar panel
    async_register_websocket_commands(hass)

    _LOGGER.info("Alert Center integration setup complete")
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Alert Center from a config entry."""
    _LOGGER.debug("Setting up Alert Center integration")

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {}

    # Register the alertcenter_notify service
    async def handle_notify_service(call):
        """Handle the alertcenter_notify service."""
        message = call.data.get("message", "Alert")
        title = call.data.get("title", NAME)
        devices = call.data.get("devices", [])

        if not devices:
            _LOGGER.warning("alertcenter_notify called without devices")
            return

        # Send to each device
        for device_id in devices:
            await hass.services.async_call(
                "notify",
                device_id.split(".")[-1] if "." in device_id else device_id,
                {"message": message, "title": title},
            )

    hass.services.async_register(
        DOMAIN,
        "notify",
        handle_notify_service,
        schema=cv.make_entity_service_schema(
            {
                cv.Required("message"): cv.string,
                cv.Optional("title"): cv.string,
                cv.Optional("devices"): [cv.string],
            }
        ),
    )

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.debug("Unloading Alert Center integration")

    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok
