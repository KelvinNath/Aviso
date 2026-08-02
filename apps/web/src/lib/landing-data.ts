export const supportedExams = [
  { name: "JEE Main", slug: "jee-main", status: "live" as const },
  { name: "JEE Advanced", slug: "jee-advanced", status: "soon" as const },
  { name: "WBJEE", slug: "wbjee", status: "soon" as const },
  { name: "MHT CET", slug: "mht-cet", status: "soon" as const },
] as const;

export const howItWorksSteps = [
  {
    step: "01",
    title: "Pick your exams",
    description:
      "Choose the exams you care about. We only track official sources — no random coaching blogs.",
    variant: "lime" as const,
  },
  {
    step: "02",
    title: "Connect Telegram",
    description:
      "Link your Telegram account. That's where the good stuff gets delivered — fast and loud.",
    variant: "purple" as const,
  },
  {
    step: "03",
    title: "Live your life",
    description:
      "We watch NTA so you don't have to. Admit cards, dates, results — we'll ping you.",
    variant: "sky" as const,
  },
] as const;

export const features = [
  {
    title: "Official sources only",
    description:
      "We crawl NTA and other official sites. No WhatsApp forwards. No 'trust me bro' updates.",
    variant: "yellow" as const,
    tilt: "left" as const,
    emoji: "✓",
  },
  {
    title: "Smart notifications",
    description:
      "Admit card out? Date changed? Result declared? You get the update that actually matters.",
    variant: "coral" as const,
    tilt: "right" as const,
    emoji: "🔔",
  },
  {
    title: "Zero F5 energy",
    description:
      "Close the NTA tab. Seriously. We'll tell you when something changes.",
    variant: "lime" as const,
    tilt: "left" as const,
    emoji: "⚡",
  },
  {
    title: "Pick what you want",
    description:
      "Only care about results? Fine. Want everything? Also fine. You control the noise.",
    variant: "purple" as const,
    tilt: "right" as const,
    emoji: "🎯",
  },
] as const;

export const telegramMessages = [
  {
    type: "bot" as const,
    text: "Hey! 👋 I'm Aviso. I'll keep you updated on JEE Main — official sources only.",
  },
  {
    type: "bot" as const,
    text: "📋 Application deadline for JEE Main Session 2 is tomorrow. Don't say we didn't warn you.",
  },
  {
    type: "user" as const,
    text: "Finally. No more refreshing NTA at 2 AM.",
  },
  {
    type: "bot" as const,
    text: "🎫 Good news — your admit card is live. Link attached. Deep breath. You got this.",
  },
] as const;

export const testimonials = [
  {
    quote:
      "I used to check jeemain.nta.nic.in like 10 times a day. Now I just wait for Aviso to yell at me.",
    name: "Priya S.",
    detail: "JEE Main 2026",
    variant: "sky" as const,
  },
  {
    quote:
      "Got the admit card notification before my coaching class WhatsApp group. That alone sold me.",
    name: "Arjun K.",
    detail: "JEE Advanced aspirant",
    variant: "yellow" as const,
  },
  {
    quote:
      "It's like having a friend who actually reads the NTA notices so you don't have to.",
    name: "Sneha M.",
    detail: "Drop year student",
    variant: "coral" as const,
  },
] as const;

export const faqItems = [
  {
    question: "Is Aviso official?",
    answer:
      "Aviso is not affiliated with NTA or any exam authority. We monitor official websites and send you alerts when something changes. Think of us as your very attentive study buddy — not the exam board.",
  },
  {
    question: "Which exams do you support?",
    answer:
      "JEE Main is live right now. JEE Advanced, WBJEE, and MHT CET are on the way. We're adding exams based on what students actually ask for.",
  },
  {
    question: "How do notifications work?",
    answer:
      "You pick an exam and the update types you care about (admit card, dates, results, etc.). When we detect a change on an official source, you get a Telegram message. Simple.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes — for now. We're students too. We built this because we were tired of missing deadlines.",
  },
  {
    question: "Why Telegram and not email?",
    answer:
      "Because you're already on Telegram 47 times a day. Email is where admit card notifications go to die.",
  },
] as const;
