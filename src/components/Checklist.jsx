import './Checklist.css'

export function Palomita() {
  return (
    <svg className="palomita" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M6.5 12.5l3.5 3.5L17.5 8.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
    </svg>
  )
}

export function Tache() {
  return (
    <svg className="palomita" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M7.5 7.5l9 9M16.5 7.5l-9 9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
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
