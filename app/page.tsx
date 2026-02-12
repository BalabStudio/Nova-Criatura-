"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { Calendar } from "@/components/calendar";
import members from "@/data/members.json";
import { apiService, PickResponse } from "@/services/api.service";

export default function Page() {
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [assignment, setAssignment] = useState<PickResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const pickFunction = useCallback(async () => {
    if (!selectedMember || !selectedDate) return;
    setLoading(true);
    setErrorMsg(null);
    setAssignment(null);
    try {
      const data = await apiService.pickFunction(selectedMember, selectedDate);
      setAssignment(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedMember, selectedDate]);

  const resetAssignmentsHandler = useCallback(async () => {
    setResetMsg(null);
    setLoading(true);
    try {
      await apiService.resetAssignments(password);
      setAssignment(null);
      setSelectedDate("");
      setSelectedMember("");
      setPassword("");
      setResetMsg("Todos os sorteios foram zerados.");
    } catch (err: any) {
      setResetMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, [password]);

  const readyToPick = selectedMember && selectedDate && !assignment;
  const isAdmin = selectedMember === "Richard";

  return (
    <main className="container">
      <header className="header">
        <div style={{ flex: 1 }}>
          <h1 className="title">Programação mais TOP de uma Célula de Todos os Tempos 🔥</h1>
          <p className="subtitle">
            Selecione o seu nome e a data da célula, depois clique em &quot;Escolher&quot; para receber sua função.
          </p>
        </div>
        <Link href="/programacao" style={{ textDecoration: "none" }}>
          <button className="btn" style={{ marginBottom: 0, width: "auto", padding: "10px 16px", fontSize: "12px", fontWeight: 600 }}>
            Ver Programação
          </button>
        </Link>
      </header>

      <div className="grid">
        <label htmlFor="member-select" className="cardTitle">Participante</label>
        <select
          id="member-select"
          className="cardSub"
          value={selectedMember}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
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
          Data (2026)
        </label>
        <Calendar
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setAssignment(null);
            setErrorMsg(null);
          }}
        />

        {isAdmin && (
          <>
            <label htmlFor="pwd" className="cardTitle" style={{ marginTop: 10 }}>Senha (admin)</label>
            <input
              id="pwd"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className="cardSub"
            />
          </>
        )}

        <button
          className="btn"
          onClick={pickFunction}
          disabled={!readyToPick || loading}
          aria-busy={loading}
        >
          {loading ? "Processando..." : "Escolher função"}
        </button>
        {isAdmin && (
          <button
            className="btn"
            style={{ marginTop: 8, backgroundColor: "#d9534f" }}
            onClick={resetAssignmentsHandler}
            disabled={loading || !password}
            aria-busy={loading}
          >
            {loading ? "Aguarde..." : "Zerar sorteios"}
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="cardBody">
            <p className="cardTitle">Erro</p>
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

      {assignment && (
        <article className="card" style={{ marginTop: 12 }}>
          <img
            className="cardMedia"
            src={assignment.card.image || "/placeholder.svg"}
            alt={assignment.card.title}
            style={{ objectFit: 'contain', background: '#f5f5f5' }}
          />
          <div className="cardBody">
            <h2 className="cardTitle">{assignment.card.title}</h2>
            {assignment.card.subtitle && (
              <p className="cardSub">{assignment.card.subtitle}</p>
            )}
            {assignment.card.description && (
              <p className="cardDesc">{assignment.card.description}</p>
            )}
            <p className="cardSub" style={{ marginTop: 8 }}>
              Data: {assignment.assignment.date}
            </p>
            <p className="cardSub">
              Participante: {assignment.assignment.member}
            </p>
          </div>
        </article>
      )}
    </main>
  );
}
