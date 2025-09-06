from flask import Flask, jsonify, send_from_directory, request
from datetime import datetime, timedelta
from functools import lru_cache
from scraper import build_menu_json

app = Flask(__name__, static_folder="web", static_url_path="")

# Cache for ~15 minutes so you’re not hammering CampusDish while developing
@lru_cache(maxsize=16)
def cached_menu(cache_key: str):
    # cache_key lets you extend to include date later
    return build_menu_json()

@app.route("/api/menu")
def api_menu():
    # optional: accept ?nocache=1 during dev
    nocache = request.args.get("nocache") == "1"
    if nocache:
        return jsonify(build_menu_json())
    # naive daily cache key (change to include date if you add date support)
    key = datetime.now().strftime("today-%Y-%m-%d")
    return jsonify(cached_menu(key))

# Serve static frontend (web/index.html) from Flask
@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

# (optional) serve other static assets like /app.js, /styles.css, etc.
# Flask will handle those via static_url_path=""

if __name__ == "__main__":
    app.run(debug=True, port=5173)  # pick a port you like