/**
 * نظام تحديث الروابط من البوت إلى GitHub مباشرة
 * - iPhone: للمالك فقط
 * - Android/PC/Pekora: للأدمن والموديريتورز
 */

const { REST, Routes, PermissionsBitField } = require('discord.js');

// ═══════════════════════════════════════════════════════════════
// نقطة البحث والتعديل في HTML
// ═══════════════════════════════════════════════════════════════

/**
 * تحديث رابط في الـ HTML
 * @param {string} html - محتوى الملف الأصلي
 * @param {string} hackName - اسم الهاك (delta, ronix, إلخ)
 * @param {string} platform - المنصة (iphone, android, pc, pekora-iphone, إلخ)
 * @param {string} newUrl - الرابط الجديد
 * @param {boolean} isVNG - نسخة VNG؟
 * @returns {string} محتوى HTML المعدل
 */
function updateLinkInHTML(html, hackName, platform, newUrl, isVNG = false) {
    if (!html || !hackName || !platform || !newUrl) {
        throw new Error('معاملات غير صحيحة');
    }

    const normalized = hackName.toLowerCase().trim();
    
    // patterns للبحث عن الروابط في HTML
    const patterns = {
        'iphone': {
            'delta': [
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/delta\.bz\/manifest\.plist(".*?Delta Install)/,
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/www\.installonair\.com\/storage\/ipaz\/x5eYMW\/x5eYMW\.plist(".*?Delta VNG Install)/
            ],
            'ronix': [
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/www\.installonair\.com\/storage\/ipaz\/KvQcmP\/KvQcmP\.plist(".*?Ronix Install)/,
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/www\.installonair\.com\/storage\/ipaz\/lgqV2v\/lgqV2v\.plist(".*?Ronix VNG Install)/
            ],
            'skibx': [
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/www\.installonair\.com\/storage\/ipaz\/pyzvF7\/pyzvF7\.plist(".*?Skibx Install)/,
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/www\.installonair\.com\/storage\/ipaz\/peM8yI\/peM8yI\.plist(".*?Skibx VNG Install)/
            ]
        },
        'android': {
            'delta': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/v6sogoz9kn9iduw\/Delta-2\.716\.875\.apk\/file(".*?Delta Install)/,
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/nopi33zoga9mfu1\/Delta-2\.711\.871-VN\.apk\/file(".*?Delta VNG Install)/
            ],
            'codex': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/4cadggxj7k5vktx\/Codex\+v2\.716\.apk\/file(".*?CODEX Install)/,
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/3py7clwl1zxm5oo\/Codex\+V2\.710\.707\.apk\/file(".*?CODEX VNG Install)/
            ],
            'arceus': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/nli72kkxnkrh4g7\/Roblox\.-\.Arceus\.X\.v5\.1\.4\.2\.apk\/file(".*?Arceus X Neo Install)/,
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/l8239o9vm625amg\/Roblox\.-\.VNG\.Arceus\.X\.v5\.1\.4\.2\.apk\/file(".*?Arceus X Neo VNG Install)/
            ],
            'ronix': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/cut0tioprp921tt\/Ronix_32Bits-2\.710\.707\.apk\/file(".*?Ronix Install)/,
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/cut0tioprp921tt\/Ronix_32Bits-2\.710\.707\.apk\/file(".*?Ronix VNG Install)/
            ],
            'skibx': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/khh1d18x0sbdfc6\/SkibX-2\.707\.734\.apk\/file(".*?Skibx Install)/,
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/khh1d18x0sbdfc6\/SkibX-2\.707\.734\.apk\/file(".*?Skibx VNG Install)/
            ],
            'cryptic': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/2cw9hn5kg5x1vk1\/Cryptic\.2\.689\.CrypticExecutor\.com\+\[rtxtop1\]\.apk\/file(".*?Cryptic Install)/,
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/2cw9hn5kg5x1vk1\/Cryptic\.2\.689\.CrypticExecutor\.com\+\[rtxtop1\]\.apk\/file(".*?Cryptic VNG Install)/
            ],
            'trigon': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/3b0k4ks6s1scwey\/Trigon_2\.716\.875\.apk\/file(".*?Trigon Install)/
            ],
            'vega': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/a1xkbytour4xksc\/Vega\.X\+8\.apk\/file(".*?Vega X Install)/
            ]
        },
        'pc': {
            'semo': [
                /(<a href=")https:\/\/www\.dropbox\.com\/scl\/fi\/ppuzmw1nqixti0t55r3y9\/Semo-Executor-v3\.50\.rar\?rlkey=nf99s3g8r9krjfcvwedxmgqwy&st=lt6s1bf9&dl=1(".*?Semo Install)/
            ],
            'velocity': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/f0egpgwh11qvtz5\/Velocity\.zip\/file(".*?Velocity Install)/
            ],
            'xeno': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/2ge30y7r9ufi9gt\/Xeno-v1\.3\.30\.zip\/file(".*?Xeno Install)/
            ],
            'ronix': [
                /(<a href=")https:\/\/wrdcdn\.net\/r\/154522\/1769203129478\/RonixInstaller_NEW\.exe(".*?Ronix Install)/
            ],
            'trigon': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/jwmwp9xhriyqkql\/Trigon_Evo_0\.2\.6\.exe\/file(".*?Trigon Install)/
            ]
        },
        'pekora-iphone': {
            '2017': [
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/www\.installonair\.com\/storage\/ipaz\/HwcaUw\/HwcaUw\.plist(".*?Roblox 2017 Install)/
            ],
            '2018': [
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/www\.installonair\.com\/storage\/ipaz\/phrr2u\/phrr2u\.plist(".*?Roblox 2018 Install)/
            ],
            '2020': [
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/www\.installonair\.com\/storage\/ipaz\/wnJK0j\/wnJK0j\.plist(".*?Roblox 2020 Install)/
            ],
            '2021': [
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/www\.installonair\.com\/storage\/ipaz\/McEPO8\/McEPO8\.plist(".*?Roblox 2021 Install)/
            ]
        },
        'pekora-android': {
            '2017-official': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/tzzl8frcvnem989\/Pekora2017L\.apk\/file(".*?Roblox 2017 Install \(رسمي\))/
            ],
            '2017-unofficial': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/ggz4eg6hnfx2sqq\/Korone_2017\.apk\/file(".*?Roblox 2017 Install \(غير رسمي\))/
            ],
            '2018': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/j713t6vbcx1fdbn\/Korone_2018\.apk\/file(".*?Roblox 2018 Install)/
            ],
            '2020': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/wvz6yi1144uu29i\/Korone_2020\.apk\/file(".*?Roblox 2020 Install)/
            ],
            '2021': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/bpu9bzv8a3hmfe1\/Korone_2021\.apk\/file(".*?Roblox 2021 Install)/
            ]
        },
        'pekora-pc': {
            '2017': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/kzadf87gvjyt6md\/PekoraStudio2017\+3\.zip\/file(".*?Roblox 2017 Install)/
            ],
            '2018': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/n4j9d8b33273dqg\/PekoraStudio2018\+2\.zip\/file(".*?Roblox 2018 Install)/
            ],
            '2020': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/dd71xq5h51198yj\/PekoraStudio2020\+2\.zip\/file(".*?Roblox 2020 Install)/
            ],
            '2021': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/4jcde8p3eo91f4t\/PekoraStudio2021\+2\.zip\/file(".*?Roblox 2021 Install)/
            ]
        }
    };

    const platformPatterns = patterns[platform];
    if (!platformPatterns || !platformPatterns[normalized]) {
        throw new Error(`الهاك "${hackName}" غير مدعوم للمنصة "${platform}"`);
    }

    let result = html;
    const regexList = platformPatterns[normalized];
    
    // تحديد أي نسخة (عادي أو VNG)
    const targetIdx = isVNG ? 1 : 0;
    if (regexList[targetIdx]) {
        result = result.replace(regexList[targetIdx], `$1${newUrl}$2`);
    }

    return result;
}

/**
 * حفظ الملف في GitHub
 */
async function saveToGitHub(filename, content, commitMessage, githubToken) {
    const octokit = new REST({ auth: githubToken });
    
    try {
        // احصل ع��ى SHA الملف الحالي
        const currentFile = await octokit.get(
            Routes.repos('RTX261', 'RTX', 'contents', filename)
        ).catch(() => null);
        
        const base64Content = Buffer.from(content, 'utf8').toString('base64');
        
        const updateData = {
            message: commitMessage || `تحديث ${filename}`,
            content: base64Content,
            branch: 'main'
        };
        
        if (currentFile?.data?.sha) {
            updateData.sha = currentFile.data.sha;
        }
        
        await octokit.put(
            Routes.repos('RTX261', 'RTX', 'contents', filename),
            updateData
        );
        
        return { success: true };
    } catch (error) {
        console.error('❌ خطأ في حفظ الملف في GitHub:', error);
        throw error;
    }
}

/**
 * قراءة الملف من GitHub
 */
async function readFromGitHub(filename, githubToken) {
    const octokit = new REST({ auth: githubToken });
    
    try {
        const file = await octokit.get(
            Routes.repos('RTX261', 'RTX', 'contents', filename)
        );
        
        const content = Buffer.from(file.data.content, 'base64').toString('utf8');
        return { success: true, content, sha: file.data.sha };
    } catch (error) {
        console.error('❌ خطأ في قراءة الملف من GitHub:', error);
        throw error;
    }
}

module.exports = {
    updateLinkInHTML,
    saveToGitHub,
    readFromGitHub
};
