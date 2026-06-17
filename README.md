# Demo statica - Madonna del Rio

Questa cartella contiene una demo portabile del sito "Madonna del Rio - Fontanelice".
Non usa backend, framework o dipendenze esterne.

## Come aprire la demo

1. Apri la cartella `sito web`.
2. Fai doppio clic su `index.html`.
3. La pagina donazioni si apre dal pulsante "Dona una luce" oppure aprendo direttamente `donazioni.html`.

La demo funziona anche copiando l'intera cartella su una chiavetta USB o su un altro computer. Lo stato delle luci accese viene salvato nel browser con `localStorage`.

## File principali

- `index.html`: homepage evocativa del santuario.
- `luogo.html`: pagina con filmato drone, descrizione del luogo e mappa.
- `donazioni.html`: pagina interattiva con piantina SVG e simulazione donazioni.
- `style.css`: colori, layout responsive e animazioni.
- `app.js`: logica JavaScript vanilla per luci, contatore, progresso e reset.
- `assets/`: immagini usate nella demo.

## Come sostituire le immagini

Le immagini si trovano in `assets/`:

- `hero-santuario.jpg`: immagine grande della homepage.
- `abside.jpg`: immagine usata nelle card e nella sezione emozionale.
- `facciata.jpg`: immagine della facciata.
- `damasco.jpg`: texture damascata rossa.
- `logo-amici-santuario.png`: logo mostrato nell'intestazione.
- `filmato-drone.mp4`: video usato nella pagina `luogo.html`.
- `piantina-riferimento.jpg`: immagine di riferimento, non necessaria al funzionamento della piantina SVG.

Per sostituire una foto, mantieni lo stesso nome file. In alternativa, cambia il percorso corrispondente in `index.html` o in `style.css`.

## Come modificare i colori

Apri `style.css` e modifica le variabili all'inizio del file:

```css
:root {
  --damask: #974c36;
  --damask-dark: #712d1d;
  --plaster: #c7c0bf;
  --stone: #ad9990;
  --earth: #584839;
  --gold: #e2b76b;
  --dark: #241b16;
}
```

Queste variabili controllano la palette principale: rosso damascato, intonaco, pietra, terra e luce dorata.

## Come aggiungere o spostare i punti luminosi

La piantina è un SVG dentro `donazioni.html`.
Cerca il gruppo:

```html
<g id="lightPoints">
```

Ogni luce è un cerchio come questo:

```html
<circle
  class="light-point"
  cx="360"
  cy="172"
  r="15"
  data-light-id="abside-1"
  data-area="abside"
  tabindex="0"
  role="button"
  aria-label="Accendi una luce nell'abside">
</circle>
```

Per spostare un punto, cambia `cx` e `cy`.
Per aggiungerne uno, copia un cerchio e assegna un nuovo `data-light-id` univoco.
Per cambiare la zona mostrata nel messaggio, modifica `data-area`.

## Come azzerare le luci

Nella pagina `donazioni.html` usa il pulsante "Reset demo".
Il reset cancella solo i dati salvati nel browser per questa demo.

## Pubblicazione futura

### GitHub Pages

1. Crea un repository GitHub.
2. Carica il contenuto della cartella `sito web`.
3. In GitHub vai su `Settings > Pages`.
4. Seleziona il branch principale e la cartella root.
5. Salva: GitHub pubblicherà il sito come pagina statica.

### Cloudflare Pages

1. Crea un progetto Cloudflare Pages collegato al repository.
2. Build command: lascia vuoto.
3. Output directory: `/` se pubblichi direttamente la cartella `sito web`.
4. Deploy: Cloudflare servirà `index.html` come sito statico.

## Note

Il pulsante di donazione è dimostrativo: non avvia pagamenti e non invia dati.
Per una raccolta reale servirà integrare in futuro un sistema di pagamento e una gestione privacy adeguata.
