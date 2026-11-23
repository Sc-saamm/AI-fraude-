import React, { useState, useMemo } from 'react';
import {
  Shield,
  Search,
  Sliders,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  ArrowUpRight,
  Plus,
  Lock,
  Globe,
  Smartphone,
  Clock,
  ChevronRight,
} from 'lucide-react';

const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN-9841',
    timestamp: '2 mins ago',
    merchant: 'Stripe Atlas SaaS',
    customer: 'elena.rostova@acme.io',
    amount: 4250.0,
    location: 'Tallinn, EE',
    ipDistance: 4120,
    deviceTrust: 'Untrusted',
    accountAgeDays: 3,
    velocity1h: 7,
    riskScore: 89,
    status: 'Blocked',
    factors: [
      { label: 'IP Geo-Velocity Mismatch (+4,120 km)', weight: '+34' },
      { label: 'Unrecognized Headless Browser Fingerprint', weight: '+28' },
      { label: 'High Burst Velocity (7 txns / 1h)', weight: '+19' },
      { label: 'New Account Tenure (< 7 days)', weight: '+8' },
    ],
    notes: 'Automated card testing signature detected across EU proxy subnet.',
  },
  {
    id: 'TXN-9840',
    timestamp: '6 mins ago',
    merchant: 'Linear Enterprise',
    customer: 'marcus.chen@vertex.dev',
    amount: 1180.0,
    location: 'San Francisco, US',
    ipDistance: 12,
    deviceTrust: 'Trusted',
    accountAgeDays: 540,
    velocity1h: 1,
    riskScore: 11,
    status: 'Approved',
    factors: [
      { label: 'Consistent Device Fingerprint', weight: '-12' },
      { label: 'Established Account History (540d)', weight: '-8' },
    ],
    notes: 'Recurring enterprise seat renewal.',
  },
  {
    id: 'TXN-9839',
    timestamp: '14 mins ago',
    merchant: 'Nordic Air Cargo',
    customer: 'ops@balticfreight.com',
    amount: 6890.0,
    location: 'Frankfurt, DE',
    ipDistance: 890,
    deviceTrust: 'New Device',
    accountAgeDays: 42,
    velocity1h: 3,
    riskScore: 64,
    status: 'Review',
    factors: [
      { label: 'Above-Baseline Ticket Size (+310%)', weight: '+26' },
      { label: 'New Hardware Fingerprint', weight: '+22' },
      { label: 'Cross-Border ASN Shift', weight: '+16' },
    ],
    notes: 'Awaiting 3DS2 step-up verification from cardholder.',
  },
  {
    id: 'TXN-9838',
    timestamp: '23 mins ago',
    merchant: 'Cloudflare Workers',
    customer: 'billing@kinetix.ai',
    amount: 340.0,
    location: 'Austin, US',
    ipDistance: 4,
    deviceTrust: 'Trusted',
    accountAgeDays: 310,
    velocity1h: 1,
    riskScore: 8,
    status: 'Approved',
    factors: [{ label: 'Known Corporate VPN Endpoint', weight: '-10' }],
    notes: '',
  },
  {
    id: 'TXN-9837',
    timestamp: '39 mins ago',
    merchant: 'Vanguard Digital Goods',
    customer: 'k.alvarez99@mail.co',
    amount: 2990.0,
    location: 'Lagos, NG',
    ipDistance: 7940,
    deviceTrust: 'Untrusted',
    accountAgeDays: 1,
    velocity1h: 9,
    riskScore: 94,
    status: 'Blocked',
    factors: [
      { label: 'High-Risk BIN / Gift Card MCC', weight: '+38' },
      { label: 'Tor / Residential Proxy Exit Node', weight: '+31' },
      { label: '9 Rapid Attempts in 60 Minutes', weight: '+25' },
    ],
    notes: 'Blocked automatically by Velocity Guard v4.',
  },
  {
    id: 'TXN-9836',
    timestamp: '51 mins ago',
    merchant: 'Figma Organization',
    customer: 'design@monolith.studio',
    amount: 960.0,
    location: 'London, UK',
    ipDistance: 18,
    deviceTrust: 'Trusted',
    accountAgeDays: 820,
    velocity1h: 1,
    riskScore: 14,
    status: 'Approved',
    factors: [{ label: 'Verified Passkey Session', weight: '-15' }],
    notes: '',
  },
];

const HOURLY_TELEMETRY = [
  { hour: '00:00', clean: 140, flagged: 8 },
  { hour: '03:00', clean: 95, flagged: 14 },
  { hour: '06:00', clean: 180, flagged: 6 },
  { hour: '09:00', clean: 420, flagged: 12 },
  { hour: '12:00', clean: 580, flagged: 19 },
  { hour: '15:00', clean: 610, flagged: 28 },
  { hour: '18:00', clean: 490, flagged: 15 },
  { hour: '21:00', clean: 310, flagged: 11 },
];

const INITIAL_RULES = [
  {
    id: 'RULE-01',
    name: 'Impossible Travel Geo-Velocity',
    description: 'Flags transactions where IP distance exceeds 800 km within 2 hours of prior session.',
    threshold: 'Score +35',
    triggers24h: 42,
    precision: '99.4%',
    enabled: true,
  },
  {
    id: 'RULE-02',
    name: 'High-Frequency Card Testing Burst',
    description: 'Blocks accounts executing more than 5 authorization attempts within a 60-minute window.',
    threshold: 'Auto-Block',
    triggers24h: 118,
    precision: '99.8%',
    enabled: true,
  },
  {
    id: 'RULE-03',
    name: 'New Account High-Ticket Anomaly',
    description: 'Routes transactions > $2,500 to manual review if account tenure is under 14 days.',
    threshold: 'Manual Review',
    triggers24h: 27,
    precision: '94.1%',
    enabled: true,
  },
  {
    id: 'RULE-04',
    name: 'Residential Proxy & ASN Reputation',
    description: 'Applies risk penalty to known anonymizing proxies, Tor exits, and datacenter ASNs.',
    threshold: 'Score +28',
    triggers24h: 64,
    precision: '97.6%',
    enabled: false,
  },
];

function StatusBadge({ status }) {
  const styles = {
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Review: 'bg-amber-50 text-amber-700 border-amber-200',
    Blocked: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  const icons = {
    Approved: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    Review: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
    Blocked: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || styles.Review
      }`}
    >
      {icons[status]}
      {status}
    </span>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [rules, setRules] = useState(INITIAL_RULES);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxnId, setSelectedTxnId] = useState(null);

  // Simulator State
  const [simMerchant, setSimMerchant] = useState('CloudScale Enterprise');
  const [simAmount, setSimAmount] = useState(3200);
  const [simTenure, setSimTenure] = useState(12);
  const [simDistance, setSimDistance] = useState(1450);
  const [simVelocity, setSimVelocity] = useState(4);
  const [simDevice, setSimDevice] = useState('New Device');

  const selectedTxn = useMemo(
    () => transactions.find((t) => t.id === selectedTxnId) || null,
    [transactions, selectedTxnId]
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesStatus = statusFilter === 'All' || txn.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        txn.id.toLowerCase().includes(q) ||
        txn.merchant.toLowerCase().includes(q) ||
        txn.customer.toLowerCase().includes(q) ||
        txn.location.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [transactions, statusFilter, searchQuery]);

  const kpis = useMemo(() => {
    const totalVolume = transactions.reduce((acc, t) => acc + t.amount, 0);
    const blockedCount = transactions.filter((t) => t.status === 'Blocked').length;
    const reviewCount = transactions.filter((t) => t.status === 'Review').length;
    const avgScore = Math.round(
      transactions.reduce((acc, t) => acc + t.riskScore, 0) / Math.max(transactions.length, 1)
    );
    return { totalVolume, blockedCount, reviewCount, avgScore };
  }, [transactions]);

  // Real-time Risk Calculation for Simulator
  const simResult = useMemo(() => {
    let score = 8;
    const factors = [];

    if (simAmount > 2000) {
      const pts = Math.min(28, Math.round((simAmount - 2000) / 700) + 10);
      score += pts;
      factors.push({ label: `High Transaction Value ($${simAmount.toLocaleString()})`, weight: `+${pts}` });
    }
    if (simTenure < 30) {
      const pts = simTenure < 7 ? 24 : 14;
      score += pts;
      factors.push({ label: `Low Account Tenure (${simTenure} days)`, weight: `+${pts}` });
    }
    if (simDistance > 500) {
      const pts = Math.min(30, Math.round(simDistance / 300));
      score += pts;
      factors.push({ label: `IP Geo-Distance (${simDistance.toLocaleString()} km)`, weight: `+${pts}` });
    }
    if (simVelocity > 2) {
      const pts = Math.min(25, (simVelocity - 2) * 5);
      score += pts;
      factors.push({ label: `Elevated 1h Velocity (${simVelocity} txns)`, weight: `+${pts}` });
    }
    if (simDevice === 'Untrusted') {
      score += 24;
      factors.push({ label: 'Untrusted / Proxy Device Signature', weight: '+24' });
    } else if (simDevice === 'New Device') {
      score += 11;
      factors.push({ label: 'Unseen Hardware Fingerprint', weight: '+11' });
    } else {
      score = Math.max(4, score - 10);
      factors.push({ label: 'Verified Trusted Device', weight: '-10' });
    }

    const finalScore = Math.min(99, Math.max(1, score));
    const status = finalScore >= 75 ? 'Blocked' : finalScore >= 45 ? 'Review' : 'Approved';
    return { score: finalScore, status, factors };
  }, [simAmount, simTenure, simDistance, simVelocity, simDevice]);

  const handleUpdateTxnStatus = (id, newStatus) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  const handleUpdateTxnNotes = (id, notes) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, notes } : t))
    );
  };

  const handlePushSimulatedTxn = () => {
    const newId = `TXN-${Math.floor(9842 + Math.random() * 150)}`;
    const newTxn = {
      id: newId,
      timestamp: 'Just now',
      merchant: simMerchant || 'Simulated Merchant',
      customer: 'sandbox.user@sentinel.dev',
      amount: simAmount,
      location: simDistance > 1000 ? 'Reykjavik, IS' : 'New York, US',
      ipDistance: simDistance,
      deviceTrust: simDevice,
      accountAgeDays: simTenure,
      velocity1h: simVelocity,
      riskScore: simResult.score,
      status: simResult.status,
      factors: simResult.factors,
      notes: 'Injected via Risk Scoring Simulator.',
    };
    setTransactions((prev) => [newTxn, ...prev]);
    setActiveTab('overview');
    setSelectedTxnId(newId);
  };

  const toggleRule = (id) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0F172A] font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-semibold tracking-tight text-base">Sentinel</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Engine Active · 14ms
              </span>
            </div>
          </div>

          {/* View Switcher */}
          <nav className="flex items-center bg-[#F4F4F5] p-1 rounded-lg border border-[#E5E7EB]">
            {[
              { id: 'overview', label: 'Overview & Feed', icon: Activity },
              { id: 'simulator', label: 'Risk Simulator', icon: Sliders },
              { id: 'rules', label: 'Detection Rules', icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    active
                      ? 'bg-white text-[#0F172A] shadow-xs border border-[#E5E7EB]'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            onClick={() => setActiveTab('simulator')}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Test Event
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* KPI Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>MONITORED VOLUME</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight font-mono">
              ${kpis.totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="mt-1 text-xs text-slate-500">Across {transactions.length} live events</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>BLOCKED THREATS</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight font-mono">
              {kpis.blockedCount}
            </div>
            <p className="mt-1 text-xs text-rose-600">Prevented automated loss</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>REVIEW QUEUE</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight font-mono">
              {kpis.reviewCount}
            </div>
            <p className="mt-1 text-xs text-slate-500">Awaiting analyst triage</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>MEAN RISK SCORE</span>
              <Shield className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight font-mono">
              {kpis.avgScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
            </div>
            <p className="mt-1 text-xs text-emerald-600">99.4% model precision</p>
          </div>
        </section>

        {/* VIEW 1: OVERVIEW & FEED */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 24h Telemetry Chart */}
            <section className="bg-white p-6 rounded-xl border border-[#E5E7EB]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h2 className="text-sm font-semibold text-[#0F172A]">24-Hour Anomaly Telemetry</h2>
                  <p className="text-xs text-slate-500">Legitimate traffic vs. flagged risk events</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-slate-200" /> Clean Volume
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" /> Flagged Anomalies
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-8 gap-3 items-end h-36 pt-4">
                {HOURLY_TELEMETRY.map((slot) => {
                  const cleanHeight = Math.round((slot.clean / 650) * 100);
                  const flaggedHeight = Math.max(8, Math.round((slot.flagged / 35) * 45));
                  return (
                    <div key={slot.hour} className="flex flex-col items-center gap-2 h-full justify-end">
                      <div className="w-full max-w-[36px] flex flex-col items-center gap-1">
                        <div
                          style={{ height: `${flaggedHeight}px` }}
                          className="w-full bg-rose-500 rounded-t-xs transition-all"
                          title={`Flagged: ${slot.flagged}`}
                        />
                        <div
                          style={{ height: `${cleanHeight}px` }}
                          className="w-full bg-slate-200 rounded-b-xs transition-all"
                          title={`Clean: ${slot.clean}`}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{slot.hour}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Transaction Stream */}
            <section className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['All', 'Approved', 'Review', 'Blocked'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        statusFilter === status
                          ? 'bg-[#0F172A] text-white'
                          : 'bg-[#F4F4F5] text-slate-600 hover:text-[#0F172A]'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter ID, merchant, IP..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-[11px] font-medium text-slate-500 uppercase tracking-wider bg-[#FAFAFA]">
                      <th className="py-3 px-4">Transaction</th>
                      <th className="py-3 px-4">Merchant / Account</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4">Risk Score</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] text-sm">
                    {filteredTransactions.map((txn) => (
                      <tr
                        key={txn.id}
                        onClick={() => setSelectedTxnId(txn.id)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-xs font-medium text-[#0F172A]">{txn.id}</div>
                          <div className="text-xs text-slate-400">{txn.timestamp}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-xs text-[#0F172A]">{txn.merchant}</div>
                          <div className="text-xs text-slate-500">{txn.customer}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">{txn.location}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs font-medium">
                          ${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  txn.riskScore >= 75
                                    ? 'bg-rose-500'
                                    : txn.riskScore >= 45
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${txn.riskScore}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs font-medium">{txn.riskScore}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={txn.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <ChevronRight className="w-4 h-4 text-slate-400 inline" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: RISK SIMULATOR */}
        {activeTab === 'simulator' && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#E5E7EB] space-y-6">
              <div>
                <h2 className="text-base font-semibold">Risk Scoring Simulator</h2>
                <p className="text-xs text-slate-500">
                  Adjust transaction signals to preview real-time model classification and push test events to the feed.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Merchant Name</label>
                  <input
                    type="text"
                    value={simMerchant}
                    onChange={(e) => setSimMerchant(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg bg-[#FAFAFA] focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-700">Transaction Amount</span>
                    <span className="font-mono font-semibold">${simAmount.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="25000"
                    step="50"
                    value={simAmount}
                    onChange={(e) => setSimAmount(Number(e.target.value))}
                    className="w-full accent-[#0F172A]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-700">Account Tenure</span>
                    <span className="font-mono font-semibold">{simTenure} days</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="730"
                    value={simTenure}
                    onChange={(e) => setSimTenure(Number(e.target.value))}
                    className="w-full accent-[#0F172A]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-700">IP Distance from Billing</span>
                    <span className="font-mono font-semibold">{simDistance.toLocaleString()} km</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="50"
                    value={simDistance}
                    onChange={(e) => setSimDistance(Number(e.target.value))}
                    className="w-full accent-[#0F172A]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-700">1-Hour Transaction Velocity</span>
                    <span className="font-mono font-semibold">{simVelocity} txns / hr</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={simVelocity}
                    onChange={(e) => setSimVelocity(Number(e.target.value))}
                    className="w-full accent-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Device Trust Posture</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Trusted', 'New Device', 'Untrusted'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSimDevice(opt)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                          simDevice === opt
                            ? 'bg-[#0F172A] text-white border-[#0F172A]'
                            : 'bg-[#FAFAFA] text-slate-600 border-[#E5E7EB] hover:text-[#0F172A]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Score Gauge Card */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase">Predicted Verdict</span>
                  <StatusBadge status={simResult.status} />
                </div>

                <div className="py-6 flex flex-col items-center justify-center border border-[#E5E7EB] rounded-xl bg-[#FAFAFA]">
                  <div className="text-4xl font-bold font-mono tracking-tight">{simResult.score}</div>
                  <div className="text-xs text-slate-500 mt-1">Composite Risk Score (0–100)</div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-700">Signal Contributions</div>
                  {simResult.factors.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-md bg-[#FAFAFA] border border-[#E5E7EB]"
                    >
                      <span className="text-slate-600">{f.label}</span>
                      <span
                        className={`font-mono font-semibold ${
                          f.weight.startsWith('+') ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {f.weight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePushSimulatedTxn}
                className="w-full py-2.5 px-4 rounded-lg bg-[#0F172A] text-white text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                Push Event to Live Feed
              </button>
            </div>
          </section>
        )}

        {/* VIEW 3: DETECTION RULES */}
        {activeTab === 'rules' && (
          <section className="bg-white rounded-xl border border-[#E5E7EB] divide-y divide-[#E5E7EB]">
            <div className="p-6">
              <h2 className="text-base font-semibold">Automated Detection Rules</h2>
              <p className="text-xs text-slate-500">
                Deterministic guardrails evaluated alongside the gradient-boosted risk model.
              </p>
            </div>
            {rules.map((rule) => (
              <div key={rule.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-slate-400">{rule.id}</span>
                    <h3 className="text-sm font-semibold text-[#0F172A]">{rule.name}</h3>
                    <span className="px-2 py-0.5 text-[11px] font-mono bg-[#F4F4F5] border border-[#E5E7EB] rounded">
                      {rule.threshold}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{rule.description}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs font-mono font-semibold">{rule.triggers24h} hits</div>
                    <div className="text-[11px] text-slate-400">{rule.precision} precision</div>
                  </div>
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 ${
                      rule.enabled ? 'bg-[#0F172A]' : 'bg-slate-200'
                    }`}
                    aria-label={`Toggle ${rule.name}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        rule.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      {/* Slide-Over Investigation Drawer */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-[1px]">
          <div className="w-full max-w-md bg-white h-full border-l border-[#E5E7EB] flex flex-col justify-between overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">{selectedTxn.id}</span>
                    <StatusBadge status={selectedTxn.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedTxn.merchant}</p>
                </div>
                <button
                  onClick={() => setSelectedTxnId(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB]">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> IP Distance
                  </div>
                  <div className="font-mono font-semibold mt-1">{selectedTxn.ipDistance} km</div>
                </div>
                <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB]">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" /> Device Trust
                  </div>
                  <div className="font-semibold mt-1">{selectedTxn.deviceTrust}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB]">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Account Age
                  </div>
                  <div className="font-mono font-semibold mt-1">{selectedTxn.accountAgeDays} days</div>
                </div>
                <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB]">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> 1h Velocity
                  </div>
                  <div className="font-mono font-semibold mt-1">{selectedTxn.velocity1h} txns</div>
                </div>
              </div>

              {/* Explainable Risk Factors */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Risk Attribution (Score: {selectedTxn.riskScore}/100)
                </h3>
                <div className="space-y-2">
                  {selectedTxn.factors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA]"
                    >
                      <span className="text-slate-700">{factor.label}</span>
                      <span
                        className={`font-mono font-semibold ${
                          factor.weight.startsWith('+') ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {factor.weight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analyst Notes */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Analyst Notes
                </label>
                <textarea
                  rows={3}
                  value={selectedTxn.notes}
                  onChange={(e) => handleUpdateTxnNotes(selectedTxn.id, e.target.value)}
                  placeholder="Add investigation findings..."
                  className="w-full p-3 text-xs rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {/* Decision Actions */}
            <div className="p-6 border-t border-[#E5E7EB] bg-[#FAFAFA] grid grid-cols-2 gap-3">
              <button
                onClick={() => handleUpdateTxnStatus(selectedTxn.id, 'Approved')}
                className="py-2.5 px-4 rounded-lg bg-white border border-[#E5E7EB] text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                Approve Transaction
              </button>
              <button
                onClick={() => handleUpdateTxnStatus(selectedTxn.id, 'Blocked')}
                className="py-2.5 px-4 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
              >
                Block & Flag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
