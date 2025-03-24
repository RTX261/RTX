
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
from urllib.parse import urlparse, parse_qs
import urllib.request
import ssl

class KeyServer(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path.startswith('/search-scripts'):
            query = parse_qs(parsed_path.query).get('q', [''])[0]
            try:
                # Create SSL context that doesn't verify certificates
                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE
                
                # تحويل النص العربي إلى إنجليزي إذا كان باللغة العربية
                arabic_to_english = {
                    'بلوكس فروت': 'blox fruits',
                    'ام ام تو': 'mm2',
                    'ميردر مستري': 'murder mystery',
                    'بيت سيم': 'pet simulator',
                    'ادبتت مي': 'adopt me',
                    'بروكن بون': 'broken bones',
                    'دورز': 'doors',
                    'بي اس اكس': 'psx',
                    'بلوكس فروتس': 'blox fruits',
                    'نينجا ليجندز': 'ninja legends',
                    'بي جي اس': 'bgs',
                    'بيست سويرم': 'beast swarm',
                    'كينج ليجاسي': 'king legacy',
                    'ارسنال': 'arsenal',
                    'بروجكت سلاير': 'project slayers',
                    'جيلبريك': 'jailbreak',
                    'ماب البيوت': 'brookhaven',
                    'بروك هيفن': 'brookhaven',
                    'بلوكس فروتس': 'blox fruits',
                    'روبلوكس': 'roblox',
                    'بيت سيمليتور': 'pet simulator x',
                    'ماب القتل': 'murder mystery 2',
                    'ماب الابطال': 'superhero tycoon',
                    'ماب المطاعم': 'restaurant tycoon',
                    'ماب السجن': 'jailbreak',
                    'ماب الزومبي': 'zombie attack'
                }
                
                # تحسين البحث باستخدام كلمات مفتاحية إضافية
                search_query = query.lower()
                for ar, en in arabic_to_english.items():
                    if ar in search_query:
                        search_query = en
                        break
                
                search_query = arabic_to_english.get(query.lower(), query)
                url = f'https://scriptblox.com/api/script/search?q={urllib.parse.quote(search_query)}&mode=free'
                req = urllib.request.Request(
                    url,
                    headers={
                        'User-Agent': 'Mozilla/5.0',
                        'Accept': 'application/json',
                        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
                        'Accept-Charset': 'UTF-8'
                    }
                )
                response = urllib.request.urlopen(req, context=ctx, timeout=15)
                data = response.read()
                
                # التحقق من البيانات المستلمة
                try:
                    json_data = json.loads(data)
                    if not json_data.get('result', {}).get('scripts'):
                        # إذا لم يتم العثور على نتائج، جرب البحث بدون تحويل اللغة
                        url = f'https://scriptblox.com/api/script/search?q={query}&mode=free'
                        req = urllib.request.Request(
                            url,
                            headers={
                                'User-Agent': 'Mozilla/5.0',
                                'Accept': 'application/json',
                                'Accept-Language': 'en-US,en;q=0.9'
                            }
                        )
                        response = urllib.request.urlopen(req, context=ctx, timeout=15)
                        data = response.read()
                
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(data)
                    return
                except json.JSONDecodeError:
                    print("Error decoding JSON from API")
                    raise
            except Exception as e:
                print(f"Error searching scripts: {str(e)}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                return
                
        return super().do_GET()

httpd = HTTPServer(('0.0.0.0', 8000), KeyServer)
print("Server running on port 8000")
httpd.serve_forever()
