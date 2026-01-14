---
title: "Breadcrumb"
source: "https://ui.shadcn.com/docs/components/breadcrumb"
author:
  - "[[shadcn]]"
published:
created: 2026-01-14
description: "Displays the path to the current resource using a hierarchy of links."
tags:
  - "clippings"
---
[Previous](https://ui.shadcn.com/docs/components/badge) [Next](https://ui.shadcn.com/docs/components/button-group)

Displays the path to the current resource using a hierarchy of links.

## Installation

```bash
pnpm dlx shadcn@latest add breadcrumb
```

## Usage

```tsx
import {

  Breadcrumb,

  BreadcrumbItem,

  BreadcrumbLink,

  BreadcrumbList,

  BreadcrumbPage,

  BreadcrumbSeparator,

} from "@/components/ui/breadcrumb"
```
```tsx
<Breadcrumb>

  <BreadcrumbList>

    <BreadcrumbItem>

      <BreadcrumbLink href="/">Home</BreadcrumbLink>

    </BreadcrumbItem>

    <BreadcrumbSeparator />

    <BreadcrumbItem>

      <BreadcrumbLink href="/components">Components</BreadcrumbLink>

    </BreadcrumbItem>

    <BreadcrumbSeparator />

    <BreadcrumbItem>

      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>

    </BreadcrumbItem>

  </BreadcrumbList>

</Breadcrumb>
```

## Examples

### Custom separator

Use a custom component as `children` for `<BreadcrumbSeparator />` to create a custom separator.

```bash
import Link from "next/link"

import { SlashIcon } from "lucide-react"

import {

  Breadcrumb,

  BreadcrumbItem,

  BreadcrumbLink,

  BreadcrumbList,

  BreadcrumbPage,

  BreadcrumbSeparator,

} from "@/components/ui/breadcrumb"

export function BreadcrumbWithCustomSeparator() {

  return (

    <Breadcrumb>

      <BreadcrumbList>

        <BreadcrumbItem>

          <BreadcrumbLink asChild>

            <Link href="/">Home</Link>

          </BreadcrumbLink>

        </BreadcrumbItem>

        <BreadcrumbSeparator>

          <SlashIcon />

        </BreadcrumbSeparator>

        <BreadcrumbItem>

          <BreadcrumbLink asChild>

            <Link href="/components">Components</Link>

          </BreadcrumbLink>

        </BreadcrumbItem>

        <BreadcrumbSeparator>

          <SlashIcon />

        </BreadcrumbSeparator>

        <BreadcrumbItem>

          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>

        </BreadcrumbItem>

      </BreadcrumbList>

    </Breadcrumb>

  )

}
```

```tsx
import { SlashIcon } from "lucide-react"

 

...

 

<Breadcrumb>

  <BreadcrumbList>

    <BreadcrumbItem>

      <BreadcrumbLink href="/">Home</BreadcrumbLink>

    </BreadcrumbItem>

    <BreadcrumbSeparator>

      <SlashIcon />

    </BreadcrumbSeparator>

    <BreadcrumbItem>

      <BreadcrumbLink href="/components">Components</BreadcrumbLink>

    </BreadcrumbItem>

  </BreadcrumbList>

</Breadcrumb>
```

---

### Dropdown

You can compose `<BreadcrumbItem />` with a `<DropdownMenu />` to create a dropdown in the breadcrumb.

```tsx
import {

  DropdownMenu,

  DropdownMenuContent,

  DropdownMenuItem,

  DropdownMenuTrigger,

} from "@/components/ui/dropdown-menu"

 

...

 

<BreadcrumbItem>

  <DropdownMenu>

    <DropdownMenuTrigger>

      Components

    </DropdownMenuTrigger>

    <DropdownMenuContent align="start">

      <DropdownMenuItem>Documentation</DropdownMenuItem>

      <DropdownMenuItem>Themes</DropdownMenuItem>

      <DropdownMenuItem>GitHub</DropdownMenuItem>

    </DropdownMenuContent>

  </DropdownMenu>

</BreadcrumbItem>
```

---

### Collapsed

We provide a `<BreadcrumbEllipsis />` component to show a collapsed state when the breadcrumb is too long.

```bash
import Link from "next/link"

import {

  Breadcrumb,

  BreadcrumbEllipsis,

  BreadcrumbItem,

  BreadcrumbLink,

  BreadcrumbList,

  BreadcrumbPage,

  BreadcrumbSeparator,

} from "@/components/ui/breadcrumb"

export function BreadcrumbCollapsed() {

  return (

    <Breadcrumb>

      <BreadcrumbList>

        <BreadcrumbItem>

          <BreadcrumbLink asChild>

            <Link href="/">Home</Link>

          </BreadcrumbLink>

        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>

          <BreadcrumbEllipsis />

        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>

          <BreadcrumbLink asChild>

            <Link href="/docs/components">Components</Link>

          </BreadcrumbLink>

        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>

          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>

        </BreadcrumbItem>

      </BreadcrumbList>

    </Breadcrumb>

  )

}
```

```tsx
import { BreadcrumbEllipsis } from "@/components/ui/breadcrumb"

 

...

 

<Breadcrumb>

  <BreadcrumbList>

    {/* ... */}

    <BreadcrumbItem>

      <BreadcrumbEllipsis />

    </BreadcrumbItem>

    {/* ... */}

  </BreadcrumbList>

</Breadcrumb>
```

---

### Link component

To use a custom link component from your routing library, you can use the `asChild` prop on `<BreadcrumbLink />`.

```bash
import Link from "next/link"

import {

  Breadcrumb,

  BreadcrumbItem,

  BreadcrumbLink,

  BreadcrumbList,

  BreadcrumbPage,

  BreadcrumbSeparator,

} from "@/components/ui/breadcrumb"

export function BreadcrumbWithCustomSeparator() {

  return (

    <Breadcrumb>

      <BreadcrumbList>

        <BreadcrumbItem>

          <BreadcrumbLink asChild>

            <Link href="/">Home</Link>

          </BreadcrumbLink>

        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>

          <BreadcrumbLink asChild>

            <Link href="/components">Components</Link>

          </BreadcrumbLink>

        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>

          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>

        </BreadcrumbItem>

      </BreadcrumbList>

    </Breadcrumb>

  )

}
```

```tsx
import Link from "next/link"

 

...

 

<Breadcrumb>

  <BreadcrumbList>

    <BreadcrumbItem>

      <BreadcrumbLink asChild>

        <Link href="/">Home</Link>

      </BreadcrumbLink>

    </BreadcrumbItem>

    {/* ... */}

  </BreadcrumbList>

</Breadcrumb>
```

---

### Responsive

Here's an example of a responsive breadcrumb that composes `<BreadcrumbItem />` with `<BreadcrumbEllipsis />`, `<DropdownMenu />`, and `<Drawer />`.

It displays a dropdown on desktop and a drawer on mobile.

```bash
"use client"

import * as React from "react"

import Link from "next/link"

import { useMediaQuery } from "@/hooks/use-media-query"

import {

  Breadcrumb,

  BreadcrumbEllipsis,

  BreadcrumbItem,

  BreadcrumbLink,

  BreadcrumbList,

  BreadcrumbPage,

  BreadcrumbSeparator,

} from "@/components/ui/breadcrumb"

import { Button } from "@/components/ui/button"

import {

  Drawer,

  DrawerClose,

  DrawerContent,

  DrawerDescription,

  DrawerFooter,

  DrawerHeader,

  DrawerTitle,

  DrawerTrigger,

} from "@/components/ui/drawer"

import {

  DropdownMenu,

  DropdownMenuContent,

  DropdownMenuItem,

  DropdownMenuTrigger,

} from "@/components/ui/dropdown-menu"

const items = [

  { href: "#", label: "Home" },

  { href: "#", label: "Documentation" },

  { href: "#", label: "Building Your Application" },

  { href: "#", label: "Data Fetching" },

  { label: "Caching and Revalidating" },

]

const ITEMS_TO_DISPLAY = 3

export function BreadcrumbResponsive() {

  const [open, setOpen] = React.useState(false)

  const isDesktop = useMediaQuery("(min-width: 768px)")

  return (

    <Breadcrumb>

      <BreadcrumbList>

        <BreadcrumbItem>

          <BreadcrumbLink asChild>

            <Link href={items[0].href ?? "/"}>{items[0].label}</Link>

          </BreadcrumbLink>

        </BreadcrumbItem>

        <BreadcrumbSeparator />

        {items.length > ITEMS_TO_DISPLAY ? (

          <>

            <BreadcrumbItem>

              {isDesktop ? (

                <DropdownMenu open={open} onOpenChange={setOpen}>

                  <DropdownMenuTrigger

                    className="flex items-center gap-1"

                    aria-label="Toggle menu"

                  >

                    <BreadcrumbEllipsis className="size-4" />

                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start">

                    {items.slice(1, -2).map((item, index) => (

                      <DropdownMenuItem key={index}>

                        <Link href={item.href ? item.href : "#"}>

                          {item.label}

                        </Link>

                      </DropdownMenuItem>

                    ))}

                  </DropdownMenuContent>

                </DropdownMenu>

              ) : (

                <Drawer open={open} onOpenChange={setOpen}>

                  <DrawerTrigger aria-label="Toggle Menu">

                    <BreadcrumbEllipsis className="h-4 w-4" />

                  </DrawerTrigger>

                  <DrawerContent>

                    <DrawerHeader className="text-left">

                      <DrawerTitle>Navigate to</DrawerTitle>

                      <DrawerDescription>

                        Select a page to navigate to.

                      </DrawerDescription>

                    </DrawerHeader>

                    <div className="grid gap-1 px-4">

                      {items.slice(1, -2).map((item, index) => (

                        <Link

                          key={index}

                          href={item.href ? item.href : "#"}

                          className="py-1 text-sm"

                        >

                          {item.label}

                        </Link>

                      ))}

                    </div>

                    <DrawerFooter className="pt-4">

                      <DrawerClose asChild>

                        <Button variant="outline">Close</Button>

                      </DrawerClose>

                    </DrawerFooter>

                  </DrawerContent>

                </Drawer>

              )}

            </BreadcrumbItem>

            <BreadcrumbSeparator />

          </>

        ) : null}

        {items.slice(-ITEMS_TO_DISPLAY + 1).map((item, index) => (

          <BreadcrumbItem key={index}>

            {item.href ? (

              <>

                <BreadcrumbLink

                  asChild

                  className="max-w-20 truncate md:max-w-none"

                >

                  <Link href={item.href}>{item.label}</Link>

                </BreadcrumbLink>

                <BreadcrumbSeparator />

              </>

            ) : (

              <BreadcrumbPage className="max-w-20 truncate md:max-w-none">

                {item.label}

              </BreadcrumbPage>

            )}

          </BreadcrumbItem>

        ))}

      </BreadcrumbList>

    </Breadcrumb>

  )

}
```