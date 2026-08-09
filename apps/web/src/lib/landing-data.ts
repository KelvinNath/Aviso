export const supportedExams = [
  { name: "JEE Main", slug: "jee-main", status: "live" as const },
  { name: "JEE Advanced", slug: "jee-advanced", status: "live" as const },
  { name: "BITSAT", slug: "bitsat", status: "live" as const },
  { name: "COMEDK UGET", slug: "comedk-uget", status: "live" as const },
  { name: "WBJEE", slug: "wbjee", status: "live" as const },
  { name: "MHT CET", slug: "mht-cet", status: "live" as const },
  { name: "KCET", slug: "kcet", status: "live" as const },
  { name: "VITEEE", slug: "viteee", status: "live" as const },
  { name: "MET", slug: "met", status: "live" as const },
  { name: "SRMJEEE", slug: "srmjeee", status: "live" as const },
] as const;

export const howItWorksSteps = [
  {
    step: "01",
    title: "Pick your exams",
    description:
      "Choose the entrances you care about — JEE, BITSAT, COMEDK, state CETs, and more.",
    variant: "lime" as const,
  },
  {
    step: "02",
    title: "Choose your updates",
    description:
      "Admit cards only? Results too? You pick the noise level for each exam.",
    variant: "purple" as const,
  },
  {
    step: "03",
    title: "Connect Telegram",
    description:
      "Link Telegram and get pinged when official portals change. No more tab-hopping.",
    variant: "sky" as const,
  },
] as const;

export const features = [
  {
    title: "Official sources only",
    description:
      "We crawl exam boards and university portals — not WhatsApp forwards or 'trust me bro' PDFs.",
    variant: "yellow" as const,
    tilt: "left" as const,
    emoji: "✓",
  },
  {
    title: "Smart notifications",
    description:
      "Admit card out? Date shifted? Result declared? You get the update that actually matters.",
    variant: "coral" as const,
    tilt: "right" as const,
    emoji: "🔔",
  },
  {
    title: "No tab-hopping",
    description:
      "Close the dozen admission sites you have bookmarked. We'll tell you when something changes.",
    variant: "lime" as const,
    tilt: "left" as const,
    emoji: "⚡",
  },
  {
    title: "Per-exam control",
    description:
      "Track JEE and BITSAT with different alert types. Your prep, your rules.",
    variant: "purple" as const,
    tilt: "right" as const,
    emoji: "🎯",
  },
] as const;

export const telegramMessages = [
  {
    type: "bot" as const,
    text: "Hey! 👋 I'm Aviso. Pick your exams and I'll watch the official portals for you.",
  },
  {
    type: "bot" as const,
    text: "📋 COMEDK UGET application deadline is tomorrow. Official notice linked.",
  },
  {
    type: "user" as const,
    text: "Finally. No more checking five different sites at 2 AM.",
  },
  {
    type: "bot" as const,
    text: "🎫 BITSAT admit card is live. Link attached. Deep breath. You got this.",
  },
] as const;

export const testimonials = [
  {
    quote:
      "I was juggling JEE Main, WBJEE, and COMEDK tabs. Now Aviso just yells at me when something changes.",
    name: "Priya S.",
    detail: "Multi-exam applicant",
    variant: "sky" as const,
  },
  {
    quote:
      "Got the BITSAT admit card ping before my coaching class WhatsApp group. That alone sold me.",
    name: "Arjun K.",
    detail: "Engineering aspirant",
    variant: "yellow" as const,
  },
  {
    quote:
      "It's like having a friend who actually reads the official notices so you don't have to.",
    name: "Sneha M.",
    detail: "Drop year student",
    variant: "coral" as const,
  },
] as const;

export const faqItems = [
  {
    question: "Is Aviso official?",
    answer:
      "No — we're not affiliated with NTA, COMEDK, or any exam authority. We monitor official websites and send alerts when something changes. Think of us as your very attentive study buddy, not the exam board.",
  },
  {
    question: "Which exams do you support?",
    answer:
      "JEE Main, JEE Advanced, BITSAT, COMEDK UGET, WBJEE, MHT CET, KCET, VITEEE, MET, and SRMJEEE — all tracked from official sources. We're adding more based on what students ask for.",
  },
  {
    question: "How do notifications work?",
    answer:
      "Pick an exam, choose the update types you care about (admit card, dates, results, deadlines, etc.), connect Telegram, and we ping you when we detect a relevant change on an official portal.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes — for now. We're students too. We built this because we were tired of missing deadlines across too many exams.",
  },
  {
    question: "Why Telegram and not email?",
    answer:
      "Because you're already on Telegram 47 times a day. Email is where admit card notifications go to die.",
  },
] as const;
