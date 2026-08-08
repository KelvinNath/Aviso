/** Reusable witty copy patterns from design.md */

export const copy = {
  brand: {
    tagline: "We remember the deadlines. You remember the syllabus.",
    promise: "Official information. Unofficial personality.",
  },

  hero: {
    headline: ["Stop refreshing", "NTA every", "15 minutes."],
    subtext:
      "Get official exam updates delivered to Telegram. No more guessing, no more F5.",
    cta: "Save me from deadlines",
  },

  dashboard: {
    greeting: (name: string) => `Morning, ${name} ☀️`,
    timeGreeting: (name: string, time: string) => `${time}, ${name} ☀️`,
    safe: "Nothing exploded today. You're safe.",
    peaceful: "Peaceful day. We'll wake you when NTA does.",
    title: "Dashboard",
    subscriptionsTitle: "Your exams",
    subscriptionsEmpty: "No exams tracked yet. Pick one before NTA surprises you.",
    addExam: "Track another exam",
    telegramConnected: "Telegram Connected ✅",
    telegramNotConnected: "Connect Telegram to receive notifications instantly.",
    removeSubscription: "Stop tracking",
    onboardingTitle: "Pick your battles",
    onboardingDescription:
      "Choose your exams and the updates you actually care about. We'll ignore the rest.",
    onboardingSubmit: "Start tracking",
    notificationsTitle: "My Notifications",
    notificationsDescription:
      "The same updates we send on Telegram — always here even if Telegram is down.",
    notificationsLoading: "Loading your updates...",
    notificationsLoadMore: "Load More",
    notificationsEmptyTitle: "🎉 You're all caught up.",
    notificationsEmptyBody:
      "No academic chaos today. We'll wake you up when something important happens.",
  },

  notifications: {
    deadline: "That deadline you planned to remember? Yeah... it's tomorrow.",
    admitCard: "Good news. No more guessing. Your admit card is live.",
    dateChange: "NTA changed the dates. Again. We've already updated them.",
    result: "Deep breath. Results are out.",
  },

  empty: {
    noUpdates: "Nothing exploded today. You're safe.",
    noSubscriptions: "No exams tracked yet. Pick one before NTA surprises you.",
  },

  cta: {
    primary: "Save me from deadlines",
    secondary: "See how it works",
    telegram: "Open Telegram bot",
    final: "Stop refreshing. Start living.",
  },

  landing: {
    exams: {
      title: "Exams we watch",
      description:
        "Official sources. Zero coaching-blog nonsense. Starting with engineering entrances.",
    },
    howItWorks: {
      title: "How Aviso works",
      description: "Three steps. No PhD required.",
    },
    features: {
      title: "Why students stick around",
      description:
        "Because missing an admit card notification is not the kind of plot twist you need.",
    },
    telegram: {
      title: "Delivered where you actually look",
      description:
        "Not email. Not another app to forget about. Telegram — loud, fast, impossible to ignore.",
    },
    testimonials: {
      title: "Don't take our word for it",
      description: "Real students. Slightly dramatic quotes. 100% relatable.",
    },
    faq: {
      title: "Questions? Obviously.",
      description: "The stuff everyone asks before they stop refreshing NTA.",
    },
    finalCta: {
      title: "Your F5 key deserves a break.",
      description:
        "Sign up, pick your exams, connect Telegram. We'll handle the rest.",
    },
  },
} as const;
