# Studiolo — Mantegna e la stanza che non c’era

## v0.14 — indice e ambienti separati (15 ottobre 2026)

L’ingresso a GitHub Pages è adesso `index.html`, un indice essenziale e responsive. La precedente pagina di presentazione è stata conservata integralmente in `guida.html`, con il pulsante prematuro per saltare direttamente al laboratorio rimosso. Il modulo Holbein (`anamorfosi.html`) e il laboratorio Mantegna (`laboratorio.html`, sempre v0.10) sono autonomi, e ciascuno può tornare all’indice.

Percorso consigliato: **indice → guida → anamorfosi → laboratorio**. Le risorse Markdown e JSON sono collegate dall’indice.

### Struttura aggiornata

```text
studioli_vari/
  mantegna/
    index.html                   ingresso e collegamenti
    guida.html                   presentazione completa (vecchio index)
    anamorfosi.html              Holbein / dimostrazione 2D
    laboratorio.html             simulazione Mantegna v0.10
    immagini/
      holbein_teschio_dettaglio.webp
    documenti/
      quaderno_v03.md
    dati/
      punti_mantegna_20261015.json
      punti_mantegna_v07.json
    README.md
```

**Attenzione Blogger:** se la pagina dello Studiolo incorpora `laboratorio.html` in un iframe, GitHub non può cambiarne da solo il `src`. Nell’HTML della pagina Blogger sostituire esclusivamente il link nel `src` con `https://zibaldino-capaneo.github.io/deposito/studioli_vari/mantegna/index.html`. L’indice è volutamente breve per funzionare anche dentro un iframe. Il vecchio link `.../laboratorio.html` resta valido per gli accessi diretti.

---


Nota storica sulla struttura iniziale v0.8, conservata nel registro di sviluppo. Coautori: Paolo + ChatGPT (Geep).

## Installazione in GitHub Pages

Questo pacchetto contiene la cartella `studioli_vari/`, da aggiungere **senza modificare la cartella `periplo/`** al repository pubblico `zibaldino-capaneo/deposito` (branch che pubblica GitHub Pages).

Struttura della versione precedente (per lo schema attuale vedi la sezione v0.14 qui sopra):

```
deposito/
  periplo/                  (già esistente, non toccare)
  studioli_vari/
    mantegna/
      index.html             [nella v0.14 è l’indice]
      laboratorio.html       laboratorio interattivo (ora v0.10)
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

## Aggiornamento v0.10 — punti già rilevati e importazione da testo

Nella sezione «Misura del torso e delle gambe» compare il pulsante «Inserisci gli 8 punti di Paolo (15/10)». I dati provengono dalla sessione v0.8 del 15 ottobre e sono riproducibili anche da `dati/punti_mantegna_20261015.json`. Il pulsante non cambia i parametri di osservazione e i punti restano modificabili a mano.

Nel riquadro espandibile si può incollare un JSON di sessione v2, di coordinate v1 o un semplice oggetto di punti; premere «Carica punti dal testo». Di norma vengono caricati solo i punti, preservando i cursori correnti. Attivando la casella di spunta si possono ripristinare anche le impostazioni, quando il JSON le comprende. L'importazione tradizionale da file continua a ripristinare l'intera sessione v2.

**Metodo:** il preset non è una verifica indipendente e non costituisce un modello anatomico vero: è la riproduzione della scelta manuale di un osservatore. Occorre utilizzare gli stessi punti per i confronti e provare anche controlli e osservatori diversi.


## Prologo anamorfosi v0.12
`anamorfosi.html` mostra il dettaglio autentico degli Ambasciatori da screenshot fornito dall’utente, con rettifica digitale affine illustrativa (non correzione ottica storica certificata). `immagini/holbein_teschio_dettaglio.webp` è necessario. Il modulo è indipendente e non cambia il laboratorio di misura.


## v0.13 — nota di trasparenza sul modulo Holbein

Il modulo `anamorfosi.html` è una dimostrazione visiva su una riproduzione 2D, con trasformazione affine orientata a rendere riconoscibile il teschio. Non è la ricostruzione del punto di osservazione di Holbein; la dichiarazione metodologica ora appare subito sotto il visualizzatore. Il laboratorio Mantegna non è stato modificato in questa revisione.
