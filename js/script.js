/**
 * @fileoverview Script untuk mengelola data tabungan siswa menggunakan DOM, localStorage, dan event handling.
 */

document.addEventListener('DOMContentLoaded', function () {
    // Mengambil elemen-elemen dari DOM
    const form = document.getElementById('tabunganForm');
    const tableBody = document.querySelector('#tabunganTable tbody');
    const searchInput = document.getElementById('search');
    const filterKelas = document.getElementById('filterKelas');
    const popup = document.getElementById('popup');
    const popupTitle = document.getElementById('popupTitle');
    const popupNominal = document.getElementById('popupNominal');
    const popupButton = document.getElementById('popupButton');
    const closePopup = document.getElementById('closePopup');
    const warningPopup = document.getElementById('warningPopup');
    const warningMessage = document.getElementById('warningMessage');
    const closeWarningPopup = document.getElementById('closeWarningPopup');
    const btnKirim = document.getElementById('kirim');
    const btnBatal = document.getElementById('batal');

    // Mengambil data tabungan dari localStorage atau inisialisasi array kosong
    let tabunganList = JSON.parse(localStorage.getItem('tabunganList')) || [];
    let currentId = null;
    let currentAction = null;

    /**
     * Event listener untuk tombol kirim di form tabungan.
     * @param {Event} event - Event yang dipicu oleh klik tombol kirim.
     */
    btnKirim.addEventListener('click', (event) => {
        event.preventDefault();

        const nama = document.getElementById('nama').value.trim();
        const nominal = document.getElementById('nominal').value.trim();
        const kelas = document.getElementById('kelas').value.trim();
        const jurusan = document.getElementById('jurusan').value.trim();

        // Validasi input
        if (nama === "" || nominal === "" || kelas === "" || jurusan === "") {
            showAlert('Semua data harus diisi.');
            return;
        }

        // Mengecek apakah data sudah ada
        const isDuplicate = tabunganList.some(tabungan => tabungan.nama.toLowerCase() === nama.toLowerCase() && tabungan.kelas === kelas && tabungan.jurusan === jurusan);

        if (isDuplicate) {
            showAlert('Data sudah terdaftar.');
            return;
        }

        // Menambahkan data tabungan baru ke array
        const id = tabunganList.length ? tabunganList[tabunganList.length - 1].id + 1 : 1;
        const tabungan = { id, nama, nominal: parseInt(nominal), kelas, jurusan };
        tabunganList.push(tabungan);
        updateLocalStorage();
        displayTabungan();

        form.reset();
    });

    /**
     * Event listener untuk input pencarian.
     */
    searchInput.addEventListener('input', function () {
        displayTabungan();
    });

    /**
     * Event listener untuk filter kelas.
     */
    filterKelas.addEventListener('change', function () {
        displayTabungan();
    });

    /**
     * Event listener untuk tombol tutup popup.
     */
    closePopup.addEventListener('click', function () {
        popup.style.display = 'none';
    });

    /**
     * Event listener untuk tombol di popup.
     */
    popupButton.addEventListener('click', function () {
        const nominal = parseInt(popupNominal.value);
        if (isNaN(nominal) || nominal <= 0) {
            showAlert('Nominal harus berupa angka positif');
            return;
        }

        // Menambahkan atau mengurangi nominal tabungan
        if (currentAction === 'add') {
            const tabungan = tabunganList.find(tabungan => tabungan.id == currentId);
            tabungan.nominal += nominal;
        } else if (currentAction === 'subtract') {
            const tabungan = tabunganList.find(tabungan => tabungan.id == currentId);
            if (tabungan.nominal < nominal) {
                showAlert('Nominal tidak mencukupi untuk dikurangi');
                return;
            }
            tabungan.nominal -= nominal;
        }

        updateLocalStorage();
        displayTabungan();
        popup.style.display = 'none';
        popupNominal.value = '';
    });

    /**
     * Event listener untuk tombol tutup peringatan.
     */
    closeWarningPopup.addEventListener('click', function () {
        warningPopup.style.display = 'none';
    });

    /**
     * Menampilkan data tabungan.
     */
    function displayTabungan() {
        const searchText = searchInput.value.toLowerCase();
        const selectedKelas = filterKelas.value;
        tableBody.innerHTML = '';

        // Menampilkan data tabungan yang sesuai dengan pencarian dan filter kelas
        tabunganList
            .filter(t => t.nama.toLowerCase().includes(searchText) && (selectedKelas === "" || t.kelas === selectedKelas))
            .forEach(tabungan => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${tabungan.nama}</td>
                    <td>${tabungan.nominal}</td>
                    <td>${tabungan.kelas}</td>
                    <td>${tabungan.jurusan}</td>
                    <td>
                        <button data-id="${tabungan.id}" data-action="add">Tambah</button>
                        <button data-id="${tabungan.id}" data-action="subtract">Kurangi</button>
                        <button data-id="${tabungan.id}" class="delete">Hapus</button>
                    </td>
                `;

                tableBody.appendChild(row);
            });

        // Tambahkan event listener untuk tombol Tambah, Kurangi, dan Hapus
        document.querySelectorAll('button[data-action="add"]').forEach(button => {
            button.addEventListener('click', function () {
                showPopup(this.dataset.id, 'add');
            });
        });

        document.querySelectorAll('button[data-action="subtract"]').forEach(button => {
            button.addEventListener('click', function () {
                showPopup(this.dataset.id, 'subtract');
            });
        });

        document.querySelectorAll('.delete').forEach(button => {
            button.addEventListener('click', function () {
                deleteTabungan(this.dataset.id);
            });
        });
    }

    /**
     * Menampilkan popup.
     * @param {number} id - ID dari tabungan yang dipilih.
     * @param {string} action - Aksi yang akan dilakukan ('add' atau 'subtract').
     */
    function showPopup(id, action) {
        currentId = parseInt(id); // memastikan currentId adalah angka
        currentAction = action;
        popupTitle.textContent = action === 'add' ? 'Tambah Tabungan' : 'Kurangi Tabungan';
        popup.style.display = 'flex';
    }

    /**
     * Menghapus data tabungan.
     * @param {number} id - ID dari tabungan yang akan dihapus.
     */
    function deleteTabungan(id) {
        const index = tabunganList.findIndex(tabungan => tabungan.id == id);
        if (index !== -1) {
            tabunganList.splice(index, 1);
            updateLocalStorage();
            displayTabungan();
        }
    }

    /**
     * Memperbarui localStorage dengan data tabungan.
     */
    function updateLocalStorage() {
        localStorage.setItem('tabunganList', JSON.stringify(tabunganList));
    }

    /**
     * Menampilkan pesan peringatan.
     * @param {string} message - Pesan peringatan yang akan ditampilkan.
     */
    function showAlert(message) {
        warningMessage.textContent = message;
        warningPopup.style.display = 'flex';
    }

    // Menampilkan data tabungan saat halaman dimuat
    displayTabungan();

});
