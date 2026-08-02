import { type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/layout/section";
import { copy } from "@/lib/copy";

function Swatch({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-16 w-full rounded-chunky brutal-border"
        style={{ backgroundColor: color }}
      />
      <p className="font-body text-xs">{name}</p>
      <p className="font-mono text-xs opacity-60">{color}</p>
    </div>
  );
}

function ComponentBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg font-bold uppercase">{title}</h3>
      <div className="rounded-sticker brutal-border bg-aviso-light p-6 dark:bg-aviso-dark">
        {children}
      </div>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <main>
      <Section>
        <SectionHeader>
          <Badge variant="lime">Phase 1</Badge>
          <SectionTitle className="mt-4">Design System</SectionTitle>
          <SectionDescription>
            Foundation tokens and components for the Aviso frontend. Mobile-first,
            neo-brutalist, playful.
          </SectionDescription>
        </SectionHeader>
      </Section>

      <Section background="default">
        <SectionHeader>
          <SectionTitle>Colors</SectionTitle>
          <SectionDescription>Neon palette from design.md</SectionDescription>
        </SectionHeader>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Swatch name="Purple" color="#6D28FF" />
          <Swatch name="Blue" color="#2563FF" />
          <Swatch name="Lime" color="#C7FF3D" />
          <Swatch name="Yellow" color="#FFE600" />
          <Swatch name="Coral" color="#FF6B6B" />
          <Swatch name="Sky" color="#73D9FF" />
          <Swatch name="Light" color="#FAFAFA" />
          <Swatch name="Dark" color="#111111" />
        </div>
      </Section>

      <Section background="lime">
        <SectionHeader>
          <SectionTitle>Typography</SectionTitle>
          <SectionDescription>
            Bricolage Grotesque for headings, Manrope for body
          </SectionDescription>
        </SectionHeader>
        <div className="space-y-6">
          <p className="font-heading text-4xl font-bold uppercase leading-tight sm:text-5xl">
            {copy.hero.headline.join(" ")}
          </p>
          <p className="max-w-xl font-body text-lg leading-relaxed">
            {copy.brand.tagline}
          </p>
          <p className="font-body text-base">
            <span className="highlighter-lime px-1">
              THREE-SIXTY-PITCH helps startup entrepreneurs
            </span>{" "}
            with a quickfire realistic approach.
          </p>
        </div>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>Buttons</SectionTitle>
          <SectionDescription>Chunky, rounded, bold</SectionDescription>
        </SectionHeader>
        <div className="space-y-8">
          <ComponentBlock title="Variants">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="dark">Dark</Button>
              <Button variant="coral">Coral</Button>
              <Button variant="purple">Purple</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </ComponentBlock>

          <ComponentBlock title="Sizes">
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg" arrow>
                Large with arrow
              </Button>
            </div>
          </ComponentBlock>

          <ComponentBlock title="Link button">
            <ButtonLink href="#" variant="primary" arrow>
              {copy.cta.primary}
            </ButtonLink>
          </ComponentBlock>
        </div>
      </Section>

      <Section background="default">
        <SectionHeader>
          <SectionTitle>Cards</SectionTitle>
          <SectionDescription>
            Sticker feel with tilt and color variants
          </SectionDescription>
        </SectionHeader>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card variant="lime" tilt="left">
            <CardTitle>22+ Pages</CardTitle>
            <CardDescription>
              Not uniform SaaS grids. Magazine-style, alive.
            </CardDescription>
          </Card>
          <Card variant="purple" tilt="right">
            <CardTitle>Sections</CardTitle>
            <CardDescription>
              Different heights, overlapping layouts.
            </CardDescription>
          </Card>
          <Card variant="sky">
            <CardTitle>Styles</CardTitle>
            <CardDescription>
              Thick borders, hard shadows, neon accents.
            </CardDescription>
          </Card>
        </div>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>Badges</SectionTitle>
        </SectionHeader>
        <div className="flex flex-wrap gap-3">
          <Badge>JEE Main</Badge>
          <Badge variant="lime">Live</Badge>
          <Badge variant="purple">New</Badge>
          <Badge variant="coral">Urgent</Badge>
          <Badge variant="sky">Official</Badge>
          <Badge variant="yellow">Updated</Badge>
        </div>
      </Section>

      <Section background="dark">
        <SectionHeader>
          <SectionTitle>Form elements</SectionTitle>
        </SectionHeader>
        <div className="max-w-md space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="mt-2"
            />
          </div>
          <Button variant="primary" arrow>
            Subscribe
          </Button>
        </div>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>Copy tone</SectionTitle>
          <SectionDescription>Witty microcopy patterns</SectionDescription>
        </SectionHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(copy.notifications).map(([key, text]) => (
            <Card key={key} variant="default" shadow="sm">
              <CardTitle className="text-sm opacity-50">{key}</CardTitle>
              <CardDescription className="text-base">{text}</CardDescription>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}
