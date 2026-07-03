# PRD — Maryam Photography Website Rebuild

## 1. المشكلة الحالية (Reality Check)

بعد فحص الموقع المنشور باللقطات والتحليل البصري:

### مشاكل حرجة
1. **التكرار في الفوتر**: "مريم" يظهر 4 مرات (logo + brand name + decorative wordmark + copyright)، نفس الروابط مكررة في أعمدة مختلفة، النشرة البريدية + معلومات التواصل + الروابط = حشو
2. **التكرار في الـ Hero**: "مريم" يظهر كعنوان ضخم + في الشعار + في الوصف، نفس المعلومات في navbar و hero
3. **عدم اتساق المسافات**: بعض الأقسام `py-28` وبعضها `py-40` بدون منطق
4. **التناقض اللوني**: ذهب في كل مكان (borders + backgrounds + text) بدل استخدامه كـ accent فقط
5. **التداخل**: في قسم Contact، حقول النموذج تتداخل بصرياً مع معلومات التواصل
6. **الحشو**: كل قسم له header + subtitle + description = 3 طبقات نصية قبل المحتوى الفعلي
7. **عدم التناسق**: بعض البطاقات border-border، بعضها border-primary، بدون منطق

### ما يجب أن يكون
موقع تصوير فوتوغرافي **بسيط، أنيق، هادئ** — مثل معرض فني، ليس لوحة تحكم SaaS.

---

## 2. الرؤية (Vision)

> "موقع يجعل الزائر يتنفس ببطء. مساحات بيضاء واسعة. صور تتنفس. ذهب كلمحة، ليس كطلاء. typography كشعر، ليس كصياح."

**المرجعية البصرية**: مواقع مثل:
- chasejarvis.com (مصور محترف)
- annieleibovitz.com (بساطة نقية)
- magnumphotos.com (editorial قوي)

** NOT مرجعية**: مواقع SaaS المضيئة بالنيون.

---

## 3. مبادئ التصميم (Design Principles)

### 3.1 المساحات (Whitespace)
- كل قسم: `py-32 md:py-48` (متناسق)
- بين العناصر داخل القسم: `gap-8` للصغير، `gap-16` للمتوسط، `gap-24` للكبير
- الحاويات: `max-w-6xl` (ليس 7xl — أضيق = أكثر تركيزاً)

### 3.2 الألوان (Color)
- **الخلفية**: `oklch(10% 0.003 285)` — أسود فحمي دافئ، NOT charcoal
- **الذهب**: كـ accent فقط (روابط، أزرار، أرقام) — NEVER كخلفية أو border افتراضي
- **الحدود**: `oklch(100% 0 0 / 0.06)` — شفافة تقريباً، بالكاد مرئية
- **النص**: foreground للعناوين، muted-foreground للوصف، faint للـ meta

### 3.3 Typography (Hierarchy)
- **Display** (font-amiri): للأسماء فقط — "مريم"، عناوين الأقسام. weight 700.
- **Headline** (font-amiri): عناوين البطاقات. weight 700. أصغر من display.
- **Body** (font-tajawal): الفقرات. weight 400. line-height 1.8.
- **Meta** (font-inter): labels، تواريخ، أرقام. uppercase + letter-spacing.
- **قاعدة**: لا أكثر من 3 أحجام خط في نفس القسم.

### 3.4 الحركة (Motion)
- easing واحد: `cubic-bezier(0.22, 0.61, 0.36, 1)`
- مدة: 0.4s للـ hover، 0.8s للـ scroll reveal
- NO bounce، NO elastic، NO infinite pulsing (إلا للـ scroll indicator)

### 3.5 الصور (Images)
- aspect ratio طبيعي (لا إجبار على 4/3)
- lazy loading + decoding async
- hover: scale 1.02 فقط (NOT 1.1)
- لا overlays ثقيلة — gradient خفيف من الأسفل فقط

---

## 4. هيكل الصفحة (Page Structure)

### 4.1 Navbar (ثابت علوي)
- شفاف في الأعلى → أسود شبه شفاف عند التمرير
- الشعار (يمين RTL): دائرة صغيرة + "مريم" صغير
- الروابط (وسط): 5 روابط فقط — الرئيسية، الأعمال، عن، المدونة، تواصل
- CTA (يسار): "احجزي" — زر ذهبي صغير
- mobile: hamburger → overlay بسيط

### 4.2 Hero (شاشة كاملة)
- **لا مركزي** — غير متماثل
- عمود يسار (60%): 
  - tagline صغير علوي (eyebrow)
  - "مريم" بحجم ضخم (font-amiri، weight 700، ~10rem)
  - وصف فقرة واحدة (3 أسطر max)
  - زر واحد فقط: "استكشفي الأعمال"
- عمود يمين (40%):
  - صورة عمودية (aspect 3/4)
  - OR SVG احتياطي (aperture diagram)
- **لا إحصائيات في hero** — تذهب لقسم منفصل أو تُحذف
- **لا scroll indicator** — زائد

### 4.3 About (قسم واحد متناسق)
- **لا header منفصل** — يبدأ مباشرة بالصورة + النص
- عمودين: صورة (5/12) + نص (7/12)
- النص: heading واحد + فقرتان + tags inline + توقيع
- **لا philosophy cards** — تُدمج في النص أو تُحذف (YAGNI)

### 4.4 Marquee (شريط كلمات)
- بسيط: خلفية مختلفة قليلاً + كلمات تتحرك
- NO stars، NO diamonds — فقط كلمات + مسافة

### 4.5 Portfolio (المعرض)
- **لا header كبير** — عنوان واحد + filter
- masonry grid: 3 أعمدة
- بطاقات: صورة + caption خفيف في الأسفل (يظهر عند hover فقط)
- lightbox: fullscreen + معلومات

### 4.6 Services (الخدمات)
- 3 باقات فقط (NOT 4) — Basic / Signature / Premium
- بطاقات أفقية (NOT عمودية) — كل باقة صف كامل
- كل صف: اسم + سعر + features (inline) + CTA

### 4.7 Testimonials (الآراء)
- **لا carousel** — عرض شبكي بسيط (3 آراء)
- كل رأي: اقتباس + اسم + دور + صورة (إن وجدت)
- **لا stats bar** — تُحذف (YAGNI)

### 4.8 Contact (التواصل)
- **عمود واحد** (NOT عمودين)
- heading قصير + نموذج بسيط
- حقول: اسم، هاتف، رسالة — فقط (NOT 5 حقول)
- معلومات التواصل أسفل النموذج (inline، NOT cards)

### 4.9 Footer (بسيط جداً)
- **لا أعمدة** — صف واحد
- يسار: شعار + copyright
- وسط: 4 روابط فقط
- يمين: social icons + "احجزي" button
- **لا newsletter** (YAGNI — مريم مصورة، ليست شركة SaaS)
- **لا decorative wordmark** — زائد
- توقيع المطور في صف منفصل أسفل

---

## 5. البنية التقنية

### 5.1 الملفات
```
src/
  app/
    globals.css         (نظام تصميم متماسك)
    layout.tsx          (fonts + metadata)
    page.tsx            (تركيب الأقسام)
  components/
    sections/
      Navbar.tsx
      Hero.tsx
      About.tsx
      Marquee.tsx
      Portfolio.tsx
      Services.tsx
      Testimonials.tsx
      Contact.tsx
      Footer.tsx
```

### 5.2 القيود
- لا next/image (Vercel Blob URLs)
- لا glassmorphism
- لا dark-glow orbs
- لا CursorGlow
- لا ScrollProgress
- لا BackToTop مكرر
- Arabic RTL
- Tailwind 4 + Framer Motion

---

## 6. معايير النجاح

- [ ] لا تكرار نصوص (كل نص يظهر مرة واحدة فقط)
- [ ] مسافات متناسقة (كل الأقسام نفس py)
- [ ] ذهب كـ accent فقط (<= 5 استخدامات في الصفحة)
- [ ] typography hierarchy واضح (3 أحجام max per section)
- [ ] لا حشو (كل عنصر له وظيفة)
- [ ] تحميل سريع (< 2s)
- [ ] mobile responsive كامل
- [ ] npx tsc --noEmit = 0 errors
- [ ] npx next build = success

---

## 7. خطة التنفيذ

1. بناء globals.css جديد (بسيط، متماسك)
2. بناء كل مكوّن من الصفر وفق PRD
3. فحص بصري باللقطات
4. نشر
