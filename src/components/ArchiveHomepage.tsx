"use client";

/**
 * Design reminder — «أرشيف الضوء»: الصورة هي السرد، والخطوط التحريرية
 * والمساحات العاجية واللمسات النحاسية تخدم أعمال مريم ولا تنافسها.
 */
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Aperture,
  ArrowDownLeft,
  ArrowUpLeft,
  Camera,
  Check,
  ChevronLeft,
  Instagram,
  Mail,
  Menu,
  MessageCircle,
  Send,
  X,
} from "lucide-react";

type Category = "all" | "weddings" | "portraits" | "culture";

type Work = {
  title: string;
  label: string;
  year: string;
  location: string;
  category: Exclude<Category, "all">;
  image: string;
  alt: string;
  ratio: "portrait" | "wide" | "square";
};

const works: Work[] = [
  {
    title: "عروس صنعاء",
    label: "أعراس",
    year: "2024",
    location: "صنعاء القديمة",
    category: "weddings",
    image: "/images/maryam-wedding.webp",
    alt: "صورة من مشروع عروس صنعاء ضمن أعمال مريم أمين.",
    ratio: "portrait",
  },
  {
    title: "My Home",
    label: "بورتريه",
    year: "2026",
    location: "اليمن",
    category: "portraits",
    image: "/images/maryam-home.jpg",
    alt: "صورة بورتريه من مشروع My Home لمريم أمين.",
    ratio: "square",
  },
  {
    title: "خلف العدسة",
    label: "بورتريه",
    year: "مختارات",
    location: "تعز",
    category: "portraits",
    image: "/images/maryam-profile.png",
    alt: "بورتريه مريم أمين ضمن أرشيف أعمالها الفوتوغرافية.",
    ratio: "portrait",
  },
  {
    title: "أثر المكان",
    label: "ثقافة بصرية",
    year: "مختارات",
    location: "اليمن",
    category: "culture",
    image: "/images/maryam-place.jpg",
    alt: "صورة من أرشيف مريم أمين تستحضر ذاكرة المكان والضوء.",
    ratio: "wide",
  },
];

const filters: { value: Category; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "weddings", label: "أعراس" },
  { value: "portraits", label: "بورتريه" },
  { value: "culture", label: "ثقافة" },
];

const services = [
  { no: "01", title: "تصوير الأعراس", detail: "تغطية توثيقية لطيفة ليومكم، من التفاصيل الهادئة حتى الفرح الكبير.", note: "نصمّم التغطية حسب الحكاية" },
  { no: "02", title: "جلسات بورتريه", detail: "جلسات فردية وعائلية تترك مساحة للشخصية والضوء الطبيعي.", note: "في الاستوديو أو في مكانك" },
  { no: "03", title: "قصص العلامات", detail: "صور لعلامات ومنتجات ومساحات تريد أن تُرى بصدق وذوق.", note: "لمشاريع وهوية بصرية واضحة" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ArchiveHomepage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Category>("all");
  const [lightbox, setLightbox] = useState<Work | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");

  const visibleWorks = useMemo(
    () => (activeFilter === "all" ? works : works.filter((work) => work.category === activeFilter)),
    [activeFilter],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (formState === "sending") return;
    setFormState("sending");
    try {
      const response = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: "",
          service: "طلب من الصفحة الرئيسية",
          message: formData.message,
        }),
      });
      if (!response.ok) throw new Error("Unable to save message");
      setFormData({ name: "", phone: "", message: "" });
      setFormState("success");
    } catch {
      setFormState("error");
    }
  }

  return (
    <div className="archive-site" dir="rtl">
      <a className="archive-skip-link" href="#archive-content">تجاوز إلى المحتوى</a>
      <header className="archive-header">
        <a className="archive-brand" href="#home" aria-label="مريم أمين، الصفحة الرئيسية">
          <span className="archive-brand-mark"><img src="/logo.svg" alt="علامة مريم أمين" /></span>
          <span className="archive-brand-copy"><strong>مريم أمين</strong><small>Visual storyteller</small></span>
        </a>
        <nav className="archive-desktop-nav" aria-label="التنقل الرئيسي">
          <a href="#works">الأعمال</a><a href="#about">عن مريم</a><a href="#services">الخدمات</a><a href="#contact">تواصل</a>
        </nav>
        <div className="archive-header-actions">
          <a className="archive-header-booking" href="#contact">احجزي جلسة <ArrowUpLeft size={16} /></a>
          <button className="archive-menu-trigger" type="button" aria-expanded={menuOpen} aria-controls="archive-mobile-navigation" aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"} onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <div id="archive-mobile-navigation" className={`archive-mobile-nav ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        {["الأعمال", "عن مريم", "الخدمات", "تواصل"].map((label, index) => {
          const id = ["works", "about", "services", "contact"][index];
          return <button key={id} type="button" onClick={() => { scrollToSection(id); setMenuOpen(false); }}><span>0{index + 1}</span>{label}<ArrowDownLeft size={21} /></button>;
        })}
      </div>

      <main id="archive-content">
        <section id="home" className="archive-hero">
          <div className="archive-hero-copy archive-reveal-up">
            <p className="archive-eyebrow"><span /> من تعز إلى العالم</p>
            <h1>حين يصبح<br /><em>الضوء</em> ذاكرة.</h1>
            <p className="archive-hero-intro">أصوّر الحكايات قبل الأشخاص؛ لحظات خفيفة، صادقة، وتبقى معك بعد أن تنطفئ التفاصيل.</p>
            <div className="archive-hero-actions">
              <button className="archive-primary-button" type="button" onClick={() => scrollToSection("works")}>اكتشفي الأعمال <ArrowUpLeft size={18} /></button>
              <button className="archive-text-button" type="button" onClick={() => scrollToSection("about")}>تعرفي إلى مريم <ChevronLeft size={18} /></button>
            </div>
            <div className="archive-hero-caption"><span>نظرة أولى</span><span className="archive-caption-rule" /><span>2026</span></div>
          </div>
          <figure className="archive-hero-visual archive-reveal-image">
            <img src="/images/maryam-hero-archive.jpg" alt="فناء يمني هادئ تضيئه شمس العصر وستارة كتان شفافة." />
            <figcaption><span>ضوء يحكي</span><span className="archive-hero-index">01—</span></figcaption>
          </figure>
          <div className="archive-hero-orbit" aria-hidden="true"><Aperture size={19} /><span>مريم أمين · أرشيف الضوء · مريم أمين · أرشيف الضوء · </span></div>
        </section>

        <section className="archive-discipline-strip" aria-label="مجالات العمل"><span>بورتريه</span><i /><span>أعراس</span><i /><span>حكايات مكان</span><i /><span>علامات تجارية</span><i /><span>بورتريه</span></section>

        <section id="works" className="archive-works archive-section-pad">
          <div className="archive-section-head archive-reveal-up"><div><p className="archive-eyebrow"><span /> أعمال منتقاة</p><h2>أرشيف<br /><em>الحكايات</em></h2></div><p>مشاهد من أعراس وبورتريهات وذاكرة مكان؛ كل إطار يبدأ بالإنصات لما يحدث داخله.</p></div>
          <div className="archive-filter-row" role="tablist" aria-label="تصفية الأعمال">
            {filters.map((filter) => <button key={filter.value} type="button" role="tab" aria-selected={activeFilter === filter.value} className={activeFilter === filter.value ? "is-active" : ""} onClick={() => setActiveFilter(filter.value)}>{filter.label}</button>)}
          </div>
          <div className="archive-work-grid" aria-live="polite">
            {visibleWorks.map((work, index) => <button className={`archive-work-card archive-ratio-${work.ratio}`} type="button" key={work.title} onClick={() => setLightbox(work)} aria-label={`عرض صورة ${work.title} بحجم أكبر`}>
              <img src={work.image} alt={work.alt} loading={index > 1 ? "lazy" : "eager"} decoding="async" /><span className="archive-work-wash" />
              <span className="archive-work-meta"><span>{work.label} · {work.year}</span><strong>{work.title}</strong><small>{work.location}</small></span><span className="archive-expand-token"><ArrowUpLeft size={20} /></span>
            </button>)}
          </div>
        </section>

        <section id="about" className="archive-about archive-section-pad">
          <div className="archive-about-image archive-reveal-image"><img src="/images/maryam-profile.png" alt="بورتريه مريم أمين، المصورة اليمنية." loading="lazy" decoding="async" /><span className="archive-photo-note">خلف العدسة<br />ومع الحكاية</span></div>
          <div className="archive-about-copy archive-reveal-up"><p className="archive-eyebrow"><span /> خلف العدسة</p><h2>الصورة الصادقة<br />لا تحتاج إلى <em>صوتٍ عالٍ.</em></h2><p>مريم أمين، المعروفة بلقب «أنثى مخملية»، مصورة من تعز وجدت لغتها الخاصة بين الضوء والظل وتفاصيل الحياة الصغيرة. بدأت من عدسة الهاتف، ثم اتسع الشغف إلى ممارسة تحفظ الإحساس قبل أن تحفظ المشهد.</p><p>تؤمن أن الصورة ليست مجرد مهنة؛ إنها فرصة لالتقاط أثر اللحظة كما يُعاش، وصناعة ذاكرة لا تطويها الأيام.</p><div className="archive-about-tags"><span>بورتريه</span><span>تصوير أعراس</span><span>ثقافة</span><span>فوتوجورناليزم</span></div><a className="archive-underlined-link" href="mailto:mrymamyn870@gmail.com">اكتبي إلى مريم <ArrowUpLeft size={17} /></a></div>
        </section>

        <section id="services" className="archive-services archive-section-pad">
          <div className="archive-service-intro archive-reveal-up"><p className="archive-eyebrow archive-eyebrow-light"><span /> ما الذي يمكن أن نصنعه؟</p><h2>مساحة للحكاية،<br /><em>بلا قالب جاهز.</em></h2><p>لا توجد جلسة تشبه الأخرى. نبدأ من قصتك، ونختار معًا الإيقاع والضوء والمكان.</p><a className="archive-light-link" href="#contact">أرسلي تفاصيل فكرتك <ArrowUpLeft size={17} /></a></div>
          <div className="archive-service-list">{services.map((service) => <article className="archive-service-row" key={service.no}><span className="archive-service-no">{service.no}</span><div><h3>{service.title}</h3><p>{service.detail}</p></div><span className="archive-service-note">{service.note}</span><a href="#contact" aria-label={`اطلب ${service.title}`}><ArrowUpLeft size={20} /></a></article>)}</div>
        </section>

        <section id="contact" className="archive-contact archive-section-pad">
          <div className="archive-contact-visual archive-reveal-image"><div className="archive-contact-archive" aria-hidden="true"><span className="archive-no">ملفّ / 01</span><img src="/logo.svg" alt="" /><p>مريم أمين<br /><em>أرشيف الضوء</em></p><span className="archive-line archive-line-a" /><span className="archive-line archive-line-b" /><span className="archive-stamp">رسالة<br />جديدة</span></div><div className="archive-contact-image-caption"><Camera size={16} /> نبدأ من فكرة بسيطة</div></div>
          <div className="archive-contact-card archive-reveal-up"><p className="archive-eyebrow"><span /> لنبدأ حكايتك</p><h2>قولي مرحبًا<br /><em>للضوء القادم.</em></h2><p>اكتبي فكرتك باختصار، وستصل رسالتك إلى مريم مباشرة لتتابعي معها من المكان الذي يناسبك.</p>
            <form onSubmit={submitBooking}>
              <label>الاسم<input value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="كيف تحبين أن نناديك؟" autoComplete="name" required /></label>
              <label>رقم التواصل<input value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} placeholder="مثال: 77 123 4567" inputMode="tel" autoComplete="tel" required /></label>
              <label>فكرتك أو نوع الجلسة<textarea value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} placeholder="عرس، بورتريه، أو مشروع لعلامتك..." rows={3} required /></label>
              <button className="archive-primary-button archive-form-button" type="submit" disabled={formState === "sending"}>{formState === "sending" ? "جارٍ الإرسال..." : <>أرسلي الرسالة <Send size={17} /></>}</button>
              {formState === "success" && <p className="archive-form-success"><Check size={16} /> وصلت رسالتك. ستتواصل معك مريم قريبًا.</p>}
              {formState === "error" && <p className="archive-form-error">تعذر الإرسال حاليًا. يمكنك مراسلة مريم عبر واتساب مباشرة.</p>}
            </form>
            <div className="archive-contact-links"><a href="mailto:mrymamyn870@gmail.com"><Mail size={17} /> mrymamyn870@gmail.com</a><a href="https://www.instagram.com/never11328?igsh=MWs5aDJodmVtejlkcw==" target="_blank" rel="noreferrer"><Instagram size={17} /> @never11328</a><a href="https://wa.me/967711048394" target="_blank" rel="noreferrer"><MessageCircle size={17} /> واتساب</a></div>
          </div>
        </section>
      </main>

      <footer className="archive-footer"><div className="archive-footer-brand"><img src="/logo.svg" alt="" /><span>مريم أمين</span></div><p>تصوير حكايات من القلب، للذاكرة.</p><div className="archive-footer-actions"><a href="https://www.instagram.com/never11328?igsh=MWs5aDJodmVtejlkcw==" target="_blank" rel="noreferrer" aria-label="زيارة حساب مريم على إنستغرام"><Instagram size={18} /></a><a href="mailto:mrymamyn870@gmail.com" aria-label="إرسال بريد إلى مريم"><Mail size={18} /></a><button type="button" onClick={() => scrollToSection("home")} aria-label="العودة إلى أعلى الصفحة"><ArrowUpLeft size={18} /></button></div></footer>

      {lightbox && <div className="archive-lightbox" role="dialog" aria-modal="true" aria-label={`عرض ${lightbox.title}`} onClick={() => setLightbox(null)}><div className="archive-lightbox-content" onClick={(event) => event.stopPropagation()}><button className="archive-lightbox-close" type="button" onClick={() => setLightbox(null)} aria-label="إغلاق العرض"><X size={22} /></button><img src={lightbox.image} alt={lightbox.alt} /><div><span>{lightbox.label} · {lightbox.year}</span><strong>{lightbox.title}</strong><small>{lightbox.location}</small></div></div></div>}
    </div>
  );
}
