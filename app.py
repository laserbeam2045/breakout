import http.server
import socketserver

# ポート番号を設定
PORT = 3000

# ハンドラーを設定
Handler = http.server.SimpleHTTPRequestHandler

# サーバーを作成（ホストのIPアドレスを指定）
with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"Serving at port {PORT} on all available interfaces")
    # サーバーを起動
    httpd.serve_forever()