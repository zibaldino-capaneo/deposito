# Studiolo — Mantegna e la stanza che non c'era

Versione di cantiere 0.8 — 15 ottobre 2026. Coautori: Paolo + ChatGPT (Geep).

## Installazione in GitHub Pages

Questo pacchetto contiene la cartella `studioli_vari/`, da aggiungere **senza modificare la cartella `periplo/`** al repository pubblico `zibaldino-capaneo/deposito` (branch che pubblica GitHub Pages).

La struttura da conservare è:

```
deposito/
  periplo/                  (già esistente, non toccare)
  studioli_vari/
    mantegna/
      index.html             pagina dello Studiolo
      laboratorio.html       laboratorio interattivo v0.9
      dati/
        punti_mantegna_v07.json
      documenti/
        quaderno_v03.md
```

Dopo la pubblicazione, la pagina dovrebbe comparire a:
https://zibaldino-capaneo.github.io/deposito/studioli_vari/mantegna/

## Che cosa può fare il visitatore

* scegliere fra quattro dipinti e confrontare una tela verticale con una inclinata;
* impostare angolo, altezza del bordo, altezza dell'occhio e distanza;
* controllare l'indice geometrico basso/alto e misurare tre rapporti anatomici tramite punti manuali;
* ripristinare il punto di partenza;
* esportare e importare una **sessione completa JSON** (schema `studiolo-mantegna-session-v2`), con dipinto, angolo, parametri, opzioni e punti;
* importare anche i vecchi file di sole coordinate v0.7 (`studiolo-mantegna-landmarks-v1`).

## Limiti dichiarati

- Il laboratorio simula la proiezione di una superficie; non prova la collocazione storica della tela.
- Per Zaganelli sappiamo di una destinazione a pala d'altare, non dell'angolo materiale di montaggio.
- Il modello H5 (nicchia, pavimento, catafalco, dipinto) è presentato come ipotesi **non ancora implementata** nel simulatore.
- I punti anatomici sono selezionati dall'osservatore: la loro proiezione produce indici 2D, non ricostruzioni anatomiche 3D.
- Le immagini sono caricate da Commons tramite rete e potrebbero fallire; usare il caricamento di immagine locale in caso di errore. Questo pacchetto **non contiene** riproduzioni.

## Blogger

Si può inserire nella pagina Blogger un breve testo di presentazione con un link diretto alla pagina su GitHub Pages. Per incorporare il laboratorio, preferire la pagina GitHub come destinazione esterna, per evitare problemi di altezza e doppio scorrimento con iframe su mobile.

## Modifiche rispetto alla v0.7

- Pagina introduttiva autonoma, adatta a GitHub Pages.
- Collegamenti alle fonti, al quaderno di cantiere e ai punti di prova.
- Nel laboratorio, il JSON esportato conserva per la prima volta anche l'assetto di osservazione.
- Importazione retrocompatibile dei vecchi file `landmarks-v1`.
- Pulsante per tornare alla pagina introduttiva.

## Nota pratica per il caricamento sul sito GitHub

Apri la radice del repository `deposito`, seleziona **Add file → Upload files**, poi trascina la cartella `studioli_vari` **estratta** dal pacchetto (non lo ZIP). Controlla che le anteprime dei percorsi inizino con `studioli_vari/mantegna/` e conferma il commit. GitHub creerà le directory necessarie. Nessun file alla radice del repository deve essere sostituito.


Aggiornamento v0.9: griglia 3×3×3 inclinazione/distanza/occhio, indice di convergenza e forma della cornice, quota teorica di compensazione, confronti anatomici rispetto a una visione frontale. L’HTML Blogger esistente resta invariato: incorpora sempre `laboratorio.html`.
