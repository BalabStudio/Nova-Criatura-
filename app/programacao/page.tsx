"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Calendar } from "@/components/calendar";
import members from "@/data/members.json";

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
    return name ? <span style={{ fontWeight: 600 }}>{name}</span> : <span style={{ color: "rgba(15, 20, 25, 0.4)" }}>A definir</span>;
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
          <article className="card" style={{ marginTop: 12 }}>
            <div className="cardBody">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="cardTitle">
                  Nova Criatura — {schedule.weekday} {formatDate(schedule.date)} às {schedule.horario}
                </h2>
                {schedule.version && (
                  <span style={{ fontSize: '10px', color: '#888' }}>v{schedule.version}</span>
                )}
              </div>

              <div style={{ marginTop: 14, lineHeight: 1.8 }}>
                {["oracao", "louvor", "dinamica", "visao", "facilitacao", "oferta"].map((role) => (
                  <div key={role} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ minWidth: '140px' }}>{EMOJI_MAP[role]} {LABEL_MAP[role]}:</span>
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
                    <span style={{ minWidth: '140px' }}>{LABEL_MAP.comunhao} {EMOJI_MAP.comunhao}</span>
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

        {!schedule && !errorMsg && selectedDate && loading && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="cardBody">
              <p className="cardTitle">Carregando...</p>
            </div>
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
        <header className="header" style={{ justifyContent: 'center' }}>
          <p className="subtitle">Carregando...</p>
        </header>
      </main>
    }>
      <ProgramacaoContent />
    </Suspense>
  );
}
