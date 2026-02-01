const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwP2q_JB6qOcVcmJnv2amul2ClL0bKgaSYeal4XwKdGiitGxItATgZQYmtmBFQtYw0/exec";

document.addEventListener("DOMContentLoaded", () => {
  let timer_ = new Date("2026-10-12T16:00:00").getTime() / 1000;
  let flipdown = new FlipDown(timer_);
  flipdown.start();
  flipdown.ifEnded(() => {
    document.querySelector(".flipdown").innerHTML = `<h2>Timer end</h2>`;
  });

  // Load data saat halaman dimuat
  loadRSVPData();

  // Auto-refresh setiap 30 detik
  setInterval(() => {
    loadRSVPData();
  }, 30000); // 30000 ms = 30 detik
});

function scrollToTop() {
  const container = document.getElementById("submittedData");
  if (container) {
    container.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}

// Fungsi untuk memuat data dari Google Sheets
async function loadRSVPData() {
  const container = document.getElementById("submittedData");

  // Pastikan element ada
  if (!container) {
    console.error("Element #submittedData tidak ditemukan");
    return;
  }

  try {
    console.log("Loading data dari Google Sheets...");
    const response = await fetch(
      GOOGLE_SCRIPT_URL + "?timestamp=" + new Date().getTime(),
    );
    const result = await response.json();

    console.log("Data diterima:", result);

    if (result.status === "success" && result.data) {
      displayRSVPData(result.data);
    } else {
      console.warn("Data tidak valid atau kosong");
      showEmptyState();
    }
  } catch (error) {
    console.error("Error loading data:", error);
    showEmptyState();
  }
}

// Fungsi untuk menampilkan data RSVP
function displayRSVPData(data) {
  const container = document.getElementById("submittedData");

  if (!container) return;

  container.innerHTML = "";

  // Cek jika data kosong
  if (!data || data.length === 0) {
    showEmptyState();
    return;
  }

  // Tampilkan data terbaru terlebih dahulu (reverse)
  const reversedData = [...data].reverse();

  reversedData.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("rsvp-card");

    const statusClass = item.attendance === "Hadir" ? "hadir" : "tidak-hadir";

    // Format timestamp
    let timeString = "Baru saja";
    if (item.timestamp) {
      try {
        timeString = new Date(item.timestamp).toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        console.error("Error formatting date:", e);
      }
    }

    card.innerHTML = `
      <div class="rsvp-header">
        <strong>${item.name || "Anonymous"}</strong>
        <span class="status ${statusClass}">${item.attendance || "Hadir"}</span>
      </div>
      <p class="rsvp-message">${item.message || ""}</p>
      <small class="rsvp-time">${timeString}</small>
    `;

    container.appendChild(card);
  });

  console.log(`Menampilkan ${reversedData.length} data`);
}

// Fungsi untuk menampilkan state kosong
function showEmptyState() {
  const container = document.getElementById("submittedData");
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <p>Belum ada ucapan. Jadilah yang pertama! 💌</p>
    </div>
  `;
}

// Fungsi untuk mengirim data ke Google Sheets
document.addEventListener("DOMContentLoaded", () => {
  const rsvpForm = document.getElementById("rsvpForm");

  if (!rsvpForm) {
    console.error("Element #rsvpForm tidak ditemukan");
    return;
  }

  rsvpForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nameInput = document.getElementById("name");
    const attendanceInput = document.querySelector(
      'input[name="attendance"]:checked',
    );
    const messageInput = document.getElementById("message");

    // Validasi input
    if (!nameInput || !attendanceInput || !messageInput) {
      alert("Mohon lengkapi semua field!");
      return;
    }

    const name = nameInput.value.trim();
    const attendance = attendanceInput.value;
    const message = messageInput.value.trim();

    if (!name || !message) {
      alert("Mohon lengkapi semua field!");
      return;
    }

    // Data yang akan dikirim
    const formData = {
      name: name,
      attendance: attendance,
      message: message,
    };

    // Tampilkan loading
    const submitButton = e.target.querySelector('button[type="submit"]');
    if (!submitButton) return;

    const originalText = submitButton.textContent;
    submitButton.textContent = "Mengirim...";
    submitButton.disabled = true;

    try {
      console.log("Mengirim data:", formData);

      // Kirim data ke Google Sheets
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Reset form SEGERA setelah kirim
      rsvpForm.reset();

      // Tampilkan notifikasi sukses
      showSuccessNotification("Terima kasih! Ucapan Anda telah terkirim. ✨");

      // Refresh data dengan delay minimal (300ms memberi waktu Google Sheets update)
      setTimeout(() => {
        loadRSVPData();
        scrollToTop();
      }, 300);
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      // Kembalikan tombol submit dengan delay kecil
      setTimeout(() => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }, 300);
    }
  });
});

// ✅ TAMBAHKAN FUNGSI INI (FUNGSI YANG HILANG)
function showSuccessNotification(message) {
  // Buat element notifikasi
  const notification = document.createElement("div");
  notification.className = "success-notification";
  notification.textContent = message;

  // Tambahkan ke body
  document.body.appendChild(notification);

  // Hapus setelah 3 detik
  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

const audio = document.getElementById("myAudio");
const playButton = document.getElementById("playButton");

playButton.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    playButton.classList.add("playing");
    playButton.classList.remove("paused");
  } else {
    audio.pause();
    playButton.classList.add("paused");
    playButton.classList.remove("playing");
  }
});

let slideIndex = 1;

function showSlide(n) {
  let i;
  let slides = document.querySelectorAll(".mySlide");

  if (n > slides.length) {
    slideIndex = 1;
  } else if (n < 1) {
    slideIndex = slides.length;
  }

  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  slides[slideIndex - 1].style.display = "block";
}

showSlide(slideIndex);

function plusSlide(n) {
  showSlide((slideIndex += n));
}

let currentModalIndex = 0;
let autoplayInterval = null;
let isAutoplayRunning = false;
let modalImages = [];

// Fungsi untuk membuka modal
function openModal(image) {
  const modal = document.getElementById("imageModal");
  const slides = document.querySelectorAll(".mySlide img");

  // Simpan semua gambar ke array
  modalImages = Array.from(slides);

  // Cari indeks gambar yang diklik
  currentModalIndex = modalImages.findIndex((img) => img.src === image.src);

  // Tampilkan modal
  modal.style.display = "block";

  // Generate thumbnails
  generateThumbnails();

  // Tampilkan gambar
  showModalImage(currentModalIndex);
}

// Fungsi untuk menutup modal
function closeModal() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "none";
  stopAutoplay();
}

// Fungsi untuk menampilkan gambar di modal
function showModalImage(index) {
  const modalImg = document.getElementById("modalImage");
  const captionText = document.getElementById("caption");

  // Update gambar
  modalImg.src = modalImages[index].src;
  captionText.innerHTML = modalImages[index].alt;

  // Update active thumbnail
  updateActiveThumbnail(index);
}

// Fungsi untuk navigasi gambar
function changeModalSlide(direction) {
  currentModalIndex += direction;

  // Loop ke awal/akhir
  if (currentModalIndex >= modalImages.length) {
    currentModalIndex = 0;
  } else if (currentModalIndex < 0) {
    currentModalIndex = modalImages.length - 1;
  }

  showModalImage(currentModalIndex);
}

// Generate thumbnails
function generateThumbnails() {
  const container = document.getElementById("thumbnailContainer");
  container.innerHTML = "";

  modalImages.forEach((img, index) => {
    const thumb = document.createElement("img");
    thumb.src = img.src;
    thumb.classList.add("thumbnail");
    thumb.onclick = () => {
      currentModalIndex = index;
      showModalImage(index);
    };
    container.appendChild(thumb);
  });
}

// Update active thumbnail
function updateActiveThumbnail(index) {
  const thumbnails = document.querySelectorAll(".thumbnail");
  thumbnails.forEach((thumb, i) => {
    if (i === index) {
      thumb.classList.add("active");
    } else {
      thumb.classList.remove("active");
    }
  });
}

// Toggle autoplay
// Toggle autoplay
function toggleAutoplay() {
  const playIcon = document.getElementById("playIcon");

  if (isAutoplayRunning) {
    stopAutoplay();
    playIcon.textContent = "▶";
  } else {
    startAutoplay();
    playIcon.textContent = "⏸";
  }
}

// Start autoplay
function startAutoplay() {
  isAutoplayRunning = true;
  autoplayInterval = setInterval(() => {
    changeModalSlide(1);
  }, 3000); // Ganti gambar setiap 3 detik
}

// Stop autoplay
function stopAutoplay() {
  isAutoplayRunning = false;
  if (autoplayInterval) {
    clearInterval(autoplayInterval);
    autoplayInterval = null;
  }
}

// Toggle fullscreen
function toggleFullscreen() {
  const modal = document.getElementById("imageModal");
  const modalControls = document.querySelector(".modal-controls");

  if (!document.fullscreenElement) {
    modal.requestFullscreen().catch((err) => {
      console.log(`Error attempting to enable fullscreen: ${err.message}`);
    });
    // Sembunyikan thumbnail dan caption saat fullscreen
    modal.classList.add("fullscreen-mode");
    if (modalControls) {
      modalControls.style.display = "none";
    }
  } else {
    document.exitFullscreen();
    // Tampilkan kembali thumbnail dan caption
    modal.classList.remove("fullscreen-mode");
    if (modalControls) {
      modalControls.style.display = "block";
    }
  }
}

// Event listener untuk mendeteksi perubahan fullscreen
document.addEventListener("fullscreenchange", () => {
  const modal = document.getElementById("imageModal");
  const modalControls = document.querySelector(".modal-controls");

  if (!document.fullscreenElement) {
    modal.classList.remove("fullscreen-mode");
    if (modalControls) {
      modalControls.style.display = "block";
    }
  }
});

// Tutup modal saat klik di luar gambar
window.onclick = function (event) {
  const modal = document.getElementById("imageModal");
  if (event.target == modal) {
    closeModal();
  }
};

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  const modal = document.getElementById("imageModal");
  if (modal.style.display === "block") {
    if (e.key === "ArrowLeft") {
      changeModalSlide(-1);
    } else if (e.key === "ArrowRight") {
      changeModalSlide(1);
    } else if (e.key === "Escape") {
      closeModal();
    }
  }
});
