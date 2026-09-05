/* =========================================================
   MAISON BLUE — SUPABASE + UI
   ========================================================= */

/* 1) NUR DIESE BEIDEN WERTE ÄNDERN */
const SUPABASE_URL = "DEINE_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "DEIN_SUPABASE_ANON_ODER_PUBLISHABLE_KEY";

/* 2) Supabase Client */
const supabaseReady =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("DEINE_") &&
  !SUPABASE_ANON_KEY.includes("DEIN_");

const supabaseClient = supabaseReady
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/* ---------- UI ---------- */
const $ = (selector) => document.querySelector(selector);

const menuToggle = $(".menu-toggle");
const mobileNav = $(".mobile-nav");

menuToggle?.addEventListener("click", () => {
  const open = mobileNav.classList.toggle("open");
  mobileNav.setAttribute("aria-hidden", String(!open));
  menuToggle.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".mobile-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileNav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

/* Scroll reveal */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

/* Minimum date = today */
const dateInput = $("#reservationDate");
if (dateInput) {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString().split("T")[0];
  dateInput.min = localDate;
}

/* ---------- Reservation ---------- */

const form = $("#reservationForm");
const messageBox = $("#reservationMessage");
const submitButton = $("#reservationSubmit");

function showMessage(message, type = "") {
  messageBox.textContent = message;
  messageBox.className = `form-message ${type}`;
}

function getFormData() {
  const data = new FormData(form);
  return {
    reservation_date: data.get("reservation_date"),
    reservation_time: data.get("reservation_time"),
    party_size: Number(data.get("party_size")),
    seating_area: data.get("seating_area"),
    guest_name: data.get("guest_name")?.trim(),
    email: data.get("email")?.trim(),
    phone: data.get("phone")?.trim(),
    notes: data.get("notes")?.trim() || null
  };
}

async function submitReservation(event) {
  event.preventDefault();
  showMessage("");

  if (!form.reportValidity()) return;

  if (!supabaseClient) {
    showMessage(
      "Supabase ist noch nicht eingerichtet. Trage in script.js SUPABASE_URL und SUPABASE_ANON_KEY ein.",
      "error"
    );
    return;
  }

  const reservation = getFormData();

  submitButton.disabled = true;
  submitButton.textContent = "Verfügbarkeit wird geprüft …";

  try {
    /*
      Die RPC-Funktion wird in supabase.sql erstellt.
      Sie prüft Kapazität + legt die Reservierung atomar an.
      Dadurch entstehen bei gleichzeitigem Absenden keine einfachen
      Doppelbuchungen durch einen Race Condition.
    */
    const { data, error } = await supabaseClient.rpc("create_reservation", {
      p_reservation_date: reservation.reservation_date,
      p_reservation_time: reservation.reservation_time,
      p_party_size: reservation.party_size,
      p_seating_area: reservation.seating_area,
      p_guest_name: reservation.guest_name,
      p_email: reservation.email,
      p_phone: reservation.phone,
      p_notes: reservation.notes
    });

    if (error) throw error;

    if (!data?.success) {
      showMessage(
        data?.message || "Zu diesem Zeitpunkt ist leider keine ausreichende Kapazität verfügbar.",
        "error"
      );
      return;
    }

    showMessage(
      "Ihre Reservierung wurde erfolgreich aufgenommen. Wir freuen uns auf Ihren Besuch!",
      "success"
    );

    form.reset();
    dateInput.min = new Date().toISOString().split("T")[0];

  } catch (error) {
    console.error(error);
    showMessage(
      "Die Reservierung konnte gerade nicht gespeichert werden. Bitte versuchen Sie es erneut oder rufen Sie uns an.",
      "error"
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Verfügbarkeit prüfen & reservieren";
  }
}

form?.addEventListener("submit", submitReservation);

/* ---------- Optional: Bild-Platzhalter ---------- */
/*
  Sobald du echte Fotos in /images legst, kannst du entweder die
  CSS-Datei direkt mit background-image befüllen oder hier automatisch
  die Platzhalter ersetzen.
*/
document.querySelectorAll("[data-photo]").forEach((el) => {
  const file = el.dataset.photo;
  const image = new Image();

  image.onload = () => {
    el.style.backgroundImage = `url("images/${file}")`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
    el.classList.remove("image-placeholder");
    const label = el.querySelector("span");
    if (label) label.style.display = "none";
  };

  image.src = `images/${file}`;
});
