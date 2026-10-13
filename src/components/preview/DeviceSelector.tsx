import type { ReactNode } from 'react';
import { Camera, Mic, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ActiveDeviceIds, DeviceKind, DeviceLists, MediaDeviceOption } from '@/types';

export type MicTestState = 'idle' | 'testing' | 'ok' | 'silent';

interface MicTestProps {
  state: MicTestState;
  disabled: boolean;
  onRun: () => void;
}

interface DeviceSelectorProps {
  idPrefix: string;
  devices: DeviceLists;
  activeIds: ActiveDeviceIds;
  onChange: (kind: DeviceKind, deviceId: string) => void;
  speakerSupported: boolean;
  disabled?: boolean;
  micTest?: MicTestProps;
}

interface SelectFieldProps {
  id: string;
  label: string;
  icon: ReactNode;
  value: string;
  options: MediaDeviceOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
}

function SelectField({ id, label, icon, value, options, disabled, onChange }: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-2 text-sm font-medium text-ink">
        <span aria-hidden="true" className="text-muted">
          {icon}
        </span>
        {label}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled || options.length === 0}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[48px] w-full rounded-xl border border-line bg-surface px-3 text-base text-ink focus:border-brand-500 disabled:opacity-60"
      >
        {options.length === 0 ? (
          <option value="">Tidak ada perangkat</option>
        ) : (
          options.map((option, index) => (
            <option key={`${option.deviceId}-${index}`} value={option.deviceId}>
              {option.label}
            </option>
          ))
        )}
      </select>
    </div>
  );
}

const TEST_MESSAGES: Record<MicTestState, string> = {
  idle: '',
  testing: 'Mengetes… ucapkan sesuatu selama 3 detik.',
  ok: 'Suara terdeteksi. Mikrofon berfungsi.',
  silent: 'Tidak ada suara terdeteksi. Coba bicara lebih keras atau ganti mikrofon.',
};

export function DeviceSelector({
  idPrefix,
  devices,
  activeIds,
  onChange,
  speakerSupported,
  disabled,
  micTest,
}: DeviceSelectorProps) {
  const cameraValue = activeIds.cameraId ?? devices.cameras[0]?.deviceId ?? '';
  const micValue = activeIds.micId ?? devices.microphones[0]?.deviceId ?? '';
  const speakerValue = activeIds.speakerId ?? devices.speakers[0]?.deviceId ?? '';

  return (
    <div className="space-y-4">
      <SelectField
        id={`${idPrefix}-kamera`}
        label="Kamera"
        icon={<Camera className="h-4 w-4" />}
        value={cameraValue}
        options={devices.cameras}
        disabled={disabled}
        onChange={(id) => onChange('camera', id)}
      />
      <SelectField
        id={`${idPrefix}-mikrofon`}
        label="Mikrofon"
        icon={<Mic className="h-4 w-4" />}
        value={micValue}
        options={devices.microphones}
        disabled={disabled}
        onChange={(id) => onChange('microphone', id)}
      />
      {speakerSupported && devices.speakers.length > 0 && (
        <SelectField
          id={`${idPrefix}-speaker`}
          label="Speaker"
          icon={<Volume2 className="h-4 w-4" />}
          value={speakerValue}
          options={devices.speakers}
          disabled={disabled}
          onChange={(id) => onChange('speaker', id)}
        />
      )}
      {micTest && (
        <div>
          <Button variant="secondary" fullWidth disabled={micTest.disabled || micTest.state === 'testing'} onClick={micTest.onRun}>
            {micTest.state === 'testing' ? 'Mengetes…' : 'Tes mikrofon'}
          </Button>
          <p role="status" className="mt-2 min-h-[20px] text-sm text-muted">
            {TEST_MESSAGES[micTest.state]}
          </p>
        </div>
      )}
    </div>
  );
}
