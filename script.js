// تبديل القائمة عند الضغط على أيقونة الثلاثة خطوط
function toggleMenu() {
    document.getElementById("menu").classList.toggle("active");
}

// تغيير الصفحة عند اختيار أي قسم
function showPage(pageId) {
    // إخفاء جميع الصفحات
    document.querySelectorAll(".page-content").forEach(page => {
        page.style.display = "none";
    });

    // إظهار الصفحة المحددة
    document.getElementById(pageId).style.display = "block";

    // إغلاق القائمة بعد الاختيار
    document.getElementById("menu").classList.remove("active");
}

// تشغيل الصفحة الافتراضية عند تحميل الموقع
document.addEventListener("DOMContentLoaded", function () {
    showPage('roblox'); // صفحة روبلوكس هي الافتراضية
});

// منع نسخ الروابط في أزرار التحميل
document.querySelectorAll('.download-btn, .fortnite-btn').forEach(button => {
    button.addEventListener('mousedown', (event) => {
        event.preventDefault();
    });
    button.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });
});

// تحسين القائمة المنسدلة عند النقر خارجها
document.addEventListener('click', function (event) {
    let menu = document.getElementById("menu");
    let menuIcon = document.querySelector(".menu-icon");

    if (!menu.contains(event.target) && !menuIcon.contains(event.target)) {
        menu.classList.remove("active");
    }
});
