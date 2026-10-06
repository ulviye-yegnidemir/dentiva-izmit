import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ArrowDownRight,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  Download,
  ChevronRight,
  Clock3,
  HeartPulse,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
  X,
} from 'lucide-react'
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa6'
import heroPhoto from '@/assets/dentiva-hero-clinic.jpg'
import drAylin from '@/assets/dentiva-doctor-aylin.jpg'
import drEmre from '@/assets/dentiva-doctor-emre.jpg'
import drSelin from '@/assets/dentiva-doctor-selin.jpg'
import { createAppointment } from '@/server/appointments'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'DENTIVA İzmit | Modern Diş Kliniği ve Online Randevu' },
      {
        name: 'description',
        content:
          'İzmit, Kocaeli’de Dentiva Ağız ve Diş Sağlığı Kliniği. İmplant, estetik diş hekimliği, ortodonti ve daha fazlası için online randevu alın.',
      },
    ],
  }),
  component: HomePage,
})

const doctors = [
  { name: 'Dt. Aylin Demir', specialty: 'Protez ve implantoloji', image: drAylin, bio: 'Her tedavide önce sizi dinleyen, işlev ve estetiği birlikte gözeten bir yaklaşım.' },
  { name: 'Dt. Emre Yılmaz', specialty: 'Ortodonti', image: drEmre, bio: 'Çocuklar ve yetişkinler için kişiye özel, konforlu ortodontik tedavi planları.' },
  { name: 'Dt. Selin Kaya', specialty: 'Çocuk diş hekimliği', image: drSelin, bio: 'Minik hastaların kendini güvende hissettiği, sakin ve oyun dostu bir yaklaşım.' },
] as const

const treatments = [
  { name: 'İmplant Tedavisi', icon: Stethoscope, bookingTreatment: 'İmplant', description: 'Eksik dişler için işlevi ve doğal görünümü gözeten kişiye özel çözümler.', detail: 'Diş implantları, eksik dişlerin yerini alan tedavi seçeneklerinden biridir. Hekim, ağız ve kemik yapınızı muayene ederek sizin için uygun seçenekleri ve tedavi takvimini açıklar.' },
  { name: 'Estetik Diş Hekimliği', icon: Sparkles, bookingTreatment: 'Diğer', description: 'Gülüş tasarımı ve estetik uygulamalarla size özgü bir gülüş.', detail: 'Gülüş tasarımı; dişlerin görünümü, yüz yapısı ve beklentileriniz birlikte değerlendirilerek planlanır. Uygulanabilecek seçenekler muayene sonrasında hekiminizle birlikte belirlenir.' },
  { name: 'Diş Beyazlatma', icon: Smile, bookingTreatment: 'Diş Beyazlatma', description: 'Diş yapınıza uygun profesyonel beyazlatma seçenekleri.', detail: 'Profesyonel beyazlatma seçenekleri, diş ve diş eti sağlığınız değerlendirildikten sonra planlanır. Hekiminiz beklenen sonucu ve size uygun yaklaşımı muayenede paylaşır.' },
  { name: 'Ortodonti', icon: ArrowRight, bookingTreatment: 'Ortodonti', description: 'Daha dengeli bir gülüş için çocuklara ve yetişkinlere özel planlama.', detail: 'Ortodontik değerlendirmede diş dizilimi ve kapanış ilişkisi incelenir. Şeffaf plak veya diğer ortodontik seçeneklerin uygunluğu hekim muayenesiyle belirlenir.' },
  { name: 'Kanal Tedavisi', icon: HeartPulse, bookingTreatment: 'Kanal Tedavisi', description: 'Dişi korumayı hedefleyen, dikkatli ve konforlu tedavi yaklaşımı.', detail: 'Kanal tedavisi, dişin iç dokusu etkilendiğinde dişi korumaya yönelik olarak değerlendirilebilir. Tanı ve tedavi planı klinik muayene ve gerekli görüntülemelerle oluşturulur.' },
  { name: 'Çocuk Diş Hekimliği', icon: Smile, bookingTreatment: 'Çocuk Diş Hekimliği', description: 'Çocukların ağız sağlığına, güvenine ve rahatlığına odaklanan bakım.', detail: 'Çocuk diş hekimliği kontrolleri, çocukların yaşına ve ihtiyaçlarına uygun şekilde yürütülür. Aileyle birlikte koruyucu bakım alışkanlıkları ve takip planı konuşulur.' },
  { name: 'Genel Diş Tedavileri', icon: ShieldCheck, bookingTreatment: 'Muayene', description: 'Kontrol, temizlik ve koruyucu diş hekimliği için güvenilir destek.', detail: 'Düzenli ağız ve diş sağlığı kontrolleri, olası ihtiyaçların erken değerlendirilmesine yardımcı olur. Muayenenizde bulgular ve uygun bakım seçenekleri sizinle paylaşılır.' },
] as const
const appointmentTreatments = ['İmplant', 'Diş Beyazlatma', 'Ortodonti', 'Kanal Tedavisi', 'Çocuk Diş Hekimliği', 'Muayene', 'Diğer'] as const
const slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '13:00', '13:30', '14:00', '15:00', '16:00', '17:00', '18:00'] as const
type BookingTreatment = (typeof appointmentTreatments)[number]
type BookingDoctor = 'Fark etmez / İlk müsait hekim' | (typeof doctors)[number]['name']
const doctorsForBooking: readonly BookingDoctor[] = ['Fark etmez / İlk müsait hekim', ...doctors.map((doctor) => doctor.name)]
const navLinks = [
  ['Ana Sayfa', '#anasayfa'],
  ['Hakkımızda', '#hakkimizda'],
  ['Tedaviler', '#tedaviler'],
  ['Hekimlerimiz', '#hekimler'],
  ['İletişim', '#iletisim'],
]

function todayInTurkey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(new Date())
}
function formatDate(date: string) {
  if (!date) return '—'
  return new Date(`${date}T12:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}
function isPastSlot(date: string, time: string) {
  if (date !== todayInTurkey()) return false
  const now = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date())
  return time <= now
}
function jumpToBooking() {
  document.getElementById('randevu')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [step, setStep] = useState(1)
  const [treatment, setTreatment] = useState<BookingTreatment | ''>('')
  const [doctor, setDoctor] = useState<BookingDoctor | ''>('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState<(typeof slots)[number] | ''>('')
  const [patient, setPatient] = useState({ patientName: '', phone: '', email: '', note: '', consent: false })
  const [busy, setBusy] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [treatmentDetail, setTreatmentDetail] = useState<(typeof treatments)[number] | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!treatmentDetail) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTreatmentDetail(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [treatmentDetail])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const clearAfterChange = () => setBookingError('')
  const next = () => {
    clearAfterChange()
    if (step === 1 && !treatment) return setBookingError('Lütfen bir tedavi seçin.')
    if (step === 2 && !doctor) return setBookingError('Lütfen bir hekim seçin.')
    if (step === 3 && !date) return setBookingError('Lütfen takvimden uygun bir gün seçin.')
    if (step === 4 && !time) return setBookingError('Lütfen uygun bir saat seçin.')
    if (step === 5) {
      const form = document.getElementById('patient-form') as HTMLFormElement | null
      if (!form?.reportValidity()) return
      if (!patient.consent) return setBookingError('Randevu talebiniz için onay kutusunu işaretleyin.')
    }
    setStep((current) => Math.min(current + 1, 6))
  }
  const submitBooking = async () => {
    if (busy) return
    if (!treatment || !doctor || !date || !time || !patient.consent) {
      setBookingError('Lütfen randevu bilgilerinizi tamamlayıp onay kutusunu işaretleyin.')
      return
    }
    setBusy(true)
    setBookingError('')
    const reference = `DNT-${new Date().getFullYear()}-${crypto.randomUUID().replaceAll('-', '').slice(0, 6).toUpperCase()}`
    try {
      const result = await createAppointment({
        data: {
          reference, treatment, doctor, appointmentDate: date, appointmentTime: time,
          patientName: patient.patientName, phone: patient.phone, email: patient.email,
          note: patient.note, consent: true,
        },
      })
      if (!result.success) {
        setBookingError('Bu saat artık uygun değil veya klinik bu saatte kapalı. Lütfen başka bir saat seçin.')
        setStep(4)
        setTime('')
        return
      }
      sessionStorage.setItem('dentiva-confirmed-reference', reference)
      await navigate({ to: '/randevu/$reference', params: { reference } })
    } catch {
      setBookingError('Randevu şu an oluşturulamadı. Lütfen tekrar deneyin ya da kliniğimizi arayın.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main id="anasayfa">
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="header-inner">
          <a className="wordmark" href="#anasayfa" aria-label="Dentiva ana sayfa"><span>DENT</span><span className="wordmark-accent">IVA</span><small>İZMİT · KOCAELİ</small></a>
          <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`} aria-label="Ana menü">
            {navLinks.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
          </nav>
          <div className="header-actions">
            <a className="header-phone" href="tel:+902625550124"><Phone size={15} /> <span>0 (262) 555 01 24</span></a>
            <button className="button button-small" onClick={jumpToBooking}>Randevu Al <ArrowRight size={16} /></button>
          </div>
          <button className="mobile-menu-toggle" aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <img className="hero-image" src={heroPhoto} alt="Dentiva kliniğinde hekim ve hasta, tedavi öncesi görüşme yapıyor" />
        <div className="hero-shade" />
        <div className="hero-content">
          <div className="eyebrow eyebrow-light"><span /> İZMİT’TE GÜVENLE GÜLÜMSEYİN</div>
          <h1 id="hero-title">Gülüşünüz Bizim<br />İçin <em>Değerli.</em></h1>
          <p>Modern diş hekimliği teknolojileri ve kişiye özel tedavi yaklaşımıyla sağlıklı gülüşler için yanınızdayız.</p>
          <div className="hero-buttons">
            <button className="button button-light" onClick={jumpToBooking}>Randevu Al <ArrowRight size={18} /></button>
            <a className="button button-outline-light" href="tel:+902625550124"><Phone size={17} /> Bizi Arayın</a>
          </div>
          <div className="hero-note"><ShieldCheck size={17} /> Size özel, özenli bir tedavi deneyimi</div>
        </div>
        <div className="hero-photo-caption"><span>01</span><span>Önce sizi dinliyoruz.</span><ArrowDownRight size={20} /></div>
      </section>

      <div className="trust-strip"><div><span className="trust-icon"><HeartPulse size={20} /></span><p><strong>Size özel yaklaşım</strong><small>Her gülüş kendine özgü</small></p></div><div><span className="trust-icon"><Sparkles size={20} /></span><p><strong>Modern tedavi</strong><small>Güncel diş hekimliği</small></p></div><div><span className="trust-icon"><Clock3 size={20} /></span><p><strong>Kolay randevu</strong><small>Size uygun zamanı seçin</small></p></div><div><span className="trust-icon"><MapPin size={20} /></span><p><strong>İzmit, Kocaeli</strong><small>Merkezi konum</small></p></div></div>

      <section className="about-section section-wrap" id="hakkimizda">
        <div className="about-mark"><span>Sağlıklı gülüşler,<br /><i>mutlu yarınlar.</i></span><div className="about-mark-line" /><small>DENTIVA · İZMİT</small></div>
        <div className="about-copy"><div className="eyebrow">DENTIVA’YA HOŞ GELDİNİZ</div><h2>İyi bir tedavi,<br />iyi hissettirir.</h2><p>Kliniğimizde ilk adım, sizi ve ihtiyaçlarınızı anlamak. Tedavi sürecini birlikte planlıyor; her aşamada anlaşılır bilgi, nazik bir yaklaşım ve konforlu bir deneyim sunmayı önemsiyoruz.</p><p>Koruyucu diş hekimliğinden kapsamlı tedavilere kadar, sağlıklı gülüşünüz için buradayız.</p><a className="text-link" href="#hekimler">Ekibimizle tanışın <ArrowRight size={17} /></a></div>
      </section>

      <section className="treatments-section" id="tedaviler"><div className="section-wrap">
        <div className="section-heading"><div><div className="eyebrow">GÜLÜŞÜNÜZE UYGUN BAKIM</div><h2>İhtiyacınız olan<br />her tedavi, <em>tek çatı altında.</em></h2></div><p>İhtiyacınızı birlikte değerlendiriyor, size en uygun tedavi yolunu özenle belirliyoruz.</p></div>
        <div className="treatment-grid">{treatments.map((item, index) => { const Icon = item.icon; return <article key={item.name} className={`treatment-card ${index === 0 ? 'treatment-featured' : ''}`}><div className="treatment-card-top"><span className="treatment-icon"><Icon size={22} strokeWidth={1.7} /></span><span className="treatment-index">{String(index + 1).padStart(2, '0')}</span></div><h3>{item.name}</h3><p>{item.description}</p><button className="text-link" onClick={() => setTreatmentDetail(item)}>Detaylı Bilgi <ArrowRight size={16} /></button></article> })}</div>
        <div className="all-treatments-note"><span>Aradığınız tedaviyi bulamadınız mı?</span><button className="text-link" onClick={() => { setTreatment('Diğer'); jumpToBooking() }}>Bize danışın <ArrowRight size={16} /></button></div>
      </div></section>

      <section className="doctor-section section-wrap" id="hekimler"><div className="section-heading doctor-heading"><div><div className="eyebrow">DENTIVA’NIN HEKİMLERİ</div><h2>İyi hissettiren bir<br />ekip, <em>yanınızda.</em></h2></div><p>Her adımda sizi dinleyen ve tedavi sürecinizi birlikte planlayan hekimlerimizle tanışın.</p></div><div className="doctor-grid">{doctors.map((doctor, index) => <article className="doctor-card" key={doctor.name}><div className="doctor-photo-wrap"><img src={doctor.image} alt={`${doctor.name}, ${doctor.specialty} uzmanı`} /><span className="doctor-count">0{index + 1}</span></div><div className="doctor-meta"><div><h3>{doctor.name}</h3><span>{doctor.specialty}</span></div><p>{doctor.bio}</p><button className="doctor-book" aria-label={`${doctor.name} ile randevu al`} onClick={() => { setDoctor(doctor.name); jumpToBooking() }}><ArrowRight size={19} /></button></div></article>)}</div><p className="demo-caption">Hekim profilleri demo amaçlıdır.</p></section>

      <section className="interlude"><div className="interlude-inner"><div><div className="eyebrow eyebrow-light">KÜÇÜK BİR ADIM, GÜZEL BİR BAŞLANGIÇ</div><h2>Gülüşünüz için<br /><em>iyi bir başlangıç.</em></h2></div><div className="interlude-action"><p>Size uygun günü ve saati seçin. Randevu talebiniz birkaç adımda hazır.</p><button className="button button-light" onClick={jumpToBooking}>Online randevu al <ArrowRight size={18} /></button></div><span className="interlude-outline" aria-hidden="true">D</span></div></section>

      <section className="booking-section" id="randevu"><div className="booking-wrap"><div className="booking-intro"><div className="eyebrow">ONLINE RANDEVU</div><h2>Size uygun zamanı<br /><em>birlikte bulalım.</em></h2><p>Tercihlerinizi seçin, bilgilerinizi ekleyin. Randevu talebinizi hemen oluşturalım.</p><div className="booking-assurance"><ShieldCheck size={19} /><span>Demo olarak kaydedilir.<br /><small>Gerçek kişisel veya sağlık bilgisi girmeyin.</small></span></div><div className="booking-contact"><Phone size={17} /><span>Yardım mı gerekiyor?</span><a href="tel:+902625550124">0 (262) 555 01 24</a></div></div>
        <div className="booking-card"><div className="booking-card-head"><div><span className="booking-overline">RANDEVU TALEBİ</span><h3>{step === 6 ? 'Kontrol ve onay' : ['Tedavi seçin', 'Hekiminizi seçin', 'Gün seçin', 'Saat seçin', 'Bilgileriniz', 'Kontrol ve onay'][step - 1]}</h3></div><span className="booking-step-number">{String(step).padStart(2, '0')} <i>/ 06</i></span></div><div className="step-track" aria-label={`Adım ${step}, toplam 6`}>{[1, 2, 3, 4, 5, 6].map((number) => <span key={number} className={number <= step ? 'step-done' : ''} />)}</div>
          {step === 1 && <div className="booking-step"><p className="field-label">Hangi tedavi için randevu istiyorsunuz?</p><div className="option-grid">{appointmentTreatments.map((name) => <button type="button" key={name} className={`option-tile ${treatment === name ? 'selected' : ''}`} onClick={() => { setTreatment(name); clearAfterChange() }}>{name}{treatment === name && <Check size={17} />}</button>)}</div></div>}
          {step === 2 && <div className="booking-step"><p className="field-label">Tercih ettiğiniz hekimi seçin</p><div className="doctor-options">{doctorsForBooking.map((name, index) => <button type="button" className={`doctor-option ${doctor === name ? 'selected' : ''}`} key={name} onClick={() => { setDoctor(name); clearAfterChange() }}><span className="doctor-option-mark">{index === 0 ? <Sparkles size={18} /> : name.split(' ').slice(1).map((part) => part[0]).join('').slice(0, 2)}</span><span><strong>{name}</strong><small>{index === 0 ? 'Hekim tercihi olmadan talep' : doctors[index - 1]?.specialty}</small></span>{doctor === name && <Check size={17} />}</button>)}</div></div>}
          {step === 3 && <div className="booking-step"><label className="field-label" htmlFor="appointment-date">Uygun olduğunuz günü seçin</label><div className="date-control"><CalendarDays size={19} /><input id="appointment-date" type="date" min={todayInTurkey()} value={date} onChange={(event) => { setDate(event.target.value); setTime(''); clearAfterChange() }} /></div><p className="field-hint">Geçmiş tarihler seçilemez. Saatler klinik çalışma saatleri içinden sunulur.</p></div>}
          {step === 4 && <div className="booking-step"><p className="field-label">{formatDate(date)} · uygun bir saat seçin</p><div className="slot-grid">{slots.map((slot) => { const past = isPastSlot(date, slot); return <button type="button" key={slot} disabled={past} className={`slot-option ${time === slot ? 'selected' : ''} ${past ? 'slot-unavailable' : ''}`} onClick={() => { setTime(slot); clearAfterChange() }}><span>{slot}</span><small>{past ? 'Geçti' : 'Seçilebilir'}</small></button> })}</div><p className="field-hint">Dolu veya klinikçe kapatılmış saatler randevu kaydı sırasında doğrulanır; uygun değilse başka bir saat seçebilirsiniz.</p></div>}
          {step === 5 && <form id="patient-form" className="booking-step patient-form" onSubmit={(event) => event.preventDefault()}><div className="input-row"><label>Ad Soyad<input autoComplete="name" required minLength={3} maxLength={120} value={patient.patientName} onChange={(event) => setPatient({ ...patient, patientName: event.target.value })} placeholder="Adınız ve soyadınız" /></label><label>Telefon<input autoComplete="tel" required type="tel" minLength={7} maxLength={30} value={patient.phone} onChange={(event) => setPatient({ ...patient, phone: event.target.value })} placeholder="05__ ___ __ __" /></label></div><label>E-posta<input autoComplete="email" required type="email" maxLength={180} value={patient.email} onChange={(event) => setPatient({ ...patient, email: event.target.value })} placeholder="ornek@eposta.com" /></label><label>Kısa not / şikayet <span className="optional">(isteğe bağlı)</span><textarea maxLength={500} rows={3} value={patient.note} onChange={(event) => setPatient({ ...patient, note: event.target.value })} placeholder="Randevunuz için paylaşmak istediğiniz kısa bir not" /></label><label className="consent-check"><input type="checkbox" checked={patient.consent} onChange={(event) => setPatient({ ...patient, consent: event.target.checked })} /><span><strong>KVKK bilgilendirmesini okudum ve onaylıyorum.</strong><small>Portföy demosudur; gerçek kişisel veya sağlık bilgisi girmeyin.</small></span></label></form>}
          {step === 6 && <div className="booking-step review-list"><ReviewRow label="Tedavi" value={treatment} /><ReviewRow label="Hekim" value={doctor} /><ReviewRow label="Tarih" value={formatDate(date)} /><ReviewRow label="Saat" value={time} /><ReviewRow label="Ad Soyad" value={patient.patientName} /><ReviewRow label="Telefon" value={patient.phone} /><ReviewRow label="E-posta" value={patient.email} /></div>}
          {bookingError && <p className="form-error" role="alert">{bookingError}</p>}
          <div className="booking-controls">{step > 1 && <button className="back-button" type="button" onClick={() => { setBookingError(''); setStep(step - 1) }}><ChevronLeft size={17} /> Geri</button>}{step < 6 ? <button className="button booking-next" type="button" onClick={next}>Devam et <ChevronRight size={17} /></button> : <button className="button booking-next" type="button" disabled={busy} onClick={submitBooking}>{busy ? 'Randevunuz oluşturuluyor…' : 'Randevuyu Onayla'} {!busy && <Check size={17} />}</button>}</div>
          <div className="booking-safe"><ShieldCheck size={15} /> Demo proje · Lütfen gerçek kişisel veya sağlık bilgisi paylaşmayın.</div>
        </div>
      </div></section>

      <section className="contact-section section-wrap" id="iletisim"><div className="contact-copy"><div className="eyebrow">BİZİ BULUN</div><h2>İyi bir gülüş,<br /><em>yakınınızda.</em></h2><p>Randevu ve sorularınız için bize ulaşın. Dentiva, İzmit’te sizi bekliyor.</p><div className="contact-details"><div><span className="contact-icon"><MapPin size={19} /></span><p><small>ADRES</small><strong>İzmit / Kocaeli</strong><span>Dentiva Ağız ve Diş Sağlığı Kliniği<br /><i>Adres demo bilgidir.</i></span></p></div><div><span className="contact-icon"><Phone size={19} /></span><p><small>TELEFON</small><a href="tel:+902625550124">0 (262) 555 01 24</a><span>Demo iletişim bilgisidir.</span></p></div><div><span className="contact-icon"><CalendarDays size={19} /></span><p><small>E-POSTA</small><a href="mailto:merhaba@dentiva.demo">merhaba@dentiva.demo</a><span>Demo iletişim bilgisidir.</span></p></div></div><a className="button whatsapp-button" href="https://wa.me/902625550124?text=Merhaba%2C%20Dentiva%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum." target="_blank" rel="noreferrer"><FaWhatsapp size={19} /> WhatsApp’tan yazın</a></div><div className="map-wrap"><iframe title="İzmit, Kocaeli demo haritası" src="https://www.google.com/maps?q=%C4%B0zmit%2C%20Kocaeli&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><div className="map-label"><span className="map-dot" /><div><strong>DENTIVA</strong><small>İzmit · Kocaeli</small></div><ArrowRight size={18} /></div><span className="map-demo-note">Demo konum</span></div></section>

      <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><a className="wordmark wordmark-light" href="#anasayfa"><span>DENT</span><span className="wordmark-accent">IVA</span><small>İZMİT · KOCAELİ</small></a><p>Sağlıklı gülüşler,<br />mutlu yarınlar.</p><div className="footer-socials" aria-label="Sosyal medya"><span title="Instagram demo"><FaInstagram /></span><span title="Facebook demo"><FaFacebookF /></span><span title="WhatsApp"><FaWhatsapp /></span><small>Demo bağlantılar</small></div></div><div className="footer-links"><div><h3>Hızlı bağlantılar</h3><a href="#hakkimizda">Hakkımızda</a><a href="#tedaviler">Tedaviler</a><a href="#hekimler">Hekimlerimiz</a><a href="#randevu">Online randevu</a></div><div><h3>Tedaviler</h3><a href="#tedaviler">İmplant</a><a href="#tedaviler">Estetik diş hekimliği</a><a href="#tedaviler">Ortodonti</a><a href="#tedaviler">Çocuk diş hekimliği</a></div><div><h3>İletişim</h3><span>İzmit / Kocaeli</span><a href="tel:+902625550124">0 (262) 555 01 24</a><a href="mailto:merhaba@dentiva.demo">merhaba@dentiva.demo</a><a href="/admin">Yönetim paneli</a><a className="footer-source-download" href="/dentiva-source.zip" download="dentiva-kaynak-kodu.zip"><Download size={14} /> Kaynak kodunu indir (.zip)</a></div></div></div><div className="footer-bottom"><span>© 2026 Dentiva. Tüm hakları saklıdır.</span><span>Demo proje · Hekim ve iletişim bilgileri temsili içeriktir.</span><a href="#anasayfa">Başa dön ↑</a></div></footer>

      {treatmentDetail && <div className="treatment-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setTreatmentDetail(null) }}><section className="treatment-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="treatment-detail-title"><button className="detail-close" autoFocus aria-label="Detay penceresini kapat" onClick={() => setTreatmentDetail(null)}><X size={19} /></button><div className="eyebrow">DENTIVA · TEDAVİLER</div><span className="detail-icon"><treatmentDetail.icon size={24} /></span><h2 id="treatment-detail-title">{treatmentDetail.name}</h2><p>{treatmentDetail.detail}</p><small>Size uygun tedavi, hekim muayenesi sonrasında belirlenir.</small><button className="button" onClick={() => { setTreatment(treatmentDetail.bookingTreatment); setStep(1); setTreatmentDetail(null); jumpToBooking() }}>Bu tedavi için randevu al <ArrowRight size={17} /></button></section></div>}
      {menuOpen && <button className="menu-scrim" aria-label="Menüyü kapat" onClick={() => setMenuOpen(false)} />}
    </main>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return <div className="review-row"><span>{label}</span><strong>{value || '—'}</strong></div>
}
