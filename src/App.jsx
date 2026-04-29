import { useEffect, useMemo, useState } from "react";

const COLORS = {
  primary: "#1877F2",
  bg: "#f6f8fb",
  card: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
  green: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
  purple: "#7c3aed",
  blue: "#2563eb",
};

const STATUS = {
  "Não iniciado": "#94a3b8",
  "Em andamento": "#2563eb",
  "Concluído": "#10b981",
  "Travado": "#ef4444",
  "Em espera": "#f59e0b",
};

const PRIORITY = {
  Baixa: "#94a3b8",
  Média: "#2563eb",
  Alta: "#f59e0b",
  Crítica: "#ef4444",
};

const ROLES = ["Administrador", "Gerente", "Membro", "Visualizador"];

const initialData = {
  activePage: "dashboard",
  loggedUser: {
    id: 1,
    name: "Thiago Freitas",
    email: "thiago@inteligenciaemsaude.com",
    role: "Administrador",
  },
  users: [
    { id: 1, name: "Thiago Freitas", email: "thiago@inteligenciaemsaude.com", role: "Administrador", status: "Online" },
    { id: 2, name: "Luciano Santos", email: "luciano@inteligenciaemsaude.com", role: "Gerente", status: "Online" },
    { id: 3, name: "Ana Silva", email: "ana@inteligenciaemsaude.com", role: "Membro", status: "Offline" },
    { id: 4, name: "Pedro Costa", email: "pedro@inteligenciaemsaude.com", role: "Visualizador", status: "Offline" },
  ],
  projects: [
    { id: 1, name: "Fatura SUS", owner: "Luciano Santos", status: "Em andamento", start: "2026-04-01", end: "2026-07-31" },
    { id: 2, name: "Controle & Avaliação", owner: "Ana Silva", status: "Em andamento", start: "2026-05-01", end: "2026-08-30" },
    { id: 3, name: "Regulação SUS", owner: "Pedro Costa", status: "Não iniciado", start: "2026-06-01", end: "2026-10-15" },
  ],
  tasks: [
    { id: 1, title: "Módulo de validação de AIH", project: "Fatura SUS", group: "Em andamento", responsible: "Luciano Santos", status: "Em andamento", priority: "Crítica", dueDate: "2026-05-30", notes: "Validação das regras principais." },
    { id: 2, title: "Integração CNES", project: "Fatura SUS", group: "Em andamento", responsible: "Ana Silva", status: "Em andamento", priority: "Alta", dueDate: "2026-05-20", notes: "Conectar dados de estabelecimentos." },
    { id: 3, title: "Dashboard financeiro", project: "Fatura SUS", group: "Planejamento", responsible: "Pedro Costa", status: "Em espera", priority: "Média", dueDate: "2026-06-10", notes: "Aguardando definição dos indicadores." },
    { id: 4, title: "Módulo de auditoria", project: "Controle & Avaliação", group: "Sprint 1", responsible: "Ana Silva", status: "Não iniciado", priority: "Alta", dueDate: "2026-06-15", notes: "" },
    { id: 5, title: "Autenticação de usuários", project: "IES SUS", group: "Concluídos", responsible: "Thiago Freitas", status: "Concluído", priority: "Crítica", dueDate: "2026-04-15", notes: "Base inicial criada." },
  ],
  automations: [
    { id: 1, name: "Tarefa vencida → notificar responsável", trigger: "Prazo expirado", action: "Enviar alerta", active: true },
    { id: 2, name: "Status concluído → mover para concluídos", trigger: "Status = Concluído", action: "Mover tarefa", active: true },
    { id: 3, name: "Prioridade crítica → alertar administrador", trigger: "Prioridade = Crítica", action: "Notificar administrador", active: false },
    { id: 4, name: "Projeto concluído → gerar relatório", trigger: "Todas as tarefas concluídas", action: "Gerar relatório", active: false },
  ],
};

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "projects", label: "Projetos", icon: "📁" },
  { id: "tasks", label: "Tarefas", icon: "📋" },
  { id: "team", label: "Equipe", icon: "👥" },
  { id: "users", label: "Usuários", icon: "🔐" },
  { id: "automations", label: "Automações", icon: "⚡" },
  { id: "timeline", label: "Timeline", icon: "📅" },
  { id: "settings", label: "Configurações", icon: "⚙️" },
  { id: "profile", label: "Perfil", icon: "👤" },
];

function loadData() {
  try {
    const saved = localStorage.getItem("ies_sus_data_v2");
    return saved ? JSON.parse(saved) : initialData;
  } catch {
    return initialData;
  }
}

export default function App() {
  const [data, setData] = useState(loadData);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem("ies_sus_data_v2", JSON.stringify(data));
  }, [data]);

  const tasks = data.tasks || [];
  const users = data.users || [];
  const projects = data.projects || [];
  const page = data.activePage || "dashboard";

  const stats = useMemo(() => ({
    total: tasks.length,
    done: tasks.filter(t => t.status === "Concluído").length,
    progress: tasks.filter(t => t.status === "Em andamento").length,
    blocked: tasks.filter(t => t.status === "Travado").length,
    users: users.length,
    projects: projects.length,
  }), [tasks, users, projects]);

  function setPage(pageId) {
    setData(d => ({ ...d, activePage: pageId }));
  }

  function addTask() {
    const title = prompt("Nome da nova tarefa:");
    if (!title) return;
    setData(d => ({
      ...d,
      activePage: "tasks",
      tasks: [...d.tasks, {
        id: Date.now(),
        title,
        project: d.projects[0]?.name || "IES SUS",
        group: "Novo grupo",
        responsible: d.loggedUser?.name || "Sem responsável",
        status: "Não iniciado",
        priority: "Média",
        dueDate: "",
        notes: "",
      }],
    }));
  }

  function updateTask(id, field, value) {
    setData(d => ({
      ...d,
      tasks: d.tasks.map(t => t.id === id ? { ...t, [field]: value } : t),
    }));
  }

  function deleteTask(id) {
    if (!confirm("Excluir esta tarefa?")) return;
    setData(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) }));
  }

  function addProject() {
    const name = prompt("Nome do projeto:");
    if (!name) return;
    setData(d => ({
      ...d,
      projects: [...d.projects, {
        id: Date.now(),
        name,
        owner: d.loggedUser?.name || "Administrador",
        status: "Não iniciado",
        start: "",
        end: "",
      }],
    }));
  }

  function updateProject(id, field, value) {
    setData(d => ({
      ...d,
      projects: d.projects.map(p => p.id === id ? { ...p, [field]: value } : p),
    }));
  }

  function addUser() {
    const name = prompt("Nome do usuário:");
    if (!name) return;
    const email = prompt("E-mail do usuário:") || "usuario@ies-sus.com";
    setData(d => ({
      ...d,
      users: [...d.users, {
        id: Date.now(),
        name,
        email,
        role: "Membro",
        status: "Offline",
      }],
    }));
  }

  function updateUser(id, field, value) {
    setData(d => ({
      ...d,
      users: d.users.map(u => u.id === id ? { ...u, [field]: value } : u),
    }));
  }

  function deleteUser(id) {
    if (!confirm("Remover este usuário?")) return;
    setData(d => ({ ...d, users: d.users.filter(u => u.id !== id) }));
  }

  function toggleAutomation(id) {
    setData(d => ({
      ...d,
      automations: d.automations.map(a => a.id === id ? { ...a, active: !a.active } : a),
    }));
  }

  const pageTitle = NAV.find(n => n.id === page)?.label || "Dashboard";

  return (
    <div style={styles.app}>
      <aside style={{ ...styles.sidebar, width: sidebarOpen ? 260 : 76 }}>
        <div style={styles.brandRow}>
          <div style={styles.logo}>🏥</div>
          {sidebarOpen && (
            <div>
              <strong style={styles.brandTitle}>IES SUS</strong>
              <div style={styles.brandSub}>Plataforma de gestão</div>
            </div>
          )}
          <button style={styles.collapseBtn} onClick={() => setSidebarOpen(v => !v)}>
            {sidebarOpen ? "‹" : "☰"}
          </button>
        </div>

        <nav style={styles.nav}>
          {NAV.map(item => (
            <button
              key={item.id}
              style={{
                ...styles.navBtn,
                ...(page === item.id ? styles.navBtnActive : {}),
                justifyContent: sidebarOpen ? "flex-start" : "center",
              }}
              onClick={() => setPage(item.id)}
            >
              <span>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div style={styles.userBox}>
            <div style={styles.avatar}>{initials(data.loggedUser?.name)}</div>
            <div>
              <strong>{data.loggedUser?.name}</strong>
              <small style={styles.smallMuted}>{data.loggedUser?.role}</small>
            </div>
          </div>
        )}
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.h1}>{pageTitle}</h1>
            <p style={styles.headerSub}>Workspace interno · IES SUS</p>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.secondaryBtn} onClick={() => setPage("profile")}>Meu perfil</button>
            <button style={styles.primaryBtn} onClick={addTask}>+ Nova tarefa</button>
          </div>
        </header>

        <section style={styles.content}>
          {page === "dashboard" && <Dashboard stats={stats} tasks={tasks} projects={projects} />}
          {page === "projects" && <Projects projects={projects} updateProject={updateProject} addProject={addProject} />}
          {page === "tasks" && <Tasks tasks={tasks} users={users} projects={projects} updateTask={updateTask} deleteTask={deleteTask} addTask={addTask} />}
          {page === "team" && <Team users={users} tasks={tasks} />}
          {page === "users" && <Users users={users} addUser={addUser} updateUser={updateUser} deleteUser={deleteUser} />}
          {page === "automations" && <Automations automations={data.automations} toggleAutomation={toggleAutomation} />}
          {page === "timeline" && <Timeline projects={projects} tasks={tasks} />}
          {page === "settings" && <Settings setData={setData} />}
          {page === "profile" && <Profile user={data.loggedUser} setData={setData} />}
        </section>
      </main>
    </div>
  );
}

function Dashboard({ stats, tasks, projects }) {
  return (
    <div>
      <div style={styles.cardsGrid}>
        <KpiCard title="Tarefas" value={stats.total} icon="📋" color={COLORS.primary} />
        <KpiCard title="Concluídas" value={stats.done} icon="✅" color={COLORS.green} />
        <KpiCard title="Em andamento" value={stats.progress} icon="⚡" color={COLORS.amber} />
        <KpiCard title="Projetos" value={stats.projects} icon="📁" color={COLORS.purple} />
      </div>

      <div style={styles.twoColumns}>
        <Panel title="Resumo por status">
          {Object.keys(STATUS).map(status => (
            <ProgressLine
              key={status}
              label={status}
              count={tasks.filter(t => t.status === status).length}
              total={tasks.length}
              color={STATUS[status]}
            />
          ))}
        </Panel>

        <Panel title="Projetos recentes">
          {projects.map(project => (
            <div key={project.id} style={styles.listItem}>
              <div>
                <strong>{project.name}</strong>
                <p style={styles.muted}>Responsável: {project.owner}</p>
              </div>
              <Badge color={STATUS[project.status]}>{project.status}</Badge>
            </div>
          ))}
        </Panel>
      </div>

      <Panel title="Atividades recentes">
        {tasks.slice(0, 5).map(task => (
          <div key={task.id} style={styles.activityItem}>
            <span>📌</span>
            <div>
              <strong>{task.title}</strong>
              <p style={styles.muted}>{task.project} · {task.responsible} · {task.status}</p>
            </div>
          </div>
        ))}
      </Panel>
    </div>
  );
}

function Projects({ projects, updateProject, addProject }) {
  return (
    <Panel title="Projetos" action={<button style={styles.primaryBtn} onClick={addProject}>+ Novo projeto</button>}>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr><Th>Projeto</Th><Th>Responsável</Th><Th>Status</Th><Th>Início</Th><Th>Fim</Th></tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id}>
                <Td><input style={styles.cellInput} value={p.name} onChange={e => updateProject(p.id, "name", e.target.value)} /></Td>
                <Td><input style={styles.cellInput} value={p.owner} onChange={e => updateProject(p.id, "owner", e.target.value)} /></Td>
                <Td><Select value={p.status} options={Object.keys(STATUS)} onChange={v => updateProject(p.id, "status", v)} color={STATUS[p.status]} /></Td>
                <Td><input type="date" style={styles.cellInput} value={p.start} onChange={e => updateProject(p.id, "start", e.target.value)} /></Td>
                <Td><input type="date" style={styles.cellInput} value={p.end} onChange={e => updateProject(p.id, "end", e.target.value)} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Tasks({ tasks, users, projects, updateTask, deleteTask, addTask }) {
  const groups = [...new Set(tasks.map(t => t.group || "Sem grupo"))];

  return (
    <div>
      <div style={styles.topAction}>
        <button style={styles.primaryBtn} onClick={addTask}>+ Nova tarefa</button>
      </div>

      {groups.map(group => (
        <Panel key={group} title={group}>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr><Th>Tarefa</Th><Th>Projeto</Th><Th>Responsável</Th><Th>Status</Th><Th>Prioridade</Th><Th>Prazo</Th><Th>Notas</Th><Th>Ação</Th></tr>
              </thead>
              <tbody>
                {tasks.filter(t => (t.group || "Sem grupo") === group).map(task => (
                  <tr key={task.id}>
                    <Td><input style={styles.cellInput} value={task.title} onChange={e => updateTask(task.id, "title", e.target.value)} /></Td>
                    <Td>
                      <select style={styles.plainSelect} value={task.project} onChange={e => updateTask(task.id, "project", e.target.value)}>
                        {projects.map(p => <option key={p.id}>{p.name}</option>)}
                      </select>
                    </Td>
                    <Td>
                      <select style={styles.plainSelect} value={task.responsible} onChange={e => updateTask(task.id, "responsible", e.target.value)}>
                        {users.map(u => <option key={u.id}>{u.name}</option>)}
                      </select>
                    </Td>
                    <Td><Select value={task.status} options={Object.keys(STATUS)} onChange={v => updateTask(task.id, "status", v)} color={STATUS[task.status]} /></Td>
                    <Td><Select value={task.priority} options={Object.keys(PRIORITY)} onChange={v => updateTask(task.id, "priority", v)} color={PRIORITY[task.priority]} /></Td>
                    <Td><input type="date" style={styles.cellInput} value={task.dueDate} onChange={e => updateTask(task.id, "dueDate", e.target.value)} /></Td>
                    <Td><input style={styles.cellInput} value={task.notes} onChange={e => updateTask(task.id, "notes", e.target.value)} /></Td>
                    <Td><button style={styles.dangerBtn} onClick={() => deleteTask(task.id)}>Excluir</button></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ))}
    </div>
  );
}

function Team({ users, tasks }) {
  return (
    <div style={styles.userGrid}>
      {users.map(user => {
        const count = tasks.filter(t => t.responsible === user.name).length;
        return (
          <div key={user.id} style={styles.userCard}>
            <div style={styles.bigAvatar}>{initials(user.name)}</div>
            <h3 style={styles.cardName}>{user.name}</h3>
            <p style={styles.muted}>{user.email}</p>
            <Badge color={roleColor(user.role)}>{user.role}</Badge>
            <p style={styles.taskCount}>{count} tarefa(s)</p>
          </div>
        );
      })}
    </div>
  );
}

function Users({ users, addUser, updateUser, deleteUser }) {
  return (
    <Panel title="Usuários e permissões" action={<button style={styles.primaryBtn} onClick={addUser}>+ Adicionar usuário</button>}>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr><Th>Nome</Th><Th>E-mail</Th><Th>Perfil</Th><Th>Status</Th><Th>Ação</Th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <Td><input style={styles.cellInput} value={u.name} onChange={e => updateUser(u.id, "name", e.target.value)} /></Td>
                <Td><input style={styles.cellInput} value={u.email} onChange={e => updateUser(u.id, "email", e.target.value)} /></Td>
                <Td><Select value={u.role} options={ROLES} onChange={v => updateUser(u.id, "role", v)} color={roleColor(u.role)} /></Td>
                <Td>
                  <select style={styles.plainSelect} value={u.status} onChange={e => updateUser(u.id, "status", e.target.value)}>
                    <option>Online</option>
                    <option>Offline</option>
                  </select>
                </Td>
                <Td><button style={styles.dangerBtn} onClick={() => deleteUser(u.id)}>Remover</button></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.permissionsBox}>
        <h3>Permissões por perfil</h3>
        <div style={styles.permissionsGrid}>
          <Permission role="Administrador" items={["Tudo", "Usuários", "Configurações", "Projetos"]} />
          <Permission role="Gerente" items={["Projetos", "Tarefas", "Equipe", "Timeline"]} />
          <Permission role="Membro" items={["Tarefas", "Equipe", "Dashboard"]} />
          <Permission role="Visualizador" items={["Somente leitura", "Dashboard"]} />
        </div>
      </div>
    </Panel>
  );
}

function Automations({ automations, toggleAutomation }) {
  return (
    <div style={styles.autoGrid}>
      {automations.map(a => (
        <div key={a.id} style={styles.autoCard}>
          <div>
            <h3 style={styles.autoTitle}>⚡ {a.name}</h3>
            <p style={styles.muted}>SE: {a.trigger}</p>
            <p style={styles.muted}>ENTÃO: {a.action}</p>
          </div>
          <button
            style={{ ...styles.toggleBtn, background: a.active ? COLORS.green : "#94a3b8" }}
            onClick={() => toggleAutomation(a.id)}
          >
            {a.active ? "Ativa" : "Inativa"}
          </button>
        </div>
      ))}
    </div>
  );
}

function Timeline({ projects, tasks }) {
  return (
    <Panel title="Timeline">
      {projects.map(project => {
        const projectTasks = tasks.filter(t => t.project === project.name);
        const done = projectTasks.filter(t => t.status === "Concluído").length;
        const pct = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0;

        return (
          <div key={project.id} style={styles.timelineItem}>
            <div style={styles.timelineHeader}>
              <strong>{project.name}</strong>
              <span>{project.start || "Sem início"} → {project.end || "Sem fim"}</span>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${pct}%`, background: STATUS[project.status] || COLORS.primary }} />
            </div>
            <p style={styles.muted}>{pct}% concluído · {projectTasks.length} tarefa(s)</p>
          </div>
        );
      })}
    </Panel>
  );
}

function Settings({ setData }) {
  return (
    <Panel title="Configurações">
      <p style={styles.muted}>Configurações locais do protótipo IES SUS.</p>
      <button
        style={styles.dangerBtn}
        onClick={() => {
          if (!confirm("Resetar todos os dados locais?")) return;
          localStorage.removeItem("ies_sus_data_v2");
          setData(initialData);
        }}
      >
        Resetar sistema
      </button>
    </Panel>
  );
}

function Profile({ user, setData }) {
  function updateProfile(field, value) {
    setData(d => ({
      ...d,
      loggedUser: { ...d.loggedUser, [field]: value },
    }));
  }

  return (
    <Panel title="Meu perfil">
      <div style={styles.profileBox}>
        <div style={styles.bigAvatar}>{initials(user?.name)}</div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Nome</label>
          <input style={styles.input} value={user?.name || ""} onChange={e => updateProfile("name", e.target.value)} />

          <label style={styles.label}>E-mail</label>
          <input style={styles.input} value={user?.email || ""} onChange={e => updateProfile("email", e.target.value)} />

          <label style={styles.label}>Perfil</label>
          <input style={styles.input} value={user?.role || ""} disabled />
        </div>
      </div>
    </Panel>
  );
}

function KpiCard({ title, value, icon, color }) {
  return (
    <div style={styles.kpiCard}>
      <div style={styles.kpiTop}>
        <span>{title}</span>
        <span style={styles.kpiIcon}>{icon}</span>
      </div>
      <strong style={{ ...styles.kpiValue, color }}>{value}</strong>
    </div>
  );
}

function Panel({ title, children, action }) {
  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <h2 style={styles.panelTitle}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function ProgressLine({ label, count, total, color }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div style={styles.progressLine}>
      <div style={styles.progressText}>
        <span>{label}</span>
        <strong>{count}</strong>
      </div>
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function Badge({ color, children }) {
  return <span style={{ ...styles.badge, background: color }}>{children}</span>;
}

function Select({ value, options, onChange, color }) {
  return (
    <select style={{ ...styles.coloredSelect, background: color || COLORS.primary }} value={value} onChange={e => onChange(e.target.value)}>
      {options.map(option => <option key={option}>{option}</option>)}
    </select>
  );
}

function Permission({ role, items }) {
  return (
    <div style={styles.permissionCard}>
      <strong>{role}</strong>
      <ul style={styles.permissionList}>
        {items.map(item => <li key={item}>✓ {item}</li>)}
      </ul>
    </div>
  );
}

function Th({ children }) {
  return <th style={styles.th}>{children}</th>;
}

function Td({ children }) {
  return <td style={styles.td}>{children}</td>;
}

function initials(name = "") {
  return name.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "IS";
}

function roleColor(role) {
  if (role === "Administrador") return COLORS.purple;
  if (role === "Gerente") return COLORS.primary;
  if (role === "Membro") return COLORS.green;
  return "#94a3b8";
}

const styles = {
  app: { height: "100vh", display: "flex", background: COLORS.bg, color: COLORS.text, fontFamily: "Arial, sans-serif", overflow: "hidden" },
  sidebar: { background: "#fff", borderRight: `1px solid ${COLORS.border}`, padding: 14, display: "flex", flexDirection: "column", transition: ".2s", flexShrink: 0 },
  brandRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 20 },
  logo: { width: 42, height: 42, borderRadius: 14, background: COLORS.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 },
  brandTitle: { display: "block", fontSize: 16 },
  brandSub: { fontSize: 11, color: COLORS.muted },
  collapseBtn: { marginLeft: "auto", border: "none", background: "transparent", fontSize: 22, cursor: "pointer", color: COLORS.muted },
  nav: { display: "grid", gap: 5 },
  navBtn: { display: "flex", alignItems: "center", gap: 10, border: "none", borderRadius: 12, padding: "11px 10px", background: "transparent", cursor: "pointer", color: COLORS.muted, fontSize: 14 },
  navBtnActive: { background: "#e3f2fd", color: COLORS.primary, fontWeight: 700 },
  userBox: { marginTop: "auto", borderTop: `1px solid ${COLORS.border}`, paddingTop: 14, display: "flex", gap: 10, alignItems: "center" },
  avatar: { width: 36, height: 36, borderRadius: "50%", background: COLORS.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 },
  smallMuted: { display: "block", color: COLORS.muted, fontSize: 11 },
  main: { flex: 1, overflowY: "auto" },
  header: { height: 82, background: "#fff", borderBottom: `1px solid ${COLORS.border}`, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  h1: { margin: 0, fontSize: 26 },
  headerSub: { margin: "5px 0 0", color: COLORS.muted },
  headerActions: { display: "flex", gap: 10 },
  content: { padding: 24 },
  primaryBtn: { border: "none", borderRadius: 12, padding: "10px 15px", background: COLORS.primary, color: "#fff", cursor: "pointer", fontWeight: 700 },
  secondaryBtn: { border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "10px 15px", background: "#fff", color: COLORS.text, cursor: "pointer", fontWeight: 700 },
  dangerBtn: { border: "none", borderRadius: 10, padding: "8px 11px", background: "#fee2e2", color: COLORS.red, cursor: "pointer", fontWeight: 700 },
  cardsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 16, marginBottom: 18 },
  kpiCard: { background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 18, boxShadow: "0 1px 4px rgba(15,23,42,.05)" },
  kpiTop: { display: "flex", alignItems: "center", justifyContent: "space-between", color: COLORS.muted, fontWeight: 700, fontSize: 13 },
  kpiIcon: { fontSize: 24 },
  kpiValue: { display: "block", fontSize: 34, marginTop: 8 },
  twoColumns: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 18 },
  panel: { background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 20, marginBottom: 18, boxShadow: "0 1px 4px rgba(15,23,42,.05)" },
  panelHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 },
  panelTitle: { margin: 0, fontSize: 18 },
  muted: { margin: "4px 0", color: COLORS.muted, fontSize: 13 },
  listItem: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 0", borderBottom: `1px solid ${COLORS.border}` },
  activityItem: { display: "flex", gap: 10, padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` },
  badge: { display: "inline-block", borderRadius: 999, padding: "5px 10px", color: "#fff", fontSize: 12, fontWeight: 800 },
  progressLine: { marginBottom: 13 },
  progressText: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 },
  progressBar: { height: 10, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 850 },
  th: { textAlign: "left", padding: 12, color: COLORS.muted, fontSize: 12, textTransform: "uppercase", borderBottom: `1px solid ${COLORS.border}` },
  td: { padding: 10, borderBottom: `1px solid ${COLORS.border}`, verticalAlign: "middle" },
  cellInput: { width: "100%", border: "none", outline: "none", background: "transparent", fontSize: 14, color: COLORS.text },
  plainSelect: { width: "100%", border: `1px solid ${COLORS.border}`, borderRadius: 9, padding: "7px 8px", background: "#fff" },
  coloredSelect: { border: "none", borderRadius: 9, padding: "7px 8px", color: "#fff", fontWeight: 800 },
  topAction: { display: "flex", justifyContent: "flex-end", marginBottom: 12 },
  userGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 16 },
  userCard: { background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 20 },
  bigAvatar: { width: 54, height: 54, borderRadius: "50%", background: COLORS.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, marginBottom: 12 },
  cardName: { margin: "0 0 4px" },
  taskCount: { color: COLORS.muted, fontSize: 13, marginTop: 12 },
  permissionsBox: { marginTop: 22 },
  permissionsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 },
  permissionCard: { border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 14, background: "#f8fafc" },
  permissionList: { margin: "8px 0 0", paddingLeft: 0, listStyle: "none", color: COLORS.muted, fontSize: 13, lineHeight: 1.8 },
  autoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 },
  autoCard: { background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  autoTitle: { margin: "0 0 8px" },
  toggleBtn: { border: "none", color: "#fff", borderRadius: 999, padding: "8px 12px", cursor: "pointer", fontWeight: 800 },
  timelineItem: { marginBottom: 18 },
  timelineHeader: { display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 },
  profileBox: { display: "flex", gap: 20, alignItems: "flex-start", maxWidth: 650 },
  label: { display: "block", fontSize: 12, fontWeight: 800, color: COLORS.muted, margin: "10px 0 5px", textTransform: "uppercase" },
  input: { width: "100%", padding: 11, border: `1px solid ${COLORS.border}`, borderRadius: 10, boxSizing: "border-box" },
};
