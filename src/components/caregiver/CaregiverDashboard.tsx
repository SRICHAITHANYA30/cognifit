import React, { useState } from 'react';
import { 
  Activity, 
  ArrowLeft, 
  Download, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Volume2, 
  CheckCircle2, 
  HeartHandshake, 
  ShieldCheck, 
  Calendar 
} from 'lucide-react';
import type { DailyCsiScore, Language, MemoryVaultItem, PatientProfile } from '../../types';
import { translations } from '../../locales/translations';
import { db } from '../../services/db';
import { audioEngine } from '../../services/audioEngine';
import { generateClinicalPdfReport } from '../../services/pdfReport';

interface Props {
  language: Language;
  onBackToKiosk: () => void;
}

export const CaregiverDashboard: React.FC<Props> = ({ language, onBackToKiosk }) => {
  const t = translations[language];
  const [profile] = useState<PatientProfile>(() => db.getPatientProfile());
  const [past7Days] = useState<DailyCsiScore[]>(() => db.getPast7DaysCsi());
  const [vaultItems, setVaultItems] = useState<MemoryVaultItem[]>(() => db.getMemoryVault());
  const [syncStatus, setSyncStatus] = useState(() => db.getSyncStatus());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // New Memory Vault item state
  const [isAddingVaultItem, setIsAddingVaultItem] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTitleAs, setNewTitleAs] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newRelationAs, setNewRelationAs] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newVoicePromptAs, setNewVoicePromptAs] = useState('');

  const todayCsi = past7Days[past7Days.length - 1] || {
    compositeCsi: 78,
    memoryScore: 80,
    executiveScore: 74,
    attentionScore: 77,
    motorStabilityScore: 82,
    sessionCount: 4,
    clinicalNote: 'Stable metrics.',
  };

  const handleSyncWithPhc = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      await db.syncWithPhc();
      setSyncStatus(db.getSyncStatus());
      setSyncMessage(t.syncSuccessMessage);
      audioEngine.playSuccessChime();
    } catch {
      // guard
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadPdf = () => {
    const telemetry = db.getTelemetry();
    generateClinicalPdfReport(profile, past7Days, telemetry);
    audioEngine.playSuccessChime();
  };

  const handleSaveVaultItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newImageUrl.trim()) return;

    const saved = db.addMemoryVaultItem({
      title: newTitle,
      titleAssamese: newTitleAs || newTitle,
      relationship: newRelation || 'Family Member',
      relationshipAssamese: newRelationAs || 'পৰিয়ালৰ সদস্য',
      category: 'family',
      imageUrl: newImageUrl,
      audioPromptAssamese: newVoicePromptAs || `এইয়া আপোনাৰ ${newRelationAs || newTitleAs}।`,
      audioPromptEnglish: `This is your ${newRelation || newTitle}.`,
      cluesAssamese: ['আপোনাৰ মৰমৰ পৰিয়াল', newRelationAs || newTitleAs],
      cluesEnglish: ['Beloved family', newRelation || newTitle],
    });

    setVaultItems(prev => [saved, ...prev]);
    setIsAddingVaultItem(false);
    setNewTitle('');
    setNewTitleAs('');
    setNewRelation('');
    setNewRelationAs('');
    setNewImageUrl('');
    setNewVoicePromptAs('');
    audioEngine.playSuccessChime();
  };

  const handleDeleteVaultItem = (id: string) => {
    db.deleteMemoryVaultItem(id);
    setVaultItems(prev => prev.filter(item => item.id !== id));
  };

  const handlePreviewSpeech = (text: string) => {
    audioEngine.speakPrompt(text, 'as');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'white',
        padding: '20px 28px',
        borderRadius: '24px',
        border: '2px solid #e2e8f0',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn-back-kiosk" onClick={onBackToKiosk}>
            <ArrowLeft size={22} />
            <span>{t.backToHome}</span>
          </button>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#064e3b' }}>
              {t.caregiverDashboardTitle}
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
              {t.ashaSupervisor}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn-lang-toggle"
            style={{ borderColor: '#059669', background: '#ecfdf5', color: '#065f46' }}
            onClick={handleDownloadPdf}
          >
            <Download size={20} />
            <span>{t.downloadPdfReport}</span>
          </button>

          <button
            className="btn-mode-switch"
            onClick={handleSyncWithPhc}
            disabled={isSyncing}
          >
            <RefreshCw size={20} className={isSyncing ? 'pulse-dot' : ''} />
            <span>{isSyncing ? 'Syncing...' : t.syncWithPhcButton}</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div style={{
          padding: '16px 20px',
          borderRadius: '16px',
          background: '#ecfdf5',
          border: '2px solid #10b981',
          color: '#065f46',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <CheckCircle2 size={24} />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Col: Clinical Analytics & CSI Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* CSI Big Score Card */}
          <div className="dashboard-card">
            <div className="csi-gauge-banner">
              <div>
                <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: '#059669', letterSpacing: '0.5px' }}>
                  {t.csiScoreTitle}
                </span>
                <div className="csi-big-number">
                  {todayCsi.compositeCsi} <span style={{ fontSize: '24px', fontWeight: 600, color: '#64748b' }}>/ 100</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#047857', fontWeight: 700, marginTop: '4px' }}>
                  <ShieldCheck size={18} />
                  <span>{t.stableStatus}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                  {profile.name} • {profile.age} Yrs
                </span>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {profile.dementiaStage}
                </p>
              </div>
            </div>

            {/* Domain Breakdown Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
              <div style={{ padding: '14px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>{t.memoryDomain}</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#064e3b' }}>{todayCsi.memoryScore}%</div>
              </div>
              <div style={{ padding: '14px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>{t.executiveDomain}</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#b45309' }}>{todayCsi.executiveScore}%</div>
              </div>
              <div style={{ padding: '14px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>{t.attentionDomain}</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0369a1' }}>{todayCsi.attentionScore}%</div>
              </div>
              <div style={{ padding: '14px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>{t.motorStabilityDomain}</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>{todayCsi.motorStabilityScore}%</div>
              </div>
            </div>

            {/* 7-Day Trend Chart */}
            <div style={{ marginTop: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={20} />
                  <span>{t.sevenDayTrend}</span>
                </h3>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Score Range: 0 - 100</span>
              </div>

              <div className="trend-chart-container">
                {past7Days.map((day, idx) => (
                  <div key={day.date} className="trend-bar-col">
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                      {day.compositeCsi}
                    </span>
                    <div
                      className={`trend-bar ${idx === past7Days.length - 1 ? 'highlight' : ''}`}
                      style={{ height: `${day.compositeCsi * 1.5}px` }}
                      title={`${day.date}: CSI ${day.compositeCsi}`}
                    />
                    <span className="trend-label">
                      {day.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Notes Banner */}
            <div style={{ marginTop: '24px', padding: '16px 20px', borderRadius: '16px', background: '#fffbeb', border: '1px solid #fde68a' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>
                ASHA Clinical Observation
              </span>
              <p style={{ fontSize: '14px', color: '#78350f', marginTop: '4px' }}>
                {todayCsi.clinicalNote}
              </p>
            </div>
          </div>

          {/* Memory Vault Section */}
          <div className="dashboard-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#064e3b' }}>
                  {t.memoryVaultTitle}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  {vaultItems.length} items configured (Facial recognition & cultural anchors)
                </p>
              </div>

              <button
                className="btn-routine-action"
                style={{ background: '#059669', color: 'white', borderColor: '#059669' }}
                onClick={() => setIsAddingVaultItem(!isAddingVaultItem)}
              >
                <Plus size={18} />
                <span>{t.addFamilyPhoto}</span>
              </button>
            </div>

            {/* Add Vault Item Form */}
            {isAddingVaultItem && (
              <form onSubmit={handleSaveVaultItem} style={{
                background: '#f8fafc',
                border: '2px solid #cbd5e1',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{t.addFamilyPhoto}</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{t.photoTitleLabel} (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. Grandson Rohan"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{t.photoTitleLabel} (অসমীয়া)</label>
                    <input
                      type="text"
                      placeholder="যেনে: নাতি ৰোহন"
                      value={newTitleAs}
                      onChange={e => setNewTitleAs(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{t.relationLabel} (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. Grandson"
                      value={newRelation}
                      onChange={e => setNewRelation(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{t.relationLabel} (অসমীয়া)</label>
                    <input
                      type="text"
                      placeholder="যেনে: মৰমৰ নাতি"
                      value={newRelationAs}
                      onChange={e => setNewRelationAs(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Photo Image URL / File link</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{t.voicePromptLabel} (কণ্ঠস্বৰ)</label>
                  <input
                    type="text"
                    placeholder="যেনে: এইয়া আপোনাৰ নাতি ৰোহন, দিল্লীত অভিযন্তা।"
                    value={newVoicePromptAs}
                    onChange={e => setNewVoicePromptAs(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="submit"
                    className="btn-routine-action"
                    style={{ background: '#059669', color: 'white', borderColor: '#059669', flex: 1 }}
                  >
                    <span>{t.saveToVault}</span>
                  </button>
                  <button
                    type="button"
                    className="btn-back-kiosk"
                    style={{ minHeight: '44px' }}
                    onClick={() => setIsAddingVaultItem(false)}
                  >
                    <span>{t.cancel}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Vault items cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {vaultItems.map((item) => (
                <div key={item.id} style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: 'white',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ height: '120px', width: '100%', position: 'relative' }}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      fontSize: '11px',
                      fontWeight: 800,
                      background: 'rgba(0,0,0,0.65)',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '999px'
                    }}>
                      {item.category}
                    </span>
                  </div>

                  <div style={{ padding: '12px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                      {language === 'as' ? item.titleAssamese : item.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {language === 'as' ? item.relationshipAssamese : item.relationship}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        className="btn-routine-action"
                        style={{ flex: 1, minHeight: '36px', fontSize: '12px' }}
                        onClick={() => handlePreviewSpeech(item.audioPromptAssamese)}
                        title="Preview Speech Prompt"
                      >
                        <Volume2 size={16} />
                      </button>

                      {item.isCustomUploaded && (
                        <button
                          className="btn-routine-action"
                          style={{ borderColor: '#f87171', color: '#dc2626', minHeight: '36px' }}
                          onClick={() => handleDeleteVaultItem(item.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: PHC Sync & Telemetry Pipeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* PHC Delta Sync Status Card */}
          <div className="dashboard-card" style={{ borderTop: '6px solid #0284c7' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HeartHandshake size={22} color="#0284c7" />
              <span>PHC Health Network Sync</span>
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              {t.simulatedHealthPost}
            </p>

            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: 700 }}>QUEUED OFFLINE PACKETS</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#075985' }}>
                {syncStatus.pendingRecordsCount}
              </div>
              <span style={{ fontSize: '12px', color: '#0284c7' }}>
                {syncStatus.pendingRecordsCount > 0 ? t.pendingSyncCount : 'All sessions synced'}
              </span>
            </div>

            <div style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
              Last Sync:{' '}
              <strong>
                {syncStatus.lastSyncTimestamp
                  ? new Date(syncStatus.lastSyncTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Pending first sync'}
              </strong>
            </div>

            <button
              className="btn-game-play btn-play-blue"
              style={{ minHeight: '52px', fontSize: '16px' }}
              onClick={handleSyncWithPhc}
              disabled={isSyncing}
            >
              <RefreshCw size={20} className={isSyncing ? 'pulse-dot' : ''} />
              <span>{isSyncing ? 'Transmitting Diff...' : 'Force Sync to PHC'}</span>
            </button>
          </div>

          {/* Geriatric Patient Info Card */}
          <div className="dashboard-card">
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="#059669" />
              <span>Clinical Baseline</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Baseline Latency</span>
                <strong>{profile.baselineLatencyMs} ms</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Primary Dialect</span>
                <strong>{profile.primaryDialect}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Emergency Contact</span>
                <strong>{profile.emergencyContact}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Dementia Protocol</span>
                <strong style={{ color: '#d97706' }}>NER-ASHA-MCI-v2</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
