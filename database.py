import psycopg2
from psycopg2 import sql

class Database:
    def __init__(self):
        self.connection = psycopg2.connect(
            database='bot',
            user='root',
            password='123456',
            host='localhost',
            port='5433'
        )
        self.cursor = self.connection.cursor()
        self._create_tables()

    def _create_tables(self):
        """Создаёт таблицы если они не существуют"""
        with self.connection:
            # Таблица агентов
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS agents (
                    id SERIAL PRIMARY KEY,
                    user_id BIGINT UNIQUE NOT NULL,
                    full_name TEXT NOT NULL,
                    city TEXT NOT NULL,
                    inn TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    business_type TEXT NOT NULL,
                    bank_details TEXT NOT NULL,
                    approved BOOLEAN DEFAULT FALSE,
                    contract_signed BOOLEAN DEFAULT FALSE,
                    referral_code TEXT UNIQUE,
                    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Таблица точек продаж
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS sales_points (
                    id SERIAL PRIMARY KEY,
                    user_id BIGINT UNIQUE NOT NULL,
                    agent_id BIGINT NOT NULL REFERENCES agents(user_id),
                    full_name TEXT NOT NULL,
                    city TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    approved BOOLEAN DEFAULT FALSE,
                    contract_signed BOOLEAN DEFAULT FALSE,
                    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            self.connection.commit()
        
    def add_agent(self, data):
        """Добавляет агента в базу данных"""
        with self.connection:
            query = """
                INSERT INTO agents 
                (user_id, full_name, city, inn, phone, business_type, bank_details, approved, referral_code) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (user_id) DO NOTHING
            """
            self.cursor.execute(query, data)
            self.connection.commit()

    def approve_agent(self, user_id):
        """Подтверждает агента"""
        with self.connection:
            query = "UPDATE agents SET approved = TRUE WHERE user_id = %s"
            self.cursor.execute(query, (user_id,))
            self.connection.commit()
            
    def check_agent(self, user_id):
        """Проверяет существует ли агент в базе"""
        with self.connection:
            self.cursor.execute("SELECT * FROM agents WHERE user_id = %s AND approved = TRUE", (user_id,))
            return bool(self.cursor.fetchall())
        
    def sign_contract(self, user_id, is_agent=True):
        """Отмечает договор как подписанный"""
        with self.connection:
            table = "agents" if is_agent else "sales_points"
            query = f"UPDATE {table} SET contract_signed = TRUE, approved = TRUE WHERE user_id = %s"
            self.cursor.execute(query, (user_id,))
            self.connection.commit()
            
    def generate_referral_code(self, user_id):
        """Генерирует и сохраняет реферальный код для агента"""
        import secrets
        referral_code = secrets.token_hex(4).upper()  # 8-символьный код
        
        with self.connection:
            query = "UPDATE agents SET referral_code = %s WHERE user_id = %s RETURNING referral_code"
            self.cursor.execute(query, (referral_code, user_id))
            result = self.cursor.fetchone()
            self.connection.commit()
            return result[0] if result else None
            
    def get_agent_by_referral(self, referral_code):
        """Находит агента по реферальному коду"""
        with self.connection:
            self.cursor.execute("SELECT user_id FROM agents WHERE referral_code = %s", (referral_code,))
            result = self.cursor.fetchone()
            return result[0] if result else None
            
    def add_sales_point(self, data):
        """Добавляет точку продаж"""
        with self.connection:
            query = """
                INSERT INTO sales_points 
                (user_id, agent_id, full_name, city, phone, approved) 
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (user_id) DO NOTHING
            """
            self.cursor.execute(query, data)
            self.connection.commit()
            
    def check_sales_point(self, user_id):
        """Проверяет существует ли точка продаж в базе"""
        with self.connection:
            self.cursor.execute("SELECT * FROM sales_points WHERE user_id = %s AND approved = TRUE", (user_id,))
            return bool(self.cursor.fetchall())
    
    def is_user_agent(self, user_id):
        """Определяет, является ли пользователь агентом или точкой продаж"""
        with self.connection:
            self.cursor.execute("SELECT 1 FROM agents WHERE user_id = %s", (user_id,))
            if self.cursor.fetchone():
                return True
            self.cursor.execute("SELECT 1 FROM sales_points WHERE user_id = %s", (user_id,))
            if self.cursor.fetchone():
                return False
            return None
    def approve_sales_point(self, user_id):
        with self.connection:
            query = "UPDATE sales_points SET approved = TRUE WHERE user_id = %s"
            self.cursor.execute(query, (user_id,))
            self.connection.commit()