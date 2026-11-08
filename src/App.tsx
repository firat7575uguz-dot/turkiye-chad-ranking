import { supabase } from './supabaseClient';
import React, { useState, useEffect } from 'react';

// Başlangıç Adayları Listesi (Puan kaldırıldı, sadece oy sayısı var)
const initialCandidates = [
  { id: '1', name: 'GigaChad (Ernest Khalimov)', desc: 'İkonik jawline ve kusursuz genetik.', votes: 420, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60' },
  { id: '2', name: 'Jordan Barrett', desc: 'Hunter eyes ve yüksek elmacık kemikleri.', votes: 310, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60' },
  { id: '3', name: 'Chico Lachowski', desc: 'Klasik lise crush aesthetic kralı.', votes: 290, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60' }
];

export default function App() {
  const currentMonthKey = new Date().toISOString().slice(0, 7);

  const [candidates, setCandidates] = useState(() => {
    const saved = localStorage.getItem('turkiye_chads');
    const savedMonth = localStorage.getItem('ranking_month');
    
    // Eğer ay değiştiyse adayların oylarını sıfırdan başlat
    if (savedMonth !== currentMonthKey) {
      localStorage.setItem('ranking_month', currentMonthKey);
      localStorage.removeItem('last_voted_month');
      return initialCandidates;
    }
    
    return saved ? JSON.parse(saved) : initialCandidates;
  });

  const [activeTab, setActiveTab] = useState('leaderboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasVotedThisMonth, setHasVotedThisMonth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImg, setNewImg] = useState('');

  // Ay değişimi kontrolü (Canlı takip)
  useEffect(() => {
    const savedMonth = localStorage.getItem('ranking_month');
    if (savedMonth !== currentMonthKey) {
      setCandidates(prev => prev.map(c => ({ ...c, votes: 0 })));
      localStorage.setItem('ranking_month', currentMonthKey);
      localStorage.removeItem('last_voted_month');
      setHasVotedThisMonth(false);
    }
  }, [currentMonthKey]);

  useEffect(() => {
    localStorage.setItem('turkiye_chads', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    const lastVotedMonth = localStorage.getItem('last_voted_month');
    if (lastVotedMonth === currentMonthKey) {
      setHasVotedThisMonth(true);
    }
  }, [currentMonthKey]);

  const handleVote = (id) => {
    if (hasVotedThisMonth) {
      alert("Bu ayki oy hakkını zaten kullandın!");
      return;
    }
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, votes: c.votes + 1 } : c));
    localStorage.setItem('last_voted_month', currentMonthKey);
    setHasVotedThisMonth(true);
    alert("Oyun başarıyla kaydedildi!");
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassInput === 'Fu16042!') {
      setIsAdmin(true);
      setShowAdminModal(false);
      setAdminPassInput('');
    } else {
      alert('Hatalı Şifre!');
    }
  };

  const handleAddCandidate = (e) => {
    e.preventDefault();
    if (!newName || !newImg) return;
    const newEntry = {
      id: Date.now().toString(),
      name: newName,
      desc: newDesc || 'Chad topluluğu üyesi.',
      votes: 0,
      image: newImg
    };
    setCandidates([newEntry, ...candidates]);
    supabase
      .from('chads')
      .insert([newEntry])
      .then(() => {});
    setNewName('');
    setNewDesc('');
    setNewImg('');
    setShowAddCandidateModal(false);
  };

  const handleDeleteCandidate = (id) => {
    if (confirm("Bu adayı silmek istediğine emin misin?")) {
      setCandidates(candidates.filter(c => c.id !== id));
    }
  };

  // Oylara göre sıralama
  const sortedCandidates = [...candidates]
    .sort((a, b) => b.votes - a.votes)
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif', padding: '20px', boxSizing: 'border-box', paddingBottom: '80px' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #262626', paddingBottom: '15px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="32" height="22" viewBox="0 0 1200 800" style={{ borderRadius: '3px', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            <rect width="1200" height="800" fill="#E30A17"/>
            <circle cx="425" cy="400" r="200" fill="#ffffff"/>
            <circle cx="475" cy="400" r="160" fill="#E30A17"/>
            <polygon points="583.33,400 706.27,439.95 630.29,328.65 630.29,471.35 706.27,360.05" fill="#ffffff"/>
          </svg>
          <h1 style={{ color: '#E30A17', margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px' }}>TURKIYE CHAD RANKING</h1>
        </div>
        <div>
          {isAdmin ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setIsAdmin(false)} style={{ background: '#262626', color: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Çıkış</button>
            </div>
          ) : (
            <button onClick={() => setShowAdminModal(true)} style={{ background: '#171717', color: '#bbb', border: '1px solid #333', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Admin
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: '800px', margin: '20px auto 0 auto' }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setActiveTab('leaderboard')} style={{ flex: 1, padding: '12px', background: activeTab === 'leaderboard' ? '#E30A17' : '#171717', color: activeTab === 'leaderboard' ? '#fff' : '#aaa', border: activeTab === 'leaderboard' ? 'none' : '1px solid #262626', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Türkiye Top 50</button>
          <button onClick={() => setActiveTab('vote')} style={{ flex: 1, padding: '12px', background: activeTab === 'vote' ? '#E30A17' : '#171717', color: activeTab === 'vote' ? '#fff' : '#aaa', border: activeTab === 'vote' ? 'none' : '1px solid #262626', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Kim Mogglar? (Oy Ver)</button>
        </div>

        {/* Search Bar */}
        <input 
          type="text" 
          placeholder="Adaylarda arama yap..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', marginTop: '15px', padding: '12px', background: '#171717', border: '1px solid #262626', color: '#fff', borderRadius: '8px', outline: 'none' }}
        />

        {/* TAB 1: Top 50 */}
        {activeTab === 'leaderboard' && (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sortedCandidates.map((c, index) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', background: '#171717', padding: '14px', borderRadius: '12px', border: index === 0 ? '1px solid #E30A17' : '1px solid #262626' }}>
                <span style={{ width: '40px', fontWeight: '900', color: index === 0 ? '#E30A17' : '#777', fontSize: '16px' }}>#{index + 1}</span>
                <img src={c.image} alt={c.name} style={{ width: '55px', height: '55px', borderRadius: '10px', objectFit: 'cover', marginRight: '15px', border: '1px solid #333' }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', fontSize: '16px', color: '#fff' }}>{c.name} {index === 0 && '👑'}</strong>
                  <small style={{ color: '#888', fontSize: '13px' }}>{c.desc}</small>
                  <div style={{ fontSize: '12px', color: '#E30A17', marginTop: '4px', fontWeight: 'bold' }}>Bu Ay Aldığı Oy: {c.votes}</div>
                </div>
                {isAdmin && (
                  <button onClick={() => handleDeleteCandidate(c.id)} style={{ background: '#262626', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Sil</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: Oy Ver */}
        {activeTab === 'vote' && (
          <div style={{ marginTop: '20px' }}>
            {hasVotedThisMonth ? (
              <div style={{ background: '#171717', padding: '40px', textAlign: 'center', borderRadius: '12px', border: '1px solid #262626' }}>
                <h2 style={{ color: '#E30A17', margin: '0 0 10px 0' }}>Bu Ayki Oy Hakkını Kullandın!</h2>
                <p style={{ color: '#888', margin: 0 }}>Gelecek ay sıfırlandığında tekrar oy kullanabilirsin.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ color: '#888', fontSize: '13px', margin: '0 0 5px 0' }}>* Listeye eklenen tüm adaylar burada görünür ve oy alabilir.</p>
                {sortedCandidates.map((c) => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#171717', padding: '14px', borderRadius: '12px', border: '1px solid #262626' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={c.image} alt={c.name} style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #333' }} />
                      <div>
                        <strong style={{ fontSize: '15px', color: '#fff' }}>{c.name}</strong>
                        <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Bu Ayki Oyu: {c.votes}</div>
                      </div>
                    </div>
                    <button onClick={() => handleVote(c.id)} style={{ background: '#E30A17', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>OY VER</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

{/* Footer */}
<footer style={{ textAlign: 'center', padding: '30px 20px', color: '#888', fontSize: '14px', borderTop: '1px solid #222', marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: '#E30A17', fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px' }}>SİTE KURUCUSU / FOUNDER</div>
          <img src="https://i.imgur.com/EfzhpTg.jpeg" alt="Fırat Uğuz" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E30A17', boxShadow: '0 0 12px rgba(227, 10, 23, 0.4)' }} />
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>Fırat Uğuz</div>
          <div>Türkiye Resmi Chad Ranking Platformu © 2026</div>
        </footer>
      </div>

      {/* Admin Modal */}
      {showAdminModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <form onSubmit={handleAdminLogin} style={{ background: '#171717', padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', width: '300px', border: '1px solid #333' }}>
            <h3 style={{ margin: 0, color: '#E30A17', fontSize: '18px' }}>Admin Girişi</h3>
            <input type="password" placeholder="Şifre " value={adminPassInput} onChange={(e) => setAdminPassInput(e.target.value)} style={{ padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '8px', outline: 'none' }} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
              <button type="button" onClick={() => setShowAdminModal(false)} style={{ flex: 1, padding: '10px', background: '#262626', color: '#aaa', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>İptal</button>
              <button type="submit" style={{ flex: 1, padding: '10px', background: '#E30A17', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Giriş</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}