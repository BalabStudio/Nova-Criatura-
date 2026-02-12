"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Calendar } from "@/components/calendar";
import { apiService, ScheduleData } from "@/services/api.service";

const EMOJI_MAP: Record<string, string> = {
  oracao: "🙏",
  louvor: "❤️",
  dinamica: "🎉",
  visao: "🌟",
  facilitacao: "📖",
  oferta: "💝",
  comunhao: "🍽️",
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

export default function ProgramacaoPage() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectDate = useCallback(async (date: string) => {
    setSelectedDate(date);
    setSchedule(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      const data = await apiService.getSchedule(date);
      setSchedule(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDate = (isoDate: string, weekday: string) => {
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
          <h1 className="title">Programação</h1>
          <p className="subtitle">Selecione uma data para ver quem vai fazer cada função.</p>
        </div>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button className="btn" style={{ marginBottom: 0, width: "auto", padding: "10px 16px", fontSize: "12px", fontWeight: 600 }}>
            Home
          </button>
        </Link>
      </header>

      <div className="grid">
        <label className="cardTitle">Escolha a Data</label>
        <Calendar selectedDate={selectedDate} onSelectDate={handleSelectDate} />

        {errorMsg && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="cardBody">
              <p className="cardTitle">Erro</p>
              <p className="cardDesc">{errorMsg}</p>
            </div>
          </div>
        )}

        {schedule && (
          <article className="card" style={{ marginTop: 12 }}>
            <div className="cardBody">
              <h2 className="cardTitle">
                Nova Criatura — {schedule.weekday} {formatDate(schedule.date, schedule.weekday)} às {schedule.horario}
              </h2>

              <div style={{ marginTop: 14, lineHeight: 1.8 }}>
                {["oracao", "louvor", "dinamica", "visao", "facilitacao", "oferta"].map((role) => (
                  <div key={role} style={{ marginBottom: 8 }}>
                    <span>{EMOJI_MAP[role]} {LABEL_MAP[role]}:</span> {renderMember(schedule.funcoes[role as keyof typeof schedule.funcoes] as string)}
                  </div>
                ))}

                {schedule.funcoes.comunhao.length > 0 && (
                  <div style={{ marginBottom: 0 }}>
                    <span>{EMOJI_MAP.comunhao} {LABEL_MAP.comunhao}:</span>{" "}
                    <span style={{ fontWeight: 600 }}>{schedule.funcoes.comunhao.join(", ")}</span>
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
