import React from 'react';

import { IntegrationCard } from './integration-card';
import { INTEGRATION_METADATA } from './integration-metadata';
import { integrationUIStatuses } from './integration-status';

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
    status={integrationUIStatuses.CONNECTED}
    onClick={onClick}
  />
);

export const NeedsReconnection = () => (
  <IntegrationCard
    name={meta.name}
    description={meta.description}
    icon={meta.icon}
    status={integrationUIStatuses.NEEDS_RECONNECTION}
    onClick={onClick}
  />
);

export const Processing = () => (
  <IntegrationCard
    name={meta.name}
    description={meta.description}
    icon={meta.icon}
    status={integrationUIStatuses.PROCESSING}
    onClick={onClick}
  />
);

export const Unconnected = () => (
  <IntegrationCard
    name={meta.name}
    description={meta.description}
    icon={meta.icon}
    status={integrationUIStatuses.UNCONNECTED}
    onClick={onClick}
  />
);
