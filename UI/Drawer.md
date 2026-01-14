---
title: "Drawer"
source: "https://ui.shadcn.com/docs/components/drawer"
author:
  - "[[shadcn]]"
published:
created: 2026-01-14
description: "A drawer component for React."
tags:
  - "clippings"
---
[Previous](https://ui.shadcn.com/docs/components/dialog) [Next](https://ui.shadcn.com/docs/components/dropdown-menu)

A drawer component for React.

[Docs](https://vaul.emilkowal.ski/getting-started)

```
"use client"

import * as React from "react"

import { Minus, Plus } from "lucide-react"

import { Bar, BarChart, ResponsiveContainer } from "recharts"

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

const data = [

  {

    goal: 400,

  },

  {

    goal: 300,

  },

  {

    goal: 200,

  },

  {

    goal: 300,

  },

  {

    goal: 200,

  },

  {

    goal: 278,

  },

  {

    goal: 189,

  },

  {

    goal: 239,

  },

  {

    goal: 300,

  },

  {

    goal: 200,

  },

  {

    goal: 278,

  },

  {

    goal: 189,

  },

  {

    goal: 349,

  },

]

export function DrawerDemo() {

  const [goal, setGoal] = React.useState(350)

  function onClick(adjustment: number) {

    setGoal(Math.max(200, Math.min(400, goal + adjustment)))

  }

  return (

    <Drawer>

      <DrawerTrigger asChild>

        <Button variant="outline">Open Drawer</Button>

      </DrawerTrigger>

      <DrawerContent>

        <div className="mx-auto w-full max-w-sm">

          <DrawerHeader>

            <DrawerTitle>Move Goal</DrawerTitle>

            <DrawerDescription>Set your daily activity goal.</DrawerDescription>

          </DrawerHeader>

          <div className="p-4 pb-0">

            <div className="flex items-center justify-center space-x-2">

              <Button

                variant="outline"

                size="icon"

                className="h-8 w-8 shrink-0 rounded-full"

                onClick={() => onClick(-10)}

                disabled={goal <= 200}

              >

                <Minus />

                <span className="sr-only">Decrease</span>

              </Button>

              <div className="flex-1 text-center">

                <div className="text-7xl font-bold tracking-tighter">

                  {goal}

                </div>

                <div className="text-muted-foreground text-[0.70rem] uppercase">

                  Calories/day

                </div>

              </div>

              <Button

                variant="outline"

                size="icon"

                className="h-8 w-8 shrink-0 rounded-full"

                onClick={() => onClick(10)}

                disabled={goal >= 400}

              >

                <Plus />

                <span className="sr-only">Increase</span>

              </Button>

            </div>

            <div className="mt-3 h-[120px]">

              <ResponsiveContainer width="100%" height="100%">

                <BarChart data={data}>

                  <Bar

                    dataKey="goal"

                    style={

                      {

                        fill: "hsl(var(--foreground))",

                        opacity: 0.9,

                      } as React.CSSProperties

                    }

                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

          <DrawerFooter>

            <Button>Submit</Button>

            <DrawerClose asChild>

              <Button variant="outline">Cancel</Button>

            </DrawerClose>

          </DrawerFooter>

        </div>

      </DrawerContent>

    </Drawer>

  )

}
```

## About

Drawer is built on top of [Vaul](https://github.com/emilkowalski/vaul) by [emilkowalski](https://twitter.com/emilkowalski).

## Installation

```bash
pnpm dlx shadcn@latest add drawer
```

## Usage

```tsx
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
```
```tsx
<Drawer>

  <DrawerTrigger>Open</DrawerTrigger>

  <DrawerContent>

    <DrawerHeader>

      <DrawerTitle>Are you absolutely sure?</DrawerTitle>

      <DrawerDescription>This action cannot be undone.</DrawerDescription>

    </DrawerHeader>

    <DrawerFooter>

      <Button>Submit</Button>

      <DrawerClose>

        <Button variant="outline">Cancel</Button>

      </DrawerClose>

    </DrawerFooter>

  </DrawerContent>

</Drawer>
```

## Examples

### Responsive Dialog

You can combine the `Dialog` and `Drawer` components to create a responsive dialog. This renders a `Dialog` component on desktop and a `Drawer` on mobile.

```
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import { useMediaQuery } from "@/hooks/use-media-query"

import { Button } from "@/components/ui/button"

import {

  Dialog,

  DialogContent,

  DialogDescription,

  DialogHeader,

  DialogTitle,

  DialogTrigger,

} from "@/components/ui/dialog"

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

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

export function DrawerDialogDemo() {

  const [open, setOpen] = React.useState(false)

  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {

    return (

      <Dialog open={open} onOpenChange={setOpen}>

        <DialogTrigger asChild>

          <Button variant="outline">Edit Profile</Button>

        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">

          <DialogHeader>

            <DialogTitle>Edit profile</DialogTitle>

            <DialogDescription>

              Make changes to your profile here. Click save when you&apos;re

              done.

            </DialogDescription>

          </DialogHeader>

          <ProfileForm />

        </DialogContent>

      </Dialog>

    )

  }

  return (

    <Drawer open={open} onOpenChange={setOpen}>

      <DrawerTrigger asChild>

        <Button variant="outline">Edit Profile</Button>

      </DrawerTrigger>

      <DrawerContent>

        <DrawerHeader className="text-left">

          <DrawerTitle>Edit profile</DrawerTitle>

          <DrawerDescription>

            Make changes to your profile here. Click save when you&apos;re done.

          </DrawerDescription>

        </DrawerHeader>

        <ProfileForm className="px-4" />

        <DrawerFooter className="pt-2">

          <DrawerClose asChild>

            <Button variant="outline">Cancel</Button>

          </DrawerClose>

        </DrawerFooter>

      </DrawerContent>

    </Drawer>

  )

}

function ProfileForm({ className }: React.ComponentProps<"form">) {

  return (

    <form className={cn("grid items-start gap-6", className)}>

      <div className="grid gap-3">

        <Label htmlFor="email">Email</Label>

        <Input type="email" id="email" defaultValue="shadcn@example.com" />

      </div>

      <div className="grid gap-3">

        <Label htmlFor="username">Username</Label>

        <Input id="username" defaultValue="@shadcn" />

      </div>

      <Button type="submit">Save changes</Button>

    </form>

  )

}
```