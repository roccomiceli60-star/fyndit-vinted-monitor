import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {
    var webView: WKWebView!
    var activityIndicator: UIActivityIndicatorView!
    var errorContainer: UIView?
    
    // Live Cloud Server URL
    let appUrl = URL(string: "https://ais-pre-p34b77gf75pu5k3jidy6vb-523121525353.europe-west2.run.app")!

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 9/255.0, green: 9/255.0, blue: 11/255.0, alpha: 1.0)
        
        setupWebView()
        setupLoadingIndicator()
        loadApp()
    }

    private func setupWebView() {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
        let prefs = WKWebpagePreferences()
        prefs.allowsContentJavaScript = true
        configuration.defaultWebpagePreferences = prefs
        
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
        
        // Native pull-to-refresh
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

    private func loadApp() {
        errorContainer?.removeFromSuperview()
        errorContainer = nil
        activityIndicator.startAnimating()
        
        var request = URLRequest(url: appUrl, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 20.0)
        request.setValue("Fyndit-iOS/1.0", forHTTPHeaderField: "User-Agent")
        webView.load(request)
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
        errorContainer?.removeFromSuperview()
        errorContainer = nil
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        activityIndicator.stopAnimating()
        webView.scrollView.refreshControl?.endRefreshing()
        showErrorState(message: error.localizedDescription)
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        activityIndicator.stopAnimating()
        webView.scrollView.refreshControl?.endRefreshing()
        showErrorState(message: error.localizedDescription)
    }

    private func showErrorState(message: String) {
        guard errorContainer == nil else { return }
        
        let container = UIView(frame: view.bounds)
        container.backgroundColor = UIColor(red: 9/255.0, green: 9/255.0, blue: 11/255.0, alpha: 1.0)
        container.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        
        let stack = UIStackView()
        stack.axis = .vertical
        stack.alignment = .center
        stack.spacing = 16
        stack.translatesAutoresizingMaskIntoConstraints = false
        
        let logoLabel = UILabel()
        logoLabel.text = "Fyndit"
        logoLabel.textColor = UIColor(red: 6/255.0, green: 182/255.0, blue: 212/255.0, alpha: 1.0)
        logoLabel.font = UIFont.systemFont(ofSize: 32, weight: .black)
        
        let subtitleLabel = UILabel()
        subtitleLabel.text = "Vinted Deal Sniper"
        subtitleLabel.textColor = .white
        subtitleLabel.font = UIFont.systemFont(ofSize: 17, weight: .bold)
        
        let descLabel = UILabel()
        descLabel.text = "Verifica la connessione internet.\n\(message)"
        descLabel.textColor = UIColor(white: 0.65, alpha: 1.0)
        descLabel.textAlignment = .center
        descLabel.numberOfLines = 0
        descLabel.font = UIFont.systemFont(ofSize: 13)
        
        let retryBtn = UIButton(type: .system)
        retryBtn.setTitle("Riprova Connessione", for: .normal)
        retryBtn.setTitleColor(UIColor(red: 9/255.0, green: 9/255.0, blue: 11/255.0, alpha: 1.0), for: .normal)
        retryBtn.backgroundColor = UIColor(red: 6/255.0, green: 182/255.0, blue: 212/255.0, alpha: 1.0)
        retryBtn.layer.cornerRadius = 14
        retryBtn.contentEdgeInsets = UIEdgeInsets(top: 14, left: 32, bottom: 14, right: 32)
        retryBtn.titleLabel?.font = UIFont.systemFont(ofSize: 15, weight: .bold)
        retryBtn.addTarget(self, action: #selector(retryTapped), for: .touchUpInside)
        
        stack.addArrangedSubview(logoLabel)
        stack.addArrangedSubview(subtitleLabel)
        stack.addArrangedSubview(descLabel)
        stack.addArrangedSubview(retryBtn)
        
        container.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.centerXAnchor.constraint(equalTo: container.centerXAnchor),
            stack.centerYAnchor.constraint(equalTo: container.centerYAnchor),
            stack.leadingAnchor.constraint(greaterThanOrEqualTo: container.leadingAnchor, constant: 32),
            stack.trailingAnchor.constraint(lessThanOrEqualTo: container.trailingAnchor, constant: -32)
        ])
        
        view.addSubview(container)
        self.errorContainer = container
    }

    @objc private func retryTapped() {
        loadApp()
    }

    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }
}
