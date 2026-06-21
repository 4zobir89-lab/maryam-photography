# مريم — Maryam Photography

موقع شخصي فاخر للمصورة اليمنية مريم بأسلوب داكن سينمائي عصري ومبتكر.

A luxury personal website for Yemeni photographer Maryam with a dark cinematic, modern, and innovative style.

## 🎬 المميزات

- ✨ تصميم داكن سينمائي فاخر (ذهبي شمبانيا + أسود عميق)
- 🌐 دعم كامل للغة العربية (RTL) مع لمسات إنجليزية أنيقة
- 📱 تصميم متجاوب بالكامل (Mobile + Desktop)
- 🎨 4 خطوط احترافية: Amiri, Playfair Display, Tajawal, Inter
- 🖼️ معرض أعمال تفاعلي مع Lightbox وتصفية بالفئات
- 💬 كاروسيل آراء العملاء
- 📝 نموذج تواصل تفاعلي
- 🎯 حركات سلسة عبر Framer Motion

## 🚀 النشر على Vercel

### الطريقة 1: عبر GitHub (موصى بها)

1. **ارفع المشروع إلى GitHub:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit: Maryam Photography website"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO-NAME.git
   git push -u origin main
   ```

2. **اربط المشروع بـ Vercel:**
   - اذهب إلى [vercel.com](https://vercel.com) وسجّل الدخول بحساب GitHub
   - اضغط **"Add New Project"**
   - اختر الـ repository الذي رفعته
   - اترك الإعدادات الافتراضية:
     - **Framework Preset**: Next.js
     - **Build Command**: `next build` (تلقائي)
     - **Output Directory**: `.next` (تلقائي)
   - اضغط **"Deploy"**

3. **انتظر 2-3 دقائق** وستحصل على رابط مباشر مثل:
   ```
   https://maryam-photography.vercel.app
   ```

### الطريقة 2: عبر Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
# اتبع التعليمات على الشاشة
vercel --prod  # للنشر النهائي
```

## 🛠️ التشغيل المحلي

```bash
# تثبيت الحزم
bun install   # أو npm install

# تشغيل خادم التطوير
bun run dev   # أو npm run dev

# فتح المتصفح على
http://localhost:3000
```

## 📁 هيكل المشروع

```
src/
├── app/
│   ├── layout.tsx        # التخطيط الرئيسي + الخطوط + RTL
│   ├── page.tsx          # الصفحة الرئيسية
│   └── globals.css       # نظام التصميم السينمائي
├── components/
│   ├── sections/         # أقسام الموقع
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Marquee.tsx
│   │   ├── Portfolio.tsx
│   │   ├── Services.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Contact.tsx
│   │   └── Footer.tsx
│   └── shared/
│       └── CursorGlow.tsx
└── lib/
    └── utils.ts
```

## 🎨 نظام الألوان

| العنصر | اللون |
|--------|-------|
| الخلفية | `oklch(0.08 0.005 285)` أسود سينمائي |
| اللون الأساسي | `oklch(0.82 0.12 80)` ذهبي شمبانيا |
| النص | `oklch(0.96 0.005 80)` أبيض دافئ |

## 📝 الترخيص

© 2024 مريم. جميع الحقوق محفوظة.
