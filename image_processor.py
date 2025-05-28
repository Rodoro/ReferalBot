import os
import random
import qrcode
import csv
import requests
from PIL import Image
from io import BytesIO

DEFAULT_QR_SIZE = 170
DEFAULT_QR_POSITION = (65, 980)
DEFAULT_OUTPUT_PATH = 'output.png'
QR_BOX_SIZE = 5
QR_BORDER = 0
QR_FILL_COLOR = "black"
QR_BACK_COLOR = "#FFE6C4"

def convert_yandex_link(url):
    """Преобразует ссылку на Яндекс.Диск в прямую загрузку"""
    if "disk.yandex.ru" in url:
        return f"https://getfile.dokpub.com/yandex/get/{url}"
    return url

class CSVImageProcessor:
    def __init__(self, csv_url):
        """
        :param csv_url: Публичная ссылка на CSV файл (из Google Sheets)
                        (Файл → Публикация в интернете → CSV)
        """
        self.csv_url = csv_url
    
    def get_random_record(self):
        """Получает случайную запись из CSV (исключая заголовок)"""
        response = requests.get(self.csv_url)
        response.encoding = 'utf-8'
        
        # Читаем CSV данные
        csv_data = csv.DictReader(response.text.splitlines())
        records = list(csv_data)
        
        if not records:
            raise ValueError("No records found in CSV (excluding header)")
            
        return random.choice(records)
    
    def download_image(self, image_url):
        """Скачивает изображение, автоматически обрабатывая Яндекс.Диск"""
        try:
            direct_url = convert_yandex_link(image_url)
            response = requests.get(direct_url, stream=True, timeout=10)
            response.raise_for_status()
            
            img = Image.open(BytesIO(response.content))
            return img
        except Exception as e:
            raise Exception(f"Ошибка загрузки {image_url}: {str(e)}")
    
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
        record = self.get_random_record()
        
        # Получаем параметры из записи
        image_url = record['Ссылка на картинку']  # Замените на имя вашего столбца
        pos_x = int(record['Координата X'])      # Замените на имя вашего столбца
        pos_y = int(record['Координата Y'])      # Замените на имя вашего столбца
        qr_size = int(record.get('Размер QR', DEFAULT_QR_SIZE))
        
        # Загружаем и обрабатываем изображение
        base_image = self.download_image(image_url)
        qr_image = self.generate_qr_code(qr_data, qr_size)
        
        # Накладываем QR-код
        base_image.paste(qr_image, (pos_x, pos_y))
        base_image.save(output_path)
        
        return output_path