import {
  DrillChannelGrowthPanel,
  DrillDriversPassCombo,
  DrillGrowthRetentionPanel,
  DrillGrowthTransactionPanel,
  DrillStageGrowthTable,
} from './fastTagDrillViz';

const P = 'gd';

export function GrowthDriversPassChart({ drivers }) {
  return <DrillDriversPassCombo prefix={P} drivers={drivers} />;
}

export function GrowthLifecycleChart({ stages }) {
  return <DrillStageGrowthTable prefix={P} stages={stages} />;
}

export function GrowthChannelMixChart({ channels }) {
  return <DrillChannelGrowthPanel prefix={P} channels={channels} />;
}

export function GrowthTransactionChart({ monthly }) {
  return <DrillGrowthTransactionPanel prefix={P} monthly={monthly} />;
}

export function GrowthRetentionChart({ monthly }) {
  return <DrillGrowthRetentionPanel prefix={P} monthly={monthly} />;
}
