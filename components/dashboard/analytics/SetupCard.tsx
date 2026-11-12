import { Plug } from 'lucide-react'

interface SetupCardProps {
  title: string
  missing?: string[]
  steps: string[]
  error?: string
}

/** Shown instead of a section when its service isn't connected yet (or the API call failed). */
export default function SetupCard({ title, missing = [], steps, error }: SetupCardProps) {
  return (
    <div className="an-setup">
      <span className="an-setup__icon" aria-hidden="true">
        <Plug />
      </span>
      <div>
        <h3>{error ? `${title}: couldn’t load data` : `Connect ${title}`}</h3>
        {error ? (
          <p className="an-setup__error">{error}</p>
        ) : (
          <ol>
            {steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        )}
        {missing.length > 0 && (
          <p className="an-setup__env">
            Missing in <code>.env</code>: {missing.map((m) => <code key={m}>{m}</code>)}
          </p>
        )}
      </div>
    </div>
  )
}
