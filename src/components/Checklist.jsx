import './Checklist.css'

export function Palomita() {
  return (
    <svg className="palomita" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Tache() {
  return (
    <svg className="palomita" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 8l8 8M16 8l-8 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export default function Checklist({ items, tono = 'teal' }) {
  return (
    <ul className="checklist" style={{ '--acento': `var(--${tono})` }}>
      {items.map((item, i) => (
        <li key={i}>
          {tono === 'rose' ? <Tache /> : <Palomita />}
          <div>{item}</div>
        </li>
      ))}
    </ul>
  )
}
