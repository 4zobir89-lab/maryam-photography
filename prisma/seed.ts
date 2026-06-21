import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Starting seed...");

  // ===== Admin User =====
  const hashedPassword = await bcrypt.hash("maryam2024", 10);
  const admin = await db.adminUser.upsert({
    where: { username: "maryam" },
    update: {},
    create: {
      username: "maryam",
      password: hashedPassword,
      name: "مريم",
    },
  });
  console.log("✅ Admin user created:", admin.username);

  // ===== Site Settings =====
  await db.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  console.log("✅ Site settings initialized");

  // ===== Philosophy Cards =====
  const philosophyCards = [
    {
      icon: "Camera",
      titleAr: "بصمة بصرية",
      titleEn: "Signature",
      descAr:
        "كل صورة تُحمل بصمتي السينمائية: ضوء دافئ، ظلال عميقة، وحكاية تُروى قبل أن يلمحها الناظر.",
      order: 1,
    },
    {
      icon: "Globe2",
      titleAr: "جذور يمنية",
      titleEn: "Yemeni Roots",
      descAr:
        "أصيل من صنعاء القديمة. أنقل تراث اليمن المعماري والإنساني إلى مشهد بصري عالمي معاصر.",
      order: 2,
    },
    {
      icon: "Award",
      titleAr: "تكريم دولي",
      titleEn: "Recognition",
      descAr:
        "أعمالي عُرضت في معارض دبي، إسطنبول، وبرلين. حائزة على جوائز Sony World Photography و National Geographic Yemen.",
      order: 3,
    },
    {
      icon: "Heart",
      titleAr: "روح الإنسان",
      titleEn: "Human Soul",
      descAr:
        "أبحث دائمًا عن اللحظة العفوية التي تنسى فيها الكاميرا — حين يظهر الناس كما هم حقًا.",
      order: 4,
    },
  ];
  for (const card of philosophyCards) {
    const existing = await db.philosophyCard.findFirst({
      where: { titleAr: card.titleAr },
    });
    if (!existing) {
      await db.philosophyCard.create({ data: card });
    }
  }
  console.log("✅ Philosophy cards seeded");

  // ===== Projects =====
  const projects = [
    {
      titleAr: "عروس صنعاء",
      titleEn: "Bride of Sana'a",
      category: "weddings",
      year: "2024",
      location: "صنعاء القديمة",
      description:
        "صورة من سلسلة تصوير الأعراس التقطتها مريم في صنعاء القديمة. تجمع اللقطة بين الضوء الطبيعي والحركة العفوية لتوثيق لحظة لا تتكرر.",
      palette1: "oklch(0.4 0.1 40)",
      palette2: "oklch(0.2 0.05 285)",
      palette3: "oklch(0.78 0.13 75)",
      motif: "bride",
      span: "tall",
      order: 1,
    },
    {
      titleAr: "وجه من حضرموت",
      titleEn: "A Face from Hadramaut",
      category: "portraits",
      year: "2024",
      location: "تريم",
      description: "بورتريه من وادي حضرموت يلتقط حكمة العمر في تفاصيل الوجه.",
      palette1: "oklch(0.5 0.08 50)",
      palette2: "oklch(0.15 0.02 30)",
      palette3: "oklch(0.85 0.1 80)",
      motif: "face",
      span: "wide",
      order: 2,
    },
    {
      titleAr: "أبراج اليمن",
      titleEn: "Yemeni Towers",
      category: "culture",
      year: "2023",
      location: "شبام حضرموت",
      description: "عمارة طينية فريدة تعود لمئات السنين في مدينة شبام حضرموت.",
      palette1: "oklch(0.55 0.12 60)",
      palette2: "oklch(0.25 0.05 40)",
      palette3: "oklch(0.9 0.08 80)",
      motif: "tower",
      span: "normal",
      order: 3,
    },
    {
      titleAr: "صحراء الربع الخالي",
      titleEn: "Empty Quarter",
      category: "landscapes",
      year: "2023",
      location: "حدود المهرة",
      description: "كثبان الربع الخالي الرملية عند الغروب الذهبي.",
      palette1: "oklch(0.6 0.1 55)",
      palette2: "oklch(0.3 0.05 35)",
      palette3: "oklch(0.85 0.12 75)",
      motif: "desert",
      span: "wide",
      order: 4,
    },
    {
      titleAr: "عرس عدني",
      titleEn: "Adeni Wedding",
      category: "weddings",
      year: "2024",
      location: "عدن",
      description: "لحظة عرس عدني على شاطئ الخليج العربي.",
      palette1: "oklch(0.45 0.15 350)",
      palette2: "oklch(0.15 0.03 320)",
      palette3: "oklch(0.85 0.1 75)",
      motif: "bride",
      span: "normal",
      order: 5,
    },
    {
      titleAr: "أمواج العرب",
      titleEn: "Tides of Arabia",
      category: "landscapes",
      year: "2023",
      location: "ساحل حضرموت",
      description: "أمواج البحر العربي على ساحل حضرموت عند الفجر.",
      palette1: "oklch(0.4 0.08 220)",
      palette2: "oklch(0.1 0.02 240)",
      palette3: "oklch(0.7 0.1 200)",
      motif: "wave",
      span: "tall",
      order: 6,
    },
    {
      titleAr: "الحكمة في العيون",
      titleEn: "Wisdom in Eyes",
      category: "portraits",
      year: "2024",
      location: "ذمار",
      description: "بورتريه لرجل كبير يختصر حكاية عمر في نظرة.",
      palette1: "oklch(0.35 0.08 30)",
      palette2: "oklch(0.1 0.01 30)",
      palette3: "oklch(0.85 0.1 70)",
      motif: "face",
      span: "normal",
      order: 7,
    },
    {
      titleAr: "سوق الملح",
      titleEn: "Salt Market",
      category: "culture",
      year: "2023",
      location: "صنعاء",
      description: "أجواء سوق الملح التراثي في صنعاء القديمة.",
      palette1: "oklch(0.5 0.1 45)",
      palette2: "oklch(0.18 0.03 30)",
      palette3: "oklch(0.78 0.13 75)",
      motif: "city",
      span: "normal",
      order: 8,
    },
    {
      titleAr: "سنديانة بلقيس",
      titleEn: "Bilqis' Oak",
      category: "landscapes",
      year: "2024",
      location: "إب",
      description: "شجرة سنديان عملاقة في جبال إب الخضراء.",
      palette1: "oklch(0.4 0.1 140)",
      palette2: "oklch(0.12 0.02 150)",
      palette3: "oklch(0.85 0.1 80)",
      motif: "tree",
      span: "normal",
      order: 9,
    },
  ];
  for (const project of projects) {
    const existing = await db.project.findFirst({
      where: { titleAr: project.titleAr },
    });
    if (!existing) {
      await db.project.create({ data: project });
    }
  }
  console.log("✅ Projects seeded");

  // ===== Services =====
  const services = [
    {
      titleAr: "تصوير الأعراس",
      titleEn: "Wedding Photography",
      description: "تغطية كاملة ليوم العرس بأسلوب سينمائي راقٍ.",
      price: "يبدأ من 1,200$",
      duration: "8 ساعات",
      features: JSON.stringify([
        "تغطية كاملة لليوم (تصوير + فيديو)",
        "جلسة قبل العرس (Pre-wedding)",
        "300 صورة معدلة بدقة عالية",
        "ألبوم فاخر مطبوع 30×40",
        "معرض إلكتروني خاص للضيوف",
        "تسليم خلال 4 أسابيع",
      ]),
      icon: "Heart",
      accentFrom: "oklch(0.78 0.13 75 / 0.15)",
      featured: true,
      order: 1,
    },
    {
      titleAr: "بورتريه فردي",
      titleEn: "Portrait Sessions",
      description: "جلسة بورتريه شخصية في الاستوديو أو الموقع.",
      price: "يبدأ من 350$",
      duration: "2 ساعة",
      features: JSON.stringify([
        "جلسة في الاستوديو أو خارجي",
        "استشارة قبل الجلسة",
        "50 صورة معدلة",
        "حقوق استخدام كاملة",
        "3 صور مطبوعة فاخرة A4",
        "تسليم خلال أسبوعين",
      ]),
      icon: "Camera",
      accentFrom: "oklch(0.55 0.1 40 / 0.12)",
      featured: false,
      order: 2,
    },
    {
      titleAr: "تصوير تجاري",
      titleEn: "Commercial",
      description: "تصوير منتجات وعلامات تجارية بأسلوب احترافي.",
      price: "يبدأ من 800$",
      duration: "حسب المشروع",
      features: JSON.stringify([
        "تصوير منتجات / علامات تجارية",
        "تصوير معماري وعقاري",
        "استخدام للإعلانات ووسائل التواصل",
        "50 صورة معدلة + RAW",
        "حقوق استخدام تجاري كامل",
        "تسليم خلال 2-3 أسابيع",
      ]),
      icon: "Building2",
      accentFrom: "oklch(0.4 0.05 285 / 0.12)",
      featured: false,
      order: 3,
    },
    {
      titleAr: "ورش عمل وتدريب",
      titleEn: "Workshops",
      description: "ورش عملية لتعليم التصوير السينمائي.",
      price: "يبدأ من 200$",
      duration: "3 أيام",
      features: JSON.stringify([
        "ورشة عملية في صنعاء",
        "أساسيات الإضاءة الطبيعية",
        "تحرير متقدم (Lightroom)",
        "شهادة إتمام الدورة",
        "مجموعة إعدادات Lightroom",
        "متابعة لمدة 3 أشهر",
      ]),
      icon: "Sparkles",
      accentFrom: "oklch(0.7 0.1 60 / 0.12)",
      featured: false,
      order: 4,
    },
  ];
  for (const service of services) {
    const existing = await db.service.findFirst({
      where: { titleAr: service.titleAr },
    });
    if (!existing) {
      await db.service.create({ data: service });
    }
  }
  console.log("✅ Services seeded");

  // ===== Testimonials =====
  const testimonials = [
    {
      quoteAr:
        "مريم لم تُصور زفافنا فحسب، بل التقطت أرواحنا. كل صورة تحكي حكاية كاملة. عندما رأينا الألبوم لأول مرة، بكينا — لقد رأت في يومنا ما لم نره نحن وسط الزحام. لمسة مريم سحرية بكل معنى الكلمة.",
      nameAr: "أحمد و سارة المطري",
      roleAr: "عرسان · صنعاء",
      roleEn: "Newlyweds",
      rating: 5,
      avatar: "أ س",
      order: 1,
    },
    {
      quoteAr:
        "كعلامة تجارية، كنا نبحث عن صورة تعبّر عن هويتنا اليمنية بأسلوب عالمي. مريم فهمت الرؤية فورًا، وأنتجت صورًا تجاوزت كل توقعاتنا. عملها رفع مستوى علامتنا التجارية بشكل ملموس.",
      nameAr: "ليلى العنسي",
      roleAr: "مديرة تسويق · Yemen Heritage",
      roleEn: "Marketing Director",
      rating: 5,
      avatar: "ل ع",
      order: 2,
    },
    {
      quoteAr:
        "حضرت ورشة عمل مريم وخرجت بتصور مختلف تمامًا عن التصوير. هي لا تُعلّم التقنية فحسب، بل تُعلّم الرؤية. بعد ثلاثة أشهر من المتابعة، تطوّر أسلوبي بطريقة لم أكن أتخيلها. استثمار يستحق كل ريال.",
      nameAr: "خالد الشميري",
      roleAr: "مصور محترف · عدن",
      roleEn: "Photographer",
      rating: 5,
      avatar: "خ ش",
      order: 3,
    },
    {
      quoteAr:
        "عملت مع مصورين كثر حول العالم، لكن مريم تمتلك نادرة: القدرة على جعل الناس ينسون الكاميرا. بورتريهها لوالدي قبل رحيله بأشهر أصبح أغلى ما أملك. شكرًا مريم على هذه الهدية.",
      nameAr: "ريم النصاري",
      roleAr: "كاتبة · دبي",
      roleEn: "Writer",
      rating: 5,
      avatar: "ر ن",
      order: 4,
    },
  ];
  for (const t of testimonials) {
    const existing = await db.testimonial.findFirst({
      where: { nameAr: t.nameAr },
    });
    if (!existing) {
      await db.testimonial.create({ data: t });
    }
  }
  console.log("✅ Testimonials seeded");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📋 Admin Login:");
  console.log("   URL: /admin");
  console.log("   Username: maryam");
  console.log("   Password: maryam2024");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
