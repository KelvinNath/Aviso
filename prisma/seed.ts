import { ExamStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ExamSeed = {
  name: string;
  slug: string;
  status: ExamStatus;
  source: {
    label: string;
    url: string;
    isActive: boolean;
  };
};

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
  },
];

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
