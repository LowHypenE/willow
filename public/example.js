const connection = new BareMux.BareMuxConnection("/baremux/worker.js")
const wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
const bareUrl = (location.protocol === "https:" ? "https" : "http") + "://" + location.host + "/bare/"
document // makes it so you can press enter to submit as opposed to just being able to press a button
    .getElementById("urlInput")
    .addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("searchButton").click();
        }
    });

document.getElementById("searchButton").onclick = async function (event) {
    event.preventDefault();

    let url = document.getElementById("urlInput").value; // if no periods are detected in the input, search google instead
    let searchUrl = "https://duckduckgo.com/?q=";

    if (!url.includes(".")) {
        url = searchUrl + encodeURIComponent(url);
    } else {
        if (!url.startsWith("http://") && !url.startsWith("https://")) { // if no http or https is detected, add https automatically
            url = "https://" + url;
        }
    }
    if (!await connection.getTransport()) {
        await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
    }

    // Instead of embedding the proxied site in an iframe (which many sites block),
    // navigate the top-level page to the proxied URL so the proxy handles the page
    // in the current tab.
    const proxied = __uv$config.prefix + __uv$config.encodeUrl(url);
    // Open proxied URL in a new tab to avoid disrupting the main UI and to isolate
    // any service-worker / proxy load issues in a separate tab.
    const newWin = window.open(proxied, '_blank');
    try { if (newWin) newWin.opener = null; } catch (e) {}
};

// If the switcher exists (moved to header), wire it up here.
const switcher = document.getElementById('switcher');
if(switcher){
    switcher.addEventListener('change', async (event)=>{
        switch (event.target.value) {
            case "epoxy":
                await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
                break;
            case "bare":
                await connection.setTransport("/baremod/index.mjs", [bareUrl]);
                break;
        }
    });
}

// Info popup behavior
const infoBtn = document.getElementById('infoBtn');
let infoPopup;
if(infoBtn){
    // create popup element and append to body
    infoPopup = document.createElement('div');
    infoPopup.className = 'info-popup';
    infoPopup.innerHTML = `Willow is the v2 version for willow.xyz recently taken down... Willow v2 is faster and supports tiktok unlike the last one. Still going through bug fixes, report bugs to <a href="mailto:idkwhattonameit053@gmail.com">idkwhattonameit053@gmail.com</a> or <a href="https://discord.com/users/unevenwxrld">unevenwxrld on Discord</a>.`;
    document.body.appendChild(infoPopup);

    infoBtn.addEventListener('click', (ev)=>{
        ev.stopPropagation();
        infoPopup.classList.toggle('visible');
    });

    // close popup when clicking outside
    document.addEventListener('click', (e)=>{
        if(!infoPopup) return;
        if(e.target === infoBtn || infoBtn.contains(e.target)) return;
        if(e.target === infoPopup || infoPopup.contains(e.target)) return;
        infoPopup.classList.remove('visible');
    });
}

// Restore the search UI when the tab regains focus or becomes visible.
// This tries to use the existing #showSearch button (defined in index.html) so we
// reuse the same UI logic. If it's not available, fallback to reloading the root.
function restoreSearchUI(){
    try{
        const showBtn = document.getElementById('showSearch');
        if(showBtn){
            // simulate a user click to invoke the same behavior
            showBtn.click();
            return;
        }
    }catch(e){ /* ignore */ }
    // If we couldn't find the button, reload the root to reset UI state
    if(location.pathname !== '/' && location.pathname !== '/index.html'){
        try{ location.replace('/'); } catch(e){ location.href = '/'; }
    } else {
        // If already on root, a soft reload will reset any transient UI state
        try{ window.location.reload(); } catch(e){ /* ignore */ }
    }
}

// When the page becomes visible again (user switched back), restore the UI
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') restoreSearchUI();
});

// Also handle window focus as some browsers/users rely on that
window.addEventListener('focus', () => {
    restoreSearchUI();
});

// Rotator lines that show above the search card. Change every 6 seconds.
(() => {
    const lines = [
        'took 1 month to make',
        'ima go broke after hosting this -$20',
        'credits to the one who dont gatekeep!',
        'contact me if u wanna be hired!',
        'doesnt support youtube yet... : |',
        'keep this unblocked cuz im running out of unblocked domains',
        'go touch some grass',
        'dont gate keep this!!',
        'credits to truffled although they gatekept lol',
        'U GUYS ARE AWESOME!!',
        'dont gate keep this!!',
        'I need employess cant do ts by my self...',
        'yo i smell food',
        'giv me ideas this site is boringggg!',
        'dont gate keep this!!',
        'report bugs at unevenwxrld discord or my gmail down below'
    ];

    const rotator = document.getElementById('rotator');
    if(!rotator) return;

    let idx = 0;
    const interval = 6000;

    function showNext(){
        // animate swipe up
        rotator.classList.add('swipe-up');
        setTimeout(()=>{
            idx = (idx + 1) % lines.length;
            rotator.textContent = lines[idx];
            rotator.classList.remove('swipe-up');
        }, 450); // match CSS transition timing
    }

    // start after a short delay so the initial text is visible briefly
    setInterval(showNext, interval);
})();
