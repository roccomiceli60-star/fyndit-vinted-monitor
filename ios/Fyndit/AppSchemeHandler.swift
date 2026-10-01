import UIKit
import WebKit

class AppSchemeHandler: NSObject, WKURLSchemeHandler {
    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let url = urlSchemeTask.request.url else {
            urlSchemeTask.didFailWithError(NSError(domain: "AppScheme", code: 400, userInfo: nil))
            return
        }

        var path = url.path
        if path.isEmpty || path == "/" {
            path = "/index.html"
        }

        // Mock API responses for standalone iOS app
        if path.hasPrefix("/api/vinted/live") || path.hasPrefix("/api/vinted/search") {
            let json = """
            {"status":"ok","count":0,"items":[]}
            """
            let data = json.data(using: .utf8)!
            let res = HTTPURLResponse(url: url, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: [
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            ])!
            urlSchemeTask.didReceive(res)
            urlSchemeTask.didReceive(data)
            urlSchemeTask.didFinish()
            return
        }
        
        let filename = String(path.dropFirst())
        let fileManager = FileManager.default
        let bundleUrl = Bundle.main.bundleURL
        let wwwDir = bundleUrl.appendingPathComponent("www")
        
        var targetFile: URL?
        let inRoot = bundleUrl.appendingPathComponent(filename)
        let inWww = wwwDir.appendingPathComponent(filename)
        
        if fileManager.fileExists(atPath: inRoot.path) {
            targetFile = inRoot
        } else if fileManager.fileExists(atPath: inWww.path) {
            targetFile = inWww
        } else if let resourcePath = Bundle.main.path(forResource: filename, ofType: nil) {
            targetFile = URL(fileURLWithPath: resourcePath)
        } else {
            // SPA fallback: return index.html
            let indexInRoot = bundleUrl.appendingPathComponent("index.html")
            let indexInWww = wwwDir.appendingPathComponent("index.html")
            if fileManager.fileExists(atPath: indexInRoot.path) {
                targetFile = indexInRoot
            } else if fileManager.fileExists(atPath: indexInWww.path) {
                targetFile = indexInWww
            }
        }

        guard let finalUrl = targetFile, let data = try? Data(contentsOf: finalUrl) else {
            let res = HTTPURLResponse(url: url, statusCode: 404, httpVersion: "HTTP/1.1", headerFields: nil)!
            urlSchemeTask.didReceive(res)
            urlSchemeTask.didFinish()
            return
        }

        let mimeType: String
        switch finalUrl.pathExtension.lowercased() {
        case "html": mimeType = "text/html; charset=utf-8"
        case "js", "mjs": mimeType = "application/javascript; charset=utf-8"
        case "css": mimeType = "text/css; charset=utf-8"
        case "json": mimeType = "application/json"
        case "png": mimeType = "image/png"
        case "jpg", "jpeg": mimeType = "image/jpeg"
        case "svg": mimeType = "image/svg+xml"
        case "webp": mimeType = "image/webp"
        case "woff2": mimeType = "font/woff2"
        case "woff": mimeType = "font/woff"
        default: mimeType = "application/octet-stream"
        }

        let headers = [
            "Content-Type": mimeType,
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache"
        ]
        let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: headers)!
        urlSchemeTask.didReceive(response)
        urlSchemeTask.didReceive(data)
        urlSchemeTask.didFinish()
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}
}
