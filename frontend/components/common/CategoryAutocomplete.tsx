'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { Autocomplete, TextField, createFilterOptions, SxProps, Theme } from '@mui/material';
import { productService } from '@/services/product.service';
import { adminService } from '@/services/supplier.service';
import { Category } from '@/types';

type CategoryOption = Category & { inputValue?: string };

const filter = createFilterOptions<CategoryOption>();

const defaultFieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '10px' } };

type CategoryAutocompleteBaseProps = {
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  textFieldSx?: SxProps<Theme>;
  fetchCategories?: () => Promise<Category[]>;
  extraCategories?: Category[];
  reloadToken?: string | number;
  /** Persist new category names to the platform immediately when added as chips */
  persistOnAdd?: boolean;
};

type SingleCategoryAutocompleteProps = CategoryAutocompleteBaseProps & {
  multiple?: false;
  categoryId: string;
  categoryName: string;
  onChange: (value: { categoryId: string; categoryName: string }) => void;
};

type MultipleCategoryAutocompleteProps = CategoryAutocompleteBaseProps & {
  multiple: true;
  value: string[];
  onChange: (names: string[]) => void;
};

export type CategoryAutocompleteProps = SingleCategoryAutocompleteProps | MultipleCategoryAutocompleteProps;

export type CategoryAutocompleteHandle = {
  getCommittedValues: () => string[];
};

function appendCreateOption(options: CategoryOption[], inputValue: string) {
  const filtered = [...options];
  const trimmed = inputValue.trim();
  const exists = options.some(
    (option) => option.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (trimmed !== '' && !exists) {
    filtered.push({
      _id: '__new__',
      name: `Create category "${trimmed}"`,
      slug: '',
      inputValue: trimmed,
    });
  }
  return filtered;
}

function getOptionLabel(option: CategoryOption | string) {
  if (typeof option === 'string') return option;
  if (option.inputValue) return `Create category "${option.inputValue}"`;
  return option.name;
}

function uniqueNames(names: string[]) {
  return names.filter(
    (name, index) => names.findIndex((n) => n.toLowerCase() === name.toLowerCase()) === index
  );
}

function mapSelectionToNames(items: Array<string | CategoryOption>) {
  return uniqueNames(
    items
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item.inputValue) return item.inputValue.trim();
        return item.name;
      })
      .filter(Boolean)
  );
}

const CategoryAutocomplete = forwardRef<CategoryAutocompleteHandle, CategoryAutocompleteProps>(
  function CategoryAutocomplete(props, ref) {
    const {
      label = 'Category',
      required,
      error,
      helperText,
      textFieldSx = defaultFieldSx,
      fetchCategories = () => productService.getCategories(),
      extraCategories = [],
      reloadToken,
      persistOnAdd = false,
    } = props;

    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [categoryInput, setCategoryInput] = useState('');
    const extraCategoryKey = extraCategories.map((c) => c._id).join(',');

    const loadCategories = useCallback(() => {
      setLoading(true);
      return fetchCategories()
        .then((data) => {
          const merged = [...(data || [])];
          extraCategories.forEach((cat) => {
            if (!merged.some((c) => c._id === cat._id)) merged.push(cat);
          });
          setCategories(merged);
          return merged;
        })
        .finally(() => setLoading(false));
    }, [fetchCategories, extraCategories]);

    useEffect(() => {
      loadCategories();
    }, [loadCategories, reloadToken]);

    const commitPendingInput = (current: string[]) => {
      const pending = categoryInput.trim();
      if (!pending) return current;
      if (current.some((name) => name.toLowerCase() === pending.toLowerCase())) return current;
      return [...current, pending];
    };

    const persistNewCategories = async (names: string[], previous: string[]) => {
      if (!persistOnAdd) return;
      const added = names.filter(
        (name) => !previous.some((prev) => prev.toLowerCase() === name.toLowerCase())
      );
      const existingNames = new Set(categories.map((cat) => cat.name.toLowerCase()));
      const toCreate = added.filter((name) => !existingNames.has(name.toLowerCase()));
      if (!toCreate.length) return;

      await Promise.all(toCreate.map((name) => adminService.createCategory(name)));
      await loadCategories();
    };

    useImperativeHandle(ref, () => ({
      getCommittedValues: () => {
        if (!props.multiple) {
          const pending = categoryInput.trim();
          if (props.categoryName.trim()) return [props.categoryName.trim()];
          if (pending) return [pending];
          const match = categories.find((cat) => cat._id === props.categoryId);
          return match ? [match.name] : [];
        }
        return commitPendingInput(props.value);
      },
    }));

    useEffect(() => {
      if (props.multiple) return;
      const { categoryId, categoryName } = props;
      if (categoryId) {
        const match = categories.find((c) => c._id === categoryId);
        setCategoryInput(match?.name || '');
        return;
      }
      setCategoryInput(categoryName);
    }, [props.multiple, props.categoryId, props.categoryName, categories]);

    if (props.multiple) {
      const selectedNames = props.value;

      const applySelection = async (names: string[]) => {
        const previous = props.value;
        props.onChange(names);
        try {
          await persistNewCategories(names, previous);
        } catch {
          // Parent submit will still attempt linkCategoryNames as fallback.
        }
      };

      return (
        <Autocomplete
          multiple
          freeSolo
          selectOnFocus
          handleHomeEndKeys
          clearOnBlur={false}
          filterSelectedOptions={false}
          options={categories}
          value={selectedNames}
          inputValue={categoryInput}
          loading={loading}
          onInputChange={(_, value, reason) => {
            if (reason === 'input' || reason === 'clear') {
              setCategoryInput(value);
            }
          }}
          onChange={(_, newValue) => {
            void applySelection(mapSelectionToNames(newValue));
            setCategoryInput('');
          }}
          onBlur={() => {
            const committed = commitPendingInput(selectedNames);
            if (committed.length !== selectedNames.length) {
              void applySelection(committed);
              setCategoryInput('');
            }
          }}
          filterOptions={(options, params) =>
            appendCreateOption(filter(options, params), params.inputValue)
          }
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={(option, value) => {
            const optionName = typeof option === 'string' ? option : option.inputValue || option.name;
            const valueName = typeof value === 'string' ? value : value.inputValue || value.name;
            return optionName.toLowerCase() === valueName.toLowerCase();
          }}
          noOptionsText={loading ? 'Loading...' : 'Type to create a new category'}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              required={required}
              error={error}
              helperText={helperText || 'Pick existing categories or type a new name and press Enter'}
              placeholder="Type to search or create categories"
              sx={textFieldSx}
            />
          )}
        />
      );
    }

    const { categoryId, categoryName, onChange } = props;

    const categoryValue: CategoryOption | null = categoryId
      ? categories.find((c) => c._id === categoryId) || null
      : null;

    const syncCategoryFromInput = (inputValue: string) => {
      const trimmed = inputValue.trim();
      const match = categories.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
      if (match) {
        onChange({ categoryId: match._id, categoryName: '' });
      } else {
        onChange({ categoryId: '', categoryName: trimmed });
      }
    };

    return (
      <Autocomplete
        freeSolo
        selectOnFocus
        handleHomeEndKeys
        clearOnBlur={false}
        options={categories}
        value={categoryValue}
        inputValue={categoryInput}
        loading={loading}
        onInputChange={(_, inputValue, reason) => {
          if (reason === 'input' || reason === 'clear') {
            setCategoryInput(inputValue);
            syncCategoryFromInput(inputValue);
          }
        }}
        onChange={(_, option) => {
          if (!option) {
            onChange({ categoryId: '', categoryName: '' });
            setCategoryInput('');
            return;
          }
          if (typeof option === 'string') {
            const trimmed = option.trim();
            onChange({ categoryId: '', categoryName: trimmed });
            setCategoryInput(trimmed);
            return;
          }
          if (option.inputValue) {
            const trimmed = option.inputValue.trim();
            onChange({ categoryId: '', categoryName: trimmed });
            setCategoryInput(trimmed);
            return;
          }
          onChange({ categoryId: option._id, categoryName: '' });
          setCategoryInput(option.name);
        }}
        filterOptions={(options, params) =>
          appendCreateOption(filter(options, params), params.inputValue)
        }
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={(option, value) => {
          if (option.inputValue && value.inputValue) {
            return option.inputValue.toLowerCase() === value.inputValue.toLowerCase();
          }
          return option._id === value._id;
        }}
        noOptionsText={loading ? 'Loading...' : 'Type to create a new category'}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            required={required}
            error={error}
            helperText={helperText || 'Pick an existing category or type a new name and press Enter'}
            placeholder="Type to search or create a category"
            sx={textFieldSx}
          />
        )}
      />
    );
  }
);

export default CategoryAutocomplete;
