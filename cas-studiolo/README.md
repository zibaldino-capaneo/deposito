
# Studiolo CAS — maquette del tema 1

Pagina statica per GitHub Pages. Nessun backend, nessuna risorsa esterna, nessuna raccolta di dati dei visitatori.

## File

| File | Contenuto | Chi lo scrive |
|---|---|---|
| `data/CAS-DATI-v0.4.json` | Base dati comune, congelata | Claude e Geep, audit Geep |
| `data/CAS-Geep-v0.4.json` | Lettura Geep, versione `2026-11-01-geep04-independent` | Geep |
| `data/CAS-Claude-v0.4.json` | Lettura Claude, versione `2026-11-01j` | Claude |
| `data/CAS-config-v0.1.json` | Configurazione editoriale: ordine, titoli, raggruppamenti, testi di raccordo. Nessun fatto né giudizio | Claude, da controllare |
| `index.html` | Visualizzazione. Non calcola giudizi: legge e mostra | Claude, da controllare |

All'avvio la pagina controlla che dataset e letture siano riferiti alla stessa versione e che ogni sigla citata esista nel dataset. Gli esiti sono in fondo, alla voce «Metodo e versioni».

## Prova locale

La pagina legge i JSON con `fetch`, quindi va servita da un server, non aperta come file:

    cd cas-studiolo
    python3 -m http.server 8000

poi `http://localhost:8000`.

## Incorporamento in Blogger

La pagina comunica la propria altezza al contenitore. Nel post, in modalità HTML (sostituire l'indirizzo con quello di GitHub Pages):

    <iframe id="cas-studiolo" src="https://UTENTE.github.io/cas-studiolo/"
      style="width:100%;border:0;min-height:900px" title="Studiolo CAS" loading="lazy"></iframe>
    <script>
    window.addEventListener("message", function (e) {
      if (e.origin !== "https://UTENTE.github.io") return;
      if (e.data && e.data.type === "cas-studiolo-height") {
        document.getElementById("cas-studiolo").style.height = e.data.height + "px";
      }
    });
    </script>

Se il template non conserva lo script, l'iframe resta a 900 px con scorrimento interno: in quel caso meglio un post narrativo con un link alla pagina completa su GitHub Pages.
