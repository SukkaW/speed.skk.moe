import { useChoice } from '@/context/speedtest';
import { useGeo } from './use-geo';
import type { Target } from '@/lib/targets';

/** Index of the first target listing the visitor's country, if any. */
function detect(targets: readonly Target[], country: string): number | undefined {
  for (let i = 0, len = targets.length; i < len; i++) {
    if (targets[i].countries.includes(country)) return i;
  }
  return undefined;
}

export function useTargetIndex(targets: readonly Target[]): number {
  const choice = useChoice();
  const { data: geo } = useGeo();
  // A manual pick always wins; otherwise the lookup decides, the first target until it has answered.
  return choice ?? (geo === undefined ? undefined : detect(targets, geo.country_code)) ?? 0;
}

export function useTarget(targets: readonly Target[]): Target {
  return targets[useTargetIndex(targets)];
}
