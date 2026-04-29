import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";

/* ─────────────── PALETA ─────────────────────────────────────────────── */
const C = {
  primary:"#1877F2", dark:"#0D47A1", mid:"#1E88E5", sky:"#42A5F5",
  pale:"#E3F2FD", white:"#fff", offW:"#F0F6FF",
  tx:"#1e293b", t2:"#64748b", bd:"#e2e8f0",
  green:"#10b981", red:"#ef4444", amber:"#f59e0b", purple:"#7c3aed",
};
const ROLE_CLR = { admin:"#7c3aed", manager:"#1877F2", member:"#10b981", viewer:"#94a3b8" };
const ROLE_LBL = { admin:"Admin", manager:"Gerente", member:"Membro", viewer:"Visualizador" };
const AV_CLR   = { TF:"#7c3aed",LU:"#1877F2",MA:"#10b981",AS:"#ef4444",PC:"#f59e0b",
                   Ana:"#ef4444",Carlos:"#7c3aed",João:"#1877F2",Lucia:"#059669",Maria:"#d97706",Pedro:"#0891b2" };
const STATUS_C = { "Não iniciado":"#94a3b8","Em progresso":"#3b82f6","Concluído":"#10b981","Travado":"#ef4444","Em espera":"#f59e0b" };
const PRIORITY_C = { Crítica:"#ef4444",Alta:"#f59e0b",Média:"#3b82f6",Baixa:"#94a3b8" };
const STATUS_LIST = Object.keys(STATUS_C);
const PRIORITY_LIST = Object.keys(PRIORITY_C);
const MEMBERS = ["—","Ana","Carlos","João","Lucia","Maria","Pedro"];
const GRP_CLR = ["#7c3aed","#10b981","#ef4444","#3b82f6","#f59e0b","#ec4899","#059669","#6366f1"];
const B_ICONS = ["🚀","⚙️","👥","📊","📋","🎯","💼","🌟"];
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,5); }

/* ─────────────── DADOS INICIAIS ─────────────────────────────────────── */
const INIT = {
  currentBoardId:"b1", dark:false, activeModule:"dashboard",
  currentUser:null,
  boards:[
    { id:"b1",name:"Fatura SUS",icon:"🏥",
      groups:[
        { id:"g1",name:"Em andamento",color:"#10b981",open:true,items:[
          {id:"i1",name:"Módulo de validação de AIH",status:"Em progresso",assignee:"Luciano",dueDate:"2026-05-30",priority:"Crítica",notes:""},
          {id:"i2",name:"Integração CNES",status:"Em progresso",assignee:"Ana",dueDate:"2026-05-20",priority:"Alta",notes:""},
          {id:"i3",name:"Dashboard financeiro",status:"Em espera",assignee:"Pedro",dueDate:"2026-06-10",priority:"Média",notes:"Aguardando API"},
        ]},
        { id:"g2",name:"Planejamento",color:"#3b82f6",open:true,items:[
          {id:"i4",name:"Módulo de relatórios",status:"Não iniciado",assignee:"Maria",dueDate:"2026-07-01",priority:"Alta",notes:""},
          {id:"i5",name:"App mobile",status:"Não iniciado",assignee:"—",dueDate:"2026-08-01",priority:"Média",notes:""},
        ]},
        { id:"g3",name:"Concluídos",color:"#94a3b8",open:false,items:[
          {id:"i6",name:"Autenticação JWT",status:"Concluído",assignee:"Carlos",dueDate:"2026-04-15",priority:"Crítica",notes:""},
          {id:"i7",name:"Design system",status:"Concluído",assignee:"Ana",dueDate:"2026-04-20",priority:"Alta",notes:""},
        ]},
      ]
    },
    { id:"b2",name:"Controle & Avaliação",icon:"📊",
      groups:[
        { id:"g4",name:"Sprint 1",color:"#7c3aed",open:true,items:[
          {id:"i8",name:"Módulo de auditoria",status:"Em progresso",assignee:"João",dueDate:"2026-05-25",priority:"Alta",notes:""},
          {id:"i9",name:"Indicadores de qualidade",status:"Não iniciado",assignee:"Lucia",dueDate:"2026-06-15",priority:"Média",notes:""},
        ]},
      ]
    },
  ],
  users:[
    {id:"u1",name:"Thiago Freitas",email:"thiago@inteligenciaemsaude.com",role:"admin",av:"TF",status:"online",tasks:3},
    {id:"u2",name:"Luciano Santos",email:"luciano@inteligenciaemsaude.com",role:"manager",av:"LU",status:"online",tasks:5},
    {id:"u3",name:"Mauricio Rocha",email:"mauricio@inteligenciaemsaude.com",role:"manager",av:"MA",status:"offline",tasks:2},
    {id:"u4",name:"Ana Silva",email:"ana@inteligenciaemsaude.com",role:"member",av:"AS",status:"online",tasks:4},
    {id:"u5",name:"Pedro Costa",email:"pedro@inteligenciaemsaude.com",role:"member",av:"PC",status:"offline",tasks:1},
  ],
  automations:[
    {id:"a1",icon:"⏰",name:"Tarefa vencida → Notificar responsável",trigger:"Prazo expirado",action:"Envia notificação",cat:"Notificação",active:true},
    {id:"a2",icon:"✅",name:"Status Concluído → Mover para grupo Concluídos",trigger:"Status muda para Concluído",action:"Move para grupo",cat:"Movimento",active:true},
    {id:"a3",icon:"👤",name:"Nova tarefa → Atribuir ao gerente do projeto",trigger:"Tarefa criada",action:"Atribui responsável",cat:"Atribuição",active:false},
    {id:"a4",icon:"📧",name:"Tarefa atrasada → Notificar CEO",trigger:"Prazo + 2 dias",action:"E-mail para admin",cat:"Notificação",active:false},
    {id:"a5",icon:"🔄",name:"Item movido → Atualizar dashboard",trigger:"Grupo alterado",action:"Recalcula métricas",cat:"Sincronização",active:true},
    {id:"a6",icon:"📅",name:"Início do sprint → Criar tarefas do template",trigger:"Segunda-feira",action:"Cria tarefas padrão",cat:"Agendamento",active:false},
    {id:"a7",icon:"🚨",name:"Prioridade Crítica → Alertar equipe",trigger:"Prioridade = Crítica",action:"Notifica todos membros",cat:"Notificação",active:true},
    {id:"a8",icon:"🗂️",name:"Projeto concluído → Gerar relatório",trigger:"Todos itens Concluídos",action:"Gera PDF de encerramento",cat:"Relatório",active:false},
  ],
  timeline:[
    {id:"t1",name:"Fatura SUS — MVP",start:"2026-04-01",end:"2026-07-31",status:"Em progresso",owner:"Luciano",color:"#3b82f6"},
    {id:"t2",name:"Controle & Avaliação",start:"2026-05-15",end:"2026-09-30",status:"Em progresso",owner:"João",color:"#7c3aed"},
    {id:"t3",name:"Portal Transparência",start:"2026-07-01",end:"2026-10-31",status:"Não iniciado",owner:"Ana",color:"#10b981"},
    {id:"t4",name:"App Mobile",start:"2026-08-01",end:"2026-12-31",status:"Não iniciado",owner:"Pedro",color:"#f59e0b"},
    {id:"t5",name:"Módulo de Regulação",start:"2026-09-01",end:"2026-12-15",status:"Não iniciado",owner:"Maria",color:"#ef4444"},
    {id:"t6",name:"Design System v2",start:"2026-04-15",end:"2026-05-30",status:"Concluído",owner:"Ana",color:"#10b981"},
  ],
};

/* ─────────────── MICRO COMPONENTES ─────────────────────────────────── */
function Dd({trigger,children,right=false}){
  const [o,setO]=useState(false);
  const r=useRef();
  useEffect(()=>{
    if(!o)return;
    const h=e=>{if(r.current&&!r.current.contains(e.target))setO(false);};
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[o]);
  return(
    <div ref={r} style={{position:"relative",display:"inline-block"}}>
      {trigger(()=>setO(v=>!v))}
      {o&&(
        <div style={{position:"absolute",zIndex:9999,top:"calc(100%+4px)",
          [right?"right":"left"]:0,minWidth:170,background:"#fff",
          borderRadius:10,boxShadow:"0 8px 28px rgba(0,0,0,.13)",
          border:"1px solid #e2e8f0",padding:"4px 0",overflow:"hidden"}}>
          {children(()=>setO(false))}
        </div>
      )}
    </div>
  );
}
function DdItem({onClick,danger,children}){
  const [h,setH]=useState(false);
  return(
    <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"7px 13px",
        background:h?(danger?"#fef2f2":"#f8fafc"):"none",border:"none",cursor:"pointer",
        fontSize:12,color:danger?"#ef4444":"#374151",textAlign:"left"}}>
      {children}
    </button>
  );
}
function Avatar({name,size=28,sq=false}){
  const c=AV_CLR[name]||"#94a3b8";
  const lbl=name&&name!=="—"?name.split(" ").map(w=>w[0]).join("").slice(0,2):"?";
  if(!name||name==="—") return(
    <div style={{width:size,height:size,borderRadius:sq?6:"50%",
      border:"2px dashed #d1d5db",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <span style={{fontSize:11,color:"#9ca3af"}}>+</span>
    </div>
  );
  return(
    <div title={name} style={{width:size,height:size,borderRadius:sq?6:"50%",background:c,flexShrink:0,
      display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:size>30?14:size>22?12:10,fontWeight:700,color:"#fff"}}>
      {lbl}
    </div>
  );
}
function StatusBadge({val,onChange}){
  const col=STATUS_C[val]||"#94a3b8";
  return(
    <Dd trigger={tog=>(
      <button onClick={tog} style={{background:col,color:"#fff",border:"none",
        borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:600,
        cursor:"pointer",minWidth:108,textAlign:"center",whiteSpace:"nowrap"}}>
        {val}
      </button>
    )}>
      {close=>STATUS_LIST.map(s=>(
        <DdItem key={s} onClick={()=>{onChange(s);close();}}>
          <span style={{width:9,height:9,borderRadius:"50%",background:STATUS_C[s],flexShrink:0}}/>
          {s}{s===val&&<span style={{marginLeft:"auto",fontSize:10,color:"#7c3aed"}}>✓</span>}
        </DdItem>
      ))}
    </Dd>
  );
}
function PriBadge({val,onChange}){
  const col=PRIORITY_C[val]||"#94a3b8";
  return(
    <Dd trigger={tog=>(
      <button onClick={tog} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",
        borderRadius:6,fontSize:11,fontWeight:500,border:`1px solid ${col}44`,
        background:`${col}14`,color:col,cursor:"pointer",whiteSpace:"nowrap"}}>
        ⚑ {val}
      </button>
    )}>
      {close=>PRIORITY_LIST.map(p=>(
        <DdItem key={p} onClick={()=>{onChange(p);close();}}>
          <span style={{color:PRIORITY_C[p]}}>⚑</span>{p}
          {p===val&&<span style={{marginLeft:"auto",fontSize:10,color:"#7c3aed"}}>✓</span>}
        </DdItem>
      ))}
    </Dd>
  );
}
function AssigneePicker({val,onChange}){
  return(
    <Dd trigger={tog=>(
      <button onClick={tog} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",padding:0}}>
        <Avatar name={val} size={26}/>
        {val&&val!=="—"&&<span style={{fontSize:11,color:"#4b5563"}}>{val}</span>}
      </button>
    )}>
      {close=>MEMBERS.map(m=>(
        <DdItem key={m} onClick={()=>{onChange(m);close();}}>
          <Avatar name={m} size={22}/><span>{m==="—"?"Nenhum":m}</span>
          {m===val&&<span style={{marginLeft:"auto",fontSize:10,color:"#7c3aed"}}>✓</span>}
        </DdItem>
      ))}
    </Dd>
  );
}
function InlineEdit({val,onSave,style={},ph=""}){
  const [ed,setEd]=useState(false);
  const [v,setV]=useState(val);
  const commit=()=>{onSave(v);setEd(false);};
  if(ed) return(
    <input autoFocus value={v} onChange={e=>setV(e.target.value)}
      onBlur={commit} onKeyDown={e=>{if(e.key==="Enter"||e.key==="Escape")commit();}}
      placeholder={ph} style={{...style,background:"transparent",border:"none",outline:"none",width:"100%",fontFamily:"inherit"}}/>
  );
  return(
    <span onClick={()=>{setV(val);setEd(true);}}
      style={{...style,cursor:"text",display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
      {val||<span style={{color:"#9ca3af"}}>{ph}</span>}
    </span>
  );
}
function Toggle({on,onChange}){
  return(
    <button onClick={()=>onChange(!on)} style={{width:40,height:22,borderRadius:11,border:"none",cursor:"pointer",
      background:on?C.primary:"#d1d5db",position:"relative",transition:"background .2s",flexShrink:0}}>
      <span style={{position:"absolute",top:2,left:on?20:2,width:18,height:18,
        borderRadius:"50%",background:"#fff",transition:"left .2s",display:"block"}}/>
    </button>
  );
}

/* ─────────────── TASK COMPONENTS (reaproveitados) ─────────────────── */
function Row({item,gid,upd,del,dark}){
  const [hov,setHov]=useState(false);
  const over=item.dueDate&&new Date(item.dueDate)<new Date()&&item.status!=="Concluído";
  const bg=hov?(dark?"#1e293b":"#f5f3ff"):"transparent";
  const bd=dark?"#1f2937":"#f1f5f9";
  const tx=dark?"#e2e8f0":"#1e293b";
  const t2=dark?"#64748b":"#94a3b8";
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"flex",alignItems:"center",background:bg,borderTop:`1px solid ${bd}`,transition:"background .1s"}}>
      <div style={{width:34,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{width:14,height:14,borderRadius:3,border:`2px solid ${hov?C.primary:"#d1d5db"}`,transition:"border-color .15s"}}/>
      </div>
      <div style={{flex:1,minWidth:0,padding:"9px 10px",borderLeft:`1px solid ${bd}`}}>
        <InlineEdit val={item.name} onSave={v=>upd(gid,item.id,"name",v)} style={{fontSize:12,color:tx,fontWeight:500}}/>
      </div>
      <div style={{width:118,flexShrink:0,padding:"9px 6px",borderLeft:`1px solid ${bd}`}}>
        <StatusBadge val={item.status} onChange={v=>upd(gid,item.id,"status",v)}/>
      </div>
      <div style={{width:126,flexShrink:0,padding:"9px 10px",borderLeft:`1px solid ${bd}`}}>
        <AssigneePicker val={item.assignee} onChange={v=>upd(gid,item.id,"assignee",v)}/>
      </div>
      <div style={{width:116,flexShrink:0,padding:"9px 10px",borderLeft:`1px solid ${bd}`}}>
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          {item.dueDate&&<span style={{fontSize:11,color:over?"#ef4444":t2}}>📅</span>}
          <input type="date" value={item.dueDate} onChange={e=>upd(gid,item.id,"dueDate",e.target.value)}
            style={{fontSize:11,background:"transparent",border:"none",outline:"none",cursor:"pointer",
              color:over?"#ef4444":t2,fontFamily:"inherit",width:"100%"}}/>
        </div>
      </div>
      <div style={{width:108,flexShrink:0,padding:"9px 6px",borderLeft:`1px solid ${bd}`}}>
        <PriBadge val={item.priority} onChange={v=>upd(gid,item.id,"priority",v)}/>
      </div>
      <div style={{width:144,flexShrink:0,padding:"9px 10px",borderLeft:`1px solid ${bd}`}}>
        <InlineEdit val={item.notes} onSave={v=>upd(gid,item.id,"notes",v)} ph="—" style={{fontSize:11,color:item.notes?t2:"#d1d5db"}}/>
      </div>
      <div style={{width:34,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",opacity:hov?1:0,transition:"opacity .15s"}}>
        <Dd right trigger={tog=><button onClick={tog} style={{background:"none",border:"none",cursor:"pointer",padding:3,borderRadius:4,color:t2,fontSize:15}}>···</button>}>
          {close=>(<DdItem danger onClick={()=>{del(gid,item.id);close();}}>🗑 Excluir</DdItem>)}
        </Dd>
      </div>
    </div>
  );
}
function Group({group,upd,del,addItem,renameGroup,toggleGroup,deleteGroup,dark}){
  const [adding,setAdding]=useState(false);
  const [newN,setNewN]=useState("");
  const [editN,setEditN]=useState(false);
  const [grpN,setGrpN]=useState(group.name);
  const done=group.items.filter(i=>i.status==="Concluído").length;
  const pct=group.items.length?Math.round(done/group.items.length*100):0;
  const commit=()=>{if(newN.trim())addItem(group.id,newN);setNewN("");setAdding(false);};
  const bd=dark?"#1f2937":"#f1f5f9"; const cardBg=dark?"#0f172a":"#fff";
  const hdrBg=dark?"#111827":"#f8fafc"; const tx=dark?"#e2e8f0":"#1e293b"; const t2=dark?"#64748b":"#94a3b8";
  const COLS=["Nome da Tarefa","Status","Responsável","Prazo","Prioridade","Notas"];
  return(
    <div style={{borderRadius:12,border:`1px solid ${dark?"#1f2937":"#e2e8f0"}`,background:cardBg,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",background:`${group.color}18`}}>
        <button onClick={()=>toggleGroup(group.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:t2,padding:0}}>
          {group.open?"▾":"▸"}
        </button>
        <div style={{width:11,height:11,borderRadius:3,background:group.color,flexShrink:0}}/>
        {editN?(
          <input autoFocus value={grpN} onChange={e=>setGrpN(e.target.value)}
            onBlur={()=>{renameGroup(group.id,grpN);setEditN(false);}}
            onKeyDown={e=>{if(e.key==="Enter"||e.key==="Escape"){renameGroup(group.id,grpN);setEditN(false);}}}
            style={{fontSize:13,fontWeight:600,background:"transparent",border:"none",outline:"none",
              borderBottom:`2px solid ${group.color}`,color:group.color,fontFamily:"inherit"}}/>
        ):(
          <span onClick={()=>{setGrpN(group.name);setEditN(true);}} style={{fontSize:13,fontWeight:600,cursor:"pointer",color:group.color}}>{group.name}</span>
        )}
        <span style={{fontSize:11,color:t2}}>({group.items.length})</span>
        {group.items.length>0&&(
          <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:6}}>
            <div style={{width:56,height:5,borderRadius:3,background:dark?"#374151":"#e2e8f0",overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:3,background:"#10b981",width:`${pct}%`,transition:"width .3s"}}/>
            </div>
            <span style={{fontSize:10,color:t2}}>{pct}%</span>
          </div>
        )}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4}}>
          <button onClick={()=>{setAdding(true);setNewN("");}}
            onMouseEnter={e=>{e.currentTarget.style.color=C.primary;e.currentTarget.style.background=dark?"#1e293b":"#ede9fe";}}
            onMouseLeave={e=>{e.currentTarget.style.color=t2;e.currentTarget.style.background="none";}}
            style={{fontSize:11,padding:"4px 9px",borderRadius:6,background:"none",border:"none",cursor:"pointer",color:t2}}>
            + Adicionar
          </button>
          <Dd right trigger={tog=><button onClick={tog} style={{background:"none",border:"none",cursor:"pointer",padding:"3px 5px",borderRadius:4,color:t2,fontSize:14}}>···</button>}>
            {close=>(<DdItem danger onClick={()=>{deleteGroup(group.id);close();}}>🗑 Excluir grupo</DdItem>)}
          </Dd>
        </div>
      </div>
      {group.open&&(
        <>
          <div style={{display:"flex",alignItems:"center",background:hdrBg,borderTop:`1px solid ${bd}`,borderBottom:`1px solid ${bd}`}}>
            <div style={{width:34,flexShrink:0}}/>
            {COLS.map((c,i)=>(
              <div key={c} style={{...(i===0?{flex:1,minWidth:0}:{width:[118,126,116,108,144][i-1]+"px",flexShrink:0}),
                padding:"5px 10px",fontSize:10,fontWeight:600,color:t2,
                textTransform:"uppercase",letterSpacing:".06em",borderLeft:`1px solid ${bd}`}}>
                {c}
              </div>
            ))}
            <div style={{width:34,flexShrink:0}}/>
          </div>
          {group.items.map(it=>(<Row key={it.id} item={it} gid={group.id} upd={upd} del={del} dark={dark}/>))}
          {adding?(
            <div style={{display:"flex",alignItems:"center",borderTop:`1px solid ${bd}`,background:dark?"#1e1e2e":"#faf5ff"}}>
              <div style={{width:34,flexShrink:0}}/>
              <input autoFocus value={newN} onChange={e=>setNewN(e.target.value)}
                placeholder="Nome da tarefa... (Enter para salvar)"
                onKeyDown={e=>{if(e.key==="Enter")commit();if(e.key==="Escape"){setAdding(false);setNewN("");}}}
                onBlur={commit}
                style={{flex:1,padding:"9px 10px",fontSize:12,background:"transparent",border:"none",outline:"none",fontFamily:"inherit",color:tx}}/>
              <button onClick={()=>{setAdding(false);setNewN("");}} style={{background:"none",border:"none",cursor:"pointer",padding:"0 10px",color:t2,fontSize:16}}>✕</button>
            </div>
          ):(
            <button onClick={()=>{setAdding(true);setNewN("");}}
              onMouseEnter={e=>{e.currentTarget.style.background=dark?"#1e293b":"#f5f3ff";e.currentTarget.style.color=C.primary;}}
              onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=t2;}}
              style={{width:"100%",display:"flex",alignItems:"center",gap:6,padding:"8px 12px",background:"none",
                border:"none",borderTop:`1px solid ${bd}`,cursor:"pointer",fontSize:12,color:t2,transition:"all .15s"}}>
              + Adicionar tarefa
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* ─────────────── MÓDULO 1 — DASHBOARD ──────────────────────────────── */
function DashboardView({data,dark}){
  const allItems=data.boards.flatMap(b=>b.groups.flatMap(g=>g.items));
  const stats={
    total:allItems.length,
    done:allItems.filter(i=>i.status==="Concluído").length,
    prog:allItems.filter(i=>i.status==="Em progresso").length,
    stuck:allItems.filter(i=>i.status==="Travado").length,
    overdue:allItems.filter(i=>i.dueDate&&new Date(i.dueDate)<new Date()&&i.status!=="Concluído").length,
  };
  const barData=[
    {sem:"Sem 1",concluídas:2,em_progresso:3,novas:4},
    {sem:"Sem 2",concluídas:4,em_progresso:2,novas:3},
    {sem:"Sem 3",concluídas:3,em_progresso:4,novas:5},
    {sem:"Sem 4",concluídas:5,em_progresso:3,novas:2},
    {sem:"Sem 5",concluídas:6,em_progresso:2,novas:4},
    {sem:"Sem 6",concluídas:stats.done,em_progresso:stats.prog,novas:stats.total-stats.done-stats.prog},
  ];
  const pieData=STATUS_LIST.map(s=>({name:s,value:allItems.filter(i=>i.status===s).length,color:STATUS_C[s]})).filter(d=>d.value>0);
  const lineData=[
    {mes:"Jan",tarefas:8},{mes:"Fev",tarefas:14},{mes:"Mar",tarefas:22},
    {mes:"Abr",tarefas:19},{mes:"Mai",tarefas:28},{mes:"Jun",tarefas:stats.total},
  ];
  const bg=dark?"#0f172a":"#f8fafc"; const card=dark?"#111827":"#fff";
  const bd=dark?"#1e293b":"#e2e8f0"; const tx=dark?"#e2e8f0":"#1e293b"; const t2=dark?"#64748b":"#94a3b8";
  const KPIS=[
    {label:"Total de Tarefas",val:stats.total,icon:"📋",color:C.primary},
    {label:"Concluídas",val:stats.done,icon:"✅",color:"#10b981"},
    {label:"Em Progresso",val:stats.prog,icon:"⚡",color:"#f59e0b"},
    {label:"Atrasadas",val:stats.overdue,icon:"🚨",color:"#ef4444"},
  ];
  const activity=[
    {who:"Ana",action:"concluiu",item:"Autenticação JWT",time:"5 min"},
    {who:"Luciano",action:"criou",item:"Módulo de validação de AIH",time:"12 min"},
    {who:"Pedro",action:"comentou em",item:"Dashboard financeiro",time:"34 min"},
    {who:"Maria",action:"atualizou",item:"Módulo de relatórios",time:"1h"},
    {who:"Carlos",action:"atribuiu",item:"Integração CNES",time:"2h"},
  ];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {KPIS.map(k=>(
          <div key={k.label} style={{background:card,borderRadius:12,border:`1px solid ${bd}`,
            padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:11,color:t2,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em"}}>{k.label}</span>
              <span style={{fontSize:20}}>{k.icon}</span>
            </div>
            <div style={{fontSize:32,fontWeight:700,color:k.color}}>{k.val}</div>
            {k.label==="Concluídas"&&stats.total>0&&(
              <div style={{marginTop:8}}>
                <div style={{height:4,borderRadius:3,background:dark?"#374151":"#e2e8f0",overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:3,background:"#10b981",
                    width:`${Math.round(stats.done/stats.total*100)}%`,transition:"width .4s"}}/>
                </div>
                <span style={{fontSize:11,color:t2,marginTop:4,display:"block"}}>{Math.round(stats.done/stats.total*100)}% concluído</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:14}}>
        {/* Bar chart */}
        <div style={{background:card,borderRadius:12,border:`1px solid ${bd}`,padding:"18px 16px",boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
          <p style={{fontSize:13,fontWeight:600,color:tx,marginBottom:14}}>Tarefas por semana</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barSize={10} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={dark?"#1f2937":"#f1f5f9"} vertical={false}/>
              <XAxis dataKey="sem" tick={{fontSize:11,fill:t2}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:t2}} axisLine={false} tickLine={false} width={24}/>
              <Tooltip contentStyle={{borderRadius:8,border:`1px solid ${bd}`,fontSize:12,background:card,color:tx}} cursor={false}/>
              <Bar dataKey="concluídas" fill="#10b981" radius={[4,4,0,0]}/>
              <Bar dataKey="em_progresso" fill="#3b82f6" radius={[4,4,0,0]}/>
              <Bar dataKey="novas" fill="#e2e8f0" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:"flex",gap:14,justifyContent:"center",marginTop:8}}>
            {[["#10b981","Concluídas"],["#3b82f6","Em progresso"],["#e2e8f0","Novas"]].map(([c,l])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:t2}}>
                <span style={{width:10,height:10,borderRadius:3,background:c,flexShrink:0}}/>
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Pie chart */}
        <div style={{background:card,borderRadius:12,border:`1px solid ${bd}`,padding:"18px 16px",boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
          <p style={{fontSize:13,fontWeight:600,color:tx,marginBottom:10}}>Distribuição de Status</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} innerRadius={38} outerRadius={60} paddingAngle={2} dataKey="value">
                {pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
              <Tooltip contentStyle={{borderRadius:8,border:`1px solid ${bd}`,fontSize:12,background:card,color:tx}}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:"flex",flexDirection:"column",gap:5,marginTop:4}}>
            {pieData.map(d=>(
              <div key={d.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:11}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:d.color,flexShrink:0}}/>
                  <span style={{color:t2}}>{d.name}</span>
                </div>
                <span style={{fontWeight:600,color:tx}}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Line chart + Activity */}
      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:14}}>
        <div style={{background:card,borderRadius:12,border:`1px solid ${bd}`,padding:"18px 16px",boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
          <p style={{fontSize:13,fontWeight:600,color:tx,marginBottom:14}}>Crescimento de tarefas — 2026</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark?"#1f2937":"#f1f5f9"} vertical={false}/>
              <XAxis dataKey="mes" tick={{fontSize:11,fill:t2}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:t2}} axisLine={false} tickLine={false} width={24}/>
              <Tooltip contentStyle={{borderRadius:8,border:`1px solid ${bd}`,fontSize:12,background:card,color:tx}}/>
              <Line type="monotone" dataKey="tarefas" stroke={C.primary} strokeWidth={2} dot={{fill:C.primary,r:3}} activeDot={{r:5}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Activity feed */}
        <div style={{background:card,borderRadius:12,border:`1px solid ${bd}`,padding:"18px 16px",boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
          <p style={{fontSize:13,fontWeight:600,color:tx,marginBottom:12}}>Atividade Recente</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {activity.map((a,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                <Avatar name={a.who} size={26}/>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:11,color:tx,lineHeight:1.3}}>
                    <b>{a.who}</b> {a.action} <span style={{color:C.primary}}>{a.item}</span>
                  </p>
                </div>
                <span style={{fontSize:10,color:t2,whiteSpace:"nowrap"}}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── MÓDULO 2 — PROJETOS (board) ───────────────────────── */
function ProjectsView({data,setData,dark}){
  const board=data.boards.find(b=>b.id===data.currentBoardId);
  const bd=dark?"#1e293b":"#e2e8f0"; const t2=dark?"#64748b":"#94a3b8";
  const upd=(gid,iid,f,v)=>setData(d=>({...d,boards:d.boards.map(b=>b.id!==d.currentBoardId?b:{...b,groups:b.groups.map(g=>g.id!==gid?g:{...g,items:g.items.map(it=>it.id!==iid?it:{...it,[f]:v})})})}));
  const del=(gid,iid)=>setData(d=>({...d,boards:d.boards.map(b=>b.id!==d.currentBoardId?b:{...b,groups:b.groups.map(g=>g.id!==gid?g:{...g,items:g.items.filter(it=>it.id!==iid)})})}));
  const addItem=(gid,name)=>{if(!name.trim())return;setData(d=>({...d,boards:d.boards.map(b=>b.id!==d.currentBoardId?b:{...b,groups:b.groups.map(g=>g.id!==gid?g:{...g,items:[...g.items,{id:uid(),name:name.trim(),status:"Não iniciado",assignee:"—",dueDate:"",priority:"Média",notes:""}]})})}));};
  const addGroup=(name)=>{if(!name.trim())return;setData(d=>({...d,boards:d.boards.map(b=>b.id!==d.currentBoardId?b:{...b,groups:[...b.groups,{id:uid(),name:name.trim(),color:GRP_CLR[b.groups.length%GRP_CLR.length],open:true,items:[]}]})}));};
  const renameGroup=(gid,name)=>{if(!name.trim())return;setData(d=>({...d,boards:d.boards.map(b=>b.id!==d.currentBoardId?b:{...b,groups:b.groups.map(g=>g.id!==gid?g:{...g,name:name.trim()})})}));};
  const toggleGroup=(gid)=>setData(d=>({...d,boards:d.boards.map(b=>b.id!==d.currentBoardId?b:{...b,groups:b.groups.map(g=>g.id!==gid?g:{...g,open:!g.open})})}));
  const deleteGroup=(gid)=>setData(d=>({...d,boards:d.boards.map(b=>b.id!==d.currentBoardId?b:{...b,groups:b.groups.filter(g=>g.id!==gid)})}));
  const [addGrp,setAddGrp]=useState(false);
  const [newG,setNewG]=useState("");
  const commit=()=>{if(newG.trim())addGroup(newG);setNewG("");setAddGrp(false);};

  if(!board) return <p style={{color:t2,padding:24}}>Selecione um board no menu lateral</p>;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* board picker */}
      <div style={{display:"flex",gap:8}}>
        {data.boards.map(b=>(
          <button key={b.id} onClick={()=>setData(d=>({...d,currentBoardId:b.id}))}
            style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,
              background:b.id===data.currentBoardId?C.primary:"transparent",
              color:b.id===data.currentBoardId?"#fff":t2,transition:"all .15s"}}>
            {b.icon} {b.name}
          </button>
        ))}
      </div>
      {board.groups.map(g=>(
        <Group key={g.id} group={g} upd={upd} del={del} addItem={addItem}
          renameGroup={renameGroup} toggleGroup={toggleGroup} deleteGroup={deleteGroup} dark={dark}/>
      ))}
      {addGrp?(
        <div style={{borderRadius:12,border:"2px solid #a78bfa",background:dark?"#0f172a":"#fff",padding:12}}>
          <input autoFocus value={newG} onChange={e=>setNewG(e.target.value)}
            placeholder="Nome do grupo..." onKeyDown={e=>{if(e.key==="Enter")commit();if(e.key==="Escape"){setAddGrp(false);setNewG("");}}}
            onBlur={commit} style={{width:"100%",fontSize:13,background:"transparent",border:"none",outline:"none",
              fontFamily:"inherit",borderBottom:`2px solid ${bd}`,paddingBottom:3,color:dark?"#e2e8f0":"#1e293b"}}/>
        </div>
      ):(
        <button onClick={()=>setAddGrp(true)}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="#a78bfa";e.currentTarget.style.color="#7c3aed";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=bd;e.currentTarget.style.color=t2;}}
          style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:7,
            padding:"11px 0",fontSize:12,color:t2,background:"none",
            border:`2px dashed ${bd}`,borderRadius:12,cursor:"pointer",transition:"all .15s"}}>
          + Adicionar grupo
        </button>
      )}
    </div>
  );
}

/* ─────────────── MÓDULO 3 — EQUIPE ─────────────────────────────────── */
function TeamView({data,setData,dark}){
  const bg=dark?"#0f172a":"#f8fafc"; const card=dark?"#111827":"#fff";
  const bd=dark?"#1e293b":"#e2e8f0"; const tx=dark?"#e2e8f0":"#1e293b"; const t2=dark?"#64748b":"#94a3b8";
  const roles=["admin","manager","member","viewer"];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <h2 style={{fontSize:16,fontWeight:600,color:tx,marginBottom:4}}>Equipe</h2>
          <p style={{fontSize:12,color:t2}}>{data.users.length} membros · {data.users.filter(u=>u.status==="online").length} online agora</p>
        </div>
        <button style={{padding:"7px 14px",background:C.primary,color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer"}}>
          + Convidar membro
        </button>
      </div>
      {/* Members grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {data.users.map(u=>(
          <div key={u.id} style={{background:card,borderRadius:12,border:`1px solid ${bd}`,padding:16,
            boxShadow:"0 1px 4px rgba(0,0,0,.05)",display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{position:"relative"}}>
                  <Avatar name={u.av} size={44}/>
                  <div style={{position:"absolute",bottom:0,right:0,width:12,height:12,borderRadius:"50%",
                    background:u.status==="online"?"#10b981":"#94a3b8",border:"2px solid "+card}}/>
                </div>
                <div>
                  <p style={{fontSize:13,fontWeight:600,color:tx}}>{u.name}</p>
                  <p style={{fontSize:11,color:t2}}>{u.email}</p>
                </div>
              </div>
              <Dd right trigger={tog=><button onClick={tog} style={{background:"none",border:"none",cursor:"pointer",color:t2,fontSize:15}}>···</button>}>
                {close=>(<>
                  {roles.map(r=>(
                    <DdItem key={r} onClick={()=>{setData(d=>({...d,users:d.users.map(uu=>uu.id!==u.id?uu:{...uu,role:r})}));close();}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:ROLE_CLR[r]}}/>
                      {ROLE_LBL[r]}{r===u.role&&<span style={{marginLeft:"auto",fontSize:10,color:C.primary}}>✓</span>}
                    </DdItem>
                  ))}
                  <div style={{borderTop:"1px solid #f1f5f9",margin:"2px 0"}}/>
                  <DdItem danger onClick={close}>🗑 Remover</DdItem>
                </>)}
              </Dd>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:6,
                background:`${ROLE_CLR[u.role]}18`,color:ROLE_CLR[u.role]}}>
                {ROLE_LBL[u.role]}
              </span>
              <span style={{fontSize:11,color:t2}}>{u.tasks} tarefas</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── MÓDULO 4 — AUTOMAÇÕES ─────────────────────────────── */
function AutomationsView({data,setData,dark}){
  const card=dark?"#111827":"#fff"; const bd=dark?"#1e293b":"#e2e8f0";
  const tx=dark?"#e2e8f0":"#1e293b"; const t2=dark?"#64748b":"#94a3b8";
  const cats=[...new Set(data.automations.map(a=>a.cat))];
  const activeCount=data.automations.filter(a=>a.active).length;
  const toggle=(id)=>setData(d=>({...d,automations:d.automations.map(a=>a.id!==id?a:{...a,active:!a.active})}));
  const CAT_CLR={Notificação:"#ef4444",Movimento:"#3b82f6",Atribuição:"#7c3aed",Sincronização:"#10b981",Agendamento:"#f59e0b",Relatório:"#ec4899"};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <h2 style={{fontSize:16,fontWeight:600,color:tx,marginBottom:4}}>Automações</h2>
          <p style={{fontSize:12,color:t2}}>{activeCount} de {data.automations.length} automações ativas — zero código necessário</p>
        </div>
        <button style={{padding:"7px 14px",background:C.primary,color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer"}}>
          + Criar automação
        </button>
      </div>
      {/* stats strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {cats.map(cat=>{
          const count=data.automations.filter(a=>a.cat===cat).length;
          const active=data.automations.filter(a=>a.cat===cat&&a.active).length;
          return(
            <div key={cat} style={{background:card,borderRadius:10,border:`1px solid ${bd}`,padding:"12px 14px"}}>
              <p style={{fontSize:10,fontWeight:600,color:CAT_CLR[cat]||t2,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>{cat}</p>
              <p style={{fontSize:20,fontWeight:700,color:tx}}>{active}<span style={{fontSize:12,color:t2,fontWeight:400}}>/{count}</span></p>
            </div>
          );
        })}
      </div>
      {/* template cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {data.automations.map(a=>(
          <div key={a.id} style={{background:card,borderRadius:12,border:`1px solid ${a.active?(CAT_CLR[a.cat]||C.primary)+"44":bd}`,
            padding:"14px 16px",boxShadow:"0 1px 4px rgba(0,0,0,.05)",
            transition:"border-color .2s",display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:22}}>{a.icon}</span>
                <div>
                  <p style={{fontSize:12,fontWeight:600,color:tx,lineHeight:1.3}}>{a.name}</p>
                  <span style={{fontSize:10,padding:"2px 7px",borderRadius:5,
                    background:`${CAT_CLR[a.cat]||C.primary}18`,color:CAT_CLR[a.cat]||C.primary,fontWeight:600}}>
                    {a.cat}
                  </span>
                </div>
              </div>
              <Toggle on={a.active} onChange={()=>toggle(a.id)}/>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              <div style={{fontSize:11,background:dark?"#1e293b":"#f1f5f9",borderRadius:6,padding:"3px 8px",color:t2}}>
                SE: {a.trigger}
              </div>
              <span style={{color:t2,fontSize:14}}>→</span>
              <div style={{fontSize:11,background:dark?"#1e293b":"#f1f5f9",borderRadius:6,padding:"3px 8px",color:t2}}>
                ENTÃO: {a.action}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── MÓDULO 5 — TIMELINE (Gantt SVG) ───────────────────── */
function TimelineView({data,dark}){
  const card=dark?"#111827":"#fff"; const bd=dark?"#1e293b":"#e2e8f0";
  const tx=dark?"#e2e8f0":"#1e293b"; const t2=dark?"#64748b":"#94a3b8";
  const today=new Date("2026-05-01");
  const rangeStart=new Date("2026-03-01");
  const rangeEnd=new Date("2027-01-01");
  const totalDays=(rangeEnd-rangeStart)/(1000*60*60*24);
  const W=680; const LEFT=140; const CHART_W=W-LEFT;
  // generate months
  const months=[];
  let cur=new Date(rangeStart.getFullYear(),rangeStart.getMonth(),1);
  while(cur<rangeEnd){
    months.push({date:new Date(cur),label:cur.toLocaleDateString("pt-BR",{month:"short",year:"2-digit"})});
    cur.setMonth(cur.getMonth()+1);
  }
  const dayToX=(dateStr)=>{
    const d=new Date(dateStr);
    const days=(d-rangeStart)/(1000*60*60*24);
    return LEFT+Math.max(0,Math.min(CHART_W,(days/totalDays)*CHART_W));
  };
  const todayX=LEFT+((today-rangeStart)/(1000*60*60*24)/totalDays)*CHART_W;
  const ROW_H=42; const HDR_H=32;
  const svgH=HDR_H+data.timeline.length*ROW_H+12;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <h2 style={{fontSize:16,fontWeight:600,color:tx,marginBottom:4}}>Timeline</h2>
          <p style={{fontSize:12,color:t2}}>{data.timeline.length} projetos — visão {new Date("2026-03-01").toLocaleDateString("pt-BR",{month:"long"})} a {new Date("2026-12-01").toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}</p>
        </div>
        <button style={{padding:"7px 14px",background:C.primary,color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer"}}>
          + Novo projeto
        </button>
      </div>
      <div style={{background:card,borderRadius:12,border:`1px solid ${bd}`,overflow:"auto",boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
        <svg width={W} height={svgH} style={{display:"block"}}>
          {/* Month grid lines & labels */}
          {months.map((m,i)=>{
            const x=dayToX(m.date.toISOString().slice(0,10));
            return(
              <g key={i}>
                <line x1={x} y1={HDR_H} x2={x} y2={svgH} stroke={dark?"#1f2937":"#f1f5f9"} strokeWidth={1}/>
                <text x={x+4} y={20} fill={t2} fontSize={10}>{m.label}</text>
              </g>
            );
          })}
          {/* Today line */}
          <line x1={todayX} y1={0} x2={todayX} y2={svgH} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4,3"/>
          <text x={todayX+3} y={12} fill="#ef4444" fontSize={9} fontWeight={600}>hoje</text>

          {/* Header bg */}
          <rect x={0} y={0} width={W} height={HDR_H} fill={dark?"#0f172a":"#f8fafc"}/>
          <rect x={0} y={0} width={LEFT} height={svgH} fill={dark?"#0f172a":"#f8fafc"}/>
          <line x1={LEFT} y1={0} x2={LEFT} y2={svgH} stroke={dark?"#1f2937":"#e2e8f0"} strokeWidth={1}/>
          <text x={10} y={22} fill={t2} fontSize={10} fontWeight={600}>PROJETO</text>

          {/* Rows */}
          {data.timeline.map((proj,i)=>{
            const y=HDR_H+i*ROW_H;
            const x1=dayToX(proj.start); const x2=dayToX(proj.end);
            const barW=Math.max(6,x2-x1);
            return(
              <g key={proj.id}>
                <rect x={0} y={y} width={W} height={ROW_H} fill={i%2===0?(dark?"#0d1b2a":"#fff"):(dark?"#0f172a":"#f8fafc")}/>
                {/* Project name */}
                <text x={10} y={y+ROW_H/2+5} fill={tx} fontSize={11} fontWeight={500}>{proj.name.slice(0,18)}</text>
                {/* Gantt bar */}
                <rect x={x1} y={y+8} width={barW} height={ROW_H-18} rx={5} fill={proj.status==="Concluído"?"#10b981":proj.color} opacity={proj.status==="Não iniciado"?0.45:0.85}/>
                {/* Owner */}
                {barW>30&&(
                  <text x={x1+6} y={y+ROW_H/2+5} fill="#fff" fontSize={9} fontWeight={600}>{proj.owner.slice(0,8)}</text>
                )}
                {/* Row separator */}
                <line x1={0} y1={y+ROW_H} x2={W} y2={y+ROW_H} stroke={dark?"#1f2937":"#f1f5f9"} strokeWidth={1}/>
              </g>
            );
          })}
        </svg>
        {/* Legend */}
        <div style={{display:"flex",gap:14,padding:"12px 16px",borderTop:`1px solid ${bd}`,flexWrap:"wrap"}}>
          {[["#10b981","Concluído"],["#3b82f6","Em progresso"],["#94a3b8","Não iniciado (transparente)"],["#ef4444","Hoje (linha)"]].map(([c,l])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:t2}}>
              <span style={{width:14,height:8,borderRadius:3,background:c,flexShrink:0}}/>
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── MÓDULO 6 — CONFIGURAÇÕES ───────────────────────────── */
function SettingsView({data,setData,dark}){
  const [tab,setTab]=useState("users");
  const card=dark?"#111827":"#fff"; const bd=dark?"#1e293b":"#e2e8f0";
  const tx=dark?"#e2e8f0":"#1e293b"; const t2=dark?"#64748b":"#94a3b8";
  const PERMISSIONS=[
    {feat:"Criar projetos e boards",admin:true,manager:true,member:false,viewer:false},
    {feat:"Editar tarefas",admin:true,manager:true,member:true,viewer:false},
    {feat:"Excluir tarefas",admin:true,manager:true,member:false,viewer:false},
    {feat:"Gerenciar usuários",admin:true,manager:false,member:false,viewer:false},
    {feat:"Configurar automações",admin:true,manager:true,member:false,viewer:false},
    {feat:"Ver dashboards",admin:true,manager:true,member:true,viewer:true},
    {feat:"Exportar relatórios",admin:true,manager:true,member:false,viewer:false},
    {feat:"Gerenciar integrações",admin:true,manager:false,member:false,viewer:false},
    {feat:"Alterar configurações",admin:true,manager:false,member:false,viewer:false},
  ];
  const TABS=[{id:"users",l:"Usuários"},{id:"roles",l:"Perfis de Acesso"},{id:"workspace",l:"Workspace"}];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <div>
        <h2 style={{fontSize:16,fontWeight:600,color:tx,marginBottom:4}}>Configurações</h2>
        <p style={{fontSize:12,color:t2}}>Gerencie usuários, permissões e preferências do workspace.</p>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",gap:0,border:`1px solid ${bd}`,borderRadius:10,overflow:"hidden",alignSelf:"flex-start"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:"8px 18px",fontSize:12,fontWeight:500,border:"none",cursor:"pointer",
              background:tab===t.id?C.primary:(dark?"#1e293b":"#f8fafc"),
              color:tab===t.id?"#fff":t2,transition:"all .15s"}}>
            {t.l}
          </button>
        ))}
      </div>

      {tab==="users"&&(
        <div style={{background:card,borderRadius:12,border:`1px solid ${bd}`,overflow:"hidden"}}>
          {/* header */}
          <div style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 1fr 80px",padding:"10px 16px",
            background:dark?"#111827":"#f8fafc",borderBottom:`1px solid ${bd}`,
            fontSize:10,fontWeight:600,color:t2,textTransform:"uppercase",letterSpacing:".06em",gap:10}}>
            <span>Nome</span><span>E-mail</span><span>Perfil</span><span>Status</span><span>Ações</span>
          </div>
          {data.users.map(u=>(
            <div key={u.id} style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 1fr 80px",
              padding:"12px 16px",borderBottom:`1px solid ${bd}`,
              alignItems:"center",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <Avatar name={u.av} size={30}/>
                <span style={{fontSize:12,fontWeight:500,color:tx}}>{u.name}</span>
              </div>
              <span style={{fontSize:12,color:t2}}>{u.email}</span>
              <Dd trigger={tog=>(
                <button onClick={tog} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 8px",
                  borderRadius:6,border:`1px solid ${ROLE_CLR[u.role]}44`,
                  background:`${ROLE_CLR[u.role]}12`,color:ROLE_CLR[u.role],
                  fontSize:11,fontWeight:600,cursor:"pointer"}}>
                  {ROLE_LBL[u.role]} ▾
                </button>
              )}>
                {close=>(["admin","manager","member","viewer"].map(r=>(
                  <DdItem key={r} onClick={()=>{setData(d=>({...d,users:d.users.map(uu=>uu.id!==u.id?uu:{...uu,role:r})}));close();}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:ROLE_CLR[r]}}/>
                    {ROLE_LBL[r]}{r===u.role&&<span style={{marginLeft:"auto",fontSize:10,color:C.primary}}>✓</span>}
                  </DdItem>
                )))}
              </Dd>
              <span style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:u.status==="online"?"#10b981":t2}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:u.status==="online"?"#10b981":"#94a3b8"}}/>
                {u.status==="online"?"Online":"Offline"}
              </span>
              <DdItem danger onClick={()=>{}}>🗑 Remover</DdItem>
            </div>
          ))}
        </div>
      )}

      {tab==="roles"&&(
        <div style={{background:card,borderRadius:12,border:`1px solid ${bd}`,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:dark?"#111827":"#f8fafc",borderBottom:`1px solid ${bd}`}}>
                <th style={{padding:"10px 16px",fontSize:11,color:t2,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",textAlign:"left",width:"45%"}}>Funcionalidade</th>
                {["Admin","Gerente","Membro","Visualizador"].map(r=>(
                  <th key={r} style={{padding:"10px 12px",fontSize:11,color:ROLE_CLR[r.toLowerCase().replace("ger","manager").replace("mem","member").replace("vis","viewer").replace("adm","admin")]||t2,
                    fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",textAlign:"center"}}>
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((perm,i)=>(
                <tr key={perm.feat} style={{borderBottom:`1px solid ${bd}`,background:i%2===0?"transparent":(dark?"#0f172a":"#f8fafc")}}>
                  <td style={{padding:"11px 16px",fontSize:12,color:tx}}>{perm.feat}</td>
                  {["admin","manager","member","viewer"].map(r=>(
                    <td key={r} style={{padding:"11px 12px",textAlign:"center",fontSize:15}}>
                      {perm[r]?(
                        <span style={{color:"#10b981"}}>✓</span>
                      ):(
                        <span style={{color:"#ef4444",fontSize:13}}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==="workspace"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {[
            {label:"Nome do Workspace",val:"Inteligência em Saúde",type:"text"},
            {label:"URL do Workspace",val:"inteligenciaemsaude",type:"text"},
            {label:"E-mail de suporte",val:"suporte@inteligenciaemsaude.com",type:"email"},
            {label:"Fuso horário",val:"America/Sao_Paulo (UTC-3)",type:"select"},
          ].map(f=>(
            <div key={f.label} style={{background:card,borderRadius:10,border:`1px solid ${bd}`,padding:"14px 16px"}}>
              <label style={{display:"block",fontSize:11,fontWeight:600,color:t2,marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>{f.label}</label>
              <input defaultValue={f.val} style={{width:"100%",fontSize:13,background:"transparent",border:"none",outline:"none",
                color:tx,fontFamily:"inherit",borderBottom:`1px solid ${bd}`,paddingBottom:4}}/>
            </div>
          ))}
          <button style={{padding:"9px 20px",background:C.primary,color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",alignSelf:"flex-start"}}>
            Salvar configurações
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────── LOGIN SCREEN ───────────────────────────────────────── */
function LoginScreen({onLogin}){
  const [email,setEmail]=useState("thiago@inteligenciaemsaude.com");
  const [pass,setPass]=useState("admin123");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const handle=()=>{
    setLoading(true);setErr("");
    setTimeout(()=>{
      if(email&&pass){ onLogin({name:"Thiago Freitas",email,role:"admin",av:"TF"}); }
      else{ setErr("Preencha e-mail e senha."); setLoading(false); }
    },600);
  };
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",
      minHeight:"100vh",background:"linear-gradient(135deg,#0D47A1 0%,#1877F2 50%,#42A5F5 100%)"}}>
      <div style={{background:"#fff",borderRadius:20,padding:"40px 36px",width:380,
        boxShadow:"0 24px 64px rgba(0,0,0,.18)"}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:52,height:52,borderRadius:16,background:"linear-gradient(135deg,#0D47A1,#1877F2)",
            display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",
            boxShadow:"0 4px 14px rgba(24,119,242,.35)"}}>
            <span style={{fontSize:26}}>🏥</span>
          </div>
          <h1 style={{fontSize:18,fontWeight:700,color:"#1e293b",marginBottom:4}}>Inteligência em Saúde</h1>
          <p style={{fontSize:12,color:"#64748b"}}>Plataforma de Gestão Interna</p>
        </div>
        {/* Fields */}
        {[{label:"E-mail",val:email,set:setEmail,type:"email"},{label:"Senha",val:pass,set:setPass,type:"password"}].map(f=>(
          <div key={f.label} style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:11,fontWeight:600,color:"#374151",marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>{f.label}</label>
            <input value={f.val} onChange={e=>f.set(e.target.value)} type={f.type}
              onKeyDown={e=>e.key==="Enter"&&handle()}
              style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1px solid #e2e8f0",
                fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box",
                background:"#f8fafc",color:"#1e293b"}}/>
          </div>
        ))}
        {err&&<p style={{fontSize:12,color:"#ef4444",marginBottom:10,textAlign:"center"}}>{err}</p>}
        <button onClick={handle} disabled={loading}
          style={{width:"100%",padding:"11px",background:"#1877F2",color:"#fff",border:"none",
            borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer",marginTop:4,
            opacity:loading?.7:1,boxShadow:"0 2px 8px rgba(24,119,242,.3)"}}>
          {loading?"Entrando...":"Entrar"}
        </button>
        <p style={{textAlign:"center",fontSize:12,color:"#94a3b8",marginTop:16}}>
          Demo: qualquer e-mail + senha funcionam
        </p>
      </div>
    </div>
  );
}

/* ─────────────── SIDEBAR ITEMS ─────────────────────────────────────── */
const NAV=[
  {id:"dashboard",icon:"📊",label:"Dashboard"},
  {id:"projects",  icon:"📋",label:"Projetos"},
  {id:"team",      icon:"👥",label:"Equipe"},
  {id:"automations",icon:"⚡",label:"Automações"},
  {id:"timeline",  icon:"📅",label:"Timeline"},
  {id:"settings",  icon:"⚙️",label:"Configurações"},
];

/* ─────────────── MAIN APP ───────────────────────────────────────────── */
export default function App(){
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    async function load(){
      try{
        const r=await window.storage.get("is-platform-v1");
        setData(r?JSON.parse(r.value):INIT);
      }catch{ setData(INIT); }
      setLoading(false);
    }
    load();
  },[]);

  useEffect(()=>{
    if(!data||loading)return;
    const t=setTimeout(()=>window.storage.set("is-platform-v1",JSON.stringify(data)).catch(()=>{}),700);
    return()=>clearTimeout(t);
  },[data,loading]);

  if(loading) return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#f8fafc"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:36,height:36,borderRadius:"50%",border:"3px solid #1877F2",
          borderTopColor:"transparent",animation:"spin .8s linear infinite",margin:"0 auto 10px"}}/>
        <p style={{color:"#64748b",fontSize:12}}>Carregando plataforma...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if(!data?.currentUser) return(<LoginScreen onLogin={user=>setData(d=>({...d,currentUser:user}))}/>);

  const dark=data.dark;
  const bg      = dark?"#0f172a":"#f8fafc";
  const sideBg  = dark?"#0d1117":"#fff";
  const hdBg    = dark?"#0d1117":"#fff";
  const bd      = dark?"#1e293b":"#e2e8f0";
  const tx      = dark?"#e2e8f0":"#1e293b";
  const t2      = dark?"#64748b":"#94a3b8";
  const module  = data.activeModule||"dashboard";
  const setModule= m=>setData(d=>({...d,activeModule:m}));
  const [sideOpen,setSideOpen]=useState(true);

  return(
    <div style={{display:"flex",height:"100vh",fontFamily:"system-ui,sans-serif",background:bg,color:tx,overflow:"hidden"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}input[type=date]::-webkit-calendar-picker-indicator{opacity:.5;cursor:pointer}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${dark?"#334155":"#cbd5e1"};border-radius:3px}`}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{width:sideOpen?220:54,flexShrink:0,display:"flex",flexDirection:"column",
        borderRight:`1px solid ${bd}`,background:sideBg,transition:"width .2s",overflow:"hidden"}}>

        {/* logo */}
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"14px 10px",
          justifyContent:sideOpen?"flex-start":"center"}}>
          <div style={{width:30,height:30,borderRadius:9,flexShrink:0,
            background:"linear-gradient(135deg,#0D47A1,#1877F2)",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:15}}>🏥</span>
          </div>
          {sideOpen&&<div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:12,fontWeight:700,color:tx,lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Inteligência em Saúde</p>
            <p style={{fontSize:9,color:t2,lineHeight:1}}>Plataforma Interna</p>
          </div>}
          {sideOpen&&<button onClick={()=>setSideOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:t2,fontSize:15,lineHeight:1}}>‹</button>}
        </div>
        {!sideOpen&&<button onClick={()=>setSideOpen(true)} style={{background:"none",border:"none",cursor:"pointer",color:t2,fontSize:16,padding:"5px 0",textAlign:"center"}}>☰</button>}

        {/* nav */}
        <div style={{flex:1,overflowY:"auto",padding:"8px 6px"}}>
          {NAV.map(n=>{
            const active=module===n.id;
            return(
              <button key={n.id} onClick={()=>setModule(n.id)}
                style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 9px",
                  borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:active?600:400,
                  background:active?`${C.primary}18`:"none",
                  color:active?C.primary:t2,transition:"all .15s",
                  marginBottom:2,justifyContent:sideOpen?"flex-start":"center"}}
                onMouseEnter={e=>{ if(!active){e.currentTarget.style.background=dark?"#1e293b":"#f8fafc";e.currentTarget.style.color=tx;}}}
                onMouseLeave={e=>{ if(!active){e.currentTarget.style.background="none";e.currentTarget.style.color=t2;}}}>
                <span style={{fontSize:15,flexShrink:0}}>{n.icon}</span>
                {sideOpen&&<span>{n.label}</span>}
                {sideOpen&&active&&<div style={{marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:C.primary}}/>}
              </button>
            );
          })}
        </div>

        {/* user + dark */}
        <div style={{borderTop:`1px solid ${bd}`,padding:"10px 8px",display:"flex",flexDirection:"column",gap:4}}>
          {sideOpen&&data.currentUser&&(
            <div style={{display:"flex",alignItems:"center",gap:7,padding:"6px 4px"}}>
              <Avatar name={data.currentUser.av||data.currentUser.name} size={28}/>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:11,fontWeight:600,color:tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{data.currentUser.name}</p>
                <p style={{fontSize:9,color:ROLE_CLR[data.currentUser.role]||t2,fontWeight:600}}>
                  {ROLE_LBL[data.currentUser.role]||data.currentUser.role}
                </p>
              </div>
            </div>
          )}
          <button onClick={()=>setData(d=>({...d,dark:!d.dark}))}
            style={{display:"flex",alignItems:"center",gap:7,background:"none",border:"none",cursor:"pointer",
              color:t2,fontSize:12,padding:"5px 4px",borderRadius:6,width:"100%",
              justifyContent:sideOpen?"flex-start":"center"}}>
            <span style={{fontSize:14}}>{dark?"☀️":"🌙"}</span>
            {sideOpen&&<span>{dark?"Modo claro":"Modo escuro"}</span>}
          </button>
          {sideOpen&&(
            <button onClick={()=>setData(d=>({...d,currentUser:null}))}
              style={{display:"flex",alignItems:"center",gap:7,background:"none",border:"none",cursor:"pointer",
                color:"#ef4444",fontSize:12,padding:"5px 4px",borderRadius:6,width:"100%"}}>
              <span style={{fontSize:14}}>🚪</span> Sair
            </button>
          )}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* header */}
        <header style={{borderBottom:`1px solid ${bd}`,background:hdBg,padding:"11px 20px",flexShrink:0,
          display:"flex",alignItems:"center",gap:10}}>
          <div>
            <h2 style={{fontSize:15,fontWeight:700,color:tx}}>{NAV.find(n=>n.id===module)?.icon} {NAV.find(n=>n.id===module)?.label}</h2>
            <p style={{fontSize:11,color:t2}}>Inteligência em Saúde · Workspace interno</p>
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
            <div style={{display:"flex",background:dark?"#1e293b":"#f1f5f9",
              borderRadius:8,padding:"6px 10px",gap:6,alignItems:"center"}}>
              <span style={{fontSize:13}}>🔍</span>
              <input placeholder="Buscar..." style={{fontSize:11,background:"transparent",border:"none",outline:"none",color:tx,width:110}}/>
            </div>
            <button style={{padding:"6px 12px",background:C.primary,color:"#fff",border:"none",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer"}}>
              🔔
            </button>
          </div>
        </header>

        {/* content */}
        <main style={{flex:1,overflowY:"auto",padding:18,background:bg}}>
          {module==="dashboard"   && <DashboardView data={data} dark={dark}/>}
          {module==="projects"    && <ProjectsView  data={data} setData={setData} dark={dark}/>}
          {module==="team"        && <TeamView       data={data} setData={setData} dark={dark}/>}
          {module==="automations" && <AutomationsView data={data} setData={setData} dark={dark}/>}
          {module==="timeline"    && <TimelineView   data={data} dark={dark}/>}
          {module==="settings"    && <SettingsView   data={data} setData={setData} dark={dark}/>}
        </main>
      </div>
    </div>
  );
}
