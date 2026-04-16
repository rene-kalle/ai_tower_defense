# ai_tower_defense

Ein einfaches Tower-Defense-Spiel in reinem HTML/CSS/JavaScript.

## Überblick

- **Name:** Tower Defense
- **Technologie:** HTML, CSS, JavaScript
- **Ziel:** Verteidige deine Basis gegen angreifende Gegnerwellen, indem du Türme platzierst.
- **Bedienung:** Wähle einen Turm aus der Seitenleiste, klicke auf die Karte, um ihn zu bauen, und starte dann die nächste Welle.

## Funktionen

- Vier Turmarten: **Archer**, **Catapult**, **Mage**, **Cannon**
- Unterschiedliche Gegnerklassen mit Steigerung der Schwierigkeit pro Welle
- Gold-, Lebens- und Wellenanzeige
- Auswahl von verschiedenen Pfaden per URL-Parameter:
  - `index.html?path=1`
  - `index.html?path=2`
  - `index.html?path=3`
- Barrierefreie Steuerung mit Tastaturunterstützung und Screenreader-Ansagen

## Spielsteuerung

1. Klicke auf einen Turm im Auswahlmenü.
2. Bewege die Maus über die Karte und klicke auf einen freien Bauplatz.
3. Klicke auf **Start Next Wave**, um Gegnerwellen zu starten.
4. Klicke auf **Restart**, um neu zu beginnen.
5. Drücke **Escape**, um die Turmauswahl abzubrechen.

## Lokales Starten

Einfach die Datei `index.html` im Browser öffnen.

## Projektstruktur

- `index.html` – Spieloberfläche und Layout
- `styles.css` – Styling für Karte, Türme, Gegner und Benutzeroberfläche
- `game.js` – Spiellogik, Wellen, Schießen, Gegnerbewegung und Interaktion

## Hinweise

- Das Spiel läuft vollständig clientseitig und benötigt keinen Server.
- Empfohlen ist ein aktueller Browser mit JavaScript-Unterstützung.

