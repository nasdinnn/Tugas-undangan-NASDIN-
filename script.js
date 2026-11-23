
const pembuka = document.getElementById("pembuka");
const isiUndangan = document.getElementById("isiUndangan");
const tombolBuka = document.getElementById("bukaUndangan");
const musikLatar = document.getElementById("musikLatar");
const kontrolMusik = document.getElementById("kontrolMusik");
const ikonMusik = document.getElementById("ikonMusik");
const teksKontrolMusik = document.getElementById("teksKontrolMusik");
let spotifyController = null;
let spotifyApiDimuat = false;
let undanganTerbuka = false;

function bukaUndangan() {
    tombolBuka.disabled = true;
    pembuka.classList.add("tutup");
    undanganTerbuka = true;

    if (spotifyController) {
        spotifyController.play();
    }

    window.setTimeout(() => {
        pembuka.style.display = "none";
        isiUndangan.classList.add("tampil");
        window.scrollTo({ top: 0, behavior: "smooth" });
        kontrolMusik.hidden = false;
    }, 650);
}

tombolBuka.addEventListener("click", bukaUndangan);

function muatSpotifyPlayer() {
    if (spotifyApiDimuat) {
        return;
    }

    spotifyApiDimuat = true;
    window.onSpotifyIframeApiReady = (spotifyIframeApi) => {
        spotifyIframeApi.createController(
            musikLatar,
            {
                uri: "spotify:track:3ZJxullGStPQOZr4s3claO",
                width: "1px",
                height: 1
            },
            (controller) => {
                spotifyController = controller;
                kontrolMusik.disabled = false;
                controller.addListener("playback_update", (event) => {
                    const sedangDiputar = !event.data.isPaused;
                    ikonMusik.textContent = sedangDiputar ? "❚❚" : "▶";
                    teksKontrolMusik.textContent = sedangDiputar
                        ? "Jeda musik"
                        : "Putar musik";
                    kontrolMusik.setAttribute(
                        "aria-label",
                        sedangDiputar ? "Jeda musik" : "Putar musik"
                    );
                    kontrolMusik.setAttribute(
                        "aria-pressed",
                        String(sedangDiputar)
                    );
                });

                if (undanganTerbuka) {
                    controller.play();
                }
            }
        );
    };

    const scriptSpotify = document.createElement("script");
    scriptSpotify.src = "https://open.spotify.com/embed/iframe-api/v1";
    scriptSpotify.async = true;
    scriptSpotify.onerror = () => {
        spotifyApiDimuat = false;
        tampilkanToast("Pemutar Spotify gagal dimuat. Periksa koneksi internet.");
    };
    document.head.appendChild(scriptSpotify);
}

kontrolMusik.addEventListener("click", () => {
    if (!spotifyController) {
        tampilkanToast("Pemutar Spotify sedang disiapkan. Coba lagi sebentar.");
        return;
    }

    spotifyController.togglePlay();
});

const params = new URLSearchParams(window.location.search);
const namaTamu = params.get("to");

if (namaTamu) {
    const namaTamuElement = document.getElementById("namaTamu");
    namaTamuElement.textContent = namaTamu.trim();
}

const tanggalAcara = new Date("2027-01-03T10:00:00+07:00");

function perbaruiCountdown() {
    const sekarang = new Date();
    let selisih = tanggalAcara.getTime() - sekarang.getTime();

    if (selisih <= 0) {
        document.getElementById("hari").textContent = "0";
        document.getElementById("jam").textContent = "0";
        document.getElementById("menit").textContent = "0";
        document.getElementById("detik").textContent = "0";
        document.querySelector(".hitungan-mundur h3").textContent =
            "Acara Sedang Berlangsung";
        return;
    }

    const hari = Math.floor(selisih / 86400000);
    selisih %= 86400000;
    const jam = Math.floor(selisih / 3600000);
    selisih %= 3600000;
    const menit = Math.floor(selisih / 60000);
    const detik = Math.floor((selisih % 60000) / 1000);

    document.getElementById("hari").textContent = String(hari);
    document.getElementById("jam").textContent = String(jam).padStart(2, "0");
    document.getElementById("menit").textContent = String(menit).padStart(2, "0");
    document.getElementById("detik").textContent = String(detik).padStart(2, "0");
}

perbaruiCountdown();
setInterval(perbaruiCountdown, 1000);

const toast = document.createElement("div");
toast.className = "toast";
toast.setAttribute("role", "status");
toast.setAttribute("aria-live", "polite");
document.body.appendChild(toast);

let toastTimer;

function tampilkanToast(pesan) {
    toast.textContent = pesan;
    toast.classList.add("tampil");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("tampil");
    }, 2500);
}

async function salinTeks(teks, pesanBerhasil) {
    try {
        await navigator.clipboard.writeText(teks);
        tampilkanToast(pesanBerhasil);
    } catch (error) {
        const areaTeks = document.createElement("textarea");
        areaTeks.value = teks;
        areaTeks.style.position = "fixed";
        areaTeks.style.opacity = "0";
        document.body.appendChild(areaTeks);
        areaTeks.select();
        const berhasil = document.execCommand("copy");
        areaTeks.remove();
        tampilkanToast(
            berhasil ? pesanBerhasil : "Gagal menyalin. Silakan salin secara manual."
        );
    }
}

document.querySelectorAll("[data-salin]").forEach((tombol) => {
    tombol.addEventListener("click", () => {
        const elemen = document.getElementById(tombol.dataset.salin);
        const teks = elemen.textContent.trim();
        const pesan =
            tombol.dataset.salin === "nomorDana"
                ? "Nomor DANA berhasil disalin!"
                : "Alamat kado berhasil disalin!";
        salinTeks(teks, pesan);
    });
});

const fotoGaleri = document.querySelectorAll(".foto-galeri");

if ("IntersectionObserver" in window) {
    const observerGaleri = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("tampil");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    fotoGaleri.forEach((foto) => observerGaleri.observe(foto));
} else {
    fotoGaleri.forEach((foto) => foto.classList.add("tampil"));
}

const STORAGE_UCAPAN = "bukuTamuUndangan";
const formUcapan = document.getElementById("formUcapan");
const daftarUcapan = document.getElementById("daftarUcapan");

function bacaUcapan() {
    try {
        const ucapan = JSON.parse(localStorage.getItem(STORAGE_UCAPAN)) || [];
        return Array.isArray(ucapan) ? ucapan : [];
    } catch (error) {
        console.warn("Data buku tamu tidak dapat dibaca:", error);
        return [];
    }
}

function tampilkanUcapan() {
    const ucapan = bacaUcapan();
    daftarUcapan.replaceChildren();

    if (!ucapan.length) {
        const pesanKosong = document.createElement("p");
        pesanKosong.className = "ucapan-kosong";
        pesanKosong.textContent = "Belum ada ucapan.";
        daftarUcapan.appendChild(pesanKosong);
        return;
    }

    ucapan.forEach((item) => {
        const kartu = document.createElement("article");
        kartu.className = "ucapan-kartu";

        const nama = document.createElement("strong");
        nama.textContent = item.nama;

        const isi = document.createElement("p");
        isi.textContent = item.ucapan;

        const waktu = document.createElement("small");
        waktu.textContent = item.waktu;

        kartu.append(nama, isi, waktu);
        daftarUcapan.appendChild(kartu);
    });
}

formUcapan.addEventListener("submit", (event) => {
    event.preventDefault();

    const nama = document.getElementById("namaPengirim").value.trim();
    const isi = document.getElementById("isiUcapan").value.trim();

    if (!nama || !isi) {
        tampilkanToast("Nama dan ucapan wajib diisi.");
        return;
    }

    const ucapan = bacaUcapan();
    ucapan.unshift({
        nama,
        ucapan: isi,
        waktu: new Intl.DateTimeFormat("id-ID", {
            dateStyle: "medium",
            timeStyle: "short"
        }).format(new Date())
    });

    try {
        localStorage.setItem(STORAGE_UCAPAN, JSON.stringify(ucapan));
        formUcapan.reset();
        tampilkanUcapan();
        tampilkanToast("Ucapan berhasil dikirim!");
    } catch (error) {
        console.warn("Ucapan tidak dapat disimpan:", error);
        tampilkanToast("Ucapan gagal disimpan pada browser.");
    }
});

tampilkanUcapan();
muatSpotifyPlayer();
