import { useEffect, useMemo, useState } from "react";

const COLORS = {
  primary: "#1877F2",
  primaryDark: "#0D47A1",
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
  loggedUser: {
    id: 1,
    name: "Thiago Freitas",
    email: "thiago@inteligenciaemsaude.com",
    role: "Administrador",
  },
  activePage: "dashboard",
  users: [
    {
      id: 1,
      name: "Thiago Freitas",
      email: "thiago@inteligenciaemsaude.com",
      role: "Administrador",
      status: "Online",
    },
    {
      id: 2,
      name: "Luciano Santos",
      email: "luciano@inteligenciaemsaude.com",
      role: "Gerente",
      status: "Online",
    },
    {
      id: 3,
      name: "Ana Silva",
      email: "ana@inteligenciaemsaude.com",
      role: "Membro",
      status: "Offline",
    },
    {
      id: 4,
      name: "Pedro Costa",
      email: "pedro@inteligenciaemsaude.com",
      role: "Visualizador",
      status: "Offline",
    },
  ],
  projects: [
    {
      id: 1,
      name: "Fatura SUS",
      owner: "Luciano Santos",
      status: "Em andamento",
      start: "2026-04-01",
      end: "2026-07-31",
    },
    {
      id: 2,
      name: "Controle & Avaliação",
      owner: "Ana Silva",
      status: "Em andamento",
      start: "2026-05-01",
      end: "2026-08-30",
    },
    {
      id: 3,
      name: "Regulação SUS",
      owner: "Pedro Costa",
      status: "Não iniciado",
      start: "2026-06-01",
      end: "2026-10-15",
    },
  ],
  tasks: [
    {
      id: 1,
      title: "Módulo de validação de AIH",
      project: "Fatura SUS",
      group: "Em andamento",
      responsible: "Luciano Santos",
      status: "Em andamento",
      priority: "Crítica",
      dueDate: "2026-05-30",
      notes: "Validação das regras principais.",
    },
    {
      id: 2,
      title: "Integração CNES",
      project: "Fatura SUS",
      group: "Em andamento",
      responsible: "Ana Silva",
      status: "Em andamento",
      priority: "Alta",
      dueDate: "2026-05-20",
      notes: "Conectar dados de estabelecimentos.",
    },
    {
      id: 3,
      title: "Dashboard financeiro",
      project: "Fatura SUS",
      group: "Planejamento",
      responsible: "Pedro Costa",
      status: "Em espera",
      priority: "Média",
      dueDate: "2026-06-10",
      notes: "Aguardando definição dos indicadores.",
    },
    {
      id: 4,
      title: "Módulo de auditoria",
      project: "Controle & Avaliação",
      group: "Sprint 1",
      responsible: "Ana Silva",
      status: "Não iniciado",
      priority: "Alta",
      dueDate: "2026-06-15",
      notes: "",
    },
    {
      id: 5,
      title: "Autenticação de usuários",
      project: "IES SUS",
      group: "Concluídos",
      responsible: "Thiago Freitas",
      status: "Concluído",
      priority: "Crítica",
      dueDate: "2026-04-15",
      notes: "Base inicial criada.",
    },
  ],
  automations: [
    {
      id: 1,
      name: "Tarefa vencida → notificar responsável",
      trigger: "Prazo expirado",
      action: "Enviar alerta",
      active: true,
    },
    {
      id: 2,
      name: "Status concluído → mover para concluídos",
      trigger: "Status = Concluído",
      action: "Mover tarefa",
      active: true,
    },
    {
      id: 3,
      name: "Prioridade crítica → alertar administrador",
      trigger: "Prioridade = Crítica",
      action: "Notificar administrador",
      active: false,
    },
    {
      id: 4,
      name: "Projeto concluído → gerar relatório",
      trigger: "Todas as tarefas concluídas",
      action: "Gerar relatório",
      active: false,
    },
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

function safeLoad() {
  try {
    const saved = localStorage.getItem("ies_sus_data");
    return saved ? JSON.parse(saved) : initialData;
  } catch {
    return initialData;
  }
}

export default function App() {
  const [data, setData] = useState(safeLoad);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem("ies_sus_data", JSON.stringify(data));
  }, [data]);

  const tasks = data.tasks || [];
  const users = data.users || [];
  const projects = data.projects || [];
  const page = data.activePage || "dashboard";

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      done: tasks.filter((t) => t.status === "Concluído").length,
      progress: tasks.filter((t) => t.status === "Em andamento").length,
      blocked: tasks.filter((t) => t.status === "Travado").length,
      users: users.length,
      projects: projects.length,
    };
  }, [tasks, users, projects]);

  function setPage(pageId) {
    setData((d) => ({ ...d, activePage: pageId }));
  }

  function updateTask(id, field, value) {
    setData((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    }));
  }

  function addTask() {
    const title = prompt("Nome da nova tarefa:");
    if (!title) return;

    setData((d) => ({
      ...d,
      tasks: [
        ...d.tasks,
        {
          id: Date.now(),
          title,
          project: d.projects[0]?.name || "IES SUS",
          group: "Novo grupo",
          responsible: d.loggedUser?.name || "Sem responsável",
          status: "Não iniciado",
          priority: "Média",
          dueDate: "",
          notes: "",
        },
      ],
      activePage: "tasks",
    }));
  }

  function deleteTask(id) {
    if (!confirm("Excluir esta tarefa?")) return;
    setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }));
  }

  function addUser() {
    const name = prompt("Nome do usuário:");
    if (!name) return;

    const email = prompt("E-mail do usuário:") || "usuario@ies-sus.com";

    setData((d) => ({
      ...d,
      users: [
        ...d.users,
        {
          id: Date.now(),
          name,
          email,
          role: "Membro",
          status: "Offline",
        },
      ],
    }));
  }

  function updateUser(id, field, value) {
    setData((d) => ({
      ...d,
      users: d.users.map((u) => (u.id === id ? { ...u, [field]: value } : u)),
    }));
  }

  function deleteUser(id) {
    if (!confirm("Remover este usuário?")) return;
    setData((d) => ({
      ...d,
      users: d.users.filter((u) => u.id !== id),
    }));
  }

  function addProject() {
    const name = prompt("Nome do projeto:");
    if (!name) return;

    setData((d) => ({
      ...d,
      projects: [
        ...d.projects,
        {
          id: Date.now(),
          name,
          owner: d.loggedUser?.name || "Administrador",
          status: "Não iniciado",
          start: "",
          end: "",
        },
      ],
    }));
  }

  function updateProject(id, field, value) {
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  }

  function toggleAutomation(id) {
    setData((d) => ({
      ...d,
      automations: d.automations.map((a) => (a.id === id ? { ...a, active: !a.active } : a)),
    }));
  }

  const pageTitle = NAV.find((n) => n.id === page)?.label || "Dashboard";

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
          <button style={styles.collapseBtn} onClick={() => setSidebarOpen((v) => !v)}>
            {sidebarOpen ? "‹" : "☰"}
          </button>
        </div>

        <nav style={styles.nav}>
          {NAV.map((item) => (
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
            <button style={styles.secondaryBtn} onClick={() => setPage("profile")}>
              Meu perfil
            </button>
            <button style={styles.primaryBtn} onClick={addTask}>
              + Nova tarefa
            </button>
          </div>
        </header>

        <section style={styles.content}>
          {page === "dashboard" && <Dashboard stats={stats} tasks={tasks} projects={projects} />}
          {page === "projects" && (
            <Projects
              projects={projects}
              updateProject={updateProject}
              addProject={addProject}
            />
          )}
          {page === "tasks" && (
            <Tasks
              tasks={tasks}
              users={users}
              projects={projects}
              updateTask={updateTask}
              deleteTask={deleteTask}
              addTask={addTask}
            />
          )}
          {page === "team" && <Team users={users} tasks={tasks} />}
          {page === "users" && (
            <Users
              users={users}
              addUser={addUser}
              updateUser={updateUser}
              deleteUser={deleteUser}
            />
          )}
          {page === "automations" && (
            <Automations automations={data.automations} toggleAutomation={toggleAutomation} />
          )}
          {page === "timeline" && <Timeline projects={projects} tasks={tasks} />}
          {page === "settings" && <Settings setData={setData} />}
          {page === "profile" && <Profile user={data.loggedUser} setData={setData} />}
        </section>
      </main>
    </div>
  );
}function Dashboard({ stats, tasks, projects }) {
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
          {Object.keys(STATUS).map((status) => {
            const count = tasks.filter((t) => t.status === status).length;
            return (
              <ProgressLine
                key={status}
                label={status}
                count={count}
                total={tasks.length}
                color={STATUS[status]}
              />
            );
          })}
        </Panel>

        <Panel title="Projetos recentes">
          {projects.map((project) => (
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
        {tasks.slice(0, 5).map((task) => (
          <div key={task.id} style={styles.activityItem}>
            <span>📌</span>
            <div>
              <strong>{task.title}</strong>
              <p style={styles.muted}>
                {task.project} · {task.responsible} · {task.status}
              </p>
            </div>
          </div>
        ))}
      </Panel>
    </div>
  );
}

function Projects({ projects, updateProject, addProject }) {
  return (
    <Panel
      title="Projetos"
      action={
        <button style={styles.primaryBtn} onClick={addProject}>
          + Novo projeto
        </button>
      }
    >
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <Th>Projeto</Th>
              <Th>Responsável</Th>
              <Th>Status</Th>
              <Th>Início</Th>
              <Th>Fim</Th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <Td>
                  <input
                    style={styles.cellInput}
                    value={p.name}
                    onChange={(e) => updateProject(p.id, "name", e.target.value)}
                  />
                </Td>
                <Td>
                  <input
                    style={styles.cellInput}
                    value={p.owner}
                    onChange={(e) => updateProject(p.id, "owner", e.target.value)}
                  />
                </Td>
                <Td>
                  <Select
                    value={p.status}
                    options={Object.keys(STATUS)}
                    onChange={(v) => updateProject(p.id, "status", v)}
                    color={STATUS[p.status]}
                  />
                </Td>
                <Td>
                  <input
                    type="date"
                    style={styles.cellInput}
                    value={p.start}
                    onChange={(e) => updateProject(p.id, "start", e.target.value)}
                  />
                </Td>
                <Td>
                  <input
                    type="date"
                    style={styles.cellInput}
                    value={p.end}
                    onChange={(e) => updateProject(p.id, "end", e.target.value)}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Tasks({ tasks, users, projects, updateTask, deleteTask, addTask }) {
  const groups = [...new Set(tasks.map((t) => t.group || "Sem grupo"))];

  return (
    <div>
      <div style={styles.topAction}>
        <button style={styles.primaryBtn} onClick={addTask}>
          + Nova tarefa
        </button>
      </div>

      {groups.map((group) => (
        <Panel key={group} title={group}>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <Th>Tarefa</Th>
                  <Th>Projeto</Th>
                  <Th>Responsável</Th>
                  <Th>Status</Th>
                  <Th>Prioridade</Th>
                  <Th>Prazo</Th>
                  <Th>Notas</Th>
                  <Th>Ação</Th>
                </tr>
              </thead>
              <tbody>
                {tasks
                  .filter((t) => (t.group || "Sem grupo") === group)
                  .map((task) => (
                    <tr key={task.id}>
                      <Td>
                        <input
                          style={styles.cellInput}
                          value={task.title}
                          onChange={(e) => updateTask(task.id, "title", e.target.value)}
                        />
                      </Td>
                      <Td>
                        <select
                          style={styles.plainSelect}
                          value={task.project}
                          onChange={(e) => updateTask(task.id, "project", e.target.value)}
                        >
                          {projects.map((p) => (
                            <option key={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </Td>
                      <Td>
                        <select
                          style={styles.plainSelect}
                          value={task.responsible}
                          onChange={(e) => updateTask(task.id, "responsible", e.target.value)}
                        >
                          {users.map((u) => (
                            <option key={u.id}>{u.name}</option>
                          ))}
                        </select>
                      </Td>
                      <Td>
                        <Select
                          value={task.status}
                          options={Object.keys(STATUS)}
                          onChange={(v) => updateTask(task.id, "status", v)}
                          color={STATUS[task.status]}
                        />
                      </Td>
                      <Td>
                        <Select
                          value={task.priority}
                          options={Object.keys(PRIORITY)}
                          onChange={(v) => updateTask(task.id, "priority", v)}
                          color={PRIORITY[task.priority]}
                        />
                      </Td>
                      <Td>
                        <input
                          type="date"
                          style={styles.cellInput}
                          value={task.dueDate}
                          onChange={(e) => updateTask(task.id, "dueDate", e.target.value)}
                        />
                      </Td>
                      <Td>
                        <input
                          style={styles.cellInput}
                          value={task.notes}
                          onChange={(e) => updateTask(task.id, "notes", e.target.value)}
                        />
                      </Td>
                      <Td>
                        <button style={styles.dangerBtn} onClick={() => deleteTask(task.id)}>
                          Excluir
                        </button>
                      </Td>
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
      {users.map((user) => {
        const count = tasks.filter((t) => t.responsible === user.name).length;
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
    <Panel
      title="Usuários e permissões"
      action={
        <button style={styles.primaryBtn} onClick={addUser}>
          + Adicionar usuário
        </button>
      }
    >
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <Th>Nome</Th>
              <Th>E-mail</Th>
              <Th>Perfil</Th>
              <Th>Status</Th>
              <Th>Ação</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <Td>
                  <input
                    style={styles.cellInput}
                    value={u.name}
                    onChange={(e) => updateUser(u.id, "name", e.target.value)}
                  />
                </Td>
                <Td>
                  <input
                    style={styles.cellInput}
                    value={u.email}
                    onChange={(e) => updateUser(u.id, "email", e.target.value)}
                  />
                </Td>
                <Td>
                  <Select
                    value={u.role}
                    options={ROLES}
                    onChange={(v) => updateUser(u.id, "role", v)}
                    color={roleColor(u.role)}
                  />
                </Td>
                <Td>
                  <select
                    style={styles.plainSelect}
                    value={u.status}
                    onChange={(e) => updateUser(u.id, "status", e.target.value)}
                  >
                    <option>Online</option>
                    <option>Offline</option>
                  </select>
                </Td>
                <Td>
                  <button style={styles.dangerBtn} onClick={() => deleteUser(u.id)}>
                    Remover
                  </button>
                </Td>
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
