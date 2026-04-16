from flask import current_app
from pymongo import MongoClient


def init_extensions(app) -> None:
    app.extensions["mongo_client"] = MongoClient(
        app.config["MONGO_URI"],
        serverSelectionTimeoutMS=app.config["MONGO_TIMEOUT_MS"],
        uuidRepresentation="standard",
    )


def get_db():
    client = current_app.extensions["mongo_client"]
    return client[current_app.config["MONGO_DB_NAME"]]
