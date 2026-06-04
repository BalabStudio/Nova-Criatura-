"use client";

import { useCallback, useEffect, useState, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
import { Calendar } from "@/components/calendar";
import { CustomSelect } from "@/components/ui/custom-select";
import staticMembers from "@/data/members.json";
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

const ROLE_TO_CARD: Record<string, string> = {
  oracao: "oracao",
  louvor: "louvor",
  dinamica: "quebra-gelo",
  visao: "visao",
  oferta: "oferta",
  comunhao: "lanche",
  facilitacao: "facilitacao",
};

const CARD_FUNCTIONS = [
  { id: "oracao", label: "Oração Inicial" },
  { id: "louvor", label: "Louvor" },
  { id: "quebra-gelo", label: "Dinâmica" },
  { id: "visao", label: "Visão" },
  { id: "facilitacao", label: "Facilitação" },
  { id: "oferta", label: "Oferta" },
  { id: "lanche", label: "Comunhão" },
];

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
  const [membersList, setMembersList] = useState<string[]>(staticMembers);
  const [newMemberName, setNewMemberName] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [addMemberMsg, setAddMemberMsg] = useState<string | null>(null);
  const scheduleRef = useRef<HTMLElement>(null);

  const [membersWithRestrictions, setMembersWithRestrictions] = useState<{ name: string; restrictions: string[] }[]>([]);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [selectedPermMember, setSelectedPermMember] = useState<string | null>(null);
  const [permCheckboxes, setPermCheckboxes] = useState<string[]>([]);
  const [permSaving, setPermSaving] = useState(false);
  const [permMsg, setPermMsg] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);

  useEffect(() => {
    cards.forEach((card) => {
      const img = new Image();
      img.src = card.image;
    });
  }, []);

  useEffect(() => {
    fetch("/api/members")
      .then((r) => r.json())
      .then((data) => {
        if (data.members?.length > 0) setMembersList(data.members);
        if (data.membersWithRestrictions?.length > 0) setMembersWithRestrictions(data.membersWithRestrictions);
      })
      .catch(() => {});
  }, []);

  const handleAddMember = async () => {
    const trimmed = newMemberName.trim();
    if (!trimmed || trimmed.length < 2) {
      setAddMemberMsg("Nome precisa ter pelo menos 2 caracteres.");
      return;
    }
    if (!password) {
      setAddMemberMsg("Digite a senha de admin antes de adicionar um membro.");
      return;
    }
    setAddingMember(true);
    setAddMemberMsg(null);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddMemberMsg(data.error || "Erro ao adicionar membro.");
        return;
      }
      setMembersList((prev) => [...prev, trimmed].sort((a, b) => a.localeCompare(b)));
      setMembersWithRestrictions((prev) => [...prev, { name: trimmed, restrictions: [] }].sort((a, b) => a.name.localeCompare(b.name)));
      setNewMemberName("");
      setAddMemberMsg(`✓ ${trimmed} adicionado com sucesso!`);
    } catch {
      setAddMemberMsg("Falha de conexão ao adicionar membro.");
    } finally {
      setAddingMember(false);
    }
  };

  const handleSelectPermMember = (name: string) => {
    if (selectedPermMember === name) {
      setSelectedPermMember(null);
      setPermCheckboxes([]);
      setPermMsg(null);
      return;
    }
    const found = membersWithRestrictions.find((m) => m.name === name);
    setSelectedPermMember(name);
    setPermCheckboxes(found?.restrictions || []);
    setPermMsg(null);
  };

  const togglePermCheckbox = (cardId: string) => {
    setPermCheckboxes((prev) =>
      prev.includes(cardId) ? prev.filter((c) => c !== cardId) : [...prev, cardId]
    );
  };

  const savePermissions = async () => {
    if (!selectedPermMember || !password) return;
    setPermSaving(true);
    setPermMsg(null);
    try {
      const res = await fetch("/api/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedPermMember, restrictions: permCheckboxes, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPermMsg(data.error || "Erro ao salvar permissões.");
        return;
      }
      setMembersWithRestrictions((prev) =>
        prev.map((m) => m.name === selectedPermMember ? { ...m, restrictions: permCheckboxes } : m)
      );
      setPermMsg(`✓ Permissões de ${selectedPermMember} atualizadas.`);
    } catch {
      setPermMsg("Falha de conexão.");
    } finally {
      setPermSaving(false);
    }
  };

  const handleRemoveMember = async (memberName: string) => {
    if (!password) {
      setPermMsg("Digite a senha de admin antes de remover um membro.");
      return;
    }
    if (!confirm(`Remover "${memberName}" do sistema? Esta ação não pode ser desfeita.`)) return;

    setRemovingMember(memberName);
    setPermMsg(null);
    try {
      const res = await fetch("/api/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: memberName, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPermMsg(data.error || "Erro ao remover membro.");
        return;
      }
      setMembersList((prev) => prev.filter((n) => n !== memberName));
      setMembersWithRestrictions((prev) => prev.filter((m) => m.name !== memberName));
      if (selectedPermMember === memberName) {
        setSelectedPermMember(null);
        setPermCheckboxes([]);
      }
      setPermMsg(`✓ ${memberName} removido com sucesso.`);
    } catch {
      setPermMsg("Falha de conexão ao remover membro.");
    } finally {
      setRemovingMember(null);
    }
  };

  const downloadScheduleCard = async () => {
    if (scheduleRef.current === null) return;
    setLoading(true);
    try {
      const { toPng } = await import("html-to-image");

      const options = {
        cacheBust: false,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        style: {
          borderRadius: '14px',
          margin: '0',
          padding: '20px',
          transform: 'scale(1)',
          background: '#ffffff'
        } as any,
      };

      await toPng(scheduleRef.current, options).catch(() => {});
      await new Promise(resolve => setTimeout(resolve, 300));

      const dataUrl = await toPng(scheduleRef.current, options);

      const fileName = `programacao-${selectedDate || 'geral'}.png`.toLowerCase();
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (err: any) {
      console.error('Erro ao baixar programação:', err);
      setErrorMsg(err?.message || 'Erro ao baixar o card. Tente novamente.');
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
    const currentComunhao = [...(schedule.funcoes.comunhao || [])];
    while (currentComunhao.length < 3) currentComunhao.push("");
    currentComunhao[index] = member;
    setSchedule({
      ...schedule,
      funcoes: { ...schedule.funcoes, comunhao: currentComunhao }
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
          adminName: "Richard",
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
      handleSelectDate(schedule.date);
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
    return name
      ? <span style={{ fontWeight: 600, color: '#0f1419' }}>{name}</span>
      : <span style={{ color: "#888888" }}>A definir</span>;
  };

  return (
    <main className="container" style={{ maxWidth: editMode ? '1000px' : undefined }}>
      <header className="header">
        <div style={{ flex: 1 }}>
          <h1 className="title">{editMode ? "Editar Programação" : "Programação"}</h1>
          <p className="subtitle">
            {editMode
              ? "Ajuste as funções e permissões conforme necessário."
              : "Selecione uma data para ver quem vai fazer cada função."}
          </p>
        </div>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button className="btn" style={{ marginBottom: 0, width: "auto", padding: "10px 16px", fontSize: "12px", fontWeight: 600 }}>
            Home
          </button>
        </Link>
      </header>

      {!editMode && (
        <div className="grid">
          <>
            <label className="cardTitle">Escolha a Data</label>
            <Calendar selectedDate={selectedDate} onSelectDate={handleSelectDate} />
          </>

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
                      {renderMember(schedule.funcoes[role as keyof typeof schedule.funcoes] as string)}
                    </div>
                  ))}
                  <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ minWidth: '140px', color: '#0f1419' }}>{LABEL_MAP.comunhao} {EMOJI_MAP.comunhao}</span>
                    </div>
                    {(() => {
                      const active = (schedule.funcoes.comunhao || []).filter(m => m && m.trim() !== "");
                      return active.length > 0
                        ? <span style={{ fontWeight: 600 }}>{active.join(", ")}</span>
                        : <span style={{ color: "rgba(15, 20, 25, 0.4)" }}>A definir</span>;
                    })()}
                  </div>
                </div>
              </div>
            </article>
          )}

          {schedule && (
            <button
              className="btn"
              style={{ marginTop: 12, backgroundColor: '#0c228f', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
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
      )}

      {editMode && (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap', marginTop: 8 }}>
          {/* Coluna esquerda: programação */}
          <div style={{ flex: '3', minWidth: '280px' }}>
            {(errorMsg || successMsg) && (
              <div className="card" style={{ marginBottom: 12, borderColor: errorMsg ? '#d9534f' : '#28a745' }}>
                <div className="cardBody">
                  {successMsg && <p className="cardTitle" style={{ color: '#28a745' }}>Sucesso</p>}
                  <p className="cardDesc">{errorMsg || successMsg}</p>
                </div>
              </div>
            )}

            {schedule && (
              <article ref={scheduleRef} className="card" style={{ backgroundColor: '#ffffff', border: '1px solid #e1eaef' }}>
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
                        <CustomSelect
                          value={schedule.funcoes[role as keyof typeof schedule.funcoes] as string || ""}
                          onChange={(val) => handleEditChange(role, val)}
                          options={membersList.map(m => ({ value: m, label: m }))}
                          placeholder="A definir"
                          style={{ flex: 1 }}
                        />
                      </div>
                    ))}

                    <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ minWidth: '140px', color: '#0f1419' }}>{LABEL_MAP.comunhao} {EMOJI_MAP.comunhao}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        {[0, 1, 2].map(idx => (
                          <CustomSelect
                            key={idx}
                            value={schedule.funcoes.comunhao[idx] || ""}
                            onChange={(val) => handleComunhaoChange(idx, val)}
                            options={membersList.map(m => ({ value: m, label: m }))}
                            placeholder="A definir"
                          />
                        ))}
                      </div>
                    </div>

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

                    <div className="senha-admin-desktop" style={{ marginTop: 16, borderTop: '1px solid #eee', paddingTop: 16 }}>
                      <label className="cardTitle" style={{ fontSize: '14px' }}>Senha Admin para Salvar</label>
                      <input
                        type="password"
                        className="cardSub"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Senha do Richard"
                        style={{ marginBottom: 16 }}
                      />
                      <button className="btn" disabled={saving || !password} onClick={handleSave}>
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
                  </div>
                </div>
              </article>
            )}

            {!schedule && loading && (
              <div className="card" style={{ padding: '16px', backgroundColor: '#ffffff', border: '1px solid #e1eaef' }}>
                <p style={{ textAlign: 'center', fontSize: '12px', color: '#999' }}>Carregando programação...</p>
              </div>
            )}
          </div>

          {/* Coluna direita: permissões + adicionar membro */}
          <div style={{ flex: '2', minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Painel Permissões */}
            <div className="card" style={{ backgroundColor: '#ffffff', border: '1px solid #e1eaef' }}>
              <div className="cardBody" style={{ backgroundColor: '#ffffff' }}>
                <h3 className="cardTitle" style={{ marginBottom: 12 }}>Permissões</h3>

                {/* Botão Membros */}
                <button
                  onClick={() => setPermissionsOpen(!permissionsOpen)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: permissionsOpen ? 'rgba(12,34,143,0.04)' : 'var(--card)',
                    color: 'var(--fg)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <span>Membros</span>
                  <svg
                    width="12" height="8" viewBox="0 0 12 8" fill="none"
                    style={{ transform: `rotate(${permissionsOpen ? 180 : 0}deg)`, transition: 'transform 150ms ease' }}
                  >
                    <path d="M1 1L6 6L11 1" stroke="#0f1419" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Lista de membros */}
                {permissionsOpen && (
                  <div style={{ marginTop: 8, border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                    {membersWithRestrictions.length === 0 ? (
                      <p style={{ padding: '12px', fontSize: '13px', color: '#888' }}>Carregando membros...</p>
                    ) : (
                      membersWithRestrictions.map((m) => (
                        <div
                          key={m.name}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            borderBottom: '1px solid var(--border)',
                            background: selectedPermMember === m.name ? 'rgba(12,34,143,0.06)' : 'transparent',
                          }}
                        >
                          <button
                            onClick={() => handleSelectPermMember(m.name)}
                            style={{
                              flex: 1,
                              padding: '10px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              border: 'none',
                              background: 'transparent',
                              color: selectedPermMember === m.name ? 'var(--primary)' : 'var(--fg)',
                              fontWeight: selectedPermMember === m.name ? 600 : 400,
                              fontSize: '13px',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontFamily: 'inherit',
                            }}
                          >
                            <span>{m.name}</span>
                            <span style={{ fontSize: '11px', color: '#888' }}>
                              {m.restrictions.length === 0 ? 'sem funções' : `${m.restrictions.length} funções`}
                            </span>
                          </button>
                          <button
                            onClick={() => handleRemoveMember(m.name)}
                            disabled={removingMember === m.name}
                            title="Remover membro"
                            style={{
                              padding: '8px 10px',
                              border: 'none',
                              background: 'transparent',
                              color: removingMember === m.name ? '#ccc' : '#d9534f',
                              cursor: removingMember === m.name ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Checkboxes do membro selecionado */}
                {selectedPermMember && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f1419', marginBottom: 10 }}>
                      {selectedPermMember}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: 12 }}>
                      {CARD_FUNCTIONS.map((fn) => (
                        <label
                          key={fn.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            background: permCheckboxes.includes(fn.id) ? 'rgba(12,34,143,0.06)' : 'transparent',
                            color: permCheckboxes.includes(fn.id) ? 'var(--primary)' : 'var(--fg)',
                            userSelect: 'none',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={permCheckboxes.includes(fn.id)}
                            onChange={() => togglePermCheckbox(fn.id)}
                            style={{ accentColor: 'var(--primary)', width: '14px', height: '14px', cursor: 'pointer' }}
                          />
                          {fn.label}
                        </label>
                      ))}
                    </div>

                    {permMsg && (
                      <p style={{ fontSize: '12px', marginBottom: 8, color: permMsg.startsWith('✓') ? '#28a745' : '#d9534f' }}>
                        {permMsg}
                      </p>
                    )}

                    <button
                      className="btn"
                      onClick={savePermissions}
                      disabled={permSaving || !password}
                      style={{ fontSize: '13px', padding: '8px 14px' }}
                    >
                      {permSaving ? "Salvando..." : "Salvar Permissões"}
                    </button>
                    {!password && (
                      <p style={{ fontSize: '11px', color: '#888', marginTop: 6 }}>
                        Digite a senha no painel esquerdo para salvar.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Adicionar Novo Membro */}
            <div className="card" style={{ backgroundColor: '#ffffff', border: '1px solid #e1eaef' }}>
              <div className="cardBody" style={{ backgroundColor: '#ffffff' }}>
                <h3 className="cardTitle" style={{ fontSize: '14px', marginBottom: 10 }}>Adicionar Novo Membro</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: 4 }}>
                  <input
                    type="text"
                    className="cardSub"
                    value={newMemberName}
                    onChange={(e) => { setNewMemberName(e.target.value); setAddMemberMsg(null); }}
                    placeholder="Nome do membro"
                    style={{ flex: 1, padding: '8px', fontSize: '14px' }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddMember(); }}
                  />
                  <button
                    className="btn"
                    onClick={handleAddMember}
                    disabled={addingMember || !newMemberName.trim()}
                    style={{ marginBottom: 0, width: 'auto', padding: '8px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}
                  >
                    {addingMember ? "..." : "Adicionar"}
                  </button>
                </div>
                {addMemberMsg && (
                  <p style={{ fontSize: '12px', color: addMemberMsg.startsWith('✓') ? '#28a745' : '#d9534f' }}>
                    {addMemberMsg}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Senha Admin - mobile only (aparece após Permissões no mobile) */}
          <div className="senha-admin-mobile card" style={{ backgroundColor: '#ffffff', border: '1px solid #e1eaef', width: '100%' }}>
            <div className="cardBody" style={{ backgroundColor: '#ffffff' }}>
              <label className="cardTitle" style={{ fontSize: '14px' }}>Senha Admin para Salvar</label>
              <input
                type="password"
                className="cardSub"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha do Richard"
                style={{ marginBottom: 16 }}
              />
              <button className="btn" disabled={saving || !password} onClick={handleSave}>
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
          </div>
          <style>{`
            .senha-admin-mobile { display: none; }
            @media (max-width: 640px) {
              .senha-admin-desktop { display: none !important; }
              .senha-admin-mobile { display: block; }
            }
          `}</style>
        </div>
      )}
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
