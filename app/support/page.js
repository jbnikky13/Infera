'use client'

import './support.css'
import Link from 'next/link'
import { ArrowUpRight, Copy, Check } from 'lucide-react'
import { useState } from 'react'

const BINANCE_PAY_URL = 'https://app.binance.com/uni-qr/ELdmYCq9'
const EVM_ADDRESS = '0x3A6e99DBB0f8C9fF407526f44E25F817C0BCeFcB'
const BINANCE_QR_URL = `https://quickchart.io/qr?text=${encodeURIComponent(BINANCE_PAY_URL)}&size=420&margin=2&ecLevel=H`
const EVM_QR_URL = `https://quickchart.io/qr?text=${encodeURIComponent(EVM_ADDRESS)}&size=420&margin=2&ecLevel=H`

export default function SupportPage() {
  const [method, setMethod] = useState('binance')
  const [copied, setCopied] = useState(false)

  const value = method === 'binance' ? BINANCE_PAY_URL : EVM_ADDRESS

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value)
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
          <p>Infera is built to make important news, market signals and context easier to discover. If you find it useful, you can support the project with Binance Pay or directly through an EVM wallet.</p>
          <div className="supportSteps">
            <div><b>01</b><span>Choose a payment method</span></div>
            <div><b>02</b><span>Scan or copy the details</span></div>
            <div><b>03</b><span>Send your support</span></div>
          </div>
          <button className="copyButton" onClick={copyValue}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : method === 'binance' ? 'Copy Binance Pay link' : 'Copy EVM address'}
          </button>
        </div>

        <div className="supportCard">
          <div className="supportMethods" role="tablist" aria-label="Support methods">
            <button className={method === 'binance' ? 'selected' : ''} onClick={() => { setMethod('binance'); setCopied(false) }}>Binance Pay</button>
            <button className={method === 'evm' ? 'selected' : ''} onClick={() => { setMethod('evm'); setCopied(false) }}>EVM Wallet</button>
          </div>

          <div className="supportCardTop"><span>{method === 'binance' ? 'BINANCE PAY' : 'EVM WALLET'}</span><span>SUPPORT</span></div>
          <div className="qrWrap"><img src={method === 'binance' ? BINANCE_QR_URL : EVM_QR_URL} alt={method === 'binance' ? 'Binance Pay QR code for supporting Infera' : 'EVM wallet QR code for supporting Infera'} /></div>
          <h2>{method === 'binance' ? 'Scan with Binance App to pay' : 'Scan with your crypto wallet'}</h2>
          {method === 'binance' ? (
            <>
              <p>Blockchain enthusiastic</p>
              <a href={BINANCE_PAY_URL} target="_blank" rel="noreferrer" className="payLink">Open Binance Pay <ArrowUpRight size={15} /></a>
            </>
          ) : (
            <>
              <p className="walletLabel">EVM address</p>
              <code className="walletAddress">{EVM_ADDRESS}</code>
              <p className="walletWarning">Use an EVM-compatible network and verify the network and asset before sending.</p>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
