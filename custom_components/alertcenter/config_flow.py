"""Config flow for Alert Center integration."""

import logging
from typing import Any, Dict

import voluptuous as vol
from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.data_entry_flow import FlowResult

from .const import DOMAIN, NAME

_LOGGER = logging.getLogger(__name__)


class AlertCenterConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Alert Center."""

    VERSION = 1

    async def async_step_user(
        self, user_input: Dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        if user_input is not None:
            await self.async_set_unique_id(DOMAIN)
            self._abort_if_unique_id_configured()

            return self.async_create_entry(title=NAME, data=user_input)

        data_schema = vol.Schema({})

        return self.async_show_form(step_id="user", data_schema=data_schema)
