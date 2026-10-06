import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight, CalendarDays, Check, Clock3, LogIn, LogOut, Plus, RefreshCw, ShieldCheck, Trash2, UserRound, XCircle } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { addAvailabilityBlock, deleteAppointment, deleteAvailabilityBlock, getAppointments, getAvailabilityBlocks, setAppointmentStatus } from '@/server/appointments'

export const Route = createFileRoute('/admin')({
  head: () => ({ meta: [{ title: 'Yönetim Paneli | DENTIVA İzmit' }, { name: 'description', content: 'Dentiva demo randevu yönetim paneli.' }] }),
  component: AdminPage,
})

const doctors = ['Fark etmez / İlk müsait hekim', 'Dt. Aylin Demir', 'Dt. Emre Yılmaz', 'Dt. Selin Kaya']
type Appointment = {
  id: string; reference: string; treatment: string; doctor: string; appointmentDate: string; appointmentTime: string
  patientName: string; phone: string; email: string; note: string; status: 'pending' | 'confirmed' | 'cancelled'; createdAt: Date
}
type Block = { id: string; doctor: string; blockDate: string; blockTime: string }

function AdminPage() {
  const [session, setSession] = useState<{ user: { id: string; email: string } } | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  useEffect(() => {
    let active = true
    void authClient.getSession().then(({ data }) => {
      if (active) setSession(data)
    }).catch(() => {
      if (active) setSession(null)
    }).finally(() => {
      if (active) setSessionLoading(false)
    })
    return () => { active = false }
  }, [])
  const [signUp, setSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [rows, setRows] = useState<Appointment[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('')
  const [blockDoctor, setBlockDoctor] = useState('__all__')
  const [blockDate, setBlockDate] = useState('')
  const [blockTime, setBlockTime] = useState('09:00')
  const [working, setWorking] = useState('')

  async function loadData() {
    if (!session) return
    setLoading(true)
    setLoadError('')
    try {
      const [appointments, unavailable] = await Promise.all([getAppointments({ data: {} }), getAvailabilityBlocks()])
      setRows(appointments as Appointment[])
      setBlocks(unavailable as Block[])
    } catch {
      setLoadError('Randevular yüklenemedi. Oturumunuzu kontrol edip tekrar deneyin.')
    } finally { setLoading(false) }
  }
  useEffect(() => {
    if (session) void loadData()
    // Data requests intentionally wait for the confirmed session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id])

  const visibleRows = useMemo(() => rows.filter((row) => (!dateFilter || row.appointmentDate === dateFilter) && (!doctorFilter || row.doctor === doctorFilter)), [rows, dateFilter, doctorFilter])
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(new Date())
  const stats = [
    { label: 'Bugünkü randevular', value: rows.filter((row) => row.appointmentDate === today && row.status !== 'cancelled').length, icon: CalendarDays, note: 'İzmit yerel saatine göre' },
    { label: 'Bekleyen randevular', value: rows.filter((row) => row.status === 'pending').length, icon: Clock3, note: 'İşlem bekliyor' },
    { label: 'Toplam randevular', value: rows.length, icon: UserRound, note: 'Tüm kayıtlar' },
    { label: 'İptal edilenler', value: rows.filter((row) => row.status === 'cancelled').length, icon: XCircle, note: 'İptal edilmiş' },
  ]

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault()
  setAuthError('')
  setAuthBusy(true)

  try {
    const result = await authClient.signIn.email({ email, password })

    if (result.error) {
      setAuthError(
        result.error.message ||
        'Bilgiler kontrol edilemedi. Yeniden deneyin.'
      )
    } else {
      const current = await authClient.getSession()
      setSession(current.data)
    }
  } catch {
    setAuthError(
      'Oturum açılamadı. Lütfen bilgilerinizi kontrol edin.'
    )
  } finally {
    setAuthBusy(false)
  }
}

  if (sessionLoading) return <main className="admin-page"><div className="admin-loading">Oturum doğrulanıyor…</div></main>
  if (!session) return <main className="admin-page admin-door"><section className="admin-door-art"><a className="wordmark" href="/">DENT<span className="wordmark-accent">IVA</span><small>İZMİT · KOCAELİ</small></a><div><span className="eyebrow eyebrow-light">DENTIVA · YÖNETİM</span><h1>İyi bakım,<br /><em>iyi planlanır.</em></h1><p>Randevuları, takvimi ve klinik akışını tek ekrandan yönetin.</p></div><small>İzmit · Kocaeli · Demo yönetim paneli</small></section><section className="admin-door-form"><a className="admin-back-home" href="/">← Dentiva ana sayfa</a><div className="auth-box"><div className="eyebrow">YÖNETİCİ ERİŞİMİ</div><h2>{signUp ? 'Hesabınızı oluşturun' : 'Tekrar hoş geldiniz.'}</h2><p>Randevu yönetim ekranına erişmek için oturum açın.</p><form onSubmit={submitAuth}>
    {signUp && <label>Ad Soyad<input required minLength={2} autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} /></label>}
    <label>E-posta<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
    <label>Şifre<input type="password" required minLength={8} autoComplete={signUp ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
    {authError && <p className="form-error" role="alert">{authError}</p>}
    <button className="button auth-submit" disabled={authBusy}>{authBusy ? 'Lütfen bekleyin…' : signUp ? 'Hesap oluştur' : 'Giriş yap'} <LogIn size={17} /></button>
  </form>
      </div></section></main>

  const filteredRows = visibleRows
  async function updateStatus(id: string, status: Appointment['status']) {
    setWorking(id)
    try { await setAppointmentStatus({ data: { id, status } }); await loadData() }
    catch { setLoadError('Durum güncellenemedi. Lütfen tekrar deneyin.') }
    finally { setWorking('') }
  }
  async function removeAppointment(row: Appointment) {
    if (!window.confirm(`${row.patientName} adlı hastanın ${row.appointmentDate} randevusu silinsin mi? Bu işlem geri alınamaz.`)) return
    setWorking(row.id)
    try { await deleteAppointment({ data: { id: row.id } }); await loadData() }
    catch { setLoadError('Randevu silinemedi. Lütfen tekrar deneyin.') }
    finally { setWorking('') }
  }
  async function addBlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!blockDate) return
    setWorking('block')
    try { await addAvailabilityBlock({ data: { doctor: blockDoctor, blockDate, blockTime } }); setBlockDate(''); await loadData() }
    catch { setLoadError('Saat kapatılamadı. Bilgileri kontrol edip tekrar deneyin.') }
    finally { setWorking('') }
  }
  async function removeBlock(id: string) {
    setWorking(id)
    try { await deleteAvailabilityBlock({ data: { id } }); await loadData() }
    catch { setLoadError('Kapalı saat kaldırılamadı. Lütfen tekrar deneyin.') }
    finally { setWorking('') }
  }

  return <main className="admin-page"><header className="admin-topbar"><a className="wordmark" href="/">DENT<span className="wordmark-accent">IVA</span><small>YÖNETİM</small></a><span className="admin-context"><i /> Randevu yönetimi</span><div className="admin-user"><span>{session.user.email}</span>
  <button
  className="quiet-action"
  onClick={async () => {
    await authClient.signOut()
    setSession(null)
  }}
>
  <LogOut size={16} /> 
  Çıkış
</button>
  </div></header><div className="admin-content"><div className="admin-title-row"><div><div className="eyebrow">DENTIVA · KLİNİK İŞ AKIŞI</div><h1>Randevular</h1><p>Gelen talepleri takip edin, takvimi düzenleyin.</p></div><button className="button admin-refresh" onClick={() => void loadData()} disabled={loading}><RefreshCw size={16} className={loading ? 'spin' : ''} /> Yenile</button></div>
  {loadError && <div className="admin-error" role="alert">{loadError}<button onClick={() => void loadData()}>Tekrar dene</button></div>}
  <section className="stats-grid">{stats.map((item) => {const Icon = item.icon; return <article className="stat-card" key={item.label}><div className="stat-top"><span>{item.label}</span><Icon size={18} /></div><strong>{loading ? '—' : item.value}</strong><small>{item.note}</small></article>})}</section>
  <section className="admin-panel"><div className="panel-heading"><div><span className="eyebrow">GELEN TALEPLER</span><h2>Randevu listesi <span>{filteredRows.length}</span></h2></div><div className="admin-filters"><label>Tarihe göre<input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} /></label><label>Hekime göre<select value={doctorFilter} onChange={(event) => setDoctorFilter(event.target.value)}><option value="">Tüm hekimler</option>{doctors.map((name) => <option key={name}>{name}</option>)}</select></label><button className="quiet-action clear-filters" onClick={() => { setDateFilter(''); setDoctorFilter('') }}>Filtreleri temizle</button></div></div>
  {loading ? <div className="table-loading"><span /><span /><span /></div> : filteredRows.length === 0 ? <div className="empty-state"><span className="empty-mark"><CalendarDays size={23} /></span><strong>{rows.length ? 'Bu filtrelerle randevu bulunamadı.' : 'Henüz randevu talebi yok.'}</strong><p>{rows.length ? 'Tarih ya da hekim filtresini değiştirin.' : 'Yeni talepler burada görünecek.'}</p>{rows.length > 0 && <button className="text-link" onClick={() => { setDateFilter(''); setDoctorFilter('') }}>Tüm randevuları göster <ArrowRight size={16} /></button>}</div> : <div className="appointment-table-scroll"><table className="appointment-table"><thead><tr><th>HASTA</th><th>TARİH / SAAT</th><th>TEDAVİ · HEKİM</th><th>İLETİŞİM</th><th>DURUM</th><th aria-label="İşlemler" /></tr></thead><tbody>{filteredRows.map((row) => <tr key={row.id}><td><strong>{row.patientName}</strong><small>{row.reference}</small>{row.note && <small className="patient-note">Not: {row.note}</small>}</td><td><strong>{row.appointmentDate}</strong><small>{row.appointmentTime}</small></td><td><strong>{row.treatment}</strong><small>{row.doctor}</small></td><td><a href={`tel:${row.phone}`}>{row.phone}</a><small>{row.email}</small></td><td><select aria-label={`${row.patientName} randevu durumu`} className={`status-select status-${row.status}`} value={row.status} disabled={working === row.id} onChange={(event) => void updateStatus(row.id, event.target.value as Appointment['status'])}><option value="pending">Bekliyor</option><option value="confirmed">Onaylandı</option><option value="cancelled">İptal edildi</option></select></td><td><button className="icon-delete" aria-label={`${row.patientName} randevusunu sil`} title="Randevuyu sil" disabled={working === row.id} onClick={() => void removeAppointment(row)}><Trash2 size={17} /></button></td></tr>)}</tbody></table></div>}</section>
  <section className="admin-panel slot-panel"><div className="panel-heading"><div><span className="eyebrow">TAKVİM YÖNETİMİ</span><h2>Dolu saatleri yönet</h2><p>Kapalı bir saat seçin; o gün için belirli bir hekimi veya tüm kliniği kapatabilirsiniz.</p></div></div><form className="block-form" onSubmit={addBlock}><label>Hekim<select value={blockDoctor} onChange={(event) => setBlockDoctor(event.target.value)}><option value="__all__">Tüm klinik</option>{doctors.map((name) => <option key={name} value={name}>{name}</option>)}</select></label><label>Tarih<input type="date" required min={today} value={blockDate} onChange={(event) => setBlockDate(event.target.value)} /></label><label>Saat<select value={blockTime} onChange={(event) => setBlockTime(event.target.value)}>{['09:00','09:30','10:00','10:30','11:00','13:00','13:30','14:00','15:00','16:00','17:00','18:00'].map((time) => <option key={time}>{time}</option>)}</select></label><button className="button block-submit" disabled={working === 'block'}><Plus size={16} /> Saati kapat</button></form><div className="blocks-list">{blocks.length ? blocks.map((block) => <div className="block-row" key={block.id}><span className="block-date"><CalendarDays size={16} />{block.blockDate}</span><strong>{block.blockTime}</strong><span>{block.doctor === '__all__' ? 'Tüm klinik' : block.doctor}</span><span className="blocked-pill">Kapalı</span><button className="quiet-action" onClick={() => void removeBlock(block.id)} disabled={working === block.id}><XCircle size={16} /> Kaldır</button></div>) : <div className="blocks-empty"><Check size={17} /> Kapalı saat bulunmuyor. Klinik takvimi açık.</div>}</div></section>
  <div className="admin-privacy-note"><ShieldCheck size={17} /><span>Randevu bilgileri oturum açmış hesaplara görünür; demo ortamında hesap kaydı açıktır. Gerçek hasta verisi kullanmayın.</span></div></div></main>
}
