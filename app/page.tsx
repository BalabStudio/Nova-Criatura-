"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import { Calendar } from "@/components/calendar";
import members from "@/data/members.json";
import cards from "@/data/cards.json";

type CardItem = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  description?: string;
  time?: string;
};

export default function Page() {
  const router = useRouter();
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [assignment, setAssignment] = useState<{
    assignment: { member: string; date: string; cardId: string };
    card: CardItem;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const cardRef = useRef<HTMLElement>(null);

  // Pre-load de imagens para que o download seja instantâneo e sem bugs
  useEffect(() => {
    cards.forEach((card) => {
      const img = new Image();
      img.src = card.image;
    });
  }, []);

  const downloadCard = async () => {
    if (cardRef.current === null) return;
    setLoading(true);
    try {
      // Função para converter imagem em Data URL (Base64)
      // Essencial para Safari/iOS renderizar o card completo
      const toDataURL = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL('image/png'));
            } else {
              reject(new Error('Canvas context failed'));
            }
          };
          img.onerror = reject;
          img.src = url;
        });
      };

      // Preparação: Converte todas as imagens para Base64 antes da captura
      const images = cardRef.current.querySelectorAll('img');
      const originalSrcs: string[] = [];
      for (let i = 0; i < images.length; i++) {
        originalSrcs.push(images[i].src);
        try {
          const b64 = await toDataURL(images[i].src);
          images[i].src = b64;
        } catch (e) {
          console.warn('Fallback: image to dataUrl failed', e);
        }
      }

      // Pequeno delay para o Safari registrar a troca de source
      await new Promise(resolve => setTimeout(resolve, 300));

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: false, // Usando Base64 não precisa de cacheBust
        backgroundColor: '#ffffff',
        pixelRatio: 2.5, // Ultra nítido
        style: {
          borderRadius: '0px', // Evita artefatos nas bordas na captura
          margin: '0',
          padding: '0',
          transform: 'scale(1)',
          background: '#ffffff'
        } as any,
      });

      // Restaura os links originais
      images.forEach((img, i) => img.src = originalSrcs[i]);

      const link = document.createElement('a');
      link.download = `card-${assignment?.assignment.member}-${assignment?.assignment.date}.png`.toLowerCase();
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erro ao baixar card:', err);
      setErrorMsg("Erro ao processar imagem no iPhone. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const pickFunction = useCallback(async () => {
    if (!selectedMember || !selectedDate) return;
    setLoading(true);
    setErrorMsg(null);
    setAssignment(null);
    try {
      const res = await fetch("/api/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member: selectedMember, date: selectedDate }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || `Falha (HTTP ${res.status})`);
      }
      const data = await res.json();
      setAssignment(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedMember, selectedDate]);

  const resetAssignmentsHandler = useCallback(async () => {
    if (!selectedDate) {
      setResetMsg("Selecione uma data primeiro.");
      return;
    }
    setResetMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, date: selectedDate, adminName: selectedMember }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || `Falha (HTTP ${res.status})`);
      }
      setAssignment(null);
      setResetMsg(`Sorteios de ${selectedDate} foram zerados.`);
    } catch (err: any) {
      setResetMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, [password, selectedDate, selectedMember]);

  const readyToPick = selectedMember && selectedDate && !assignment;
  const isAdmin = selectedMember === "Richard";

  return (
    <main className="container">
      <header className="header">
        <div style={{ flex: 1 }}>
          <h1 className="title">Programação mais TOP de uma Célula de Todos os Tempos 🔥</h1>
          <p className="subtitle">
            Selecione o seu nome e a data da célula, depois clique em "Escolher" para receber sua função.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/programacao" style={{ textDecoration: "none" }}>
            <button className="btn" style={{ marginBottom: 0, width: "auto", padding: "10px 16px", fontSize: "12px", fontWeight: 600 }}>
              Ver Programação
            </button>
          </Link>
          {isAdmin && selectedDate && (
            <button
              className="btn"
              style={{ marginBottom: 0, width: "auto", padding: "10px 16px", fontSize: "12px", fontWeight: 600, backgroundColor: '#0070f3' }}
              onClick={() => {
                if (password === "novacriatura01") {
                  router.push(`/programacao?edit=true&date=${selectedDate}`);
                } else {
                  setErrorMsg("Senha de admin incorreta para acessar a edição.");
                }
              }}
            >
              Editar Programação
            </button>
          )}
        </div>
      </header>

      <div className="grid">
        <label htmlFor="member-select" className="cardTitle">Participante</label>
        <select
          id="member-select"
          className="cardSub"
          value={selectedMember}
          onChange={(e) => {
            setSelectedMember(e.target.value);
            setAssignment(null);
            setErrorMsg(null);
          }}
        >
          <option value="">Selecione...</option>
          {members.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <label className="cardTitle" style={{ marginTop: 10 }}>
          Selecione o Dia
        </label>
        <Calendar
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setAssignment(null);
            setErrorMsg(null);
            // Verifica se é sábado para orientar o usuário
            const day = new Date(date + "T12:00:00Z").getDay();
            if (day !== 6) {
              setErrorMsg("Nota: Geralmente as células são aos Sábados. Você selecionou um dia diferente.");
            }
          }}
        />

        {isAdmin && (
          <>
            <label htmlFor="pwd" className="cardTitle" style={{ marginTop: 10 }}>Senha (admin)</label>
            <input
              id="pwd"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="cardSub"
            />
          </>
        )}

        <button
          className="btn"
          onClick={pickFunction}
          disabled={!readyToPick || loading || (isAdmin && !password)}
          aria-busy={loading}
        >
          {loading ? "Processando..." : "Escolher função"}
        </button>
        {isAdmin && (
          <button
            className="btn"
            style={{ marginTop: 8, backgroundColor: "#d9534f" }}
            onClick={resetAssignmentsHandler}
            disabled={loading || !password || !selectedDate}
            aria-busy={loading}
          >
            {loading ? "Aguarde..." : "Zerar semana atual"}
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="cardBody">
            <p className="cardDesc">{errorMsg}</p>
          </div>
        </div>
      )}
      {resetMsg && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="cardBody">
            <p className="cardTitle">Admin</p>
            <p className="cardDesc">{resetMsg}</p>
          </div>
        </div>
      )}

      {loading && !assignment && (
        <div className="card" style={{ marginTop: 12, padding: '20px', textAlign: 'center', backgroundColor: '#ffffff', border: '1px solid #e1eaef' }}>
          <div className="skeleton-media" style={{ width: '100%', aspectRatio: '16/10', borderRadius: '8px', background: '#f5f5f5', marginBottom: '16px' }}></div>
          <div className="skeleton-text" style={{ height: '20px', width: '60%', background: '#f5f5f5', borderRadius: '4px', margin: '0 auto 8px' }}></div>
          <div className="skeleton-text" style={{ height: '14px', width: '80%', background: '#f5f5f5', borderRadius: '4px', margin: '0 auto' }}></div>
          <p style={{ marginTop: '16px', fontSize: '13px', color: '#888' }}>Sorteando sua função...</p>
        </div>
      )}

      {assignment && (
        <article 
          ref={cardRef} 
          className="card" 
          style={{ 
            marginTop: 12, 
            backgroundColor: '#ffffff', 
            border: '1px solid #e1eaef',
            animation: 'fadeIn 0.4s ease-out' 
          }}
        >
          <div className="cardMedia" style={{ backgroundColor: '#ffffff', height: '260px', overflow: 'hidden' }}>
            <img
              src={assignment.card.image || "/placeholder.svg"}
              alt={assignment.card.title}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                objectFit: 'cover', // Preenche todo o topo do card para um visual mais premium
                background: '#ffffff'
              }}
            />
          </div>
          <div className="cardBody" style={{ backgroundColor: '#ffffff', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 className="cardTitle" style={{ color: '#0c228f', fontSize: '24px', fontWeight: 800, margin: 0 }}>
                  {assignment.card.title}
                </h2>
                {assignment.card.subtitle && (
                  <p style={{ color: '#555555', fontSize: '14px', fontWeight: 600, margin: '4px 0 0' }}>
                    {assignment.card.subtitle}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#0c228f', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Nova Criatura
                </span>
              </div>
            </div>

            {assignment.card.description && (
              <p style={{ color: '#333333', marginTop: '20px', fontSize: '15px', lineHeight: '1.6', fontWeight: 400 }}>
                {assignment.card.description}
              </p>
            )}

            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: 0, fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Data</p>
                <p style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: 700, color: '#0f1419' }}>{assignment.assignment.date}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Participante</p>
                <p style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: 700, color: '#0f1419' }}>{assignment.assignment.member}</p>
              </div>
            </div>
          </div>
        </article>
      )}

      {assignment && (
        <button
          className="btn"
          style={{
            marginTop: 12,
            backgroundColor: '#0c228f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onClick={downloadCard}
        >
          <Download size={18} />
          <span>Card</span>
        </button>
      )}
    </main>
  );
}
