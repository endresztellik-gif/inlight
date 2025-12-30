# Zod Validation Integration Guide - iNLighT Rental Manager

## Progress Update

### ✅ COMPLETED (Part 1/2 - Committed: 776f96b)
1. ✅ Created 5 Zod validation schemas in `src/schemas/`
2. ✅ Added 264 i18n validation messages (EN/HU)
3. ✅ All schemas are production-ready

### 🔄 IN PROGRESS (Part 2/2 - Form Integration)
Remaining: Integrate schemas with 6 form components using react-hook-form

---

## How to Integrate Zod with a Form

### Step-by-Step Pattern

#### 1. Update Imports

**BEFORE:**
```tsx
import { useState } from 'react'
```

**AFTER:**
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, type ClientFormData } from '@/schemas/clientSchema'
```

#### 2. Replace useState with useForm

**BEFORE:**
```tsx
const [name, setName] = useState('')
const [email, setEmail] = useState('')
const [phone, setPhone] = useState('')
```

**AFTER:**
```tsx
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
  setError: setFormError,
} = useForm<ClientFormData>({
  resolver: zodResolver(clientSchema),
  defaultValues: {
    name: '',
    email: '',
    phone: '',
    address: '',
    tax_number: '',
    contact_person: '',
    notes: '',
  },
})
```

#### 3. Update handleSubmit Function

**BEFORE:**
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  try {
    await createClient.mutateAsync({
      name,
      email,
      phone,
      ...
    })
  } catch (err) {
    setError(err.message)
  }
}
```

**AFTER:**
```tsx
const onSubmit = async (data: ClientFormData) => {
  try {
    await createClient.mutateAsync({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address || null,
      tax_number: data.tax_number || null,
      contact_person_name: data.contact_person || null,
      notes: data.notes || null,
      ...
    })
  } catch (err) {
    setFormError('root', { message: err.message })
  }
}
```

#### 4. Update Form Tag

**BEFORE:**
```tsx
<form onSubmit={handleSubmit}>
```

**AFTER:**
```tsx
<form onSubmit={handleSubmit(onSubmit)}>
```

#### 5. Update Input Fields with register()

**BEFORE:**
```tsx
<Input
  required
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="John Doe"
/>
```

**AFTER:**
```tsx
<div>
  <Input
    {...register('name')}
    placeholder="John Doe"
    className={errors.name ? 'border-red-500' : ''}
  />
  {errors.name && (
    <p className="text-sm text-red-500 mt-1">
      {t(errors.name.message as string)}
    </p>
  )}
</div>
```

#### 6. Update Submit Button

**BEFORE:**
```tsx
<Button type="submit" disabled={createClient.isPending}>
  {createClient.isPending ? <Loader2 className="animate-spin" /> : <Save />}
  Submit
</Button>
```

**AFTER:**
```tsx
<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
  Submit
</Button>
```

#### 7. Display Root Errors (Form-level)

**Add after form tag:**
```tsx
{errors.root && (
  <div className="p-4 bg-red-500/10 border border-red-500 rounded-md">
    <p className="text-sm text-red-500">{errors.root.message}</p>
  </div>
)}
```

---

## Form-Specific Integration

### 1. NewClient.tsx

**Schema:** `src/schemas/clientSchema.ts`

**Fields to integrate:**
- name (required)
- email (required)
- phone (required)
- address (optional)
- tax_number (optional)
- contact_person (optional)
- notes (optional)

**Example:**
```tsx
export function NewClient() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  })

  const onSubmit = async (data: ClientFormData) => {
    await createClient.mutateAsync({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address || null,
      tax_number: data.tax_number || null,
      contact_person_name: data.contact_person || null,
      notes: data.notes || null,
      is_active: true,
      created_by: user.id,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Name field */}
      <div>
        <label>{t('clients.form.name')} *</label>
        <Input {...register('name')} className={errors.name ? 'border-red-500' : ''} />
        {errors.name && <p className="text-sm text-red-500 mt-1">{t(errors.name.message)}</p>}
      </div>

      {/* Repeat for email, phone, address, tax_number, contact_person, notes */}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
        {t('clients.form.submit')}
      </Button>
    </form>
  )
}
```

---

### 2. NewCategory.tsx

**Schema:** `src/schemas/categorySchema.ts`

**Fields:**
- name (required)
- description (optional)

**Simpler - only 2 fields!**

---

### 3. NewProduct.tsx

**Schema:** `src/schemas/productSchema.ts`

**Fields:**
- name (required)
- serial_number (required)
- category_id (required UUID - use select dropdown)
- daily_rate (required number)
- available_quantity (required number)
- total_quantity (required number)
- description (optional)
- description_hu (optional)

**Special case:** Number inputs need `valueAsNumber: true`

```tsx
<Input
  type="number"
  {...register('daily_rate', { valueAsNumber: true })}
/>
```

---

### 4. NewRental.tsx + NewSubrental.tsx

**Complex!** These have arrays of items.

**Use `useFieldArray` from react-hook-form:**

```tsx
import { useForm, useFieldArray } from 'react-hook-form'

const { register, control, handleSubmit } = useForm<RentalFormData>({
  resolver: zodResolver(rentalSchema),
})

const { fields, append, remove } = useFieldArray({
  control,
  name: 'items',
})

// Render items
{fields.map((field, index) => (
  <div key={field.id}>
    <Input {...register(`items.${index}.product_id`)} />
    <Input {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
    <Button onClick={() => remove(index)}>Remove</Button>
  </div>
))}

<Button onClick={() => append({ product_id: '', quantity: 1, daily_rate: 0, days: 1 })}>
  Add Item
</Button>
```

---

## Testing Checklist

After integrating each form:

1. ✅ TypeScript compiles without errors (`npm run typecheck`)
2. ✅ Form renders without errors
3. ✅ Submit with empty required fields → shows validation errors
4. ✅ Submit with invalid email → shows email validation error
5. ✅ Submit with invalid tax number (if applicable) → shows format error
6. ✅ Submit with valid data → creates record successfully
7. ✅ Error messages are translated (check EN and HU)
8. ✅ Error messages are displayed in red below fields

---

## Remaining Forms to Integrate

1. ⬜ NewClient.tsx (7 fields)
2. ⬜ ClientEdit.tsx (same as NewClient)
3. ⬜ NewCategory.tsx (2 fields - easiest!)
4. ⬜ EditCategory.tsx (same as NewCategory)
5. ⬜ NewProduct.tsx (8 fields)
6. ⬜ EditProduct.tsx (same as NewProduct)
7. ⬜ NewRental.tsx (complex - has items array)
8. ⬜ NewSubrental.tsx (very complex - rental + supplier + items)

**Estimated Time:** 3-4 hours total (20-30 min per form)

---

## Next Steps

### Option A: Continue Form Integration (Manual)
Follow this guide for each form:
1. Pick a form (start with NewCategory.tsx - only 2 fields!)
2. Follow the 7-step pattern above
3. Test with invalid input
4. Commit when done

### Option B: Automated Script (Future Enhancement)
Create a codemod/script to automatically convert useState forms to react-hook-form

### Option C: Resume in Next Session
Claude can continue from here using this guide

---

## Common Issues & Solutions

### Issue: TypeScript error "Property X does not exist on type..."
**Solution:** Check that field name in `register()` matches schema field name exactly

### Issue: Number input shows validation error "must be a number"
**Solution:** Add `{ valueAsNumber: true }` to register options:
```tsx
<Input type="number" {...register('daily_rate', { valueAsNumber: true })} />
```

### Issue: Optional fields showing required error
**Solution:** Check schema - use `.optional().or(z.literal(''))` for empty strings

### Issue: i18n error message not translating
**Solution:** Wrap error message in `t()`:
```tsx
{errors.name && <p>{t(errors.name.message as string)}</p>}
```

---

## Files Modified Summary

### Already Committed
- ✅ `src/schemas/clientSchema.ts`
- ✅ `src/schemas/categorySchema.ts`
- ✅ `src/schemas/productSchema.ts`
- ✅ `src/schemas/rentalSchema.ts`
- ✅ `src/schemas/subrentalSchema.ts`
- ✅ `src/i18n/locales/en.json` (+132 lines)
- ✅ `src/i18n/locales/hu.json` (+132 lines)

### To Be Modified
- ⬜ `src/pages/NewClient.tsx`
- ⬜ `src/pages/ClientEdit.tsx`
- ⬜ `src/pages/admin/NewCategory.tsx`
- ⬜ `src/pages/admin/EditCategory.tsx`
- ⬜ `src/pages/admin/NewProduct.tsx`
- ⬜ `src/pages/admin/EditProduct.tsx`
- ⬜ `src/pages/NewRental.tsx`
- ⬜ `src/pages/NewSubrental.tsx`

---

**End of Guide**
