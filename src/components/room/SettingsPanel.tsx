import { PanelShell } from '@/components/room/PanelShell';
import { DeviceSelector } from '@/components/preview/DeviceSelector';
import { Switch } from '@/components/ui/Switch';
import { APP_NAME, APP_VERSION } from '@/lib/constants';
import type { ActiveDeviceIds, DeviceKind, DeviceLists } from '@/types';

interface SettingsPanelProps {
  devices: DeviceLists;
  activeIds: ActiveDeviceIds;
  speakerSupported: boolean;
  hasStream: boolean;
  darkMode: boolean;
  reducedMotion: boolean;
  onDeviceChange: (kind: DeviceKind, id: string) => void;
  onDarkModeChange: (value: boolean) => void;
  onReducedMotionChange: (value: boolean) => void;
  onClose: () => void;
}

export function SettingsPanel(props: SettingsPanelProps) {
  return (
    <PanelShell title="Pengaturan" onClose={props.onClose}>
      <div className="space-y-6 p-4">
        <section aria-labelledby="pengaturan-perangkat">
          <h3 id="pengaturan-perangkat" className="mb-3 text-base font-semibold text-ink">
            Perangkat
          </h3>
          <DeviceSelector
            idPrefix="pengaturan"
            devices={props.devices}
            activeIds={props.activeIds}
            onChange={props.onDeviceChange}
            speakerSupported={props.speakerSupported}
            disabled={!props.hasStream}
          />
          {!props.hasStream && (
            <p className="mt-2 text-sm text-muted">Pilihan perangkat aktif setelah kamera/mikrofon diizinkan.</p>
          )}
        </section>

        <section aria-labelledby="pengaturan-tampilan">
          <h3 id="pengaturan-tampilan" className="mb-1 text-base font-semibold text-ink">
            Tampilan
          </h3>
          <Switch label="Mode gelap" checked={props.darkMode} onChange={props.onDarkModeChange} />
          <Switch
            label="Kurangi animasi"
            description="Meminimalkan gerakan di antarmuka."
            checked={props.reducedMotion}
            onChange={props.onReducedMotionChange}
          />
        </section>

        <p className="text-sm text-muted">
          {APP_NAME} versi {APP_VERSION} (prototipe)
        </p>
      </div>
    </PanelShell>
  );
}
