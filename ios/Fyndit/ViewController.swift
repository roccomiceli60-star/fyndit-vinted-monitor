import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {
    var webView: WKWebView!
    var activityIndicator: UIActivityIndicatorView!

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 9/255.0, green: 9/255.0, blue: 11/255.0, alpha: 1.0)
        
        setupWebView()
        setupLoadingIndicator()
        loadLocalApp()
    }

    private func setupWebView() {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
        // Register custom scheme handler to serve embedded web app with full CORS/ESModule support
        configuration.setURLSchemeHandler(AppSchemeHandler(), forURLScheme: "app")
        
        let prefs = WKWebpagePreferences()
        prefs.allowsContentJavaScript = true
        configuration.defaultWebpagePreferences = prefs
        
        configuration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        configuration.setValue(true, forKey: "allowUniversalAccessFromFileURLs")
        
        webView = WKWebView(frame: view.bounds, configuration: configuration)
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 9/255.0, green: 9/255.0, blue: 11/255.0, alpha: 1.0)
        webView.scrollView.backgroundColor = UIColor(red: 9/255.0, green: 9/255.0, blue: 11/255.0, alpha: 1.0)
        webView.scrollView.bounces = true
        
        if #available(iOS 16.4, *) {
            webView.isInspectable = true
        }
        
        let refreshControl = UIRefreshControl()
        refreshControl.tintColor = UIColor(red: 6/255.0, green: 182/255.0, blue: 212/255.0, alpha: 1.0)
        refreshControl.addTarget(self, action: #selector(handleRefresh), for: .valueChanged)
        webView.scrollView.refreshControl = refreshControl
        
        view.addSubview(webView)
    }

    private func setupLoadingIndicator() {
        activityIndicator = UIActivityIndicatorView(style: .large)
        activityIndicator.color = UIColor(red: 6/255.0, green: 182/255.0, blue: 212/255.0, alpha: 1.0)
        activityIndicator.translatesAutoresizingMaskIntoConstraints = false
        activityIndicator.hidesWhenStopped = true
        view.addSubview(activityIndicator)
        
        NSLayoutConstraint.activate([
            activityIndicator.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            activityIndicator.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }

    private func loadLocalApp() {
        activityIndicator.startAnimating()
        if let targetUrl = URL(string: "app://localhost/index.html") {
            webView.load(URLRequest(url: targetUrl))
        }
    }

    @objc private func handleRefresh() {
        webView.reload()
    }

    // MARK: - WKNavigationDelegate
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        activityIndicator.startAnimating()
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        activityIndicator.stopAnimating()
        webView.scrollView.refreshControl?.endRefreshing()
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        activityIndicator.stopAnimating()
        webView.scrollView.refreshControl?.endRefreshing()
        // If app:// failed, attempt direct file load fallback
        if let indexUrl = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") ?? Bundle.main.url(forResource: "index", withExtension: "html") {
            webView.loadFileURL(indexUrl, allowingReadAccessTo: Bundle.main.bundleURL)
        }
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        activityIndicator.stopAnimating()
        webView.scrollView.refreshControl?.endRefreshing()
    }

    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }
}
