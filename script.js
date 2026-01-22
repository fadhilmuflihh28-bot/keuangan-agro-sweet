// ELEMENTS
const form = document.getElementById("formTransaksi");
const list = document.getElementById("listTransaksi");
const saldoText = document.getElementById("saldo");
const hapusBtn = document.getElementById("hapusSemua");
const chartCanvas = document.getElementById("chart").getContext("2d");
const tabunganForm = document.getElementById("formTabungan");
const tabunganText = document.getElementById("tabunganText");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const themeToggle = document.getElementById("themeToggle");

// STORAGE
let transaksi = JSON.parse(localStorage.getItem("transaksi")) || [];
let tabungan = JSON.parse(localStorage.getItem("tabungan")) || { tujuan:0, cicilan:0, total:0 };

// DARK / LIGHT MODE
const savedTheme = localStorage.getItem("theme");
if(savedTheme==="light"){
  document.body.classList.add("light");
  themeToggle.textContent="🌞";
} else {
  themeToggle.textContent="🌙";
}
themeToggle.addEventListener("click", ()=>{
  document.body.classList.toggle("light");
  if(document.body.classList.contains("light")){
    themeToggle.textContent="🌞";
    localStorage.setItem("theme","light");
  } else {
    themeToggle.textContent="🌙";
    localStorage.setItem("theme","dark");
  }
});

// UPDATE SALDO
function updateSaldo(){
  let saldo = 0;
  transaksi.forEach(t=>{ saldo += (t.tipe==="masuk"? t.jumlah : -t.jumlah); });
  saldoText.textContent="Rp "+saldo.toLocaleString();
}

// RENDER TRANSAKSI
function renderTransaksi(){
  list.innerHTML="";
  transaksi.forEach((t, idx)=>{
    const li = document.createElement("li");
    li.classList.add(t.tipe);
    li.textContent=`${t.deskripsi} (${t.kategori}): Rp ${t.jumlah.toLocaleString()}`;

    const btn = document.createElement("button");
    btn.textContent="Hapus"; btn.className="hapus-btn";
    btn.onclick = ()=> {
      transaksi.splice(idx,1);
      localStorage.setItem("transaksi",JSON.stringify(transaksi));
      updateSaldo(); renderTransaksi(); renderChart(); updateTabunganDisplay();
    };

    li.appendChild(btn);
    list.appendChild(li);
  });
}

// FORM SUBMIT TRANSAKSI
form.addEventListener("submit", e=>{
  e.preventDefault();
  const deskripsi = document.getElementById("deskripsi").value;
  const jumlah = Number(document.getElementById("jumlah").value);
  const tipe = document.getElementById("tipe").value;
  const kategori = document.getElementById("kategori").value;

  transaksi.push({ deskripsi,jumlah,tipe,kategori });
  localStorage.setItem("transaksi",JSON.stringify(transaksi));

  if(tipe==="tabungan"){
    tabungan.total += jumlah;
    localStorage.setItem("tabungan",JSON.stringify(tabungan));
  }

  form.reset();
  updateSaldo(); renderTransaksi(); renderChart(); updateTabunganDisplay();
});

// HAPUS SEMUA
hapusBtn.onclick = ()=>{
  if(transaksi.length===0){ alert("Tidak ada transaksi"); return; }
  if(confirm("Yakin hapus semua?")){
    transaksi=[]; localStorage.removeItem("transaksi");
    tabungan={tujuan:0,cicilan:0,total:0}; localStorage.removeItem("tabungan");
    updateSaldo(); renderTransaksi(); renderChart(); updateTabunganDisplay();
  }
};

// TABUNGAN
function updateTabunganDisplay(){
  if(tabungan.tujuan>0 && tabungan.cicilan>0){
    tabunganText.textContent = `Tabungan: Rp ${tabungan.total.toLocaleString()} / Rp ${tabungan.tujuan.toLocaleString()} (${tabungan.cicilan}x)`;
    const percent = Math.min((tabungan.total/tabungan.tujuan)*100,100);
    progressBar.style.width=percent+"%";
    if(percent>=100){
      progressText.textContent="🎉 Goal tabungan tercapai!";
      progressBar.style.background="var(--success)";
    } else {
      progressText.textContent=percent.toFixed(1)+"% tercapai";
      progressBar.style.background="var(--accent)";
    }
  } else {
    tabunganText.textContent="Tabungan belum diatur";
    progressBar.style.width="0";
    progressText.textContent="";
  }
}

if(tabunganForm){
  tabunganForm.addEventListener("submit", e=>{
    e.preventDefault();
    const tujuan=Number(document.getElementById("tujuan").value);
    const cicilan=Number(document.getElementById("cicilan").value);
    if(tujuan<=0||cicilan<=0){ alert("Isi >0"); return; }
    tabungan={tujuan,cicilan,total: tabungan.total||0};
    localStorage.setItem("tabungan",JSON.stringify(tabungan));
    updateTabunganDisplay();
  });
}

// CHART
let chart;
function renderChart(){
  const pemasukan = transaksi.filter(t=>t.tipe==="masuk").reduce((a,b)=>a+b.jumlah,0);
  const pengeluaran = transaksi.filter(t=>t.tipe==="keluar").reduce((a,b)=>a+b.jumlah,0);
  if(chart) chart.destroy();
  chart=new Chart(chartCanvas,{
    type:"doughnut",
    data:{
      labels:["Pemasukan","Pengeluaran"],
      datasets:[{ data:[pemasukan,pengeluaran], backgroundColor:["#34d399","#ff6b6b"], borderWidth:1 }]
    }
  });
}

// INIT
updateSaldo(); renderTransaksi(); renderChart(); updateTabunganDisplay();