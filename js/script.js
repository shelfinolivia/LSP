document.addEventListener('DOMContentLoaded', function() {
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
    const btnKirim = document.getElementById('kirim')
    const btnBatal = document.getElementById('batal')

    let tabunganList = JSON.parse(localStorage.getItem('tabunganList')) || [];
    let currentIndex = null;
    let currentAction = null;

    btnKirim.addEventListener('click',(event) => {
        event.preventDefault();
        
        const nama = document.getElementById('nama').value.trim();
        const nominal = parseInt(document.getElementById('nominal').value);
        const kelas = document.getElementById('kelas').value;
        const jurusan = document.getElementById('jurusan').value;

        if (nama == "" || nominal == "" || kelas == "" || jurusan == "") {
            showAlert('Semua data harus diisi.');
            return;
        }
        
        const isDuplicate = tabunganList.some(tabungan => tabungan.nama.toLowerCase() === nama.toLowerCase() && tabungan.kelas === kelas && tabungan.jurusan === jurusan);
        
        if (isDuplicate) {
            showAlert('Data sudah terdaftar.');
            return;
        }
        
        const tabungan = { nama, nominal, kelas, jurusan };
        tabunganList.push(tabungan);
        updateLocalStorage();
        displayTabungan();
        
        form.reset();
    })

    searchInput.addEventListener('input', function() {
        displayTabungan();
    });

    filterKelas.addEventListener('change', function() {
        displayTabungan();
    });

    closePopup.addEventListener('click', function() {
        popup.style.display = 'none';
    });

    popupButton.addEventListener('click', function() {
        const nominal = parseInt(popupNominal.value);
        if (isNaN(nominal) || nominal <= 0) {
            showAlert('Nominal harus berupa angka positif');
            return;
        }

        if (currentAction === 'add') {
            tabunganList[currentIndex].nominal += nominal;
        } else if (currentAction === 'subtract') {
            tabunganList[currentIndex].nominal -= nominal;
        }
        
        updateLocalStorage();
        displayTabungan();
        popup.style.display = 'none';
        popupNominal.value = '';
    });

    closeWarningPopup.addEventListener('click', function() {
        warningPopup.style.display = 'none';
    });

    function displayTabungan() {
        const searchText = searchInput.value.toLowerCase();
        const selectedKelas = filterKelas.value;
        tableBody.innerHTML = '';
        
        tabunganList
            .filter(t => t.nama.toLowerCase().includes(searchText) && (selectedKelas === "" || t.kelas === selectedKelas))
            .forEach((tabungan, index) => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${tabungan.nama}</td>
                    <td>${tabungan.nominal}</td>
                    <td>${tabungan.kelas}</td>
                    <td>${tabungan.jurusan}</td>
                    <td>
                        <button onclick="showPopup(${index}, 'add')">Tambah</button>
                        <button onclick="showPopup(${index}, 'subtract')">Kurangi</button>
                        <button onclick="deleteTabungan(${index})">Hapus</button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
    }

    window.showPopup = function(index, action) {
        currentIndex = index;
        currentAction = action;
        popupTitle.textContent = action === 'add' ? 'Tambah Tabungan' : 'Kurangi Tabungan';
        popup.style.display = 'flex';
    };

    window.deleteTabungan = function(index) {
        tabunganList.splice(index, 1);
        updateLocalStorage();
        displayTabungan();
    };

    function updateLocalStorage() {
        localStorage.setItem('tabunganList', JSON.stringify(tabunganList));
    }

    function showAlert(message) {
        warningMessage.textContent = message;
        warningPopup.style.display = 'flex';
    }

    displayTabungan();
});
