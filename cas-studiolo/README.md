# Studiolo CAS

Pagine statiche per GitHub Pages, nella cartella `cas-studiolo/` del repository `zibaldino-capaneo/deposito`. Nessun backend, nessuna risorsa esterna, nessuna raccolta di dati dei visitatori.

## Struttura

| Percorso | Contenuto |
|---|---|
| `index.html` | Ingresso (provvisorio fino alla fase B) |
| `01-carico/`, `02-mercati/` … | Una cartella per rubrica. La `index.html` è un guscio che dichiara la rubrica e carica il motore comune |
| `comune/studiolo.js`, `comune/studiolo.css` | Il motore, unico per tutte le rubriche. Non calcola giudizi: legge e mostra |
| `data/CAS-DATI-v0.4.json` | Base dati comune, congelata |
| `data/CAS-Geep-v0.4.json` | Lettura Geep, `2026-11-01-geep04-independent` |
| `data/CAS-Claude-v0.4.json` | Lettura Claude, `2026-11-01k` |
| `data/CAS-config-v0.1.json` | Configurazione editoriale: ordine, cartelle, titoli, raggruppamenti, testi di raccordo. Nessun fatto né giudizio |
| `archivio/maquette-t1-collaudata/` | Copia della maquette del tema 1 collaudata il 1° novembre 2026, con i suoi dati, invariata |

Rubriche nuove: si aggiunge la rubrica nella configurazione e una cartella con il guscio. Il motore non si copia.

All'avvio ogni pagina controlla che dataset e letture siano riferiti alla stessa versione e che ogni sigla citata esista nel dataset. L'esito è in fondo, alla voce «Metodo e versioni».

## Prova locale

    cd cas-studiolo
    python3 -m http.server 8000

poi `http://localhost:8000`.

## Incorporamento

Le pagine funzionano in un riquadro ad altezza fissa con scorrimento interno, come lo Studiolo Mantegna, senza script nella pagina ospite. Il modo di incorporarle in Blogger si decide nella fase B.
