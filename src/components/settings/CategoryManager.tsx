import React, { useState, useMemo } from 'react';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { Category, CategoryType } from 'src/types/index';
import { categorySchema, CategoryFormData } from 'src/schemas/categorySchema';
import { CATEGORY_COLOR_MAP, CATEGORY_ICON_MAP, DEFAULT_CATEGORIES } from 'src/lib/constants';
import { cn, uuid } from 'src/lib/utils';
import Button from 'src/components/ui/Button';
import Input from 'src/components/ui/Input';
import Select from 'src/components/ui/Select';
import Badge from 'src/components/ui/Badge';
import Card from 'src/components/ui/Card';
import Dialog from 'src/components/ui/Dialog';
import DropdownMenu from 'src/components/ui/DropdownMenu';
import Tooltip from 'src/components/ui/Tooltip';
import Toast from 'src/components/ui/Toast';
import ConfirmDialog from 'src/components/ui/ConfirmDialog';
import Skeleton from 'src/components/ui/Skeleton';
import { formatDate } from 'src/lib/formatters';
import { Icon } from 'lucide-react';
import { z } from 'zod';

/************************************************************
 * CategoryManager.tsx
 * Vault - Category management section for settings.
 * - Full CRUD for categories (add, edit, delete).
 * - Icon and color picker for custom categories.
 * - Protects default/preset categories from deletion/editing.
 * - Accessible, responsive, and error-handling.
 ************************************************************/

/**
 * IconPicker - Dropdown for selecting category icon.
 */
const ICON_OPTIONS = Object.values(CATEGORY_ICON_MAP).concat([
  'Book',
  'Briefcase',
  'Car',
  'Coffee',
  'Gift',
  'Home',
  'Music',
  'ShoppingBag',
  'Utensils',
  'Wifi',
  'Zap',
]);

function IconPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (icon: string) => void;
}) {
  return (
    <DropdownMenu
      trigger={
        <Button variant="ghost" className="w-10 h-10 flex items-center justify-center">
          {value ? (
            <Icon name={value} size={24} />
          ) : (
            <span className="text-neutral-400">?</span>
          )}
        </Button>
      }
      items={ICON_OPTIONS.map((icon) => ({
        key: icon,
        label: (
          <span className="flex items-center gap-2">
            <Icon name={icon} size={20} />
            <span>{icon}</span>
          </span>
        ),
        onClick: () => onChange(icon),
      }))}
    />
  );
}

/**
 * ColorPicker - Dropdown for selecting category color.
 */
const COLOR_OPTIONS = Object.entries(CATEGORY_COLOR_MAP);

function ColorPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (color: string) => void;
}) {
  return (
    <DropdownMenu
      trigger={
        <Button variant="ghost" className="w-10 h-10 flex items-center justify-center">
          <span
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: value || '#64748B' }}
          />
        </Button>
      }
      items={COLOR_OPTIONS.map(([key, color]) => ({
        key,
        label: (
          <span className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: color }}
            />
            <span>{key}</span>
          </span>
        ),
        onClick: () => onChange(color),
      }))}
    />
  );
}

/**
 * CategoryFormDialog - Dialog for adding/editing a category.
 */
function CategoryFormDialog({
  open,
  initial,
  onClose,
  onSubmit,
  presetProtected,
}: {
  open: boolean;
  initial?: Partial<CategoryFormData>;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
  presetProtected?: boolean;
}) {
  const [form, setForm] = useState<CategoryFormData>(() => ({
    id: initial?.id,
    name: initial?.name || '',
    type: initial?.type || 'expense',
    color: initial?.color || COLOR_OPTIONS[0][1],
    icon: initial?.icon || ICON_OPTIONS[0],
    isPreset: initial?.isPreset || false,
    createdAt: initial?.createdAt,
    updatedAt: initial?.updatedAt,
  }));
  const [error, setError] = useState<string>('');

  // Handle input changes
  function handleChange<K extends keyof CategoryFormData>(key: K, value: CategoryFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Validate and submit
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const parsed = categorySchema.parse(form);
      onSubmit(parsed);
      setError('');
      onClose();
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || 'Invalid input.');
      } else {
        setError('Unknown error.');
      }
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={form.id ? 'Edit Category' : 'Add Category'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          disabled={presetProtected}
          required
          maxLength={32}
        />
        <Select
          label="Type"
          value={form.type}
          onChange={(val) => handleChange('type', val as CategoryType)}
          options={[
            { value: 'expense', label: 'Expense' },
            { value: 'income', label: 'Income' },
            { value: 'savings', label: 'Savings' },
          ]}
          disabled={presetProtected}
        />
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Icon</label>
          <IconPicker
            value={form.icon}
            onChange={(icon) => handleChange('icon', icon)}
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Color</label>
          <ColorPicker
            value={form.color}
            onChange={(color) => handleChange('color', color)}
          />
        </div>
        {error && <div className="text-error text-sm">{error}</div>}
        <div className="flex justify-end gap-2 mt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="brand" disabled={presetProtected}>
            {form.id ? 'Save' : 'Add'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

/**
 * CategoryManager - Main category CRUD manager.
 */
const CategoryManager: React.FC = () => {
  // Store hooks
  const categories = useFinanceStore((state) => state.categories);
  const addCategory = useFinanceStore((state) => state.addCategory);
  const updateCategory = useFinanceStore((state) => state.updateCategory);
  const deleteCategory = useFinanceStore((state) => state.deleteCategory);

  const { toast, confirmDialog } = useUIStore();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  // Loading state (for optimistic UI)
  const [loading, setLoading] = useState(false);

  // Memo: preset category IDs
  const presetIds = useMemo(
    () => new Set(DEFAULT_CATEGORIES.map((cat) => cat.id)),
    []
  );

  // Add/Edit handlers
  function handleAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function handleEdit(cat: Category) {
    setEditing(cat);
    setDialogOpen(true);
  }

  function handleSubmit(data: CategoryFormData) {
    setLoading(true);
    try {
      if (data.id && categories.find((c) => c.id === data.id)) {
        updateCategory(data.id, {
          ...data,
          updatedAt: new Date().toISOString(),
        });
        toast.show('success', 'Category updated.');
      } else {
        addCategory({
          ...data,
          id: uuid(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        toast.show('success', 'Category added.');
      }
    } catch (err) {
      toast.show('error', 'Failed to save category.');
    } finally {
      setLoading(false);
    }
  }

  // Delete handler
  function handleDelete(cat: Category) {
    if (presetIds.has(cat.id) || cat.isPreset) {
      toast.show('warning', 'Default categories cannot be deleted.');
      return;
    }
    confirmDialog.show({
      title: 'Delete Category',
      description: `Are you sure you want to delete "${cat.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        setLoading(true);
        try {
          deleteCategory(cat.id);
          toast.show('success', 'Category deleted.');
        } catch {
          toast.show('error', 'Failed to delete category.');
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {},
    });
  }

  // Render
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading">Manage Categories</h2>
        <Button variant="brand" onClick={handleAdd}>
          Add Category
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.length === 0 && <Skeleton className="h-16 w-full" />}
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={cn(
              'flex items-center gap-4 p-3 rounded-lg border bg-glass',
              cat.isPreset ? 'opacity-80 pointer-events-none' : ''
            )}
          >
            <Badge
              color={cat.color}
              icon={cat.icon}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center"
            />
            <div className="flex-1">
              <div className="font-semibold">{cat.name}</div>
              <div className="text-xs text-neutral-500">
                {cat.type.charAt(0).toUpperCase() + cat.type.slice(1)}
                {cat.isPreset && (
                  <span className="ml-2 text-neutral-400">(Default)</span>
                )}
              </div>
              <div className="text-xs text-neutral-400">
                Created: {formatDate(cat.createdAt, 'MMM d, yyyy')}
              </div>
            </div>
            <div className="flex gap-2">
              <Tooltip content={cat.isPreset ? 'Default category (cannot edit)' : 'Edit'}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(cat)}
                  disabled={cat.isPreset || presetIds.has(cat.id)}
                  aria-label="Edit category"
                >
                  <Icon name="Edit" size={18} />
                </Button>
              </Tooltip>
              <Tooltip content={cat.isPreset ? 'Default category (cannot delete)' : 'Delete'}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(cat)}
                  disabled={cat.isPreset || presetIds.has(cat.id)}
                  aria-label="Delete category"
                >
                  <Icon name="Trash" size={18} />
                </Button>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
      {/* Add/Edit Dialog */}
      <CategoryFormDialog
        open={dialogOpen}
        initial={editing || undefined}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        presetProtected={editing?.isPreset || presetIds.has(editing?.id || '')}
      />
      {/* Toast and ConfirmDialog are global, but can be rendered here for context */}
      <Toast />
      <ConfirmDialog />
    </Card>
  );
};

export default CategoryManager;