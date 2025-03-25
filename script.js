function toggleMenu() {
    document.getElementById("menu").classList.toggle("active");
}

function showPage(pageId) {
    document.querySelectorAll(".page-content").forEach(page => {
        page.style.display = "none";
    });
    document.getElementById(pageId).style.display = "block";
    document.getElementById("menu").classList.remove("active");
}

async function searchScripts() {
    const searchInput = document.getElementById('scriptSearch').value;
    if (!searchInput) return;

    const resultsContainer = document.getElementById('scriptsResults');
    resultsContainer.innerHTML = '<div style="color: white; text-align: center;">جاري البحث...</div>';

    try {
        const response = await fetch(`/search-scripts?q=${encodeURIComponent(searchInput)}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.result && data.result.scripts && data.result.scripts.length > 0) {
            resultsContainer.innerHTML = data.result.scripts.map((script, index) => {
                const scriptDate = script.date ? new Date(script.date) : null;
                const formattedDate = scriptDate ? new Intl.DateTimeFormat('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }).format(scriptDate) : 'غير متوفر';

                return `
                    <div class="script-card">
                        <div class="script-title">${script.title || 'بدون عنوان'}</div>
                        <pre class="script-description" style="white-space: pre-wrap; direction: ltr; text-align: left; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 5px;">${(script.script || '').slice(0, 150)}...</pre>
                        <div style="color: #f1c40f; margin: 10px 0;">
                            <div style="background: rgba(0,0,0,0.2); padding: 5px; border-radius: 5px; margin: 5px 0;">
                                <i class="fas fa-calendar"></i> تاريخ آخر تحديث: ${formattedDate}
                            </div>
                            <div style="background: rgba(0,0,0,0.2); padding: 5px; border-radius: 5px; margin: 5px 0;">
                                <i class="fas fa-key"></i> يحتاج مفتاح: ${script.isUniversal ? 'لا' : 'نعم'}
                            </div>
                            <div style="background: rgba(0,0,0,0.2); padding: 5px; border-radius: 5px; margin: 5px 0;">
                                <i class="fas fa-star"></i> عدد التقييمات: ${script.features?.length || 0}
                            </div>
                        </div>
                        <button onclick="copyScript(${index})" class="copy-script-btn">
                            <i class="fas fa-copy"></i> نسخ السكربت
                        </button>
                    </div>
                `;
            }).join('');
            window.scriptResults = data.result.scripts;
        } else {
            resultsContainer.innerHTML = '<div style="color: white; text-align: center;">لم يتم العثور على نتائج</div>';
        }
    } catch (error) {
        console.error('Error:', error);
        resultsContainer.innerHTML = '<div style="color: white; text-align: center;">حدث خطأ في البحث. حاول مرة أخرى لاحقاً.</div>';
    }
}

function copyScript(index) {
    const script = window.scriptResults[index].script;
    navigator.clipboard.writeText(script).then(() => {
        alert('تم نسخ السكربت بنجاح!');
    }).catch(() => {
        alert('حدث خطأ أثناء نسخ السكربت');
    });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function() {
    showPage('home');

    // Prevent right-click
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Prevent copy/paste
    document.addEventListener('copy', e => {
        e.preventDefault();
        alert("منع النسخ مفعل");
    });

    document.addEventListener('cut', e => e.preventDefault());
    document.addEventListener('paste', e => e.preventDefault());
    document.addEventListener('dragstart', e => e.preventDefault());
    document.addEventListener('selectstart', e => e.preventDefault());

    // Prevent keyboard shortcuts
    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'a'].includes(e.key)) {
            e.preventDefault();
        }
    });
});
