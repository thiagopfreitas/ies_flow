import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const C = {
  primary: "#1877F2",
  dark: "#0D47A1",
  bg: "#f8fafc",
  text: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
  green: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
  purple: "#7c3aed",
};

const STATUS = {
  "Não iniciado": "#94a3b8",
  "Em progresso": "#3b82f6",
  "Concluído": "#10b981",
  "Travado": "#ef4444",
  "Em espera": "#f59e0b",
};

const INIT = {
  currentUser: null,
  activeModule: "dashboard",
  dark: false,
  tasks: [
    { id: 1, name: "Módulo de validação de AIH", status: "Em progresso", responsible: "Luciano", priority: "Crítica", due: "2026-05-30" },
    { id: 2, name: "Integração CNES", status: "Em progresso", responsible: "Ana", priority: "Alta", due: "2026-05-20" },
    { id: 3, name: "Dashboard financeiro", status: "Em espera", responsible: "Pedro", priority: "Média", due: "2026-06-10" },
    { id: 4, name: "Módulo de relatórios", status: "Não iniciado", responsible: "Maria", priority: "Alta", due: "2026-07-01" },
    { id: 5, name: "Autenticação JWT", status: "Concluído", responsible: "Carlos", priority: "Crítica", due: "2026-04-15" },
  ],
  users: [
    { name: "Thiago Freitas", email: "thiago@inteligenciaemsaude.com", role: "Admin" },
    { name: "Luciano Santos", email: "luciano@inteligenciaemsaude.com", role: "Gerente" },
    { name: "Ana Silva", email: "ana@inteligenciaemsaude.com", role: "Membro" },
    { name: "Pedro Costa", email: "pedro@inteligenciaemsaude.com", role: "Membro" },
  ],
};

function Login({ onLogin }) {
  const [email, setEmail] = useState("thiago@inteligenciaemsaude.com");
  const [password, setPassword] = useState("admin123");

  function entrar() {
    if (!email || !password) {
      alert("Preencha e-mail e senha");
      return;
    }

    onLogin({
      name: "Thiago Freitas",
      email,
      role: "Admin",
    });
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg,#0D47A1,#1877F2,#42A5F5)",
      fontFamily: "Arial, sans-serif",
    }}>
      <div style={{
        width: 380,
        background: "#fff",
        padding: 36,
        borderRadius: 20,
        boxShadow: "0 24px 60px rgba(0,0,0,.18)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56,
            height: 56,
            margin: "0 auto 12px",
            borderRadius: 16,
            background: "linear-gradient(135deg,#0D47A1,#1877F2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}>
            🏥
          </div>
          <h1 style={{ margin: 0, fontSize: 20, color: C.text }}>Inteligência em Saúde</h1>
          <p style={{ marginTop: 6, fontSize: 13, color: C.muted }}>Plataforma de Gestão Interna</p>
        </div>

        <label style={labelStyle}>E-mail</label>
        <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />

        <label style={labelStyle}>Senha</label>
        <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button onClick={entrar} style={{
          width: "100%",
          padding: 12,
          marginTop: 10,
          background: C.primary,
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontWeight: 700,
          cursor: "pointer",
        }}>
          Entrar
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 16 }}>
          Demo: qualquer e-mail + senha funcionam
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 11,
  color: "#374151",
  fontWeight: 700,
  marginBottom: 6,
  marginTop: 12,
  textTransform: "uppercase",
};

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  outline: "none",
  boxSizing: "border-box",
};

function Dashboard({ tasks, dark }) {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "Concluído").length;
  const progress = tasks.filter(t => t.status === "Em progresso").length;
  const pending = tasks.filter(t => t.status === "Não iniciado").length;

  const barData = [
    { name: "Total", value: total },
    { name: "Concluídas", value: done },
    { name: "Progresso", value: progress },
    { name: "Pendentes", value: pending },
  ];

  const pieData = Object.keys(STATUS).map(status => ({
    name: status,
    value: tasks.filter(t => t.status === status).length,
    color: STATUS[status],
  })).filter(x => x.value > 0);

  return (
    <div>
      <div style={grid4}>
        <Card title="Total de tarefas" value={total} icon="📋" color={C.primary} dark={dark} />
        <Card title="Concluídas" value={done} icon="✅" color={C.green} dark={dark} />
        <Card title="Em progresso" value={progress} icon="⚡" color={C.amber} dark={dark} />
        <Card title="Pendentes" value={pending} icon="🕐" color={C.purple} dark={dark} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginTop: 18 }}>
        <Box dark={dark}>
          <h3 style={boxTitle(dark)}>Resumo de tarefas</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={C.primary} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box dark={dark}>
          <h3 style={boxTitle(dark)}>Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} innerRadius={55} outerRadius={85} dataKey="value">
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </div>
    </div>
  );
}

function Card({ title, value, icon, color, dark }) {
  return (
    <div style={{
      background: dark ? "#111827" : "#fff",
      border: `1px solid ${dark ? "#1e293b" : C.border}`,
      borderRadius: 14,
      padding: 18,
      boxShadow: "0 1px 4px rgba(0,0,0,.05)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: dark ? "#94a3b8" : C.muted, fontWeight: 700 }}>{title}</span>
        <span style={{ fontSize: 24 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, color, marginTop: 8 }}>{value}</div>
    </div>
  );
}

function Projects({ tasks, setData, dark }) {
  function updateTask(id, field, value) {
    setData(d => ({
      ...d,
      tasks: d.tasks.map(t => t.id === id ? { ...t, [field]: value } : t)
    }));
  }

  function addTask() {
    const name = prompt("Nome da nova tarefa:");
    if (!name) return;

    setData(d => ({
      ...d,
      tasks: [
        ...d.tasks,
        {
          id: Date.now(),
          name,
          status: "Não iniciado",
          responsible: "—",
          priority: "Média",
          due: "",
        }
      ]
    }));
  }

  return (
    <Box dark={dark}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={boxTitle(dark)}>Projetos e tarefas</h3>
        <button onClick={addTask} style={primaryButton}>+ Nova tarefa</button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <Th>Tarefa</Th>
              <Th>Status</Th>
              <Th>Responsável</Th>
              <Th>Prioridade</Th>
              <Th>Prazo</Th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} style={{ borderTop: `1px solid ${dark ? "#1e293b" : C.border}` }}>
                <Td dark={dark}>
                  <input
                    value={task.name}
                    onChange={(e) => updateTask(task.id, "name", e.target.value)}
                    style={tableInput(dark)}
                  />
                </Td>
                <Td dark={dark}>
                  <select value={task.status} onChange={(e) => updateTask(task.id, "status", e.target.value)} style={selectStyle(task.status)}>
                    {Object.keys(STATUS).map(s => <option key={s}>{s}</option>)}
                  </select>
                </Td>
                <Td dark={dark}>
                  <input
                    value={task.responsible}
                    onChange={(e) => updateTask(task.id, "responsible", e.target.value)}
                    style={tableInput(dark)}
                  />
                </Td>
                <Td dark={dark}>
                  <select value={task.priority} onChange={(e) => updateTask(task.id, "priority", e.target.value)} style={smallSelect(dark)}>
                    <option>Crítica</option>
                    <option>Alta</option>
                    <option>Média</option>
                    <option>Baixa</option>
                  </select>
                </Td>
                <Td dark={dark}>
                  <input
                    type="date"
                    value={task.due}
                    onChange={(e) => updateTask(task.id, "due", e.target.value)}
                    style={tableInput(dark)}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Box>
  );
}

function Team({ users, dark }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
      {users.map((u, i) => (
        <Box key={i} dark={dark}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: [C.primary, C.green, C.purple, C.amber][i % 4],
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
            }}>
              {u.name.split(" ").map(x => x[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h3 style={{ margin: 0, color: dark ? "#e2e8f0" : C.text, fontSize: 15 }}>{u.name}</h3>
              <p style={{ margin: "4px 0", color: dark ? "#94a3b8" : C.muted, fontSize: 12 }}>{u.email}</p>
              <span style={{
                display: "inline-block",
                padding: "3px 8px",
                borderRadius: 8,
                background: "#E3F2FD",
                color: C.primary,
                fontSize: 11,
                fontWeight: 700,
              }}>
                {u.role}
              </span>
            </div>
          </div>
        </Box>
      ))}
    </div>
  );
}

function Automations({ dark }) {
  const items = [
    "Tarefa vencida → notificar responsável",
    "Status concluído → mover para finalizados",
    "Prioridade crítica → alertar equipe",
    "Projeto concluído → gerar relatório",
  ];

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {items.map((item, i) => (
        <Box key={i} dark={dark}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ color: dark ? "#e2e8f0" : C.text }}>{item}</strong>
            <span style={{
              background: i % 2 === 0 ? C.green : "#94a3b8",
              color: "#fff",
              padding: "5px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
            }}>
              {i % 2 === 0 ? "Ativa" : "Inativa"}
            </span>
          </div>
        </Box>
      ))}
    </div>
  );
}

function Timeline({ tasks, dark }) {
  return (
    <Box dark={dark}>
      <h3 style={boxTitle(dark)}>Timeline</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {tasks.map(t => (
          <div key={t.id}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: dark ? "#e2e8f0" : C.text }}>
              <strong>{t.name}</strong>
              <span>{t.due || "Sem prazo"}</span>
            </div>
            <div style={{ height: 10, background: dark ? "#1e293b" : "#e2e8f0", borderRadius: 999, marginTop: 6 }}>
              <div style={{
                height: "100%",
                width: t.status === "Concluído" ? "100%" : t.status === "Em progresso" ? "60%" : "25%",
                background: STATUS[t.status],
                borderRadius: 999,
              }} />
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
}

function Settings({ data, setData, dark }) {
  return (
    <Box dark={dark}>
      <h3 style={boxTitle(dark)}>Configurações</h3>
      <button
        style={primaryButton}
        onClick={() => setData(d => ({ ...d, dark: !d.dark }))}
      >
        {dark ? "Modo claro" : "Modo escuro"}
      </button>
      <button
        style={{ ...primaryButton, background: C.red, marginLeft: 10 }}
        onClick={() => {
          localStorage.removeItem("is-platform-v1");
          setData(INIT);
        }}
      >
        Resetar dados
      </button>
    </Box>
  );
}

function Box({ children, dark }) {
  return (
    <div style={{
      background: dark ? "#111827" : "#fff",
      border: `1px solid ${dark ? "#1e293b" : C.border}`,
      borderRadius: 14,
      padding: 18,
      boxShadow: "0 1px 4px rgba(0,0,0,.05)",
    }}>
      {children}
    </div>
  );
}

function Th({ children }) {
  return <th style={{ textAlign: "left", padding: 12, color: C.muted, fontSize: 11, textTransform: "uppercase" }}>{children}</th>;
}

function Td({ children, dark }) {
  return <td style={{ padding: 10, color: dark ? "#e2e8f0" : C.text }}>{children}</td>;
}

const grid4 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
};

const primaryButton = {
  background: C.primary,
  color: "#fff",
  border: "none",
  borderRadius: 9,
  padding: "9px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

function boxTitle(dark) {
  return {
    margin: "0 0 16px",
    fontSize: 16,
    color: dark ? "#e2e8f0" : C.text,
  };
}

function tableInput(dark) {
  return {
    width: "100%",
    border: "none",
    background: "transparent",
    color: dark ? "#e2e8f0" : C.text,
    outline: "none",
  };
}

function smallSelect(dark) {
  return {
    border: `1px solid ${dark ? "#1e293b" : C.border}`,
    background: dark ? "#0f172a" : "#fff",
    color: dark ? "#e2e8f0" : C.text,
    borderRadius: 8,
    padding: "6px 8px",
  };
}

function selectStyle(status) {
  return {
    border: "none",
    borderRadius: 8,
    padding: "6px 8px",
    color: "#fff",
    background: STATUS[status],
    fontWeight: 700,
  };
}

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "projects", label: "Projetos", icon: "📋" },
  { id: "team", label: "Equipe", icon: "👥" },
  { id: "automations", label: "Automações", icon: "⚡" },
  { id: "timeline", label: "Timeline", icon: "📅" },
  { id: "settings", label: "Configurações", icon: "⚙️" },
];

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sideOpen, setSideOpen] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("is-platform-v1");
      setData(saved ? JSON.parse(saved) : INIT);
    } catch {
      setData(INIT);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!data || loading) return;
    localStorage.setItem("is-platform-v1", JSON.stringify(data));
  }, [data, loading]);

  if (loading) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial" }}>
        Carregando...
      </div>
    );
  }

  if (!data.currentUser) {
    return <Login onLogin={(user) => setData(d => ({ ...d, currentUser: user }))} />;
  }

  const dark = data.dark;
  const bg = dark ? "#0f172a" : C.bg;
  const sideBg = dark ? "#0d1117" : "#fff";
  const text = dark ? "#e2e8f0" : C.text;
  const muted = dark ? "#94a3b8" : C.muted;
  const activeModule = data.activeModule || "dashboard";

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      background: bg,
      color: text,
      fontFamily: "Arial, sans-serif",
      overflow: "hidden",
    }}>
      <aside style={{
        width: sideOpen ? 230 : 64,
        background: sideBg,
        borderRight: `1px solid ${dark ? "#1e293b" : C.border}`,
        padding: 12,
        transition: ".2s",
        display: "flex",
        flexDirection: "column",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: "linear-gradient(135deg,#0D47A1,#1877F2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}>
            🏥
          </div>

          {sideOpen && (
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 13 }}>Inteligência em Saúde</strong>
              <p style={{ margin: 0, fontSize: 10, color: muted }}>Plataforma interna</p>
            </div>
          )}

          <button onClick={() => setSideOpen(v => !v)} style={{
            border: "none",
            background: "transparent",
            color: muted,
            cursor: "pointer",
            fontSize: 18,
          }}>
            {sideOpen ? "‹" : "☰"}
          </button>
        </div>

        <div style={{ flex: 1 }}>
          {NAV.map(n => {
            const active = activeModule === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setData(d => ({ ...d, activeModule: n.id }))}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 9px",
                  marginBottom: 4,
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  background: active ? "#E3F2FD" : "transparent",
                  color: active ? C.primary : muted,
                  fontWeight: active ? 700 : 500,
                  justifyContent: sideOpen ? "flex-start" : "center",
                }}
              >
                <span>{n.icon}</span>
                {sideOpen && <span>{n.label}</span>}
              </button>
            );
          })}
        </div>

        {sideOpen && (
          <div style={{ borderTop: `1px solid ${dark ? "#1e293b" : C.border}`, paddingTop: 12 }}>
            <strong style={{ fontSize: 12 }}>{data.currentUser.name}</strong>
            <p style={{ margin: "4px 0 10px", fontSize: 11, color: muted }}>{data.currentUser.role}</p>
            <button
              onClick={() => setData(d => ({ ...d, currentUser: null }))}
              style={{
                border: "none",
                background: "transparent",
                color: C.red,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              🚪 Sair
            </button>
          </div>
        )}
      </aside>

      <main style={{ flex: 1, overflowY: "auto" }}>
        <header style={{
          height: 66,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 22px",
          background: dark ? "#0d1117" : "#fff",
          borderBottom: `1px solid ${dark ? "#1e293b" : C.border}`,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17 }}>
              {NAV.find(n => n.id === activeModule)?.icon} {NAV.find(n => n.id === activeModule)?.label}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: muted }}>
              Workspace interno · Inteligência em Saúde
            </p>
          </div>

          <button onClick={() => setData(d => ({ ...d, dark: !d.dark }))} style={primaryButton}>
            {dark ? "☀️ Claro" : "🌙 Escuro"}
          </button>
        </header>

        <section style={{ padding: 22 }}>
          {activeModule === "dashboard" && <Dashboard tasks={data.tasks} dark={dark} />}
          {activeModule === "projects" && <Projects tasks={data.tasks} setData={setData} dark={dark} />}
          {activeModule === "team" && <Team users={data.users} dark={dark} />}
          {activeModule === "automations" && <Automations dark={dark} />}
          {activeModule === "timeline" && <Timeline tasks={data.tasks} dark={dark} />}
          {activeModule === "settings" && <Settings data={data} setData={setData} dark={dark} />}
        </section>
      </main>
    </div>
  );
}
