import os
import random
import qrcode
import csv
import requests
import re
from PIL import Image
from io import BytesIO

DEFAULT_QR_SIZE = 170
DEFAULT_QR_POSITION = (65, 980)
DEFAULT_OUTPUT_PATH = 'output.png'
QR_BOX_SIZE = 5
QR_BORDER = 1
QR_FILL_COLOR = "black"
QR_BACK_COLOR = "white"

def convert_google_drive_link(url):
    """Преобразует ссылку Google Drive в прямую ссылку для скачивания"""
    # Регулярное выражение для извлечения ID файла
    pattern = r'https://drive\.google\.com/file/d/([a-zA-Z0-9_-]+)'
    match = re.search(pattern, url)
    
    if match:
        file_id = match.group(1)
        return f"https://drive.google.com/uc?export=download&id={file_id}"
    return url

class CSVImageProcessor:
    def __init__(self, csv_url):
        """
        :param csv_url: Публичная ссылка на CSV файл (из Google Sheets)
        """
        self.csv_url = csv_url
    
    def get_random_record(self):
        """Получает случайную запись из CSV"""
        try:
            response = requests.get(self.csv_url)
            response.encoding = 'utf-8'
            response.raise_for_status()
            
            # Читаем CSV данные
            csv_data = csv.DictReader(response.text.splitlines())
            records = list(csv_data)
            
            if not records:
                raise ValueError("В CSV нет данных (или только заголовок)")
                
            return random.choice(records)
        except Exception as e:
            raise Exception(f"Ошибка получения данных из CSV: {str(e)}")
    
    def download_image(self, image_url):
        """Скачивает изображение с обработкой Google Drive ссылок"""
        try:
            # Преобразуем ссылку Google Drive
            direct_url = convert_google_drive_link(image_url)
            
            # Для Google Drive нужны куки, поэтому используем сессию
            session = requests.Session()
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            # Первый запрос для получения подтверждающей страницы
            response = session.get(direct_url, headers=headers, stream=True, timeout=30)
            response.raise_for_status()
            
            # Если получили HTML (страница подтверждения)
            if 'text/html' in response.headers.get('Content-Type', ''):
                # Парсим страницу для получения подтверждающей ссылки
                confirm_match = re.search(r'confirm=([a-zA-Z0-9_-]+)', response.text)
                if confirm_match:
                    confirm_token = confirm_match.group(1)
                    download_url = f"{direct_url}&confirm={confirm_token}"
                    response = session.get(download_url, headers=headers, stream=True, timeout=30)
                    response.raise_for_status()
            
            # Проверяем, что получили изображение
            if 'image' not in response.headers.get('Content-Type', '').lower():
                raise ValueError("Ссылка не ведёт на изображение")
                
            return Image.open(BytesIO(response.content))
            
        except Exception as e:
            raise Exception(f"Ошибка загрузки изображения: {image_url} - {str(e)}")
    
    def generate_qr_code(self, data, qr_size=DEFAULT_QR_SIZE):
        """Генерирует QR-код"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=QR_BOX_SIZE,
            border=QR_BORDER,
        )
        qr.add_data(data)
        qr.make(fit=True)

        img = qr.make_image(fill_color=QR_FILL_COLOR, back_color=QR_BACK_COLOR)
        return img.resize((qr_size, qr_size))
    
    def process_and_save_image(self, qr_data, output_path=DEFAULT_OUTPUT_PATH):
        """Основной метод обработки"""
        try:
            record = self.get_random_record()
            
            # Проверяем обязательные поля
            required_fields = ['Ссылка на картинку', 'Координата X', 'Координата Y']
            for field in required_fields:
                if field not in record:
                    raise ValueError(f"Отсутствует обязательное поле: {field}")
            
            # Получаем параметры
            image_url = record['Ссылка на картинку']
            pos_x = int(record['Координата X'])
            pos_y = int(record['Координата Y'])
            qr_size = int(record.get('Размер QR', DEFAULT_QR_SIZE))
            
            # Загружаем изображение
            base_image = self.download_image(image_url)
            
            # Генерируем QR-код
            qr_image = self.generate_qr_code(qr_data, qr_size)
            
            # Накладываем QR-код
            base_image.paste(qr_image, (pos_x, pos_y))
            base_image.save(output_path)
            
            return output_path
            
        except Exception as e:
            # Добавляем больше информации об ошибке
            import traceback
            error_details = traceback.format_exc()
            raise Exception(f"Ошибка в process_and_save_image: {str(e)}\n\nДетали:\n{error_details}")
