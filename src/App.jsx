import { useEffect, useState } from "react";

const statusColors = {
  "Não iniciado": "#94a3b8",
  "Em andamento": "#2563eb",
  "Concluído": "#10b981",
  "Travado": "#ef4444",
};

const initialTasks = [
  {
    id: 1,
    title: "Módulo de validação de AIH",
    project: "Fatura SUS",
    responsible: "Luciano",
    status: "Em andamento",
    priority: "Alta",
    dueDate: "2026-05-30",
  },
  {
    id: 2,
    title: "Integração CNES",
    project: "Fatura SUS",
    responsible: "Ana",
    status: "Em andamento",
    priority: "Alta",
    dueDate: "2026-05-20",
  },
  {
    id: 3,
    title: "Dashboard financeiro",
    project: "Gestão Interna",
    responsible: "Pedro",
    status: "Não iniciado",
    priority: "Média",
    dueDate: "2026-06-10",
  },
  {
    id: 4,
    title: "Autenticação de usuários",
    project: "Plataforma",
    responsible: "Carlos",
    status: "Concluído",
    priority: "Alta",
    dueDate: "2026-04-15",
  },
];

export default function App() {
  const [logged, setLogged] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("ies_tasks");
    return saved ? JSON.parse(saved) : initialTasks;
  });

  useEffect(() => {
    localStorage.setItem("ies_tasks", JSON.stringify(tasks));
  }, [tasks]);

  function addTask() {
    const title = prompt("Nome da tarefa:");
    if (!title) return;

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        title,
        project: "Novo Projeto",
        responsible: "Sem responsável",
        status: "Não iniciado",
        priority: "Média",
        dueDate: "",
      },
    ]);
  }

  function updateTask(id, field, value) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  }

  function deleteTask(id) {
    if (confirm("Deseja excluir esta tarefa?")) {
      setTasks(tasks.filter((t) => t.id !== id));
    }
  }

  if (!logged) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginBox}>
          <div style={styles.logo}>🏥</div>
          <h1 style={styles.loginTitle}>IES Flow</h1>
          <p style={styles.loginSubtitle}>Inteligência em Saúde</p>

          <input style={styles.input} placeholder="E-mail" defaultValue="thiago@inteligenciaemsaude.com" />
          <input style={styles.input} placeholder="Senha" type="password" defaultValue="admin123" />

          <button style={styles.primaryButton} onClick={() => setLogged(true)}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "Concluído").length;
  const progress = tasks.filter((t) => t.status === "Em andamento").length;
  const blocked = tasks.filter((t) => t.status === "Travado").length;

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>🏥</div>
          <div>
            <strong>IES Flow</strong>
            <small>Gestão em Saúde</small>
          </div>
        </div>

        <button style={navStyle(page === "dashboard")} onClick={() => setPage("dashboard")}>
          📊 Dashboard
        </button>
        <button style={navStyle(page === "tasks")} onClick={() => setPage("tasks")}>
          📋 Tarefas
        </button>
        <button style={navStyle(page === "team")} onClick={() => setPage("team")}>
          👥 Equipe
        </button>
        <button style={navStyle(page === "settings")} onClick={() => setPage("settings")}>
          ⚙️ Configurações
        </button>

        <button style={styles.logout} onClick={() => setLogged(false)}>
          Sair
        </button>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h2 style={{ margin: 0 }}>
              {page === "dashboard" && "Dashboard"}
              {page === "tasks" && "Tarefas e Projetos"}
              {page === "team" && "Equipe"}
              {page === "settings" && "Configurações"}
            </h2>
            <p style={styles.muted}>Plataforma interna da Inteligência em Saúde</p>
          </div>

          <button style={styles.primaryButtonSmall} onClick={addTask}>
            + Nova tarefa
          </button>
        </header>

        {page === "dashboard" && (
          <>
            <div style={styles.cards}>
              <Card title="Total de tarefas" value={total} color="#2563eb" />
              <Card title="Concluídas" value={done} color="#10b981" />
              <Card title="Em andamento" value={progress} color="#f59e0b" />
              <Card title="Travadas" value={blocked} color="#ef4444" />
            </div>

            <section style={styles.panel}>
              <h3>Resumo dos projetos</h3>
              {tasks.map((task) => (
                <div key={task.id} style={styles.progressRow}>
                  <span>{task.title}</span>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width:
                          task.status === "Concluído"
                            ? "100%"
                            : task.status === "Em andamento"
                            ? "60%"
                            : task.status === "Travado"
                            ? "20%"
                            : "10%",
                        background: statusColors[task.status],
                      }}
                    />
                  </div>
                </div>
              ))}
            </section>
          </>
        )}

        {page === "tasks" && (
          <section style={styles.panel}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Tarefa</th>
                  <th>Projeto</th>
                  <th>Responsável</th>
                  <th>Status</th>
                  <th>Prioridade</th>
                  <th>Prazo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <input
                        style={styles.tableInput}
                        value={task.title}
                        onChange={(e) => updateTask(task.id, "title", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        style={styles.tableInput}
                        value={task.project}
                        onChange={(e) => updateTask(task.id, "project", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        style={styles.tableInput}
                        value={task.responsible}
                        onChange={(e) => updateTask(task.id, "responsible", e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        style={{ ...styles.statusSelect, background: statusColors[task.status] }}
                        value={task.status}
                        onChange={(e) => updateTask(task.id, "status", e.target.value)}
                      >
                        <option>Não iniciado</option>
                        <option>Em andamento</option>
                        <option>Concluído</option>
                        <option>Travado</option>
                      </select>
                    </td>
                    <td>
                      <select
                        style={styles.select}
                        value={task.priority}
                        onChange={(e) => updateTask(task.id, "priority", e.target.value)}
                      >
                        <option>Baixa</option>
                        <option>Média</option>
                        <option>Alta</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="date"
                        style={styles.tableInput}
                        value={task.dueDate}
                        onChange={(e) => updateTask(task.id, "dueDate", e.target.value)}
                      />
                    </td>
                    <td>
                      <button style={styles.deleteButton} onClick={() => deleteTask(task.id)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {page === "team" && (
          <div style={styles.teamGrid}>
            {["Thiago Freitas", "Luciano Santos", "Ana Silva", "Pedro Costa"].map((name, i) => (
              <div style={styles.memberCard} key={name}>
                <div style={styles.avatar}>{name.split(" ").map((n) => n[0]).join("")}</div>
                <h3>{name}</h3>
                <p style={styles.muted}>{i === 0 ? "Admin" : i === 1 ? "Gerente" : "Membro"}</p>
              </div>
            ))}
          </div>
        )}

        {page === "settings" && (
          <section style={styles.panel}>
            <h3>Configurações</h3>
            <p>Workspace: Inteligência em Saúde</p>
            <p>Modo atual: protótipo funcional</p>
            <button
              style={styles.deleteButton}
              onClick={() => {
                localStorage.removeItem("ies_tasks");
                setTasks(initialTasks);
              }}
            >
              Resetar tarefas
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div style={styles.card}>
      <p>{title}</p>
      <strong style={{ color }}>{value}</strong>
    </div>
  );
}

function navStyle(active) {
  return {
    ...styles.navButton,
    background: active ? "#e0f2fe" : "transparent",
    color: active ? "#0369a1" : "#475569",
    fontWeight: active ? "700" : "500",
  };
}

const styles = {
  loginPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#0D47A1,#1877F2,#42A5F5)",
    fontFamily: "Arial, sans-serif",
  },
  loginBox: {
    width: 360,
    background: "#fff",
    padding: 36,
    borderRadius: 20,
    boxShadow: "0 20px 60px rgba(0,0,0,.2)",
    textAlign: "center",
  },
  logo: {
    fontSize: 38,
    marginBottom: 10,
  },
  loginTitle: {
    margin: 0,
    color: "#0f172a",
  },
  loginSubtitle: {
    color: "#64748b",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    boxSizing: "border-box",
  },
  primaryButton: {
    width: "100%",
    padding: 12,
    background: "#1877F2",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
  primaryButtonSmall: {
    padding: "10px 14px",
    background: "#1877F2",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
  app: {
    height: "100vh",
    display: "flex",
    fontFamily: "Arial, sans-serif",
    background: "#f8fafc",
    color: "#0f172a",
  },
  sidebar: {
    width: 240,
    background: "#fff",
    borderRight: "1px solid #e2e8f0",
    padding: 16,
    display: "flex",
    flexDirection: "column",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "#1877F2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  navButton: {
    border: "none",
    borderRadius: 10,
    padding: "12px 10px",
    textAlign: "left",
    marginBottom: 6,
    cursor: "pointer",
    fontSize: 14,
  },
  logout: {
    marginTop: "auto",
    border: "none",
    background: "transparent",
    color: "#ef4444",
    cursor: "pointer",
    textAlign: "left",
    padding: 10,
    fontWeight: 700,
  },
  main: {
    flex: 1,
    overflowY: "auto",
  },
  header: {
    height: 76,
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  muted: {
    color: "#64748b",
    margin: "4px 0 0",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 16,
    padding: 24,
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 20,
  },
  panel: {
    margin: 24,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 20,
    overflowX: "auto",
  },
  progressRow: {
    marginBottom: 14,
  },
  progressBar: {
    marginTop: 6,
    height: 10,
    background: "#e2e8f0",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    width: "100%",
  },
  statusSelect: {
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "6px 8px",
    fontWeight: 700,
  },
  select: {
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "6px 8px",
  },
  deleteButton: {
    background: "#fee2e2",
    color: "#ef4444",
    border: "none",
    borderRadius: 8,
    padding: "7px 10px",
    cursor: "pointer",
    fontWeight: 700,
  },
  teamGrid: {
    padding: 24,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 16,
  },
  memberCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "#1877F2",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    marginBottom: 10,
  },
};
