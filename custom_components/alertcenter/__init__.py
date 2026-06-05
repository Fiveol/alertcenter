"""Alert Center integration for Home Assistant."""

import json
import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN, NAME

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

_LOGGER = logging.getLogger(__name__)

PLATFORMS = [Platform.SENSOR]


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up Alert Center integration once per HA instance."""
    static_dir = Path(__file__).parent / "www"
    card_path = "/alertcenter/alert-center-card.js"
    js_file = static_dir / "alert-center-card.js"

    if not js_file.is_file():
        _LOGGER.error("Card JS file not found at %s", js_file)

    manifest_path = Path(__file__).parent / "manifest.json"
    raw = await hass.async_add_executor_job(manifest_path.read_text)
    version = json.loads(raw).get("version", "0")

    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                url_path=card_path,
                path=str(js_file),
                cache_headers=False,
            )
        ]
    )
    add_extra_js_url(hass, f"{card_path}?v={version}")
    _LOGGER.info("Registered Alert Center card resource at %s", card_path)

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Alert Center from a config entry."""
    _LOGGER.debug("Setting up Alert Center integration")

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {}

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.debug("Unloading Alert Center integration")

    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok
