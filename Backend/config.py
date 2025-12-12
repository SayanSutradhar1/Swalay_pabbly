from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    WHATSAPP_ACCESS_TOKEN: str
    WHATSAPP_PHONE_NUMBER_ID: str
    WHATSAPP_WABA_ID: str
    WHATSAPP_API_VERSION: str = "v20.0"
    VERIFY_TOKEN: str
    FRONTEND_ORIGIN: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()
