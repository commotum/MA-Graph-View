---
title: "Kbd"
source: "https://ui.shadcn.com/docs/components/kbd"
author:
  - "[[shadcn]]"
published:
created: 2026-01-14
description: "Used to display textual user input from keyboard."
tags:
  - "clippings"
---
[Previous](https://ui.shadcn.com/docs/components/item) [Next](https://ui.shadcn.com/docs/components/label)

Used to display textual user input from keyboard.

⌘ ⇧ ⌥ ⌃ Ctrl + B

```
import { Kbd, KbdGroup } from "@/components/ui/kbd"

export function KbdDemo() {

  return (

    <div className="flex flex-col items-center gap-4">

      <KbdGroup>

        <Kbd>⌘</Kbd>

        <Kbd>⇧</Kbd>

        <Kbd>⌥</Kbd>

        <Kbd>⌃</Kbd>

      </KbdGroup>

      <KbdGroup>

        <Kbd>Ctrl</Kbd>

        <span>+</span>

        <Kbd>B</Kbd>

      </KbdGroup>

    </div>

  )

}
```

## Installation

```bash
pnpm dlx shadcn@latest add kbd
```

## Usage

```tsx
import { Kbd } from "@/components/ui/kbd"
```
```tsx
<Kbd>Ctrl</Kbd>
```

## Examples

### Group

Use the `KbdGroup` component to group keyboard keys together.

Use Ctrl + B Ctrl + K to open the command palette

```
import { Kbd, KbdGroup } from "@/components/ui/kbd"

export function KbdGroupExample() {

  return (

    <div className="flex flex-col items-center gap-4">

      <p className="text-muted-foreground text-sm">

        Use{" "}

        <KbdGroup>

          <Kbd>Ctrl + B</Kbd>

          <Kbd>Ctrl + K</Kbd>

        </KbdGroup>{" "}

        to open the command palette

      </p>

    </div>

  )

}
```

### Button

Use the `Kbd` component inside a `Button` component to display a keyboard key inside a button.

```
import { Button } from "@/components/ui/button"

import { Kbd } from "@/components/ui/kbd"

export function KbdButton() {

  return (

    <div className="flex flex-wrap items-center gap-4">

      <Button variant="outline" size="sm" className="pr-2">

        Accept <Kbd>⏎</Kbd>

      </Button>

      <Button variant="outline" size="sm" className="pr-2">

        Cancel <Kbd>Esc</Kbd>

      </Button>

    </div>

  )

}
```

### Tooltip

You can use the `Kbd` component inside a `Tooltip` component to display a tooltip with a keyboard key.

```
import { Button } from "@/components/ui/button"

import { ButtonGroup } from "@/components/ui/button-group"

import { Kbd, KbdGroup } from "@/components/ui/kbd"

import {

  Tooltip,

  TooltipContent,

  TooltipTrigger,

} from "@/components/ui/tooltip"

export function KbdTooltip() {

  return (

    <div className="flex flex-wrap gap-4">

      <ButtonGroup>

        <Tooltip>

          <TooltipTrigger asChild>

            <Button size="sm" variant="outline">

              Save

            </Button>

          </TooltipTrigger>

          <TooltipContent>

            <div className="flex items-center gap-2">

              Save Changes <Kbd>S</Kbd>

            </div>

          </TooltipContent>

        </Tooltip>

        <Tooltip>

          <TooltipTrigger asChild>

            <Button size="sm" variant="outline">

              Print

            </Button>

          </TooltipTrigger>

          <TooltipContent>

            <div className="flex items-center gap-2">

              Print Document{" "}

              <KbdGroup>

                <Kbd>Ctrl</Kbd>

                <Kbd>P</Kbd>

              </KbdGroup>

            </div>

          </TooltipContent>

        </Tooltip>

      </ButtonGroup>

    </div>

  )

}
```

### Input Group

You can use the `Kbd` component inside a `InputGroupAddon` component to display a keyboard key inside an input group.

⌘ K

```
import { SearchIcon } from "lucide-react"

import {

  InputGroup,

  InputGroupAddon,

  InputGroupInput,

} from "@/components/ui/input-group"

import { Kbd } from "@/components/ui/kbd"

export function KbdInputGroup() {

  return (

    <div className="flex w-full max-w-xs flex-col gap-6">

      <InputGroup>

        <InputGroupInput placeholder="Search..." />

        <InputGroupAddon>

          <SearchIcon />

        </InputGroupAddon>

        <InputGroupAddon align="inline-end">

          <Kbd>⌘</Kbd>

          <Kbd>K</Kbd>

        </InputGroupAddon>

      </InputGroup>

    </div>

  )

}
```

## API Reference

### Kbd

Use the `Kbd` component to display a keyboard key.

| Prop | Type | Default |
| --- | --- | --- |
| `className` | `string` | \`\` |

```tsx
<Kbd>Ctrl</Kbd>
```

### KbdGroup

Use the `KbdGroup` component to group `Kbd` components together.

| Prop | Type | Default |
| --- | --- | --- |
| `className` | `string` | \`\` |

```tsx
<KbdGroup>

  <Kbd>Ctrl</Kbd>

  <Kbd>B</Kbd>

</KbdGroup>
```