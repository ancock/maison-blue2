MAISON BLUE — NEUE WEBSITE

DATEIEN
-------
index.html       Hauptseite
style.css        Design + Responsive Layout + Animationen
script.js        UI + Scroll Reveal + Supabase Reservierungen
supabase.sql     Datenbank + RLS + atomare Reservierungsfunktion
images/          Hier deine Fotos hineinlegen

FOTOS
-----
hero.jpg             Großes Titelbild / Restaurant
restaurant.jpg       Innenraum / Ambiente
menu-starter.jpg     Vorspeise
menu-main.jpg        Hauptgang
menu-dessert.jpg     Dessert
wine.jpg             Wein / Tisch
gallery-1.jpg        Galerie
gallery-2.jpg        Galerie
gallery-3.jpg        Galerie
gallery-4.jpg        Galerie

Die Website zeigt automatisch einen Platzhalter, wenn das Foto fehlt.
Sobald die Datei unter dem richtigen Namen in /images liegt, wird sie
automatisch verwendet.

SUPABASE
--------
1. Neues Supabase-Projekt erstellen.
2. SQL Editor öffnen.
3. Den kompletten Inhalt von supabase.sql ausführen.
4. Project Settings -> API öffnen.
5. Project URL und den öffentlichen anon/publishable Key kopieren.
6. In script.js nur diese beiden Variablen eintragen:

const SUPABASE_URL = "https://....supabase.co";
const SUPABASE_ANON_KEY = "....";

NIEMALS den service_role Key in script.js eintragen.

RESERVIERUNGSLOGIK
------------------
Die Website ruft create_reservation(...) als Supabase RPC auf.
Die Funktion prüft:
- Mittwoch bis Samstag
- 18:00 bis 20:30
- 1–12 Personen
- Innen 56 Plätze / Terrasse 60 Plätze
- bereits reservierte Kapazität
- gleichzeitige Buchungen desselben Slots werden per Advisory Lock geschützt

WICHTIG
-------
Die aktuelle Version verwaltet Kapazität, nicht einzelne Tischnummern.
Wenn du später echte Tische wie "Tisch 1 = 2 Plätze", "Tisch 2 = 4 Plätze"
usw. verwalten willst, kann die Datenbank auf echte Tischzuweisung
erweitert werden.

MAILS
-----
Diese Version speichert die Reservierung in Supabase, verschickt aber
noch keine Bestätigungs-Mail. Dafür kann später eine Edge Function
(z. B. mit einem Maildienst) ergänzt werden.
