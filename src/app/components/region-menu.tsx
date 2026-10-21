import { CheckIcon, ServerIcon } from 'lucide-react';
import { RegionMenuClient } from './region-menu.client';
import type { Target } from '@/lib/targets';

/** Static parts (icons) render on the server; the client menu only wires state. */
export function RegionMenu({ targets }: { targets: readonly Target[] }) {
  return (
    <RegionMenuClient
      targets={targets}
      triggerIconSlot={<ServerIcon size={18} strokeWidth={1.8} aria-hidden />}
      checkSlot={<CheckIcon size={16} strokeWidth={2} aria-hidden />}
    />
  );
}
