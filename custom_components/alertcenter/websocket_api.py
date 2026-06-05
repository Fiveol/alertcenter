"""Websocket API for Alert Center sidebar panel."""

import logging
from typing import Any

from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


@callback
def async_register_websocket_commands(hass: HomeAssistant) -> None:
    """Register websocket commands for the Alert Center panel."""
    from homeassistant.components import websocket_api

    @websocket_api.websocket_command(
        {
            "type": "alertcenter/get_devices",
        }
    )
    @callback
    def get_notify_devices(
        hass: HomeAssistant, connection, msg: dict[str, Any]
    ) -> None:
        """Get all notify devices from the system."""
        notify_entities = []

        # Check Home Assistant's data for notify services
        try:
            # Get all entities from entity registry
            from homeassistant.helpers.entity_registry import async_get

            registry = async_get(hass)
            for entity in registry.entities.values():
                if entity.domain == "notify" and entity.entity_id:
                    notify_entities.append(entity.entity_id)
        except Exception as err:
            _LOGGER.debug("Error getting notify entities: %s", err)

        connection.send_json(
            {
                "type": "result",
                "id": msg["id"],
                "success": True,
                "result": list(set(notify_entities)),
            }
        )

    @websocket_api.websocket_command(
        {
            "type": "alertcenter/notify",
            "devices": [str],
            "message": str,
            "title": str,
        }
    )
    @callback
    def send_notification(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
        """Send a notification to selected devices."""
        devices = msg.get("devices", [])
        message = msg.get("message", "")
        title = msg.get("title", "Alert Center")

        if not devices or not message:
            connection.send_json(
                {
                    "type": "result",
                    "id": msg["id"],
                    "success": False,
                    "error": "Devices and message are required",
                }
            )
            return

        # Send notification to each device
        for device_id in devices:
            service_name = device_id.split(".")[-1] if "." in device_id else device_id
            hass.async_create_task(
                hass.services.async_call(
                    "notify",
                    service_name,
                    {"message": message, "title": title},
                )
            )

        connection.send_json(
            {
                "type": "result",
                "id": msg["id"],
                "success": True,
                "result": f"Notification sent to {len(devices)} device(s)",
            }
        )

    websocket_api.async_register_command(hass, get_notify_devices)
    websocket_api.async_register_command(hass, send_notification)
