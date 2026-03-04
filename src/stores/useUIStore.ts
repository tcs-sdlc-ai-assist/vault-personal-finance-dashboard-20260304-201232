/************************************************************
 * src/stores/useUIStore.ts
 * Vault - Zustand store for ephemeral UI state.
 * - Handles sidebar, dialogs, filters, sorting, search, and transient UI state.
 * - Uses devtools middleware only (no persistence).
 * - Designed for fast, responsive UI updates.
 ************************************************************/

import { create } from 'zustand';
import { devtools } from 'zustand-middleware';
import type {
  ToastType,
  ConfirmDialogState,
  DateRange,
  DateRangePreset,
} from 'src/types/index';

// ---------- UI Store State ----------

interface UIState {
  // Sidebar open/closed (for mobile/tablet)
  sidebarOpen: boolean;

  // Modal/dialog state (generic, for custom modals)
  modalOpen: boolean;
  modalId?: string; // Optional identifier for modal type

  // Toast notification state
  toast: {
    open: boolean;
    type: ToastType;
    message: string;
    close: () => void;
    show: (type: ToastType, message: string) => void;
  };

  // Confirm dialog state (for destructive actions)
  confirmDialog: ConfirmDialogState & {
    open: boolean;
    show: (
      params: Omit<ConfirmDialogState, 'open'> & {
        onConfirm?: () => void;
        onCancel?: () => void;
      }
    ) => void;
    close: () => void;
  };

  // Filters (search, category, date range, sort)
  searchQuery: string;
  filterCategoryId: string | null;
  filterDateRange: DateRange;
  filterDatePreset: DateRangePreset;
  sortField: string;
  sortDirection: 'asc' | 'desc';

  // UI actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  setModalOpen: (open: boolean, modalId?: string) => void;

  setSearchQuery: (query: string) => void;
  setFilterCategoryId: (categoryId: string | null) => void;
  setFilterDateRange: (range: DateRange) => void;
  setFilterDatePreset: (preset: DateRangePreset) => void;
  setSortField: (field: string) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;

  resetFilters: () => void;
}

// ---------- Initial State ----------

const initialDateRange: DateRange = {
  preset: 'thisMonth',
  startDate: '', // Set in hook or on mount
  endDate: '',   // Set in hook or on mount
};

const initialState: UIState = {
  sidebarOpen: false,
  modalOpen: false,
  modalId: undefined,

  toast: {
    open: false,
    type: 'info',
    message: '',
    close: () => {},
    show: () => {},
  },

  confirmDialog: {
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    onConfirm: undefined,
    onCancel: undefined,
    show: () => {},
    close: () => {},
  },

  searchQuery: '',
  filterCategoryId: null,
  filterDateRange: initialDateRange,
  filterDatePreset: 'thisMonth',
  sortField: 'date',
  sortDirection: 'desc',

  setSidebarOpen: () => {},
  toggleSidebar: () => {},
  setModalOpen: () => {},
  setSearchQuery: () => {},
  setFilterCategoryId: () => {},
  setFilterDateRange: () => {},
  setFilterDatePreset: () => {},
  setSortField: () => {},
  setSortDirection: () => {},
  resetFilters: () => {},
};

// ---------- Store Implementation ----------

export const useUIStore = create<UIState>()(
  devtools((set, get) => {
    // Toast actions
    const toastClose = () => set((state) => {
      state.toast.open = false;
      state.toast.message = '';
      state.toast.type = 'info';
    });

    const toastShow = (type: ToastType, message: string) => set((state) => {
      state.toast.open = true;
      state.toast.type = type;
      state.toast.message = message;
    });

    // Confirm dialog actions
    const confirmDialogShow = (params: Omit<ConfirmDialogState, 'open'> & {
      onConfirm?: () => void;
      onCancel?: () => void;
    }) => set((state) => {
      state.confirmDialog.open = true;
      state.confirmDialog.title = params.title || '';
      state.confirmDialog.description = params.description || '';
      state.confirmDialog.confirmLabel = params.confirmLabel || 'Confirm';
      state.confirmDialog.cancelLabel = params.cancelLabel || 'Cancel';
      state.confirmDialog.onConfirm = params.onConfirm;
      state.confirmDialog.onCancel = params.onCancel;
    });

    const confirmDialogClose = () => set((state) => {
      state.confirmDialog.open = false;
      state.confirmDialog.title = '';
      state.confirmDialog.description = '';
      state.confirmDialog.confirmLabel = 'Confirm';
      state.confirmDialog.cancelLabel = 'Cancel';
      state.confirmDialog.onConfirm = undefined;
      state.confirmDialog.onCancel = undefined;
    });

    return {
      ...initialState,

      // Sidebar actions
      setSidebarOpen: (open: boolean) => set((state) => {
        state.sidebarOpen = open;
      }),
      toggleSidebar: () => set((state) => {
        state.sidebarOpen = !state.sidebarOpen;
      }),

      // Modal actions
      setModalOpen: (open: boolean, modalId?: string) => set((state) => {
        state.modalOpen = open;
        state.modalId = open ? modalId : undefined;
      }),

      // Toast actions (override with bound functions)
      toast: {
        open: false,
        type: 'info',
        message: '',
        close: toastClose,
        show: toastShow,
      },

      // Confirm dialog actions (override with bound functions)
      confirmDialog: {
        open: false,
        title: '',
        description: '',
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        onConfirm: undefined,
        onCancel: undefined,
        show: confirmDialogShow,
        close: confirmDialogClose,
      },

      // Filter actions
      setSearchQuery: (query: string) => set((state) => {
        state.searchQuery = query;
      }),
      setFilterCategoryId: (categoryId: string | null) => set((state) => {
        state.filterCategoryId = categoryId;
      }),
      setFilterDateRange: (range: DateRange) => set((state) => {
        state.filterDateRange = range;
      }),
      setFilterDatePreset: (preset: DateRangePreset) => set((state) => {
        state.filterDatePreset = preset;
      }),
      setSortField: (field: string) => set((state) => {
        state.sortField = field;
      }),
      setSortDirection: (direction: 'asc' | 'desc') => set((state) => {
        state.sortDirection = direction;
      }),

      // Reset filters to initial state
      resetFilters: () => set((state) => {
        state.searchQuery = '';
        state.filterCategoryId = null;
        state.filterDateRange = initialDateRange;
        state.filterDatePreset = 'thisMonth';
        state.sortField = 'date';
        state.sortDirection = 'desc';
      }),
    };
  }, { name: 'Vault UI Store' })
);