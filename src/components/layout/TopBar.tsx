import React from 'react';
import { Menu, Sun, Moon, Download, Upload } from 'lucide-react';
import { cn } from 'src/lib/utils';
import { useUIStore } from 'src/stores/useUIStore';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import Button from 'src/components/ui/Button';
import Tooltip from 'src/components/ui/Tooltip';
import { downloadFile, copyToClipboard } from 'src/lib/utils';
import { formatDateTime } from 'src/lib/formatters';

/************************************************************
 * TopBar.tsx
 * Vault - Top bar navigation for mobile/tablet layouts.
 * - Contains menu toggle, app title, and global actions (theme, export, import).
 * - Responsive, accessible, and animated.
 ************************************************************/

/**
 * TopBarProps - Optional props for customization.
 */
interface TopBarProps {
  className?: string;
  title?: string;
}

/**
 * TopBar - Responsive top bar for mobile/tablet.
 * - Shows menu button (sidebar toggle), app title, and actions.
 * - Actions: theme toggle, export, import.
 */
const TopBar: React.FC<TopBarProps> = ({
  className,
  title = 'Vault',
}) => {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { exportData, importData } = useFinanceStore();

  // Theme toggle (dark/light)
  const [isDark, setIsDark] = React.useState(() =>
    document.documentElement.classList.contains('dark')
  );

  const handleThemeToggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  // Export data as JSON file
  const handleExport = async () => {
    try {
      const data = exportData();
      const filename = `vault-backup-${formatDateTime(new Date(), 'yyyy-MM-dd_HH-mm')}.json`;
      downloadFile(filename, JSON.stringify(data, null, 2), 'application/json');
      await copyToClipboard(JSON.stringify(data));
      useUIStore.getState().toast.show('success', 'Data exported and copied to clipboard!');
    } catch (err) {
      useUIStore.getState().toast.show('error', 'Export failed.');
    }
  };

  // Import data from JSON file
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      importData(data);
      useUIStore.getState().toast.show('success', 'Data imported successfully!');
    } catch (err) {
      useUIStore.getState().toast.show('error', 'Import failed. Invalid file.');
    }
    // Reset input value for future imports
    e.target.value = '';
  };

  // Accessibility: aria-labels and keyboard support
  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-dropdown bg-glass backdrop-blur-md shadow-md flex items-center justify-between px-4 py-2 md:hidden',
        className
      )}
      role="banner"
      aria-label="Top navigation bar"
    >
      {/* Menu button (sidebar toggle) */}
      <Button
        variant="ghost"
        size="icon"
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        onClick={toggleSidebar}
        className="mr-2"
      >
        <Menu className="w-6 h-6" aria-hidden="true" />
      </Button>

      {/* App title */}
      <span
        className="font-heading text-lg font-bold tracking-tight text-brand"
        aria-label="App title"
      >
        {title}
      </span>

      {/* Actions: theme, export, import */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Tooltip content={isDark ? 'Light mode' : 'Dark mode'}>
          <Button
            variant="ghost"
            size="icon"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={handleThemeToggle}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-warning" aria-hidden="true" />
            ) : (
              <Moon className="w-5 h-5 text-brand" aria-hidden="true" />
            )}
          </Button>
        </Tooltip>

        {/* Export button */}
        <Tooltip content="Export data">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Export data"
            onClick={handleExport}
          >
            <Download className="w-5 h-5 text-success" aria-hidden="true" />
          </Button>
        </Tooltip>

        {/* Import button (hidden file input) */}
        <Tooltip content="Import data">
          <label htmlFor="vault-import-file" className="cursor-pointer">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Import data"
              as="span"
            >
              <Upload className="w-5 h-5 text-info" aria-hidden="true" />
            </Button>
            <input
              id="vault-import-file"
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImport}
              aria-label="Import backup file"
            />
          </label>
        </Tooltip>
      </div>
    </header>
  );
};

export default TopBar;