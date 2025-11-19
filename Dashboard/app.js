const DEVICE_LIST = ['sensor_01'];

// Cognito config
const cognitoUserPoolId = 'ap-southeast-2_m0eApPDw1';
const cognitoClientId = '2gttsppop72n5j81886q74v800';
const cognitoRegion = 'ap-southeast-2';
const cognitoDomain = 'ap-southeast-2bl19yktd2.auth.ap-southeast-2.amazoncognito.com';
<<<<<<< Updated upstream
const cloudFrontUrl = 'https://d3uigjtlhbwpv6.cloudfront.net';

// API Gateway URLs
const quickSightApiUrl = 'https://q883ljud55.execute-api.ap-southeast-2.amazonaws.com/prod/dashboard';
const realTimeApiUrl   = 'https://q883ljud55.execute-api.ap-southeast-2.amazonaws.com/prod/get-latest-data';

// Cognito init
const poolData = { UserPoolId: cognitoUserPoolId, ClientId: cognitoClientId };
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
AWS.config.region = cognitoRegion;

let idToken = null;
=======
const cloudFrontUrl = 'https://d3uigjl9bwpjv6.cloudfront.net';

// API Gateway endpoints
const quickSightApiUrl = 'https://q883ljud55.execute-api.ap-southeast-2.amazonaws.com/prod/dashboard';
const realTimeApiUrl   = 'https://q883ljud55.execute-api.ap-southeast-2.amazonaws.com/prod/get-latest-data';

// Cognito init
const userPool = new AmazonCognitoIdentity.CognitoUserPool({
    UserPoolId: cognitoUserPoolId,
    ClientId: cognitoClientId
});

AWS.config.region = cognitoRegion;

let idToken = null;
let accessToken = null;
let embeddedDashboard = null;
>>>>>>> Stashed changes

// Modal
const quicksightModal = document.getElementById('quicksight-modal');
const modalCloseButton = document.getElementById('modal-close-button');
const modalEmbedContainer = document.getElementById('quicksight-embed-container');


<<<<<<< Updated upstream
// ================================
// 1. QuickSight Embed URL Fetcher
// ================================
function getQuickSightEmbedUrl(idToken, deviceId, callback) {
    console.log(`🔥 QuickSight API → ${deviceId}`);

    fetch(quickSightApiUrl, {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${idToken}`
=======
// ===============================
// 1. QuickSight Embed URL
// ===============================
function getQuickSightEmbedUrl(deviceId, callback) {
    fetch(quickSightApiUrl, {
        method: 'GET',
        headers: { 
            'Authorization': accessToken   // ❗ KHÔNG có Bearer
>>>>>>> Stashed changes
        }
    })
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(data => {
        if (data.EmbedUrl) callback(null, data.EmbedUrl);
<<<<<<< Updated upstream
        else throw new Error("No EmbedUrl returned");
    })
    .catch(err => {
        console.error("❌ QuickSight error:", err);
        callback(err, null);
    });
}


// ================================
// 2. Fetch Realtime Data
// ================================
=======
        else callback("Không có EmbedUrl", null);
    })
    .catch(err => callback(err, null));
}


// ===============================
// 2. Fetch realtime data
// ===============================
>>>>>>> Stashed changes
function fetchLatestData(deviceId) {
    if (!idToken) return;

    const url = new URL(realTimeApiUrl);
    url.searchParams.append("deviceId", deviceId);

    fetch(url, {
        method: "GET",
        headers: { 
<<<<<<< Updated upstream
            "Authorization": `Bearer ${idToken}` 
=======
            "Authorization": accessToken   // ❗ Không Bearer
>>>>>>> Stashed changes
        }
    })
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(data => {
        document.getElementById(`temp-${deviceId}`).textContent = `${data.temperature} °C`;
        document.getElementById(`hum-${deviceId}`).textContent  = `${data.humidity} %`;
        document.getElementById(`time-${deviceId}`).textContent = `Lúc: ${data.time_str}`;

        const statusEl = document.getElementById(`status-${deviceId}`);
        if (data.alerts?.length > 0) {
            statusEl.textContent = data.alerts.join(', ');
            statusEl.classList.add('alert');
        } else {
            statusEl.textContent = "Bình thường";
            statusEl.classList.remove('alert');
        }
    })
    .catch(err => {
<<<<<<< Updated upstream
        console.error(`❌ Realtime API error:`, err);
=======
>>>>>>> Stashed changes
        document.getElementById(`time-${deviceId}`).textContent = "Lỗi tải dữ liệu";
    });
}

function fetchAllDeviceData() {
    DEVICE_LIST.forEach(id => fetchLatestData(id));
}


<<<<<<< Updated upstream
// ================================
// 3. Create Device Cards
// ================================
=======
// ===============================
// 3. Create device card
// ===============================
>>>>>>> Stashed changes
function createDeviceCard(deviceId) {
    return `
        <div class="device-card" id="card-${deviceId}">
            <div class="card-header">
                <h3>${deviceId}</h3>
                <span id="status-${deviceId}" class="card-status">--</span>
            </div>

            <div class="card-body">
                <div class="param"><span class="param-title">NHIỆT ĐỘ</span><span class="param-value" id="temp-${deviceId}">-- °C</span></div>
                <div class="param"><span class="param-title">ĐỘ ẨM</span><span class="param-value" id="hum-${deviceId}">-- %</span></div>
            </div>

            <div class="card-footer">
                <span class="param-time" id="time-${deviceId}">Đang chờ dữ liệu...</span>
                <button class="expand-button" data-device-id="${deviceId}">Xem Chi Tiết</button>
            </div>
        </div>
    `;
}


<<<<<<< Updated upstream
// ================================
// 4. Expand QuickSight Dashboard
// ================================
=======
// ===============================
// 4. Open QuickSight dashboard
// ===============================
>>>>>>> Stashed changes
function handleExpandClick(event) {
    // const deviceId = event.target.dataset.deviceId;

    // quicksightModal.style.display = "block";
    // document.getElementById("modal-title").textContent = `Dashboard: ${deviceId}`;
    // modalEmbedContainer.innerHTML = '<p id="dashboardLoadingMessage">Đang tải...</p>';

    // if (embeddedDashboard) {
    //     embeddedDashboard.delete();
    //     embeddedDashboard = null;
    // }

    // getQuickSightEmbedUrl(deviceId, (err, url) => {
    //     if (err || !url) {
    //         document.getElementById("dashboardLoadingMessage").textContent = "Không lấy được URL";
    //         return;
    //     }

    //     document.getElementById("dashboardLoadingMessage").style.display = "none";

    //     embeddedDashboard = QuickSightEmbedding.embedDashboard({
    //         url,
    //         container: modalEmbedContainer,
    //         height: "100%",
    //         width: "100%",
    //         scrolling: "no",
    //     });
    // });

    const deviceId = event.target.dataset.deviceId;
    quicksightModal.style.display = "block";

    document.getElementById("modal-title").textContent = `Dashboard: ${deviceId}`;

<<<<<<< Updated upstream
    if (embeddedDashboard) embeddedDashboard.delete();

    getQuickSightEmbedUrl(idToken, deviceId, (err, url) => {
        if (err) {
            document.getElementById('dashboardLoadingMessage').textContent 
                = "Không lấy được URL";
            return;
        }

        embeddedDashboard = QuickSightEmbedding.embedDashboard({
            url,
            container: modalEmbedContainer,
            scrolling: "no",
            height: "100%",
            width: "100%"
        });

        document.getElementById('dashboardLoadingMessage').style.display = "none";
    });
}


// ================================
// 5. Login Success
// ================================
function onSuccess(session) {
    console.log("✅ Login success");

    idToken = session.getIdToken().getJwtToken();

    const email = JSON.parse(atob(idToken.split('.')[1])).email;
    document.getElementById("userEmail").textContent = email;

    // render cards
    const grid = document.getElementById("device-grid-container");
    grid.innerHTML = DEVICE_LIST.map(id => createDeviceCard(id)).join("");

    // attach events
    document.querySelectorAll(".expand-button")
        .forEach(btn => btn.addEventListener("click", handleExpandClick));

    // realtime
=======
    // Xóa dashboard cũ nếu có
    modalEmbedContainer.innerHTML = '';

    // Tạo iframe
    const iframe = document.createElement('iframe');
    iframe.width = "100%";
    iframe.height = "600px";
    iframe.src = "https://ap-southeast-2.quicksight.aws.amazon.com/sn/embed/share/accounts/018889389183/dashboards/eba1ca88-8e79-4b46-bc0c-486e15074beb/sheets/eba1ca88-8e79-4b46-bc0c-486e15074beb_29723dc7-2bcb-456c-84c6-9c8061f53202/visuals/eba1ca88-8e79-4b46-bc0c-486e15074beb_cf7145a9-11ce-467b-bbe1-a667512f8aad?directory_alias=BlablaBloblo"; // URL embed của QuickSight
    iframe.frameBorder = "0";
    iframe.allowFullscreen = true;

    modalEmbedContainer.appendChild(iframe);
}



// ===============================
// 5. Login successful
// ===============================
function onSuccess(session) {
    idToken     = session.getIdToken().getJwtToken();
    accessToken = session.getAccessToken().getJwtToken();

    const email = JSON.parse(atob(idToken.split('.')[1])).email;
    document.getElementById("userEmail").textContent = email;

    // render devices
    const grid = document.getElementById("device-grid-container");
    grid.innerHTML = DEVICE_LIST.map(id => createDeviceCard(id)).join("");

    document.querySelectorAll(".expand-button").forEach(btn =>
        btn.addEventListener("click", handleExpandClick)
    );

>>>>>>> Stashed changes
    fetchAllDeviceData();
    setInterval(fetchAllDeviceData, 5000);
}


<<<<<<< Updated upstream
// ================================
// 6. Login Failure → Redirect to Hosted UI
// ================================
function onFailure() {
    const loginUrl =
        `https://${cognitoDomain}/login?response_type=token&client_id=${cognitoClientId}&redirect_uri=${cloudFrontUrl}`;
    window.location.assign(loginUrl);
}


// ================================
// 7. Modal Close
// ================================
=======
// ===============================
// 6. Login failure => send to Cognito
// ===============================
function onFailure() {
    window.location.assign(
        `https://${cognitoDomain}/login?response_type=token&client_id=${cognitoClientId}&redirect_uri=${cloudFrontUrl}`
    );
}


// ===============================
// 7. Modal close
// ===============================
>>>>>>> Stashed changes
modalCloseButton.onclick = () => {
    quicksightModal.style.display = "none";
    embeddedDashboard?.delete();
};
<<<<<<< Updated upstream


// ================================
// 8. App Startup
// ================================
window.onload = function () {
=======

window.onclick = e => {
    if (e.target === quicksightModal) {
        quicksightModal.style.display = "none";
        embeddedDashboard?.delete();
    }
};


// ===============================
// 8. App startup
// ===============================
window.onload = () => {
>>>>>>> Stashed changes
    const hash = window.location.hash;

    if (hash.includes("id_token")) {
        const p = new URLSearchParams(hash.substring(1));

<<<<<<< Updated upstream
        idToken = p.get("id_token");
        const accessToken = p.get("access_token");
=======
        idToken     = p.get("id_token");
        accessToken = p.get("access_token");
>>>>>>> Stashed changes

        if (!idToken || !accessToken) return onFailure();

        const session = new AmazonCognitoIdentity.CognitoUserSession({
            IdToken: new AmazonCognitoIdentity.CognitoIdToken({ IdToken: idToken }),
            AccessToken: new AmazonCognitoIdentity.CognitoAccessToken({ AccessToken: accessToken })
        });

        const user = userPool.getCurrentUser();
        user?.setSignInUserSession(session);

        window.history.replaceState(null, "", window.location.pathname);

        onSuccess(session);
<<<<<<< Updated upstream

    } else {
        const user = userPool.getCurrentUser();
        user
            ? user.getSession((err, session) => err ? onFailure() : onSuccess(session))
            : onFailure();
=======
        return;
>>>>>>> Stashed changes
    }

    const user = userPool.getCurrentUser();
    user
        ? user.getSession((err, session) => err ? onFailure() : onSuccess(session))
        : onFailure();
};
<<<<<<< Updated upstream
=======


// ===============================
// 9. Logout
// ===============================
window.logOutUser = () => {
    const user = userPool.getCurrentUser();
    user?.signOut();

    window.location.href =
        `https://${cognitoDomain}/logout?client_id=${cognitoClientId}&logout_uri=${cloudFrontUrl}`;
};

// Ticket modal
const ticketModal = document.getElementById("ticket-modal");
const ticketCloseButton = document.getElementById("ticket-close-button");
const sendTicketButton = document.getElementById("send-ticket-button");

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("ticket-button")) {
        const deviceId = e.target.dataset.deviceId;
        document.getElementById("ticket-content").value = "";
        document.getElementById("ticket-status").textContent = "";
        ticketModal.style.display = "block";
    }
});

// Close ticket modal
ticketCloseButton.onclick = () => ticketModal.style.display = "none";
window.onclick = e => { if (e.target === ticketModal) ticketModal.style.display = "none"; };

// Send ticket via EmailJS
sendTicketButton.onclick = () => {
    const message = document.getElementById("ticket-content").value.trim();
    if (!message) { alert("Vui lòng nhập nội dung ticket!"); return; }

    emailjs.send("IoT_Gmail", "template_2gmcur7", {
        to_email: "23020639@vnu.edu.vn",
        message: message
    })
    .then(() => {
        document.getElementById("ticket-status").textContent = "Gửi ticket thành công!";
        setTimeout(() => { ticketModal.style.display = "none"; }, 2000);
    })
    .catch(err => {
        document.getElementById("ticket-status").textContent = "Gửi thất bại: " + err.text;
    });
};
>>>>>>> Stashed changes
