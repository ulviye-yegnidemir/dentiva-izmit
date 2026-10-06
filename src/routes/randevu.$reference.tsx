import { useEffect, useState } from 'react'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { ArrowLeft, CalendarCheck, Check, ShieldCheck } from 'lucide-react'

export const Route = createFileRoute('/randevu/$reference')({
  beforeLoad: ({ params }) => {
    if (!/^DNT-\d{4}-[A-Z0-9]{6}$/.test(params.reference)) throw notFound()
  },
  head: () => ({
    meta: [
      { title: 'Randevu Talebi | DENTIVA İzmit' },
      { name: 'description', content: 'Dentiva online randevu talep referansınız.' },
    ],
  }),
  component: AppointmentConfirmation,
})

function AppointmentConfirmation() {
  const { reference } = Route.useParams()
  const [confirmedHere, setConfirmedHere] = useState(false)
  useEffect(() => {
    setConfirmedHere(sessionStorage.getItem('dentiva-confirmed-reference') === reference)
  }, [reference])

  return <main className="confirmation-page"><div className="confirmation-top"><a className="wordmark" href="/">DENT<span className="wordmark-accent">IVA</span><small>İZMİT · KOCAELİ</small></a><a href="/">Ana sayfaya dön <ArrowLeft size={16} /></a></div><section className="confirmation-card"><span className="confirmation-icon">{confirmedHere ? <Check size={30} /> : <CalendarCheck size={29} />}</span><div className="eyebrow">DENTIVA · ONLINE RANDEVU</div><h1>{confirmedHere ? 'Randevunuz başarıyla oluşturuldu.' : 'Randevu referansınız'}</h1><p>{confirmedHere ? 'Randevu talebiniz kliniğimize iletildi. Gerekirse ekibimiz sizi verdiğiniz iletişim bilgileri üzerinden arayacaktır.' : 'Bu referans numarasıyla randevu talebinizi kliniğimizden teyit edebilirsiniz. Güvenliğiniz için kişisel bilgiler bu sayfada gösterilmez.'}</p><div className="reference-box"><span>RANDEVU NUMARASI</span><strong>{reference}</strong><small>Bu numarayı başvurunuzla ilgili iletişimde kullanabilirsiniz.</small></div><div className="confirmation-privacy"><ShieldCheck size={17} /><span>{confirmedHere ? 'Randevu kaydınız oluşturuldu. Kişisel bilgileriniz yönetim panelinde korunur.' : 'Randevu ayrıntıları gizlidir. Referansınızı kliniğe ileterek bilgi alabilirsiniz.'}</span></div><a className="button confirmation-home" href="/">Dentiva ana sayfa <ArrowLeft size={17} /></a><small className="demo-caption">Demo proje · İletişim ve hekim bilgileri temsili içeriktir.</small></section></main>
}
