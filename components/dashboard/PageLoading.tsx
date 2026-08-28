import '@/styles/components/dashboard/PageLoading.scss'

export default function PageLoading() {
  return (
    <div className="page-loading">
      <div className="page-loading-row page-loading-row--wide" />
      <div className="page-loading-row page-loading-row--narrow" />
      <div className="page-loading-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="page-loading-card" />
        ))}
      </div>
    </div>
  )
}
