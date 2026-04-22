from app import create_app

app = create_app()


if __name__ == "__main__":
    host = app.config["BACKEND_HOST"]
    port = app.config["BACKEND_PORT"]
    print(f"KhedMAP backend listening on http://{host}:{port}")
    app.run(debug=True, host=host, port=port)
