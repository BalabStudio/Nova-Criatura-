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
      // Pequeno delay para garantir que o DOM está estável e imagens renderizadas
      await new Promise(resolve => setTimeout(resolve, 500));

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true, // Garante que as imagens não venham de cache bugado
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        style: {
          borderRadius: '14px',
          margin: '0',
          padding: '0',
          transform: 'scale(1)',
          background: '#ffffff',
          // Garante que o texto fique legível e com cores corretas
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        } as any,
      });

      const link = document.createElement('a');
      link.download = `card-${assignment?.assignment.member}-${assignment?.assignment.date}.png`.toLowerCase();
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erro ao baixar card:', err);
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
          <div className="cardMedia" style={{ backgroundColor: '#ffffff' }}>
            <img
              src={assignment.card.image || "/placeholder.svg"}
              alt={assignment.card.title}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                objectFit: 'contain',
                background: '#ffffff'
              }}
            />
          </div>
          <div className="cardBody" style={{ backgroundColor: '#ffffff' }}>
            <h2 className="cardTitle" style={{ color: '#0f1419' }}>{assignment.card.title}</h2>
            {assignment.card.subtitle && (
              <p className="cardSub" style={{ color: '#555555', marginTop: '4px' }}>{assignment.card.subtitle}</p>
            )}
            {assignment.card.description && (
              <p className="cardDesc" style={{ color: '#444444', marginTop: '12px' }}>{assignment.card.description}</p>
            )}
            <p className="cardSub" style={{ marginTop: 16, color: '#0f1419' }}>
              <strong>Data:</strong> {assignment.assignment.date}
            </p>
            <p className="cardSub" style={{ color: '#0f1419' }}>
              <strong>Participante:</strong> {assignment.assignment.member}
            </p>
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
