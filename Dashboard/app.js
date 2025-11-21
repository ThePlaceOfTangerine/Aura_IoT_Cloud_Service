const DEVICE_LIST = ['sensor_01'];

// Cognito config
const cognitoUserPoolId = 'ap-southeast-2_m0eApPDw1';
const cognitoClientId = '2gttsppop72n5j81886q74v800';
const cognitoRegion = 'ap-southeast-2';
const cognitoDomain = 'ap-southeast-2bl19yktd2.auth.ap-southeast-2.amazoncognito.com';
const cloudFrontUrl = 'https://d3uigjtlhbwpv6.cloudfront.net';

// API Gateway URLs
const quickSightApiUrl = 'https://q883ljud55.execute-api.ap-southeast-2.amazonaws.com/prod/dashboard';
const realTimeApiUrl   = 'https://q883ljud55.execute-api.ap-southeast-2.amazonaws.com/prod/get-latest-data';

// Cognito init
const poolData = { UserPoolId: cognitoUserPoolId, ClientId: cognitoClientId };
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
AWS.config.region = cognitoRegion;

let idToken = null;

// Modal
const quicksightModal = document.getElementById('quicksight-modal');
const modalCloseButton = document.getElementById('modal-close-button');
const modalEmbedContainer = document.getElementById('quicksight-embed-container');


// ================================
// 1. QuickSight Embed URL Fetcher
// ================================
function getQuickSightEmbedUrl(idToken, deviceId, callback) {
    console.log(`🔥 QuickSight API → ${deviceId}`);

    fetch(quickSightApiUrl, {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${idToken}`
        }
    })
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(data => {
        if (data.EmbedUrl) callback(null, data.EmbedUrl);
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
function fetchLatestData(deviceId) {
    if (!idToken) return;

    const url = new URL(realTimeApiUrl);
    url.searchParams.append("deviceId", deviceId);

    fetch(url, {
        method: "GET",
        headers: { 
            "Authorization": `Bearer ${idToken}` 
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
        console.error(`❌ Realtime API error:`, err);
        document.getElementById(`time-${deviceId}`).textContent = "Lỗi tải dữ liệu";
    });
}

function fetchAllDeviceData() {
    DEVICE_LIST.forEach(id => fetchLatestData(id));
}


// ================================
// 3. Create Device Cards
// ================================
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


// ================================
// 4. Expand QuickSight Dashboard
// ================================
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
    fetchAllDeviceData();
    setInterval(fetchAllDeviceData, 5000);
}


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
modalCloseButton.onclick = () => {
    quicksightModal.style.display = "none";
    embeddedDashboard?.delete();
};


// ================================
// 8. App Startup
// ================================
window.onload = function () {
    const hash = window.location.hash;

    if (hash.includes("id_token")) {
        const p = new URLSearchParams(hash.substring(1));

        idToken = p.get("id_token");
        const accessToken = p.get("access_token");

        if (!idToken || !accessToken) return onFailure();

        const session = new AmazonCognitoIdentity.CognitoUserSession({
            IdToken: new AmazonCognitoIdentity.CognitoIdToken({ IdToken: idToken }),
            AccessToken: new AmazonCognitoIdentity.CognitoAccessToken({ AccessToken: accessToken })
        });

        const user = userPool.getCurrentUser();
        user?.setSignInUserSession(session);

        window.history.replaceState(null, "", window.location.pathname);

        onSuccess(session);

    } else {
        const user = userPool.getCurrentUser();
        user
            ? user.getSession((err, session) => err ? onFailure() : onSuccess(session))
            : onFailure();
    }

    const user = userPool.getCurrentUser();
    user
        ? user.getSession((err, session) => err ? onFailure() : onSuccess(session))
        : onFailure();
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
