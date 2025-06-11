import React from 'react';

import { IntegrationCard } from './integration-card';
import { INTEGRATION_METADATA } from './integration-metadata';
import { INTEGRATION_UI_STATUS } from './integration-status';

export default {
  title: 'Integrations/IntegrationCard',
  component: IntegrationCard,
  parameters: { layout: 'centered' }
};

const meta = INTEGRATION_METADATA.LINKEDIN;
const onClick = () => alert('Clicked!');

export const Connected = () => (
  <IntegrationCard
    name={meta.name}
    description={meta.description}
    icon={meta.icon}
    status={INTEGRATION_UI_STATUS.CONNECTED}
    onClick={onClick}
  />
);

export const NeedsReconnection = () => (
  <IntegrationCard
    name={meta.name}
    description={meta.description}
    icon={meta.icon}
    status={INTEGRATION_UI_STATUS.NEEDS_RECONNECTION}
    onClick={onClick}
  />
);

export const Processing = () => (
  <IntegrationCard
    name={meta.name}
    description={meta.description}
    icon={meta.icon}
    status={INTEGRATION_UI_STATUS.PROCESSING}
    onClick={onClick}
  />
);

export const Unconnected = () => (
  <IntegrationCard
    name={meta.name}
    description={meta.description}
    icon={meta.icon}
    status={INTEGRATION_UI_STATUS.UNCONNECTED}
    onClick={onClick}
  />
);
