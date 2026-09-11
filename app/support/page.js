'use client'

import './support.css'
import Link from 'next/link'
import { ArrowUpRight, Copy, Check } from 'lucide-react'
import { useState } from 'react'

const BINANCE_PAY_URL = 'https://app.binance.com/uni-qr/ELdmYCq9'
const QR_URL = `https://quickchart.io/qr?text=${encodeURIComponent(BINANCE_PAY_URL)}&size=420&margin=2&ecLevel=H`

export default function SupportPage() {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(BINANCE_PAY_URL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  return (
    <main className="supportPage">
      <header className="topbar">
        <div className="nav inner">
          <Link className="brand" href="/"><span>I</span> INFERA</Link>
          <div className="navActions">
            <Link className="secondary" href="/">Back to Infera</Link>
          </div>
        </div>
      </header>

      <section className="supportHero inner">
        <div className="supportCopy">
          <div className="eyebrow">SUPPORT INFERA</div>
          <h1>Help us keep<br /><em>intelligence flowing.</em></h1>
          <p>Infera is built to make important news, market signals and context easier to discover. If you find it useful, you can support the project through Binance Pay.</p>
          <div className="supportSteps">
            <div><b>01</b><span>Open the Binance app</span></div>
            <div><b>02</b><span>Scan the QR code</span></div>
            <div><b>03</b><span>Send your support</span></div>
          </div>
          <button className="copyButton" onClick={copyLink}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Link copied' : 'Copy Binance Pay link'}
          </button>
        </div>

        <div className="supportCard">
          <div className="supportCardTop"><span>BINANCE PAY</span><span>SUPPORT</span></div>
          <div className="qrWrap"><img src={QR_URL} alt="Binance Pay QR code for supporting Infera" /></div>
          <h2>Scan with Binance App to pay</h2>
          <p>Blockchain enthusiastic</p>
          <a href={BINANCE_PAY_URL} target="_blank" rel="noreferrer" className="payLink">Open Binance Pay <ArrowUpRight size={15} /></a>
        </div>
      </section>
    </main>
  )
}
