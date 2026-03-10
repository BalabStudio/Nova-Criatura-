"use client";

import { useCallback, useEffect, useState, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import { Calendar } from "@/components/calendar";
import members from "@/data/members.json";
import cards from "@/data/cards.json";

interface ScheduleData {
  date: string;
  weekday: string;
  horario: string;
  funcoes: {
    oracao?: string;
    louvor?: string;
    dinamica?: string;
    visao?: string;
    facilitacao: string;
    oferta?: string;
    comunhao: string[];
  };
  version?: number;
  isSnapshot?: boolean;
}

const EMOJI_MAP: Record<string, string> = {
  oracao: "🙏🏼",
  louvor: "🔥",
  dinamica: "🎈",
  visao: "🍃",
  facilitacao: "📖",
  oferta: "📩",
  comunhao: "🥪🥤",
};

const LABEL_MAP: Record<string, string> = {
  oracao: "Oração Inicial",
  louvor: "Louvor",
  dinamica: "Dinâmica",
  visao: "Visão",
  facilitacao: "Facilitação",
  oferta: "Oferta",
  comunhao: "Comunhão",
};

// Re-map for saving
const ROLE_TO_CARD: Record<string, string> = {
  oracao: "oracao",
  louvor: "louvor",
  dinamica: "quebra-gelo",
  visao: "visao",
  oferta: "oferta",
  comunhao: "lanche",
  facilitacao: "facilitacao",
};

function ProgramacaoContent() {
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<string>(searchParams.get("date") || "");
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [editMode, setEditMode] = useState(searchParams.get("edit") === "true");
  const scheduleRef = useRef<HTMLElement>(null);

  // Pre-load de imagens para que o download do Card de Programação seja rápido
  useEffect(() => {
    cards.forEach((card) => {
      const img = new Image();
      img.src = card.image;
    });
  }, []);

  const downloadScheduleCard = async () => {
    if (scheduleRef.current === null) return;
    setLoading(true);
    try {
      // Pequeno delay para garantir que o DOM está estável e imagens renderizadas
      await new Promise(resolve => setTimeout(resolve, 500));

      // Função para converter imagem em Data URL (Base64) - Essencial para Safari
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
              reject(new Error('Canvas failure'));
            }
          };
          img.onerror = reject;
          img.src = url;
        });
      };

      // Converte imagens do card para Base64 antes da captura
      const images = scheduleRef.current.querySelectorAll('img');
      const originalSrcs: string[] = [];
      for (let i = 0; i < images.length; i++) {
        originalSrcs.push(images[i].src);
        try {
          const b64 = await toDataURL(images[i].src);
          images[i].src = b64;
        } catch (e) {
          console.warn('Fallback base64 failed', e);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      const dataUrl = await toPng(scheduleRef.current, {
        cacheBust: false,
        backgroundColor: '#ffffff',
        pixelRatio: 2.5,
        style: {
          borderRadius: '0px',
          margin: '0',
          padding: '24px',
          transform: 'scale(1)',
          background: '#ffffff',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        } as any,
      });

      // Restaura srcs
      images.forEach((img, i) => img.src = originalSrcs[i]);

      const link = document.createElement('a');
      link.download = `programacao-${selectedDate || 'geral'}.png`.toLowerCase();
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erro ao baixar programação:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDate = useCallback(async (date: string) => {
    setSelectedDate(date);
    setSchedule(null);
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/schedule?date=${date}`, { cache: 'no-store' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha ao carregar programação");
      }
      const data = await res.json();
      setSchedule(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      handleSelectDate(selectedDate);
    }
  }, [selectedDate, handleSelectDate]);

  const handleEditChange = (role: string, member: string) => {
    if (!schedule) return;
    setSchedule({
      ...schedule,
      funcoes: {
        ...schedule.funcoes,
        [role]: member
      }
    });
  };

  const handleComunhaoChange = (index: number, member: string) => {
    if (!schedule) return;
    // Garante que temos um array de pelo menos 3 posições
    const currentComunhao = [...(schedule.funcoes.comunhao || [])];
    while (currentComunhao.length < 3) currentComunhao.push("");

    currentComunhao[index] = member;

    setSchedule({
      ...schedule,
      funcoes: {
        ...schedule.funcoes,
        comunhao: currentComunhao
      }
    });
  };
  const handleHorarioChange = (val: string) => {
    if (!schedule) return;
    setSchedule({ ...schedule, horario: val });
  };
  const handleSave = async () => {
    if (!schedule || !password) return;
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Prepara os assignments pro backend
      const assignments: { member: string; cardId: string }[] = [];
      Object.entries(schedule.funcoes).forEach(([role, member]) => {
        if (role === 'comunhao') {
          (member as string[]).forEach(m => {
            if (m) assignments.push({ member: m, cardId: ROLE_TO_CARD[role] });
          });
        } else if (member && ROLE_TO_CARD[role]) {
          assignments.push({ member: member as string, cardId: ROLE_TO_CARD[role] });
        }
      });

      const res = await fetch("/api/schedule/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          date: schedule.date,
          adminName: "Richard", // Richard é o único que pode abrir o modo edit via lobby
          assignments,
          fullSchedule: schedule
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha ao salvar alterações");
      }

      setSuccessMsg("Programação salva com sucesso e snapshot gerado!");
      setEditMode(false);
      handleSelectDate(schedule.date); // Recarrega
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split("-");
    return `${day}.${month}`;
  };

  const renderMember = (name?: string) => {
    return name ? <span style={{ fontWeight: 600, color: '#0f1419' }}>{name}</span> : <span style={{ color: "#888888" }}>A definir</span>;
  };

  return (
    <main className="container">
      <header className="header">
        <div style={{ flex: 1 }}>
          <h1 className="title">{editMode ? "Editar Programação" : "Programação"}</h1>
          <p className="subtitle">
            {editMode ? " Richard, ajuste as funções conforme necessário." : "Selecione uma data para ver quem vai fazer cada função."}
          </p>
        </div>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button className="btn" style={{ marginBottom: 0, width: "auto", padding: "10px 16px", fontSize: "12px", fontWeight: 600 }}>
            Home
          </button>
        </Link>
      </header>

      <div className="grid">
        {!editMode && (
          <>
            <label className="cardTitle">Escolha a Data</label>
            <Calendar selectedDate={selectedDate} onSelectDate={handleSelectDate} />
          </>
        )}

        {(errorMsg || successMsg) && (
          <div className="card" style={{ marginTop: 12, borderColor: errorMsg ? '#d9534f' : '#28a745' }}>
            <div className="cardBody">
              {successMsg && <p className="cardTitle" style={{ color: '#28a745' }}>Sucesso</p>}
              <p className="cardDesc">{errorMsg || successMsg}</p>
            </div>
          </div>
        )}

        {schedule && (
          <article ref={scheduleRef} className="card" style={{ marginTop: 12, backgroundColor: '#ffffff', border: '1px solid #e1eaef' }}>
            <div className="cardBody" style={{ backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="cardTitle" style={{ color: '#0f1419' }}>
                  Nova Criatura — {schedule.weekday} {formatDate(schedule.date)} às {schedule.horario}
                </h2>
                {schedule.version && (
                  <span style={{ fontSize: '10px', color: '#888' }}>v{schedule.version}</span>
                )}
              </div>

              <div style={{ marginTop: 14, lineHeight: 1.8 }}>
                {["oracao", "louvor", "dinamica", "visao", "facilitacao", "oferta"].map((role) => (
                  <div key={role} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ minWidth: '140px', color: '#0f1419' }}>{EMOJI_MAP[role]} {LABEL_MAP[role]}:</span>
                    {editMode ? (
                      <select
                        className="cardSub"
                        value={schedule.funcoes[role as keyof typeof schedule.funcoes] as string || ""}
                        onChange={(e) => handleEditChange(role, e.target.value)}
                        style={{ padding: '4px', fontSize: '14px', flex: 1 }}
                      >
                        <option value="">A definir</option>
                        {members.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    ) : (
                      renderMember(schedule.funcoes[role as keyof typeof schedule.funcoes] as string)
                    )}
                  </div>
                ))}

                <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ minWidth: '140px', color: '#0f1419' }}>{LABEL_MAP.comunhao} {EMOJI_MAP.comunhao}</span>
                  </div>
                  {editMode ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      {[0, 1, 2].map(idx => (
                        <select
                          key={idx}
                          className="cardSub"
                          value={schedule.funcoes.comunhao[idx] || ""}
                          onChange={(e) => handleComunhaoChange(idx, e.target.value)}
                          style={{ padding: '4px', fontSize: '14px' }}
                        >
                          <option value="">A definir</option>
                          {members.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      ))}
                    </div>
                  ) : (
                    (() => {
                      const active = (schedule.funcoes.comunhao || []).filter(m => m && m.trim() !== "");
                      return active.length > 0 ? (
                        <span style={{ fontWeight: 600 }}>{active.join(", ")}</span>
                      ) : (
                        <span style={{ color: "rgba(15, 20, 25, 0.4)" }}>A definir</span>
                      );
                    })()
                  )}
                </div>

                {editMode && (
                  <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px dashed #eee', paddingTop: '12px' }}>
                    <span style={{ minWidth: '140px' }}>⏰ Horário:</span>
                    <input
                      type="text"
                      className="cardSub"
                      value={schedule.horario}
                      onChange={(e) => handleHorarioChange(e.target.value)}
                      style={{ padding: '4px', fontSize: '14px', flex: 1 }}
                      placeholder="Ex: 17:00"
                    />
                  </div>
                )}

                {editMode && (
                  <div style={{ marginTop: 20, borderTop: '1px solid #eee', paddingTop: 16 }}>
                    <label className="cardTitle" style={{ fontSize: '14px' }}>Senha de Admin para Salvar</label>
                    <input
                      type="password"
                      className="cardSub"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Senha do Richard"
                      style={{ marginBottom: 16 }}
                    />
                    <button
                      className="btn"
                      disabled={saving || !password}
                      onClick={handleSave}
                    >
                      {saving ? "Salvando..." : "Salvar Alterações"}
                    </button>
                    <button
                      className="btn"
                      style={{ backgroundColor: '#ccc', marginTop: 8 }}
                      onClick={() => setEditMode(false)}
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </article>
        )}

        {schedule && !editMode && (
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
            onClick={downloadScheduleCard}
          >
            <Download size={18} />
            <span>Card</span>
          </button>
        )}

        {!schedule && !errorMsg && selectedDate && loading && (
          <div className="card" style={{ marginTop: 12, padding: '16px', backgroundColor: '#ffffff', border: '1px solid #e1eaef' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div className="skeleton-text" style={{ height: '24px', width: '70%', borderRadius: '4px' }}></div>
              <div className="skeleton-text" style={{ height: '14px', width: '10%', borderRadius: '4px' }}></div>
            </div>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' }}>
                <div className="skeleton-text" style={{ height: '16px', width: '30%', borderRadius: '4px' }}></div>
                <div className="skeleton-text" style={{ height: '16px', width: '50%', borderRadius: '4px' }}></div>
              </div>
            ))}
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '10px' }}>Buscando programação...</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ProgramacaoPage() {
  return (
    <Suspense fallback={
      <main className="container">
        <header className="header" style={{ marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <div className="skeleton-text" style={{ height: '28px', width: '50%', borderRadius: '6px' }}></div>
            <div className="skeleton-text" style={{ height: '16px', width: '80%', borderRadius: '4px', marginTop: '8px' }}></div>
          </div>
        </header>
        <div className="grid">
          <div className="calendar" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <p style={{ color: '#ccc', fontSize: '13px' }}>Preparando calendário...</p>
          </div>
        </div>
      </main>
    }>
      <ProgramacaoContent />
    </Suspense>
  );
}
