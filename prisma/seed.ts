import { ExamCyclePhase, ExamStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Matches EXAM_CYCLE_YEAR in apps/crawler cycle-filter. */
const CURRENT_CYCLE_YEAR = 2026;

type ExamSeed = {
  name: string;
  slug: string;
  status: ExamStatus;
  source: {
    label: string;
    url: string;
    isActive: boolean;
  };
  cycle?: {
    registrationClose?: Date;
    examDate?: Date;
    counsellingClose?: Date;
    phase?: ExamCyclePhase;
    completedAt?: Date;
  };
};

function endOfDay(year: number, monthIndex: number, day: number): Date {
  return new Date(year, monthIndex, day, 23, 59, 59, 999);
}

const EXAMS: ExamSeed[] = [
  {
    name: "JEE Main",
    slug: "jee-main",
    status: ExamStatus.ACTIVE,
    source: {
      label: "Official Website",
      url: "https://jeemain.nta.nic.in/",
      isActive: true,
    },
    cycle: {
      registrationClose: endOfDay(2026, 0, 31),
      examDate: endOfDay(2026, 3, 8),
      counsellingClose: endOfDay(2026, 6, 31),
    },
  },
  {
    name: "JEE Advanced",
    slug: "jee-advanced",
    status: ExamStatus.ACTIVE,
    source: {
      label: "Official Website",
      url: "https://jeeadv.ac.in/",
      isActive: true,
    },
    cycle: {
      registrationClose: endOfDay(2026, 4, 10),
      examDate: endOfDay(2026, 4, 17),
      counsellingClose: endOfDay(2026, 6, 31),
    },
  },
  {
    name: "BITSAT",
    slug: "bitsat",
    status: ExamStatus.ACTIVE,
    source: {
      label: "Official Website",
      url: "https://www.bitsadmission.com/BITSAT_LP/index.html",
      isActive: true,
    },
  },
  {
    name: "VITEEE",
    slug: "viteee",
    status: ExamStatus.ACTIVE,
    source: {
      label: "Official Website",
      url: "https://viteee.vit.ac.in/",
      isActive: true,
    },
  },
  {
    name: "COMEDK UGET",
    slug: "comedk-uget",
    status: ExamStatus.ACTIVE,
    source: {
      label: "Official UGET Portal",
      url: "https://www.comedk.org/about-uget-and-notification-2026",
      isActive: true,
    },
    cycle: {
      examDate: endOfDay(2026, 4, 9),
      counsellingClose: endOfDay(2026, 6, 30),
    },
  },
  {
    name: "MHT CET",
    slug: "mht-cet",
    status: ExamStatus.ACTIVE,
    source: {
      label: "Official Website",
      url: "https://cetcell.mahacet.org/",
      isActive: true,
    },
  },
  {
    name: "WBJEE",
    slug: "wbjee",
    status: ExamStatus.ACTIVE,
    source: {
      label: "Official WBJEE Portal",
      url: "https://wbjeeb.nic.in/wbjee/",
      isActive: true,
    },
  },
  {
    name: "KCET",
    slug: "kcet",
    status: ExamStatus.ACTIVE,
    source: {
      label: "Official KEA Portal",
      url: "https://cetonline.karnataka.gov.in/kea/",
      isActive: true,
    },
  },
  {
    name: "MET",
    slug: "met",
    status: ExamStatus.ACTIVE,
    source: {
      label: "MET 2026 Overview",
      url: "https://www.manipal.edu/mu/admission/indian-students/online-entrance-exam-overview/overview.html",
      isActive: true,
    },
  },
  {
    name: "SRMJEEE",
    slug: "srmjeee",
    status: ExamStatus.ACTIVE,
    source: {
      label: "SRMJEEE B.Tech Applications",
      url: "https://applications.srmist.edu.in/btech",
      isActive: true,
    },
    cycle: {
      registrationClose: endOfDay(2026, 3, 16),
      examDate: endOfDay(2026, 3, 24),
    },
  },
  {
    name: "KIITEE",
    slug: "kiitee",
    status: ExamStatus.ARCHIVED,
    source: {
      label: "Official Portal",
      url: "https://kiitee.kiit.ac.in/",
      isActive: false,
    },
    cycle: {
      phase: ExamCyclePhase.COMPLETE,
      completedAt: endOfDay(2026, 0, 1),
    },
  },
];

async function upsertExamCycle(
  examId: string,
  cycleSeed: NonNullable<ExamSeed["cycle"]>,
): Promise<void> {
  const milestones = {
    registrationClose: cycleSeed.registrationClose ?? null,
    examDate: cycleSeed.examDate ?? null,
    counsellingClose: cycleSeed.counsellingClose ?? null,
  };

  const phase =
    cycleSeed.phase ??
    (milestones.counsellingClose &&
    milestones.counsellingClose.getTime() < Date.now()
      ? ExamCyclePhase.COMPLETE
      : ExamCyclePhase.REGISTRATION);

  await prisma.examCycle.upsert({
    where: {
      examId_cycleYear: {
        examId,
        cycleYear: CURRENT_CYCLE_YEAR,
      },
    },
    create: {
      examId,
      cycleYear: CURRENT_CYCLE_YEAR,
      phase,
      ...milestones,
      completedAt:
        phase === ExamCyclePhase.COMPLETE
          ? (cycleSeed.completedAt ?? new Date())
          : null,
    },
    update: {
      phase,
      registrationClose: milestones.registrationClose,
      examDate: milestones.examDate,
      counsellingClose: milestones.counsellingClose,
      completedAt:
        phase === ExamCyclePhase.COMPLETE
          ? (cycleSeed.completedAt ?? new Date())
          : null,
    },
  });
}

async function upsertExamWithSource(examSeed: ExamSeed): Promise<void> {
  const exam = await prisma.exam.upsert({
    where: { slug: examSeed.slug },
    update: {
      name: examSeed.name,
      status: examSeed.status,
    },
    create: {
      name: examSeed.name,
      slug: examSeed.slug,
      status: examSeed.status,
    },
  });

  const existingSource = await prisma.examSource.findFirst({
    where: {
      examId: exam.id,
      url: examSeed.source.url,
    },
  });

  if (existingSource) {
    await prisma.examSource.update({
      where: { id: existingSource.id },
      data: {
        label: examSeed.source.label,
        isActive: examSeed.source.isActive,
      },
    });
  } else {
    await prisma.examSource.create({
      data: {
        examId: exam.id,
        label: examSeed.source.label,
        url: examSeed.source.url,
        isActive: examSeed.source.isActive,
      },
    });
  }

  if (examSeed.status === ExamStatus.ACTIVE || examSeed.cycle) {
    await upsertExamCycle(exam.id, examSeed.cycle ?? {});
  }

  console.log(
    `Seeded exam: ${exam.name} (${exam.slug}) [${examSeed.status}] — ${examSeed.source.url}`,
  );
}

async function main(): Promise<void> {
  for (const examSeed of EXAMS) {
    await upsertExamWithSource(examSeed);
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
