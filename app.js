// ============================================================
// SUKET AKTIF KULIAH - FRONTEND
// Poltekkes Kemenkes Makassar
// ============================================================


// ============================================================
// API
// ============================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbwzqcOz3LlYdZye-XRg1FxHv1xPVm2D6KF32ZEMIRFjQjBZNCgEeTvuvtthaXl-mg/exec";


// ============================================================
// STATE
// ============================================================

let currentPage = 1;

const pageSize = 10;

let currentKeyword = "";


// ============================================================
// DOM READY
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    setupNIM();

    setupForm();

    setupSearch();

    setupPagination();

    // ==========================================
    // OPTIMASI:
    // Sebelumnya 3 request:
    // loadMasterData()
    // loadTotalData()
    // loadData()
    //
    // Sekarang cukup 1 request:
    // loadInitialData()
    // ==========================================

    loadInitialData();

  }
);


// ============================================================
// API REQUEST
// ============================================================

async function apiRequest(
  action,
  data = {}
) {

  const response =
    await fetch(
      API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body:
          JSON.stringify({
            action:
              action,

            ...data
          })
      }
    );


  if (!response.ok) {

    throw new Error(
      "HTTP Error " +
      response.status
    );

  }


  const result =
    await response.json();


  if (
    result &&
    result.success === false &&
    result.error
  ) {

    throw new Error(
      result.error
    );

  }


  return result;

}


// ============================================================
// LOAD INITIAL DATA
// ============================================================
// 1 REQUEST untuk:
// - Master Prodi
// - Master Program
// - Master Jurusan
// - Semester
// - Total Data
// - Data tabel
// ============================================================

async function loadInitialData() {

  try {

    showLoading(
      true,
      "Memuat data..."
    );


    const result =
      await apiRequest(
        "getInitialData",
        {
          search:
            "",

          page:
            1,

          pageSize:
            pageSize
        }
      );


    // ==========================================
    // MASTER PRODI
    // ==========================================

    populateSelect(
      "prodi",
      result.prodi || [],
      "Pilih Prodi"
    );


    // ==========================================
    // MASTER PROGRAM
    // ==========================================

    populateSelect(
      "program",
      result.program || [],
      "Pilih Program"
    );


    // ==========================================
    // MASTER JURUSAN
    // ==========================================

    populateSelect(
      "jurusan",
      result.jurusan || [],
      "Pilih Jurusan"
    );


    // ==========================================
    // MASTER SEMESTER
    // ==========================================

    populateSelect(
      "semester",
      result.semester || [],
      "Pilih Semester"
    );


    // ==========================================
    // TOTAL DATA
    // ==========================================

    const totalElement =
      document.getElementById(
        "totalData"
      );


    if (totalElement) {

      totalElement.textContent =
        result.total || 0;

    }


    // ==========================================
    // PAGE
    // ==========================================

    currentPage =
      Number(
        result.page || 1
      );


    // ==========================================
    // TABLE
    // ==========================================

    renderTable(
      result
    );


    // ==========================================
    // PAGINATION
    // ==========================================

    updatePagination(
      result
    );

  }

  catch (error) {

    console.error(
      "Gagal memuat data awal:",
      error
    );


    showToast(
      error.message ||
      "Data awal gagal dimuat.",
      "error"
    );

  }

  finally {

    showLoading(
      false
    );

  }

}


// ============================================================
// NIM
// ============================================================

function setupNIM() {

  const input =
    document.getElementById(
      "nim"
    );


  if (!input) return;


  input.value =
    "PO71";


  input.addEventListener(
    "input",
    function () {

      let value =
        this.value
          .toUpperCase();


      // Hilangkan semua karakter
      // selain PO71 dan angka

      if (
        !value.startsWith("PO71")
      ) {

        value =
          "PO71" +
          value.replace(
            /[^0-9]/g,
            ""
          );

      }


      const digits =
        value
          .substring(4)
          .replace(
            /[^0-9]/g,
            ""
          )
          .substring(0, 10);


      this.value =
        "PO71" +
        digits;

    }
  );

}


// ============================================================
// FORM
// ============================================================

function setupForm() {

  const form =
    document.getElementById(
      "mahasiswaForm"
    );


  if (!form) return;


  form.addEventListener(
    "submit",
    submitForm
  );

}


// ============================================================
// SUBMIT FORM
// ============================================================

async function submitForm(
  event
) {

  event.preventDefault();


  const form =
    event.target;


  const nim =
    document
      .getElementById("nim")
      .value
      .trim()
      .toUpperCase();


  const nama =
    document
      .getElementById("nama")
      .value
      .trim();


  const tempatLahir =
    document
      .getElementById("tempatLahir")
      .value
      .trim();


  const tanggalLahir =
    document
      .getElementById("tanggalLahir")
      .value;


  const prodi =
    document
      .getElementById("prodi")
      .value;


  const program =
    document
      .getElementById("program")
      .value;


  const jurusan =
    document
      .getElementById("jurusan")
      .value;


  const semester =
    document
      .getElementById("semester")
      .value;


  // ----------------------------------------------------------
  // VALIDASI NIM
  // ----------------------------------------------------------

  if (
    !/^PO71[0-9]{10}$/.test(
      nim
    )
  ) {

    showToast(
      "NIM harus PO71 + 10 digit angka.",
      "error"
    );

    return;

  }


  // ----------------------------------------------------------
  // VALIDASI
  // ----------------------------------------------------------

  if (
    !nama ||
    !tempatLahir ||
    !tanggalLahir ||
    !prodi ||
    !program ||
    !jurusan ||
    !semester
  ) {

    showToast(
      "Semua data wajib diisi.",
      "error"
    );

    return;

  }


  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  showLoading(
    true,
    "Menyimpan data dan membuat surat..."
  );


  try {

    const result =
      await apiRequest(
        "saveMahasiswa",
        {
          data: {

            nim:
              nim,

            nama:
              nama,

            tempat:
              tempatLahir,

            tanggalLahir:
              tanggalLahir,

            prodi:
              prodi,

            program:
              program,

            jurusan:
              jurusan,

            semester:
              semester

          }

        }
      );


    // --------------------------------------------------------
    // DUPLIKAT
    // --------------------------------------------------------

    if (
      result.duplicate
    ) {

      showToast(
        result.message,
        "error"
      );

      return;

    }


    // --------------------------------------------------------
    // BERHASIL
    // --------------------------------------------------------

    if (
      result.success
    ) {

      showResultModal(
        result
      );


      form.reset();


      const nimInput =
        document.getElementById(
          "nim"
        );


      if (nimInput) {

        nimInput.value =
          "PO71";

      }


      // ========================================
      // REFRESH TOTAL + TABLE
      // ========================================

      await loadTotalData();

      await loadData();

    }


  }

  catch (error) {

    console.error(
      error
    );


    showToast(
      error.message ||
      "Terjadi kesalahan.",
      "error"
    );


  }

  finally {

    showLoading(
      false
    );

  }

}


// ============================================================
// LOAD MASTER DATA
// ============================================================
// Tetap dipertahankan untuk kompatibilitas.
// Tidak dipanggil saat initial loading.
// ============================================================

async function loadMasterData() {

  try {

    const data =
      await apiRequest(
        "getMasterOptions"
      );


    populateSelect(
      "prodi",
      data.prodi || [],
      "Pilih Prodi"
    );


    populateSelect(
      "program",
      data.program || [],
      "Pilih Program"
    );


    populateSelect(
      "jurusan",
      data.jurusan || [],
      "Pilih Jurusan"
    );


    populateSelect(
      "semester",
      data.semester || [],
      "Pilih Semester"
    );


  }

  catch (error) {

    console.error(
      "Gagal memuat master:",
      error
    );


    showToast(
      "Master data gagal dimuat.",
      "error"
    );

  }

}


// ============================================================
// POPULATE SELECT
// ============================================================

function populateSelect(
  elementId,
  items,
  placeholder
) {

  const select =
    document.getElementById(
      elementId
    );


  if (!select) return;


  select.innerHTML =
    "";


  const defaultOption =
    document.createElement(
      "option"
    );


  defaultOption.value =
    "";


  defaultOption.textContent =
    placeholder;


  select.appendChild(
    defaultOption
  );


  if (
    !Array.isArray(items)
  ) return;


  items.forEach(
    function (item) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        item;


      option.textContent =
        item;


      select.appendChild(
        option
      );

    }
  );

}


// ============================================================
// LOAD TOTAL
// ============================================================

async function loadTotalData() {

  try {

    const result =
      await apiRequest(
        "getTotalData"
      );


    const element =
      document.getElementById(
        "totalData"
      );


    if (element) {

      element.textContent =
        result.total || 0;

    }

  }

  catch (error) {

    console.error(
      error
    );

  }

}


// ============================================================
// LOAD DATA
// ============================================================

async function loadData() {

  try {

    const result =
      await apiRequest(
        "getMahasiswaData",
        {
          search:
            currentKeyword,

          page:
            currentPage,

          pageSize:
            pageSize

        }
      );


    renderTable(
      result
    );


    updatePagination(
      result
    );


  }

  catch (error) {

    console.error(
      error
    );


    showToast(
      "Data mahasiswa gagal dimuat.",
      "error"
    );

  }

}


// ============================================================
// RENDER TABLE
// ============================================================

function renderTable(
  result
) {

  const head =
    document.getElementById(
      "tableHead"
    );


  const body =
    document.getElementById(
      "tableBody"
    );


  if (!head || !body)
    return;


  head.innerHTML =
    "";


  body.innerHTML =
    "";


  const headers =
    result.headers || [];


  headers.forEach(
    function (header) {

      const th =
        document.createElement(
          "th"
        );


      th.textContent =
        header;


      head.appendChild(
        th
      );

    }
  );


  const rows =
    result.rows || [];


  if (
    rows.length === 0
  ) {

    const tr =
      document.createElement(
        "tr"
      );


    const td =
      document.createElement(
        "td"
      );


    td.colSpan =
      headers.length || 1;


    td.textContent =
      "Belum ada data.";


    td.style.textAlign =
      "center";


    tr.appendChild(
      td
    );


    body.appendChild(
      tr
    );


    return;

  }


  rows.forEach(
    function (row) {

      const tr =
        document.createElement(
          "tr"
        );


      row.forEach(
        function (
          value,
          index
        ) {

          const td =
            document.createElement(
              "td"
            );


          if (
            headers[index] ===
            "DRAFT SUKET" &&
            value
          ) {

            td.innerHTML =
              createDraftButton(
                value
              );

          }

          else {

            td.textContent =
              value || "-";

          }


          tr.appendChild(
            td
          );

        }
      );


      body.appendChild(
        tr
      );

    }
  );

}


// ============================================================
// CREATE DRAFT BUTTON
// ============================================================

function createDraftButton(
  url
) {

  if (!url) {

    return "-";

  }


  const match =
    url.match(
      /\/d\/([a-zA-Z0-9_-]+)/
    );


  if (!match) {

    return `
      <a
        href="${escapeHtml(url)}"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-draft"
      >
        📄 Buka Draft
      </a>
    `;

  }


  const docId =
    match[1];


  const pdfUrl =
    "https://docs.google.com/document/d/" +
    docId +
    "/export?format=pdf";


  return `
    <div class="draft-actions">

      <a
        href="${escapeHtml(url)}"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-draft"
      >
        📄 Draft
      </a>

      <a
        href="${pdfUrl}"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-pdf"
      >
        PDF
      </a>

    </div>
  `;

}


// ============================================================
// PAGINATION
// ============================================================

function setupPagination() {

  const prev =
    document.getElementById(
      "prevButton"
    );


  const next =
    document.getElementById(
      "nextButton"
    );


  if (prev) {

    prev.addEventListener(
      "click",
      function () {

        if (
          currentPage > 1
        ) {

          currentPage--;

          loadData();

        }

      }
    );

  }


  if (next) {

    next.addEventListener(
      "click",
      function () {

        currentPage++;

        loadData();

      }
    );

  }

}


// ============================================================
// UPDATE PAGINATION
// ============================================================

function updatePagination(
  result
) {

  const prev =
    document.getElementById(
      "prevButton"
    );


  const next =
    document.getElementById(
      "nextButton"
    );


  const info =
    document.getElementById(
      "paginationInfo"
    );


  const totalPages =
    Number(
      result.totalPages || 0
    );


  if (prev) {

    prev.disabled =
      currentPage <= 1;

  }


  if (next) {

    next.disabled =
      totalPages === 0 ||
      currentPage >=
      totalPages;

  }


  if (info) {

    info.textContent =
      totalPages === 0
        ? "0 / 0"
        : currentPage +
          " / " +
          totalPages;

  }

}


// ============================================================
// SEARCH
// ============================================================

function setupSearch() {

  const input =
    document.getElementById(
      "searchInput"
    );


  if (!input) return;


  let searchTimer;


  input.addEventListener(
    "input",
    function () {

      clearTimeout(
        searchTimer
      );


      searchTimer =
        setTimeout(
          function () {

            currentKeyword =
              input.value.trim();


            currentPage =
              1;


            loadData();

          },
          300
        );

    }
  );

}


// ============================================================
// RESULT MODAL
// ============================================================

function showResultModal(
  result
) {

  const modal =
    document.getElementById(
      "resultModal"
    );


  const text =
    document.getElementById(
      "resultText"
    );


  const draftLink =
    document.getElementById(
      "draftLink"
    );


  const pdfLink =
    document.getElementById(
      "pdfLink"
    );


  if (!modal)
    return;


  if (text) {

    text.textContent =
      result.message ||
      "Data berhasil disimpan.";

  }


  if (
    draftLink &&
    result.draftUrl
  ) {

    draftLink.href =
      result.draftUrl;


    draftLink.style.display =
      "inline-flex";

  }


  if (
    pdfLink &&
    result.pdfUrl
  ) {

    pdfLink.href =
      result.pdfUrl;


    pdfLink.style.display =
      "inline-flex";

  }


  modal.classList.add(
    "show"
  );

}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeResultModal() {

  const modal =
    document.getElementById(
      "resultModal"
    );


  if (modal) {

    modal.classList.remove(
      "show"
    );

  }

}


// ============================================================
// LOADING
// ============================================================

function showLoading(
  show,
  message = "Memproses..."
) {

  const overlay =
    document.getElementById(
      "loadingOverlay"
    );


  if (!overlay)
    return;


  const text =
    overlay.querySelector(
      ".loading-text"
    );


  if (text) {

    text.textContent =
      message;

  }


  if (show) {

    overlay.classList.add(
      "show"
    );

  }

  else {

    overlay.classList.remove(
      "show"
    );

  }

}


// ============================================================
// TOAST
// ============================================================

function showToast(
  message,
  type = "success"
) {

  const toast =
    document.getElementById(
      "toast"
    );


  if (!toast)
    return;


  toast.textContent =
    message;


  toast.className =
    "toast " +
    type;


  toast.classList.add(
    "show"
  );


  setTimeout(
    function () {

      toast.classList.remove(
        "show"
      );

    },
    4000
  );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(
  value
) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


// ============================================================
// MODAL EVENT
// ============================================================

document.addEventListener(
  "click",
  function (event) {

    if (
      event.target.matches(
        "[data-close-modal]"
      )
    ) {

      closeResultModal();

    }

  }
);
