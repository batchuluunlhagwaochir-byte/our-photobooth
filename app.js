const myIdDisplay = document.getElementById('my-id');
const peerIdInput = document.getElementById('peer-id-input');
const connectBtn = document.getElementById('connect-btn');
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const snapBtn = document.getElementById('snap-btn');
const galleryGrid = document.getElementById('galleryGrid');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let localStream;
let peer;
let currentConnection;

// 1. Камер асаах
async function startCamera() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        localVideo.srcObject = localStream;
        initPeer();
    } catch (err) {
        alert("Камер ажиллуулж чадсангүй. Зөвшөөрөл өгнө үү.");
    }
}

// 2. PeerJS холболт үүсгэх (Үнэгүй сервер ашиглаж байна)
function initPeer() {
    peer = new Peer();

    // Өөрийн ID бэлэн болоход дэлгэц дээр харуулна
    peer.on('open', (id) => {
        myIdDisplay.innerText = id;
    });

    // Найз охин нь залгах үед дуудлагыг хүсэж авах
    peer.on('call', (call) => {
        call.answer(localStream);
        call.on('stream', (remoteStream) => {
            remoteVideo.srcObject = remoteStream;
        });
        currentConnection = call;
    });
}

// 3. Найз охины ID-аар холбогдож дуудлага хийх
connectBtn.addEventListener('click', () => {
    const peerId = peerIdInput.value.trim();
    if (!peerId) return alert("Найзынхаа ID-г оруулна уу!");

    const call = peer.connect(peerId); // Дата холболт (зураг дарах командыг зэрэг өгөхөд хэрэгтэй)
    
    const mediaCall = peer.call(peerId, localStream); // Видео холболт
    mediaCall.on('stream', (remoteStream) => {
        remoteVideo.srcObject = remoteStream;
    });
    currentConnection = mediaCall;
});

// 4. Зураг дарах функц (Хоёр видеог дээр дээрээс нь цуглуулж нэг коллаж болгоно)
snapBtn.addEventListener('click', () => {
    // Зургийн хэмжээг тохируулах (Бүүт шиг босоо)
    canvas.width = 320;
    canvas.height = 440; // Хоёр зураг багтах өндөр

    // Хар дэвсгэр үүсгэх
    ctx.fillStyle = "#222222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Зургуудыг толь шиг буруу харуулж авч байгаа тул canvas-ийг эргүүлж зурна
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    // 1. Би (Миний зураг) - Дээд талд нь зурах
    ctx.drawImage(localVideo, 0, 10, 320, 210);

    // 2. Найз охин - Доод талд нь зурах
    if (remoteVideo.srcObject) {
        ctx.drawImage(remoteVideo, 0, 220, 320, 210);
    }

    // Canvas эргүүлснийг буцааж хэвэнд нь оруулах
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Дата бэлдэж цомогт нэмэх
    const imgData = canvas.toDataURL('image/jpeg');
    
    const strip = document.createElement('div');
    strip.className = 'captured-strip';
    strip.innerHTML = `
        <img src="${imgData}" />
        <a href="${imgData}" download="booth-${Date.now()}.jpg" class="download-btn">Зургийг татах 📥</a>
    `;
    galleryGrid.insertBefore(strip, galleryGrid.firstChild);
});

// Камер ажиллуулж эхлэх
startCamera();
