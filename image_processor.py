import os
import random
import qrcode
from PIL import Image

DEFAULT_QR_SIZE = 170  # Размер QR-кода в пикселях
DEFAULT_QR_POSITION = (65, 980)  # Позиция (x, y) QR-кода на изображении
DEFAULT_OUTPUT_PATH = 'output.png'  # Путь для сохранения по умолчанию
ALLOWED_EXTENSIONS = ('.png', '.jpg', '.jpeg')  # Допустимые форматы изображений
QR_BOX_SIZE = 5  # Размер каждого "бокса" в QR-коде
QR_BORDER = 0  # Граница вокруг QR-кода
QR_FILL_COLOR = "black"  # Цвет QR-кода
QR_BACK_COLOR = "#FFE6C4"  # Фон QR-кода

class ImageProcessor:
    def __init__(self, img_folder='img'):
        self.img_folder = img_folder
    
    def get_random_image_path(self):
        """Получает путь к случайному изображению из папки"""
        images = [f for f in os.listdir(self.img_folder) 
                 if f.lower().endswith(ALLOWED_EXTENSIONS)]
        if not images:
            raise FileNotFoundError(f"No images found in {self.img_folder} folder. "
                                  f"Allowed extensions: {ALLOWED_EXTENSIONS}")
        return os.path.join(self.img_folder, random.choice(images))
    
    def generate_qr_code(self, data, qr_size=DEFAULT_QR_SIZE):
        """Генерирует QR-код с указанными данными"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=QR_BOX_SIZE,
            border=QR_BORDER,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color=QR_FILL_COLOR, back_color=QR_BACK_COLOR)
        img = img.resize((qr_size, qr_size))
        return img
    
    def add_qr_to_image(self, base_image_path, qr_data, 
                       output_path=DEFAULT_OUTPUT_PATH, 
                       qr_position=DEFAULT_QR_POSITION):
        """
        Добавляет QR-код на изображение по указанным координатам
        :param base_image_path: путь к базовому изображению
        :param qr_data: данные для QR-кода
        :param output_path: путь для сохранения результата
        :param qr_position: координаты (x, y) для размещения QR-кода
        :return: путь к сохраненному изображению
        """
        base_image = Image.open(base_image_path)
        qr_image = self.generate_qr_code(qr_data)
        
        base_image.paste(qr_image, qr_position)
        base_image.save(output_path)
        return output_path
    
    def process_and_save_image(self, qr_data, 
                              output_path=DEFAULT_OUTPUT_PATH, 
                              qr_position=DEFAULT_QR_POSITION):
        """Получает случайное изображение, добавляет QR-код и сохраняет"""
        random_image = self.get_random_image_path()
        return self.add_qr_to_image(
            random_image, 
            qr_data, 
            output_path, 
            qr_position
        )