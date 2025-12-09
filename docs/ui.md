# UI Coding Standards

## Component Library

This project uses **shadcn/ui** as the exclusive UI component library.

### Rules

1. **ONLY use shadcn/ui components** - No custom UI components should be created
2. **Do not create custom components** - If a UI element is needed, use the corresponding shadcn/ui component
3. **Install components as needed** - Use `npx shadcn@latest add <component>` to add new components

### Available Components

Browse and add components from: https://ui.shadcn.com/docs/components

Common components include:
- Button
- Card
- Dialog
- Input
- Label
- Select
- Table
- Tabs
- Toast
- Form
- Calendar
- DatePicker

## Date Formatting

Use **date-fns** for all date formatting operations.

### Format Pattern

Dates should be formatted with ordinal day suffixes:

```typescript
import { format } from "date-fns";

// Use this format pattern for dates
format(date, "do MMM yyyy");
```

### Examples

| Date | Formatted Output |
|------|------------------|
| 2025-09-01 | 1st Sep 2025 |
| 2025-08-02 | 2nd Aug 2025 |
| 2026-01-03 | 3rd Jan 2026 |
| 2024-06-04 | 4th Jun 2024 |

### Usage

```typescript
import { format } from "date-fns";

const formattedDate = format(new Date("2025-09-01"), "do MMM yyyy");
// Output: "1st Sep 2025"
```
