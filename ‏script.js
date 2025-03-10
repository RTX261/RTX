// تفعيل وإغلاق قائمة التنقل
function toggleMenu() {
    document.getElementById("menu").classList.toggle("active");
}

// تبديل الصفحات عند الضغط على عنصر في القائمة
function showPage(pageId) {
    // إخفاء جميع الصفحات
    document.querySelectorAll(".page-content").forEach(page => {
        page.style.display = "none";
    });

    // إظهار الصفحة المطلوبة
    document.getElementById(pageId).style.display = "block";

    // إغلاق القائمة بعد اختيار الصفحة
    document.getElementById("menu").classList.remove("active");
}

// تشغيل صفحة روبلوكس افتراضيًا عند تحميل الموقع
document.addEventListener("DOMContentLoaded", function () {
    showPage('roblox');
});
