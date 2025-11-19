const DEVICE_LIST = ['sensor_01'];

// Cấu hình Cognito User Pool
const cognitoUserPoolId = 'ap-southeast-2_m0eApPDw1';
const cognitoClientId = '2gttsppop72n5j81886q74v800';
const cognitoRegion = 'ap-southeast-2';

// ✔ DOMAIN ĐÚNG LẤY TỪ AWS (đã sửa)
const cognitoDomain = 'ap-southeast-2bl19yktd2.auth.ap-southeast-2.amazoncognito.com';

// ✔ URL CloudFront của bạn
const cloudFrontUrl = 'https://d3uigjl9bwpjv6.cloudfront.net';

// API Gateway endpoints
const quickSightApiUrl = 'https://q883ljud55.execute-api.ap-southeast-2.amazonaws.com/prod/dashboard';
const realTimeApiUrl = 'https://q883ljud55.execute-api.ap-southeast-2.amazonaws.com/prod/get-latest-data';

const poolData = {
    UserPoolId: cognitoUserPoolId,
    ClientId: cognitoClientId
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
AWS.config.region = cognitoRegion;

let idToken = null;
let accessToken = null;

// Modal
const quicksightModal = document.getElementById('quicksight-modal');
const modalCloseButton = document.getElementById('modal-close-button');
const modalEmbedContainer = document.getElementById('quicksight-embed-container');
let embeddedDashboard = null;


// ===========================
// 1. GET QUICK SIGHT EMBED URL
// ===========================
function getQuickSightEmbedUrl(accessToken, deviceId, callback) {
    console.log(`Gọi API QuickSight cho ${deviceId}...`);

    fetch(quickSightApiUrl, {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(data => {
        if (data.EmbedUrl) callback(null, data.EmbedUrl);
        else throw new Error("API không trả EmbedUrl");
    })
    .catch(err => {
        console.error("Lỗi QuickSight API:", err);
        callback(err, null);
    });
}


// ===========================
// 2. FETCH REALTIME DATA
// ===========================
function fetchLatestData(deviceId) {
    if (!accessToken) return;

    const apiUrl = new URL(realTimeApiUrl);
    apiUrl.searchParams.append("deviceId", deviceId);

    fetch(apiUrl, {
        method: "GET",
        headers: { "Authorization": `Bearer ${accessToken}` }
    })
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(data => {
        document.getElementById(`temp-${deviceId}`).textContent = `${data.temperature} °C`;
        document.getElementById(`hum-${deviceId}`).textContent = `${data.humidity} %`;
        document.getElementById(`time-${deviceId}`).textContent = `Lúc: ${data.time_str}`;

        const statusEl = document.getElementById(`status-${deviceId}`);
        if (data.alerts && data.alerts.length > 0) {
            statusEl.textContent = data.alerts.join(', ');
            statusEl.classList.add('alert');
        } else {
            statusEl.textContent = "Bình thường";
            statusEl.classList.remove('alert');
        }
    })
    .catch(err => {
        console.error(`Lỗi realtime ${deviceId}:`, err);
        document.getElementById(`time-${deviceId}`).textContent = "Lỗi tải dữ liệu";
    });
}

function fetchAllDeviceData() {
    DEVICE_LIST.forEach(id => fetchLatestData(id));
}


// ===========================
// 3. CREATE DEVICE CARD
// ===========================
function createDeviceCard(deviceId) {
    return `
        <div class="device-card" id="card-${deviceId}">
            <div class="card-header">
                <h3 id="name-${deviceId}">${deviceId}</h3>
                <span id="status-${deviceId}" class="card-status">--</span>
            </div>
            <div class="card-body">
                <div class="param">
                    <span class="param-title">NHIỆT ĐỘ</span>
                    <span class="param-value" id="temp-${deviceId}">-- °C</span>
                </div>
                <div class="param">
                    <span class="param-title">ĐỘ ẨM</span>
                    <span class="param-value" id="hum-${deviceId}">-- %</span>
                </div>
            </div>
            <div class="card-footer">
                <span class="param-time" id="time-${deviceId}">Đang chờ dữ liệu...</span>
                <button class="expand-button" data-device-id="${deviceId}">Xem Chi Tiết</button>
            </div>
        </div>
    `;
}


// ===========================
// 4. EXPAND QUICK SIGHT DASHBOARD
// ===========================
function handleExpandClick(event) {
    const deviceId = event.target.dataset.deviceId;

    quicksightModal.style.display = "block";
    document.getElementById("modal-title").textContent = `Dashboard: ${deviceId}`;
    modalEmbedContainer.innerHTML = '<p id="dashboardLoadingMessage">Đang tải...</p>';

    if (embeddedDashboard) {
        embeddedDashboard.delete();
        embeddedDashboard = null;
    }

    getQuickSightEmbedUrl(accessToken, deviceId, (err, url) => {
        if (err) {
            document.getElementById('dashboardLoadingMessage').textContent = 
                "Không lấy được URL: " + err;
            return;
        }

        document.getElementById('dashboardLoadingMessage').style.display = "none";

        embeddedDashboard = QuickSightEmbedding.embedDashboard({
            url,
            container: modalEmbedContainer,
            scrolling: "no",
            height: "100%",
            width: "100%"
        });
    });
}


// ===========================
// 5. LOGIN SUCCESS
// ===========================
function onSuccess(session) {
    console.log("Đăng nhập OK");

    idToken = session.getIdToken().getJwtToken();
    accessToken = session.getAccessToken().getJwtToken(); // ✔ TOKEN CHUẨN GỌI API

    // Hiển thị email
    const decoded = JSON.parse(atob(idToken.split('.')[1]));
    document.getElementById("userEmail").textContent = decoded.email;

    // Render card
    const grid = document.getElementById("device-grid-container");
    grid.innerHTML = "";
    DEVICE_LIST.forEach(id => grid.innerHTML += createDeviceCard(id));

    // Gán event
    document.querySelectorAll(".expand-button").forEach(btn =>
        btn.addEventListener("click", handleExpandClick)
    );

    // Start realtime
    fetchAllDeviceData();
    setInterval(fetchAllDeviceData, 5000);
}


// ===========================
// 6. LOGIN FAILURE
// ===========================
function onFailure() {
    const loginUrl = 
        `https://${cognitoDomain}/login?response_type=token&client_id=${cognitoClientId}&redirect_uri=${cloudFrontUrl}`;
    window.location.assign(loginUrl);
}


// ===========================
// 7. MODAL CLOSE
// ===========================
modalCloseButton.onclick = function () {
    quicksightModal.style.display = "none";
    if (embeddedDashboard) embeddedDashboard.delete();
};
window.onclick = function (e) {
    if (e.target === quicksightModal) {
        quicksightModal.style.display = "none";
        if (embeddedDashboard) embeddedDashboard.delete();
    }
};


// ===========================
// 8. APP STARTUP
// ===========================
window.onload = function () {
    const curUrl = window.location.href;

    if (curUrl.includes("id_token")) {
        const params = new URLSearchParams(window.location.hash.substring(1));

        idToken = params.get("id_token");
        accessToken = params.get("access_token");

        if (!idToken || !accessToken) return onFailure();

        const session = new AmazonCognitoIdentity.CognitoUserSession({
            IdToken: new AmazonCognitoIdentity.CognitoIdToken({ IdToken: idToken }),
            AccessToken: new AmazonCognitoIdentity.CognitoAccessToken({ AccessToken: accessToken })
        });

        const cognitoUser = userPool.getCurrentUser();
        cognitoUser?.setSignInUserSession(session);

        window.history.replaceState(null, '', window.location.pathname);

        onSuccess(session);

    } else {
        const cognitoUser = userPool.getCurrentUser();
        if (cognitoUser) {
            cognitoUser.getSession((err, session) => {
                if (err) return onFailure();
                onSuccess(session);
            });
        } else {
            onFailure();
        }
    }
};

// ==========================
// 9. LOG OUT FUNCTION
// ==========================    
window.logOutUser = function() {
    const cognitoUser = userPool.getCurrentUser();
        if (cognitoUser) {
            cognitoUser.signOut();
        }
    
    localStorage.removeItem('CognitoAccessToken'); 
    localStorage.removeItem('CognitoIdToken'); 
    
    const logoutUrl = `https://${cognitoDomain}/logout?client_id=${cognitoClientId}&logout_uri=${cloudFrontUrl}`;
    window.location.href = logoutUrl; 
};
    
// ===============================================
// 10. (OPTIONAL) HOOKUP LOGOUT BUTTON
// ===============================================
// document.addEventListener('DOMContentLoaded', () => {
//     const logoutBtn = document.getElementById('logoutButton');
//     if (logoutBtn) {
//         logoutBtn.addEventListener('click', logOutUser);
//     }
// });