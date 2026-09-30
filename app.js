// ============================================================
// API URL
// ============================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbwx74oBw09tFwG-juSYQ_vP55JZdRgFJDw1N1XOT7R0liFbZe9KTdbqKu-XrRMZggx0Fg/exec";


// ============================================================
// GLOBAL
// ============================================================

let currentPage = 1;

const pageSize = 10;

let currentKeyword = "";

let currentHeaders = [];

let searchTimer = null;


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
            action: action,
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
// ON LOAD
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  function() {

    setupNIM();

    setupForm();

    loadMasterData();

    loadTotalData();

    loadData();

  }
);


// ============================================================
// FORM
// ============================================================

function setupForm() {

  document
    .getElementById(
      "mahasiswaForm"
    )
    .addEventListener(
      "submit",
      submitForm
    );


  document
    .getElementById(
      "searchInput"
    )
    .addEventListener(
      "input",
      searchData
    );


  document
    .getElementById(
      "prevButton"
    )
    .addEventListener(
      "click",
      previousPage
    );


  document
    .getElementById(
      "nextButton"
    )
    .addEventListener(
      "click",
      nextPage
    );

}


// ============================================================
// NIM
//
// PREFIX OTOMATIS PO71
//
// USER HANYA MENGETIK ANGKA
//
// Contoh:
// input 9
// hasil PO719
//
// input 1234567890
// hasil PO711234567890
// ============================================================

function setupNIM() {

  const nimInput =
    document.getElementById(
      "nim"
    );


  nimInput.addEventListener(
    "input",
    function() {

      let digits =
        this.value
          .replace(
            /^PO71/i,
            ""
          )
          .replace(
            /[^0-9]/g,
            ""
          );


      digits =
        digits.substring(
          0,
          10
        );


      this.value =
        "PO71" + digits;

    }
  );


  nimInput.addEventListener(
    "focus",
    function() {

      if (
        !this.value
      ) {

        this.value =
          "PO71";

      }

    }
  );


  nimInput.addEventListener(
    "blur",
    function() {

      if (
        this.value ===
        "PO71"
      ) {

        this.value =
          "";

      }

    }
  );

}


// ============================================================
// LOAD MASTER
// ============================================================

async function loadMasterData() {

  try {

    const data =
      await apiRequest(
        "getMasterOptions"
      );


    populateSelect(
      "prodi",
      data.prodi,
      "Pilih Prodi"
    );


    populateSelect(
      "program",
      data.program,
      "Pilih Program"
    );


    populateSelect(
      "jurusan",
      data.jurusan,
      "Pilih Jurusan"
    );


    populateSelect(
      "semester",
      data.semester,
      "Pilih Semester"
    );


  } catch (error) {

    showToast(
      "Gagal memuat master data: " +
      error.message
    );

  }

}


// ============================================================
// POPULATE SELECT
// ============================================================

function populateSelect(
  elementId,
  values,
  placeholder
) {

  const select =
    document.getElementById(
      elementId
    );


  select.innerHTML = "";


  const defaultOption =
    document.createElement(
      "option"
    );


  defaultOption.value = "";

  defaultOption.textContent =
    placeholder;


  select.appendChild(
    defaultOption
  );


  (
    values || []
  ).forEach(
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


// ============================================================
// SUBMIT
// ============================================================

async function submitForm(
  event
) {

  event.preventDefault();


  const form =
    document.getElementById(
      "mahasiswaForm"
    );


  if (
    !form.checkValidity()
  ) {

    form.reportValidity();

    return;

  }


  const nim =
    document
      .getElementById(
        "nim"
      )
      .value
      .trim()
      .toUpperCase();


  // ========================================================
  // VALIDASI NIM
  // ========================================================

  if (
    !/^PO71[0-9]{10}$/.test(
      nim
    )
  ) {

    showToast(
      "NIM harus berformat PO71 + 10 angka."
    );


    document
      .getElementById(
        "nim"
      )
      .focus();


    return;

  }


  if (
    nim.length !== 14
  ) {

    showToast(
      "NIM harus terdiri dari 14 karakter."
    );

    return;

  }


  const data = {

    nim: nim,

    nama:
      document
        .getElementById(
          "nama"
        )
        .value
        .trim(),

    tempatLahir:
      document
        .getElementById(
          "tempat"
        )
        .value
        .trim(),

    tanggalLahir:
      document
        .getElementById(
          "tanggalLahir"
        )
        .value,

    prodi:
      document
        .getElementById(
          "prodi"
        )
        .value,

    program:
      document
        .getElementById(
          "program"
        )
        .value,

    jurusan:
      document
        .getElementById(
          "jurusan"
        )
        .value,

    semester:
      document
        .getElementById(
          "semester"
        )
        .value

  };


  showLoading();


  const submitButton =
    document.getElementById(
      "submitButton"
    );


  submitButton.disabled =
    true;


  try {

    const result =
      await apiRequest(
        "saveMahasiswa",
        {
          data: data
        }
      );


    hideLoading();


    submitButton.disabled =
      false;


    if (
      !result ||
      !result.success
    ) {

      showToast(
        result &&
        result.message
          ? result.message
          : "Proses gagal."
      );


      return;

    }


    resetForm();

    await loadTotalData();


    currentPage = 1;

    await loadData();


    if (
      result.draftUrl ||
      result.pdfUrl
    ) {

      renderDraftResult(
        result
      );

    } else {

      showToast(
        result.warning ||
        result.message ||
        "Data berhasil disimpan."
      );

    }


  } catch (error) {

    hideLoading();

    submitButton.disabled =
      false;


    showToast(
      error.message ||
      "Terjadi kesalahan."
    );

  }

}


// ============================================================
// RESET
// ============================================================

function resetForm() {

  document
    .getElementById(
      "mahasiswaForm"
    )
    .reset();


  document
    .getElementById(
      "nim"
    )
    .value = "";

}


// ============================================================
// TOTAL
// ============================================================

async function loadTotalData() {

  try {

    const result =
      await apiRequest(
        "getTotalData"
      );


    document
      .getElementById(
        "totalData"
      )
      .textContent =
      Number(
        result.total || 0
      )
        .toLocaleString(
          "id-ID"
        );


  } catch (error) {

    document
      .getElementById(
        "totalData"
      )
      .textContent =
      "-";

  }

}


// ============================================================
// LOAD DATA
// ============================================================

async function loadData() {

  showTableLoading();


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


  } catch (error) {

    document
      .getElementById(
        "tableBody"
      )
      .innerHTML =
      `
      <tr>
        <td
          colspan="20"
          class="empty-state"
        >
          Gagal memuat data.
        </td>
      </tr>
      `;


    showToast(
      "Gagal memuat data: " +
      error.message
    );

  }

}


// ============================================================
// TABLE LOADING
// ============================================================

function showTableLoading() {

  document
    .getElementById(
      "tableBody"
    )
    .innerHTML =
    `
    <tr>
      <td
        colspan="20"
        class="empty-state"
      >
        Memuat data...
      </td>
    </tr>
    `;

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


  head.innerHTML = "";

  body.innerHTML = "";


  if (
    !result ||
    !result.headers ||
    result.headers.length === 0
  ) {

    body.innerHTML =
      `
      <tr>
        <td
          colspan="20"
          class="empty-state"
        >
          Belum ada data.
        </td>
      </tr>
      `;


    return;

  }


  currentHeaders =
    result.headers;


  const preferredHeaders = [

    "NIM",

    "NAMA MAHASISWA",

    "PRODI",

    "PROGRAM",

    "JURUSAN",

    "SEMESTER",

    "DRAFT SUKET"

  ];


  const indexes = [];


  preferredHeaders.forEach(
    function(header) {

      const index =
        findHeaderIndex(
          result.headers,
          header
        );


      if (
        index !== -1
      ) {

        indexes.push({
          header:
            header,

          index:
            index
        });

      }

    }
  );


  const trHead =
    document.createElement(
      "tr"
    );


  indexes.forEach(
    function(item) {

      const th =
        document.createElement(
          "th"
        );


      th.textContent =
        item.header;


      trHead.appendChild(
        th
      );

    }
  );


  head.appendChild(
    trHead
  );


  if (
    !result.rows ||
    result.rows.length === 0
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
      indexes.length || 1;


    td.className =
      "empty-state";


    td.textContent =
      currentKeyword
        ? "Data tidak ditemukan."
        : "Belum ada data mahasiswa.";


    tr.appendChild(
      td
    );


    body.appendChild(
      tr
    );


    return;

  }


  result.rows.forEach(
    function(row) {

      const tr =
        document.createElement(
          "tr"
        );


      indexes.forEach(
        function(item) {

          const td =
            document.createElement(
              "td"
            );


          const value =
            row[item.index] || "";


          if (
            item.header ===
            "NIM"
          ) {

            td.className =
              "nim-cell";


            td.textContent =
              value;


          } else if (
            item.header ===
            "DRAFT SUKET"
          ) {

            td.innerHTML =
              renderDraftActions(
                value
              );


          } else {

            td.textContent =
              value;

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
// FIND HEADER
// ============================================================

function findHeaderIndex(
  headers,
  target
) {

  const normalizedTarget =
    String(target)
      .trim()
      .toUpperCase();


  return headers.findIndex(
    function(header) {

      return String(
        header
      )
        .trim()
        .toUpperCase() ===
        normalizedTarget;

    }
  );

}


// ============================================================
// DRAFT ACTIONS
// ============================================================

function renderDraftActions(
  url
) {

  if (!url) {

    return `
      <span
        style="
          color:#98a2b3;
          font-size:11px;
        "
      >
        Belum tersedia
      </span>
    `;

  }


  const match =
    url.match(
      /\/d\/([a-zA-Z0-9_-]+)/
    );


  let pdfUrl =
    "";


  if (match) {

    pdfUrl =
      "https://docs.google.com/document/d/" +
      match[1] +
      "/export?format=pdf";

  }


  return `
    <div class="draft-actions">

      <a
        href="${escapeAttribute(url)}"
        target="_blank"
        rel="noopener noreferrer"
        class="draft-btn draft"
      >
        📄 Buka Draft
      </a>

      ${
        pdfUrl
          ?
          `
          <a
            href="${escapeAttribute(pdfUrl)}"
            target="_blank"
            rel="noopener noreferrer"
            class="draft-btn pdf"
          >
            ⬇ PDF
          </a>
          `
          :
          ""
      }

    </div>
  `;

}


// ============================================================
// SEARCH
// ============================================================

function searchData() {

  clearTimeout(
    searchTimer
  );


  searchTimer =
    setTimeout(
      function() {

        currentKeyword =
          document
            .getElementById(
              "searchInput"
            )
            .value
            .trim();


        currentPage = 1;


        loadData();

      },
      350
    );

}


// ============================================================
// PREVIOUS
// ============================================================

function previousPage() {

  if (
    currentPage <= 1
  ) {

    return;

  }


  currentPage--;

  loadData();

}


// ============================================================
// NEXT
// ============================================================

function nextPage() {

  const button =
    document
      .getElementById(
        "nextButton"
      );


  if (
    button.disabled
  ) {

    return;

  }


  currentPage++;

  loadData();

}


// ============================================================
// PAGINATION
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


  const total =
    Number(
      result.total || 0
    );


  const totalPages =
    Number(
      result.totalPages || 0
    );


  prev.disabled =
    currentPage <= 1;


  next.disabled =
    currentPage >= totalPages ||
    totalPages === 0;


  if (
    total === 0
  ) {

    info.textContent =
      "Tidak ada data.";


    return;

  }


  const start =
    (
      (currentPage - 1) *
      pageSize
    ) + 1;


  const end =
    Math.min(
      currentPage *
      pageSize,
      total
    );


  info.textContent =
    "Menampilkan " +
    start +
    "–" +
    end +
    " dari " +
    total +
    " data";

}


// ============================================================
// HASIL DRAFT
// ============================================================

function renderDraftResult(
  result
) {

  const draftLink =
    document.getElementById(
      "draftLink"
    );


  const pdfLink =
    document.getElementById(
      "pdfLink"
    );


  const resultText =
    document.getElementById(
      "resultText"
    );


  if (
    result.draftUrl
  ) {

    draftLink.href =
      result.draftUrl;


    draftLink.style.display =
      "flex";

  } else {

    draftLink.style.display =
      "none";

  }


  if (
    result.pdfUrl
  ) {

    pdfLink.href =
      result.pdfUrl;


    pdfLink.style.display =
      "flex";

  } else {

    pdfLink.style.display =
      "none";

  }


  resultText.textContent =
    result.draftName
      ? "Dokumen " +
        result.draftName +
        " berhasil dibuat."
      : "Dokumen berhasil dibuat.";


  document
    .getElementById(
      "resultModal"
    )
    .classList
    .add("show");

}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeResult() {

  document
    .getElementById(
      "resultModal"
    )
    .classList
    .remove("show");

}


// ============================================================
// LOADING
// ============================================================

function showLoading() {

  document
    .getElementById(
      "loadingOverlay"
    )
    .classList
    .add("show");

}


function hideLoading() {

  document
    .getElementById(
      "loadingOverlay"
    )
    .classList
    .remove("show");

}


// ============================================================
// TOAST
// ============================================================

function showToast(
  message
) {

  const toast =
    document.getElementById(
      "toast"
    );


  toast.textContent =
    message;


  toast.classList
    .add("show");


  setTimeout(
    function() {

      toast.classList
        .remove("show");

    },
    4500
  );

}


// ============================================================
// ESCAPE ATTRIBUTE
// ============================================================

function escapeAttribute(
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
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    );

}