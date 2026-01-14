---
title: "Toggle Group"
source: "https://ui.shadcn.com/docs/components/toggle-group"
author:
  - "[[shadcn]]"
published:
created: 2026-01-14
description: "A set of two-state buttons that can be toggled on or off."
tags:
  - "clippings"
---
A set of two-state buttons that can be toggled on or off.

[Docs](https://www.radix-ui.com/docs/primitives/components/toggle-group) [API Reference](https://www.radix-ui.com/docs/primitives/components/toggle-group#api-reference)

```
import { BookmarkIcon, HeartIcon, StarIcon } from "lucide-react"

import {

  ToggleGroup,

  ToggleGroupItem,

} from "@/components/ui/toggle-group"

export function ToggleGroupSpacing() {

  return (

    <ToggleGroup type="multiple" variant="outline" spacing={2} size="sm">

      <ToggleGroupItem

        value="star"

        aria-label="Toggle star"

        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-yellow-500 data-[state=on]:*:[svg]:stroke-yellow-500"

      >

        <StarIcon />

        Star

      </ToggleGroupItem>

      <ToggleGroupItem

        value="heart"

        aria-label="Toggle heart"

        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-red-500 data-[state=on]:*:[svg]:stroke-red-500"

      >

        <HeartIcon />

        Heart

      </ToggleGroupItem>

      <ToggleGroupItem

        value="bookmark"

        aria-label="Toggle bookmark"

        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-blue-500 data-[state=on]:*:[svg]:stroke-blue-500"

      >

        <BookmarkIcon />

        Bookmark

      </ToggleGroupItem>

    </ToggleGroup>

  )

}
```

## Installation

```bash
pnpm dlx shadcn@latest add toggle-group
```

## Usage

```tsx
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
```
```tsx
<ToggleGroup type="single">

  <ToggleGroupItem value="a">A</ToggleGroupItem>

  <ToggleGroupItem value="b">B</ToggleGroupItem>

  <ToggleGroupItem value="c">C</ToggleGroupItem>

</ToggleGroup>
```

## Examples

### Outline

```
import { Bold, Italic, Underline } from "lucide-react"

import {

  ToggleGroup,

  ToggleGroupItem,

} from "@/components/ui/toggle-group"

export function ToggleGroupDemo() {

  return (

    <ToggleGroup type="multiple" variant="outline">

      <ToggleGroupItem value="bold" aria-label="Toggle bold">

        <Bold className="h-4 w-4" />

      </ToggleGroupItem>

      <ToggleGroupItem value="italic" aria-label="Toggle italic">

        <Italic className="h-4 w-4" />

      </ToggleGroupItem>

      <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough">

        <Underline className="h-4 w-4" />

      </ToggleGroupItem>

    </ToggleGroup>

  )

}
```

### Single

```
import { Bold, Italic, Underline } from "lucide-react"

import {

  ToggleGroup,

  ToggleGroupItem,

} from "@/components/ui/toggle-group"

export function ToggleGroupDemo() {

  return (

    <ToggleGroup type="single">

      <ToggleGroupItem value="bold" aria-label="Toggle bold">

        <Bold className="h-4 w-4" />

      </ToggleGroupItem>

      <ToggleGroupItem value="italic" aria-label="Toggle italic">

        <Italic className="h-4 w-4" />

      </ToggleGroupItem>

      <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough">

        <Underline className="h-4 w-4" />

      </ToggleGroupItem>

    </ToggleGroup>

  )

}
```

### Small

```
import { Bold, Italic, Underline } from "lucide-react"

import {

  ToggleGroup,

  ToggleGroupItem,

} from "@/components/ui/toggle-group"

export function ToggleGroupDemo() {

  return (

    <ToggleGroup type="single" size="sm">

      <ToggleGroupItem value="bold" aria-label="Toggle bold">

        <Bold className="h-4 w-4" />

      </ToggleGroupItem>

      <ToggleGroupItem value="italic" aria-label="Toggle italic">

        <Italic className="h-4 w-4" />

      </ToggleGroupItem>

      <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough">

        <Underline className="h-4 w-4" />

      </ToggleGroupItem>

    </ToggleGroup>

  )

}
```

### Large

```
import { Bold, Italic, Underline } from "lucide-react"

import {

  ToggleGroup,

  ToggleGroupItem,

} from "@/components/ui/toggle-group"

export function ToggleGroupDemo() {

  return (

    <ToggleGroup type="multiple" size="lg">

      <ToggleGroupItem value="bold" aria-label="Toggle bold">

        <Bold className="h-4 w-4" />

      </ToggleGroupItem>

      <ToggleGroupItem value="italic" aria-label="Toggle italic">

        <Italic className="h-4 w-4" />

      </ToggleGroupItem>

      <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough">

        <Underline className="h-4 w-4" />

      </ToggleGroupItem>

    </ToggleGroup>

  )

}
```

### Disabled

```
import { Bold, Italic, Underline } from "lucide-react"

import {

  ToggleGroup,

  ToggleGroupItem,

} from "@/components/ui/toggle-group"

export function ToggleGroupDemo() {

  return (

    <ToggleGroup type="multiple" disabled>

      <ToggleGroupItem value="bold" aria-label="Toggle bold">

        <Bold className="h-4 w-4" />

      </ToggleGroupItem>

      <ToggleGroupItem value="italic" aria-label="Toggle italic">

        <Italic className="h-4 w-4" />

      </ToggleGroupItem>

      <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough">

        <Underline className="h-4 w-4" />

      </ToggleGroupItem>

    </ToggleGroup>

  )

}
```

### Spacing

Use `spacing={2}` to add spacing between toggle group items.

```
import { BookmarkIcon, HeartIcon, StarIcon } from "lucide-react"

import {

  ToggleGroup,

  ToggleGroupItem,

} from "@/components/ui/toggle-group"

export function ToggleGroupSpacing() {

  return (

    <ToggleGroup type="multiple" variant="outline" spacing={2} size="sm">

      <ToggleGroupItem

        value="star"

        aria-label="Toggle star"

        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-yellow-500 data-[state=on]:*:[svg]:stroke-yellow-500"

      >

        <StarIcon />

        Star

      </ToggleGroupItem>

      <ToggleGroupItem

        value="heart"

        aria-label="Toggle heart"

        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-red-500 data-[state=on]:*:[svg]:stroke-red-500"

      >

        <HeartIcon />

        Heart

      </ToggleGroupItem>

      <ToggleGroupItem

        value="bookmark"

        aria-label="Toggle bookmark"

        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-blue-500 data-[state=on]:*:[svg]:stroke-blue-500"

      >

        <BookmarkIcon />

        Bookmark

      </ToggleGroupItem>

    </ToggleGroup>

  )

}
```

## API Reference

### ToggleGroup

The main component that wraps toggle group items.

| Prop | Type | Default |
| --- | --- | --- |
| `type` | `"single" \| "multiple"` | `"single"` |
| `variant` | `"default" \| "outline"` | `"default"` |
| `size` | `"default" \| "sm" \| "lg"` | `"default"` |
| `spacing` | `number` | `0` |
| `className` | `string` |  |

```tsx
<ToggleGroup type="single" variant="outline" size="sm">

  <ToggleGroupItem value="a">A</ToggleGroupItem>

  <ToggleGroupItem value="b">B</ToggleGroupItem>

</ToggleGroup>
```

### ToggleGroupItem

Individual toggle items within a toggle group. Remember to add an `aria-label` to each item for accessibility.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | Required |
| `className` | `string` |  |