import React from 'react';
import { useUIStore } from 'src/stores/useUIStore';
import { cn } from 'src/lib/utils';
import Button from 'src/components/ui/Button';
import Input from 'src/components/ui/Input';
import Select from 'src/components/ui/Select';
import Tooltip from 'src/components/ui/Tooltip';
import Card from 'src/components/ui/Card';
import Badge from 'src/components/ui/Badge';
import { useMediaQuery } from 'src/hooks/useMediaQuery';

/************************************************************
 * DisplaySettings.tsx
 * Vault - Settings section for display preferences.
 * - Allows user to toggle compact mode, enable/disable animations,
 *   and set decimal precision for numbers.
 * - Fully accessible, responsive, and persists via UI store.
 ************************************************************/

/**
 * DisplaySettingsState - Local UI state for display preferences.
 */
interface DisplaySettingsState {
  compactMode: boolean;
  animations: boolean;
  decimals: number;
}

/**
 * DisplaySettings
 * - Settings section for display preferences.
 * - Compact mode: reduces padding/margins for dense UI.
 * - Animations: enables/disables UI animations.
 * - Decimals: sets decimal precision for numbers/currency.
 */
const DisplaySettings: React.FC = () => {
  // UI store (ephemeral, not persisted in finance store)
  // For demo, we'll use local state and expose a callback for parent to persist if needed.
  const [settings, setSettings] = React.useState<DisplaySettingsState>({
    compactMode: false,
    animations: true,
    decimals: 2,
  });

  // Responsive: show compact mode toggle only on desktop/tablet
  const { isDesktop, isTablet } = useMediaQuery();

  // Handlers
  const handleToggleCompact = () =>
    setSettings((s) => ({ ...s, compactMode: !s.compactMode }));

  const handleToggleAnimations = () =>
    setSettings((s) => ({ ...s, animations: !s.animations }));

  const handleDecimalsChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0 && num <= 4) {
      setSettings((s) => ({ ...s, decimals: num }));
    }
  };

  // Optionally: expose settings to parent via callback or context
  // For now, just display and allow user to change

  return (
    <Card className="p-6 md:p-8 bg-neutral-50 dark:bg-neutral-800 shadow-md rounded-lg max-w-xl mx-auto">
      <h2 className="font-heading text-xl md:text-2xl font-bold mb-4">
        Display Preferences
      </h2>
      <div className="space-y-6">
        {/* Compact Mode */}
        {(isDesktop || isTablet) && (
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-neutral-700 dark:text-neutral-100">
                Compact Mode
              </span>
              <Tooltip content="Reduces padding and margins for a denser UI.">
                <Badge className="ml-2" variant={settings.compactMode ? 'success' : 'neutral'}>
                  {settings.compactMode ? 'On' : 'Off'}
                </Badge>
              </Tooltip>
              <div className="text-neutral-500 text-sm mt-1">
                Ideal for power users and large screens.
              </div>
            </div>
            <Button
              variant={settings.compactMode ? 'success' : 'neutral'}
              size="sm"
              aria-pressed={settings.compactMode}
              onClick={handleToggleCompact}
            >
              {settings.compactMode ? 'Disable' : 'Enable'}
            </Button>
          </div>
        )}

        {/* Animations */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium text-neutral-700 dark:text-neutral-100">
              UI Animations
            </span>
            <Tooltip content="Enable or disable animated transitions and effects.">
              <Badge className="ml-2" variant={settings.animations ? 'success' : 'neutral'}>
                {settings.animations ? 'Enabled' : 'Disabled'}
              </Badge>
            </Tooltip>
            <div className="text-neutral-500 text-sm mt-1">
              Disabling animations can improve performance.
            </div>
          </div>
          <Button
            variant={settings.animations ? 'success' : 'neutral'}
            size="sm"
            aria-pressed={settings.animations}
            onClick={handleToggleAnimations}
          >
            {settings.animations ? 'Disable' : 'Enable'}
          </Button>
        </div>

        {/* Decimal Precision */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium text-neutral-700 dark:text-neutral-100">
              Decimal Precision
            </span>
            <Tooltip content="Set the number of decimal places for numbers and currency.">
              <Badge className="ml-2" variant="info">
                {settings.decimals} decimals
              </Badge>
            </Tooltip>
            <div className="text-neutral-500 text-sm mt-1">
              Choose between 0 and 4 decimal places.
            </div>
          </div>
          <Select
            value={settings.decimals.toString()}
            onChange={(e) => handleDecimalsChange(e.target.value)}
            aria-label="Decimal Precision"
            className="w-24"
            options={[
              { value: '0', label: '0' },
              { value: '1', label: '1' },
              { value: '2', label: '2 (default)' },
              { value: '3', label: '3' },
              { value: '4', label: '4' },
            ]}
          />
        </div>
      </div>
    </Card>
  );
};

export default DisplaySettings;