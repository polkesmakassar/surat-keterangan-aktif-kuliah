// =========================================================
// SUKET AKTIF KULIAH
// POLTEKKES KEMENKES MAKASSAR
// APP.JS - VERSI OPTIMASI
// =========================================================


const API_URL =
  "https://script.google.com/macros/s/AKfycbwzqcOz3LlYdZye-XRg1FxHv1xPVm2D6KF32ZEMwxIRfJqjBZNCgEeTvuvtthaXl-mg/exec";


let currentPage = 1;

const pageSize = 10;

let currentKeyword = "";

let searchTimer = null;


// =========================================================
// DOM READY
// =========================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    setupNIM();

    setupForm();

    setupSearch();

    setupPagination();

    loadInitialData();

  }
);


// =========================================================
// API REQUEST
// =========================================================

async function apiRequest(
  action,
  data = {}
) {

  const payload = {

    action,

    ...data

  };


  const response =
    await fetch(
      API_URL,
      {

        method:
          "POST",

        headers: {

          "Content-Type":
            "text/plain;charset=utf-8"

        },

        body:
          JSON.stringify(
            payload
          )

      }
    );


  if (
    !response.ok
  ) {

    throw new Error(
      "Server mengembalikan HTTP " +
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

    const error =
      new Error(
        result.error
      );


    error.result =
      result;


    throw error;

  }


  return result;

}


// =========================================================
// INITIAL LOAD
// SATU REQUEST
// =========================================================

async function loadInitialData() {

  showLoading(
    true,
    "Memuat sistem..."
  );


  try {

    const result =
      await apiRequest(
        "getInitialData",
        {

          search: "",

          page: 1,

          pageSize

        }
      );


    // ------------------------------------------------------
    // MASTER
    // ------------------------------------------------------

    populateSelect(
      "prodi",
      result.master.prodi,
      "Pilih Program Studi"
    );


    populateSelect(
      "program",
      result.master.program,
      "Pilih Program"
    );


    populateSelect(
      "jurusan",
      result.master.jurusan,
      "Pilih Jurusan"
    );


    populateSelect(
      "semester",
      result.master.semester,
      "Pilih Semester"
    );


    // ------------------------------------------------------
    // TOTAL
    // ------------------------------------------------------

    updateTotalData(
      result.total
    );


    // ------------------------------------------------------
    // PAGE
    // ------------------------------------------------------

    currentPage =
      result.page || 1;


    // ------------------------------------------------------
    // TABLE
    // ------------------------------------------------------

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
      error.message ||
        "Gagal memuat data.",
      "error"
    );

  }

  finally {

    showLoading(
      false
    );

  }

}


// =========================================================
// NIM
// =========================================================

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
        input.value
          .toUpperCase()
          .replace(
            /[^A-Z0-9]/g,
            ""
          );


      if (
        !value.startsWith(
          "PO71"
        )
      ) {

        value =
          "PO71";

      }


      value =
        "PO71" +
        value
          .substring(4)
          .replace(
            /[^0-9]/g,
            ""
          )
          .slice(
            0,
            10
          );


      input.value =
        value;

    }
  );

}


// =========================================================
// FORM
// =========================================================

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


// =========================================================
// SUBMIT
// =========================================================

async function submitForm(
  event
) {

  event.preventDefault();


  const nim =
    document
      .getElementById(
        "nim"
      )
      .value
      .trim()
      .toUpperCase();


  const nama =
    document
      .getElementById(
        "nama"
      )
      .value
      .trim();


  // =======================================================
  // PERBAIKAN BUG
  // HTML MENGGUNAKAN id="tempat"
  // =======================================================

  const tempatLahir =
    document
      .getElementById(
        "tempat"
      )
      .value
      .trim();


  const tanggalLahir =
    document
      .getElementById(
        "tanggalLahir"
      )
      .value
      .trim();


  const prodi =
    document
      .getElementById(
        "prodi"
      )
      .value
      .trim();


  const program =
    document
      .getElementById(
        "program"
      )
      .value
      .trim();


  const jurusan =
    document
      .getElementById(
        "jurusan"
      )
      .value
      .trim();


  const semester =
    document
      .getElementById(
        "semester"
      )
      .value
      .trim();


  // =======================================================
  // VALIDASI
  // =======================================================

  if (
    !/^PO71[0-9]{10}$/.test(
      nim
    )
  ) {

    showToast(
      "NIM harus berformat PO71 + 10 digit angka.",
      "error"
    );

    return;

  }


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
      "Semua data mahasiswa wajib diisi.",
      "error"
    );

    return;

  }


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

            nim,

            nama,

            tempat:
              tempatLahir,

            tanggalLahir,

            prodi,

            program,

            jurusan,

            semester

          }

        }
      );


    // =====================================================
    // DUPLIKAT
    // =====================================================

    if (
      result &&
      result.duplicate
    ) {

      showToast(
        result.error ||
          "Data sudah terdaftar.",
        "error"
      );

      return;

    }


    // =====================================================
    // BERHASIL
    // =====================================================

    if (
      result &&
      result.success
    ) {

      showResultModal(
        result
      );


      const form =
        document.getElementById(
          "mahasiswaForm"
        );


      if (form) {

        form.reset();

      }


      const nimInput =
        document.getElementById(
          "nim"
        );


      if (nimInput) {

        nimInput.value =
          "PO71";

      }


      // ---------------------------------------------------
      // HANYA 1 REQUEST
      // loadData() sekarang sekaligus memperbarui total.
      // ---------------------------------------------------

      await loadData();

    }

    else {

      throw new Error(
        result?.error ||
          "Data gagal disimpan."
      );

    }

  }

  catch (error) {

    console.error(
      error
    );


    showToast(
      error.message ||
        "Terjadi kesalahan saat menyimpan data.",
      "error"
    );

  }

  finally {

    showLoading(
      false
    );

  }

}


// =========================================================
// POPULATE SELECT
// =========================================================

function populateSelect(
  elementId,
  options,
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


  defaultOption.disabled =
    false;


  defaultOption.selected =
    true;


  select.appendChild(
    defaultOption
  );


  (options || [])
    .forEach(
      function(value) {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          value;


        option.textContent =
          value;


        select.appendChild(
          option
        );

      }
    );

}


// =========================================================
// LOAD DATA
// =========================================================

async function loadData() {

  const result =
    await apiRequest(
      "getMahasiswaData",
      {

        search:
          currentKeyword,

        page:
          currentPage,

        pageSize

      }
    );


  // =======================================================
  // SEKALIGUS UPDATE TOTAL
  // Tidak perlu request getTotalData lagi.
  // =======================================================

  updateTotalData(
    result.total
  );


  currentPage =
    result.page || 1;


  renderTable(
    result
  );


  updatePagination(
    result
  );


  return result;

}


// =========================================================
// UPDATE TOTAL
// =========================================================

function updateTotalData(
  total
) {

  const element =
    document.getElementById(
      "totalData"
    );


  if (!element) return;


  element.textContent =
    Number(
      total || 0
    ).toLocaleString(
      "id-ID"
    );

}


// =========================================================
// LOAD TOTAL
// KOMPATIBILITAS
// =========================================================

async function loadTotalData() {

  const result =
    await apiRequest(
      "getTotalData"
    );


  updateTotalData(
    result.total
  );


  return result.total;

}


// =========================================================
// RENDER TABLE
// =========================================================

function renderTable(
  result
) {

  const tableHead =
    document.getElementById(
      "tableHead"
    );


  const tableBody =
    document.getElementById(
      "tableBody"
    );


  if (
    !tableHead ||
    !tableBody
  ) {

    return;

  }


  tableHead.innerHTML =
    "";


  tableBody.innerHTML =
    "";


  // =======================================================
  // HEADER
  // =======================================================

  const headerRow =
    document.createElement(
      "tr"
    );


  result.headers.forEach(
    function(header) {

      const th =
        document.createElement(
          "th"
        );


      th.textContent =
        header;


      headerRow.appendChild(
        th
      );

    }
  );


  tableHead.appendChild(
    headerRow
  );


  // =======================================================
  // DATA KOSONG
  // =======================================================

  if (
    !result.rows ||
    result.rows.length === 0
  ) {

    const row =
      document.createElement(
        "tr"
      );


    const cell =
      document.createElement(
        "td"
      );


    cell.colSpan =
      result.headers.length ||
      1;


    cell.className =
      "table-loading";


    cell.textContent =
      currentKeyword
        ? "Data tidak ditemukan."
        : "Belum ada data.";


    row.appendChild(
      cell
    );


    tableBody.appendChild(
      row
    );


    return;

  }


  // =======================================================
  // DATA
  // =======================================================

  result.rows.forEach(
    function(rowData) {

      const tr =
        document.createElement(
          "tr"
        );


      result.headers.forEach(
        function(header, index) {

          const td =
            document.createElement(
              "td"
            );


          const value =
            rowData[index] || "";


          if (
            header === "DRAFT SUKET" &&
            value
          ) {

            td.innerHTML =
              createDraftButton(
                value
              );

          }

          else {

            td.textContent =
              value;

          }


          tr.appendChild(
            td
          );

        }
      );


      tableBody.appendChild(
        tr
      );

    }
  );

}


// =========================================================
// DRAFT BUTTON
// =========================================================

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


// =========================================================
// PAGINATION
// =========================================================

function setupPagination() {

  const prevButton =
    document.getElementById(
      "prevButton"
    );


  const nextButton =
    document.getElementById(
      "nextButton"
    );


  if (prevButton) {

    prevButton.addEventListener(
      "click",
      async function () {

        if (
          currentPage <= 1
        ) {

          return;

        }


        currentPage--;


        try {

          await loadData();

        }

        catch (error) {

          console.error(
            error
          );


          showToast(
            error.message ||
              "Gagal memuat data.",
            "error"
          );

        }

      }
    );

  }


  if (nextButton) {

    nextButton.addEventListener(
      "click",
      async function () {

        currentPage++;


        try {

          await loadData();

        }

        catch (error) {

          currentPage--;


          console.error(
            error
          );


          showToast(
            error.message ||
              "Gagal memuat data.",
            "error"
          );

        }

      }
    );

  }

}


// =========================================================
// UPDATE PAGINATION
// =========================================================

function updatePagination(
  result
) {

  const prevButton =
    document.getElementById(
      "prevButton"
    );


  const nextButton =
    document.getElementById(
      "nextButton"
    );


  const paginationInfo =
    document.getElementById(
      "paginationInfo"
    );


  const page =
    result.page || 1;


  const totalPages =
    result.totalPages || 1;


  currentPage =
    page;


  if (prevButton) {

    prevButton.disabled =
      page <= 1;

  }


  if (nextButton) {

    nextButton.disabled =
      page >= totalPages;

  }


  if (paginationInfo) {

    paginationInfo.textContent =
      page +
      " / " +
      totalPages;

  }

}


// =========================================================
// SEARCH
// =========================================================

function setupSearch() {

  const input =
    document.getElementById(
      "searchInput"
    );


  if (!input) return;


  input.addEventListener(
    "input",
    function () {

      clearTimeout(
        searchTimer
      );


      searchTimer =
        setTimeout(
          async function () {

            currentKeyword =
              input.value
                .trim();


            currentPage =
              1;


            try {

              await loadData();

            }

            catch (error) {

              console.error(
                error
              );


              showToast(
                error.message ||
                  "Gagal melakukan pencarian.",
                "error"
              );

            }

          },
          300
        );

    }
  );

}


// =========================================================
// RESULT MODAL
// =========================================================

function showResultModal(
  result
) {

  const modal =
    document.getElementById(
      "resultModal"
    );


  const resultText =
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


  if (!modal) return;


  if (resultText) {

    resultText.textContent =
      result.message ||
      "Surat berhasil dibuat.";

  }


  if (draftLink) {

    draftLink.href =
      result.draftUrl || "#";

  }


  if (pdfLink) {

    pdfLink.href =
      result.pdfUrl || "#";

  }


  modal.classList.add(
    "show"
  );

}


// =========================================================
// CLOSE MODAL
// =========================================================

function closeResultModal() {

  const modal =
    document.getElementById(
      "resultModal"
    );


  if (!modal) return;


  modal.classList.remove(
    "show"
  );

}


// =========================================================
// MODAL EVENTS
// =========================================================

document.addEventListener(
  "click",
  function(event) {

    const closeButton =
      event.target.closest(
        "[data-close-modal]"
      );


    if (
      closeButton
    ) {

      closeResultModal();

    }

  }
);


// =========================================================
// LOADING
// =========================================================

function showLoading(
  show,
  message = ""
) {

  const overlay =
    document.getElementById(
      "loadingOverlay"
    );


  if (!overlay) return;


  const text =
    overlay.querySelector(
      ".loading-text"
    );


  if (text) {

    text.textContent =
      message;

  }


  overlay.classList.toggle(
    "show",
    Boolean(show)
  );

}


// =========================================================
// TOAST
// =========================================================

let toastTimer = null;


function showToast(
  message,
  type = ""
) {

  const toast =
    document.getElementById(
      "toast"
    );


  if (!toast) return;


  clearTimeout(
    toastTimer
  );


  toast.textContent =
    message;


  toast.className =
    "toast";


  if (type) {

    toast.classList.add(
      type
    );

  }


  requestAnimationFrame(
    function () {

      toast.classList.add(
        "show"
      );

    }
  );


  toastTimer =
    setTimeout(
      function () {

        toast.classList.remove(
          "show"
        );

      },
      4000
    );

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(
  value
) {

  return String(
    value || ""
  )
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
