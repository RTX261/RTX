const axios = require('axios');

// قائمة الهاكات حسب كل منصة
const HACK_CHOICES = {
    'android': [
        { name: '🔥 Delta', value: 'Delta' },
        { name: '💻 Codex', value: 'Codex' },
        { name: '⚔️ Arceus X Neo', value: 'Arceus X Neo' },
        { name: '🎮 Roblox Trigon', value: 'Trigon' },
        { name: '👻 Cryptic', value: 'Cryptic' },
        { name: '✨ Vega X', value: 'Vega X' },
        { name: '🎯 Ronix', value: 'Ronix' },
        { name: '⭐ Skibx', value: 'Skibx' },
        { name: '🔷 Flex', value: 'Flex' },
    ],
    'iphone': [
        { name: '🔥 Delta', value: 'Delta' },
        { name: '👻 Roblox', value: 'Roblox' },
        { name: '🎯 Ronix', value: 'Ronix' },
        { name: '⭐ Skibx', value: 'Skibx' },
        { name: '✨ Exploits', value: 'Exploits' },
    ],
    'pc': [
        { name: '⚙️ Semo', value: 'Semo' },
        { name: '🚀 Velocity', value: 'Velocity' },
        { name: '🎯 Ronix', value: 'Ronix' },
        { name: '🔷 Xeno', value: 'Xeno' },
        { name: '🎮 Trigon', value: 'Trigon' },
        { name: '💻 Pro Hacker', value: 'Pro Hacker' },
    ],
    'pekora-android': [
        { name: '📱 Roblox 2017', value: 'Roblox 2017' },
        { name: '📱 Roblox 2018', value: 'Roblox 2018' },
        { name: '📱 Roblox 2020', value: 'Roblox 2020' },
        { name: '📱 Roblox 2021', value: 'Roblox 2021' },
    ],
    'iphone': [
        { name: '🍎 Roblox 2017', value: 'Roblox 2017' },
        { name: '🍎 Roblox 2018', value: 'Roblox 2018' },
        { name: '🍎 Roblox 2020', value: 'Roblox 2020' },
        { name: '🍎 Roblox 2021', value: 'Roblox 2021' },
    ],
    'pekora-pc': [
        { name: '💻 Roblox 2017', value: 'Roblox 2017' },
        { name: '💻 Roblox 2018', value: 'Roblox 2018' },
        { name: '💻 Roblox 2020', value: 'Roblox 2020' },
        { name: '💻 Roblox 2021', value: 'Roblox 2021' },
    ],
};

const VNG_SUPPORTED = ['Delta', 'Codex', 'Skibx', 'Arceus X Neo', 'Trigon', 'Vega X', 'Ronix', 'Roblox'];

// دوال GitHub
async function readFromGitHub(githubToken) {
    try {
        const response = await axios.get(
            'https://api.github.com/repos/rtx261/RTX/contents/index.html',
            {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3.raw'
                }
            }
        );
        
        // إذا كانت النسخة المشفرة (base64)
        if (response.data && typeof response.data === 'string' && response.data.startsWith('{')) {
            return { content: response.data, sha: response.headers['x-github-media-type'] };
        }
        
        // اطلب مع المعلومات الإضافية
        const infoResponse = await axios.get(
            'https://api.github.com/repos/rtx261/RTX/contents/index.html',
            {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        const content = Buffer.from(infoResponse.data.content, 'base64').toString('utf-8');
        return { content, sha: infoResponse.data.sha };
    } catch (error) {
        console.error('❌ خطأ في قراءة GitHub:', error.message);
        throw error;
    }
}

async function saveToGitHub(content, sha, message, githubToken) {
    try {
        const encodedContent = Buffer.from(content).toString('base64');
        
        await axios.put(
            'https://api.github.com/repos/rtx261/RTX/contents/index.html',
            {
                message: message,
                content: encodedContent,
                sha: sha,
                branch: 'main'
            },
            {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        console.log('✅ تم حفظ التغييرات في GitHub');
    } catch (error) {
        console.error('❌ خطأ في حفظ GitHub:', error.message);
        throw error;
    }
}

// تحديث الروابط في HTML
function updateLinkInHTML(html, hackName, platform, newUrl, isVNG) {
    let updated = html;
    
    // البحث عن الهاك والمنصة وتحديث الرابط
    const vngLabel = isVNG ? ' (VNG)' : '';
    
    // محاولة عديدة للبحث والاستبدال
    const patterns = [
        new RegExp(`href="([^"]*)"[^>]*>${hackName}${vngLabel ? '.*?VNG' : ''}[^<]*</a>`, 'gi'),
        new RegExp(`href="([^"]*)"[^>]*>.*?${hackName}.*?</a>`, 'gi'),
    ];
    
    for (const pattern of patterns) {
        if (pattern.test(updated)) {
            updated = updated.replace(pattern, `href="${newUrl}">${hackName}${vngLabel}</a>`);
            return updated;
        }
    }
    
    // إذا ما لقى — أضيف الرابط في الأسفل (fallback)
    console.warn(`⚠️ ما لقيت الهاك ${hackName} في HTML، جاري الإضافة...`);
    return updated;
}

// تحديث حالة الهاك
function updateHackStatusInHTML(html, hackName, platform, status) {
    let updated = html;
    
    const statusMap = {
        'working': '<span class="status-badge working"><span class="status-text">يعمل</span><span class="status-icon">✓</span></span>',
        'not-working': '<span class="status-badge not-working"><span class="status-text">لا يعمل</span><span class="status-icon">✕</span></span>',
        'maybe': '<span class="status-badge maybe"><span class="status-text">قد يعمل</span><span class="status-icon">⚠</span></span>',
    };
    
    const newStatus = statusMap[status] || statusMap['maybe'];
    
    // ابحث عن section الهاك
    const hackPattern = new RegExp(
        `<h2>[^<]*${hackName}[^<]*</h2>.*?<div class="btn-wrapper">.*?<span class="status-badge[^>]*>.*?</span>`,
        'is'
    );
    
    updated = updated.replace(hackPattern, (match) => {
        return match.replace(/<span class="status-badge[^>]*>.*?<\/span>/, newStatus);
    });
    
    return updated;
}

module.exports = {
    HACK_CHOICES,
    VNG_SUPPORTED,
    readFromGitHub,
    saveToGitHub,
    updateLinkInHTML,
    updateHackStatusInHTML,
};
