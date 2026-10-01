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

        let fileManager = FileManager.default
        let bundleUrl = Bundle.main.bundleURL
        let wwwDir = bundleUrl.appendingPathComponent("www")

        // Handle Live Vinted API endpoints on iPhone
        if path.hasPrefix("/api/vinted/live") || path.hasPrefix("/api/vinted/search") {
            var itemsFileUrl: URL?
            let candidates = [
                bundleUrl.appendingPathComponent("curatedRealItems.json"),
                wwwDir.appendingPathComponent("curatedRealItems.json"),
                Bundle.main.url(forResource: "curatedRealItems", withExtension: "json")
            ]
            for c in candidates {
                if let u = c, fileManager.fileExists(atPath: u.path) {
                    itemsFileUrl = u
                    break
                }
            }

            var matchingItems: [[String: Any]] = []

            if let fUrl = itemsFileUrl,
               let rawData = try? Data(contentsOf: fUrl),
               let jsonArray = (try? JSONSerialization.jsonObject(with: rawData, options: [])) as? [[String: Any]] {
                
                let queryItems = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems ?? []
                let search = queryItems.first(where: { $0.name == "search" })?.value?.lowercased().trimmingCharacters(in: .whitespaces) ?? ""
                let brand = queryItems.first(where: { $0.name == "brand" })?.value?.lowercased().trimmingCharacters(in: .whitespaces) ?? ""

                if search.isEmpty && (brand.isEmpty || brand == "tutti") {
                    matchingItems = jsonArray
                } else {
                    matchingItems = jsonArray.filter { item in
                        let title = (item["title"] as? String)?.lowercased() ?? ""
                        let itemBrand = (item["brand"] as? String)?.lowercased() ?? ""
                        let cat = (item["category"] as? String)?.lowercased() ?? ""

                        let matchesSearch = search.isEmpty || title.contains(search) || itemBrand.contains(search) || cat.contains(search)
                        let matchesBrand = brand.isEmpty || brand == "tutti" || itemBrand.contains(brand) || title.contains(brand)

                        return matchesSearch && matchesBrand
                    }
                    // If filter returned 0, return all items so user never sees a blank screen
                    if matchingItems.isEmpty {
                        matchingItems = jsonArray
                    }
                }
            }

            let responsePayload: [String: Any] = [
                "success": true,
                "total": matchingItems.count,
                "items": matchingItems,
                "source": "vinted_native_catalog"
            ]

            let responseData = (try? JSONSerialization.data(withJSONObject: responsePayload, options: [])) ?? Data()
            let res = HTTPURLResponse(url: url, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: [
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache"
            ])!
            urlSchemeTask.didReceive(res)
            urlSchemeTask.didReceive(responseData)
            urlSchemeTask.didFinish()
            return
        }
        
        let filename = String(path.dropFirst())
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
