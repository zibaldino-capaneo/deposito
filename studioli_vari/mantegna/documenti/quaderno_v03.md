# Studiolo — Mantegna, il Cristo morto e la stanza che non c'era

**Quaderno di cantiere v0.3 — 14 ottobre 2026**

Coautori: Paolo + ChatGPT (Geep)

## Domanda guida

Il *Cristo morto* di Mantegna mostra particolari compressioni apparenti di gambe e torso. È possibile che una diversa inclinazione del supporto, eventualmente all'interno di una costruzione devozionale prospettica, attenuasse tali anomalie? La possibilità geometrica **non dimostra** l'esistenza storica di quella collocazione.

## Ipotesi di lavoro

- **H1** — Correzioni pittoriche autonome per ragioni narrative e devozionali.
- **H2** — Compensazione intenzionale della visione da un punto di vista e da un'inclinazione predeterminati.
- **H3** — Interazione percettiva con riferimenti architettonici reali non conservati.
- **H4** — Il dipinto come studio o prototipo, non necessariamente per un'altra opera poi eseguita.
- **H5** — Piccolo sepolcro devozionale a profondità simulata (nicchia, pavimento, catafalco e superficie dipinta), con compensazioni prospettiche multiple.

Le ipotesi non sono mutuamente esclusive e nessuna è attualmente dimostrata per la storia materiale del dipinto.

## Laboratorio v0.7

Il file `mantegna_laboratorio_comparativo_v07.html` conserva il confronto della v0.6 fra:

1. Mantegna, *Cristo morto* — caso principale;
2. Mantegna, *San Sebastiano* (Louvre) — controllo con figura intera dello stesso artista;
3. Francesco Zaganelli, *Cristo morto con angeli* (National Gallery) — controllo con scorcio simile e collocazione originale in pala d'altare, **angolo della superficie non documentato**;
4. Piero della Francesca, *Flagellazione* — controllo architettonico supplementare.

### Nuova misura anatomica: otto punti scelti dall'osservatore

Sull'immagine sorgente, non inclinata, si marcano due spalle, due lati del bacino, due ginocchia, due caviglie. Già con **quattro punti** (spalle e bacino) si ottengono gli indici del torso. Il software mantiene gli stessi punti sotto tutte le inclinazioni simulando la proiezione centrale del piano.

Siano `S` il punto medio delle due spalle, `H` il punto medio del bacino, `K` il punto medio delle ginocchia, `A` quello delle caviglie, tutti proiettati nelle coordinate della vista virtuale. Definiamo:

- **Ampiezza relativa toracica:** `d(spallaS,spallaD) / d(S,H)`;
- **Ampiezza relativa del bacino:** `d(ancaS,ancaD) / d(S,H)`;
- **Gambe relative al torso:** `[d(H,K) + d(K,A)] / d(S,H)`.

Confronto fra proiezione della tela verticale e proiezione inclinata: per ogni indice `Q`, variazione percentuale `100 × [Q(inclinata)/Q(verticale) - 1]`.

Un torso relativamente meno largo produce valori inferiori per i primi due indici, **ma solo rispetto ai punti scelti**. Gambe relativamente più lunghe producono un valore superiore per il terzo. I tre indicatori possono muoversi in direzioni diverse: non va attribuito un punteggio cumulativo prima di fissare un criterio esterno.

### Limitazioni e stop-rule

- Le coordinate marcate sono di una **immagine dipinta già prospettica**, non di un corpo anatomico tridimensionale; la proiezione dell'immagine inclinata **non ricostruisce da sola l'anatomia reale**.
- Le misure dipendono dalla scelta manuale degli estremi, da eventuali tagli della riproduzione e dalla definizione ambigua di spalla, anca, ginocchio e caviglia in una figura scorciata.
- Non si è prescelto l'angolo che migliora Mantegna. Occorre provare inclinazioni **positive e negative**, e confrontare **ciascun controllo con la propria condizione a 0°**.
- Un cambiamento degli indici non prova che il dipinto sia più naturale; la valutazione percettiva andrà tenuta distinta, idealmente con immagini presentate in ordine casuale e angolo nascosto.
- **Stop-rule:** se per ottenere simultaneamente un risultato desiderato dobbiamo cambiare continuamente la selezione dei punti o introdurre parametri non motivati, non abbiamo un supporto per la tesi.

## Come usare la v0.7

1. Aprire l'HTML, attendere la spia verde per l'opera selezionata o caricare un'immagine locale.
2. Nella sezione **Misura del torso e delle gambe** cliccare prima le due spalle, poi i lati del bacino; a questo punto la tabella calcola i primi due indici.
3. Completare le due ginocchia e le due caviglie per il rapporto gambe/torso.
4. Provare gli angoli. Il pulsante **Ripristina condizioni iniziali** ripristina i comandi ma **non cancella** le coordinate marcate.
5. Salvare le coordinate `.json`: possono essere importate successivamente. Ripetere il tracciamento sui controlli.

## Primo controllo tecnico, non storico-artistico

Il codice della v0.7 è stato provato in Chromium con una **figura di prova sintetica** (non una riproduzione di Mantegna). Il calcolo si aggiorna all'inclinazione scelta, restituisce 0% a 0°, conserva i punti cambiando opera e dopo il reset; l'esempio sintetico ha prodotto gambe relativamente più lunghe mentre la larghezza toracica relativa aumentava. Questi valori non costituiscono un risultato sul dipinto reale. Le immagini online dipendono da fonti esterne e possono non caricarsi nel browser; resta il caricamento locale.

## Prossimo controllo

Marcare gli stessi punti sulla fotografia del *Cristo morto* e sui due controlli, conservando il JSON per ripetibilità. Verificare quanto cambia il risultato spostando ciascun punto di pochi pixel, poi confrontare gli intervalli degli angoli per cui i tre indici mostrano un cambiamento coerente, senza scegliere retrospettivamente i casi migliori.
