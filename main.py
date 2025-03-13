
import base64
import os
import sys

def convert_image_to_base64(image_path):
    try:
        # التحقق من وجود الملف
        if not os.path.exists(image_path):
            print(f"❌ الملف غير موجود في المسار: {image_path}")
            return None
            
        print(f"✅ تم العثور على الملف في المسار: {image_path}")
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read())
            base64_data = encoded_string.decode('utf-8')
            # التأكد من أن البيانات متوافقة مع تنسيق XML
            # إضافة فواصل سطر كل 76 حرفًا لتحسين التوافق
            lines = [base64_data[i:i+76] for i in range(0, len(base64_data), 76)]
            formatted_base64 = '\n'.join(lines)
            return formatted_base64
    except Exception as e:
        print(f"❌ حدث خطأ في تحويل الصورة: {e}")
        return None

def create_mobileconfig(image_base64, output_file="RTX.mobileconfig"):
    """إنشاء ملف mobileconfig مع الصورة المشفرة"""
    mobileconfig_template = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>Icon</key>
            <data>
            {icon_data}
            </data>
            <key>Label</key>
            <string>hacker RTX</string>
            <key>PayloadDisplayName</key>
            <string>hacker RTX</string>
            <key>PayloadIdentifier</key>
            <string>com.rtx.ios</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>12345678-ABCD-1234-ABCD-123456789ABC</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>https://rtx261.github.io/RTX/</string>
            <key>IsRemovable</key>
            <true/>
        </dict>
    </array>
    <key>PayloadDisplayName</key>
    <string>RTX Web App</string>
    <key>PayloadIdentifier</key>
    <string>com.rtx.mobileconfig</string>
    <key>PayloadOrganization</key>
    <string>RTX</string>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>87654321-DCBA-4321-DCBA-987654321ABC</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>
""".format(icon_data=image_base64)
    
    with open(output_file, "w") as f:
        f.write(mobileconfig_template)
    print(f"✅ تم إنشاء ملف {output_file} بنجاح!")

if __name__ == "__main__":
    print("🔄 أداة تحويل الصور إلى تنسيق Base64")
    print("📝 يمكنك استخدام هذا الكود لتحويل الصور، ثم إنشاء ملف RTX.mobileconfig")
    print("----------------------------------------------------------")
    
    # تعريف المسارات المحتملة للصورة
    possible_paths = [
        "attached_assets/IMG_9537.jpeg",
        "./attached_assets/IMG_9537.jpeg",
        "IMG_9537.jpeg",
        "attached_assets/IMG_9464.png",
        "./attached_assets/IMG_9464.png",
        "IMG_9464.png"
    ]
    
    # محاولة تحويل الصورة من خلال المسارات المختلفة
    image_base64 = None
    for path in possible_paths:
        print(f"🔍 محاولة تحويل الصورة من المسار: {path}")
        result = convert_image_to_base64(path)
        if result:
            image_base64 = result
            print(f"✅ تم تحويل الصورة بنجاح من المسار: {path}")
            # طباعة جزء من التشفير للتأكد من نجاح العملية
            print(f"مثال من التشفير (أول 50 حرف): {image_base64[:50]}...")
            break
    
    if image_base64:
        print("\n✅ تم تحويل الصورة بنجاح إلى base64")
        try:
            create_mobileconfig(image_base64)
            print("\n✅ تم إنشاء ملف RTX.mobileconfig بنجاح مع الصورة الجديدة")
            print("يمكنك الآن استخدام هذا الملف لتثبيت الموقع على جهازك")
        except Exception as e:
            print(f"\n❌ حدث خطأ أثناء إنشاء ملف mobileconfig: {e}")
            print("يمكنك استخدام تشفير الصورة يدويًا في ملف RTX.mobileconfig")
    else:
        print("\n❌ فشلت جميع محاولات تحويل الصورة")
        print("تأكد من وجود الصورة في المجلد المناسب")
        print("يمكنك تحميل الصورة مباشرة ووضعها في مجلد attached_assets")
