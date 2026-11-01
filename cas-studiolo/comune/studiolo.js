(function(){
  "use strict";
  // ogni pagina dichiara sul tag <html> la propria rubrica e la strada verso la radice:
  // data-rubrica="t2" data-base="../" per una rubrica; nessuna rubrica e data-base="./" per l'ingresso
  const ROOT = document.documentElement;
  const BASE = ROOT.dataset.base || "./";
  const RUB = ROOT.dataset.rubrica || "";
  const CFG_URL = BASE + "data/CAS-config-v0.1.json";
  const app = document.getElementById("app");
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const nf = (v, d) => v.toLocaleString("it-IT", {minimumFractionDigits:d, maximumFractionDigits:d});
  // gli ID degli elementi portano il tema: la stessa osservazione può comparire in più rubriche
  const slug = (id, tid) => tid + "-o-" + id.toLowerCase().replace(/_/g, "-");
  const IN_FRAME = window.parent !== window;
  const FRAME_ID = "cas-studiolo"; // prefisso dei messaggi verso la pagina che incorpora

  const STATUS = { reported:"Registrato", attributed:"Dichiarato", derived:"Derivato", disputed:"Contestato", missing:"Mancante", unverified:"Non verificato" };
  const REVIEW = {
    verified_primary:"fonte primaria", verified_secondary:"fonte secondaria", verified_official_web:"pagina ufficiale",
    verified_attribution:"dichiarazione verificata sul testo", verified_attribution_not_actual_stoppage:"dichiarazione, non fermata avvenuta",
    verified_attribution_primary_union_communique:"dichiarazione verificata sul comunicato", derived_assumption_explicit:"ipotesi dichiarata",
    pending:"da verificare", pending_direct_source_check:"fonte diretta da verificare", disputed:"contestato", missing:""
  };
  const ENTITY = {
    Aosta_site:"Stabilimento di Aosta", Aosta_site_selected_departments:"Alcuni reparti di Aosta", CAS_SpA:"Cogne S.p.A.",
    CAS_SpA_parent:"Cogne S.p.A., bilancio separato", group_consolidated:"Gruppo, consolidato", CAS_SpA_and_group_ambiguous:"Società o gruppo: non specificato",
    Aosta_site_vs_group:"Aosta rispetto al gruppo", sector:"Settore", group_entities:"Società del gruppo", group:"Gruppo",
    CAS_SpA_or_site_unspecified:"Società o sito: non specificato", CAS_SpA_and_group:"Società e gruppo",
    CAS_SpA_parent_and_group:"Società e gruppo", group_and_parent:"Gruppo e società", Walsin_group:"Gruppo Walsin (capogruppo)", Walsin_group_Europe:"Gruppo Walsin, Europa"
  };
  const UNIT = { EUR_million:"mln €", persons:"persone", percent:"%", percent_approx:"% circa", tonne:"t", days:"giorni", EUR:"€" };
  const STYPE = {
    official_primary_financial_statements:"Bilancio ufficiale", official_listed_parent_filing:"Documento ufficiale della capogruppo",
    official_company_press_release:"Comunicato della società", official_company_page:"Pagina della società", official_investor_page:"Pagina investitori",
    journalism:"Articolo", journalism_union_claim:"Articolo su dichiarazioni sindacali", journalism_citing_filing:"Articolo che cita un documento",
    management_interview:"Intervista a un dirigente", interview:"Intervista", union_communique:"Comunicato sindacale", trade_press:"Stampa di settore", aggregator:"Aggregatore di dati"
  };

  let D, M = {}, C, OBS = {}, SRC = {}, CONF = {}, REVS = {};
  const errors = [];

  function fetchJSON(u){ return fetch(u).then(r => { if(!r.ok) throw new Error(u + ": HTTP " + r.status); return r.json(); }); }

  // raccoglie gli ID di osservazione citati in un oggetto, escluse le chiavi indicate
  function idsIn(obj, skip){
    const out = new Set();
    (function walk(x, key){
      if (skip && skip.includes(key)) return;
      if (typeof x === "string"){ if (OBS[x]) out.add(x); return; }
      if (Array.isArray(x)) x.forEach(v => walk(v));
      else if (x && typeof x === "object") Object.entries(x).forEach(([k,v]) => walk(v, k));
    })(obj);
    return out;
  }
  function ignoredBy(model){
    const m = new Map();
    (model.osservazioni_ignorate || []).forEach(o => m.set(o.id, o.motivo));
    return m;
  }

  function validate(){
    const a = C.attesi;
    if (D.dataset_id !== a.dataset_id) errors.push(`Dataset atteso ${a.dataset_id}, trovato ${D.dataset_id}.`);
    for (const k of ["geep","claude"]){
      const m = M[k], e = a.modelli[k];
      if (!m) { errors.push(`Output del modello ${k} mancante.`); continue; }
      if (m.model !== e.model) errors.push(`Modello ${k}: atteso ${e.model}, trovato ${m.model}.`);
      if (m.dataset_id !== e.dataset_id) errors.push(`Modello ${k}: riferito a ${m.dataset_id}, atteso ${e.dataset_id}.`);
    }
    let n = 0;
    C.temi.forEach(t => {
      t.gruppi.forEach(g => {
        (g.osservazioni || []).forEach(id => { n++; if (!OBS[id]) errors.push(`Tema ${t.id}: osservazione ${id} assente dal dataset.`); });
        if (g.conflitto && !CONF[g.conflitto]) errors.push(`Tema ${t.id}: conflitto ${g.conflitto} assente.`);
        if (g.chiarirebbe && !OBS[g.chiarirebbe]) errors.push(`Tema ${t.id}: osservazione ${g.chiarirebbe} assente.`);
        if (g.revisione){
          const r = REVS[g.revisione];
          if (!r) errors.push(`Tema ${t.id}: revisione ${g.revisione} assente.`);
          else [...[].concat(r.previsione_originaria||[]), r.revisione].forEach(id => { if (!OBS[id]) errors.push(`Revisione ${r.id}: osservazione ${id} assente.`); });
        }
      });
      for (const k of ["geep","claude"]){
        const col = (t.colonne||{})[k];
        if (!col) { errors.push(`Tema ${t.id}: colonna ${k} non configurata.`); continue; }
        const qs = k === "geep" ? M.geep.risposte_protocollo : M.claude.risposte_al_protocollo;
        if (col.domanda && !(qs||{})[col.domanda]) errors.push(`Tema ${t.id}: risposta ${col.domanda} assente nella lettura ${k}.`);
      }
    });
    // ID citati dai modelli che non esistono nel dataset
    for (const k of ["geep","claude"]){
      const txt = JSON.stringify(M[k] || {});
      (txt.match(/"[A-Z][A-Z0-9_]{3,}"/g) || []).map(s => s.slice(1,-1))
        .filter(s => /_/.test(s) && !OBS[s] && !/^(FR\d|C\d|H\d|Q\d)/.test(s))
        .forEach(s => errors.push(`Modello ${k}: cita ${s}, assente dal dataset.`));
    }
    return n;
  }

  /* ---------- rendering dei fatti ---------- */
  function fmtValue(o){
    const v = o.value, u = UNIT[o.unit] || "";
    if (v === null || v === undefined) return `<span class="val mono">null</span> <span class="muted small">dato non disponibile, non zero</span>`;
    if (typeof v === "number") return `<span class="val mono">${nf(v, Number.isInteger(v)?0:(Math.abs(v)<100?2:1))}${u ? " " + esc(u) : ""}</span>`;
    if (typeof v === "object") {
      return `<dl class="kv">${Object.entries(v).map(([k,x]) => `<dt>${esc(k.replace(/_/g," "))}</dt><dd class="mono">${typeof x==="number"?nf(x,Math.abs(x)<100?1:0):esc(x)}${typeof x==="number"&&u?" "+esc(u):""}</dd>`).join("")}</dl>`;
    }
    const tr = (C.traduzioni || {})[o.id];
    if (tr) return `<p class="val">${esc(tr)}</p><p class="small muted">Testo originale nel dataset: <span lang="en">«${esc(v)}»</span></p>`;
    return `<p class="val">${esc(v)}</p>`;
  }
  function pagesFor(o, sid){
    const p = o.pdf_page;
    if (p == null) return "";
    if (typeof p === "number") return String(p);
    if (Array.isArray(p)) return p.join(", ");
    if (typeof p === "object" && p[sid]) return [].concat(p[sid]).join(", ");
    return "";
  }
  function provesText(o){
    const s = o.status;
    if (s === "reported") return "Che il dato è scritto in questo documento.";
    if (s === "attributed") return "Che la parte indicata lo ha dichiarato.";
    if (s === "derived") return "Il risultato del calcolo, se l'ipotesi regge.";
    if (s === "disputed") return "Che una parte lo sostiene; un'altra fonte dice diversamente.";
    if (s === "missing") return "Niente: nessuna fonte riporta il dato.";
    return "";
  }
  function usageLine(id){
    const parts = [];
    for (const k of ["geep","claude"]){
      const m = M[k]; if (!m) continue;
      const nome = C.nomi_letture[k].breve || C.nomi_letture[k].nome;
      const ign = ignoredBy(m);
      if (ign.has(id)) parts.push(`${nome}: non usata (${esc(ign.get(id))})`);
      else if (idsIn(m, ["osservazioni_ignorate"]).has(id)) parts.push(`${nome}: citata`);
      else parts.push(`${nome}: non citata`);
    }
    return parts.join(" · ");
  }
  function card(id, t){
    const o = OBS[id]; if (!o) return `<div class="card"><p>Osservazione ${esc(id)} assente.</p></div>`;
    const lab = (t.etichette && t.etichette[id]) || id;
    const st = o.status || "reported";
    const rev = REVIEW[o.review] || "";
    const srcs = (o.source_ids || []);
    return `<article class="card ${st==="missing"?"missing":""}" id="${slug(id, t.id)}" data-obs="${esc(id)}">
      <div class="top"><h4>${esc(lab)}</h4><span class="st ${esc(st)}">${esc(STATUS[st]||st)}</span></div>
      ${fmtValue(o)}
      <div class="meta"><span>${esc(o.period||"")}</span><span>${esc(ENTITY[o.entity]||o.entity||"")}</span>${rev?`<span>${esc(rev)}</span>`:""}</div>
      ${o.note?`<p class="avv">${esc(o.note)}</p>`:""}
      ${srcs.length?`<div class="fonti-btn">${srcs.map(s => `<button type="button" class="fbtn" aria-expanded="false" data-src="${esc(s)}" data-obs="${esc(id)}">${esc(s)} · ${esc((SRC[s]||{}).publisher||"fonte")}</button>`).join("")}</div><div class="fslot" hidden></div>`:""}
      <p class="uso">${usageLine(id)}</p>
      <span class="id">${esc(id)}</span>
    </article>`;
  }
  function sourceDetail(sid, oid){
    const s = SRC[sid] || {}, o = OBS[oid] || {};
    const pg = pagesFor(o, sid);
    const notProve = o.note || (o.status === "attributed" ? "Che l'affermazione sia vera, o la sua causa." : "Ciò che il documento non dice.");
    return `<div class="fdet">
      <span><b>${esc(s.publisher||sid)}</b>${s.date?` · ${esc(s.date)}`:""} · ${esc(STYPE[s.type]||s.type||"")}</span>
      ${s.title?`<span>${esc(s.title)}</span>`:""}
      ${s.intervistato?`<span>${esc(s.intervistato)}</span>`:""}
      ${pg?`<span>Pagina del PDF: <span class="mono">${esc(pg)}</span></span>`:""}
      ${s.url?`<span><a href="${esc(s.url)}" target="_blank" rel="noopener">Apri il documento</a></span>`:""}
      <span><b>Prova:</b> ${esc(provesText(o))}</span>
      <span><b>Non prova:</b> ${esc(notProve)}</span>
    </div>`;
  }

  /* ---------- rendering delle letture ---------- */
  function chips(ids, tid){
    return `<div class="chips">${ids.map(id => `<button type="button" class="chip ${OBS[id]&&OBS[id].status==="missing"?"miss":""}" data-goto="${esc(id)}">${esc(id)}</button>`).join("")}</div>`;
  }
  function notCited(temaIds, used){
    const miss = temaIds.filter(id => !used.has(id));
    return miss.length ? `<p class="small muted">Osservazioni della rubrica non citate da questa lettura: ${miss.map(id=>`<button type="button" class="chip" data-goto="${esc(id)}">${esc(id)}</button>`).join(" ")}</p>` : `<p class="small muted">Questa lettura cita tutte le osservazioni della rubrica.</p>`;
  }
  function senzaDimensioni(t, k){
    const m = (C.mappa_rubriche||[]).find(x => x.rubrica === t.id) || {};
    return `<p class="vuoto">${esc(m["nota_" + k] || "Questa lettura non tratta il tema come dimensione.")}</p>`;
  }
  function enunciato(h){
    const e = (C.ipotesi_enunciati||{})[h];
    return e ? `<p class="ipotesi-enunciato">${esc(h)}: ${esc(e)}</p>` : "";
  }
  function geepColumn(t, temaIds){
    const m = M.geep, col = t.colonne.geep, nl = C.nomi_letture.geep;
    const q = (m.risposte_protocollo||{})[col.domanda] || {};
    const used = new Set(q.evidenze || []);
    const dims = (m.dimensioni||[]).filter(d => col.dimensioni.includes(d.id));
    dims.forEach(d => (d.evidenze||[]).forEach(i => used.add(i)));
    const hyp = (col.ipotesi||[]).filter(h => (m.ipotesi||{})[h]);
    return `<section class="lettura geep" aria-label="${esc(nl.nome)}">
      <div class="chi"><h3>${esc(nl.nome)}</h3><span class="muted small mono">${esc(m.model)} · ${esc(m.model_version)} · ${esc(m.dataset_id)}</span></div>
      <p class="metodo">${esc(nl.metodo)}</p>
      <div class="giud"><div class="lab"><span class="st giudizio">Giudizio</span><h4>Risposta alla domanda</h4></div>
        <p class="testo"><b>${esc(q.esito||"")}</b></p>
        <p class="testo">${esc(q.ragionamento||"")}</p>
        ${chips(q.evidenze||[])}
      </div>
      ${dims.length ? dims.map(d => `<div class="giud"><div class="lab"><span class="st giudizio">Giudizio</span><h4>Dimensione «${esc(d.id)}»</h4></div>
        <p class="testo">${esc(d.giudizio||"")}</p>
        <p class="rline"><span class="nullr">r = null</span><span class="muted">${esc(d.natura_null||"nessun coefficiente")}</span></p>
        ${chips(d.evidenze||[])}</div>`).join("") : senzaDimensioni(t, "geep")}
      ${hyp.map(h => `<div class="giud"><div class="lab"><span class="st giudizio">Giudizio</span><h4>Ipotesi ${esc(h)}</h4></div>
        ${enunciato(h)}
        <p class="testo">${esc(m.ipotesi[h])}</p>
        ${m.ipotesi.cooccorrenza?`<p class="small muted">Compresenza di H1 e H2: ${esc(m.ipotesi.cooccorrenza)}.</p>`:""}</div>`).join("")}
      ${notCited(temaIds, used)}
      ${(m.limiti||[]).length?`<div><h4>Limiti dichiarati</h4><ul class="lims">${m.limiti.map(l=>`<li>${esc(l)}</li>`).join("")}</ul></div>`:""}
    </section>`;
  }
  function claudeColumn(t, temaIds){
    const m = M.claude, col = t.colonne.claude, nl = C.nomi_letture.claude;
    const q = (m.risposte_al_protocollo||{})[col.domanda] || {};
    const thr = (m.regola||{}).soglia;
    const used = new Set(q.osservazioni || []);
    const dims = (m.giudizi||[]).filter(d => col.dimensioni.includes(d.id));
    dims.forEach(d => (d.osservazioni||[]).forEach(i => used.add(i)));
    (m.osservazioni_mancanti_che_pesano||[]).forEach(i => { if (temaIds.includes(i)) used.add(i); });
    const hl = m.ipotesi_sulla_causa || [];
    const hyp = (col.ipotesi||[]).map(h => hl.find(x => x.id === h)).filter(Boolean);
    hyp.forEach(h => [...(h.a_favore||[]), ...(h.mancanti||[])].forEach(i => used.add(i)));
    const noteIp = hyp.length ? hl.filter(x => !x.id && x.nota) : [];
    return `<section class="lettura claude" aria-label="${esc(nl.nome)}">
      <div class="chi"><h3>${esc(nl.nome)}</h3><span class="muted small mono">${esc(m.model)} · ${esc(m.model_version)} · ${esc(m.dataset_id)}</span></div>
      <p class="metodo">${esc(nl.metodo)}</p>
      <div class="giud"><div class="lab"><span class="st giudizio">Giudizio</span><h4>Risposta alla domanda</h4></div>
        <p class="testo"><b>${esc(q.risposta||"")}</b></p>
        ${q.cautela?`<p class="testo">${esc(q.cautela)}</p>`:""}
        ${q.ragionamento?`<p class="testo">${esc(q.ragionamento)}</p>`:""}
        ${chips(q.osservazioni||[])}
        ${q.revisione?`<p class="small muted">Richiama la previsione rivista <button type="button" class="chip" data-goto="${esc(q.revisione)}">${esc(q.revisione)}</button></p>`:""}
      </div>
      ${dims.length ? dims.map(d => {
        const over = d.r != null && thr != null && d.r > thr && !d.acquisita;
        return `<div class="giud"><div class="lab"><span class="st giudizio">Giudizio</span><h4>${esc(d.nome||d.id)}</h4></div>
        <p class="rline"><span class="mono">r ${d.r==null?"null":nf(d.r,2)}</span>
          ${d.r!=null?`<span class="scale" role="img" aria-label="r ${nf(d.r,2)} su scala da 0 a 1, soglia ${nf(thr,2)}"><i style="width:${d.r*100}%"></i><b style="left:${thr*100}%"></b></span>`:""}
          <span class="muted">peso ${esc(d.peso)}</span>
          <span class="${over?"st disputed":"muted"}">${over?"sopra la soglia":"sotto la soglia"} ${thr!=null?nf(thr,2):""}</span></p>
        ${d.etichetta?`<p class="small muted">${esc(d.etichetta)}: notazione ordinale del giudizio, non probabilità né misura.</p>`:""}
        <p class="testo">${esc(d.motivazione||"")}</p>
        ${chips(d.osservazioni||[])}</div>`;
      }).join("") : senzaDimensioni(t, "claude")}
      ${hyp.map(h => `<div class="giud"><div class="lab"><span class="st giudizio">Giudizio</span><h4>Ipotesi ${esc(h.id)}</h4></div>
        ${enunciato(h.id)}
        <p class="testo">${esc(h.stato||"")}</p>
        ${(h.a_favore||[]).length?`<p class="small muted">A favore:</p>${chips(h.a_favore)}`:""}
        ${(h.mancanti||[]).length?`<p class="small muted">Mancano:</p>${chips(h.mancanti)}`:""}</div>`).join("")}
      ${noteIp.map(x => `<p class="small muted">${esc(x.nota)}</p>`).join("")}
      ${notCited(temaIds, used)}
      ${(m.limiti||[]).length?`<div><h4>Limiti dichiarati</h4><ul class="lims">${m.limiti.map(l=>`<li>${esc(l)}</li>`).join("")}</ul></div>`:""}
    </section>`;
  }

  /* ---------- una rubrica ---------- */
  function idsOfTheme(t){
    const ids = [];
    const add = i => { if (!ids.includes(i)) ids.push(i); };
    t.gruppi.forEach(g => {
      (g.osservazioni||[]).forEach(add);
      if (g.conflitto) CONF[g.conflitto].osservazioni.forEach(add);
      if (g.revisione){ const r = REVS[g.revisione]; [].concat(r.previsione_originaria||[]).forEach(add); add(r.revisione); }
    });
    return ids;
  }
  function citedForTheme(t){
    const cited = new Set();
    const cg = t.colonne.geep, cc = t.colonne.claude;
    const qg = M.geep.risposte_protocollo[cg.domanda] || {};
    (qg.evidenze||[]).forEach(i=>cited.add(i));
    M.geep.dimensioni.filter(d=>cg.dimensioni.includes(d.id)).forEach(d=>(d.evidenze||[]).forEach(i=>cited.add(i)));
    const qc = M.claude.risposte_al_protocollo[cc.domanda] || {};
    (qc.osservazioni||[]).forEach(i=>cited.add(i));
    M.claude.giudizi.filter(d=>cc.dimensioni.includes(d.id)).forEach(d=>(d.osservazioni||[]).forEach(i=>cited.add(i)));
    (M.claude.ipotesi_sulla_causa||[]).filter(h => (cc.ipotesi||[]).includes(h.id))
      .forEach(h => [...(h.a_favore||[]), ...(h.mancanti||[])].forEach(i=>cited.add(i)));
    return cited;
  }
  function themeSection(t){
    const n = C.indice.findIndex(x => x.id === t.id) + 1;
    const temaIds = idsOfTheme(t);
    const altre = [...citedForTheme(t)].filter(i => !temaIds.includes(i) && OBS[i]);
    return { n: temaIds.length, html: `
      <section class="tema" id="${esc(t.id)}" data-tema="${esc(t.id)}" aria-labelledby="${esc(t.id)}-h">
        <div class="band">
          <div style="display:grid;gap:8px"><span class="eyebrow">Rubrica ${n} · i fatti, uguali per entrambe le letture</span>
            <h2 id="${esc(t.id)}-h">${esc(t.titolo)}</h2>
            <p class="domanda">${esc(t.domanda)}</p></div>
          ${t.gruppi.map(g => g.conflitto ? conflictBlock(g, t) : g.revisione ? revisionBlock(g, t) : `<div class="gruppo"><h3>${esc(g.titolo)}</h3><div class="cards">${g.osservazioni.map(i => card(i, t)).join("")}</div></div>`).join("")}
          <div class="gruppo"><h3>Cosa manca per concludere</h3><p class="cosa-manca">${esc(t.cosa_manca)}</p><p class="contesto">${esc(t.contesto)}</p></div>
          ${altre.length?`<details class="altre"><summary>Altre osservazioni citate dalle letture (${altre.length}): appartengono ad altre rubriche</summary><div class="cards">${altre.map(i=>card(i,t)).join("")}</div></details>`:""}
        </div>

        <div style="display:grid;gap:8px"><span class="eyebrow">Rubrica ${n} · due letture indipendenti degli stessi fatti</span>
          <p class="small muted" style="max-width:80ch">Le due colonne non sono sulla stessa scala. Un null della lettura Geep significa che manca la misura; non equivale a zero e non va confrontato con un coefficiente della lettura Claude. Ogni sigla rimanda all'osservazione citata.</p></div>
        <div class="letture">${geepColumn(t, temaIds)}${claudeColumn(t, temaIds)}</div>

        <div style="display:grid;gap:12px">
          <h3>Partire da una fonte</h3>
          <p class="small muted">Ogni fonte usata in questa rubrica, con le osservazioni che ne derivano.</p>
          <div class="fonti-lista">${sourceIndex([...temaIds, ...altre])}</div>
        </div>
      </section>` };
  }

  /* ---------- pagina ---------- */
  function legenda(){
    return `<section aria-labelledby="leg-h" class="panel">
        <h2 id="leg-h" style="margin-bottom:12px">Come si legge</h2>
        <div class="legend">${C.come_si_legge.map(x => `<div><span class="st ${esc(x.chiave)}">${esc(x.etichetta)}</span><p>${esc(x.testo)}</p></div>`).join("")}</div>
      </section>`;
  }
  function metodo(frase){
    const fa = D.freeze_audit || {};
    return `<section aria-labelledby="met-h" class="metodo">
        <h2 id="met-h">Metodo e versioni</h2>
        <div class="check ${errors.length?"err":"ok"}">${errors.length?`Controlli all'avvio: ${errors.length} problemi. I dati interessati non vanno considerati affidabili.<ul>${errors.map(e=>`<li>${esc(e)}</li>`).join("")}</ul>`:`Controlli all'avvio superati: dataset e letture riferiti a ${esc(D.dataset_id)}; ${frase}; tutte le sigle citate dalle letture sono nel dataset.`}</div>
        <dl>
          <dt>Base dati</dt><dd>${esc(D.dataset_id)} · ${esc((D.observations||[]).length)} osservazioni, ${esc((D.sources||[]).length)} fonti, ${esc((D.conflicts||[]).length)} conflitti aperti, ${esc((D.missing||[]).length)} dati mancanti, ${esc((D.forecast_revisions||[]).length)} previsione rivista</dd>
          <dt>Congelamento</dt><dd>${esc(fa.date||"")} · ${esc(fa.by||"")} · ${esc(fa.type||"")}</dd>
          <dt>Lettura Geep</dt><dd>${esc(M.geep.model_version)}</dd>
          <dt>Lettura Claude</dt><dd>${esc(M.claude.model_version)}</dd>
          <dt>Configurazione</dt><dd>${esc(C.config_version)} · ${esc(C.stato)}</dd>
          <dt>Regola</dt><dd>La pagina non calcola giudizi: mostra quelli già scritti nei file delle due letture.</dd>
        </dl>
      </section>`;
  }
  function render(){
    const h = C.testata;
    const fa = D.freeze_audit || {};
    const sviluppati = C.temi.map(t => t.id);
    const tema = RUB ? C.temi.find(t => t.id === RUB) : null;
    const voce = RUB ? C.indice.find(x => x.id === RUB) : null;
    const n = voce ? C.indice.indexOf(voce) + 1 : 0;
    const link = x => `${BASE}${x.cartella}/`;
    if (RUB && !tema) errors.push(`La pagina dichiara la rubrica ${RUB}, che non è sviluppata nella configurazione.`);

    document.getElementById("testata").innerHTML = `
      <span class="eyebrow">Lo Zibaldino · studiolo${voce ? ` · rubrica ${n} di ${C.indice.length}` : ` · ingresso`}</span>
      <h1>${esc(h.titolo)}</h1>
      <div class="meta"><span>${esc(h.data)}</span><span>${h.autori.map(esc).join(", ")}</span><span>Titolo ${esc(h.titolo_stato)}</span></div>
      <p class="guida">${esc(h.domanda_guida)}</p>
      <p class="limiti">${esc(h.perimetro)} <span class="delim">${esc(h.delimitazione)}</span></p>
      <p class="prov">Dati: ${esc(D.dataset_id)}, congelata il ${esc(fa.date||D.as_of)}. Letture: ${esc(M.geep.model_version)} e ${esc(M.claude.model_version)}.</p>`;

    const sec = document.createElement("div");
    sec.className = "wrap"; sec.style.margin = "0"; sec.style.maxWidth = "none";

    if (tema){
      const toc = C.indice.map(x => {
        const dev = sviluppati.includes(x.id), on = x.id === RUB;
        return `<li class="${dev?"dev":"off"} ${on?"on":""}">${dev && !on ? `<a href="${link(x)}">${esc(x.titolo)}</a>` : esc(x.titolo)} <span class="small">· ${esc(x.stato)}</span></li>`;
      }).join("");
      const s = themeSection(tema);
      sec.innerHTML = `
        ${legenda()}
        <nav aria-label="Rubriche"><ol class="toc">${toc}</ol><p class="small" style="margin-top:8px"><a href="${BASE}">← Ingresso dello studiolo</a></p></nav>
        ${s.html}
        ${metodo(`la rubrica ha ${s.n} osservazioni`)}`;
      document.title = `${tema.titolo} · Studiolo CAS`;
    } else {
      let nTot = 0;
      C.temi.forEach(t => nTot += idsOfTheme(t).length);
      sec.innerHTML = `
        ${legenda()}
        <section aria-labelledby="rub-h" style="display:grid;gap:14px">
          <h2 id="rub-h">Le sei rubriche</h2>
          <p class="small muted" style="max-width:80ch">Ogni rubrica ha la stessa struttura: i fatti comuni a tutta larghezza, le due letture indipendenti, la passeggiata fra le fonti. Si possono leggere in qualsiasi ordine.</p>
          <ol class="rubriche">${C.indice.map((x, i) => {
            const dev = sviluppati.includes(x.id);
            return `<li class="rub ${dev?"dev":"off"}">
              <span class="eyebrow">Rubrica ${i+1} / ${C.indice.length} · ${esc(x.stato)}</span>
              <h3>${dev ? `<a href="${link(x)}">${esc(x.titolo)}</a>` : esc(x.titolo)}</h3>
              ${x.sommario?`<p>${esc(x.sommario)}</p>`:""}
              ${dev ? `<a class="apri" href="${link(x)}">Apri la rubrica →</a>` : ""}
            </li>`;
          }).join("")}</ol>
        </section>
        ${metodo(`le rubriche sviluppate (${sviluppati.length}) hanno in tutto ${nTot} osservazioni`)}`;
    }
    app.appendChild(sec);
  }
  function conflictBlock(g, t){
    const c = CONF[g.conflitto];
    return `<div class="gruppo"><h3>${esc(g.titolo)}</h3>
      <div class="conflitto" id="${slug(c.id, t.id)}"><div class="lab" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="st disputed">Conflitto ${esc(c.id)}</span><h4>${esc(g.titolo_conflitto)}</h4></div>
        <p class="nota">${esc(c.nota)}</p>
        <div class="pair">${c.osservazioni.map(i => card(i, t)).join("")}</div>
        <p class="chiarire"><b>Da chiarire:</b> ${esc(g.punto_da_chiarire)} Lo direbbe <button type="button" class="chip miss" data-goto="${esc(g.chiarirebbe)}">${esc(g.chiarirebbe)}</button>, che oggi è un dato mancante.</p>
      </div></div>`;
  }
  function revisionBlock(g, t){
    const r = REVS[g.revisione];
    const prima = [].concat(r.previsione_originaria||[]);
    return `<div class="gruppo"><h3>${esc(g.titolo)}</h3>
      <div class="revisione-box" id="${slug(r.id, t.id)}"><div class="lab" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="st revisione">Previsione rivista ${esc(r.id)}</span><h4>${esc(g.titolo_revisione||r.oggetto)}</h4></div>
        <p class="nota">${esc(r.nota)}</p>
        <span class="fase">L'attesa</span>
        <div class="cards">${prima.map(i => card(i, t)).join("")}</div>
        <span class="fase">La revisione</span>
        <div class="cards">${card(r.revisione, t)}</div>
      </div></div>`;
  }
  function sourceIndex(ids){
    const by = new Map();
    ids.forEach(i => (OBS[i].source_ids||[]).forEach(s => { if(!by.has(s)) by.set(s, []); if(!by.get(s).includes(i)) by.get(s).push(i); }));
    return [...by.entries()].sort((a,b)=>a[0].localeCompare(b[0],undefined,{numeric:true})).map(([s, os]) => {
      const x = SRC[s] || {};
      return `<div class="fonte"><span><b class="mono">${esc(s)}</b> · ${esc(x.publisher||"")}${x.date?` · ${esc(x.date)}`:""} · ${esc(STYPE[x.type]||x.type||"")}${x.url?` · <a href="${esc(x.url)}" target="_blank" rel="noopener">documento</a>`:""}</span>
        <span class="usi">Osservazioni: ${chips(os)}</span></div>`;
    }).join("");
  }

  /* ---------- interazione ---------- */
  function vaiA(el){
    const det = el.closest("details"); if (det && !det.open) det.open = true;
    // lo scorrimento avviene sempre nella pagina: funziona anche dentro un riquadro ad altezza fissa (come Mantegna)
    el.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block:"center"});
    // in aggiunta, se la pagina ospite adegua l'altezza dell'iframe, le chiede di portarsi all'elemento
    if (IN_FRAME){
      const y = el.getBoundingClientRect().top + window.pageYOffset;
      try { window.parent.postMessage({ tipo: FRAME_ID + "-vai", y: Math.round(y) }, "*"); } catch(e){}
    }
  }
  app.addEventListener("click", e => {
    const fb = e.target.closest(".fbtn");
    if (fb){
      const cardEl = fb.closest(".card"), slot = cardEl.querySelector(".fslot");
      const open = fb.getAttribute("aria-expanded") === "true";
      cardEl.querySelectorAll(".fbtn").forEach(b => b.setAttribute("aria-expanded","false"));
      if (open){ slot.hidden = true; slot.innerHTML = ""; }
      else { fb.setAttribute("aria-expanded","true"); slot.innerHTML = sourceDetail(fb.dataset.src, fb.dataset.obs); slot.hidden = false; }
      postHeight(); return;
    }
    const go = e.target.closest("[data-goto]");
    if (go){
      const sez = go.closest("[data-tema]");
      if (!sez) return;
      const el = document.getElementById(slug(go.dataset.goto, sez.dataset.tema));
      if (el){
        vaiA(el);
        el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1400);
        el.setAttribute("tabindex","-1"); el.focus({preventScroll:true});
        postHeight();
      }
      return;
    }
  });

  // protocollo con la pagina che incorpora (stesso schema degli altri strumenti del deposito):
  // { tipo: "cas-studiolo-altezza", h } e { tipo: "cas-studiolo-vai", y }
  function postHeight(){
    if (!IN_FRAME) return;
    try { window.parent.postMessage({ tipo: FRAME_ID + "-altezza", h: document.documentElement.scrollHeight }, "*"); } catch(e){}
  }
  if ("ResizeObserver" in window) new ResizeObserver(postHeight).observe(document.body);
  window.addEventListener("load", postHeight);

  /* ---------- avvio ---------- */
  fetchJSON(CFG_URL).then(cfg => {
    C = cfg;
    return Promise.all([fetchJSON(BASE + C.file.dataset), fetchJSON(BASE + C.file.modelli.geep), fetchJSON(BASE + C.file.modelli.claude)]);
  }).then(([d, g, c]) => {
    D = d; M.geep = g; M.claude = c;
    D.observations.forEach(o => OBS[o.id] = o);
    D.sources.forEach(s => SRC[s.id] = s);
    (D.conflicts||[]).forEach(x => CONF[x.id] = x);
    (D.forecast_revisions||[]).forEach(x => REVS[x.id] = x);
    validate();
    render();
    postHeight();
  }).catch(err => {
    document.getElementById("testata").innerHTML = `<h1>Studiolo CAS</h1><div class="check err">I dati non si sono caricati: ${esc(err.message)}. La pagina va aperta da un server (GitHub Pages o simile), non come file locale.</div>`;
  });
})();
